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
 * @example http://<worker>/api/data/fetchmetadata?ids=zcdAw3jpcqEY8JYVxNVMqs2cU35cyDdy4ot7V8edNhz
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
                chainId: pair.chainId,
                dexId: pair.dexId,
                name: pair.baseToken.name,
                symbol: pair.baseToken.symbol,
                baseAddress: pair.baseToken.address,
                priceUsd: pair.priceUsd,
                priceNative: pair.priceNative,
                imageUrl: pair.info.imageUrl,
                priceChange: pair.priceChange.h1,
            })),
        // @ts-ignore
            detailedInfo: data.pairs.map(pair => ({
                chainId: pair.chainId,
                dexId: pair.dexId,
                name: pair.baseToken.name,
                symbol: pair.baseToken.symbol,                
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
dataRouter.get("/fetchquery", zValidator("query", querySchema), async (c) => {
    const { query } = c.req.query();
    try {
        const response = await fetch(`https://api.dexscreener.io/latest/dex/search?q=${query}`);
        
        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }
        
        const data = await response.json();
        const result = {
            basicInfo: data.pairs.map(pair => ({
                chainId: pair.chainId,
                dexId: pair.dexId,
                name: pair.baseToken.name,
                symbol: pair.baseToken.symbol,
                baseAddress: pair.baseToken.address,
                priceUsd: pair.priceUsd,
                priceNative: pair.priceNative,
                imageUrl: pair.info?.imageUrl,
                priceChange: pair.priceChange?.h1 || 0,
            })),
            detailedInfo: data.pairs.map(pair => ({
                chainId: pair.chainId,
                dexId: pair.dexId,
                name: pair.baseToken.name,
                symbol: pair.baseToken.symbol,
                baseAddress: pair.baseToken.address,
                priceUsd: pair.priceUsd,
                priceNative: pair.priceNative,
                imageUrl: pair.info?.imageUrl,
                volH24: pair.volume?.h24 || 0,
                volH6: pair.volume?.h6 || 0,
                volH1: pair.volume?.h1 || 0,
                priceChangeh1: pair.priceChange?.h1 || 0,
                priceChangeh6: pair.priceChange?.h6 || 0,
                priceChangeh24: pair.priceChange?.h24 || 0,
                liquidityUsd: pair.liquidity?.usd || 0,
                liquidityQuote: pair.liquidity?.quote || 0,
                liquidityBase: pair.liquidity?.base || 0,
                website: pair.info?.websites?.[0]?.url,
                twitter: pair.info?.socials?.find(social => social.type === "twitter")?.url,
                telegram: pair.info?.socials?.find(social => social.type === "telegram")?.url,
            }))
        };
        return c.json(result);
    } catch (error) {
        console.error('Error in fetchQuery:', error);
        if (error instanceof Error) {
            const status = error.message.includes('API responded with status') ? parseInt(error.message.split('status ')[1]) : 500;
            return c.json({ error: error.message }, status);
        }
        return c.json({ error: "An unexpected error occurred" }, 500);
    }
});

/*
* @description Fetches all the tokens
* @returns an object containing about 158,050 tokens
* @example http://<worker>/api/data/tokens
*/
dataRouter.get("/tokens", async (c) => {
    try {
        const response = await fetch('https://quote-api.jup.ag/v6/tokens');
        if (!response.ok) {
            throw new Error(`Failed to fetch tokens: ${response.statusText}`);
        }
        const data = await response.json();

        return c.json(data);
    } catch (error) {
        console.error('Full error:', error);
        if (error instanceof Error) {
            console.error(`Error details: ${error.message}`);
        }
        return c.json({ error: 'Failed to fetch tokens' }, 500);
    }
});

export type DataRouter = typeof dataRouter;

// TODO: Implement subscribe a coin feature on the frontend
// TODO: Add a cache layer to store the data for a certain period of time
// TODO: Make typesafe
