# 🚀 Развертывание Seismic Game с Privy на Vercel

## 📋 Предварительные требования

1. **Privy App Configuration**
   - App ID: `cmbhhu8sr00mojr0l66siei2z`
   - App Secret: `3xmfFV1jwUUfcmcy1S474CtmUm4i6WnEP5NaoXLHHSeh4kA1U8BxUisNWGCRBvN2cehuDaTj7JyxoeB7GL1gkWXH`

2. **Seismic Network**
   - Chain ID: `5124`
   - RPC URL: `https://node-2.seismicdev.net/rpc`
   - Explorer: `https://explorer-2.seismicdev.net/`
   - Faucet: `https://faucet-2.seismicdev.net/`

## 🎯 Быстрое развертывание на Vercel

### Шаг 1: Подготовка проекта
```bash
# Клонируйте репозиторий
git clone <your-repository-url>
cd SGnew

# Убедитесь, что все файлы настроены
ls -la
```

### Шаг 2: Настройка Vercel
1. Зайдите на [vercel.com](https://vercel.com)
2. Подключите ваш GitHub репозиторий
3. Выберите проект `SGnew`

### Шаг 3: Конфигурация переменных окружения
В настройках Vercel добавьте следующие переменные:

```
PRIVY_APP_ID=cmbhhu8sr00mojr0l66siei2z
PRIVY_APP_SECRET=3xmfFV1jwUUfcmcy1S474CtmUm4i6WnEP5NaoXLHHSeh4kA1U8BxUisNWGCRBvN2cehuDaTj7JyxoeB7GL1gkWXH
```

### Шаг 4: Настройка Build Settings
- **Framework Preset**: Other
- **Build Command**: (оставить пустым)
- **Output Directory**: `.`
- **Install Command**: (оставить пустым)

### Шаг 5: Развертывание
Нажмите "Deploy" и дождитесь завершения развертывания.

## 🔧 Локальная разработка

### Используя простой HTTP сервер:
```bash
npx http-server . -p 3000 -o
```

### Используя Webpack (если нужны модификации):
```bash
npm install
npm run dev
```

## 🌐 Настройка домена и CORS

### Важные настройки для Privy:
1. **CORS Policy**: Убедитесь, что ваш домен добавлен в настройки Privy App
2. **HTTPS**: Privy требует HTTPS для production
3. **Domain Verification**: Добавьте ваш домен Vercel в Privy Dashboard

### Обновление домена в Privy:
1. Зайдите в [Privy Dashboard](https://dashboard.privy.io)
2. Выберите ваш App (`cmbhhu8sr00mojr0l66siei2z`)
3. В разделе "Domains" добавьте:
   - `https://your-app-name.vercel.app`
   - `https://your-custom-domain.com` (если используете)

## 🔐 Безопасность

### App Secret Protection:
- App Secret НЕ используется в frontend коде
- Храните App Secret только в Vercel Environment Variables
- Используйте только App ID в frontend части

### Network Security:
- Все транзакции проходят через Seismic Devnet
- Приватные ключи никогда не передаются на сервер
- Privy управляет безопасностью кошельков

## 🛠 Функциональность

### Текущие возможности:
- ✅ Подключение кошелька через Privy
- ✅ Авторизация через email или Web3 кошелек
- ✅ Отправка транзакций на Seismic Devnet
- ✅ Отображение баланса кошелька
- ✅ История транзакций
- ✅ Поддержка MetaMask, WalletConnect, и других кошельков

### Поддерживаемые кошельки:
- MetaMask
- WalletConnect
- Coinbase Wallet
- Rainbow
- Embedded Wallets (через Privy)

## 📱 Мобильная поддержка

Приложение полностью адаптивно и работает на:
- Desktop браузерах
- Mobile browsers
- Tablet устройствах

## 🐛 Отладка

### Проверка подключения:
1. Откройте Developer Tools (F12)
2. Перейдите в Console
3. Проверьте на ошибки связанные с:
   - Privy initialization
   - Network connection
   - Wallet connection

### Частые проблемы:
1. **Wallet not connecting**: Проверьте что домен добавлен в Privy Dashboard
2. **Network errors**: Убедитесь что Seismic RPC доступен
3. **Transaction failures**: Проверьте баланс и газ

## 📊 Мониторинг

### Vercel Analytics:
- Включите Vercel Analytics для мониторинга трафика
- Настройте Speed Insights для оптимизации производительности

### Privy Analytics:
- Доступны в Privy Dashboard
- Показывают статистику авторизаций и использования кошельков

## 🔄 Обновления

Для обновления приложения:
1. Внесите изменения в код
2. Commit и push в GitHub
3. Vercel автоматически пересоберет проект

## 📞 Поддержка

- **Privy Documentation**: https://docs.privy.io/
- **Seismic Network**: https://explorer-2.seismicdev.net/
- **Vercel Support**: https://vercel.com/support 