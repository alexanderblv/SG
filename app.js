import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { seismicNetwork, privyConfig, PRIVY_APP_ID } from './seismic-config.js';
import { seismicSDK } from './seismic-sdk.js';
import './style.css';

// Компонент информации о пользователе
const UserInfo = ({ user, balance, networkInfo }) => (
  <div className="card fade-in">
    <h3 className="text-center mb-3">👤 Информация о пользователе</h3>
    <div className="info-grid">
      <div className="info-item">
        <div className="info-label">Email</div>
        <div className="info-value">{user?.email?.address || 'Не указан'}</div>
      </div>
      <div className="info-item">
        <div className="info-label">Wallet Address</div>
        <div className="info-value">
          {user?.wallet?.address ? 
            `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 
            'Не подключен'
          }
        </div>
      </div>
      <div className="info-item">
        <div className="info-label">Баланс</div>
        <div className="info-value">{balance} SETH</div>
      </div>
      <div className="info-item">
        <div className="info-label">Сеть</div>
        <div className="info-value status-connected">{networkInfo?.name || 'Seismic Devnet'}</div>
      </div>
    </div>
  </div>
);

// Компонент игровых действий
const GameActions = ({ onSendTransaction, onSendEncrypted, loading }) => (
  <div className="card fade-in">
    <h3 className="text-center mb-3">🎮 Игровые действия</h3>
    <div className="d-grid gap-2">
      <button 
        className="btn btn-primary" 
        onClick={() => onSendTransaction('0x742d35Cc6635C0532925a3b8D3Ac27FAACE6547', '0.001')}
        disabled={loading}
      >
        {loading ? <span className="loading"></span> : '💸'} Отправить тестовую транзакцию
      </button>
      <button 
        className="btn btn-secondary" 
        onClick={() => onSendEncrypted({ value: 100, recipient: '0x742d35Cc6635C0532925a3b8D3Ac27FAACE6547' }, 'suint')}
        disabled={loading}
      >
        {loading ? <span className="loading"></span> : '🔐'} Отправить зашифрованные данные
      </button>
      <button className="btn btn-secondary" disabled>
        🏆 Начать игру (скоро)
      </button>
      <button className="btn btn-secondary" disabled>
        📊 Статистика (скоро)
      </button>
    </div>
  </div>
);

// Компонент информации о сети
const NetworkInfo = ({ networkInfo }) => (
  <div className="card fade-in">
    <h3 className="text-center mb-3">🌐 Информация о сети</h3>
    <div className="info-grid">
      <div className="info-item">
        <div className="info-label">Chain ID</div>
        <div className="info-value">{networkInfo?.chainId || '5124'}</div>
      </div>
      <div className="info-item">
        <div className="info-label">Последний блок</div>
        <div className="info-value">{networkInfo?.blockNumber || 'Загрузка...'}</div>
      </div>
      <div className="info-item">
        <div className="info-label">Gas Price</div>
        <div className="info-value">{networkInfo?.gasPrice || '0'} Gwei</div>
      </div>
      <div className="info-item">
        <div className="info-label">RPC</div>
        <div className="info-value">Seismic Node</div>
      </div>
    </div>
    <div className="text-center mt-3">
      <a href="https://faucet-2.seismicdev.net/" target="_blank" rel="noopener noreferrer" className="btn btn-primary me-2">
        🚰 Получить тестовые токены
      </a>
      <a href="https://explorer-2.seismicdev.net/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
        🔍 Открыть Explorer
      </a>
    </div>
  </div>
);

// Компонент истории транзакций
const TransactionHistory = ({ transactions }) => {
  if (transactions.length === 0) return null;
  
  return (
    <div className="card fade-in">
      <h3 className="text-center mb-3">📋 Последние транзакции</h3>
      <div className="list-group list-group-flush">
        {transactions.slice(0, 5).map((tx, index) => (
          <div key={index} className="list-group-item">
            <div className="d-flex justify-content-between">
              <span>
                {tx.type === 'encrypted' ? '🔐' : '💸'} 
                {tx.hash.slice(0, 10)}...
              </span>
              <span className="status-connected">{tx.status}</span>
            </div>
            <small className="text-muted">{tx.timestamp}</small>
          </div>
        ))}
      </div>
      <div className="text-center mt-3">
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => seismicSDK.clearHistory()}
        >
          🗑️ Очистить историю
        </button>
      </div>
    </div>
  );
};

// Основной компонент приложения
const SeismicGameApp = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState('0.0');
  const [networkInfo, setNetworkInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  // Инициализация приложения
  useEffect(() => {
    if (ready && authenticated && wallets.length > 0) {
      initializeApp();
    }
  }, [ready, authenticated, wallets]);

  // Загрузка истории транзакций при запуске
  useEffect(() => {
    seismicSDK.loadHistory();
    setTransactions(seismicSDK.getHistory());
  }, []);

  const initializeApp = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Инициализируем SDK с провайдером кошелька
      const walletProvider = await wallets[0]?.getEthersProvider();
      await seismicSDK.init(walletProvider);
      
      // Получаем информацию о балансе
      if (user?.wallet?.address) {
        await updateBalance(user.wallet.address);
      }
      
      // Получаем информацию о сети
      await updateNetworkInfo();
      
    } catch (error) {
      console.error('Ошибка инициализации:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user, wallets]);

  const updateBalance = async (address) => {
    try {
      const balance = await seismicSDK.getBalance(address);
      setBalance(parseFloat(balance).toFixed(4));
    } catch (error) {
      console.error('Ошибка получения баланса:', error);
      setBalance('0.0');
    }
  };

  const updateNetworkInfo = async () => {
    try {
      const info = await seismicSDK.getNetworkInfo();
      setNetworkInfo(info);
    } catch (error) {
      console.error('Ошибка получения информации о сети:', error);
    }
  };

  const handleSendTransaction = async (to, amount) => {
    try {
      setLoading(true);
      setError(null);
      
      const txHash = await seismicSDK.sendTransaction(to, amount);
      
      const newTransaction = {
        hash: txHash,
        to,
        amount,
        type: 'regular',
        status: 'pending',
        timestamp: new Date().toLocaleString()
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Обновляем баланс после транзакции
      if (user?.wallet?.address) {
        setTimeout(() => updateBalance(user.wallet.address), 2000);
      }
      
    } catch (error) {
      console.error('Ошибка отправки транзакции:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEncrypted = async (data, type) => {
    try {
      setLoading(true);
      setError(null);
      
      const txHash = await seismicSDK.sendEncryptedData(data, type);
      
      const newTransaction = {
        hash: txHash,
        data,
        type: 'encrypted',
        status: 'pending',
        timestamp: new Date().toLocaleString()
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
    } catch (error) {
      console.error('Ошибка отправки зашифрованных данных:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Если Privy еще не готов
  if (!ready) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <h5>Инициализация Privy...</h5>
        </div>
      </div>
    );
  }

  // Если пользователь не аутентифицирован
  if (!authenticated) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="card auth-card">
          <div className="card-body text-center">
            <div className="logo-section mb-4">
              <div className="logo">🌊</div>
              <h2 className="app-title">Seismic Game</h2>
              <p className="text-muted">Подключите кошелек для начала игры</p>
            </div>
            
            <button 
              className="btn btn-primary btn-lg connect-wallet-btn"
              onClick={login}
            >
              🔗 Подключить кошелек
            </button>
            
            <div className="footer-info mt-4">
              <small className="text-muted">
                Поддерживается MetaMask, Coinbase Wallet, WalletConnect и встроенные кошельки
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Основной интерфейс для аутентифицированного пользователя
  return (
    <div className="container py-4">
      {/* Заголовок */}
      <div className="header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h3 mb-1">🌊 Seismic Game</h1>
            <p className="text-muted">Блокчейн-приложение на Seismic Devnet</p>
          </div>
          <button 
            className="btn btn-outline-secondary"
            onClick={logout}
          >
            🚪 Выйти
          </button>
        </div>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Ошибка:</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Основная сетка */}
      <div className="row g-4">
        <div className="col-lg-6">
          <UserInfo user={user} balance={balance} networkInfo={networkInfo} />
        </div>
        <div className="col-lg-6">
          <GameActions 
            onSendTransaction={handleSendTransaction}
            onSendEncrypted={handleSendEncrypted}
            loading={loading}
          />
        </div>
        <div className="col-lg-6">
          <NetworkInfo networkInfo={networkInfo} />
        </div>
        <div className="col-lg-6">
          <TransactionHistory transactions={transactions} />
        </div>
      </div>
    </div>
  );
};

// Главный компонент приложения с Privy Provider
const App = () => (
  <PrivyProvider
    appId={PRIVY_APP_ID}
    config={privyConfig}
  >
    <SeismicGameApp />
  </PrivyProvider>
);

// Монтирование приложения
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />); 