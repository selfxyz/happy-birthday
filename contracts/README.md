# Birthday Airdrop Example

This is an example contract for airdropping tokens to users on their birthdays using selfxyz.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- Node.js v20.x or higher
- Yarn or npm

## Setup

1. Install dependencies:

```bash
# Install JavaScript dependencies (from the root directory)
yarn install

# Install Foundry dependencies (from the contracts directory)
cd contracts
forge install
```

2. Set up environment variables:

```bash
# Copy the example .env file
cp .env.example .env
```

## Building the Contract

To build the contract, run the following command from the `contracts` directory:

```bash
forge build
```

This will compile all contracts in the `src` directory and output the artifacts to the `out` directory.

## Deployment

```
RPC_URL=<your-rpc-url>
PRIVATE_KEY=<your-private-key>
ETHERSCAN_API_KEY=<your-etherscan-api-key> # For verification
```

Then source it before running the deployment:

```bash
source .env
forge script script/HappyBirthday.s.sol:HappyBirthdayScript --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
```

## Contract Configuration

The deployment script (`script/HappyBirthday.s.sol`) contains several parameters that you can customize:

- `identityVerificationHub`: Address of the Self Identity Verification Hub
- `scope`: Scope ID for the verification
- `attestationId`: Attestation ID for the verification
- `usdcToken`: Address of the USDC token contract
- `olderThanEnabled` and `olderThan`: Age verification settings
- `forbiddenCountriesEnabled` and `forbiddenCountriesListPacked`: Country restriction settings
- `ofacEnabled`: OFAC compliance settings

Modify these parameters in the script before deployment to customize the contract behavior.
