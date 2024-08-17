/**
 * @file price/index.ts
 * @description This file defines the main tRPC router for the application to fetch token data
 */

import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import axios from 'axios';
import { ApiResponseQuery, ProcessedData, ProcessedDataQuery } from './interfaces';
import { ApiResponse } from './interfaces';

export const appRouter = router({

/**
 * @description retrieves the metadata for token(s) separated by commas 
 * @input ids: A comma-separated string of the token addresses (upto 30)
 * @returns Array of token metadata objects
 */
    fetchMetadata: publicProcedure
        .input(z.object({
            ids: z.string(),
        }))
        .query(async ({ input }):Promise<ProcessedData> => {
        try {
            const idsParam = input.ids;
            const params = { ids: idsParam }; 

            const response = await axios.get<ApiResponse>('https://api.dexscreener.com/latest/dex/pairs/solana', { params });

// TODO: efficient handling on the frontend to display the data
            const data = {
                basicInfo: response.data.pairs.map(pair => ({
                    baseAddress: pair.baseToken.address,
                    priceUsd: pair.priceUsd,
                    priceNative: pair.priceNative,
                    imageUrl: pair.info.imageUrl,
                    priceChange: pair.priceChange.h1,
            })),
                detailedInfo: response.data.pairs.map(pair => ({
                    baseAddress: pair.baseToken.address,
                    priceUsd: pair.priceUsd,
                    priceNative: pair.priceNative,
                    imageUrl: pair.info.imageUrl,
                    volH24: pair.volume.h24,
                    volH6: pair.volume.h6,
                    volH1: pair.volume.h1,
                    priceChangeh1: pair.priceChange.h1,
                    priceChangeh6: pair.priceChange.h6,
                    priceChangeh24: pair.priceChange.h24,
                    liquidityUsd: pair.liquidity.usd,
                    liquidityQuote: pair.liquidity.quote,
                    liquidityBase: pair.liquidity.base,
                    website: pair.info.websites[0]?.url,
                    twitter: pair.info.socials.find(social => social.type === "twitter")?.url,
                    telegram: pair.info.socials.find(social => social.type === "telegram")?.url,
                }))
            };
            return data;
            } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(`Axios Error: ${error.message}`);
            }
            throw new Error('Failed to fetch metadata');
            }
        }),

/**
 * @description retrieves metadata for queried token
 * @input query: A string to search for token metadata
 * @returns Array of token metadata objects
 */        

// TODO: Fix all type safety issues
    fetchQuery: publicProcedure
        .input(z.object({
            query: z.string(),
        }))
        .query(async ({ input }) => {
            try {
                const response = await axios.get<ApiResponseQuery>(`https://api.dexscreener.io/latest/dex/search?q=${input.query}`);
                const pairs = response.data.pairs || [];

                const data = pairs.map(pair => ({
                    baseAddress: pair.baseToken?.address || 'null',
                    priceUsd: pair.priceUsd || 'null',
                    priceNative: pair.priceNative || 'null',
                    imageUrl: pair.info?.imageUrl || 'null',
                    priceChange: pair.priceChange?.h1 || 'null',
                }));
                return data;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error(`Axios Error: ${error.message}`);
                }
                throw new Error('Failed to fetch allcoins');
            }
        }),
    });

// TODO: Add api for chart of a particular coin. Will do with the front end implementation
// TODO: Historical price data for a coin
// TODO: sanitize the data before sending it to the frontend
// TODO: Add a cache layer to store the data for a certain period of time
