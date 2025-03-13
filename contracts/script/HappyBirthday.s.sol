// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SelfHappyBirthday} from "../src/HappyBirthday.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract HappyBirthdayScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        address identityVerificationHub = address(0x77117D60eaB7C044e785D68edB6C7E0e134970Ea);
        uint256 scope = 1;
        uint256 attestationId = 1;
        // Set your own token address
        address usdcToken = address(0xcebA9300f2b948710d2653dD7B07f33A8B32118C);
        
        bool olderThanEnabled = false;
        uint256 olderThan = 0;
        
        bool forbiddenCountriesEnabled = false;
        uint256[4] memory forbiddenCountriesListPacked = [uint256(0), uint256(0), uint256(0), uint256(0)];
        
        bool[3] memory ofacEnabled = [false, false, false];

        SelfHappyBirthday happyBirthday = new SelfHappyBirthday(
            identityVerificationHub,
            scope,
            attestationId,
            usdcToken,
            olderThanEnabled,
            olderThan,
            forbiddenCountriesEnabled,
            forbiddenCountriesListPacked,
            ofacEnabled
        );

        console.log("HappyBirthday deployed to:", address(happyBirthday));

        vm.stopBroadcast();
    }
}