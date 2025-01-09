import {Hono} from "hono";
import {zValidator} from "@hono/zod-validator";
import {createWorkspaceSchema, updateWorkspaceSchema} from "@/features/workspaces/schemas";
import {sessionMiddleware} from "@/lib/session-middleware";
import {BUCKET_IMAGES_ID, COLLECTION_MEMBERS_ID, COLLECTION_WORKSPACES_ID, DATABASE_ID} from "@/config";
import {ID, Query} from "node-appwrite";
import {MemberRole} from "@/features/members/types";
import {generateInviteCode} from "@/lib/utils";
import {getMember} from "@/features/members/utils";

const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        async (context) => {
            const user = context.get("user");
            const database = context.get("databases");

            const members = await database.listDocuments(
                DATABASE_ID,
                COLLECTION_MEMBERS_ID,
                [
                    Query.equal("userId", user.$id),
                ],
            );

            if (members.total === 0) {
                return context.json({
                    data: {
                        documents: [],
                        total: 0,
                    }
                });
            }

            const workspaceIds = members.documents.map((member) => member.workspaceId);

            const workspaces = await database.listDocuments(
                DATABASE_ID,
                COLLECTION_WORKSPACES_ID,
                [
                    Query.orderDesc("$createdAt"),
                    Query.contains("$id", workspaceIds),
                ],
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
                    inviteCode: generateInviteCode(6),
                }
            );

            await databases.createDocument(
                DATABASE_ID,
                COLLECTION_MEMBERS_ID,
                ID.unique(),
                {
                    userId: user.$id,
                    workspaceId: workspace.$id,
                    role: MemberRole.ADMIN,
                }
            );

            return context.json({data: workspace});
        },
    )
    .patch(
        "/:workspaceId",
        sessionMiddleware,
        zValidator("form", updateWorkspaceSchema),
        async (context) => {
            const databases = context.get("databases");
            const storage = context.get("storage");
            const user = context.get("user");

            const {workspaceId} = context.req.param();
            const {name, image} = context.req.valid("form");

            const member = await getMember({
                databases: databases,
                workspaceId: workspaceId,
                userId: user.$id,
            });

            if (!member || member.role !== MemberRole.ADMIN) {
                return context.json({error: "Unauthorized"}, 401);
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

            const workspace = await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_WORKSPACES_ID,
                workspaceId,
                {
                    name,
                    imageUrl: uploadImageUrl,
                },
            );

            return context.json({data: workspace}); 
        }
    );

export default app;