/**
 * @file data/index.ts
 * @description This file defines the main router for the application to fetch token data
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { metaSchema, querySchema } from "./schemas";

// Create a new Hono router instance
export const dataRouter = new Hono();

/**
 * @description Fetches the metadata for the specified token ids
 * @input ids: the pair address of the token(s) to fetch the metadata for
 * @returns an object containing basic and detailed info for the specified tokens
 * @example http://<worker>/api/data/fetchMetadata?ids=zcdAw3jpcqEY8JYVxNVMqs2cU35cyDdy4ot7V8edNhz
 */
dataRouter.get("/fetchmetadata", zValidator("query", metaSchema), async (c) => {
    const { ids } = c.req.query();
    try {
        const url = `https://api.dexscreener.io/latest/dex/pairs/solana/${ids}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }
        
        const data = await response.json();
        const result = {
                    // @ts-ignore
            basicInfo: data.pairs.map(pair => ({
                baseAddress: pair.baseToken.address,
                priceUsd: pair.priceUsd,
                priceNative: pair.priceNative,
                imageUrl: pair.info.imageUrl,
                priceChange: pair.priceChange.h1,
            })),
        // @ts-ignore
            detailedInfo: data.pairs.map(pair => ({
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
        return c.json(result);
    } catch (error) {
        console.error('Error in fetchMetadata:', error);
        if (error instanceof Error) {
            const status = error.message.includes('API responded with status') ? parseInt(error.message.split('status ')[1]) : 500;
            return c.json({ error: error.message }, status);
        }
        return c.json({ error: "An unexpected error occurred" }, 500);
    }
});

/**
 * @description Fetches the query data for the specified query
 * @input query: the query to fetch the data for (can be a token name, symbol, or address)
 * @returns an object containing basic and detailed info for the specified query
 * @example http://<worker>/api/data/fetchMetadata?query=solana
 */
dataRouter.get("/fetchQuery", zValidator("query", querySchema), async (c) => {
    const { query } = c.req.query();
    try {
        const response = await fetch(`https://api.dexscreener.io/latest/dex/search?q=${query}`);
        
        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }
        
        const data = await response.json();
                // @ts-ignore
        return c.json(data.pairs);
    } catch (error) {
        console.error('Error in fetchQuery:', error);
        if (error instanceof Error) {
            const status = error.message.includes('API responded with status') ? parseInt(error.message.split('status ')[1]) : 500;
                    // @ts-ignore
            return c.json({ error: error.message }, status);
        }
        return c.json({ error: "An unexpected error occurred" }, 500);
    }
});

export type DataRouter = typeof dataRouter;

// TODO: Implement subscribe a coin feature on the frontend
// TODO: Add a cache layer to store the data for a certain period of time
// TODO: Make typesafe
