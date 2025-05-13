'use client';

import React, { useState, useEffect } from 'react';
import SelfQRcodeWrapper, { SelfApp, SelfAppBuilder } from '@selfxyz/qrcode';
import { logo } from './content/birthdayAppLogo';
import { ethers } from 'ethers';

function Birthday() {
    const [input, setInput] = useState('0xE6E4b6a802F2e0aeE5676f6010e0AF5C9CDd0a50');
    const [address, setAddress] = useState(input);

    const [ensName, setEnsName] = useState<string | null>(null);

    useEffect(() => {
        if (ethers.isAddress(input)) {
            setAddress(input);
        }
    }, [input]);

    useEffect(() => {
        const resolveEns = async () => {
            try {
                const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/84842078b09946638c03157f83405213');
    
                if (input.toLowerCase().endsWith('.eth')) {
                    const resolvedAddress = await provider.resolveName(input);
                    if (resolvedAddress) {
                        setAddress(resolvedAddress);
                        setEnsName(input);
                    }
                } else if (ethers.isAddress(input)) {
                    const resolvedName = await provider.lookupAddress(input);
                    setEnsName(resolvedName);
                } else {
                    setEnsName(null);
                }
            } catch (error) {
                console.error('Error resolving ENS:', error);
                setEnsName(null);
            }
        };
    
        resolveEns();
    }, [input]);


    const selfApp = new SelfAppBuilder({
        appName: "Self Birthday",
        scope: "Self-Happy-Birthday-Example",
        // endpoint: "https://happy-birthday-rho-nine.vercel.app/api/verify",
        // run `ngrok http 3000` and copy the url here to test locally
        endpoint: "https://bfcf-2400-4150-8300-2d00-f83f-9c52-f581-17b9.ngrok-free.app/api/verify",
        logoBase64: logo,
        userId: address,
        userIdType: "hex",
        disclosures: { 
            date_of_birth: true,
        },
        devMode: true,
    } as Partial<SelfApp>).build();

    const handleSuccess = async () => {
        console.log('Verification successful');
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
                        🎉 It&apos;s your birthday? Claim 1 USDC 🎂 🎁
                    </h2>

                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">
                            Enter your wallet address or ENS name:
                        </label>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="0x... or name.eth"
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                        {ensName && ensName !== address && (
                            <p className="mt-2 text-sm text-gray-600">
                                ✓ Resolved: {ensName}
                            </p>
                        )}
                    </div>

                    {selfApp && (
                        <div className="flex justify-center mb-6">
                            <SelfQRcodeWrapper
                                selfApp={selfApp}
                                type='websocket'
                                onSuccess={handleSuccess}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Birthday;
