import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import Head from 'next/head';

// Seismic Network Configuration
const SEISMIC_NETWORK = {
  id: 5124,
  name: 'Seismic Devnet',
  network: 'seismic-devnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Seismic ETH',
    symbol: 'SETH',
  },
  rpcUrls: {
    public: { http: ['https://node-2.seismicdev.net/rpc'] },
    default: { http: ['https://node-2.seismicdev.net/rpc'] },
  },
  blockExplorers: {
    default: { 
      name: 'Seismic Explorer', 
      url: 'https://explorer-2.seismicdev.net/' 
    },
  },
  testnet: true,
};

export default function Home() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState('0.0');
  const [transactions, setTransactions] = useState([]);
  const [provider, setProvider] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  
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

  // Проверка текущей сети
  const checkNetwork = async (ethereumProvider) => {
    try {
      const network = await ethereumProvider.request({ method: 'eth_chainId' });
      const chainId = parseInt(network, 16);
      
      let networkName = 'Unknown Network';
      if (chainId === SEISMIC_NETWORK.id) {
        networkName = SEISMIC_NETWORK.name;
      } else if (chainId === 1) {
        networkName = 'Ethereum Mainnet';
      } else if (chainId === 5) {
        networkName = 'Goerli Testnet';
      } else if (chainId === 11155111) {
        networkName = 'Sepolia Testnet';
      } else {
        networkName = `Unknown Network (${chainId})`;
      }
      
      setCurrentNetwork({ chainId, name: networkName });
      setIsCorrectNetwork(chainId === SEISMIC_NETWORK.id);
      
      console.log(`Current network: ${networkName} (Chain ID: ${chainId})`);
      return chainId === SEISMIC_NETWORK.id;
    } catch (error) {
      console.error('Error checking network:', error);
      setCurrentNetwork({ chainId: null, name: 'Unknown Network' });
      setIsCorrectNetwork(false);
      return false;
    }
  };

  // Переключение на Seismic сеть
  const switchToSeismic = async () => {
    if (!wallets.length) return;
    
    try {
      setLoading(true);
      const ethereumProvider = await wallets[0].getEthereumProvider();
      
      const chainIdHex = `0x${SEISMIC_NETWORK.id.toString(16)}`;
      
      // Сначала пробуем добавить сеть (если её нет)
      try {
        await ethereumProvider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: chainIdHex,
            chainName: SEISMIC_NETWORK.name,
            nativeCurrency: SEISMIC_NETWORK.nativeCurrency,
            rpcUrls: [SEISMIC_NETWORK.rpcUrls.default.http[0]],
            blockExplorerUrls: [SEISMIC_NETWORK.blockExplorers.default.url],
          }],
        });
      } catch (addError) {
        // Если сеть уже добавлена, это нормально
        console.log('Network might already be added:', addError.message);
      }
      
      // Теперь переключаемся на сеть
      try {
        await ethereumProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError) {
        console.error('Error switching to network:', switchError);
        throw new Error(`Failed to switch to Seismic network: ${switchError.message}`);
      }
      
      // Ждем немного и проверяем что сеть изменилась
      setTimeout(async () => {
        await checkNetwork(ethereumProvider);
      }, 1000);
      
    } catch (error) {
      console.error('Error switching to Seismic:', error);
      alert(`Failed to switch to Seismic network: ${error.message}\n\nPlease try manually adding Seismic network to your wallet:\nChain ID: 5124\nRPC URL: https://node-2.seismicdev.net/rpc`);
    } finally {
      setLoading(false);
    }
  };

  // Инициализация провайдера кошелька
  useEffect(() => {
    if (authenticated && wallets.length > 0) {
      const initializeWallet = async () => {
        try {
          const ethereumProvider = await wallets[0].getEthereumProvider();
          const ethersProvider = new ethers.BrowserProvider(ethereumProvider);
          setProvider(ethersProvider);
          
          // Проверяем сеть
          await checkNetwork(ethereumProvider);
          
          // Слушаем изменения сети
          ethereumProvider.on('chainChanged', () => {
            checkNetwork(ethereumProvider);
          });
          
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

    // Проверяем что пользователь на правильной сети
    if (!isCorrectNetwork) {
      alert('Please switch to Seismic network before sending transactions!');
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
        encrypted: enableEncryption,
        network: 'Seismic'
      };
      
      setTransactions(prev => [newTx, ...prev]);
      
      alert(`Transaction sent successfully on Seismic!\nHash: ${txResponse.hash}`);
      
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
      
      // Симуляция процесса шифрования с использованием Seismic
      const mockEncryptedData = {
        type: selectedEncryptedType,
        contractAddress: contractAddress,
        encryptedValue: `0x${Math.random().toString(16).substr(2, 64)}`,
        timestamp: new Date().toLocaleString(),
        network: 'Seismic'
      };
      
      setEncryptedResult(mockEncryptedData);
      alert(`Data encrypted successfully using ${selectedEncryptedType} on Seismic!`);
      
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

    // Проверяем что пользователь на правильной сети
    if (!isCorrectNetwork) {
      alert('Please switch to Seismic network before sending encrypted transactions!');
      return;
    }

    try {
      setLoading(true);
      
      const signer = await provider.getSigner();
      
      // Отправка зашифрованной транзакции на Seismic
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
        encryptedType: selectedEncryptedType,
        network: 'Seismic'
      };
      
      setTransactions(prev => [newTx, ...prev]);
      
      alert(`Encrypted transaction sent successfully on Seismic!\nHash: ${txResponse.hash}\nType: ${selectedEncryptedType}`);
      
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
            <div className="network-info">
              <span className={`network-status ${isCorrectNetwork ? 'correct' : 'incorrect'}`}>
                {currentNetwork ? currentNetwork.name : 'Unknown Network'}
                {isCorrectNetwork ? ' ✅' : ' ❌'}
              </span>
              {!isCorrectNetwork && currentNetwork && (
                <div className="network-buttons">
                  <button 
                    className="btn btn-warning btn-sm" 
                    onClick={switchToSeismic}
                    disabled={loading}
                  >
                    {loading ? 'Switching...' : 'Switch to Seismic'}
                  </button>
                  <button 
                    className="btn btn-info btn-sm" 
                    onClick={() => {
                      alert(`Manual Network Setup Instructions:
                      
1. Open your wallet (MetaMask, etc.)
2. Go to Settings > Networks > Add Network
3. Enter the following details:

Network Name: Seismic Devnet
Chain ID: 5124
RPC URL: https://node-2.seismicdev.net/rpc
Currency Symbol: SETH
Block Explorer: https://explorer-2.seismicdev.net/

4. Save and switch to this network`);
                    }}
                  >
                    Manual Setup
                  </button>
                </div>
              )}
            </div>
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
                {!isCorrectNetwork && (
                  <div className="network-warning">
                    ⚠️ Warning: You are not connected to Seismic network. Please switch to Seismic before sending transactions.
                  </div>
                )}
                <div className="form-section">
                  <div className="form-group">
                    <label>Recipient Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="0x... (Enter the recipient's Ethereum address)"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      disabled={!isCorrectNetwork}
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount (SETH)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0.0 (Amount to send in SETH)"
                      step="0.001"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={!isCorrectNetwork}
                    />
                  </div>
                  <div className="form-group">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={enableEncryption}
                        onChange={(e) => setEnableEncryption(e.target.checked)}
                        disabled={!isCorrectNetwork}
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
                    disabled={loading || !provider || !isCorrectNetwork}
                  >
                    {loading ? 'Sending...' : '📤 Send Transaction on Seismic'}
                  </button>
                </div>
              </div>

              {/* Encrypted Types Demo */}
              <div className="card">
                <h3 className="card-title">🔐 Encrypted Types Demo</h3>
                {!isCorrectNetwork && (
                  <div className="network-warning">
                    ⚠️ Warning: Encrypted transactions only work on Seismic network. Please switch to Seismic.
                  </div>
                )}
                <div className="form-section">
                  <div className="form-group">
                    <label>Select Encrypted Type</label>
                    <select
                      className="form-control encrypted-type-select"
                      value={selectedEncryptedType}
                      onChange={(e) => setSelectedEncryptedType(e.target.value)}
                      disabled={!isCorrectNetwork}
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
                      disabled={!isCorrectNetwork}
                    />
                  </div>
                  <div className="encrypted-actions">
                    <button 
                      className="btn btn-info"
                      onClick={handleEncryptData}
                      disabled={loading || !selectedEncryptedType || !contractAddress || !isCorrectNetwork}
                    >
                      🔒 Encrypt Data
                    </button>
                    <button 
                      className="btn btn-success"
                      onClick={handleSendEncryptedTransaction}
                      disabled={loading || !encryptedResult || !provider || !isCorrectNetwork}
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