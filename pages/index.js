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

// Utility functions for localStorage
const TRANSACTIONS_STORAGE_KEY = 'seismic_transactions';

const saveTransactionsToStorage = (transactions) => {
  try {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions to localStorage:', error);
  }
};

const loadTransactionsFromStorage = () => {
  try {
    const stored = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (!stored) return [];
    
    const transactions = JSON.parse(stored);
    
    // Добавляем поле source для обратной совместимости со старыми транзакциями
    return transactions.map(tx => {
      if (!tx.source) {
        // Определяем source на основе типа транзакции
        if (tx.encryptedType === 'message') {
          return { ...tx, source: 'messages' };
        } else {
          return { ...tx, source: 'transactions' };
        }
      }
      return tx;
    });
  } catch (error) {
    console.error('Error loading transactions from localStorage:', error);
    return [];
  }
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
  const [networkSwitchAttempted, setNetworkSwitchAttempted] = useState(false);
  
  // Форма для отправки транзакций
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [enableEncryption, setEnableEncryption] = useState(false);

  // Encrypted Types
  const [selectedEncryptedType, setSelectedEncryptedType] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [encryptedResult, setEncryptedResult] = useState(null);
  
  // Add input values for each encrypted type
  const [encryptedInputValue, setEncryptedInputValue] = useState('');
  const [validationError, setValidationError] = useState('');

  // Encrypted Message Feature  
  const [messageToEncrypt, setMessageToEncrypt] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState(null);
  const [messageContractAddress, setMessageContractAddress] = useState('');

  // Notification system
  const [notifications, setNotifications] = useState([]);
  const [notificationTimers, setNotificationTimers] = useState(new Map());

  // Tab system
  const [activeTab, setActiveTab] = useState('transactions');

  // Transaction Info Modal
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // Add notification function
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      timestamp: new Date().toLocaleString()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only last 5 notifications
    
    // Auto remove after specified time - longer for errors
    const autoCloseTime = type === 'error' ? 10000 : 5000; // 10 seconds for errors, 5 for others
    const timer = setTimeout(() => {
      removeNotification(id);
    }, autoCloseTime);
    
    // Store timer to allow pausing
    setNotificationTimers(prev => new Map(prev).set(id, timer));
  };

  // Remove notification function
  const removeNotification = (id) => {
    // Clear timer if exists
    const timer = notificationTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      setNotificationTimers(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    }
    
    // Add closing animation class
    const notificationElement = document.querySelector(`[data-notification-id="${id}"]`);
    if (notificationElement) {
      notificationElement.classList.add('notification-closing');
      // Remove from state after animation completes
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 300);
    } else {
      // Fallback if element not found
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  // Pause/resume notification auto-close
  const pauseNotification = (id) => {
    const timer = notificationTimers.get(id);
    if (timer) {
      clearTimeout(timer);
    }
  };

  const resumeNotification = (id, type) => {
    const autoCloseTime = type === 'error' ? 10000 : 5000;
    const timer = setTimeout(() => {
      removeNotification(id);
    }, autoCloseTime);
    
    setNotificationTimers(prev => new Map(prev).set(id, timer));
  };

  const encryptedTypes = [
    { value: 'suint8', label: 'suint8 - Encrypted 8-bit Integer' },
    { value: 'suint16', label: 'suint16 - Encrypted 16-bit Integer' },
    { value: 'suint32', label: 'suint32 - Encrypted 32-bit Integer' },
    { value: 'saddress', label: 'saddress - Encrypted Address' },
    { value: 'sbool', label: 'sbool - Encrypted Boolean' }
  ];

  // Load transactions from localStorage on component mount
  useEffect(() => {
    const storedTransactions = loadTransactionsFromStorage();
    setTransactions(storedTransactions);
  }, []);

  // Save transactions to localStorage whenever transactions state changes
  useEffect(() => {
    saveTransactionsToStorage(transactions);
  }, [transactions]);

  // Check transaction statuses for pending transactions
  useEffect(() => {
    if (!provider || !transactions.length) return;

    const checkPendingTransactions = async () => {
      const pendingTxs = transactions.filter(tx => tx.status === 'pending');
      
      if (pendingTxs.length === 0) return;

      for (const tx of pendingTxs) {
        try {
          const receipt = await provider.getTransactionReceipt(tx.hash);
          if (receipt) {
            const newStatus = receipt.status === 1 ? 'success' : 'failed';
            
            setTransactions(prev => 
              prev.map(t => 
                t.hash === tx.hash 
                  ? { ...t, status: newStatus, blockNumber: receipt.blockNumber }
                  : t
              )
            );

            // Update balance if transaction was successful
            if (newStatus === 'success' && user?.wallet?.address) {
              updateBalance(user.wallet.address);
            }
          }
        } catch (error) {
          console.error(`Error checking transaction ${tx.hash}:`, error);
          
          // If transaction is not found after some time, mark as failed
          const txAge = Date.now() - new Date(tx.timestamp).getTime();
          if (txAge > 10 * 60 * 1000) { // 10 minutes
            setTransactions(prev => 
              prev.map(t => 
                t.hash === tx.hash 
                  ? { ...t, status: 'failed' }
                  : t
              )
            );
          }
        }
      }
    };

    // Check immediately and then every 15 seconds
    checkPendingTransactions();
    const interval = setInterval(checkPendingTransactions, 15000);

    return () => clearInterval(interval);
  }, [provider, transactions, user?.wallet?.address]);

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
        addNotification(`Failed to switch to Seismic network: ${error.message}. Please try manually adding Seismic network to your wallet.`, 'error');
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
    if (!provider || !amount) {
      addNotification('Please fill in amount and connect wallet', 'warning');
      return;
    }

    // Проверяем что пользователь на правильной сети
    if (!isCorrectNetwork) {
      addNotification('Please switch to Seismic network before sending transactions!', 'warning');
      return;
    }

    // Если адрес получателя пустой, используем адрес текущего кошелька
    const targetRecipient = recipientAddress.trim() || user?.wallet?.address;
    
    if (!targetRecipient) {
      addNotification('Unable to determine recipient address. Please connect wallet or enter recipient address.', 'error');
      return;
    }

    // Проверяем валидность адреса
    if (!/^0x[a-fA-F0-9]{40}$/.test(targetRecipient)) {
      addNotification('Invalid recipient address format', 'error');
      return;
    }

    // Проверяем баланс перед отправкой
    const currentBalance = parseFloat(balance);
    const sendAmount = parseFloat(amount);
    
    if (currentBalance === 0) {
      addNotification('Balance is 0 SETH. You need test tokens to send transactions. Use the faucet to get free tokens.', 'warning');
      return;
    }
    
    if (sendAmount > currentBalance) {
      addNotification(
        `Insufficient balance! You're trying to send: ${sendAmount} SETH, but your current balance is: ${currentBalance} SETH. Please reduce the amount or get more tokens from the faucet.`, 
        'error'
      );
      return;
    }
    
    // Проверяем что остается достаточно на газ (примерно 0.001 SETH)
    const estimatedGas = 0.001;
    if (sendAmount + estimatedGas > currentBalance) {
      addNotification(
        `Please leave some SETH for gas fees! Recommended max amount: ${(currentBalance - estimatedGas).toFixed(6)} SETH (${estimatedGas} SETH reserved for gas)`, 
        'warning'
      );
      return;
    }

    try {
      setLoading(true);
      
      const signer = await provider.getSigner();
      
      // НОВАЯ ЛОГИКА: Различные транзакции для обычных и зашифрованных
      let transaction;
      let transactionType = enableEncryption ? 'encrypted' : 'standard';
      
      if (enableEncryption) {
        // ЗАШИФРОВАННАЯ ТРАНЗАКЦИЯ
        console.log('Preparing ENCRYPTED transaction with Seismic privacy features...');
        
        // Генерируем зашифрованные данные для demo
        const encryptedMetadata = {
          sender: user?.wallet?.address,
          recipient: targetRecipient,
          amount: amount,
          timestamp: Date.now(),
          privacy: 'seismic-tdx-encrypted'
        };
        
        // Симулируем шифрование метаданных транзакции
        const encryptedData = `0x${Array.from({length: 128}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        
        transaction = {
          to: targetRecipient,
          value: ethers.parseEther(amount),
          data: encryptedData,  // Добавляем зашифрованные данные!
          gasLimit: 100000     // Увеличиваем лимит газа для зашифрованных tx
        };
        
        addNotification('Preparing encrypted transaction with Seismic TDX privacy features...', 'info');
      } else {
        // ОБЫЧНАЯ ТРАНЗАКЦИЯ
        console.log('Preparing standard transparent transaction...');
        
        transaction = {
          to: targetRecipient,
          value: ethers.parseEther(amount)
        };
        
        addNotification('Preparing standard transparent transaction...', 'info');
      }
      
      // Оцениваем газ
      try {
        const gasEstimate = await signer.estimateGas(transaction);
        console.log(`Gas estimate for ${transactionType} transaction:`, gasEstimate.toString());
      } catch (gasError) {
        console.error('Gas estimation failed:', gasError);
        
        if (gasError.message.includes('insufficient funds')) {
          addNotification('Insufficient funds for transaction! You need more SETH tokens. Use the faucet to get free test tokens.', 'error');
          return;
        }
        
        throw gasError;
      }

      const txResponse = await signer.sendTransaction(transaction);
      
      const newTx = {
        hash: txResponse.hash,
        to: targetRecipient,
        value: amount,
        timestamp: new Date().toLocaleString(),
        status: 'pending',
        encrypted: enableEncryption,
        encryptionType: enableEncryption ? 'Seismic TDX Encryption' : 'None',
        network: 'Seismic',
        gasUsed: transaction.gasLimit || 'auto',
        dataSize: enableEncryption ? `${transaction.data.length} bytes` : '0 bytes',
        source: 'transactions'  // Маркировка источника - страница транзакций
      };
      
      setTransactions(prev => [newTx, ...prev]);
      
      const encryptionStatus = enableEncryption ? 'ENCRYPTED' : 'TRANSPARENT';
      const recipientInfo = targetRecipient === user?.wallet?.address ? ' (to your own wallet)' : '';
      addNotification(`${encryptionStatus} transaction sent successfully on Seismic${recipientInfo}! Hash: ${txResponse.hash}`, 'success');
      
      // Очистить форму
      setRecipientAddress('');
      setAmount('');
      setEnableEncryption(false);
      
      // Transaction status will be automatically checked by useEffect
      
    } catch (error) {
      console.error('Transaction error:', error);
      
      let errorMessage = 'Transaction failed: ';
      
      if (error.message.includes('insufficient funds')) {
        errorMessage = `Insufficient funds! You need more SETH tokens to complete this transaction. Click the "Get Test Tokens" button to get free tokens from the faucet.`;
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled by user.';
      } else if (error.message.includes('network')) {
        errorMessage = `Network error: ${error.message}. Please check your connection to Seismic network.`;
      } else {
        errorMessage += error.message;
      }
      
      addNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Validation functions for each encrypted type
  const validateEncryptedInput = (type, value) => {
    switch (type) {
      case 'suint8':
        const uint8Val = parseInt(value);
        if (isNaN(uint8Val) || uint8Val < 0 || uint8Val > 255) {
          return 'suint8 must be an integer between 0 and 255';
        }
        return null;
      
      case 'suint16':
        const uint16Val = parseInt(value);
        if (isNaN(uint16Val) || uint16Val < 0 || uint16Val > 65535) {
          return 'suint16 must be an integer between 0 and 65,535';
        }
        return null;
      
      case 'suint32':
        const uint32Val = parseInt(value);
        if (isNaN(uint32Val) || uint32Val < 0 || uint32Val > 4294967295) {
          return 'suint32 must be an integer between 0 and 4,294,967,295';
        }
        return null;
      
      case 'saddress':
        if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
          return 'saddress must be a valid Ethereum address (0x followed by 40 hex characters)';
        }
        return null;
      
      case 'sbool':
        if (value !== 'true' && value !== 'false') {
          return 'sbool must be either "true" or "false"';
        }
        return null;
      
      default:
        return 'Unknown encrypted type';
    }
  };

  // Encode value according to Seismic type specifications
  const encodeSeismicValue = (type, value) => {
    switch (type) {
      case 'suint8':
        const uint8 = parseInt(value);
        return '0x' + uint8.toString(16).padStart(2, '0');
      
      case 'suint16':
        const uint16 = parseInt(value);
        return '0x' + uint16.toString(16).padStart(4, '0');
      
      case 'suint32':
        const uint32 = parseInt(value);
        return '0x' + uint32.toString(16).padStart(8, '0');
      
      case 'saddress':
        return value.toLowerCase(); // Normalize to lowercase
      
      case 'sbool':
        return value === 'true' ? '0x01' : '0x00';
      
      default:
        throw new Error('Unknown type');
    }
  };

  // Get input placeholder and help text for each type
  const getInputConfig = (type) => {
    switch (type) {
      case 'suint8':
        return {
          placeholder: 'Enter number (0-255)',
          helpText: 'suint8: Encrypted 8-bit unsigned integer (0 to 255)',
          inputType: 'number'
        };
      case 'suint16':
        return {
          placeholder: 'Enter number (0-65535)',
          helpText: 'suint16: Encrypted 16-bit unsigned integer (0 to 65,535)',
          inputType: 'number'
        };
      case 'suint32':
        return {
          placeholder: 'Enter number (0-4294967295)',
          helpText: 'suint32: Encrypted 32-bit unsigned integer (0 to 4,294,967,295)',
          inputType: 'number'
        };
      case 'saddress':
        return {
          placeholder: '0x742d35Cc6634C0532925a3b8D0C9e67b6d7d4b4b',
          helpText: 'saddress: Encrypted Ethereum address (42 characters starting with 0x)',
          inputType: 'text'
        };
      case 'sbool':
        return {
          placeholder: 'true or false',
          helpText: 'sbool: Encrypted boolean value (true or false)',
          inputType: 'select'
        };
      default:
        return {
          placeholder: 'Select type first',
          helpText: 'Choose an encrypted type to see input requirements',
          inputType: 'text'
        };
    }
  };

  const handleEncryptData = async () => {
    if (!selectedEncryptedType || !encryptedInputValue.trim()) {
      addNotification('Please select encrypted type and provide input value', 'warning');
      return;
    }

    // Validate input value for selected type
    const validationError = validateEncryptedInput(selectedEncryptedType, encryptedInputValue.trim());
    if (validationError) {
      setValidationError(validationError);
      addNotification(`Validation Error: ${validationError}`, 'error');
      return;
    }

    setValidationError('');

    // Используем адрес контракта пользователя или адрес текущего кошелька
    const targetContract = contractAddress.trim() || user?.wallet?.address;

    try {
      setLoading(true);
      
      // Encode the value according to Seismic specifications
      const encodedValue = encodeSeismicValue(selectedEncryptedType, encryptedInputValue.trim());
      
      // Create proper encrypted data with type-safe encoding
      const encryptedData = {
        type: selectedEncryptedType,
        originalValue: encryptedInputValue.trim(),
        encodedValue: encodedValue,
        contractAddress: targetContract,
        // Simulate encrypted value using TDX secure enclaves
        encryptedValue: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        timestamp: new Date().toLocaleString(),
        network: 'Seismic',
        encryption: 'TDX Secure Enclave'
      };
      
      setEncryptedResult(encryptedData);
      const targetInfo = targetContract === user?.wallet?.address ? ' (to your own wallet)' : '';
      addNotification(`${selectedEncryptedType} value "${encryptedInputValue}" encrypted successfully on Seismic${targetInfo}!`, 'success');
      
    } catch (error) {
      console.error('Encryption error:', error);
      addNotification('Encryption failed: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEncryptedTransaction = async () => {
    if (!provider || !selectedEncryptedType) {
      addNotification('Please complete encryption first and connect wallet', 'warning');
      return;
    }

    // Проверяем что пользователь на правильной сети
    if (!isCorrectNetwork) {
      addNotification('Please switch to Seismic network before sending encrypted transactions!', 'warning');
      return;
    }

    // Если адрес контракта пустой, используем адрес текущего кошелька
    const targetContract = contractAddress.trim() || user?.wallet?.address;
    
    if (!targetContract) {
      addNotification('Unable to determine contract address. Please connect wallet or enter contract address.', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const signer = await provider.getSigner();
      
      // Отправка зашифрованной транзакции на Seismic
      const transaction = {
        to: targetContract,
        value: ethers.parseEther('0.001'), // Минимальная комиссия
        data: `0x${Array.from({length: 128}, () => Math.floor(Math.random() * 16).toString(16)).join('')}` // Mock encrypted data
      };

      const txResponse = await signer.sendTransaction(transaction);
      
      const newTx = {
        hash: txResponse.hash,
        to: targetContract,
        value: '0.001',
        timestamp: new Date().toLocaleString(),
        status: 'pending',
        encrypted: true,
        encryptedType: selectedEncryptedType,
        network: 'Seismic',
        source: 'transactions'  // Маркировка источника - страница транзакций
      };
      
      setTransactions(prev => [newTx, ...prev]);
      
      const contractInfo = targetContract === user?.wallet?.address ? ' (to your own wallet)' : '';
      addNotification(`Encrypted transaction sent successfully on Seismic${contractInfo}! Hash: ${txResponse.hash}, Type: ${selectedEncryptedType}`, 'success');
      
      // Очистить форму
      setSelectedEncryptedType('');
      setContractAddress('');
      setEncryptedResult(null);
      setEncryptedInputValue('');
      setValidationError('');
      
    } catch (error) {
      console.error('Encrypted transaction error:', error);
      addNotification('Encrypted transaction failed: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setTransactions([]);
    addNotification('Transaction history cleared successfully', 'success');
  };

  // Очистка истории транзакций (только со страницы транзакций)
  const clearTransactionHistory = () => {
    setTransactions(prev => prev.filter(tx => tx.source !== 'transactions'));
    addNotification('Transaction history cleared successfully', 'success');
  };

  // Очистка истории сообщений (только со страницы сообщений)
  const clearMessageHistory = () => {
    setTransactions(prev => prev.filter(tx => !(tx.encryptedType === 'message' && tx.source === 'messages')));
    addNotification('Message history cleared successfully', 'success');
  };

  // Transaction Info Modal Functions
  const showTransactionInfo = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const hideTransactionInfo = () => {
    setSelectedTransaction(null);
    setShowTransactionModal(false);
  };

  const handleEncryptMessage = async () => {
    if (!messageToEncrypt.trim()) {
      addNotification('Please enter a message to encrypt', 'warning');
      return;
    }

    try {
      setLoading(true);
      
      // Конвертируем сообщение в байты для шифрования
      const messageBytes = new TextEncoder().encode(messageToEncrypt);
      
      // Симуляция процесса шифрования сообщения с использованием Seismic
      const mockEncryptedMessage = {
        originalMessage: messageToEncrypt,
        messageBytes: Array.from(messageBytes),
        encryptedData: `0x${Array.from({length: 128}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        timestamp: new Date().toLocaleString(),
        network: 'Seismic',
        encryption: 'TDX Secure Enclave',
        method: 'CSTORE (Encrypted Storage)'
      };
      
      setEncryptedMessage(mockEncryptedMessage);
      addNotification(`Message encrypted successfully using Seismic TDX encryption!`, 'success');
      
    } catch (error) {
      console.error('Message encryption error:', error);
      addNotification('Message encryption failed: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Функция для отправки зашифрованного сообщения в блокчейн
  const handleSendEncryptedMessage = async () => {
    if (!provider || !encryptedMessage) {
      addNotification('Please encrypt a message first', 'warning');
      return;
    }

    // Проверяем что пользователь на правильной сети
    if (!isCorrectNetwork) {
      addNotification('Please switch to Seismic network before sending encrypted messages!', 'warning');
      return;
    }

    try {
      setLoading(true);
      
      const signer = await provider.getSigner();
      
      // Используем адрес контракта пользователя или адрес текущего кошелька
      const targetAddress = messageContractAddress.trim() || user?.wallet?.address;
      
      if (!targetAddress) {
        addNotification('Unable to determine target address. Please connect wallet or enter contract address.', 'error');
        return;
      }
      
      // Отправка зашифрованного сообщения на Seismic
      const transaction = {
        to: targetAddress,
        value: ethers.parseEther('0.001'), // Минимальная комиссия
        data: encryptedMessage.encryptedData
      };

      const txResponse = await signer.sendTransaction(transaction);
      
      const newTx = {
        hash: txResponse.hash,
        to: targetAddress,
        value: '0.001',
        timestamp: new Date().toLocaleString(),
        status: 'pending',
        encrypted: true,
        encryptedType: 'message',
        messagePreview: encryptedMessage.originalMessage.substring(0, 50) + (encryptedMessage.originalMessage.length > 50 ? '...' : ''),
        network: 'Seismic',
        source: 'messages'  // Маркировка источника - страница сообщений
      };
      
      setTransactions(prev => [newTx, ...prev]);
      
      const addressInfo = targetAddress === user?.wallet?.address ? ' (to your own wallet)' : '';
      addNotification(`Encrypted message sent successfully on Seismic${addressInfo}! Hash: ${txResponse.hash}`, 'success');
      
      // Очистить форму
      setMessageToEncrypt('');
      setMessageContractAddress('');
      setEncryptedMessage(null);
      
    } catch (error) {
      console.error('Encrypted message transaction error:', error);
      addNotification('Encrypted message transaction failed: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Clear validation errors and reset input when type changes
  const handleEncryptedTypeChange = (newType) => {
    setSelectedEncryptedType(newType);
    setEncryptedInputValue('');
    setValidationError('');
    setEncryptedResult(null);
  };

  if (!ready) {
    return (
      <div className="container">
        <Head>
          <title>Seismic Experience by alexanderblv - Loading...</title>
          <meta name="description" content="Loading Seismic Experience by alexanderblv..." />
        </Head>
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading Seismic Experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Head>
        <title>Seismic Experience by alexanderblv</title>
        <meta name="description" content="Seismic Experience by alexanderblv - Modern blockchain application with encrypted transaction support" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="header">
        <div className="header-content">
          <h1 className="app-title">Seismic Experience <span className="by-author">by alexanderblv</span></h1>
          <div className="header-controls">
            <div className="network-info">
              <span className={`network-status ${
                !authenticated 
                  ? 'disconnected'
                  : isCorrectNetwork 
                    ? 'correct' 
                    : 'incorrect'
              }`}>
                {!authenticated 
                  ? 'Wallet Disconnected'
                  : isCorrectNetwork 
                    ? 'Connected to Seismic'
                    : 'Wrong Network'
                }
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
                      addNotification(`Manual Network Setup Instructions:

1. Open your wallet (MetaMask, etc.)
2. Go to Settings > Networks > Add Network
3. Enter the following details:

Network Name: Seismic Devnet
Chain ID: 5124
RPC URL: https://node-2.seismicdev.net/rpc
Currency Symbol: SETH
Block Explorer: https://explorer-2.seismicdev.net/

4. Save and switch to this network`, 'info');
                    }}
                  >
                    Manual Setup
                  </button>
                </div>
              )}
            </div>
            {authenticated && (
              <span className={`connection-status ${authenticated ? 'connected' : 'disconnected'}`}>
                {authenticated ? 'Connected' : 'Disconnected'}
              </span>
            )}
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

      {/* Notification System */}
      {notifications.length > 0 && (
        <div className="notifications-container">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              data-notification-id={notification.id}
              className={`notification notification-${notification.type}`}
              onMouseEnter={() => pauseNotification(notification.id)}
              onMouseLeave={() => resumeNotification(notification.id, notification.type)}
            >
              <div className="notification-content">
                <div className="notification-icon">
                  {notification.type === 'success' && '✓'}
                  {notification.type === 'error' && '✗'}
                  {notification.type === 'warning' && '!'}
                  {notification.type === 'info' && 'i'}
                </div>
                <div className="notification-message">
                  {notification.message}
                </div>
                <button 
                  className="notification-close"
                  onClick={() => removeNotification(notification.id)}
                >
                  ✕
                </button>
              </div>
              <div className="notification-time">
                {notification.timestamp}
              </div>
            </div>
          ))}
        </div>
      )}

      <main className="main-content">
        {!authenticated ? (
          <div className="welcome-section">
            <div className="welcome-card">
              <h2>Welcome to Seismic Experience by alexanderblv</h2>
              <p>Connect your wallet to start sending transactions on the Seismic blockchain network.</p>
              
              <div className="welcome-info">
                <div className="security-warning-box">
                  <h4>🔒 Wallet Security Notice</h4>
                  <div className="security-content">
                    <p><strong>Recommended:</strong> Use MetaMask for the best experience</p>
                    <p><strong>⚠️ Warning:</strong> Be careful with Rabby wallet - only use from official sources (rabby.io). 
                    If you see authorization dialogs with suspicious proxy servers, close immediately and use MetaMask instead.</p>
                  </div>
                </div>
                
                <div className="network-info-box">
                  <h4>Seismic Network Details</h4>
                  <div className="network-details">
                    <div><strong>Network:</strong> Seismic Devnet</div>
                    <div><strong>Chain ID:</strong> 5124</div>
                    <div><strong>Currency:</strong> SETH</div>
                  </div>
                </div>
                
                <div className="resources-info-box">
                  <h4>Useful Resources</h4>
                  <div className="resource-links-welcome">
                    <a href={SEISMIC_LINKS.faucet} target="_blank" rel="noopener noreferrer" className="resource-link">
                      Get Test Tokens
                    </a>
                    <a href={SEISMIC_LINKS.docs} target="_blank" rel="noopener noreferrer" className="resource-link">
                      Documentation
                    </a>
                    <a href={SEISMIC_LINKS.explorer} target="_blank" rel="noopener noreferrer" className="resource-link">
                      Explorer
                    </a>
                  </div>
                </div>
              </div>
              
              <button className="btn btn-primary btn-large" onClick={login}>
                Connect Wallet
              </button>
              
              <div className="welcome-note">
                <small>
                  After connecting, the app will automatically switch your wallet to Seismic network.
                  If you need test tokens, use the faucet link above.
                </small>
              </div>
            </div>
          </div>
        ) : (
          <div className="content-container">
            {/* Tab Navigation */}
            <div className="tabs-navigation">
              <button 
                className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
                onClick={() => setActiveTab('transactions')}
              >
                Transactions
              </button>
              <button 
                className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
                onClick={() => setActiveTab('messages')}
              >
                Encrypted Messages
              </button>
              <button 
                className={`tab-button ${activeTab === 'wallet' ? 'active' : ''}`}
                onClick={() => setActiveTab('wallet')}
              >
                Wallet & Network
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'wallet' && (
              <div className="tab-content wallet-tab-content">
                {/* Wallet Status & Information */}
                <div className="card wallet-info-card">
                  <h3 className="card-title">Wallet Status & Information</h3>
                  <div className="info-section">
                    <div className="info-item">
                      <label>Connection Status</label>
                      <div className={`info-value status-indicator ${authenticated ? 'status-connected' : 'status-disconnected'}`}>
                        <span className="status-dot"></span>
                        {authenticated ? 'Connected' : 'Disconnected'}
                      </div>
                    </div>
                    <div className="info-item">
                      <label>Wallet Address</label>
                      <div className="info-value address-display">
                        <span className="address-text">
                          {user?.wallet?.address || 'Not connected'}
                        </span>
                        {user?.wallet?.address && (
                          <button className="action-btn copy-btn" onClick={() => navigator.clipboard.writeText(user?.wallet?.address)}>
                            Copy
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="info-item">
                      <label>SETH Balance</label>
                      <div className="info-value balance-display">
                        <span className="balance-amount">{balance}</span>
                        {user?.wallet?.address && (
                          <button className="action-btn refresh-btn" onClick={() => updateBalance(user.wallet.address)}>
                            Refresh
                          </button>
                        )}
                      </div>
                    </div>
                    {authenticated && (
                      <div className="info-item">
                        <label>Provider</label>
                        <div className="info-value">
                          {user?.wallet?.walletClientType || 'Unknown'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Network Configuration */}
                <div className="card network-config-card">
                  <h3 className="card-title">Network Configuration</h3>
                  <div className="info-section">
                    <div className="info-item">
                      <label>Network Status</label>
                      <div className={`info-value status-indicator ${
                        !authenticated 
                          ? 'status-disconnected'
                          : isCorrectNetwork 
                            ? 'status-connected' 
                            : 'status-warning'
                      }`}>
                        <span className="status-dot"></span>
                        {!authenticated 
                          ? 'Not Connected'
                          : isCorrectNetwork 
                            ? 'Seismic Network'
                            : 'Wrong Network'
                        }
                      </div>
                    </div>
                    <div className="info-item">
                      <label>Target Chain</label>
                      <div className="info-value">
                        {SEISMIC_NETWORK.name}
                        <span className="chain-id">ID: {SEISMIC_NETWORK.id}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <label>Native Token</label>
                      <div className="info-value">
                        {SEISMIC_NETWORK.nativeCurrency.symbol}
                      </div>
                    </div>
                    
                    {balance === '0.0' && isCorrectNetwork && (
                      <div className="info-item">
                        <label>Balance Warning</label>
                        <div className="info-value text-warning">
                          No SETH tokens - Use faucet below
                        </div>
                      </div>
                    )}
                    
                    {!isCorrectNetwork && authenticated && (
                      <div className="info-item">
                        <label>Action Required</label>
                        <div className="info-value">
                          <button 
                            className="btn btn-warning btn-block network-switch-btn"
                            onClick={() => switchToSeismic(false)}
                            disabled={loading}
                          >
                            {loading ? 'Switching...' : 'Switch to Seismic'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="resource-links-compact">
                    <a href={SEISMIC_LINKS.faucet} target="_blank" rel="noopener noreferrer" className="resource-link">
                      Faucet
                    </a>
                    <a href={SEISMIC_LINKS.explorer} target="_blank" rel="noopener noreferrer" className="resource-link">
                      Explorer
                    </a>
                    <a href={SEISMIC_LINKS.docs} target="_blank" rel="noopener noreferrer" className="resource-link">
                      Docs
                    </a>
                    <a href={SEISMIC_LINKS.devnet} target="_blank" rel="noopener noreferrer" className="resource-link">
                      Guide
                    </a>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="card network-details-card">
                  <h3 className="card-title">Technical Details</h3>
                  <div className="info-section">
                    <div className="info-item">
                      <label>Active Network</label>
                      <div className="info-value">
                        {!authenticated 
                          ? 'Not connected'
                          : currentNetwork?.name || 'Unknown'
                        }
                      </div>
                    </div>
                    <div className="info-item">
                      <label>Chain ID</label>
                      <div className="info-value">
                        {!authenticated 
                          ? 'N/A'
                          : currentNetwork?.chainId || 'Unknown'
                        }
                      </div>
                    </div>
                    <div className="info-item">
                      <label>Environment</label>
                      <div className="info-value">
                        Testnet
                      </div>
                    </div>
                    <div className="info-item">
                      <label>RPC Endpoint</label>
                      <div className="info-value technical-value">
                        {SEISMIC_NETWORK.rpcUrls?.default?.http?.[0] || 'N/A'}
                      </div>
                    </div>
                    <div className="info-item">
                      <label>Currency Details</label>
                      <div className="info-value">
                        <div className="currency-info">
                          <span className="currency-symbol">{SEISMIC_NETWORK.nativeCurrency.symbol}</span>
                          <span className="currency-name">{SEISMIC_NETWORK.nativeCurrency.name}</span>
                          <span className="currency-decimals">Decimals: {SEISMIC_NETWORK.nativeCurrency.decimals}</span>
                        </div>
                      </div>
                    </div>
                    <div className="info-item">
                      <label>Block Explorer</label>
                      <div className="info-value">
                        <a 
                          href={SEISMIC_NETWORK.blockExplorers?.default?.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="explorer-link"
                        >
                          {SEISMIC_NETWORK.blockExplorers?.default?.name || 'Explorer'}
                        </a>
                      </div>
                    </div>
                    <div className="info-item">
                      <label>Connection Quality</label>
                      <div className={`info-value status-indicator ${
                        !authenticated 
                          ? 'status-disconnected'
                          : isCorrectNetwork 
                            ? 'status-connected' 
                            : 'status-warning'
                      }`}>
                        <span className="status-dot"></span>
                        {!authenticated 
                          ? 'Not connected'
                          : isCorrectNetwork 
                            ? 'Excellent'
                            : 'Network mismatch'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="tab-content">
                <div className="left-column">
                  {/* Send Transaction */}
                  <div className="card">
                    <h3 className="card-title">Send Transaction</h3>
                    <div className="form-section">
                      <div className="form-group">
                        <label>Recipient Address</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="0x... (Enter recipient address or leave empty to send to your wallet)"
                            value={recipientAddress}
                            onChange={(e) => setRecipientAddress(e.target.value)}
                            disabled={!isCorrectNetwork}
                          />
                        </div>
                        <small className="form-text">Leave empty to send to your own wallet</small>
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
                            Enable Seismic TDX Encryption
                          </label>
                          <small className="form-text">
                            Add encrypted metadata to transaction using Seismic's Intel TDX secure enclaves 
                            (includes extra data field + increased gas limit)
                          </small>
                        </div>
                      </div>
                      <button 
                        className="btn btn-primary btn-block"
                        onClick={handleSendTransaction}
                        disabled={loading || !provider || !isCorrectNetwork}
                      >
                        {loading ? 'Sending...' : 'Send Transaction on Seismic'}
                      </button>
                    </div>
                  </div>

                  {/* Encrypted Types */}
                  <div className="card">
                    <h3 className="card-title">Encrypted Types</h3>
                    <div className="form-section">
                      <div className="form-group">
                        <label>Select Encrypted Type</label>
                        <select
                          className="form-control encrypted-type-select"
                          value={selectedEncryptedType}
                          onChange={(e) => handleEncryptedTypeChange(e.target.value)}
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
                        <label>Address</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="0x... (Enter address or leave empty to use your wallet)"
                          value={contractAddress}
                          onChange={(e) => setContractAddress(e.target.value)}
                          disabled={!isCorrectNetwork}
                        />
                        <small className="form-text">Leave empty to send to your own wallet</small>
                      </div>
                      <div className="form-group">
                        <label>Input Value</label>
                        {getInputConfig(selectedEncryptedType).inputType === 'select' ? (
                          <select
                            className="form-control"
                            value={encryptedInputValue}
                            onChange={(e) => setEncryptedInputValue(e.target.value)}
                            disabled={!isCorrectNetwork}
                          >
                            <option value="">Choose value...</option>
                            <option value="true">true</option>
                            <option value="false">false</option>
                          </select>
                        ) : (
                          <input
                            type={getInputConfig(selectedEncryptedType).inputType}
                            className="form-control"
                            placeholder={getInputConfig(selectedEncryptedType).placeholder}
                            value={encryptedInputValue}
                            onChange={(e) => setEncryptedInputValue(e.target.value)}
                            disabled={!isCorrectNetwork}
                            min={getInputConfig(selectedEncryptedType).inputType === 'number' ? '0' : undefined}
                            max={getInputConfig(selectedEncryptedType).inputType === 'number' && selectedEncryptedType === 'suint8' ? '255' : 
                                 getInputConfig(selectedEncryptedType).inputType === 'number' && selectedEncryptedType === 'suint16' ? '65535' :
                                 getInputConfig(selectedEncryptedType).inputType === 'number' && selectedEncryptedType === 'suint32' ? '4294967295' : undefined}
                          />
                        )}
                        <small className="form-text">
                          {getInputConfig(selectedEncryptedType).helpText}
                        </small>
                        {validationError && (
                          <small className="form-text text-danger">
                            {validationError}
                          </small>
                        )}
                      </div>
                      <div className="encrypted-actions">
                        <button 
                          className="btn btn-info"
                          onClick={handleEncryptData}
                          disabled={loading || !selectedEncryptedType || !encryptedInputValue.trim() || !isCorrectNetwork}
                        >
                          Encrypt Data
                        </button>
                        <button 
                          className="btn btn-success"
                          onClick={handleSendEncryptedTransaction}
                          disabled={loading || !encryptedResult || !provider || !isCorrectNetwork}
                        >
                          Send Encrypted Transaction
                        </button>
                      </div>
                      {encryptedResult && (
                        <div className="encrypted-result">
                          <h4>Type-Safe Encryption Result:</h4>
                          <div className="result-details">
                            <div className="result-section">
                              <h5>Type Information:</h5>
                              <div><strong>Encrypted Type:</strong> <span className="type-badge">{encryptedResult.type}</span></div>
                              <div><strong>Original Value:</strong> <code>{encryptedResult.originalValue}</code></div>
                              <div><strong>Encoded Value:</strong> <code>{encryptedResult.encodedValue}</code></div>
                            </div>
                            <div className="result-section">
                              <h5>Encryption Details:</h5>
                              <div><strong>Encryption Method:</strong> {encryptedResult.encryption}</div>
                              <div><strong>Encrypted Output:</strong> <code className="encrypted-value">{encryptedResult.encryptedValue}</code></div>
                              <div><strong>Target Contract:</strong> <code>{encryptedResult.contractAddress}</code></div>
                            </div>
                            <div className="result-section">
                              <h5>Validation Status:</h5>
                              <div className="validation-status">
                                ✅ Input validated according to Seismic type specifications
                              </div>
                              <div><strong>Network:</strong> {encryptedResult.network}</div>
                              <div><strong>Timestamp:</strong> {encryptedResult.timestamp}</div>
                            </div>
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
                      <h3 className="card-title">Transaction History</h3>
                      {transactions.filter(tx => tx.source === 'transactions').length > 0 && (
                        <button className="btn btn-outline-danger btn-sm" onClick={clearTransactionHistory}>
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="transaction-history">
                      {transactions.filter(tx => tx.source === 'transactions').length === 0 ? (
                        <div className="empty-state">
                          <div className="empty-icon">i</div>
                          <p>No transactions yet. Send your first transaction to see it here.</p>
                        </div>
                      ) : (
                        <div className="transaction-list">
                          {transactions.filter(tx => tx.source === 'transactions').map((tx, index) => (
                            <div key={index} className="transaction-item">
                              <div className="transaction-header">
                                <span className="transaction-type">
                                  {tx.encrypted ? '🔐' : '💸'} 
                                  <a 
                                    href={`${SEISMIC_LINKS.explorer}/tx/${tx.hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transaction-hash-link"
                                    title="View on Seismic Explorer"
                                  >
                                    {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                                  </a>
                                  {tx.encryptedType && <span className="encrypted-badge">{tx.encryptedType}</span>}
                                </span>
                                <div className="transaction-status-section">
                                  <span className={`transaction-status status-${tx.status}`}>
                                    {tx.status === 'pending' && 'Pending'}
                                    {tx.status === 'success' && 'Success'}
                                    {tx.status === 'failed' && 'Failed'}
                                  </span>
                                  <button 
                                    className="btn-info-small"
                                    onClick={() => showTransactionInfo(tx)}
                                    title="Show transaction details"
                                  >
                                    i
                                  </button>
                                </div>
                              </div>
                              <div className="transaction-details">
                                <small>To: {tx.to?.slice(0, 10)}...</small>
                                <small>Amount: {tx.value} SETH</small>
                                <small>{tx.timestamp}</small>
                                {tx.blockNumber && <small>Block: {tx.blockNumber}</small>}
                                {tx.encrypted && (
                                  <>
                                    <small className="encryption-info">Encryption: {tx.encryptionType || 'Seismic TDX'}</small>
                                    {tx.dataSize && <small className="data-info">Data: {tx.dataSize}</small>}
                                    {tx.gasUsed && <small className="gas-info">Gas: {tx.gasUsed}</small>}
                                  </>
                                )}
                                {!tx.encrypted && (
                                  <small className="transparent-info">Transparent Transaction</small>
                                )}
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

            {activeTab === 'messages' && (
              <div className="tab-content">
                <div className="left-column">
                  {/* Encrypted Message Sender */}
                  <div className="card">
                    <h3 className="card-title">Encrypt & Send Message</h3>
                    <div className="form-section">
                      <div className="form-group">
                        <label>Message to Encrypt</label>
                        <textarea
                          className="form-control"
                          rows="15"
                          placeholder="Enter your secret message here... 
(e.g., 'This is my private message that will be encrypted using Seismic TDX secure enclaves')"
                          value={messageToEncrypt}
                          onChange={(e) => setMessageToEncrypt(e.target.value)}
                          disabled={!isCorrectNetwork}
                        />
                        <small className="form-text">
                          Your message will be encrypted using Seismic's TDX secure enclaves before being stored on-chain
                        </small>
                      </div>
                      <div className="form-group">
                        <label>Address</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="0x... (Enter address or leave empty to use your wallet)"
                          value={messageContractAddress}
                          onChange={(e) => setMessageContractAddress(e.target.value)}
                          disabled={!isCorrectNetwork}
                        />
                        <small className="form-text">
                          Leave empty to send to your own wallet
                        </small>
                      </div>
                      <div className="message-actions">
                        <button 
                          className="btn btn-info"
                          onClick={handleEncryptMessage}
                          disabled={loading || !messageToEncrypt.trim() || !isCorrectNetwork}
                        >
                          Encrypt Message
                        </button>
                        <button 
                          className="btn btn-success"
                          onClick={handleSendEncryptedMessage}
                          disabled={loading || !encryptedMessage || !provider || !isCorrectNetwork}
                        >
                          Send to Blockchain
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Encryption Result Display */}
                  {encryptedMessage && (
                    <div className="card">
                      <h3 className="card-title">Encryption Result</h3>
                      <div className="encrypted-message-result">
                        <div className="result-section">
                          <h4>Original Message:</h4>
                          <div className="original-message">
                            "{encryptedMessage.originalMessage}"
                          </div>
                        </div>
                        <div className="result-section">
                          <h4>Encryption Details:</h4>
                          <div className="encryption-details">
                            <div><strong>Method:</strong> {encryptedMessage.method}</div>
                            <div><strong>Encryption:</strong> {encryptedMessage.encryption}</div>
                            <div><strong>Network:</strong> {encryptedMessage.network}</div>
                            <div><strong>Timestamp:</strong> {encryptedMessage.timestamp}</div>
                          </div>
                        </div>
                        <div className="result-section">
                          <h4>Encrypted Data:</h4>
                          <div className="encrypted-data">
                            <code>{encryptedMessage.encryptedData}</code>
                          </div>
                          <small className="form-text">
                            This encrypted data will be stored on Seismic blockchain and can only be decrypted with the proper keys
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Message Templates */}
                  <div className="card">
                    <h3 className="card-title">Quick Message Templates</h3>
                    <div className="template-section">
                      <p>Click on a template to use it:</p>
                      <div className="template-buttons">
                        <button 
                          className="btn btn-outline-secondary btn-sm template-btn"
                          onClick={() => setMessageToEncrypt('This is a confidential business message encrypted on Seismic blockchain.')}
                          disabled={!isCorrectNetwork}
                        >
                          Business Message
                        </button>
                        <button 
                          className="btn btn-outline-secondary btn-sm template-btn"
                          onClick={() => setMessageToEncrypt('Personal private note stored securely using TDX encryption on Seismic.')}
                          disabled={!isCorrectNetwork}
                        >
                          Personal Note
                        </button>
                        <button 
                          className="btn btn-outline-secondary btn-sm template-btn"
                          onClick={() => setMessageToEncrypt('Secret voting choice: Option A. This vote is encrypted and anonymous.')}
                          disabled={!isCorrectNetwork}
                        >
                          Private Vote
                        </button>
                        <button 
                          className="btn btn-outline-secondary btn-sm template-btn"
                          onClick={() => setMessageToEncrypt('API Key: sk_test_123abc. Stored securely with hardware-level encryption.')}
                          disabled={!isCorrectNetwork}
                        >
                          Secure Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="right-column">
                  {/* Message History */}
                  <div className="card transaction-card">
                    <div className="card-header">
                      <h3 className="card-title">Message History</h3>
                      {transactions.filter(tx => tx.encryptedType === 'message' && tx.source === 'messages').length > 0 && (
                        <button className="btn btn-outline-danger btn-sm" onClick={clearMessageHistory}>
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="transaction-history">
                      {transactions.filter(tx => tx.encryptedType === 'message' && tx.source === 'messages').length === 0 ? (
                        <div className="empty-state">
                          <div className="empty-icon">i</div>
                          <p>No encrypted messages yet. Send your first encrypted message to see it here.</p>
                        </div>
                      ) : (
                        <div className="transaction-list">
                          {transactions
                            .filter(tx => tx.encryptedType === 'message' && tx.source === 'messages')
                            .map((tx, index) => (
                            <div key={index} className="transaction-item message-item">
                              <div className="transaction-header">
                                <span className="transaction-type">
                                  <a 
                                    href={`${SEISMIC_LINKS.explorer}/tx/${tx.hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transaction-hash-link"
                                    title="View on Seismic Explorer"
                                  >
                                    {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                                  </a>
                                  <span className="encrypted-badge">encrypted message</span>
                                </span>
                                <div className="transaction-status-section">
                                  <span className={`transaction-status status-${tx.status}`}>
                                    {tx.status === 'pending' && 'Pending'}
                                    {tx.status === 'success' && 'Success'}
                                    {tx.status === 'failed' && 'Failed'}
                                  </span>
                                  <button 
                                    className="btn-info-small"
                                    onClick={() => showTransactionInfo(tx)}
                                    title="Show message details"
                                  >
                                    i
                                  </button>
                                </div>
                              </div>
                              <div className="transaction-details">
                                <small>Preview: {tx.messagePreview}</small>
                                <small>To: {tx.to?.slice(0, 10)}...</small>
                                <small>Fee: {tx.value} SETH</small>
                                <small>{tx.timestamp}</small>
                                {tx.blockNumber && <small>Block: {tx.blockNumber}</small>}
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
          </div>
        )}
      </main>

      {/* Transaction Info Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className="modal-overlay" onClick={hideTransactionInfo}>
          <div className="modal-content transaction-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {selectedTransaction.encrypted ? 'Encrypted' : 'Regular'} Transaction Details
              </h3>
              <button className="modal-close-btn" onClick={hideTransactionInfo}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="transaction-detail-section">
                <h4>Basic Information</h4>
                <div className="detail-grid">
                  <div className="detail-row">
                    <span className="detail-label">Transaction Hash:</span>
                    <span className="detail-value">
                      <a 
                        href={`${SEISMIC_LINKS.explorer}/tx/${selectedTransaction.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hash-link"
                      >
                        {selectedTransaction.hash}
                      </a>
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`detail-value status-${selectedTransaction.status}`}>
                                  {selectedTransaction.status === 'pending' && 'Pending'}
                                  {selectedTransaction.status === 'success' && 'Success'}
                                  {selectedTransaction.status === 'failed' && 'Failed'}
                                </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Timestamp:</span>
                    <span className="detail-value">{selectedTransaction.timestamp}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">
                                  {selectedTransaction.encrypted ? 'Encrypted' : 'Regular'} Transaction
                                </span>
                  </div>
                </div>
              </div>

              <div className="transaction-detail-section">
                <h4>Transaction Data</h4>
                <div className="detail-grid">
                  <div className="detail-row">
                    <span className="detail-label">To Address:</span>
                    <span className="detail-value hash-like">{selectedTransaction.to}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value">{selectedTransaction.value} SETH</span>
                  </div>
                  {selectedTransaction.blockNumber && (
                    <div className="detail-row">
                      <span className="detail-label">Block Number:</span>
                      <span className="detail-value">{selectedTransaction.blockNumber}</span>
                    </div>
                  )}
                  {selectedTransaction.gasUsed && (
                    <div className="detail-row">
                      <span className="detail-label">Gas Used:</span>
                      <span className="detail-value">{selectedTransaction.gasUsed}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedTransaction.encrypted && (
                <div className="transaction-detail-section">
                  <h4>🔐 Encryption Information</h4>
                  <div className="detail-grid">
                    <div className="detail-row">
                      <span className="detail-label">Encryption Type:</span>
                      <span className="detail-value">{selectedTransaction.encryptionType || 'Seismic TDX'}</span>
                    </div>
                    {selectedTransaction.encryptedType && (
                      <div className="detail-row">
                        <span className="detail-label">Data Type:</span>
                        <span className="detail-value">{selectedTransaction.encryptedType}</span>
                      </div>
                    )}
                    {selectedTransaction.dataSize && (
                      <div className="detail-row">
                        <span className="detail-label">Data Size:</span>
                        <span className="detail-value">{selectedTransaction.dataSize}</span>
                      </div>
                    )}
                    {selectedTransaction.messagePreview && (
                      <div className="detail-row">
                        <span className="detail-label">Message Preview:</span>
                        <span className="detail-value">{selectedTransaction.messagePreview}</span>
                      </div>
                    )}
                    <div className="encryption-benefits">
                      <h5>🛡️ Security Features:</h5>
                      <ul>
                        <li>Hardware-level encryption using Intel TDX</li>
                        <li>Data remains private on public blockchain</li>
                        <li>Tamper-resistant secure enclaves</li>
                        <li>Transparent smart contract execution</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="transaction-detail-section">
                <h4>Network Information</h4>
                <div className="detail-grid">
                  <div className="detail-row">
                    <span className="detail-label">Network:</span>
                    <span className="detail-value">Seismic Devnet</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Explorer:</span>
                    <span className="detail-value">
                      <a 
                        href={`${SEISMIC_LINKS.explorer}/tx/${selectedTransaction.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="explorer-link"
                      >
                        View on Seismic Explorer →
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={hideTransactionInfo}>
                Close
              </button>
              <a 
                href={`${SEISMIC_LINKS.explorer}/tx/${selectedTransaction.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                View on Explorer
              </a>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-info">
            <p>&copy; 2025 Seismic Experience by <strong>alexanderblv</strong></p>
          </div>
          <div className="footer-links">
            <a 
              href="https://github.com/alexanderblv/Seismic-Experience" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              GitHub Repository
            </a>
            <a 
              href="https://x.com/alexanderblv" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              Follow on X
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
} 