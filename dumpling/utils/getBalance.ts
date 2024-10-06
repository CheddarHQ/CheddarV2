const { Connection, PublicKey,clusterApiUrl } = require('@solana/web3.js');

export async function getWalletBalance(walletAddress) {
    const connection = new Connection('https://api.mainnet-beta.solana.com');
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    console.log(`Balance: ${balance / Math.pow(10, 9)} SOL`);
    const balanceInSol = balance / Math.pow(10, 9);

    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=inr');
    const priceData = await response.json();
    const solPriceInInr = priceData.solana.inr;

    const balanceInInr = balanceInSol * solPriceInInr;

    console.log(`Balance: ${balanceInSol} SOL (${balanceInInr} INR)`);
    return balanceInInr;
}

export const getTokenData = async (walletAddress) => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    
    try {
      const tokenAccounts = await connection.getTokenAccountsByOwner(new PublicKey(walletAddress));
      
      for (const { pubkey, account } of tokenAccounts.value) {
        const data = account.data;
        const balance = data.parsed.info.tokenAmount.uiAmount; // Adjust based on your SPL token structure
        console.log(`Token Account: ${pubkey.toBase58()}, Balance: ${balance}`);
      }
    } catch (error) {
      console.error("Error fetching token data:", error);
    }
  };
  
