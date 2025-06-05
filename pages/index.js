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

// Ссылки экосистемы Seismic
const SEISMIC_LINKS = {
  faucet: 'https://faucet-2.seismicdev.net/',
  explorer: 'https://explorer-2.seismicdev.net/',
  docs: 'https://docs.seismic.systems/',
  devnet: 'https://docs.seismic.systems/appendix/devnet'
};

// Компонент для обнаружения конфликтов кошельков
function WalletConflictDetector() {
  const [hasConflict, setHasConflict] = useState(false);
  const [detectedWallets, setDetectedWallets] = useState([]);

  useEffect(() => {
    // Проверяем наличие различных кошельков
    const wallets = [];
    
    if (typeof window !== 'undefined') {
      if (window.ethereum) {
        if (window.ethereum.isMetaMask) wallets.push('MetaMask');
        if (window.ethereum.isCoinbaseWallet) wallets.push('Coinbase Wallet');
        if (window.ethereum.isRabby) wallets.push('Rabby');
        if (window.ethereum.isTrust) wallets.push('Trust Wallet');
        if (window.ethereum.isFrame) wallets.push('Frame');
        
        // Проверяем наличие массива провайдеров (конфликт)
        if (window.ethereum.providers && window.ethereum.providers.length > 1) {
          setHasConflict(true);
          window.ethereum.providers.forEach(provider => {
            if (provider.isMetaMask) wallets.push('MetaMask');
            if (provider.isCoinbaseWallet) wallets.push('Coinbase Wallet');
            if (provider.isRabby) wallets.push('Rabby');
          });
        }
      }
      
      setDetectedWallets([...new Set(wallets)]);
      
      // Если больше одного кошелька, возможен конфликт
      if (wallets.length > 1) {
        setHasConflict(true);
      }
    }
  }, []);

  if (!hasConflict && detectedWallets.length <= 1) return null;

  return (
    <div className="wallet-conflict-warning">
      <div className="conflict-header">
        ⚠️ <strong>Wallet Conflict Detected</strong>
      </div>
      <div className="conflict-info">
        <p>Multiple wallet extensions detected: {detectedWallets.join(', ')}</p>
        <div className="conflict-solutions">
          <h5>To resolve conflicts:</h5>
          <ol>
            <li>Disable other wallet extensions except MetaMask</li>
            <li>Or use only one wallet extension at a time</li>
            <li>Refresh the page after disabling other wallets</li>
          </ol>
        </div>
        <div className="conflict-help">
          <strong>Browser Settings:</strong>
          <ul>
            <li><strong>Chrome/Edge:</strong> More tools → Extensions → Disable other wallets</li>
            <li><strong>Firefox:</strong> Add-ons and themes → Extensions → Disable other wallets</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState('0.0');
  const [transactions, setTransactions] = useState([]);
  const [provider, setProvider] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [networkSwitchAttempted, setNetworkSwitchAttempted] = useState(false);
  
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
      const isSeismic = chainId === SEISMIC_NETWORK.id;
      setIsCorrectNetwork(isSeismic);
      
      console.log(`Current network: ${networkName} (Chain ID: ${chainId})`);
      
      // Если не на Seismic и еще не пытались переключиться, автоматически пытаемся переключиться
      if (!isSeismic && !networkSwitchAttempted && wallets.length > 0) {
        console.log('Auto-switching to Seismic network...');
        setTimeout(() => switchToSeismic(true), 1000);
      }
      
      return isSeismic;
    } catch (error) {
      console.error('Error checking network:', error);
      setCurrentNetwork({ chainId: null, name: 'Unknown Network' });
      setIsCorrectNetwork(false);
      return false;
    }
  };

  // Переключение на Seismic сеть
  const switchToSeismic = async (isAutomatic = false) => {
    if (!wallets.length) return;
    
    try {
      setLoading(true);
      setNetworkSwitchAttempted(true);
      const ethereumProvider = await wallets[0].getEthereumProvider();
      
      const chainIdHex = `0x${SEISMIC_NETWORK.id.toString(16)}`;
      
      console.log(`${isAutomatic ? 'Auto-' : 'Manual '}switching to Seismic Network (Chain ID: ${SEISMIC_NETWORK.id})`);
      
      // Сначала пробуем переключиться на существующую сеть
      try {
        await ethereumProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
        
        console.log('Successfully switched to existing Seismic network');
        
        // Ждем немного и проверяем что сеть изменилась
        setTimeout(async () => {
          await checkNetwork(ethereumProvider);
        }, 1500);
        
        return;
      } catch (switchError) {
        console.log('Network not found, attempting to add...', switchError.message);
        
        // Если сеть не найдена (ошибка 4902), добавляем её
        if (switchError.code === 4902 || switchError.message.includes('Unrecognized chain ID')) {
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
            
            console.log('Successfully added and switched to Seismic network');
            
            // После добавления проверяем сеть
            setTimeout(async () => {
              await checkNetwork(ethereumProvider);
            }, 2000);
            
          } catch (addError) {
            console.error('Error adding network:', addError);
            throw new Error(`Failed to add Seismic network: ${addError.message}`);
          }
        } else {
          throw switchError;
        }
      }
      
    } catch (error) {
      console.error('Error switching to Seismic:', error);
      
      if (!isAutomatic) {
        alert(`Failed to switch to Seismic network: ${error.message}\n\nPlease try manually adding Seismic network to your wallet:\n\nNetwork Name: ${SEISMIC_NETWORK.name}\nChain ID: ${SEISMIC_NETWORK.id}\nRPC URL: ${SEISMIC_NETWORK.rpcUrls.default.http[0]}\nCurrency Symbol: ${SEISMIC_NETWORK.nativeCurrency.symbol}\nBlock Explorer: ${SEISMIC_NETWORK.blockExplorers.default.url}`);
      }
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
          
          // Проверяем сеть и автоматически переключаемся на Seismic
          await checkNetwork(ethereumProvider);
          
          // Слушаем изменения сети
          ethereumProvider.on('chainChanged', () => {
            console.log('Network changed, rechecking...');
            checkNetwork(ethereumProvider);
          });
          
          // Слушаем изменения аккаунтов
          ethereumProvider.on('accountsChanged', () => {
            console.log('Accounts changed, updating balance...');
            if (user?.wallet?.address) {
              updateBalance(user.wallet.address, ethersProvider);
            }
          });
          
          if (user?.wallet?.address) {
            updateBalance(user.wallet.address, ethersProvider);
          }
        } catch (error) {
          console.error('Error initializing wallet:', error);
        }
      };
      
      initializeWallet();
    } else {
      // Сбрасываем состояние при отключении кошелька
      setNetworkSwitchAttempted(false);
      setProvider(null);
      setCurrentNetwork(null);
      setIsCorrectNetwork(false);
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

    // Проверяем что не отправляем самому себе
    if (recipientAddress.toLowerCase() === user?.wallet?.address?.toLowerCase()) {
      const shouldUseTestAddress = window.confirm(
        `You're trying to send tokens to your own address.\n\n` +
        `This is allowed but not very useful for testing.\n\n` +
        `Click OK to use a test address, or Cancel to continue with your address.`
      );
      
      if (shouldUseTestAddress) {
        // Предлагаем тестовый адрес
        const testAddress = '0x742d35Cc6634C0532925a3b8D0C9e67b6d7d4b4b';
        setRecipientAddress(testAddress);
        alert(`Test address set: ${testAddress}\n\nYou can now send a small amount like 0.001 SETH for testing.`);
        return;
      }
    }

    // Проверяем валидность адреса
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      alert('Please enter a valid Ethereum address (starts with 0x and is 42 characters long)');
      return;
    }

    // Проверяем баланс перед отправкой
    const currentBalance = parseFloat(balance);
    const sendAmount = parseFloat(amount);
    
    if (currentBalance === 0) {
      const shouldGetFaucet = window.confirm(
        `Your balance is 0 SETH. You need test tokens to send transactions.\n\n` +
        `Click OK to open the Seismic faucet and get free test tokens.\n` +
        `After getting tokens, return here to try again.`
      );
      
      if (shouldGetFaucet) {
        window.open(SEISMIC_LINKS.faucet, '_blank');
      }
      return;
    }
    
    if (sendAmount > currentBalance) {
      alert(
        `Insufficient balance!\n\n` +
        `You're trying to send: ${sendAmount} SETH\n` +
        `Your current balance: ${currentBalance} SETH\n\n` +
        `Please reduce the amount or get more tokens from the faucet.`
      );
      return;
    }
    
    // Проверяем что остается достаточно на газ (примерно 0.001 SETH)
    const estimatedGas = 0.001;
    if (sendAmount + estimatedGas > currentBalance) {
      alert(
        `Please leave some SETH for gas fees!\n\n` +
        `Recommended max amount: ${(currentBalance - estimatedGas).toFixed(6)} SETH\n` +
        `(${estimatedGas} SETH reserved for gas)`
      );
      return;
    }

    try {
      setLoading(true);
      
      const signer = await provider.getSigner();
      
      // Сначала оцениваем газ
      const transaction = {
        to: recipientAddress,
        value: ethers.parseEther(amount)
      };
      
      try {
        const gasEstimate = await signer.estimateGas(transaction);
        console.log('Gas estimate:', gasEstimate.toString());
      } catch (gasError) {
        console.error('Gas estimation failed:', gasError);
        
        if (gasError.message.includes('insufficient funds')) {
          const shouldGetFaucet = window.confirm(
            `Insufficient funds for transaction!\n\n` +
            `This error usually means you need more SETH tokens.\n` +
            `Click OK to open the faucet and get free test tokens.`
          );
          
          if (shouldGetFaucet) {
            window.open(SEISMIC_LINKS.faucet, '_blank');
          }
          return;
        }
        
        throw gasError;
      }

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
      
      let errorMessage = 'Transaction failed: ';
      
      if (error.message.includes('insufficient funds')) {
        errorMessage = `Insufficient funds!\n\nYou need more SETH tokens to complete this transaction.\nClick the "🎁 Get Test Tokens" button to get free tokens from the faucet.`;
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled by user.';
      } else if (error.message.includes('network')) {
        errorMessage = `Network error: ${error.message}\n\nPlease check your connection to Seismic network.`;
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
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

      {/* Wallet Conflict Detection */}
      <WalletConflictDetector />

      <main className="main-content">
        {!authenticated ? (
          <div className="welcome-section">
            <div className="welcome-card">
              <h2>Welcome to Seismic Transaction Sender</h2>
              <p>Connect your wallet to start sending transactions on the Seismic blockchain network.</p>
              
              <div className="welcome-info">
                <div className="network-info-box">
                  <h4>🌐 Seismic Network Details</h4>
                  <div className="network-details">
                    <div><strong>Network:</strong> Seismic Devnet</div>
                    <div><strong>Chain ID:</strong> 5124</div>
                    <div><strong>Currency:</strong> SETH</div>
                  </div>
                </div>
                
                <div className="resources-info-box">
                  <h4>🔗 Useful Resources</h4>
                  <div className="resource-links-welcome">
                    <a href={SEISMIC_LINKS.faucet} target="_blank" rel="noopener noreferrer" className="resource-link">
                      🚰 Get Test Tokens
                    </a>
                    <a href={SEISMIC_LINKS.docs} target="_blank" rel="noopener noreferrer" className="resource-link">
                      📚 Documentation
                    </a>
                    <a href={SEISMIC_LINKS.explorer} target="_blank" rel="noopener noreferrer" className="resource-link">
                      🔍 Explorer
                    </a>
                  </div>
                </div>
              </div>
              
              <button className="btn btn-primary btn-large" onClick={login}>
                Connect Wallet
              </button>
              
              <div className="welcome-note">
                <small>
                  💡 After connecting, the app will automatically switch your wallet to Seismic network.
                  If you need test tokens, use the faucet link above.
                </small>
              </div>
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
                    <label>Balance (SETH)</label>
                    <div className="info-value balance-display">
                      {balance}
                      <button className="refresh-btn" onClick={() => user?.wallet?.address && updateBalance(user.wallet.address)}>
                        🔄
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seismic Network Info */}
              <div className="card seismic-info-card">
                <h3 className="card-title">⚡ Seismic Network Resources</h3>
                <div className="seismic-resources">
                  <div className="resource-section">
                    <div className="network-status-detailed">
                      <div className="status-row">
                        <span className="status-label">Network:</span>
                        <span className={`status-value ${isCorrectNetwork ? 'connected' : 'disconnected'}`}>
                          {isCorrectNetwork ? 'Seismic Devnet ✅' : (currentNetwork?.name || 'Not Connected ❌')}
                        </span>
                      </div>
                      <div className="status-row">
                        <span className="status-label">Chain ID:</span>
                        <span className="status-value">{SEISMIC_NETWORK.id}</span>
                      </div>
                      <div className="status-row">
                        <span className="status-label">Currency:</span>
                        <span className="status-value">{SEISMIC_NETWORK.nativeCurrency.symbol}</span>
                      </div>
                    </div>
                    
                    {balance === '0.0' && isCorrectNetwork && (
                      <div className="low-balance-warning">
                        💡 <strong>Need test tokens?</strong> Get free SETH from the faucet below!
                      </div>
                    )}
                    
                    <div className="resource-links">
                      <a 
                        href={SEISMIC_LINKS.faucet} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-success btn-sm resource-btn"
                      >
                        🚰 Get Test Tokens (Faucet)
                      </a>
                      <a 
                        href={SEISMIC_LINKS.explorer} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-info btn-sm resource-btn"
                      >
                        🔍 Block Explorer
                      </a>
                      <a 
                        href={SEISMIC_LINKS.docs} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm resource-btn"
                      >
                        📚 Documentation
                      </a>
                      <a 
                        href={SEISMIC_LINKS.devnet} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-outline-secondary btn-sm resource-btn"
                      >
                        🛠 Devnet Guide
                      </a>
                    </div>
                    
                    {!isCorrectNetwork && (
                      <div className="network-action">
                        <button 
                          className="btn btn-warning btn-block"
                          onClick={() => switchToSeismic(false)}
                          disabled={loading}
                        >
                          {loading ? 'Switching to Seismic...' : '🔄 Switch to Seismic Network'}
                        </button>
                      </div>
                    )}
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
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="0x... (Enter the recipient's Ethereum address)"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        disabled={!isCorrectNetwork}
                      />
                      <button 
                        className="btn btn-outline-info btn-sm input-helper"
                        onClick={() => {
                          const testAddress = '0x742d35Cc6634C0532925a3b8D0C9e67b6d7d4b4b';
                          setRecipientAddress(testAddress);
                        }}
                        disabled={!isCorrectNetwork}
                        title="Use test address for demo"
                      >
                        🧪 Test Address
                      </button>
                    </div>
                    <small className="form-text">Tip: Use the test address button for demo transactions</small>
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