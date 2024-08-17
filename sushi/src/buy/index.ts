import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import axios from 'axios';
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
                const serializeRes = response.data;
                return serializeRes;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    throw new Error(`Failed to serialize transaction: ${error.message}`);
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
        }),
});

