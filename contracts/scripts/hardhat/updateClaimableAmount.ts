import { ethers } from "hardhat";

/**
 * Script to update the claimable USDC amount on the SelfHappyBirthday contract
 *
 * Usage:
 *   CONTRACT=0x... AMOUNT=5 npx hardhat run scripts/hardhat/updateClaimableAmount.ts --network celoSepolia
 *
 * Environment variables:
 *   CONTRACT - The deployed contract address (required)
 *   AMOUNT - New claimable amount in USDC (e.g., 5 for $5) (required)
 */

async function main() {
  const contractAddress = process.env.CONTRACT;
  const amountUSDC = process.env.AMOUNT;

  if (!contractAddress) {
    console.error("ERROR: CONTRACT environment variable is required");
    console.error("Usage: CONTRACT=0x... AMOUNT=5 npx hardhat run scripts/hardhat/updateClaimableAmount.ts --network celoSepolia");
    process.exit(1);
  }

  if (!amountUSDC) {
    console.error("ERROR: AMOUNT environment variable is required");
    console.error("Usage: CONTRACT=0x... AMOUNT=5 npx hardhat run scripts/hardhat/updateClaimableAmount.ts --network celoSepolia");
    process.exit(1);
  }

  const [owner] = await ethers.getSigners();
  console.log("Updating claimable amount with account:", owner.address);

  const contract = await ethers.getContractAt("SelfHappyBirthday", contractAddress);

  // Get current amount
  const currentAmount = await contract.claimableAmount();
  console.log("Current claimable amount:", ethers.formatUnits(currentAmount, 6), "USDC");

  // Convert USDC to 6 decimals
  const newAmount = ethers.parseUnits(amountUSDC, 6);
  console.log("Setting new amount to:", amountUSDC, "USDC");

  // Update the amount
  const tx = await contract.setClaimableAmount(newAmount);
  await tx.wait();

  // Verify
  const updatedAmount = await contract.claimableAmount();
  console.log("Updated claimable amount:", ethers.formatUnits(updatedAmount, 6), "USDC");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
