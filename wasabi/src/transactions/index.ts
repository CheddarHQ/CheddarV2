import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {z} from "zod";
import { env } from "hono/adapter";

export const transactionRouter = new Hono();

export interface Env {
    DB: D1Database;
  }

const transactionSchema = z.object({
    user_id: z.string(),
    coin_address: z.string(),
    coin_ticker: z.string(),
    type: z.enum(["buy", "sell"]),
    amount: z.number(),
    price: z.number(),
    total_value: z.number(),
    status: z.enum(["pending", "completed", "failed"]),
});

// Adding transaction to the database
transactionRouter.post("/add", zValidator("json", transactionSchema), async (c) => {
    try{
        const body = c.req.json();
        if (!body || typeof body !== 'object') {
            throw new Error('Invalid request body');
        }
        const { user_id, coin_address, coin_ticker, type, amount, price, total_value, status } = body as any;

        const query = `
        INSERT INTO transactions (
        user_id,
        coin_address,
        coin_ticker,
        type,
        amount,
        price,
        total_value,
        status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const { result } = await env.DB.prepare(query)
        .bind(user_id, coin_address, coin_ticker, type, amount, price, total_value, status)
        .run();
        return new Response(JSON.stringify({ success: true, id: result.lastInsertRowId }), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
            status: 500,
        });
    }
});

// Getting all transactions of a user 
transactionRouter.get("/all/:user_id", zValidator("query", z.object({user_id: z.string()})), async (c) => {
    const user_id  = c.req.query;
    try {
        const query = `
        SELECT * FROM transactions WHERE user_id = ?;
        `;

        const { result } = await env.DB.prepare(query).bind(user_id).all();
        return new Response(JSON.stringify({ success: true, data: result }), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
            status: 500,
        });
    }
});

// Getting a transaction by id
transactionRouter.get("/get/:id", zValidator("query", z.object({id: z.string()})), async (c) => {
    const id = c.req.query;
    try {
        const query = `
        SELECT * FROM transactions WHERE id = ?;
        `;

        const { result } = await env.DB.prepare(query).bind(id).get();
        return new Response(JSON.stringify({ success: true, data: result }), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
            status: 500,
        });
    }
});
