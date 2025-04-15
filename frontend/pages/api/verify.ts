import { NextApiRequest, NextApiResponse } from 'next';
import { 
    getUserIdentifier, 
    SelfBackendVerifier,
} from '@selfxyz/core';
import { ethers } from 'ethers';
import { abi } from '../../app/content/abi';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { proof, publicSignals } = req.body;

            if (!proof || !publicSignals) {
                return res.status(400).json({ message: 'Proof and publicSignals are required' });
            }

            console.log("Proof:", proof);
            console.log("Public signals:", publicSignals);

            // Contract details
            const contractAddress = "0xB7fc0c237597d1252B5ab187C3b011B3022b3636";

            const address = await getUserIdentifier(publicSignals, "hex");
            console.log("Extracted address from verification result:", address);

            // Connect to Celo network
            const provider = new ethers.JsonRpcProvider("https://alfajores-forno.celo-testnet.org");
            const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
            const contract = new ethers.Contract(contractAddress, abi, signer);

            // Force transaction by directly calling the contract
            const tx = await contract.verifySelfProof({
                a: proof.a,
                b: [
                  [proof.b[0][1], proof.b[0][0]],
                  [proof.b[1][1], proof.b[1][0]],
                ],
                c: proof.c,
                pubSignals: publicSignals,
            });
            
            await tx.wait();
            console.log("Transaction sent successfully");
            
            res.status(200).json({
                status: 'success',
                result: true,
                credentialSubject: {},
                transactionHash: tx.hash
            });

        } catch (error) {
            console.error('Error in verification process:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error in verification process',
                result: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}