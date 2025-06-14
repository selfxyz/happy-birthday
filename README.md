It's your birthday? Prove it and get $100!

# Happy Birthday

This project provides a simple contract and frontend for distributing USDC to people on their birthdays, serving as a straightforward example of integrating Self.
This example introduces a contract that verifies a user's passport birthday and allows them to claim USDC if their date of birth is within ±1 day of the current date, along with a frontend that integrates this functionality.

## Setup Instructions

### Prerequisites

- Node.js and Yarn installed
- It is recommended to install [ngrok](https://ngrok.com/) before starting, which will be useful for testing the frontend locally.
- A funded wallet on Celo Alfajores testnet (for deployment)
- Test USDC to distribute (get from [Celo faucet](https://faucet.celo.org))

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
   - Add the following required values:
   ```env
   # Private key for deployment (without 0x prefix)
   CELO_ALFAJORES_KEY=your_private_key_here
   
   # Celoscan API key for contract verification (optional but recommended)
   CELOSCAN_API_KEY=your_celoscan_api_key_here
   ```

4. Build the contracts:
   ```bash
   yarn run build
   ```

5. Configure the passport environment in `contracts/scripts/hardhat/deployHappyBirthday.ts`:
   - For **mock passports** (testing/development):
     ```javascript
     devMode: true,
     ofacEnabled: [false, false, false], // Disable OFAC for mock passports
     ```
   - For **real passports** (production):
     ```javascript
     devMode: false,
     ofacEnabled: [true, true, true], // Enable OFAC for real passports
     ```

6. Deploy the contracts:
   ```bash
   yarn run deploy:celo-alfajores
   ```
   
   After deployment, note the deployed contract address from the output.

### Setting Up the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Update the contract address:
   - Open `frontend/app/page.tsx`
   - Find the `CONTRACT_ADDRESS` constant near the top
   - Replace it with your newly deployed contract address:
   ```javascript
   const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

5. **Important**: Fund the deployed contract with USDC:
   - The contract needs USDC to distribute to eligible users
   - Send test USDC to your deployed contract address
   - You can get test USDC from the [Celo faucet](https://faucet.celo.org)

6. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Important Notes

### Birthday Verification Window
- The contract allows claims if your passport birthday is within ±1 day of the current date
- This accounts for timezone differences
- Example: If today is June 14, you can claim if your birthday is June 13, 14, or 15

### Mock Passport Testing
- When using mock passports, make sure OFAC is disabled in the deployment script
- Mock passports are pre-configured test passports provided by Self protocol
- You can set any birthday when creating a mock passport for testing

### Nullifier System
- Each passport can only claim once (ever)
- The system uses nullifiers to prevent double claims
- Even with different mock passports, if they represent the same person, they cannot claim twice

### Troubleshooting

1. **"OFAC verification failed" error**:
   - This happens when using mock passports with OFAC enabled
   - Redeploy with `ofacEnabled: [false, false, false]`

2. **"Birthday is not within the valid window" error**:
   - Your passport birthday must be within ±1 day of today
   - For testing, create a mock passport with today's date as birthday

3. **"Insufficient funds" error**:
   - The contract doesn't have enough USDC
   - Send more test USDC to the contract address

4. **"Nullifier already used" error**:
   - This passport (or identity) has already claimed
   - Each person can only claim once

5. **Frontend shows contract scripts in package.json**:
   - Make sure the frontend `package.json` has Next.js scripts:
   ```json
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "next start",
     "lint": "next lint"
   }
   ```

## Contract Configuration

The contract supports several configuration options during deployment:

- `claimableAmount`: Amount of USDC each person can claim (default: 100 USDC)
- `devMode`: Enable/disable mock passport support
- `ofacEnabled`: Array of booleans for OFAC checking on different operations
- `birthdayRange`: Number of days before/after birthday to allow claims (default: 1)

## Security Considerations

- Always enable OFAC checking for production deployments
- The contract owner can withdraw unclaimed funds
- Each passport/identity can only claim once due to the nullifier system
- The contract uses Self protocol's zero-knowledge proofs to verify passport data without exposing personal information