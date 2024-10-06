import 'react-native-get-random-values'; // Ensure the polyfill is imported first
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

export async function getWalletBalance(walletAddress: string): Promise<number> {
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    const publicKey = new PublicKey(walletAddress);
    
    try {
        const balance = await connection.getBalance(publicKey);
        const balanceInSol = balance / Math.pow(10, 9);

        // Format to two decimal points
        const formattedBalanceInSol = balanceInSol.toFixed(2);
        console.log(`Balance: ${formattedBalanceInSol} SOL`);

        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=inr');
        const priceData: { solana: { inr: number } } = await response.json();
        const solPriceInInr = priceData.solana.inr;

        const balanceInInr = balanceInSol * solPriceInInr;
        const formattedBalanceInInr = balanceInInr.toFixed(2); // Format to two decimal points
        console.log(`Balance: ${formattedBalanceInSol} SOL (${formattedBalanceInInr} INR)`);
        
        return parseFloat(formattedBalanceInInr); // Return as a number
    } catch (error) {
        console.error("Error fetching wallet balance:", error);
        throw error; // Rethrow the error to handle it later if necessary
    }
}


export const getTokenData = async (walletAddress: string): Promise<void> => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    
    try {
        const tokenAccounts = await connection.getTokenAccountsByOwner(new PublicKey(walletAddress));

        for (const { pubkey, account } of tokenAccounts.value) {
            const data = account.data.parsed.info;
            const balance = data.tokenAmount.uiAmount; // Adjust based on your SPL token structure
            console.log(`Token Account: ${pubkey.toBase58()}, Balance: ${balance}`);
        }
    } catch (error) {
        console.error("Error fetching token data:", error);
    }
};
