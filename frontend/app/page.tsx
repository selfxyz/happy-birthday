'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { logo } from './content/birthdayAppLogo';
import { ethers } from 'ethers';

// Dynamically import Self SDK components to avoid SSR issues
const SelfQRcodeWrapper = dynamic(
    () => import('@selfxyz/qrcode').then((mod) => mod.SelfQRcodeWrapper),
    { ssr: false, loading: () => <div className="w-[256px] h-[256px] bg-gray-100 animate-pulse flex items-center justify-center rounded"><p className="text-gray-500 text-sm">Loading...</p></div> }
);

// Contract address - set via environment variable after deployment
const HAPPY_BIRTHDAY_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SELF_ENDPOINT || "";
const SCOPE_SEED = process.env.NEXT_PUBLIC_SELF_SCOPE_SEED || "Self-Birthday-Example";

function Birthday() {
    const [input, setInput] = useState('');
    const [address, setAddress] = useState('');
    const [selfApp, setSelfApp] = useState<any>(null);

    const [claimSuccess, setClaimSuccess] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    useEffect(() => {
        if (ethers.isAddress(input)) {
            setAddress(input);
        }
    }, [input]);

    // Initialize SelfApp when address changes
    useEffect(() => {
        if (!address || !HAPPY_BIRTHDAY_CONTRACT_ADDRESS) return;

        // Dynamically import and initialize Self SDK
        import('@selfxyz/qrcode').then(({ SelfAppBuilder }) => {
            try {
                const app = new SelfAppBuilder({
                    version: 2,
                    appName: "Self Birthday",
                    scope: SCOPE_SEED,
                    endpoint: HAPPY_BIRTHDAY_CONTRACT_ADDRESS.toLowerCase(),
                    endpointType: "staging_celo",
                    logoBase64: logo,
                    userId: address,
                    userIdType: "hex",
                    disclosures: {
                        date_of_birth: true,
                    },
                    devMode: true,
                }).build();

                setSelfApp(app);
            } catch (error) {
                console.error("Failed to initialize Self app:", error);
            }
        });
    }, [address]);

    const handleSuccess = async (data?: any) => {
        console.log('Verification successful', data);
        setClaimSuccess(true);
        // If we get a tx hash from the data, use it
        if (data?.txHash) {
            setTxHash(data.txHash);
        }
    };

    return (
        <div className="min-h-screen bg-white text-black">
            <nav className="w-full bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="mr-8">
                        <img
                            src="/self.svg"
                            alt="Self Logo"
                            className="h-8"
                        />
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <a
                        href="https://github.com/zk-passport/openpassport"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-900 text-white px-4 py-2 rounded-md flex items-center hover:bg-gray-800 transition-colors"
                    >
                        <span className="mr-2">Star on Github</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                        </svg>
                    </a>
                    <a
                        className="flex items-center justify-center gap-2 hover:underline hover:underline-offset-4"
                        href="https://self.xyz"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Go to self.xyz →
                    </a>
                </div>
            </nav>

            <div className="container mx-auto max-w-2xl px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-300">
                    <h2 className="text-2xl font-semibold mb-6 text-center">
                        It&apos;s your birthday? Claim 1 USDC
                    </h2>

                    {!HAPPY_BIRTHDAY_CONTRACT_ADDRESS && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                Contract not configured. Set NEXT_PUBLIC_SELF_ENDPOINT in your .env file.
                            </p>
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">
                            Enter your wallet address:
                        </label>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="0x..."
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>

                    {selfApp && (
                        <div className="flex justify-center mb-6">
                            <SelfQRcodeWrapper
                                selfApp={selfApp}
                                onSuccess={handleSuccess}
                                onError={(error: any) => console.error('Verification error:', error)}
                            />
                        </div>
                    )}

                    {!selfApp && address && HAPPY_BIRTHDAY_CONTRACT_ADDRESS && (
                        <div className="flex justify-center mb-6">
                            <div className="w-[256px] h-[256px] bg-gray-100 animate-pulse flex items-center justify-center rounded">
                                <p className="text-gray-500 text-sm">Loading QR Code...</p>
                            </div>
                        </div>
                    )}

                    {claimSuccess && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-green-800 mb-2">
                                Congratulations! Birthday USDC Claimed!
                            </h3>
                            <p className="text-sm text-green-700 mb-3">
                                You have successfully claimed USDC to your wallet address.
                            </p>
                            <div className="space-y-2">
                                {txHash ? (
                                    <a
                                        href={`https://celo-sepolia.blockscout.com/tx/${txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-blue-600 hover:underline"
                                    >
                                        View Transaction on Blockscout →
                                    </a>
                                ) : (
                                    <a
                                        href={`https://celo-sepolia.blockscout.com/address/${address}#tokentxns`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-blue-600 hover:underline"
                                    >
                                        View Your Token Transfers on Blockscout →
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Info about V2 features */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">V2 Features</h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                            <li>• Supports both E-Passport and EU ID cards</li>
                            <li>• EU ID card users get 2x bonus rewards</li>
                            <li>• Birthday window: ±1 day from your actual birthday</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Birthday;
