# 🌊 Seismic Game - Блокчейн Приложение

> Современное блокчейн-приложение с интеграцией **Privy React Auth SDK** и **Seismic Devnet**

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Privy](https://img.shields.io/badge/Privy-1.69.0-purple)](https://privy.io)
[![Ethers](https://img.shields.io/badge/Ethers.js-6.7.1-orange)](https://ethers.org/)

## 📋 Описание

**Seismic Game** - это веб-приложение нового поколения, объединяющее современные технологии Web3 с удобным пользовательским интерфейсом. Приложение поддерживает:

- 🔐 **Аутентификацию через Privy** - email или Web3 кошельки
- 🌐 **Интеграцию с Seismic Devnet** - кастомной EVM сетью
- 🔒 **Зашифрованные транзакции** - полная конфиденциальность операций
- 📱 **Адаптивный дизайн** - работает на всех устройствах
- ⚡ **Мгновенное развертывание** - готово к использованию

## 🚀 Быстрый старт

### 1. Клонирование репозитория
```bash
git clone https://github.com/yourusername/seismic-game.git
cd seismic-game
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка Privy App ID
Отредактируйте `index.html` и замените `appId` на ваш:
```javascript
const privyConfig = {
    appId: 'YOUR_PRIVY_APP_ID', // Замените на ваш App ID
    // ...
};
```

### 4. Запуск приложения

#### CDN версия (рекомендуется)
```bash
npm run serve
```
Приложение будет доступно по адресу `http://localhost:3000`

#### Webpack версия для разработки
```bash
npm run dev
```

## 🏗️ Архитектура

### 📁 Структура файлов

```
seismic-game/
├── 📄 index.html              # Главная CDN версия
├── 📄 package.json            # NPM зависимости
├── 📄 vercel.json            # Конфигурация Vercel
├── 🎨 style.css              # Основные стили
├── ⚙️ seismic-config.js      # Конфигурация сети
├── 🔧 seismic-sdk.js         # SDK для работы с блокчейном
└── 📚 README.md              # Документация
```

### 🔧 Технологический стек

| Компонент | Технология | Версия | Назначение |
|-----------|------------|---------|------------|
| **Frontend** | React | 18.2.0 | Пользовательский интерфейс |
| **Auth** | Privy React Auth | 1.69.0 | Аутентификация |
| **Blockchain** | Ethers.js | 6.7.1 | Взаимодействие с блокчейном |
| **Styling** | Bootstrap + CSS3 | 5.3.0 | Стилизация |
| **Build** | Babel Standalone | Latest | Транспиляция JSX |

## 🌐 Seismic Devnet

### Параметры сети
- **Chain ID**: `5124`
- **RPC URL**: `https://node-2.seismicdev.net/rpc`
- **WebSocket**: `wss://node-2.seismicdev.net/ws`
- **Explorer**: `https://explorer-2.seismicdev.net/`
- **Faucet**: `https://faucet-2.seismicdev.net/`

### Добавление сети в MetaMask
```javascript
{
  chainId: '0x1404',
  chainName: 'Seismic Devnet',
  nativeCurrency: {
    name: 'Seismic ETH',
    symbol: 'SETH',
    decimals: 18
  },
  rpcUrls: ['https://node-2.seismicdev.net/rpc'],
  blockExplorerUrls: ['https://explorer-2.seismicdev.net/']
}
```

## 🔐 Аутентификация с Privy

### Поддерживаемые методы входа
1. **📧 Email** - получение OTP кода на почту
2. **👛 Внешние кошельки** - MetaMask, WalletConnect, Phantom
3. **🔐 Встроенные кошельки** - создаются автоматически

### Конфигурация
```javascript
const privyConfig = {
  appId: 'YOUR_APP_ID',
  config: {
    appearance: {
      accentColor: '#6A6FF5',
      theme: 'light',
      showWalletLoginFirst: false,
    },
    loginMethods: ['wallet', 'email'],
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
      requireUserPasswordOnCreate: false,
      showWalletUIs: true,
    },
    defaultChain: seismicNetwork,
    supportedChains: [seismicNetwork],
  }
};
```

## 🔒 Зашифрованные транзакции

### Поддерживаемые типы данных
- **`suint`** - зашифрованные unsigned integers
- **`saddress`** - зашифрованные адреса Ethereum
- **`sbool`** - зашифрованные boolean значения

### Пример отправки
```javascript
const encryptedData = {
  value: 100,
  recipient: '0x742d35Cc6635C0532925a3b8D3Ac27FAACE6547'
};

await seismicSDK.sendEncryptedTransaction({
  to: contractAddress,
  encryptedData,
  type: 'suint'
});
```

## 🎮 Функциональность

### Основные возможности
- ✅ **Подключение кошельков** - через Privy Auth
- ✅ **Проверка баланса** - в реальном времени
- ✅ **Отправка транзакций** - обычных и зашифрованных
- ✅ **История операций** - локальное сохранение
- ✅ **Информация о сети** - блоки, gas price
- 🔄 **Игровые функции** - в разработке

### Интерфейс пользователя
- 📱 **Адаптивный дизайн** - работает на всех устройствах
- 🎨 **Современный UI** - градиенты, анимации, тени
- ⚡ **Быстрая загрузка** - оптимизированные ресурсы
- 🌙 **Темная тема** - настраивается через Privy

## 📦 Развертывание

### Vercel (рекомендуется)
1. Подключите репозиторий к Vercel
2. Настройте переменные окружения
3. Деплой происходит автоматически

### Другие платформы
```bash
# Сборка для продакшена
npm run build

# Запуск статического сервера
npm run serve
```

## ⚙️ Настройка

### Переменные окружения
Создайте файл `.env` (опционально):
```env
PRIVY_APP_ID=your_privy_app_id
SEISMIC_RPC_URL=https://node-2.seismicdev.net/rpc
```

### Кастомизация стилей
Отредактируйте `style.css` для изменения внешнего вида:
```css
:root {
  --primary-color: #6A6FF5;
  --secondary-color: #4F46E5;
  --background-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## 🛠️ Разработка

### Структура компонентов
```javascript
// Основные React компоненты
├── SeismicGameApp      # Главный компонент
├── UserInfo           # Информация о пользователе
├── GameActions        # Игровые действия
├── NetworkInfo        # Информация о сети
└── TransactionHistory # История транзакций
```

### API методы SDK
```javascript
// Инициализация
await seismicSDK.init(walletProvider);

// Отправка транзакции
await seismicSDK.sendTransaction({ to, value });

// Зашифрованная транзакция
await seismicSDK.sendEncryptedTransaction({ to, encryptedData, type });

// Получение баланса
const balance = await seismicSDK.getBalance(address);
```

## 🐛 Решение проблем

### Частые ошибки

#### 1. Приложение не загружается
```bash
# Проверьте консоль браузера
# Убедитесь, что все CDN ресурсы доступны
# Проверьте CORS настройки
```

#### 2. Ошибка подключения к Privy
```javascript
// Проверьте правильность App ID
// Убедитесь, что домен добавлен в Privy Dashboard
```

#### 3. Проблемы с сетью
```javascript
// Проверьте доступность RPC эндпоинта
// Убедитесь в правильности Chain ID
```

## 🤝 Участие в разработке

### Требования для разработки
- Node.js 16+ 
- NPM 8+
- Современный браузер с поддержкой ES6+

### Процесс разработки
1. Форкните репозиторий
2. Создайте ветку для функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🔗 Полезные ссылки

- 📚 [Privy Documentation](https://docs.privy.io/)
- 🌐 [Seismic Explorer](https://explorer-2.seismicdev.net/)
- 🚰 [Seismic Faucet](https://faucet-2.seismicdev.net/)
- ⚛️ [React Documentation](https://reactjs.org/docs/)
- 🔗 [Ethers.js Docs](https://docs.ethers.org/)

## 📞 Поддержка

Если у вас есть вопросы или проблемы:
- 🐛 [Создайте Issue](https://github.com/yourusername/seismic-game/issues)
- 💬 [Обсуждения](https://github.com/yourusername/seismic-game/discussions)
- 📧 Email: support@seismicgame.dev

---

**Сделано с ❤️ командой Seismic Game** 