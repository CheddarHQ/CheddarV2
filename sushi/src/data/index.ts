/**
 * @file price/index.ts
 * @description This file defines the main router for the application to fetch token data
 */

import { z } from 'zod';
import axios from 'axios';
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

export const dataRouter = new Hono()
// https://api-v3.raydium.io/mint/price?mints=4Cnk9EPnW5ixfLZatCPJjDB1PUtcRpVVgTQukm9epump,So11111111111111111111111111111111111111112,43uhykFm8Y9gLvHrWs7r7w1HCKu6vikDi7j394FaSfNz,

/**
 * @description Fetches the metadata for the specified token ids
 * @input ids: the ids of the tokens to fetch the metadata for
 * @returns an object containing basic and detailed info for the specified tokens
 */
    .get("/fetchMetadata", zValidator("query", z.object({ ids: z.string() })), async (c) => {
        const { ids } = c.req.query();
        try {
            const url = `https://api.dexscreener.io/latest/dex/pairs/solana/${ids}`;
            // https://api.dexscreener.io/latest/dex/pairs/solana/DttubKhvxaS5KT9Gm61i6H2G68FaHtVJHQ1iS6rMAiBo

            const response = await axios.get(url);
            const data = {
                basicInfo: response.data.pairs.map(pair => ({
                    baseAddress: pair.baseToken.address,
                    priceUsd: pair.priceUsd,
                    priceNative: pair.priceNative,
                    imageUrl: pair.info.imageUrl,
                    priceChange: pair.priceChange.h1,
                })),
                // TODO: efficient handling on the frontend to display the data
                // TODO: make typesafe
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
            return c.json(data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(error.response?.data);
                throw new Error('Failed to fetch data');
            }
            throw error;
        }
    })

    /**
     * @description Fetches the query data for the specified query
     * @input query: the query to fetch the data for
     * @returns an object containing basic and detailed info for the specified query
     */
    .get("/fetchQuery", zValidator("query", z.object({ query: z.string() })), async (c) => {
        const { query } = c.req.query();
        try {
            const response = await axios.get(`https://api.dexscreener.io/latest/dex/search?q=${query}`);
            return c.json(response.data.pairs);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(error.response?.data);
                throw new Error('Failed to fetch data');
            }
            throw error;
        }
    });

// TODO: sanitize the data before sending it to the frontend
// TODO: Add a cache layer to store the data for a certain period of time
export type DataRouter = typeof dataRouter;