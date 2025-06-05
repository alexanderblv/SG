import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import Head from 'next/head';

export default function Home() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState('0.0');
  const [transactions, setTransactions] = useState([]);
  const [provider, setProvider] = useState(null);
  
  // Форма для отправки транзакций
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [enableEncryption, setEnableEncryption] = useState(false);

  // Инициализация провайдера кошелька
  useEffect(() => {
    if (authenticated && wallets.length > 0) {
      const initializeWallet = async () => {
        try {
          const ethereumProvider = await wallets[0].getEthereumProvider();
          const ethersProvider = new ethers.BrowserProvider(ethereumProvider);
          setProvider(ethersProvider);
          
          if (user?.wallet?.address) {
            updateBalance(user.wallet.address, ethersProvider);
          }
        } catch (error) {
          console.error('Error initializing wallet:', error);
        }
      };
      
      initializeWallet();
    }
  }, [authenticated, wallets, user]);

  const updateBalance = async (address, walletProvider) => {
    try {
      const ethersProvider = walletProvider || provider;
      if (ethersProvider) {
        const balance = await ethersProvider.getBalance(address);
        const balanceInEth = ethers.formatEther(balance);
        setBalance(parseFloat(balanceInEth).toFixed(4));
      }
    } catch (error) {
      console.error('Error getting balance:', error);
      setBalance('0.0');
    }
  };

  const handleSendTransaction = async () => {
    if (!provider || !recipientAddress || !amount) {
      alert('Please fill in all fields and connect wallet');
      return;
    }

    try {
      setLoading(true);
      
      const signer = await provider.getSigner();
      const transaction = {
        to: recipientAddress,
        value: ethers.parseEther(amount)
      };

      const txResponse = await signer.sendTransaction(transaction);
      
      const newTx = {
        hash: txResponse.hash,
        to: recipientAddress,
        value: amount,
        timestamp: new Date().toLocaleString(),
        status: 'pending',
        encrypted: enableEncryption
      };
      
      setTransactions(prev => [newTx, ...prev]);
      
      alert(`Transaction sent successfully!\nHash: ${txResponse.hash}`);
      
      // Очистить форму
      setRecipientAddress('');
      setAmount('');
      setEnableEncryption(false);
      
      // Ждем подтверждения
      txResponse.wait().then(() => {
        setTransactions(prev => 
          prev.map(tx => 
            tx.hash === txResponse.hash 
              ? { ...tx, status: 'success' }
              : tx
          )
        );
        // Обновляем баланс
        if (user?.wallet?.address) {
          updateBalance(user.wallet.address);
        }
      });
      
    } catch (error) {
      console.error('Transaction error:', error);
      alert('Transaction failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setTransactions([]);
  };

  if (!ready) {
    return (
      <div className="container">
        <Head>
          <title>Seismic Game - Loading...</title>
        </Head>
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading Seismic Game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Head>
        <title>Seismic Game - Wallet Connection</title>
        <meta name="description" content="Seismic Game - Modern blockchain application with Privy wallet integration" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="header">
        <div className="header-content">
          <h1 className="app-title">🌊 Seismic Game</h1>
          <div className="header-controls">
            <span className="network-status">Seismic Devnet</span>
            <span className={`connection-status ${authenticated ? 'connected' : 'disconnected'}`}>
              {authenticated ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
            {authenticated ? (
              <button className="btn btn-danger" onClick={logout}>
                🚪 Logout
              </button>
            ) : (
              <button className="btn btn-primary" onClick={login}>
                🔗 Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        {!authenticated ? (
          <div className="welcome-section">
            <div className="welcome-card">
              <h2>🎮 Welcome to Seismic Game</h2>
              <p>Connect your wallet to start playing on the Seismic blockchain network.</p>
              <button className="btn btn-primary btn-large" onClick={login}>
                🔗 Connect Wallet
              </button>
            </div>
          </div>
        ) : (
          <div className="app-grid">
            {/* User Info */}
            <div className="card">
              <h3 className="card-title">👤 User Information</h3>
              <div className="info-section">
                <div className="info-item">
                  <label>Email</label>
                  <div className="info-value">{user?.email?.address || 'Not specified'}</div>
                </div>
                <div className="info-item">
                  <label>Wallet Address</label>
                  <div className="info-value">
                    {user?.wallet?.address ? 
                      `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 
                      'Not connected'
                    }
                  </div>
                </div>
                <div className="info-item">
                  <label>Balance</label>
                  <div className="info-value">{balance} SETH</div>
                </div>
                <div className="info-item">
                  <label>Network</label>
                  <div className="info-value status-connected">Seismic Devnet</div>
                </div>
              </div>
            </div>

            {/* Transaction Form */}
            <div className="card">
              <h3 className="card-title">📤 Send Transaction</h3>
              <div className="form-section">
                <div className="form-group">
                  <label>Recipient Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="0x..."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Amount (SETH)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0.0"
                    step="0.001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={enableEncryption}
                      onChange={(e) => setEnableEncryption(e.target.checked)}
                    />
                    <label className="form-check-label">
                      ✅ Enable Seismic Encryption
                    </label>
                  </div>
                </div>
                <button 
                  className="btn btn-primary btn-block"
                  onClick={handleSendTransaction}
                  disabled={loading || !provider}
                >
                  {loading ? 'Sending...' : '📤 Send Transaction'}
                </button>
              </div>
            </div>

            {/* Transaction History */}
            <div className="card transaction-card">
              <div className="card-header">
                <h3 className="card-title">📋 Transaction History</h3>
                {transactions.length > 0 && (
                  <button className="btn btn-outline-danger btn-sm" onClick={clearHistory}>
                    🗑 Clear
                  </button>
                )}
              </div>
              <div className="transaction-history">
                {transactions.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">ℹ️</div>
                    <p>No transactions yet. Send your first transaction to see it here.</p>
                  </div>
                ) : (
                  <div className="transaction-list">
                    {transactions.map((tx, index) => (
                      <div key={index} className="transaction-item">
                        <div className="transaction-header">
                          <span className="transaction-type">
                            {tx.encrypted ? '🔐' : '💸'} 
                            {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                          </span>
                          <span className={`transaction-status status-${tx.status}`}>
                            {tx.status}
                          </span>
                        </div>
                        <div className="transaction-details">
                          <small>To: {tx.to?.slice(0, 10)}...</small>
                          <small>Amount: {tx.value} SETH</small>
                          <small>{tx.timestamp}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 