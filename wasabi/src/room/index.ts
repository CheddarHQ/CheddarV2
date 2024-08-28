import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { env } from "hono/adapter";
import { z } from "zod";

export const chatRouter = new Hono();

export interface Env {
    DB: D1Database;
}

chatRouter.post("/message", zValidator("json", z.object({
    room_id: z.string(),
    user_id: z.string(),
    content: z.string(),
    created_at: z.string(),
})), async (c) => {
    const body = await c.req.json();
    const { room_id, user_id, content, created_at } = body as any;
    try {
        const query = `
        INSERT INTO messages (room_id, user_id, content, created_at, likes_count)
        VALUES (?, ?, ?, ?, 0);
        `;
        
        const { result } = await env.DB.prepare(query)
        .bind(room_id, user_id, content, created_at)
        .run();

        return c.json({ success: true, id: result.lastInsertRowId }, 200);
    } catch (error) {
        return c.json({ success: false, error: (error as Error).message }, 500);
    }
});

// Get messages for a specific room
chatRouter.get("/messages/:roomId", zValidator("query", z.object({ roomId: z.string() })), async (c) => {
    const { roomId } = c.req.query();
    try {
        const query = `
        SELECT * FROM messages WHERE room_id = ? ORDER BY created_at DESC LIMIT 50;
        `;

        const { results } = await env.DB.prepare(query)
        .bind(roomId)
        .all();

        return c.json(results, 200);
    } catch (error) {
        return c.json({ success: false, error: (error as Error).message }, 500);
    }
});

// Create a chat room
chatRouter.post("/chat_room", zValidator("json", z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    admin_id: z.string(),
    created_at: z.string(),
})), async (c) => {
    const body = await c.req.json();
    const { id, name, description, admin_id, created_at } = body as any;
    try {
        const query = `
        INSERT INTO chat_rooms (id, name, description, admin_id, created_at)
        VALUES (?, ?, ?, ?, ?);
        `;
        
        await env.DB.prepare(query)
        .bind(id, name, description, admin_id, created_at)
        .run();

        return c.json({ success: true, id: id }, 200);
    } catch (error) {
        return c.json({ success: false, error: (error as Error).message }, 500);
    }
});

// Get all chat rooms
chatRouter.get("/chat_rooms", async (c) => {
    try {
        const query = `
        SELECT * FROM chat_rooms;
        `;

        const { results } = await env.DB.prepare(query).all();

        return c.json(results, 200);
    } catch (error) {
        return c.json({ success: false, error: (error as Error).message }, 500);
    }
});

// Join a chat room
chatRouter.post("/chat_room/join", zValidator("json", z.object({
    user_id: z.string(),
    room_id: z.string(),
    joined_at: z.string(),
})), async (c) => {
    const body = await c.req.json();
    const { user_id, room_id, joined_at } = body as any;
    try {
        const query = `
        INSERT INTO room_participants (user_id, room_id, joined_at)
        VALUES (?, ?, ?);
        `;
        
        const { result } = await env.DB.prepare(query)
        .bind(user_id, room_id, joined_at)
        .run();

        return c.json({ success: true }, 200);
    } catch (error) {
        return c.json({ success: false, error: (error as Error).message }, 500);
    }
});