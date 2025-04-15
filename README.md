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
     const DEFAULT_IDENTITY_VERIFICATION_HUB = "0x9AcA2112D34Ef021084264F6f5eef2a99a5bA7b1";
     // For staging environment
     // const DEFAULT_IDENTITY_VERIFICATION_HUB = "0xDCAa9D9b8E8Bb5696c5d4b47da84aD37b8DEb9A8";
     ```
   - For mock passports (staging/testing environment):
     Keep the staging environment line uncommented (default):
     ```javascript
     // For prod environment
     // const DEFAULT_IDENTITY_VERIFICATION_HUB = "0x9AcA2112D34Ef021084264F6f5eef2a99a5bA7b1";
     // For staging environment
     const DEFAULT_IDENTITY_VERIFICATION_HUB = "0xDCAa9D9b8E8Bb5696c5d4b47da84aD37b8DEb9A8";
     ```

6. Deploy the contracts:
   ```bash
   yarn run deploy
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
   - Open `frontend/pages/api/verify.ts`
   - Find the line with `const contractAddress = "0x448333D3b622bc32629583a01e544f7bc7509237";`
   - Replace the address with the address of your newly deployed contract

5. Configure the passport mode in `frontend/app/page.tsx`:
   - For real passports (production environment):
     Set `devMode` to `false` in the `selfApp` configuration:
     ```javascript
     devMode: false,
     ```
   - For mock passports (staging/testing environment):
     Set `devMode` to `true` in the `selfApp` configuration:
     ```javascript
     devMode: true,
     ```

6. Start the development server:
   ```bash
   yarn dev
   ```

7. Set up ngrok for local development:
   - In a new terminal, start ngrok to expose your local server:
     ```bash
     ngrok http 3000
     ```
   - Copy the generated ngrok URL (it will look like `https://xxxx-xxx-xxx-xx.ngrok-free.app`)
   - Open `frontend/app/page.tsx` and find the `endpoint` line in the `selfApp` configuration (around line 60)
   - Replace the existing URL with your ngrok URL:
     ```javascript
     endpoint: "https://your-ngrok-url.ngrok-free.app/api/verify",
     ```

8. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.