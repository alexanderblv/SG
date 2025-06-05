// Seismic SDK для работы с блокчейном
import { ethers } from 'https://cdn.skypack.dev/ethers@6.7.1';
import { seismicNetwork, ENCRYPTED_TYPES } from './seismic-config.js';

export class SeismicSDK {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.isConnected = false;
    this.transactionHistory = [];
  }

  // Инициализация подключения к сети
  async init(walletProvider) {
    try {
      if (walletProvider) {
        this.provider = new ethers.BrowserProvider(walletProvider);
        this.signer = await this.provider.getSigner();
        this.isConnected = true;
        
        // Проверяем, что мы подключены к правильной сети
        const network = await this.provider.getNetwork();
        if (Number(network.chainId) !== seismicNetwork.id) {
          await this.switchToSeismicNetwork();
        }
        
        return true;
      }
      
      // Подключение к публичному RPC
      this.provider = new ethers.JsonRpcProvider(seismicNetwork.rpcUrls.default.http[0]);
      this.isConnected = false;
      return false;
    } catch (error) {
      console.error('Ошибка инициализации SDK:', error);
      throw error;
    }
  }

  // Переключение на Seismic сеть
  async switchToSeismicNetwork() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${seismicNetwork.id.toString(16)}` }],
      });
    } catch (switchError) {
      // Если сеть не существует, добавляем её
      if (switchError.code === 4902) {
        await this.addSeismicNetwork();
      } else {
        throw switchError;
      }
    }
  }

  // Добавление Seismic сети в кошелек
  async addSeismicNetwork() {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${seismicNetwork.id.toString(16)}`,
          chainName: seismicNetwork.name,
          nativeCurrency: seismicNetwork.nativeCurrency,
          rpcUrls: seismicNetwork.rpcUrls.default.http,
          blockExplorerUrls: [seismicNetwork.blockExplorers.default.url],
        }],
      });
    } catch (error) {
      console.error('Ошибка добавления сети:', error);
      throw error;
    }
  }

  // Получение баланса
  async getBalance(address) {
    try {
      if (!this.provider) {
        throw new Error('Provider не инициализирован');
      }
      
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Ошибка получения баланса:', error);
      throw error;
    }
  }

  // Отправка обычной транзакции
  async sendTransaction({ to, value, data = null }) {
    try {
      if (!this.signer) {
        throw new Error('Signer не инициализирован');
      }

      const tx = {
        to,
        value: ethers.parseEther(value.toString()),
        ...(data && { data }),
      };

      const transaction = await this.signer.sendTransaction(tx);
      
      // Сохраняем в историю
      this.addToHistory({
        hash: transaction.hash,
        to,
        value,
        type: 'normal',
        timestamp: Date.now(),
        status: 'pending'
      });

      return transaction;
    } catch (error) {
      console.error('Ошибка отправки транзакции:', error);
      throw error;
    }
  }

  // Отправка зашифрованной транзакции
  async sendEncryptedTransaction({ to, encryptedData, type }) {
    try {
      if (!this.signer) {
        throw new Error('Signer не инициализирован');
      }

      if (!Object.values(ENCRYPTED_TYPES).includes(type)) {
        throw new Error('Неподдерживаемый тип зашифрованных данных');
      }

      // Симуляция зашифрованной транзакции
      // В реальной реализации здесь будет использоваться FHE (Fully Homomorphic Encryption)
      const encryptedPayload = this.encryptData(encryptedData, type);
      
      const tx = {
        to,
        data: encryptedPayload,
        gasLimit: 100000, // Увеличенный лимит для зашифрованных операций
      };

      const transaction = await this.signer.sendTransaction(tx);
      
      // Сохраняем в историю
      this.addToHistory({
        hash: transaction.hash,
        to,
        type: 'encrypted',
        encryptedType: type,
        timestamp: Date.now(),
        status: 'pending'
      });

      return transaction;
    } catch (error) {
      console.error('Ошибка отправки зашифрованной транзакции:', error);
      throw error;
    }
  }

  // Шифрование данных (заглушка для демонстрации)
  encryptData(data, type) {
    const prefix = `0x${type}`;
    const encodedData = ethers.toUtf8Bytes(JSON.stringify(data));
    return prefix + ethers.hexlify(encodedData).slice(2);
  }

  // Расшифровка данных (заглушка для демонстрации)
  decryptData(encryptedData, type) {
    try {
      const prefix = `0x${type}`;
      if (!encryptedData.startsWith(prefix)) {
        throw new Error('Неверный формат зашифрованных данных');
      }
      
      const dataHex = '0x' + encryptedData.slice(prefix.length);
      const decodedData = ethers.toUtf8String(dataHex);
      return JSON.parse(decodedData);
    } catch (error) {
      console.error('Ошибка расшифровки данных:', error);
      return null;
    }
  }

  // Получение информации о сети
  async getNetworkInfo() {
    try {
      if (!this.provider) {
        throw new Error('Provider не инициализирован');
      }

      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getFeeData();

      return {
        chainId: Number(network.chainId),
        name: network.name,
        blockNumber,
        gasPrice: ethers.formatUnits(gasPrice.gasPrice, 'gwei'),
        maxFeePerGas: gasPrice.maxFeePerGas ? ethers.formatUnits(gasPrice.maxFeePerGas, 'gwei') : null,
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas ? ethers.formatUnits(gasPrice.maxPriorityFeePerGas, 'gwei') : null,
      };
    } catch (error) {
      console.error('Ошибка получения информации о сети:', error);
      throw error;
    }
  }

  // Проверка статуса транзакции
  async getTransactionStatus(hash) {
    try {
      if (!this.provider) {
        throw new Error('Provider не инициализирован');
      }

      const receipt = await this.provider.getTransactionReceipt(hash);
      if (receipt) {
        return receipt.status === 1 ? 'success' : 'failed';
      }
      
      const tx = await this.provider.getTransaction(hash);
      return tx ? 'pending' : 'not_found';
    } catch (error) {
      console.error('Ошибка проверки статуса транзакции:', error);
      return 'error';
    }
  }

  // Добавление транзакции в историю
  addToHistory(transaction) {
    this.transactionHistory.unshift(transaction);
    
    // Сохраняем в localStorage
    localStorage.setItem('seismic_tx_history', JSON.stringify(this.transactionHistory));
    
    // Ограничиваем историю 100 транзакциями
    if (this.transactionHistory.length > 100) {
      this.transactionHistory = this.transactionHistory.slice(0, 100);
    }
  }

  // Загрузка истории из localStorage
  loadHistory() {
    try {
      const saved = localStorage.getItem('seismic_tx_history');
      if (saved) {
        this.transactionHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
      this.transactionHistory = [];
    }
  }

  // Получение истории транзакций
  getHistory() {
    return this.transactionHistory;
  }

  // Очистка истории
  clearHistory() {
    this.transactionHistory = [];
    localStorage.removeItem('seismic_tx_history');
  }

  // Проверка подключения
  isWalletConnected() {
    return this.isConnected && this.signer !== null;
  }

  // Получение адреса пользователя
  async getUserAddress() {
    if (!this.signer) {
      return null;
    }
    
    try {
      return await this.signer.getAddress();
    } catch (error) {
      console.error('Ошибка получения адреса:', error);
      return null;
    }
  }
}

// Экспортируем единственный экземпляр SDK
export const seismicSDK = new SeismicSDK(); 