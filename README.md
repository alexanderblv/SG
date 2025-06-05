# 🌊 Seismic Game - Wallet Connection

Современное Web3 приложение для подключения кошелька через **Privy React SDK** и взаимодействия с **Seismic Blockchain**.

![Seismic Game](https://img.shields.io/badge/Blockchain-Seismic-blue)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB)
![Privy](https://img.shields.io/badge/Privy-1.82.4-6A6FF5)
![Next.js](https://img.shields.io/badge/Next.js-14.0.0-000000)

## ✨ Особенности

- 🔗 **Простое подключение кошелька** через Privy React SDK
- 🌐 **Поддержка Seismic Network** (Chain ID: 5124)
- 💼 **Множественные кошельки**: MetaMask, Coinbase Wallet, WalletConnect, Rainbow
- 📧 **Email-based wallets** - встроенные кошельки Privy
- 💸 **Отправка транзакций** с отслеживанием статуса
- 🔐 **Seismic Encryption** (опционально)
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

## 🛠 Технологический стек

- **Frontend**: Next.js 14, React 18
- **Wallet Integration**: Privy React SDK
- **Blockchain**: Ethers.js v6
- **Styling**: CSS3 с адаптивным дизайном
- **Deployment**: Vercel

## 🌐 Конфигурация сети

```javascript
Seismic Devnet
├── Chain ID: 5124
├── RPC URL: https://node-2.seismicdev.net/rpc
├── Currency: SETH (Seismic ETH)
└── Explorer: https://explorer-2.seismicdev.net/
```

## 📋 Функциональность

### Подключение кошелька
- ✅ MetaMask
- ✅ Coinbase Wallet
- ✅ WalletConnect
- ✅ Rainbow Wallet
- ✅ Встроенные кошельки Privy

### Операции с блокчейном
- 💰 Просмотр баланса
- 📤 Отправка транзакций
- 📊 История транзакций
- 🔄 Автоматическое обновление статуса

## 🎯 Использование

1. **Подключитесь** нажав "Connect Wallet"
2. **Выберите кошелек** (MetaMask рекомендуется)
3. **Подтвердите** подключение к Seismic Network
4. **Отправляйте транзакции** на другие адреса
5. **Отслеживайте** историю в реальном времени

## 🔧 Конфигурация Privy

```javascript
// Основные настройки
const privyConfig = {
  appearance: {
    accentColor: '#6A6FF5',
    theme: 'light',
    showWalletLoginFirst: true,
  },
  loginMethods: ['wallet', 'email'],
  defaultChain: seismicNetwork,
  externalWallets: {
    metamask: true,
    coinbaseWallet: true,
    walletConnect: true,
    rainbow: true,
  },
};
```

## 📁 Структура проекта

```
seismic-game/
├── pages/
│   ├── _app.js          # Privy Provider
│   └── index.js         # Главная страница
├── styles/
│   └── globals.css      # Стили
├── package.json         # Зависимости
├── next.config.js       # Конфигурация Next.js
├── vercel.json          # Настройки Vercel
└── README.md
```

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