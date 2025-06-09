# 🌊 Seismic Experience by alexanderblv

A modern Web3 application for interacting with the **Seismic Blockchain** through **Privy React SDK** with automatic network switching and integrated resources.

![Seismic Game](https://img.shields.io/badge/Blockchain-Seismic-blue)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB)
![Privy](https://img.shields.io/badge/Privy-1.82.4-6A6FF5)
![Next.js](https://img.shields.io/badge/Next.js-14.0.0-000000)

## ✨ Key Features

- 🔗 **Automatic Seismic Connection** - app automatically switches wallet to Seismic Network
- 🌐 **Reliable Seismic Integration** (Chain ID: 5124) with constant network monitoring
- 💼 **All Wallet Support**: MetaMask, Coinbase Wallet, WalletConnect, Rainbow
- 🚰 **Built-in Resource Links**: faucet for test tokens, explorer, documentation
- 📧 **Email-based wallets** - Privy embedded wallets
- 💸 **Transaction Sending** with real-time status tracking
- 🔐 **Seismic Encryption Types** - demonstration of encrypted data types
- 📱 **Responsive Design** for all devices
- ⚡ **One-click Vercel Deployment**

## 🚀 Quick Start

### Deploy to Vercel

1. **Fork this repository**
2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variable:
     ```
     NEXT_PUBLIC_PRIVY_APP_ID=cmbhhu8sr00mojr0l66siei2z
     ```
   - Click "Deploy"

3. **Done!** Your app will be available at `your-project.vercel.app`

### Local Development

```bash
# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_PRIVY_APP_ID=cmbhhu8sr00mojr0l66siei2z" > .env.local

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🌐 Seismic Network Integration

### Automatic Setup
The application automatically:
- ✅ Detects wallet's current network
- ✅ Switches to Seismic Network on connection
- ✅ Monitors network changes in real-time
- ✅ Provides manual switch buttons

### Network Configuration
```javascript
Seismic Devnet
├── Chain ID: 5124
├── RPC URL: https://node-2.seismicdev.net/rpc
├── Currency: SETH (Seismic ETH)
├── Explorer: https://explorer-2.seismicdev.net/
└── Faucet: https://faucet-2.seismicdev.net/
```

### Built-in Resources
- 🚰 **Faucet**: [https://faucet-2.seismicdev.net/](https://faucet-2.seismicdev.net/) - get test tokens
- 🔍 **Explorer**: [https://explorer-2.seismicdev.net/](https://explorer-2.seismicdev.net/) - view transactions
- 📚 **Documentation**: [https://docs.seismic.systems/](https://docs.seismic.systems/)
- 🛠 **Devnet Guide**: [https://docs.seismic.systems/appendix/devnet](https://docs.seismic.systems/appendix/devnet)

## 🛠 Technology Stack

- **Frontend**: Next.js 14, React 18
- **Wallet Integration**: Privy React SDK with extended configuration
- **Blockchain**: Ethers.js v6 with automatic network monitoring
- **Styling**: CSS3 with responsive design and dark Seismic theme
- **Network**: Automatic switching and network management
- **Deployment**: Vercel with optimized configuration

## 📋 Functionality

### Wallet Connection
- ✅ MetaMask (recommended)
- ✅ Coinbase Wallet
- ✅ WalletConnect
- ✅ Rainbow Wallet
- ✅ Privy embedded wallets

### Seismic Network Features
- 🔄 **Automatic switching** to Seismic on connection
- 🌐 **Real-time network monitoring**
- ⚠️ **Wrong network warnings**
- 🚰 **Direct faucet links** for test tokens
- 📊 **Information dashboard** with network details

### Blockchain Operations
- 💰 View SETH balance
- 📤 Send transactions on Seismic only
- 🔐 Demo encrypted data types (suint, saddress, sbool)
- 📊 Transaction history with detailed information
- 🔄 Automatic status updates

## 🎯 Usage

1. **Connect** by clicking "Connect Wallet"
2. **Automatic switch** to Seismic Network (or use Switch button)
3. **Get test tokens** through built-in faucet link
4. **Send transactions** with optional encryption
5. **Experiment** with encrypted data types
6. **Track** real-time history

## 🔧 Privy Configuration

```javascript
// Extended configuration for Seismic
const privyConfig = {
  appearance: {
    accentColor: '#6A6FF5',
    theme: 'light',
    showWalletLoginFirst: true,
  },
  loginMethods: ['wallet', 'email'],
  defaultChain: seismicNetwork,
  supportedChains: [seismicNetwork], // Seismic only
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

## 📁 Project Structure

```
seismic-experience/
├── pages/
│   ├── _app.js          # Privy Provider with Seismic configuration
│   └── index.js         # Main page with automatic switching
├── styles/
│   └── globals.css      # Styles with Seismic theme
├── SEISMIC_SETUP.md     # Seismic setup instructions
├── package.json         # Dependencies
├── next.config.js       # Next.js configuration
├── vercel.json          # Vercel settings
└── README.md
```

## 🚰 Getting Test Tokens

After connecting to Seismic Network:

1. **Copy** wallet address from the app
2. **Go to** [faucet](https://faucet-2.seismicdev.net/)
3. **Paste** address and request tokens
4. **Wait** for SETH to arrive in balance

💡 The app has direct faucet link and low balance warnings!

## 🔑 Environment Variables

```bash
# Required
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Optional (already configured)
NEXT_PUBLIC_SEISMIC_RPC_URL=https://node-2.seismicdev.net/rpc
NEXT_PUBLIC_SEISMIC_EXPLORER_URL=https://explorer-2.seismicdev.net/
NEXT_PUBLIC_SEISMIC_CHAIN_ID=5124
```

## 🐛 Troubleshooting

### ⚠️ WALLET SECURITY

**⚠️ ВАЖНО: Проблемы с поддельными кошельками Rabby**

Если при подключении кошелька Rabby появляется диалог с подозрительным прокси-сервером (например, `zagent802.kbz0pixvxmv.com:22222`), это означает поддельную версию кошелька. **НЕ ВВОДИТЕ** данные!

- 📖 **Полное руководство**: [WALLET_SECURITY_GUIDE.md](WALLET_SECURITY_GUIDE.md)
- 🔧 **Технические проблемы**: [WALLET_TROUBLESHOOTING.md](WALLET_TROUBLESHOOTING.md)
- ✅ **Рекомендация**: Используйте MetaMask для максимальной безопасности

### Common Issues

1. **Wallet won't connect**
   - Ensure MetaMask is installed
   - Check correct Privy App ID

2. **Transactions won't send**
   - Check SETH balance
   - Verify recipient address is correct

3. **Balance not showing**
   - Check Seismic RPC connection
   - Refresh the page

## 📈 Monitoring

Vercel dashboard provides:
- 📊 Performance analytics
- 📋 Deployment logs
- 🔍 Real-time functions
- 📱 Mobile optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Create a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE)

## 🔗 Useful Links

- [Privy Documentation](https://docs.privy.io/)
- [Seismic Network](https://explorer-2.seismicdev.net/)
- [Vercel Deployment](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

**🎮 Start playing on Seismic right now!**

## 🔐 Encrypted Data Types Demo (suint, saddress, sbool)

### ✨ New Features: Type-Safe Encryption

The application now supports **type-safe data encryption** according to [Seismic](https://docs.seismic.systems/) specifications:

#### Supported Encrypted Types:

- **`suint8`** - Encrypted 8-bit integer (0-255)
- **`suint16`** - Encrypted 16-bit integer (0-65,535)
- **`suint32`** - Encrypted 32-bit integer (0-4,294,967,295)
- **`saddress`** - Encrypted Ethereum address (format: 0x + 40 hex characters)
- **`sbool`** - Encrypted boolean value (true/false)

#### Validation Functions:

✅ **Real-time type checking** - input data validated according to type specification
✅ **Automatic encoding** - values encoded according to Seismic protocol
✅ **Visual feedback** - users see validation errors and hints
✅ **Type safety** - impossible to encrypt data with wrong type

#### Usage Example:

```javascript
// For suint8: only numbers from 0 to 255
Input: "42" → Encoded: "0x2a" → Encrypted: "0x..." (TDX)

// For saddress: only valid Ethereum addresses
Input: "0x742d35Cc..." → Encoded: "0x742d35cc..." → Encrypted: "0x..." (TDX)

// For sbool: only true/false
Input: "true" → Encoded: "0x01" → Encrypted: "0x..." (TDX)
```

#### Technical Improvements:

- **Input validation** before encryption
- **Proper encoding** according to Seismic specifications
- **Informative result display** with type details
- **Auto-clearing fields** when changing encryption type
- **Improved UX** with hints and examples

### TDX Secure Enclaves Integration

All encrypted types use **Intel TDX** secure enclaves for confidentiality according to Seismic architecture.

## 🚀 Transition to Real Seismic Blockchain

### 🎯 Roadmap: From Emulation to Production

Current implementation is a **type-safe emulation** of Seismic encrypted types. Here's the plan for transitioning to real blockchain:

#### **Phase 1: Seismic Devnet Integration (Q2 2025)**
```bash
# Install Seismic development tools
curl -L -H "Accept: application/vnd.github.v3.raw" \
  "https://api.github.com/repos/SeismicSystems/seismic-foundry/contents/sfoundryup/install?ref=seismic" | bash

# Connect to Seismic devnet
# Deploy real encrypted contracts
```

**Requirements:**
- ✅ Seismic devnet available
- ✅ sfoundryup development tools
- ❌ Intel TDX cloud infrastructure
- ❌ Production-ready encrypted types

#### **Phase 2: Intel TDX Infrastructure (Q3-Q4 2025)**
```bash
# Cloud providers with TDX support:
- Azure Confidential Computing (TDX preview)
- AWS Nitro Enclaves (TDX planned)
- Google Cloud Confidential VMs
```

**Requirements:**
- ⏳ TDX cloud availability
- ⏳ Seismic mainnet launch
- ⏳ Production security audits

#### **Phase 3: Real Encrypted Applications (2026)**
```solidity
// Real encrypted types in production
pragma solidity ^0.8.0;

contract RealEncryptedVoting {
    saddress private voter;
    suint32 private encryptedVote;  // Really encrypted!
    sbool private hasVoted;
    
    function castVote(suint32 _vote) public {
        // Real encryption on Intel TDX
        encryptedVote = _vote;
        voter = saddress(msg.sender);
        hasVoted = true;
    }
}
```

### 🛠️ Technical Obstacles

#### **1. Intel TDX Limitations**
- **Side-channel attacks**: Heckler, memory blocking
- **Hardware dependencies**: Special CPUs required
- **Trust assumptions**: Intel as root of trust

#### **2. Seismic Development Status**
- **v0 release**: Storage encryption only
- **Missing features**: Full memory encryption, UX optimizations
- **Performance**: "Default all encrypted" affects speed

#### **3. Infrastructure Costs**
```bash
# Estimated TDX infrastructure costs:
# Azure Confidential Computing: $0.50-2.00/hour
# Specialized TDX instances: $1000-5000/month
# Development setup: Requires dedicated hardware
```

### 📋 Immediate Next Steps

**To prepare for real Seismic:**

1. **Seismic Devnet Testing**
   ```bash
   # Test on Seismic devnet
   git clone https://github.com/SeismicSystems/try-devnet.git
   cd try-devnet
   bash script/deploy.sh
   ```

2. **Intel TDX Research**
   - Study TDX security model
   - Test on TDX-enabled cloud
   - Analyze side-channel mitigations

3. **Application Architecture**
   - Prepare for hybrid encrypted/transparent data
   - Optimize for TDX performance constraints
   - Plan secure key management

### 🎯 **Conclusion**

**Emulation VS Reality:**
- ✅ **Now**: Type-safe emulation for learning concepts
- ⏳ **2025**: Seismic devnet for testing
- 🎯 **2026**: Production-ready encrypted dApps

**Our demo application** is excellent preparation for the future where users can really encrypt data on blockchain!

---

## 👨‍💻 Author

**alexanderblv**

- 📁 **GitHub**: [https://github.com/alexanderblv/Seismic-Experience](https://github.com/alexanderblv/Seismic-Experience)
- 🐦 **X (Twitter)**: [https://x.com/alexanderblv](https://x.com/alexanderblv)

---

*Built with ❤️ for the Seismic blockchain ecosystem* 