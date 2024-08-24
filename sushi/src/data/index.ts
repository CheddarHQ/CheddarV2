/**
 * @file data/index.ts
 * @description This file defines the main router for the application to fetch token data
 */
import axios from 'axios';
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { metaSchema, querySchema } from "./schemas";

export const dataRouter = new Hono()

/**
 * @description Fetches the metadata for the specified token ids
 * @input ids: the pair address of the token(s) to fetch the metadata for
 * @returns an object containing basic and detailed info for the specified tokens
 * @example http://<worker>/api/data/fetchMetadata?ids=zcdAw3jpcqEY8JYVxNVMqs2cU35cyDdy4ot7V8edNhz
 */
    .get("/fetchMetadata", zValidator("query", metaSchema), async (c) => {
        const { ids } = c.req.query();
        try {
            const url = `https://api.dexscreener.io/latest/dex/pairs/solana/${ids}`;  // https://api.dexscreener.io/latest/dex/pairs/solana/DttubKhvxaS5KT9Gm61i6H2G68FaHtVJHQ1iS6rMAiBo
            const response = await axios.get(url);
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
            return c.json(data);
        } catch (error) {
            console.error('Error in fetchMetadata:', error);
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    return c.json({ error: `API responded with status ${error.response.status}` }, error.response.status);
                } else if (error.request) {
                    return c.json({ error: "No response received from API" }, 503);
                }
            }
            return c.json({ error: "An unexpected error occurred" }, 500);
        }
    })

    /**
     * @description Fetches the query data for the specified query
     * @input query: the query to fetch the data for (can be a token name, symbol, or address)
     * @returns an object containing basic and detailed info for the specified query
     * @example http://<worker>/api/data/fetchMetadata?query=solana
     */ 
    .get("/fetchQuery", zValidator("query",  querySchema), async (c) => {
        const { query } = c.req.query();
        try {
            const response = await axios.get(`https://api.dexscreener.io/latest/dex/search?q=${query}`);
            return c.json(response.data.pairs);
        } catch (error) {
            console.error('Error in fetchQuery:', error);
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    return c.json({ error: `API responded with status ${error.response.status}` }, error.response.status);
                } else if (error.request) {
                    return c.json({ error: "No response received from API" }, 503);
                }
            }
            return c.json({ error: "An unexpected error occurred" }, 500);
        }
    });

export type DataRouter = typeof dataRouter;
// https://api-v3.raydium.io/mint/price?mints=4Cnk9EPnW5ixfLZatCPJjDB1PUtcRpVVgTQukm9epump,So11111111111111111111111111111111111111112,43uhykFm8Y9gLvHrWs7r7w1HCKu6vikDi7j394FaSfNz,
// TODO: Implement subscribe a coin feature on the frontend
// TODO: Add a cache layer to store the data for a certain period of time
// TODO: make typesafe