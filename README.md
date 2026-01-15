It's your birthday? Prove it and get $100!

# Happy Birthday

This project provides a simple contract and frontend for distributing USDC to people on their birthdays, serving as a straightforward example of integrating Self.
This example introduces a contract that verifies a user's passport birthday and allows them to claim USDC if their date of birth is within ±1 day of the current date, along with a frontend that integrates this functionality.

## Setup Instructions

### Prerequisites

- Node.js and Yarn installed
- It is recommended to install [ngrok](https://ngrok.com/) before starting, which will be useful for testing the frontend locally.
- A funded wallet on Celo Sepolia testnet (for deployment - get from [Celo faucet](https://faucet.celo.org))
- Test USDC to distribute (get from [Circle faucet](https://faucet.circle.com/) - select Celo Sepolia)

### Deploying the Contract

1. Navigate to the contracts directory:
   ```bash
   cd contracts
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env` (or create a new `.env` file)
   - Add your private key:
   ```env
   PRIVATE_KEY=your_private_key_here
   ```

4. Build the contracts (from the contracts directory):
   ```bash
   yarn build
   ```

5. Deploy the contracts:
   ```bash
   # For testnet (Celo Sepolia)
   yarn deploy:celoSepolia

   # For mainnet (Celo)
   yarn deploy:celo
   ```

   After deployment, note the deployed contract address from the output.

   > **Note**: OFAC checking is automatically disabled on testnet and enabled on mainnet.

### Setting Up the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update with your deployed contract address (use lowercase):
   ```env
   NEXT_PUBLIC_SELF_ENDPOINT=0xyourdeployedcontractaddress
   NEXT_PUBLIC_SELF_SCOPE_SEED=Self-Birthday-Example
   ```

4. Start the development server (from the frontend directory):
   ```bash
   yarn dev
   ```

5. **Important**: Fund the deployed contract with USDC:
   - The contract needs USDC to distribute to eligible users
   - Send test USDC to your deployed contract address
   - You can get test USDC from the [Circle faucet](https://faucet.circle.com/)

6. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Important Notes

### Birthday Verification Window
- The contract allows claims if your passport birthday is within ±1 day of the current date
- This accounts for timezone differences
- Example: If today is June 14, you can claim if your birthday is June 13, 14, or 15

### Mock Passport Testing
- Use Celo Sepolia testnet for testing (OFAC is automatically disabled)
- Mock passports are pre-configured test passports provided by Self protocol
- You can set any birthday when creating a mock passport for testing

### Nullifier System
- Each passport can only claim once (ever)
- The system uses nullifiers to prevent double claims
- Even with different mock passports, if they represent the same person, they cannot claim twice

### Troubleshooting

1. **"OFAC verification failed" error**:
   - This happens when using mock passports on mainnet
   - Use Celo Sepolia testnet for testing with mock passports

2. **"Birthday is not within the valid window" error**:
   - Your passport birthday must be within ±1 day of today
   - For testing, create a mock passport with today's date as birthday

3. **"Insufficient funds" error**:
   - The contract doesn't have enough USDC
   - Send more test USDC to the contract address

4. **"Nullifier already used" error**:
   - This passport (or identity) has already claimed
   - Each person can only claim once

## Contract Configuration

The contract supports several configuration options (owner-only after deployment):

- `claimableAmount`: Amount of USDC each person can claim (default: 1 USDC)
- `claimableWindow`: Time window around birthday to allow claims (default: 1 day)
- `euidBonusMultiplier`: Bonus multiplier for EU ID card users (default: 200% = 2x)

## Security Considerations

- OFAC checking is automatically enabled on mainnet deployments
- The contract owner can withdraw unclaimed funds
- Each passport/identity can only claim once due to the nullifier system
- The contract uses Self protocol's zero-knowledge proofs to verify passport data without exposing personal information
- Supports both E-Passports and EU ID cards