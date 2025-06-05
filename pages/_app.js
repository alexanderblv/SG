import { PrivyProvider } from '@privy-io/react-auth';
import '../styles/globals.css';

// Конфигурация Seismic Network
const seismicNetwork = {
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
  },
  blockExplorers: {
    default: { 
      name: 'Seismic Explorer', 
      url: 'https://explorer-2.seismicdev.net/' 
    },
  },
  testnet: true,
};

// Конфигурация Privy
const privyConfig = {
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
  externalWallets: {
    metamask: true,
    // Отключаем кошельки, которые не поддерживают Seismic Devnet
    coinbaseWallet: false, // Не поддерживает кастомные devnet сети
    walletConnect: true,
    rainbow: true,
  },
  chains: [seismicNetwork],
  // Принудительно переключать на Seismic при подключении
  chainConfig: {
    [seismicNetwork.id]: {
      rpcTarget: seismicNetwork.rpcUrls.default.http[0],
      chainId: seismicNetwork.id,
      networkName: seismicNetwork.name,
      blockExplorer: seismicNetwork.blockExplorers.default.url,
      ticker: seismicNetwork.nativeCurrency.symbol,
      tickerName: seismicNetwork.nativeCurrency.name,
    },
  },
  mfaConfig: {
    noPromptOnMfaRequired: true,
  },
  // Удаляем WalletConnect project ID чтобы избежать ошибок API
  // walletConnectCloudProjectId: 'your-project-id-here', 
  // Конфигурация для предотвращения конфликтов кошельков
  walletConnectV2Config: {
    projectId: undefined, // Отключаем WalletConnect v2 для избежания конфликтов
  },
};

function MyApp({ Component, pageProps }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmbhhu8sr00mojr0l66siei2z';
  
  return (
    <PrivyProvider
      appId={appId}
      config={privyConfig}
    >
      <Component {...pageProps} />
    </PrivyProvider>
  );
}

export default MyApp; 