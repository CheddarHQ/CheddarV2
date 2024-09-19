import { Hono } from "hono";
import { logger } from "hono/logger";
import { userRouter } from "./users";
import { transactionRouter } from "./transactions";
import { chatRouter } from "./room";

const app = new Hono()

app.use("*", logger());

app.route("/api/user", userRouter);
app.route("/api/transaction", transactionRouter);
app.route("/api/chat", chatRouter);

export default app;
export type App = typeof app;
export const fetch = app.fetch;