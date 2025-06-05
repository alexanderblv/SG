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

// Конфигурация для Privy
export const privyConfig = {
  appearance: {
    accentColor: '#6A6FF5',
    theme: 'light',
    showWalletLoginFirst: false,
    logo: 'https://your-logo-url.com/logo.png',
  },
  loginMethods: ['wallet', 'email'],
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    requireUserPasswordOnCreate: false,
    showWalletUIs: true,
  },
  defaultChain: seismicNetwork,
  supportedChains: [seismicNetwork],
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