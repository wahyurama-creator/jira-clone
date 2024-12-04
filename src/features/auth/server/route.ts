 import { Hono } from 'hono';
import { zValidator } from "@hono/zod-validator";
import { signInSchema, signUpSchema } from "../schemas";

const app = new Hono()
    .post(
        "/login",
        zValidator("json", signInSchema),
        async (c) => {
            const { email, password } = c.req.valid("json");

            return c.json({ email, password });
        },
    )
    .post(
        "/register",
        zValidator("json", signUpSchema),
        async (c) => {
            const { name, email, password } = c.req.valid("json");

            return c.json({ name, email, password });
        },
    );

export default app;