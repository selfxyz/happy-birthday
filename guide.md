# Happy Birthday Workshop Guide

## Overview
This guide walks through setting up a Self-powered birthday verification app that distributes USDC to users on their birthdays using passport verification.

**⚠️ Important Birthday Requirement:**
The app only works if your passport birthday is within ±1 day of the current date. For testing on **June 13, 2025**, your mock passport should have birthday: **June 12, 13, or 14** (any year).

## Prerequisites
- Node.js and Yarn installed
- Basic knowledge of blockchain/smart contracts
- Wallet for development (MetaMask recommended)
- **Ngrok installed** (Required for Self HTTPS integration)

## Project Structure
```
happy-birthday/
├── contracts/          # Smart contracts (Hardhat + Foundry)
├── frontend/           # Next.js frontend with Self integration
└── guide.md           # This workshop guide
```

## Step 1: Environment Setup

### 1.1 Generate Development Wallets
```bash
cd contracts
node -e "
const { ethers } = require('ethers');
const wallet1 = ethers.Wallet.createRandom();
const wallet2 = ethers.Wallet.createRandom();
console.log('Mainnet Wallet:', wallet1.address, wallet1.privateKey);
console.log('Testnet Wallet:', wallet2.address, wallet2.privateKey);
"
```

**Generated for this workshop:**
- **Testnet Wallet:** `0x289B7B7A15f0B696f1196017920eA895762f011c`
- **Private Key:** `0xf311943e171924876cdeba15b41ffab35cbedadf57257d823646655e6b2be341`

### 1.2 Fund Testnet Wallet
1. Visit: https://faucet.celo.org/
2. Enter testnet address: `0x289B7B7A15f0B696f1196017920eA895762f011c`
3. Request CELO tokens

**✅ Funding Transaction:** https://celo-alfajores.blockscout.com/tx/0x4915c1a05796ca96625e01a0f23acf2ffbe50d9ba4f70c8992b19519802988fa

### 1.3 Get Celoscan API Key
1. Visit: https://celoscan.io/
2. Create account and login
3. Go to API Keys section
4. Generate new API key

### 1.4 Configure contracts/.env
```env
CELO_RPC_URL=https://forno.celo.org
CELO_ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org

CELO_KEY=0xd3c8fecf3a37d69a82d2791166471404bda4ebd5789918a1c5fea4a55e3d80fc
CELO_ALFAJORES_KEY=0xf311943e171924876cdeba15b41ffab35cbedadf57257d823646655e6b2be341

CELOSCAN_API_KEY=KXY5UB7PIJGKF4RMV5VMPS2V4R5K8J67K6

# Optional
HASHED_SCOPE= # for foundry deploy scripts
```

## Step 2: Smart Contract Deployment

### 2.1 Install Dependencies
```bash
cd contracts
yarn install
```

### 2.2 Build Contracts
```bash
yarn run build
```

### 2.3 Deploy to Alfajores Testnet
```bash
yarn run deploy:alfajores
```

**✅ Deployed Contract:** `0x97d01A133c9Bfd77D6b7147d36bAA005b48735aa`

### 2.4 Verify Contract (Optional)
```bash
npx hardhat verify --network celoAlfajores 0x526c43A2Bc7BD48a79cC3675240F1C5d9E29e292 0x3e2487a250e2A7b56c7ef5307Fb591Cc8C83623D 15065635984636244078443599062577209723692558989588352658518612368087278169641 1 0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B
```

## Step 3: Frontend Setup

### 3.1 Configure frontend/.env
```env
PRIVATE_KEY=0xf311943e171924876cdeba15b41ffab35cbedadf57257d823646655e6b2be341
```

### 3.2 Update Contract Address
In `frontend/app/page.tsx`, update the endpoint:
```javascript
const selfApp = new SelfAppBuilder({
    appName: "Self Birthday",
    scope: "Self-Birthday-Example",
    endpoint: "0x97d01A133c9Bfd77D6b7147d36bAA005b48735aa", // Updated to our deployed contract
    endpointType: "staging_celo",
    // ... other config
});
```

### 3.3 Install Dependencies and Start
```bash
cd frontend
yarn install
yarn dev
```

**✅ Frontend running at:** http://localhost:3000

### 3.4 Set up Ngrok (Required for Self Integration)
Self requires HTTPS for the QR code flow. Use ngrok to create a secure tunnel:
```bash
ngrok http 3000
```
Use the HTTPS URL provided by ngrok (e.g., `https://xxxx.ngrok.app`) to access your app.

## Step 4: Testing the Application

### 4.1 Fund Contract with USDC ⚠️ CRITICAL STEP
The contract needs USDC to distribute to users. **Each claim pays 1 USDC.**

**Steps to Fund:**
1. **Get USDC from Circle Faucet:**
   - Visit: https://faucet.circle.com/
   - Select "Celo Alfajores" network
   - Enter your wallet: `0x289B7B7A15f0B696f1196017920eA895762f011c`
   - Request USDC tokens

2. **Send USDC to Contract:**
   - From: Your wallet `0x289B7B7A15f0B696f1196017920eA895762f011c`
   - To: Contract `0x97d01A133c9Bfd77D6b7147d36bAA005b48735aa`
   - Amount: 10-100 USDC (for multiple workshop participants)

**⚠️ The app will fail with "transfer amount exceeds balance" if contract has no USDC!**

### 4.2 Test Birthday Verification
1. **Access via ngrok:** Use your HTTPS ngrok URL (e.g., `https://xxxx.ngrok.app`)
2. **Enter wallet address:** `0x289B7B7A15f0B696f1196017920eA895762f011c`
3. **Scan QR code** with Self mobile app
4. **Complete passport verification** with mock passport
   - **Important:** Birthday must be June 12, 13, or 14 for testing on June 13, 2025
5. **Success:** You'll receive 1 USDC and see transaction link

## Key Components

### Smart Contract Features
- **Passport Verification:** Uses Self's verification hub
- **Birthday Window:** ±5 days from current date
- **USDC Distribution:** Configurable amounts
- **Staging Environment:** Uses mock passports for testing

### Frontend Features
- **ENS Support:** Resolves .eth names
- **Self QR Integration:** Seamless passport verification
- **Real-time Updates:** WebSocket connection to Self

### Self Integration
- **Staging Environment:** `staging_celo` for testing
- **Production Ready:** Switch to `celo` for mainnet
- **Passport Data:** Accesses date_of_birth securely

## Network Configuration

### Testnet (Current Setup)
- **Network:** Celo Alfajores
- **Chain ID:** 44787
- **RPC:** https://alfajores-forno.celo-testnet.org
- **USDC Token:** 0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B
- **Self Hub:** 0x3e2487a250e2A7b56c7ef5307Fb591Cc8C83623D (staging)

### Mainnet (Production)
- **Network:** Celo Mainnet
- **Chain ID:** 42220
- **RPC:** https://forno.celo.org
- **USDC Token:** 0xcebA9300f2b948710d2653dD7B07f33A8B32118C
- **Self Hub:** 0x77117D60eaB7C044e785D68edB6C7E0e134970E (production)

## Troubleshooting

### Common Issues
1. **RPC Timeouts:** Check network connectivity and RPC URL
2. **Insufficient Funds:** Ensure wallet has CELO for gas
3. **Contract Not Found:** Verify deployment and address
4. **Self Verification Failed:** Check staging vs production config

### OFAC Check Issue (Workshop Learning)
**Problem:** Mock passports in staging environment were failing OFAC checks
- Error: `'INVALID_OFAC', reason: 'Invalid ofac'`
- Even US mock passports were being rejected

**Solution:** Disable OFAC checks for staging/workshop
1. Edit `contracts/scripts/hardhat/deployHappyBirthday.ts`
2. Change: `ofacEnabled: [true, true, true]` → `ofacEnabled: [false, false, false]`
3. Redeploy the contract

**Note:** For production with real passports, you may want OFAC checks enabled

### Contract Funding Issue
**Problem:** Contract cannot distribute USDC without funds
- Error: `'ERC20: transfer amount exceeds balance'`
- The contract needs USDC tokens to pay birthday claims

**Solution:** Always fund the contract after deployment
1. Get testnet USDC from Circle faucet: https://faucet.circle.com/
2. Send USDC to your deployed contract address
3. Default claim amount is 1 USDC (can be adjusted)

### Birthday Window Issue
**Problem:** Proof fails with "execution reverted"
- The contract only allows claims within ±1 day of passport birthday
- Mock passport birthday must match current date ±1 day

**Solution:** Set correct birthday in Self app
- For June 13, 2025: Use birthday June 12, 13, or 14 (any year)
- The contract checks day/month only, ignoring year

### README.md Inaccuracies (Workshop Learning)
**Problem:** The project README mentions incorrect file paths
- References `contracts/ignition/modules/SelfHappyBirthday.ts` (doesn't exist)
- Actual deploy script: `contracts/scripts/hardhat/deployHappyBirthday.ts`

**Solution:** Use the correct file paths documented in this guide

### Useful Commands
```bash
# Check wallet balance
npx hardhat console --network celoAlfajores
# > await ethers.provider.getBalance("0x289B7B7A15f0B696f1196017920eA895762f011c")

# Update claimable amount
yarn run update:claimable:alfajores

# Redeploy if needed
yarn run deploy:alfajores
```

## Security Notes
- **Development Only:** Never use these private keys for real funds
- **Environment Variables:** Keep .env files secure and out of version control
- **Staging vs Production:** Always verify Self environment configuration

## Workshop Completion Checklist

### ✅ Environment Setup (Complete)
- [x] Generated development wallet: `0x289B7B7A15f0B696f1196017920eA895762f011c`
- [x] Funded wallet with CELO from faucet
- [x] Configured `.env` files with private keys and Celoscan API key

### ✅ Smart Contract Deployment (Complete)
- [x] Deployed contract with OFAC disabled: `0x97d01A133c9Bfd77D6b7147d36bAA005b48735aa`
- [x] Contract configured for staging environment
- [x] Birthday window set to ±1 day

### ✅ Frontend Configuration (Complete)
- [x] Updated contract address in `frontend/app/page.tsx`
- [x] Added transaction success UI with Celoscan links
- [x] Set default wallet address for testing
- [x] Configured for staging_celo environment

### ✅ Contract Funding (Complete)
- [x] Funded contract with 10 USDC from Circle faucet
- [x] Verified contract can distribute 1 USDC per claim

### ✅ Testing & Validation (Complete)
- [x] Set up ngrok for HTTPS access
- [x] Tested with mock passport (birthday: June 13, 2025)
- [x] Successfully claimed 1 USDC
- [x] Verified transaction on Celoscan

## Workshop Success Metrics
- **Contract**: Deployed and funded ✓
- **Frontend**: Running with transaction links ✓
- **Self Integration**: Working with mock passports ✓
- **User Flow**: Complete birthday verification and USDC claim ✓

**Ready for Production:** Switch to mainnet, enable OFAC checks, use real passports