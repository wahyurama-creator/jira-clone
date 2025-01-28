import { createAdminClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { getMember } from '../utils';
import { COLLECTION_MEMBERS_ID, DATABASE_ID } from '@/config';
import { Query } from 'node-appwrite';
import { Member, MemberRole } from "../types";

const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        zValidator(
            "query",
            z.object({
                workspaceId: z.string(),
            }),
        ),
        async (context) => {
            const { users } = await createAdminClient();
            const databases = context.get("databases");
            const user = context.get("user");
            const { workspaceId } = context.req.valid("query");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return context.json({ error: "Member not found" }, 401);
            }

            const members = await databases.listDocuments<Member>(
                DATABASE_ID,
                COLLECTION_MEMBERS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                ]
            );

            const populatedMembers = await Promise.all(
                members.documents.map(async (member) => {
                    const user = await users.get(member.userId);
                    return {
                        ...member,
                        name: user.name || user.email,
                        email: user.email,
                    };
                })
            );

            return context.json({
                data: {
                    ...members,
                    documents: populatedMembers,
                }
            });
        },
    )
    .delete(
        "/:memberId",
        sessionMiddleware,
        async (context) => {
            const { memberId } = context.req.param();
            const user = context.get("user");
            const databases = context.get("databases");

            const memberToDelete = await databases.getDocument(
                DATABASE_ID,
                COLLECTION_MEMBERS_ID,
                memberId,
            );

            const allMembersInWorkspace = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_MEMBERS_ID,
                [
                    Query.equal("workspaceId", memberToDelete.workspaceId),
                ]
            );

            const member = await getMember({
                databases,
                workspaceId: memberToDelete.workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return context.json({ error: "Unauthorized" }, 401);
            }

            if (member.$id !== memberToDelete.$id && member.role != MemberRole.ADMIN) {
                return context.json({ error: "Unauthorized" }, 401);
            }

            if (allMembersInWorkspace.documents.length === 1) {
                return context.json({ error: "Cannot delete the last member" }, 400);
            }

            await databases.deleteDocument(
                DATABASE_ID,
                COLLECTION_MEMBERS_ID,
                memberId,
            );

            return context.json({ data: { $id: memberToDelete.$id } });
        },
    )
    .patch(
        "/:memberId",
        sessionMiddleware,
        zValidator(
            "json",
            z.object({
                role: z.nativeEnum(MemberRole),
            }),
        ),
        async (context) => {
            const { memberId } = context.req.param();
            const user = context.get("user");
            const databases = context.get("databases");
            const { role } = context.req.valid("json");

            const memberToUpdate = await databases.getDocument(
                DATABASE_ID,
                COLLECTION_MEMBERS_ID,
                memberId,
            );

            const allMembersInWorkspace = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_MEMBERS_ID,
                [
                    Query.equal("workspaceId", memberToUpdate.workspaceId),
                ]
            );

            const member = await getMember({
                databases,
                workspaceId: memberToUpdate.workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return context.json({ error: "Unauthorized" }, 401);
            }

            if (member.role != MemberRole.ADMIN) {
                return context.json({ error: "Unauthorized" }, 401);
            }

            if (allMembersInWorkspace.documents.length === 1) {
                return context.json({ error: "Cannot downgrade the last member" }, 400);
            }

            await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_MEMBERS_ID,
                memberId,
                {
                    role,
                }
            );

            return context.json({ data: { $id: memberToUpdate.$id } });
        },
    );

export default app;