import {Hono} from "hono";
import {zValidator} from "@hono/zod-validator";
import {createWorkspaceSchema} from "@/features/workspaces/schemas";
import {sessionMiddleware} from "@/lib/session-middleware";
import {BUCKET_IMAGES_ID, COLLECTION_WORKSPACES_ID, DATABASE_ID} from "@/config";
import {ID} from "node-appwrite";

const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        async (context) => {
            const database = context.get("databases");
            const workspaces = await database.listDocuments(
                DATABASE_ID,
                COLLECTION_WORKSPACES_ID,
            );

            return context.json({data: workspaces});
        })
    .post(
        "/",
        zValidator("form", createWorkspaceSchema),
        sessionMiddleware,
        async (context) => {
            const databases = context.get("databases");
            const user = context.get("user");
            const storage = context.get("storage");

            const {name, image} = context.req.valid("form");

            let uploadImageUrl: string | undefined

            if (image instanceof File) {
                const file = await storage.createFile(
                    BUCKET_IMAGES_ID,
                    ID.unique(),
                    image,
                );

                const arrayBuffer = await storage.getFilePreview(
                    BUCKET_IMAGES_ID,
                    file.$id,
                )

                uploadImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
            }

            const workspace = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_WORKSPACES_ID,
                ID.unique(),
                {
                    name: name,
                    userId: user.$id,
                    imageUrl: uploadImageUrl,
                }
            );

            return context.json({data: workspace});
        },
    );

export default app;