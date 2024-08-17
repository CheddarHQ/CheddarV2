/**
 * @file buy/index.ts
 * @description This file defines the main tRPC router for the application to buy tokens
 */

import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import axios, { AxiosError } from 'axios';
import { Transaction, Connection, VersionedTransaction } from '@solana/web3.js';
import { Wallet } from '@project-serum/anchor';

const connection = new Connection('');
export const appRouter = router({

/**
 * @description Fetches the current price of specified cryptocurrency tokens    
 * @input inputMint: str of ticker or address of the token to sell
 *        outputMint: str of ticker or address of the token to buy
 *        amount: the amount of input tokens to be swapped
 *        slippage: (optional) the maximum slippage percentage allowed  
 *        platformFees: out platform fees (1%)
 * @returns object containing token price against vsToken (if given) or against USDC.
 */
    getQuote: publicProcedure
        .input(z.object({
            inputMint: z.string(),
            outputMint: z.string(),
            amount: z.number(),
            slippage: z.number().optional(),
            platformFees: z.number(),
        }))
        .query(async ({ input }) => {
        try {
            const response = await axios.get('https://quote-api.jup.ag/v6/quote', { 
                params: {
                    inputMint: input.inputMint,
                    outputMint: input.outputMint,
                    amount: input.amount,
                    slippage: input.slippage,
                    platformFeeBps: input.platformFees,
                  }
            });
            const quoteRes = response.data.json();
            return quoteRes;
            } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`Axios Error: ${error.message}`);
            }
                throw new Error('Failed to fetch quote');
            }
        }),

// Separate procedures to reduce complexity 
// same as getQuote but for SOL -> coin you wanna buy
    getSolQuote: publicProcedure
        .input(z.object({
            inputMint: z.string(),
            outputMint: z.string(),
            amount: z.number(),
            slippage: z.number().optional(),
            platformFees: z.number(),
        }))
        .query(async ({ input }) => {
        try {
            const response = await axios.get('https://quote-api.jup.ag/v6/quote', { 
                params: {
                    inputMint: "So11111111111111111111111111111111111111112",
                    outputMint: input.outputMint,
                    amount: input.amount,
                    slippage: input.slippage,
                    platformFeeBps: input.platformFees,
                  }
            });
            if (axios.isAxiosError(Error)) {
                throw new Error(`Axios Error: ${Error.message}`);
            }
            const quoteRes = response.data.json();
            return quoteRes;
            } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`Axios Error: ${error.message}`);
            }
            throw new Error('Failed to fetch quote');
            }
        }),

// same as getQuote but for USDC -> coin you wanna buy
    getUSDCQuote: publicProcedure
        .input(z.object({
            inputMint: z.string(),
            outputMint: z.string(),
            amount: z.number(),
            slippage: z.number().optional(),
            platformFees: z.number(),
        }))
        .query(async ({ input }) => {
        try {
            const response = await axios.get('https://quote-api.jup.ag/v6/quote', { 
                params: {
                    inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                    outputMint: input.outputMint,
                    amount: input.amount,
                    slippage: input.slippage,
                    platformFeeBps: input.platformFees,
                    }
            });
            if (axios.isAxiosError(Error)) {
                throw new Error(`Axios Error: ${Error.message}`);
            }
            const quoteRes = response.data.json();
            return quoteRes;
            } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`Axios Error: ${error.message}`);
            }
            throw new Error('Failed to fetch quote');
            }
        }),

 /**
 * @description Serializes the transaction for the swap
 * @input quoteResponse: the response from the getQuote procedure
 *        userPubkey: the public key of the user
 *        wrapAndUnwrapSol: (optional) whether to wrap and unwrap SOL
 *        feeAccount: the public key of the fee account
 * @returns the serialized transaction
 */
    serializeTransaction: publicProcedure
        .input(z.object({
            quoteResponse: z.object({
            }),
            userPubkey: z.string(),
            wrapAndUnwrapSol: z.boolean().default(true),
            feeAccount: z.string(),
            }))
            .mutation(async ({ input }) => {
            try {
                const response = await axios.post('https://swap-api.jup.ag/v6/swap', { 
                    params: {
                        quoteResponse: input.quoteResponse,
                        userPubkey: input.userPubkey,
                        feeAccount: input.feeAccount,
                      }
                });
                
                if (axios.isAxiosError(Error)) {
                    throw new Error(`Failed to serialize transaction: ${Error.message}`);
                }
                const serializeRes = response.data;
                return serializeRes;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error(`Axios Error: ${error.message}`);
                }
                throw new Error('Failed to serialize swap');
                }
            }),

 /**
  * @description deserializes, signs, and executes the transaction
  * @input serializedTransaction: the serialized transaction
  * @returns the transaction ID
  */

 // TODO - add wallet and signer
 // TODO - separate steps for deserializing, signing, and executing the transaction
    submitTransaction: publicProcedure
        .input(z.object({
            serializedTransaction: z.string(),
            wallet: z.object({
                payer: z.any(),             // TODO
                signer: z.any(),            // TODO 
            }),
            }))
            .mutation(async({ input }) => {  
            try {
                const swapTransaction = Buffer.from(input.serializedTransaction, 'base64');
                var transaction = VersionedTransaction.deserialize(swapTransaction);
                transaction.sign([input.wallet.payer]);

                const rawTransaction = transaction.serialize();
                const txId = await connection.sendRawTransaction(rawTransaction, {
                    skipPreflight: true,
                    maxRetries: 2,
                });

                await connection.confirmTransaction(txId);
                return `https://solscan.io/tx/${txId}`;
            } catch (error) {
                console.error(`Transaction Error: ${(error as Error).message}`);
                throw new Error('Failed to submit transaction');
            }
        }),
});

// TODO - user balance & history -> frontend