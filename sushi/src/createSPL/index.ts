import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import z from 'zod';
import { 
  Connection, 
  Keypair, 
  PublicKey,
  Transaction,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { 
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo
} from "@solana/spl-token";
import bs58 from "bs58";

// Schemas
const TokenCreationSchema = z.object({
  private_key: z.string(),
  amount: z.number().int().positive(),
  decimals: z.number().int().min(0).max(9),
  uri: z.string().url()
});

// Interfaces
interface TokenRequest {
  private_key: string;
  amount: number;
  decimals: number;
  uri: string;
}

interface TokenResponse {
  status: 'success' | 'error';
  supply?: string;
  mint?: string;
  message?: string;
}

const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com/";  
const connection = new Connection(RPC_ENDPOINT, 'confirmed');

export const tokenRouter = new Hono();

/**
 * Creates an SPL token on the Solana blockchain
 */
tokenRouter.post('/token', zValidator('json', TokenCreationSchema), async (c) => {
  const tokenRequest = c.req.valid('json');
  
  try {
    // Convert private key to Keypair
    const privateKeyBytes = bs58.decode(tokenRequest.private_key);
    const payer = Keypair.fromSecretKey(privateKeyBytes);

    // Check balance
    const payerBalance = await connection.getBalance(payer.publicKey);
    console.log(payerBalance)
    if (payerBalance < 0.05 * 10 ** 9) {
      throw new Error('Insufficient funds. Minimum 0.05 SOL required');
    }

    // Create token mint
    const mint = await createMint(
      connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      tokenRequest.decimals
    );

    // Get or create associated token account
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
    );

    // Mint tokens
    await mintTo(
      connection,
      payer,
      mint,
      tokenAccount.address,
      payer,
      tokenRequest.amount
    );

    const response: TokenResponse = {
      status: 'success',
      supply: tokenRequest.amount.toString(),
      mint: mint.toString()
    };

    return c.json(response);

  } catch (error) {
    console.error('Token creation error:', error);
    const errorResponse: TokenResponse = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
    return c.json(errorResponse, 500);
  }
});

export type TokenRouter = typeof tokenRouter;
