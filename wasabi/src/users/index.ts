import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { env } from "hono/adapter";
import { z } from "zod";

export const userRouter = new Hono();

export interface Env {
    DB: D1Database;
  }

// get user info by id
userRouter.get("/user/:id", zValidator("query", z.object({id: z.string()})), async (c) => {
    try {
    const id  = c.req.query;
    const query = `
    SELECT * FROM users WHERE id = ?;
    `;

    const { result } = await env.DB.prepare(query)
    .bind(id)
    .get();

    return new Response(JSON.stringify(result), {
        status: 200,
    });
    } catch (error) {
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
        status: 500,
    });
    }
});

// Save user details from supabase
userRouter.post("/user", zValidator("json", z.object({
    id: z.string(),
    username: z.string(),
    bio: z.string().optional(),
    profile_image_url: z.string().optional(),
    pub_address: z.string().optional(),
    created_at: z.string(),
    last_login: z.string().optional(),
})), async (c) => {
    const body = c.req.json();
    const { id, username, bio, profile_image_url, pub_address, created_at, last_login } = body as any;
    try {
        const query = `
        INSERT INTO users (id, username, bio, profile_image_url, pub_address, created_at, last_login) 
        VALUES (?, ?, ?, ?, ?, ?, ?);
        `;

        const { result } = await env.DB.prepare(query)
        .bind(id, username, bio, profile_image_url, pub_address, created_at, last_login)
        .run();

        return new Response(JSON.stringify(result), {
            status: 200,
        });
        } catch (error) {
        return c.json({ success: false, error: (error as Error).message }, 500);
    }
});