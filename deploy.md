# 🚀 Быстрое развертывание на Vercel

## 1. Загрузка на GitHub

```bash
git add .
git commit -m "Setup Next.js with Privy React SDK for Vercel deployment"
git push origin main
```

## 2. Развертывание на Vercel

1. Откройте [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите **"New Project"**
4. Выберите ваш репозиторий `SGnew`
5. Vercel автоматически определит Next.js
6. В разделе "Environment Variables" добавьте:
   ```
   NEXT_PUBLIC_PRIVY_APP_ID = cmbhhu8sr00mojr0l66siei2z
   ```
7. Нажмите **"Deploy"**

## 3. Результат

- ✅ Автоматическая установка зависимостей
- ✅ Компиляция Next.js приложения
- ✅ Развертывание с HTTPS
- ✅ Ваш сайт готов: `https://your-project.vercel.app`

## 4. Проверка функций

После развертывания проверьте:
- 🔗 Кнопка "Connect Wallet" работает
- 🦊 MetaMask подключается к Seismic Network
- 💰 Отображается баланс кошелька
- 📤 Можно отправлять транзакции

---

**⚡ Готово за 2 минуты!** 