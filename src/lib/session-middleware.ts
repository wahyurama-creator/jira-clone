import "server-only"

import {
    Account,
    Client,
    Databases,
    Models,
    Storage,
    type Account as AccountType,
    type Databases as DatabaseType,
    type Storage as StorageType,
    type Users as UsersType,
} from "node-appwrite"

import {getCookie} from "hono/cookie";
import {createMiddleware} from "hono/factory";
import {AUTH_COOKIE_KEY} from "@/features/auth/constans";

type AdditionalContext = {
    Variables: {
        account: AccountType;
        databases: DatabaseType;
        storage: StorageType;
        users: UsersType;
        user: Models.User<Models.Preferences>;
    };
}

export const sessionMiddleware = createMiddleware<AdditionalContext>(
    async (context, next) => {
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

        const session = getCookie(context, AUTH_COOKIE_KEY);

        // if session is not present, return early
        if (!session) {
            return context.json({error: "Unauthorized"}, 401);
        }

        client.setSession(session);

        const account = new Account(client);
        const databases = new Databases(client);
        const storage = new Storage(client);
        const user = await account.get();

        context.set("account", account);
        context.set("databases", databases);
        context.set("storage", storage);
        context.set("user", user);

        await next();
    },
);