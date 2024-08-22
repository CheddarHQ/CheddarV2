/**
 * @file buy/index.ts
 * @description This file defines the tRPC router for the application to buy/swap tokens
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import axios from 'axios';
import { Transaction, Connection, VersionedTransaction } from '@solana/web3.js';
import { quoteBody, swapBody } from "./interfaces";
import z from 'zod';
import { quoteSchema } from './schemas';

// TODO TEST AND FIX SWAP
const connection = new Connection('https://api.mainnet-beta.solana.com');

export const buyRouter = new Hono()

/**
 * @description Fetches the current autofee rates
 * @returns object containing the autofee rates for very high, high & medium priority
 * @example http://<worker>/api/buy/autofee
 */
.get("/autofee", async (c) => {
    try {
        const response = await axios.get('https://api-v3.raydium.io/main/auto-fee');
        console.log(JSON.stringify(response.data, null, 2));

        if (!response.data || typeof response.data !== 'object' || !response.data.data || !response.data.data.default) {
            throw new Error('Unexpected response structure');
        }

        const { default: defaultFees } = response.data.data;

        const autofeeRes = {
            veryHighP: defaultFees.vh,
            highP: defaultFees.h,
            mediumP: defaultFees.m,
        };

        if (!autofeeRes.veryHighP || !autofeeRes.highP || !autofeeRes.mediumP) {
            throw new Error('Missing expected data in response');
        }
        return c.json(autofeeRes);
    } catch (error) {
        console.error('Full error:', error);
        if (axios.isAxiosError(error)) {
            console.error(`Axios Error: ${error.message}`);
            console.error(`Response data:`, error.response?.data);
            console.error(`Response status:`, error.response?.status);
        }
        throw new Error(`Failed to fetch autofee: ${(error as Error).message}`);
    }
})

/**
 * @description Fetches the current Raydium RPCs
 * @returns array of objects contining RPCs urls, ws, weight, and name 
 * @example http://<worker>/api/buy/rpcs
 */
    .get("/rpcs", async (c) => {
        try {
            const response = await axios.get('https://api-v3.raydium.io/main/rpcs');
            console.log(response.data.data.rpcs);

            return c.json(response.data.data.rpcs);
        } catch (error) {
            console.error('Full error:', error);
            if (axios.isAxiosError(error)) {
                console.error(`Axios Error: ${error.message}`);
                console.error(`Response data:`, error.response?.data);
                console.error(`Response status:`, error.response?.status);
            }
            return c.json({ error: 'Failed to fetch RPCs' }, 500);
        }
    })

/**
 * @description Fetches the quote for the specified input and output mints
 * @input inputMint
 *        outputMint
 *        amount
 *        slippage (optional) 
 *        platformFees
 * @returns the quote response
 * @example http://<worker>/api/buy/quote?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=So11111111111111111111111111111111111111112&amount=1000000&slippage=50&platformFees=0
 */
    .get("/quote", zValidator("query", quoteSchema), async (c) => {
        const { inputMint, outputMint, amount, slippage, platformFees } = c.req.query();
        try {
            const response = await axios.get('https://quote-api.jup.ag/v6/quote', {
                params: {
                    // handle the query params according to schema defined in schemas.ts
                    inputMint,
                    outputMint,
                    amount: parseInt(amount),
                    slippageBps: slippage ? parseInt(slippage) : 50,
                    platformFeeBps: parseInt(platformFees),
                    swapMode: 'ExactOut'
                }
            });
            return c.json(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`Axios Error: ${error.message}`);
                console.error(`Response data:`, error.response?.data);
                console.error(`Response status:`, error.response?.status);
            }
            return c.json({ error: 'Failed to fetch quote' }, 500);
        }
    })

/**
 * @description Swaps the tokens
 * @input object containing:
 *        quoteResponse: the quote response
 *        userPubkey: the public key of the user
 *        wrapAndUnwrapSol: (optional) whether to wrap and unwrap SOL
 *        feeAccount: the public key of the fee account
 * @returns the serialized transaction
 * @example http://<worker>/api/buy/swap
 */
// TODO: testing on devnet
    .post("/swap", zValidator("json", z.object({
        quoteResponse: z.object({
            inputMint: z.string(),
            outputMint: z.string(),
            amount: z.number(),
            slippage: z.number().optional(),
            platformFees: z.number(),
        }),
        userPubkey: z.string(),
        wrapAndUnwrapSol: z.boolean().optional(),
        feeAccount: z.string(),
        wallet: z.object({
            payer: z.object({
                publicKey: z.string(),
                secretKey: z.array(z.number()), // Array of numbers
            }),
        }),
    })), async (c) => {
        const { quoteResponse, userPubkey, feeAccount, wallet } = c.req.json() as unknown as swapBody;
        try {
            const swapRequestBody = {
                quoteResponse,
                userPublicKey: userPubkey,
                wrapUnwrapSOL: true,
                feeAccount: feeAccount,
            };
            const swapResponse = await axios.post('https://swap-api.jup.ag/v6/swap', swapRequestBody);
            const { swapTransaction } = swapResponse.data;

            const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
            var transaction = VersionedTransaction.deserialize(swapTransactionBuf);

            const keypair = Keypair.fromSecretKey(Uint8Array.from(wallet.payer.secretKey));
            transaction.sign([keypair]);

            const rawTransaction = transaction.serialize();
            const txId = await connection.sendRawTransaction(rawTransaction, {
                skipPreflight: true,
                maxRetries: 2,
            });

            const confirmation = await connection.confirmTransaction(txId);
            if (confirmation.value.err) {
                throw new Error(`Transaction failed: ${confirmation.value.err}`);
            }

            return c.json({ success: true, txId, explorerUrl: `https://solscan.io/tx/${txId}` });
        } catch (error) {
            console.error('Swap error:', error);
            if (axios.isAxiosError(error)) {
                console.error('Axios error details:', error.response?.data);
            }
            return c.json({ success: false, error: 'Failed to perform swap' }, 500);
        }
    });


export type BuyRouter = typeof buyRouter;
