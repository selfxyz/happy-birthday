import { ethers, network } from "hardhat";

/**
 * Deployment script for SelfHappyBirthday V2
 *
 * This script:
 * 1. Deploys the SelfHappyBirthday contract with verification config
 * 2. The constructor automatically registers the config with Identity Hub V2
 * 3. Funds the contract with USDC if deployer has any
 *
 * Prerequisites:
 * - Set CELO_KEY in .env with your private key
 * - Have CELO for gas
 * - Optionally have USDC to fund the contract
 *
 * Usage:
 *   yarn deploy:celoSepolia  # Deploy to Celo Sepolia testnet
 *   yarn deploy:celo         # Deploy to Celo mainnet
 */

// Network configurations
const NETWORK_CONFIG: Record<string, {
  identityHub: string;
  usdc: string;
  name: string;
  chainId: number;
}> = {
  celoSepolia: {
    identityHub: "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74",
    usdc: "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
    name: "Celo Sepolia",
    chainId: 11142220,
  },
  celo: {
    identityHub: "0x77117D60eaB7C044e785D68edB6C7E0e134970Ea",
    usdc: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
    name: "Celo Mainnet",
    chainId: 42220,
  },
};

const SCOPE_SEED = "Self-Birthday-Example";

async function main() {
  const networkName = network.name;
  const config = NETWORK_CONFIG[networkName];

  if (!config) {
    console.error(`Unsupported network: ${networkName}`);
    console.error(`Supported networks: ${Object.keys(NETWORK_CONFIG).join(", ")}`);
    process.exit(1);
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Network:", config.name, `(chainId: ${config.chainId})`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "CELO");

  // Verification config for birthday app (UnformattedVerificationConfigV2)
  // This gets formatted and registered with Identity Hub V2 in the constructor
  const verificationConfig = {
    olderThan: 0,                  // No age restriction
    forbiddenCountries: [],       // No country restrictions
    ofacEnabled: networkName === "celo"  // Enable OFAC on mainnet, disable on testnet
  };

  // Deploy SelfHappyBirthday
  // The constructor will:
  // 1. Initialize SelfVerificationRoot with hub address and scope seed
  // 2. Format the verification config using SelfUtils.formatVerificationConfigV2()
  // 3. Register the config with Identity Hub V2 via setVerificationConfigV2()
  // 4. Store the returned configId for use in getConfigId()
  console.log("\n=== Deploying SelfHappyBirthday V2 ===");
  console.log("Identity Hub:", config.identityHub);
  console.log("Scope Seed:", SCOPE_SEED);
  console.log("USDC Token:", config.usdc);
  console.log("OFAC Enabled:", verificationConfig.ofacEnabled);

  const SelfHappyBirthday = await ethers.getContractFactory("SelfHappyBirthday");
  const selfHappyBirthday = await SelfHappyBirthday.deploy(
    config.identityHub,
    SCOPE_SEED,
    verificationConfig,
    config.usdc
  );

  await selfHappyBirthday.waitForDeployment();
  const happyBirthdayAddress = await selfHappyBirthday.getAddress();
  console.log("\nSelfHappyBirthday V2 deployed to:", happyBirthdayAddress);

  // Verify the verification config was registered
  const storedConfigId = await selfHappyBirthday.verificationConfigId();
  console.log("Verification Config ID:", storedConfigId);

  if (storedConfigId === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    console.error("ERROR: Verification config was not registered!");
    process.exit(1);
  }
  console.log("Verification config successfully registered with Identity Hub V2");

  // Check and fund with USDC
  const usdcContract = await ethers.getContractAt("IERC20", config.usdc);
  const deployerUsdcBalance = await usdcContract.balanceOf(deployer.address);
  console.log("\nDeployer USDC balance:", ethers.formatUnits(deployerUsdcBalance, 6), "USDC");

  if (deployerUsdcBalance > 0n) {
    console.log("\n=== Funding HappyBirthday with USDC ===");
    const fundAmount = deployerUsdcBalance;
    const transferTx = await usdcContract.transfer(happyBirthdayAddress, fundAmount);
    await transferTx.wait();

    const contractBalance = await usdcContract.balanceOf(happyBirthdayAddress);
    console.log("HappyBirthday USDC balance:", ethers.formatUnits(contractBalance, 6), "USDC");
  } else {
    if (networkName === "celoSepolia") {
      console.log("\nNo USDC to fund contract. Get test USDC from https://faucet.circle.com/");
    } else {
      console.log("\nNo USDC to fund contract.");
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("DEPLOYMENT SUCCESSFUL");
  console.log("=".repeat(50));
  console.log("Contract Address:", happyBirthdayAddress);
  console.log("Config ID:", storedConfigId);
  console.log("Network:", config.name, `(chainId: ${config.chainId})`);

  console.log("\n=== FRONTEND CONFIGURATION ===");
  console.log("Update frontend/.env with:");
  console.log(`NEXT_PUBLIC_SELF_ENDPOINT=${happyBirthdayAddress.toLowerCase()}`);
  console.log(`NEXT_PUBLIC_SELF_SCOPE_SEED=${SCOPE_SEED}`);

  console.log("\n=== CONTRACT VERIFICATION ===");
  console.log("Run this command to verify on block explorer:");
  console.log(`npx hardhat verify --network ${networkName} ${happyBirthdayAddress} "${config.identityHub}" "${SCOPE_SEED}" "[0,[],${verificationConfig.ofacEnabled}]" "${config.usdc}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
