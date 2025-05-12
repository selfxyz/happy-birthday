import { ethers } from "hardhat";
import { hashEndpointWithScope } from "@selfxyz/core";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  const nonce = await ethers.provider.getTransactionCount(deployer.address);
  console.log("Account nonce:", nonce);
  
  const futureAddress = ethers.getCreateAddress({
    from: deployer.address,
    nonce: nonce
  });
  console.log("Calculated future contract address:", futureAddress);
  
  // For prod environment
  // const identityVerificationHub = "0x9AcA2112D34Ef021084264F6f5eef2a99a5bA7b1";
  // For staging environment
  const identityVerificationHub = "0xDCAa9D9b8E8Bb5696c5d4b47da84aD37b8DEb9A8";

  const scope = hashEndpointWithScope("https://bfcf-2400-4150-8300-2d00-f83f-9c52-f581-17b9.ngrok-free.app", 'Self-Denver-Birthday');
  const attestationId = 1n;

  // For mainnet environment
  // const token = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";
  // For staging environment
  const token = "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B";

  const olderThanEnabled = false;
  const olderThan = 18n;
  const forbiddenCountriesEnabled = false;
  const forbiddenCountriesListPacked = [0n, 0n, 0n, 0n] as [bigint, bigint, bigint, bigint];
  const ofacEnabled = [false, false, false] as [boolean, boolean, boolean];
  
  const SelfHappyBirthday = await ethers.getContractFactory("SelfHappyBirthday");

  console.log("Deploying SelfHappyBirthday...");
  const selfHappyBirthday = await SelfHappyBirthday.deploy(
    identityVerificationHub,
    scope,
    attestationId,
    token,
    olderThanEnabled,
    olderThan,
    forbiddenCountriesEnabled,
    forbiddenCountriesListPacked,
    ofacEnabled
  );
  
  await selfHappyBirthday.waitForDeployment();
  
  const deployedAddress = await selfHappyBirthday.getAddress();
  console.log("SelfHappyBirthday deployed to:", deployedAddress);
  
  console.log("To verify on Celoscan:");
  console.log(`npx hardhat verify --network celo ${deployedAddress} ${identityVerificationHub} ${scope} ${attestationId} ${token} ${olderThanEnabled} ${olderThan} ${forbiddenCountriesEnabled} "[${forbiddenCountriesListPacked.join(',')}]" "[${ofacEnabled.join(',')}]"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });