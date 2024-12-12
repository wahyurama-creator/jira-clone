import {Hono} from 'hono';
import {zValidator} from "@hono/zod-validator";
import {signInSchema, signUpSchema} from "../schemas";
import {createAdminClient} from "@/lib/appwrite";
import {ID} from "node-appwrite";
import {deleteCookie, setCookie} from "hono/cookie";
import {AUTH_COOKIE_KEY} from "@/features/auth/constans";
import {sessionMiddleware} from "@/lib/session-middleware";

const app = new Hono()
    .get(
        "/current",
        sessionMiddleware,
        async (context) => {
            const user = context.get("user");

            return context.json({data: user});
        }
    )
    .post(
        "/login",
        zValidator("json", signInSchema),
        async (context) => {
            const {email, password} = context.req.valid("json");

            return context.json({email, password});
        },
    )
    .post(
        "/register",
        zValidator("json", signUpSchema),
        async (context) => {
            const {name, email, password} = context.req.valid("json");

            const {account} = await createAdminClient();
            const user = await account.create(
                ID.unique(),
                email,
                password,
                name
            );

            const session = await account.createEmailPasswordSession(
                email,
                password
            );

            setCookie(
                context,
                AUTH_COOKIE_KEY,
                session.secret,
                {
                    path: "/",
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict",
                    maxAge: 60 * 60 * 24 * 30,
                },
            )

            return context.json({data: user});
        },
    ).post("/logout", sessionMiddleware, async (context) => {
        const account = context.get("account");

        deleteCookie(context, AUTH_COOKIE_KEY, {path: "/"});
        await account.deleteSession("current");

        return context.json({success: true});
    });

export default app;