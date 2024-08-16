/**
 * @file price/index.ts
 * @description This file defines the main tRPC router for the application, including
 *              procedures to interact with external APIs such as Jupiter Aggregator
 *              to fetch cryptocurrency prices.
 */

import { publicProcedure, router } from '../trpc';
 import { z } from 'zod';
import axios from 'axios';

const appRouter = router({

/**
 * @procedure fetchPrice
 * @description Fetches the current price of specified cryptocurrency tokens
 *              from the Jupiter API. The price can be retrieved 
 *              against a specified comparison token ticker or addresses.
 * @input 
 
 *      - ids: A string or array of strings representing the token ticker or addresses.
 *      - vsToken: An optional string representing the comparison token ticker or addresses.
 * NOTE: addresses and token tickers are case-sensitive.

 * @returns 
 * An object containing the price information for the specified tokens.
 * The object contains the following fields:
 *  - id 
 *  - mintSymbol
 *  - vsToken
 *  - vsTokenSymbol
 *  - price
 
 * @throws Error if the API request fails.
 */
    fetchPrice: publicProcedure
        .input(z.object({
            ids: z.string().or(z.array(z.string())),        
            vsToken: z.string().optional(),
        }))
        .query(async ({input}) => {
        try {
            const idsParam = Array.isArray(input.ids) ? input.ids.join(',') : input.ids;
            const params: Record<string, string> = { ids: idsParam };
            if (input.vsToken) {
                params.vsToken = input.vsToken;
            }
            const response = await axios.get('https://price.jup.ag/v6/price', { params });
            return response.data;       
            } catch (error) {
            throw new Error('Failed to fetch price');
            }
        }),

/**
 * @procedure fetchMetadata
 * @description The fetchMetadata procedure retrieves metadata for 
 *              specified cryptocurrency tokens from the Jupiter. 

 * @input 
 *  - ids: A comma-separated string representing the token addresses 
 *         for which metadata is being requested.
 *  Note: The token addresses are case-sensitive.

 * @returns
 *   Array of token metadata objects. Each object contains the following fields:
 *  - address
 *  - chainId
 *  - decimals
 *  - name
 *  - symbol
 *  - logoURI
 *  - tags
 *  - extensions

 * @throws Error if the API request fails.
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
 * @procedure fetchAllcoins
 * @description The fetchAllcoins procedure retrieves the complete list 
 *              of all cryptocurrency tokens available from the Jupiter API.

 * @returns 
 *   A large JSON object containing the entire list of tokens along with their metadata.

 * @todo
 *   Consider implementing caching using Redis for this large response 
 *   to improve performance, as fetching all coins from the API can be resource-intensive.

 * @throws Error if the API request fails.
 */        
        fetchAllcoins: publicProcedure
        .query(async () => {
            try {
                const response = await axios.get('https://token.jup.ag/all');
                // TODO: Saves the whole response to a cache prob Redis as it is a really large response
            } catch (error) {
                throw new Error('Failed to fetch allcoins');
            }
        }),

// TODO: Add api for chart of a particular coin 
// Will do with the front end implementation
    });

export type AppRouter = typeof appRouter;