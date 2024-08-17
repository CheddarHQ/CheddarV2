/**
 * @file price/index.ts
 * @description This file defines the main tRPC router for the application to fetch token data
 */

import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import axios from 'axios';

const appRouter = router({

/**
 * @description Fetches the current price of specified cryptocurrency tokens
 * @input ids: str or array of ticker or addresses
 *        vsToken: (optional) comparison token ticker or addresses.
 * @returns object containing token price against vsToken (if given) or against USDC.
 */
    fetchPrice: publicProcedure
        .input(z.object({
            ids: z.string().or(z.array(z.string())),        
            vsToken: z.string().optional(),
        }))
        .query(async ({ input }) => {
        try {
            const idsParam = Array.isArray(input.ids) ? input.ids.join(',') : input.ids;
            const params: Record<string, string> = { ids: idsParam };
            if (input.vsToken) {
                params.vsToken = input.vsToken;
            }
            const response = await axios.get('https://price.jup.ag/v6/price', { params });
            return response.data;       
            } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to fetch price: ${error.message}`);
            }
            throw new Error('Failed to fetch price');
            }
        }),

/**
 * @description retrieves metadata for specified token tickers or addresses. 
 * @input ids: A comma-separated string of the token addresses/tickers. 
 * @returns Array of token metadata objects.
 */        
    fetchMetadata: publicProcedure
        .input(z.object({
            ids: z.string().nonempty(),
        }))
        .query(async ({input}) => {
        try {
            const idsParam = input.ids;
            const params = { ids: idsParam }; // The 'ids' input is expected to be a comma-separated string
            const response = await axios.get('https://tokens.jup.ag/token', { params });
            return response.data;
            } catch (error) {
            throw new Error('Failed to fetch metadata');
            }
        }),

/**
 * @description retrieves the complete list all cryptocurrency token on jupiter.
 * @returns A large JSON object.
 * @todo Consider implementing caching using Redis for this large response to improve performance, as fetching all coins from the API can be resource-intensive.
 */        
    fetchAllcoins: publicProcedure
        .query(async () => {
            try {
                const response = await axios.get('https://token.jup.ag/all');
                // TODO: Saves the whole response to a cache prob Redis as it is a really large response
                return null;
            } catch (error) {
                throw new Error('Failed to fetch allcoins');
            }
        }),
    });

// TODO: Add api for chart of a particular coin. Will do with the front end implementation
// TODO: Use an API to fetch the 24H vol and liquidity of coin

export type AppRouter = typeof appRouter;