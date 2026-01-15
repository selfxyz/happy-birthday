// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import {IIdentityVerificationHubV2} from "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol";
import {SelfStructs} from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import {SelfUtils} from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import {AttestationId} from "@selfxyz/contracts/contracts/constants/AttestationId.sol";
import {Formatter} from "@selfxyz/contracts/contracts/libraries/Formatter.sol";

import {SelfVerificationRoot} from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";

/**
 * @title SelfHappyBirthday V2
 * @notice A contract that gives out USDC to users on their birthday, supporting both E-Passport and EUID cards
 * @dev Uses SelfVerificationRoot V2 to handle verification with nullifier management for birthday claims
 */
contract SelfHappyBirthday is SelfVerificationRoot, Ownable {
    using SafeERC20 for IERC20;

    // ====================================================
    // Constants
    // ====================================================

    uint256 public constant BASIS_POINTS = 10000;

    // ====================================================
    // Storage Variables
    // ====================================================

    /// @notice USDC token contract
    IERC20 public immutable usdc;

    /// @notice Default: 1 dollar (6 decimals for USDC)
    uint256 public claimableAmount = 1e6;

    /// @notice Bonus multiplier for EUID card users (in basis points)
    uint256 public euidBonusMultiplier = 20000; // 200% = 100% bonus

    /// @notice Bonus multiplier for E-Passport card users (in basis points)
    uint256 public passportBonusMultiplier = 10000; // 100% = no bonus

    /// @notice Default: 1 day window around birthday
    uint256 public claimableWindow = 1 days;

    /// @notice Tracks users who have claimed to prevent double claims
    mapping(uint256 nullifier => bool hasClaimed) public hasClaimed;

    /// @notice Verification config storage
    SelfStructs.VerificationConfigV2 public verificationConfig;

    /// @notice Verification config ID for identity verification
    bytes32 public verificationConfigId;

    // ====================================================
    // Events
    // ====================================================

    event USDCClaimed(address indexed claimer, uint256 amount, bytes32 attestationId);
    event ClaimableAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event ClaimableWindowUpdated(uint256 oldWindow, uint256 newWindow);
    event EuidBonusMultiplierUpdated(uint256 oldMultiplier, uint256 newMultiplier);

    // ====================================================
    // Errors
    // ====================================================

    error NotWithinBirthdayWindow();
    error AlreadyClaimed();

    /**
     * @notice Initializes the HappyBirthday V2 contract
     * @param identityVerificationHubAddress The address of the Identity Verification Hub V2
     * @param scopeSeed The scope seed string to be hashed with contract address
     * @param _verificationConfig The verification configuration for processing proofs
     * @param token The USDC token address
     */
    constructor(
        address identityVerificationHubAddress,
        string memory scopeSeed,
        SelfUtils.UnformattedVerificationConfigV2 memory _verificationConfig,
        address token
    ) SelfVerificationRoot(identityVerificationHubAddress, scopeSeed) Ownable(_msgSender()) {
        usdc = IERC20(token);

        // Format and register verification config with Identity Hub
        verificationConfig = SelfUtils.formatVerificationConfigV2(_verificationConfig);
        verificationConfigId = IIdentityVerificationHubV2(identityVerificationHubAddress)
            .setVerificationConfigV2(verificationConfig);
    }

    // ====================================================
    // External/Public Functions
    // ====================================================

    /**
     * @notice Sets the claimable USDC amount
     * @param newAmount The new claimable amount
     */
    function setClaimableAmount(uint256 newAmount) external onlyOwner {
        uint256 oldAmount = claimableAmount;
        claimableAmount = newAmount;
        emit ClaimableAmountUpdated(oldAmount, newAmount);
    }

    /**
     * @notice Sets the claimable window around birthdays
     * @param newWindow The new claimable window in seconds
     */
    function setClaimableWindow(uint256 newWindow) external onlyOwner {
        uint256 oldWindow = claimableWindow;
        claimableWindow = newWindow;
        emit ClaimableWindowUpdated(oldWindow, newWindow);
    }

    /**
     * @notice Sets the EUID bonus multiplier for EUID card users
     * @param newMultiplier The new bonus multiplier in basis points (10000 = 100%)
     */
    function setEuidBonusMultiplier(uint256 newMultiplier) external onlyOwner {
        uint256 oldMultiplier = euidBonusMultiplier;
        euidBonusMultiplier = newMultiplier;
        emit EuidBonusMultiplierUpdated(oldMultiplier, newMultiplier);
    }

    /**
     * @notice Allows the owner to withdraw USDC from the contract
     * @param to The address to withdraw to
     * @param amount The amount to withdraw
     */
    function withdrawUSDC(address to, uint256 amount) external onlyOwner {
        usdc.safeTransfer(to, amount);
    }

    // ====================================================
    // Override Functions from SelfVerificationRoot
    // ====================================================

    /**
     * @notice Hook called after successful verification
     * @dev Checks user hasn't claimed, validates birthday window, and transfers USDC if eligible
     * @param output The verification output containing user data
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory /* userData */
    ) internal override {
        // Check if user has already claimed
        if (hasClaimed[output.nullifier]) {
            revert AlreadyClaimed();
        }

        // Check if within birthday window using V2 attribute handler
        if (_isWithinBirthdayWindow(output.attestationId, output.dateOfBirth)) {
            // Calculate final amount based on attestation type
            uint256 finalAmount = claimableAmount;

            // Apply bonus multiplier for EUID card users
            if (output.attestationId == AttestationId.EU_ID_CARD) {
                finalAmount = (claimableAmount * euidBonusMultiplier) / BASIS_POINTS;
            }

            // Mark user as claimed
            hasClaimed[output.nullifier] = true;

            address recipient = address(uint160(output.userIdentifier));

            // Transfer USDC to the user
            usdc.safeTransfer(recipient, finalAmount);

            // Emit success event
            emit USDCClaimed(recipient, finalAmount, output.attestationId);
        } else {
            revert NotWithinBirthdayWindow();
        }
    }

    /**
     * @notice Returns the config ID for verification
     * @dev Override of the SelfVerificationRoot virtual function
     * @return The stored verification config ID
     */
    function getConfigId(
        bytes32, /* destinationChainId */
        bytes32, /* userIdentifier */
        bytes memory /* userDefinedData */
    ) public view override returns (bytes32) {
        return verificationConfigId;
    }

    // ====================================================
    // Internal Functions
    // ====================================================

    /**
     * @notice Checks if the current date is within the user's birthday window
     * @param dobFromProof The date of birth extracted from the proof (format: "DD-MM-YY")
     * @return isWithinWindow True if within the birthday window
     */
    function _isWithinBirthdayWindow(bytes32, string memory dobFromProof) internal view returns (bool) {
        // DOB comes in format "DD-MM-YY" from the proof system
        bytes memory dobBytes = bytes(dobFromProof);
        require(dobBytes.length == 8, "Invalid DOB format"); // "DD-MM-YY" = 8 chars

        // Extract day and month from "DD-MM-YY" format
        string memory day = Formatter.substring(dobFromProof, 0, 2); // DD
        string memory month = Formatter.substring(dobFromProof, 3, 5); // MM (skip hyphen at index 2)

        // Get current year (2 digits) from block.timestamp
        string memory currentYear = _getCurrentYearTwoDigits();

        // Create birthday in current year (format: YYMMDD)
        string memory dobInThisYear = string(abi.encodePacked(currentYear, month, day));
        uint256 dobInThisYearTimestamp = Formatter.dateToUnixTimestamp(dobInThisYear);

        uint256 currentTime = block.timestamp;
        uint256 timeDifference;

        if (currentTime > dobInThisYearTimestamp) {
            timeDifference = currentTime - dobInThisYearTimestamp;
        } else {
            timeDifference = dobInThisYearTimestamp - currentTime;
        }

        return timeDifference <= claimableWindow;
    }

    /**
     * @notice Gets the current year as a 2-digit string from block.timestamp
     * @return year The current year as "YY" format (e.g., "26" for 2026)
     */
    function _getCurrentYearTwoDigits() internal view returns (string memory) {
        // Calculate year from timestamp
        // Using approximation: seconds since epoch / seconds per year + 1970
        uint256 year = 1970 + (block.timestamp / 31556926); // 31556926 = avg seconds per year

        // Get last 2 digits
        uint256 twoDigitYear = year % 100;

        // Convert to string
        bytes memory yearBytes = new bytes(2);
        yearBytes[0] = bytes1(uint8(48 + twoDigitYear / 10));
        yearBytes[1] = bytes1(uint8(48 + twoDigitYear % 10));

        return string(yearBytes);
    }
}
