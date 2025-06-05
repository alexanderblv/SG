import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { seismicNetwork, privyConfig } from './seismic-config.js';
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
      const walletProvider = wallets[0]?.getEthersProvider();
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

  const handleSendTransaction = async (to, value) => {
    if (!seismicSDK.isWalletConnected()) {
      alert('Кошелек не подключен');
      return;
    }

    try {
      setLoading(true);
      
      const transaction = await seismicSDK.sendTransaction({ to, value });
      
      alert(`Транзакция отправлена!\nHash: ${transaction.hash}`);
      
      // Обновляем историю
      setTransactions(seismicSDK.getHistory());
      
      // Обновляем баланс
      if (user?.wallet?.address) {
        setTimeout(() => updateBalance(user.wallet.address), 2000);
      }
      
    } catch (error) {
      console.error('Ошибка отправки транзакции:', error);
      alert('Ошибка отправки транзакции: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEncrypted = async (data, type) => {
    if (!seismicSDK.isWalletConnected()) {
      alert('Кошелек не подключен');
      return;
    }

    try {
      setLoading(true);
      
      const transaction = await seismicSDK.sendEncryptedTransaction({
        to: '0x742d35Cc6635C0532925a3b8D3Ac27FAACE6547',
        encryptedData: data,
        type
      });
      
      alert(`Зашифрованная транзакция отправлена!\nType: ${type}\nHash: ${transaction.hash}`);
      
      // Обновляем историю
      setTransactions(seismicSDK.getHistory());
      
    } catch (error) {
      console.error('Ошибка отправки зашифрованной транзакции:', error);
      alert('Ошибка отправки: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="app-container">
        <div className="main-content">
          <div className="card text-center">
            <div className="loading" style={{margin: '0 auto'}}></div>
            <p className="mt-2">Загрузка Seismic Game...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Хедер */}
      <header className="header">
        <div className="header-content">
          <a href="#" className="logo">Seismic Game</a>
          <div>
            {authenticated ? (
              <button className="btn btn-danger" onClick={logout}>
                🚪 Выйти
              </button>
            ) : (
              <button className="btn btn-primary" onClick={login}>
                🔗 Войти
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="main-content">
        {error && (
          <div className="card" style={{backgroundColor: '#fee', borderColor: '#fcc'}}>
            <h4>❌ Ошибка</h4>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => setError(null)}>
              Попробовать снова
            </button>
          </div>
        )}

        {!authenticated ? (
          // Экран для неавторизованных пользователей
          <div className="card text-center">
            <h1>🌊 Добро пожаловать в Seismic Game</h1>
            <p className="mb-3">
              Современное блокчейн-приложение с поддержкой зашифрованных транзакций
              и интеграцией с Seismic Devnet.
            </p>
            <button className="btn btn-primary btn-lg" onClick={login}>
              🚀 Подключить кошелек и начать
            </button>
            <div className="mt-3">
              <small>Поддерживается вход через email или Web3 кошелек</small>
            </div>
          </div>
        ) : (
          // Основной интерфейс для авторизованных пользователей
          <>
            <UserInfo user={user} balance={balance} networkInfo={networkInfo} />
            <GameActions 
              onSendTransaction={handleSendTransaction}
              onSendEncrypted={handleSendEncrypted}
              loading={loading}
            />
            <TransactionHistory transactions={transactions} />
            <NetworkInfo networkInfo={networkInfo} />
          </>
        )}
      </main>

      {/* Футер */}
      <footer className="footer">
        <p>&copy; 2024 Seismic Game. Powered by Privy Auth SDK & Seismic Devnet</p>
      </footer>
    </div>
  );
};

// Корневой компонент с Privy Provider
const App = () => (
  <PrivyProvider
    appId={privyConfig.appId}
    config={privyConfig.config}
  >
    <SeismicGameApp />
  </PrivyProvider>
);

// Рендер приложения
ReactDOM.render(<App />, document.getElementById('root')); 