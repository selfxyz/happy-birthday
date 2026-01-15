// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script} from "forge-std/src/Script.sol";
import {console} from "forge-std/src/console.sol";
import {SelfHappyBirthday} from "../../contracts/HappyBirthday.sol";
import {SelfUtils} from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";

/**
 * @title DeployHappyBirthday
 * @notice Deployment script for the SelfHappyBirthday V2 contract
 *
 * To run this script:
 * 1. Set the PRIVATE_KEY environment variable:
 *    export PRIVATE_KEY=your_private_key_here
 *
 * 2. Run the forge script:
 *    For Celo Sepolia (testnet):
 *    forge script scripts/forge/deployHappyBirthday.s.sol:DeployHappyBirthdayCeloSepolia --rpc-url celoSepolia --broadcast
 *
 *    For Celo Mainnet:
 *    forge script scripts/forge/deployHappyBirthday.s.sol:DeployHappyBirthdayCelo --rpc-url celo --broadcast
 *
 * Note: The verification config is automatically registered with Identity Hub V2 in the constructor.
 */

abstract contract DeployHappyBirthdayBase is Script {
    string constant SCOPE_SEED = "Self-Birthday-Example";

    function _deploy(
        address identityVerificationHub,
        address usdc,
        bool ofacEnabled
    ) internal returns (SelfHappyBirthday) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying contracts with the account:", deployerAddress);
        console.log("Identity Hub:", identityVerificationHub);
        console.log("USDC Token:", usdc);
        console.log("Scope Seed:", SCOPE_SEED);

        // Create verification config (UnformattedVerificationConfigV2)
        // The contract constructor will format and register it with Identity Hub V2
        string[] memory forbiddenCountries = new string[](0);
        SelfUtils.UnformattedVerificationConfigV2 memory verificationConfig = SelfUtils
            .UnformattedVerificationConfigV2({
                olderThan: 0, // No age restriction
                forbiddenCountries: forbiddenCountries, // No country restrictions
                ofacEnabled: ofacEnabled
            });

        console.log("OFAC Enabled:", ofacEnabled);
        console.log("\nDeploying SelfHappyBirthday V2...");

        // Deploy the contract
        // Constructor will:
        // 1. Initialize SelfVerificationRoot with hub address and scope seed
        // 2. Format the verification config using SelfUtils.formatVerificationConfigV2()
        // 3. Register the config with Identity Hub V2 via setVerificationConfigV2()
        // 4. Store the returned configId
        SelfHappyBirthday selfHappyBirthday = new SelfHappyBirthday(
            identityVerificationHub,
            SCOPE_SEED,
            verificationConfig,
            usdc
        );

        vm.stopBroadcast();

        // Log deployment info
        console.log("\n=== DEPLOYMENT SUCCESSFUL ===");
        console.log("SelfHappyBirthday deployed to:", address(selfHappyBirthday));
        console.log("Verification Config ID:", vm.toString(selfHappyBirthday.verificationConfigId()));

        console.log("\n=== FRONTEND CONFIGURATION ===");
        console.log("Update frontend/.env with:");
        console.log("NEXT_PUBLIC_SELF_ENDPOINT=", vm.toLowercase(vm.toString(address(selfHappyBirthday))));
        console.log("NEXT_PUBLIC_SELF_SCOPE_SEED=", SCOPE_SEED);

        return selfHappyBirthday;
    }
}

/**
 * @notice Deploy to Celo Sepolia testnet
 * Usage: forge script scripts/forge/deployHappyBirthday.s.sol:DeployHappyBirthdayCeloSepolia --rpc-url celoSepolia --broadcast
 */
contract DeployHappyBirthdayCeloSepolia is DeployHappyBirthdayBase {
    // Celo Sepolia configuration
    address constant IDENTITY_HUB = 0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74;
    address constant USDC = 0x01C5C0122039549AD1493B8220cABEdD739BC44E;

    function run() public {
        console.log("Network: Celo Sepolia (chainId: 11142220)");
        _deploy(IDENTITY_HUB, USDC, false); // OFAC disabled for testnet
    }
}

/**
 * @notice Deploy to Celo Mainnet
 * Usage: forge script scripts/forge/deployHappyBirthday.s.sol:DeployHappyBirthdayCelo --rpc-url celo --broadcast
 */
contract DeployHappyBirthdayCelo is DeployHappyBirthdayBase {
    // Celo Mainnet configuration
    address constant IDENTITY_HUB = 0x77117D60eaB7C044e785D68edB6C7E0e134970Ea;
    address constant USDC = 0xcebA9300f2b948710d2653dD7B07f33A8B32118C;

    function run() public {
        console.log("Network: Celo Mainnet (chainId: 42220)");
        _deploy(IDENTITY_HUB, USDC, true); // OFAC enabled for mainnet
    }
}
