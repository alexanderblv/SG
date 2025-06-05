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

  // Encrypted Types Demo
  const [selectedEncryptedType, setSelectedEncryptedType] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [encryptedResult, setEncryptedResult] = useState(null);

  const encryptedTypes = [
    { value: 'suint8', label: 'suint8 - Encrypted 8-bit Integer' },
    { value: 'suint16', label: 'suint16 - Encrypted 16-bit Integer' },
    { value: 'suint32', label: 'suint32 - Encrypted 32-bit Integer' },
    { value: 'saddress', label: 'saddress - Encrypted Address' },
    { value: 'sbool', label: 'sbool - Encrypted Boolean' }
  ];

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

  const handleEncryptData = async () => {
    if (!selectedEncryptedType || !contractAddress) {
      alert('Please select encrypted type and enter contract address');
      return;
    }

    try {
      setLoading(true);
      
      // Симуляция процесса шифрования
      const mockEncryptedData = {
        type: selectedEncryptedType,
        contractAddress: contractAddress,
        encryptedValue: `0x${Math.random().toString(16).substr(2, 64)}`,
        timestamp: new Date().toLocaleString()
      };
      
      setEncryptedResult(mockEncryptedData);
      alert(`Data encrypted successfully using ${selectedEncryptedType}!`);
      
    } catch (error) {
      console.error('Encryption error:', error);
      alert('Encryption failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEncryptedTransaction = async () => {
    if (!provider || !contractAddress || !selectedEncryptedType) {
      alert('Please complete encryption first and connect wallet');
      return;
    }

    try {
      setLoading(true);
      
      const signer = await provider.getSigner();
      
      // Симуляция отправки зашифрованной транзакции
      const transaction = {
        to: contractAddress,
        value: ethers.parseEther('0.001'), // Минимальная комиссия
        data: `0x${Math.random().toString(16).substr(2, 128)}` // Mock encrypted data
      };

      const txResponse = await signer.sendTransaction(transaction);
      
      const newTx = {
        hash: txResponse.hash,
        to: contractAddress,
        value: '0.001',
        timestamp: new Date().toLocaleString(),
        status: 'pending',
        encrypted: true,
        encryptedType: selectedEncryptedType
      };
      
      setTransactions(prev => [newTx, ...prev]);
      
      alert(`Encrypted transaction sent successfully!\nHash: ${txResponse.hash}\nType: ${selectedEncryptedType}`);
      
      // Очистить форму
      setSelectedEncryptedType('');
      setContractAddress('');
      setEncryptedResult(null);
      
    } catch (error) {
      console.error('Encrypted transaction error:', error);
      alert('Encrypted transaction failed: ' + error.message);
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
          <title>Seismic Transaction Sender - Loading...</title>
        </Head>
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading Seismic Transaction Sender...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Head>
        <title>Seismic Transaction Sender</title>
        <meta name="description" content="Seismic Transaction Sender - Modern blockchain application with encrypted transaction support" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="header">
        <div className="header-content">
          <h1 className="app-title">Seismic Transaction Sender</h1>
          <div className="header-controls">
            <span className="network-status">Seismic devnet</span>
            <span className={`connection-status ${authenticated ? 'connected' : 'disconnected'}`}>
              {authenticated ? 'Connected' : 'Disconnected'}
            </span>
            {authenticated ? (
              <button className="btn btn-primary" onClick={logout}>
                Disconnect
              </button>
            ) : (
              <button className="btn btn-primary" onClick={login}>
                Connect Wallet
              </button>
            )}
            <button className="btn btn-success">Add Network</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {!authenticated ? (
          <div className="welcome-section">
            <div className="welcome-card">
              <h2>Welcome to Seismic Transaction Sender</h2>
              <p>Connect your wallet to start sending transactions on the Seismic blockchain network.</p>
              <button className="btn btn-primary btn-large" onClick={login}>
                Connect Wallet
              </button>
            </div>
          </div>
        ) : (
          <div className="content-grid">
            <div className="left-column">
              {/* Wallet Information */}
              <div className="card">
                <h3 className="card-title">🔒 Wallet Information</h3>
                <div className="info-section">
                  <div className="info-item">
                    <label>Your Address</label>
                    <div className="info-value address-display">
                      {user?.wallet?.address || 'Connect wallet to see address'}
                      <button className="copy-btn" onClick={() => navigator.clipboard.writeText(user?.wallet?.address)}>
                        📋
                      </button>
                    </div>
                  </div>
                  <div className="info-item">
                    <label>Balance (ETH)</label>
                    <div className="info-value balance-display">
                      {balance}
                      <button className="refresh-btn" onClick={() => user?.wallet?.address && updateBalance(user.wallet.address)}>
                        🔄
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Send Transaction */}
              <div className="card">
                <h3 className="card-title">📤 Send Transaction</h3>
                <div className="form-section">
                  <div className="form-group">
                    <label>Recipient Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="0x... (Enter the recipient's Ethereum address)"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount (ETH)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0.0 (Amount to send in ETH)"
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
                        Enable Seismic Encryption
                      </label>
                      <small className="form-text">Use Seismic's privacy features for this transaction</small>
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

              {/* Encrypted Types Demo */}
              <div className="card">
                <h3 className="card-title">🔐 Encrypted Types Demo</h3>
                <div className="form-section">
                  <div className="form-group">
                    <label>Select Encrypted Type</label>
                    <select
                      className="form-control encrypted-type-select"
                      value={selectedEncryptedType}
                      onChange={(e) => setSelectedEncryptedType(e.target.value)}
                    >
                      <option value="">Choose type...</option>
                      {encryptedTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Contract Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="0x... (contract address for encrypted transaction)"
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                    />
                  </div>
                  <div className="encrypted-actions">
                    <button 
                      className="btn btn-info"
                      onClick={handleEncryptData}
                      disabled={loading || !selectedEncryptedType || !contractAddress}
                    >
                      🔒 Encrypt Data
                    </button>
                    <button 
                      className="btn btn-success"
                      onClick={handleSendEncryptedTransaction}
                      disabled={loading || !encryptedResult || !provider}
                    >
                      🚀 Send Encrypted Transaction
                    </button>
                  </div>
                  {encryptedResult && (
                    <div className="encrypted-result">
                      <h4>Encryption Result:</h4>
                      <div className="result-details">
                        <div><strong>Type:</strong> {encryptedResult.type}</div>
                        <div><strong>Contract:</strong> {encryptedResult.contractAddress}</div>
                        <div><strong>Encrypted Value:</strong> {encryptedResult.encryptedValue}</div>
                        <div><strong>Timestamp:</strong> {encryptedResult.timestamp}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="right-column">
              {/* Transaction History */}
              <div className="card transaction-card">
                <div className="card-header">
                  <h3 className="card-title">🕘 Transaction History</h3>
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
                              {tx.encryptedType && <span className="encrypted-badge">{tx.encryptedType}</span>}
                            </span>
                            <span className={`transaction-status status-${tx.status}`}>
                              {tx.status}
                            </span>
                          </div>
                          <div className="transaction-details">
                            <small>To: {tx.to?.slice(0, 10)}...</small>
                            <small>Amount: {tx.value} ETH</small>
                            <small>{tx.timestamp}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 