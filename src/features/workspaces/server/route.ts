import {Hono} from "hono";
import {zValidator} from "@hono/zod-validator";
import {createWorkspaceSchema} from "@/features/workspaces/schemas";
import {sessionMiddleware} from "@/lib/session-middleware";
import {COLLECTION_WORKSPACES_ID, DATABASE_ID} from "@/config";
import {ID} from "node-appwrite";

const app = new Hono()
    .post(
        "/",
        zValidator("json", createWorkspaceSchema),
        sessionMiddleware,
        async (context) => {
            const databases = context.get("databases");
            const user = context.get("user");
            const {name} = context.req.valid("json");

            const workspace = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_WORKSPACES_ID,
                ID.unique(),
                {
                    name: name,
                    userId: user.$id,
                }
            );

            return context.json({data: workspace});
        },
    );

export default app;