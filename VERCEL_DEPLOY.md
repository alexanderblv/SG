# 🚀 Деплой Seismic Game на Vercel

Теперь приложение переделано с CDN на полноценное React приложение с Privy SDK v2.13.0.

## 📁 Структура проекта

```
SGnew/
├── public/
│   └── index.html          # HTML шаблон
├── app.js                  # Главный React компонент
├── seismic-config.js       # Конфигурация Privy и Seismic
├── seismic-sdk.js          # SDK для работы с блокчейном
├── style.css               # Стили
├── package.json            # Зависимости React и Privy
├── webpack.config.js       # Конфигурация сборщика
└── vercel.json             # Конфигурация Vercel

```

## 🔧 Настройка Vercel

1. **Подключите репозиторий к Vercel:**
   - Зайдите на [vercel.com](https://vercel.com)
   - Выберите "New Project"
   - Импортируйте ваш GitHub репозиторий

2. **Настройки проекта в Vercel:**
   ```
   Framework Preset: Other
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Environment Variables в Vercel:**
   ```
   PRIVY_APP_ID=cmbhhu8sr00mojr0l66siei2z
   NODE_VERSION=18
   ```

## 📦 Зависимости

В `package.json` указаны все необходимые зависимости:
- React 18.2.0
- @privy-io/react-auth v2.13.0
- ethers v6.7.1
- webpack и babel для сборки

## 🏗️ Процесс сборки

Vercel автоматически:
1. Установит Node.js 18
2. Запустит `npm install`
3. Выполнит `npm run build` (webpack сборка)
4. Развернет содержимое папки `dist/`

## 🔐 Особенности Privy SDK v2.13.0

- ✅ Использует официальный React SDK
- ✅ Поддержка всех современных кошельков
- ✅ Встроенные кошельки Privy
- ✅ Email авторизация
- ✅ Правильная работа с Seismic Devnet

## 🌐 После деплоя

После успешного деплоя:
1. Откройте приложение по URL от Vercel
2. Нажмите "Подключить кошелек"
3. Выберите MetaMask или другой кошелек
4. Добавьте Seismic Devnet в кошелек
5. Получите тестовые токены с фосета

## 🐛 Решение проблем

Если есть ошибки сборки в Vercel:
1. Проверьте логи сборки в панели Vercel
2. Убедитесь что все зависимости корректны
3. Проверьте версию Node.js (должна быть 18+)

## 🔗 Полезные ссылки

- [Seismic Faucet](https://faucet-2.seismicdev.net/)
- [Seismic Explorer](https://explorer-2.seismicdev.net/)
- [Privy Documentation](https://docs.privy.io/)
- [Vercel Documentation](https://vercel.com/docs) 