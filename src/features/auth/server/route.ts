 import { Hono } from 'hono';
import { zValidator } from "@hono/zod-validator";
import { signInSchema } from "../schemas";

const app = new Hono()
    .post(
        "/login",
        zValidator("json", signInSchema),
        async (c) => {
            const { email, password } = c.req.valid("json");

            return c.json({ email, password });
        },
    );

export default app;