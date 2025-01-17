import { BUCKET_IMAGES_ID, COLLECTION_PROJECTS_ID, DATABASE_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { createProjectSchema, updateProjectSchema } from "../shcemas";
import { Project } from "../types";

const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        zValidator(
            "query",
            z.object({ workspaceId: z.string() })
        ),
        async (context) => {
            const user = context.get("user");
            const databases = context.get("databases");

            const { workspaceId } = context.req.valid("query");

            if (!workspaceId) {
                return context.json({ error: "Missing workspace id" }, 400);
            }

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return context.json({ error: "Unauthorized" }, 401);
            }

            const projects = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_PROJECTS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.orderDesc("$createdAt"),
                ],
            );

            return context.json({ data: projects });
        },
    )
    .post(
        "/",
        sessionMiddleware,
        zValidator("form", createProjectSchema),
        async (context) => {
            const databases = context.get("databases");
            const user = context.get("user");
            const storage = context.get("storage");

            const { name, image, workspaceId } = context.req.valid("form");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return context.json({ error: "Unauthorized" }, 401);
            }

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

            const project = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_PROJECTS_ID,
                ID.unique(),
                {
                    name: name,
                    imageUrl: uploadImageUrl,
                    workspaceId
                }
            );

            return context.json({ data: project });
        }
    )
    .patch(
        "/:projectId",
        sessionMiddleware,
        zValidator("form", updateProjectSchema),
        async (context) => {
            const databases = context.get("databases");
            const storage = context.get("storage");
            const user = context.get("user");

            const { projectId } = context.req.param();
            const { name, image } = context.req.valid("form");

            const existingProject = await databases.getDocument<Project>(
                DATABASE_ID,
                COLLECTION_PROJECTS_ID,
                projectId,
            );

            const member = await getMember({
                databases: databases,
                workspaceId: existingProject.workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return context.json({ error: "Unauthorized" }, 401);
            }

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
            } else {
                uploadImageUrl = image;
            }

            const project = await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_PROJECTS_ID,
                projectId,
                {
                    name,
                    imageUrl: uploadImageUrl,
                },
            );

            return context.json({ data: project });
        }
    )
    .delete(
        "/:projectId",
        sessionMiddleware,
        async (context) => {
            const databases = context.get("databases");
            const user = context.get("user");

            const { projectId } = context.req.param();

            const existingProject = await databases.getDocument<Project>(
                DATABASE_ID,
                COLLECTION_PROJECTS_ID,
                projectId,
            );

            const member = await getMember({
                databases,
                workspaceId: existingProject.workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return context.json({ error: "Unauthorized" }, 401);
            }

            await databases.deleteDocument(
                DATABASE_ID,
                COLLECTION_PROJECTS_ID,
                projectId,
            );

            return context.json({ data: { $id: existingProject.$id } });
        },
    );

export default app;