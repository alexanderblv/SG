// Конфигурация Seismic Devnet
export const seismicNetwork = {
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
    webSocket: { ws: ['wss://node-2.seismicdev.net/ws'] },
  },
  blockExplorers: {
    default: { 
      name: 'Seismic Explorer', 
      url: 'https://explorer-2.seismicdev.net/' 
    },
  },
  testnet: true,
};

// Настройки Privy App
export const PRIVY_APP_ID = 'cmbhhu8sr00mojr0l66siei2z';

// Конфигурация для Privy v2.13.0
export const privyConfig = {
  appearance: {
    accentColor: '#6A6FF5',
    theme: 'light',
    showWalletLoginFirst: true,
    logo: 'https://docs.privy.io/img/logo.svg',
    walletChainType: 'ethereum-only',
  },
  loginMethods: ['wallet', 'email'],
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    requireUserPasswordOnCreate: false,
    showWalletUIs: true,
  },
  defaultChain: seismicNetwork,
  supportedChains: [seismicNetwork],
  // Включаем внешние кошельки
  externalWallets: {
    metamask: true,
    coinbaseWallet: true,
    walletConnect: true,
    rainbow: true,
  },
};

// Дополнительные константы
export const FAUCET_URL = 'https://faucet-2.seismicdev.net/';
export const EXPLORER_URL = 'https://explorer-2.seismicdev.net/';

// Конфигурация зашифрованных типов данных
export const ENCRYPTED_TYPES = {
  SUINT: 'suint',
  SADDRESS: 'saddress',
  SBOOL: 'sbool',
}; 