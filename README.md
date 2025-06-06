# 🌊 Seismic Transaction Sender

Современное Web3 приложение для работы с **Seismic Blockchain** через **Privy React SDK** с автоматическим переключением сети и встроенными ресурсами.

![Seismic Game](https://img.shields.io/badge/Blockchain-Seismic-blue)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB)
![Privy](https://img.shields.io/badge/Privy-1.82.4-6A6FF5)
![Next.js](https://img.shields.io/badge/Next.js-14.0.0-000000)

## ✨ Ключевые особенности

- 🔗 **Автоматическое подключение к Seismic** - приложение автоматически переключает кошелек на Seismic Network
- 🌐 **Надежная интеграция с Seismic** (Chain ID: 5124) с постоянным мониторингом сети
- 💼 **Поддержка всех кошельков**: MetaMask, Coinbase Wallet, WalletConnect, Rainbow
- 🚰 **Встроенные ссылки на ресурсы**: faucet для тестовых токенов, explorer, документация
- 📧 **Email-based wallets** - встроенные кошельки Privy
- 💸 **Отправка транзакций** с отслеживанием статуса в реальном времени
- 🔐 **Seismic Encryption Types** - демонстрация зашифрованных типов данных
- 📱 **Адаптивный дизайн** для всех устройств
- ⚡ **Развертывание на Vercel** в один клик

## 🚀 Быстрый старт

### Развертывание на Vercel

1. **Fork этого репозитория**
2. **Подключите к Vercel:**
   - Перейдите на [vercel.com](https://vercel.com)
   - Нажмите "New Project"
   - Импортируйте ваш GitHub репозиторий
   - Добавьте переменную окружения:
     ```
     NEXT_PUBLIC_PRIVY_APP_ID=cmbhhu8sr00mojr0l66siei2z
     ```
   - Нажмите "Deploy"

3. **Готово!** Ваше приложение будет доступно на `your-project.vercel.app`

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Создание файла окружения
echo "NEXT_PUBLIC_PRIVY_APP_ID=cmbhhu8sr00mojr0l66siei2z" > .env.local

# Запуск dev сервера
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## 🌐 Seismic Network Integration

### Автоматическая настройка
Приложение автоматически:
- ✅ Обнаруживает текущую сеть кошелька
- ✅ Переключает на Seismic Network при подключении
- ✅ Мониторит изменения сети в реальном времени
- ✅ Предоставляет кнопки для ручного переключения

### Конфигурация сети
```javascript
Seismic Devnet
├── Chain ID: 5124
├── RPC URL: https://node-2.seismicdev.net/rpc
├── Currency: SETH (Seismic ETH)
├── Explorer: https://explorer-2.seismicdev.net/
└── Faucet: https://faucet-2.seismicdev.net/
```

### Встроенные ресурсы
- 🚰 **Faucet**: [https://faucet-2.seismicdev.net/](https://faucet-2.seismicdev.net/) - получение тестовых токенов
- 🔍 **Explorer**: [https://explorer-2.seismicdev.net/](https://explorer-2.seismicdev.net/) - просмотр транзакций
- 📚 **Документация**: [https://docs.seismic.systems/](https://docs.seismic.systems/)
- 🛠 **Devnet Guide**: [https://docs.seismic.systems/appendix/devnet](https://docs.seismic.systems/appendix/devnet)

## 🛠 Технологический стек

- **Frontend**: Next.js 14, React 18
- **Wallet Integration**: Privy React SDK с расширенной конфигурацией
- **Blockchain**: Ethers.js v6 с автоматическим мониторингом сети
- **Styling**: CSS3 с адаптивным дизайном и темной Seismic темой
- **Network**: Автоматическое переключение и управление сетью
- **Deployment**: Vercel с оптимизированной конфигурацией

## 📋 Функциональность

### Подключение кошелька
- ✅ MetaMask (рекомендуется)
- ✅ Coinbase Wallet
- ✅ WalletConnect
- ✅ Rainbow Wallet
- ✅ Встроенные кошельки Privy

### Seismic Network Features
- 🔄 **Автоматическое переключение** на Seismic при подключении
- 🌐 **Мониторинг сети** в реальном времени
- ⚠️ **Предупреждения** о неправильной сети
- 🚰 **Прямые ссылки** на faucet для получения тестовых токенов
- 📊 **Информационная панель** с деталями сети

### Операции с блокчейном
- 💰 Просмотр баланса SETH
- 📤 Отправка транзакций только на Seismic
- 🔐 Демо зашифрованных типов данных (suint, saddress, sbool)
- 📊 История транзакций с детальной информацией
- 🔄 Автоматическое обновление статуса

## 🎯 Использование

1. **Подключитесь** нажав "Connect Wallet"
2. **Автоматическое переключение** на Seismic Network (или используйте кнопку Switch)
3. **Получите тестовые токены** через встроенную ссылку на faucet
4. **Отправляйте транзакции** с опциональным шифрованием
5. **Экспериментируйте** с зашифрованными типами данных
6. **Отслеживайте** историю в реальном времени

## 🔧 Конфигурация Privy

```javascript
// Расширенная конфигурация для Seismic
const privyConfig = {
  appearance: {
    accentColor: '#6A6FF5',
    theme: 'light',
    showWalletLoginFirst: true,
  },
  loginMethods: ['wallet', 'email'],
  defaultChain: seismicNetwork,
  supportedChains: [seismicNetwork], // Только Seismic
  externalWallets: {
    metamask: true,
    coinbaseWallet: true,
    walletConnect: true,
    rainbow: true,
  },
  chainConfig: {
    [seismicNetwork.id]: {
      rpcTarget: 'https://node-2.seismicdev.net/rpc',
      chainId: 5124,
      networkName: 'Seismic Devnet',
    },
  },
};
```

## 📁 Структура проекта

```
seismic-transaction-sender/
├── pages/
│   ├── _app.js          # Privy Provider с Seismic конфигурацией
│   └── index.js         # Главная страница с автоматическим переключением
├── styles/
│   └── globals.css      # Стили с Seismic темой
├── SEISMIC_SETUP.md     # Инструкции по настройке Seismic
├── package.json         # Зависимости
├── next.config.js       # Конфигурация Next.js
├── vercel.json          # Настройки Vercel
└── README.md
```

## 🚰 Получение тестовых токенов

После подключения к Seismic Network:

1. **Скопируйте** адрес кошелька из приложения
2. **Перейдите** на [faucet](https://faucet-2.seismicdev.net/)
3. **Вставьте** адрес и запросите токены
4. **Дождитесь** поступления SETH на баланс

💡 В приложении есть прямая ссылка на faucet и предупреждение о низком балансе!

## 🔑 Переменные окружения

```bash
# Обязательные
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Опциональные (уже настроены)
NEXT_PUBLIC_SEISMIC_RPC_URL=https://node-2.seismicdev.net/rpc
NEXT_PUBLIC_SEISMIC_EXPLORER_URL=https://explorer-2.seismicdev.net/
NEXT_PUBLIC_SEISMIC_CHAIN_ID=5124
```

## 🐛 Отладка

### Частые проблемы

1. **Кошелек не подключается**
   - Убедитесь, что установлен MetaMask
   - Проверьте правильность App ID Privy

2. **Транзакции не отправляются**
   - Проверьте баланс SETH
   - Убедитесь в правильности адреса получателя

3. **Не отображается баланс**
   - Проверьте подключение к Seismic RPC
   - Обновите страницу

## 📈 Мониторинг

В панели Vercel доступны:
- 📊 Аналитика производительности
- 📋 Логи развертывания
- 🔍 Real-time функции
- 📱 Мобильная оптимизация

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE)

## 🔗 Полезные ссылки

- [Privy Documentation](https://docs.privy.io/)
- [Seismic Network](https://explorer-2.seismicdev.net/)
- [Vercel Deployment](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

**🎮 Начните играть на Seismic прямо сейчас!**

## 🔐 Демо зашифрованных типов данных (suint, saddress, sbool)

### ✨ Новые возможности: Типобезопасное шифрование

Приложение теперь поддерживает **типобезопасное шифрование данных** согласно спецификациям [Seismic](https://docs.seismic.systems/):

#### Поддерживаемые зашифрованные типы:

- **`suint8`** - Зашифрованное 8-битное целое число (0-255)
- **`suint16`** - Зашифрованное 16-битное целое число (0-65,535)
- **`suint32`** - Зашифрованное 32-битное целое число (0-4,294,967,295)
- **`saddress`** - Зашифрованный Ethereum адрес (формат: 0x + 40 hex символов)
- **`sbool`** - Зашифрованное булево значение (true/false)

#### Функции валидации:

✅ **Проверка типов в реальном времени** - входные данные валидируются согласно спецификации типа
✅ **Автоматическое кодирование** - значения кодируются в соответствии с Seismic протоколом
✅ **Визуальная обратная связь** - пользователь видит ошибки валидации и подсказки
✅ **Безопасность типов** - невозможно зашифровать данные неподходящим типом

#### Пример использования:

```javascript
// Для suint8: только числа от 0 до 255
Input: "42" → Encoded: "0x2a" → Encrypted: "0x..." (TDX)

// Для saddress: только валидные Ethereum адреса
Input: "0x742d35Cc..." → Encoded: "0x742d35cc..." → Encrypted: "0x..." (TDX)

// Для sbool: только true/false
Input: "true" → Encoded: "0x01" → Encrypted: "0x..." (TDX)
```

#### Технические улучшения:

- **Валидация входных данных** перед шифрованием
- **Правильное кодирование** согласно Seismic спецификациям  
- **Информативное отображение результатов** с деталями типов
- **Автоочистка полей** при смене типа шифрования
- **Улучшенный UX** с подсказками и примерами

### Интеграция с TDX Secure Enclaves

Все зашифрованные типы используют **Intel TDX** secure enclaves для обеспечения конфиденциальности согласно архитектуре Seismic. 

## 🚀 Переход к реальному блокчейну Seismic

### 🎯 Roadmap: От эмуляции к production

Текущая реализация - это **типобезопасная эмуляция** Seismic зашифрованных типов. Вот план перехода к реальному блокчейну:

#### **Phase 1: Seismic Devnet Integration (Q2 2025)**
```bash
# Установка Seismic development tools
curl -L -H "Accept: application/vnd.github.v3.raw" \
  "https://api.github.com/repos/SeismicSystems/seismic-foundry/contents/sfoundryup/install?ref=seismic" | bash

# Подключение к Seismic devnet
# Развертывание реальных зашифрованных контрактов
```

**Требования:**
- ✅ Seismic devnet доступен
- ✅ sfoundryup development tools
- ❌ Intel TDX cloud infrastructure 
- ❌ Production-ready encrypted types

#### **Phase 2: Intel TDX Infrastructure (Q3-Q4 2025)**
```bash
# Cloud providers с TDX поддержкой:
- Azure Confidential Computing (TDX preview)
- AWS Nitro Enclaves (планируется TDX)
- Google Cloud Confidential VMs
```

**Требования:**
- ⏳ TDX cloud availability
- ⏳ Seismic mainnet launch
- ⏳ Production security audits

#### **Phase 3: Real Encrypted Applications (2026)**
```solidity
// Реальные зашифрованные типы в production
pragma solidity ^0.8.0;

contract RealEncryptedVoting {
    saddress private voter;
    suint32 private encryptedVote;  // Реально зашифровано!
    sbool private hasVoted;
    
    function castVote(suint32 _vote) public {
        // Реальное шифрование на Intel TDX
        encryptedVote = _vote;
        voter = saddress(msg.sender);
        hasVoted = true;
    }
}
```

### 🛠️ Технические препятствия

#### **1. Intel TDX Limitations**
- **Side-channel атаки**: Heckler, memory blocking
- **Hardware dependencies**: Специальные CPU
- **Trust assumptions**: Intel as root of trust

#### **2. Seismic Development Status**
- **v0 release**: Только storage encryption
- **Missing features**: Full memory encryption, UX optimizations
- **Performance**: "Default all encrypted" affects speed

#### **3. Infrastructure Costs**
```bash
# Примерная стоимость TDX infrastructure:
# Azure Confidential Computing: $0.50-2.00/hour
# Специализированные TDX instances: $1000-5000/month
# Development setup: Требует dedicated hardware
```

### 📋 Immediate Next Steps

**Для подготовки к реальному Seismic:**

1. **Seismic Devnet Testing**
   ```bash
   # Тестирование на Seismic devnet
   git clone https://github.com/SeismicSystems/try-devnet.git
   cd try-devnet
   bash script/deploy.sh
   ```

2. **Intel TDX Research**
   - Изучение TDX security model
   - Тестирование на TDX-enabled cloud
   - Анализ side-channel mitigations

3. **Application Architecture**
   - Подготовка к hybrid encrypted/transparent data
   - Оптимизация для TDX performance constraints
   - Planning for secure key management

### 🎯 **Вывод**

**Эмуляция VS Реальность:**
- ✅ **Сейчас**: Типобезопасная эмуляция для изучения концепций
- ⏳ **2025**: Seismic devnet для тестирования
- 🎯 **2026**: Production-ready зашифрованные dApps

**Наша демо-приложение** - отличная подготовка к будущему, где пользователи смогут реально шифровать данные на блокчейне! 