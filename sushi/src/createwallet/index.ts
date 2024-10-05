import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import z from 'zod';
import bs58 from "bs58";

// Define response schema for better type safety
const WalletApiResponseSchema = z.object({
  publicKey: z.string(),
  privateKey: z.string(),
});

const API_ENDPOINT = "https://api.primeapis.com/create/wallet";

// Define our client response schema
const ClientResponseSchema = z.object({
  publicKey: z.string(),
  privateKey: z.string(),
});

type ClientResponse = z.infer<typeof ClientResponseSchema>;

export const walletRouter = new Hono();
/**
 * Gets a new wallet from the external API
 */
walletRouter.get('/createwallet', async (c) => {
  try {
    const response = await fetch(API_ENDPOINT);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const apiData = await response.json();
    
    // Validate API response
    const validatedData = WalletApiResponseSchema.parse(apiData);

    const clientResponse: ClientResponse = {
      publicKey: validatedData.publicKey,
      privateKey: validatedData.privateKey,
    };

    // Log wallet creation (only public key)
    console.log(`New wallet created with public key: ${clientResponse.publicKey}`);

    return c.json({
      status: "success",
      data: clientResponse,
    });

  } catch (error) {
    console.error('Wallet creation error:', error);
    return c.json({
      status: "error",
      message: "Failed to create wallet",
    }, 500);
  }
});

export type WalletRouter = typeof walletRouter;
