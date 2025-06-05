# 🔧 Настройка Privy Dashboard для Seismic Game

## 📋 Данные вашего приложения

- **App ID**: `cmbhhu8sr00mojr0l66siei2z`
- **App Secret**: `3xmfFV1jwUUfcmcy1S474CtmUm4i6WnEP5NaoXLHHSeh4kA1U8BxUisNWGCRBvN2cehuDaTj7JyxoeB7GL1gkWXH`

## 🌐 Настройка домена

### 1. Перейдите в Privy Dashboard
- Откройте [dashboard.privy.io](https://dashboard.privy.io)
- Войдите в ваш аккаунт
- Выберите приложение с ID `cmbhhu8sr00mojr0l66siei2z`

### 2. Добавьте домены
В разделе **Settings > Domains** добавьте следующие домены:

#### Для разработки:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:8000`

#### Для Vercel deployment:
- `https://your-app-name.vercel.app` (замените на ваш URL)
- `https://sg-new-*vercel.app` (если используете автогенерированные URL)

### 3. Настройте Redirect URLs
В разделе **Authentication > Redirect URLs** добавьте:
- `http://localhost:3000`
- `https://your-app-name.vercel.app`

## ⚙️ Конфигурация приложения

### 1. Login Methods (Методы входа)
В разделе **Authentication > Login Methods** включите:
- ✅ **Wallet** (основной метод)
- ✅ **Email** (дополнительный)
- ✅ **External Wallets**: MetaMask, WalletConnect, Coinbase Wallet

### 2. Embedded Wallets (Встроенные кошельки)
В разделе **Wallets > Embedded Wallets**:
- ✅ **Create on login**: `users-without-wallets`
- ✅ **Show wallet UIs**: Enabled
- ❌ **Require user password**: Disabled для простоты

### 3. Supported Chains (Поддерживаемые сети)
В разделе **Wallets > Supported Chains** добавьте Seismic Network:

```json
{
  "id": 5124,
  "name": "Seismic Devnet",
  "network": "seismic-devnet",
  "nativeCurrency": {
    "name": "Seismic ETH",
    "symbol": "SETH",
    "decimals": 18
  },
  "rpcUrls": {
    "default": {
      "http": ["https://node-2.seismicdev.net/rpc"]
    },
    "public": {
      "http": ["https://node-2.seismicdev.net/rpc"]
    }
  },
  "blockExplorers": {
    "default": {
      "name": "Seismic Explorer",
      "url": "https://explorer-2.seismicdev.net/"
    }
  },
  "testnet": true
}
```

### 4. Wallet List Configuration
В разделе **Wallets > Wallet List** включите:
- ✅ MetaMask
- ✅ WalletConnect
- ✅ Coinbase Wallet
- ✅ Rainbow
- ✅ Injected wallets

### 5. Theme & Appearance
В разделе **Settings > Appearance**:
- **Logo**: Можете добавить свой логотип
- **Accent Color**: `#6A6FF5` (или ваш цвет)
- **Theme**: `light`
- **Show wallet login first**: `true`

## 🔐 Безопасность

### 1. CORS Settings
Убедитесь, что CORS настроен правильно:
- Добавлены все ваши домены
- Включены proper headers для cross-origin requests

### 2. Environment Variables
**НЕ РАЗМЕЩАЙТЕ** App Secret в frontend коде!
App Secret должен использоваться только на backend/server-side.

В frontend используйте только:
```javascript
const PRIVY_APP_ID = 'cmbhhu8sr00mojr0l66siei2z';
```

## 🧪 Тестирование интеграции

### 1. Локальное тестирование
```bash
# Запустите локальный сервер
npx http-server . -p 3000 -o

# Или используйте любой другой local server
python -m http.server 3000
```

### 2. Проверьте функциональность:
- ✅ Подключение MetaMask
- ✅ Авторизация через email
- ✅ Создание embedded wallet
- ✅ Отправка транзакций на Seismic Devnet
- ✅ Отображение баланса
- ✅ История транзакций

### 3. Vercel Deployment
```bash
# Deploy на Vercel
vercel --prod

# Обновите домены в Privy Dashboard с новым URL
```

## 🐛 Решение проблем

### Ошибки подключения:
1. **"Invalid domain"** - Проверьте что домен добавлен в Dashboard
2. **"CORS error"** - Убедитесь что CORS настроен правильно
3. **"Network not found"** - Добавьте Seismic Network в supported chains

### Отладка:
1. Откройте Developer Tools (F12)
2. Перейдите в Console
3. Проверьте ошибки JavaScript
4. Убедитесь что Privy SDK загружается

### Полезные команды:
```javascript
// В консоли браузера проверьте:
console.log(window.PrivyReactAuth); // Должен показать объект Privy
console.log(user); // Информация о пользователе
console.log(wallets); // Подключенные кошельки
```

## 📞 Поддержка

- **Privy Documentation**: https://docs.privy.io/
- **Privy Discord**: https://discord.gg/privy
- **Seismic Network Docs**: https://explorer-2.seismicdev.net/

## ✅ Чек-лист финальной проверки

- [ ] App ID настроен правильно
- [ ] Домены добавлены в Dashboard
- [ ] Seismic Network добавлена в supported chains  
- [ ] Login methods настроены
- [ ] Embedded wallets включены
- [ ] CORS настроен
- [ ] Локальное тестирование прошло успешно
- [ ] Vercel deployment работает
- [ ] Подключение кошелька функционирует
- [ ] Транзакции отправляются успешно

После завершения всех настроек ваше приложение должно полностью работать с реальным подключением кошелька через Privy! 