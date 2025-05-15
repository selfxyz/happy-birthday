It's your birthday? Prove it and get $100!

# Happy Birthday

This project provides a simple contract and frontend for distributing USDC to people on their birthdays, serving as a straightforward example of integrating Self.
This example introduces a contract that verifies a user's passport birthday and allows them to claim USDC if their date of birth is within ±5 days of the current date, along with a frontend that integrates this functionality.

## Setup Instructions

### Prerequisites

- It is recommended to install [ngrok](https://ngrok.com/) before starting, which will be useful for testing the frontend locally.

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
   - Copy `.env.example` to `.env`
   - Fill in the required values in the `.env` file

4. Build the contracts:
   ```bash
   yarn run build
   ```

5. Configure the passport environment in the `contracts/ignition/modules/SelfHappyBirthday.ts` file:
   - For real passports (production environment):
     Uncomment the line for production and comment the staging line:
     ```javascript
     // For prod environment
     const DEFAULT_IDENTITY_VERIFICATION_HUB = "0x77117D60eaB7C044e785D68edB6C7E0e134970E";
     // For staging environment
     // const DEFAULT_IDENTITY_VERIFICATION_HUB = "0x3e2487a250e2A7b56c7ef5307Fb591Cc8C83623D";
     // For mainnet environment
     const token = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";
     // For staging environment
     // const token = "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B";
     ```
   - For mock passports (staging/testing environment):
     Keep the staging environment line uncommented (default):
     ```javascript
     // For prod environment
     // const DEFAULT_IDENTITY_VERIFICATION_HUB = "0x77117D60eaB7C044e785D68edB6C7E0e134970E";
     // For staging environment
     const DEFAULT_IDENTITY_VERIFICATION_HUB = "0x3e2487a250e2A7b56c7ef5307Fb591Cc8C83623D";
     // For mainnet environment
     // const token = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";
     // For staging environment
     const token = "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B";
     ```

6. Deploy the contracts:
Check package.json and choose network
   ```bash
   yarn run deploy:NETWORK_NAME
   ```

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
   - Fill in the required values in the `.env` file

4. Update the contract address:
   - Open `frontend/app/page.tsx`
   - Find where the SelfAppBuilder is initialized
   - Replace the address in the endpoint field with the address of your newly deployed contract

5. Start the development server:
   ```bash
   yarn dev
   ```

6. Send USDC to the deployed contract:
   Deposit the USDC that the deployed contract will distribute to eligible users.

7. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.