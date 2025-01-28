import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createWorkspaceSchema, updateWorkspaceSchema } from "@/features/workspaces/schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { BUCKET_IMAGES_ID, COLLECTION_MEMBERS_ID, COLLECTION_TASKS_ID, COLLECTION_WORKSPACES_ID, DATABASE_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { MemberRole } from "@/features/members/types";
import { generateInviteCode } from "@/lib/utils";
import { getMember } from "@/features/members/utils";
import { z } from "zod";
import { Workspace } from "../types";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { Task, TaskStatus } from "@/features/tasks/types";

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

            return context.json({ data: workspaces });
        })
    .get(
        "/:workspaceId",
        sessionMiddleware,
        async (context) => {
            const user = context.get("user");
            const databases = context.get("databases");
            const { workspaceId } = context.req.param();

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return context.json({ error: "Unauthorized" }, 401);
            }

            const workspace = await databases.getDocument<Workspace>(
                DATABASE_ID,
                COLLECTION_WORKSPACES_ID,
                workspaceId
            );

            return context.json({ data: workspace });
        },
    )
    .get(
        "/:workspaceId/info",
        sessionMiddleware,
        async (context) => {
            const databases = context.get("databases");
            const { workspaceId } = context.req.param();

            const workspace = await databases.getDocument<Workspace>(
                DATABASE_ID,
                COLLECTION_WORKSPACES_ID,
                workspaceId
            );

            return context.json({
                data: {
                    $id: workspace.$id,
                    name: workspace.name,
                    imageUrl: workspace.imageUrl
                },
            });
        },
    )
    .post(
        "/",
        zValidator("form", createWorkspaceSchema),
        sessionMiddleware,
        async (context) => {
            const databases = context.get("databases");
            const user = context.get("user");
            const storage = context.get("storage");

            const { name, image } = context.req.valid("form");

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

            return context.json({ data: workspace });
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

            const { workspaceId } = context.req.param();
            const { name, image } = context.req.valid("form");

            const member = await getMember({
                databases: databases,
                workspaceId: workspaceId,
                userId: user.$id,
            });

            if (!member || member.role !== MemberRole.ADMIN) {
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

            const workspace = await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_WORKSPACES_ID,
                workspaceId,
                {
                    name,
                    imageUrl: uploadImageUrl,
                },
            );

            return context.json({ data: workspace });
        }
    )
    .delete(
        "/:workspaceId",
        sessionMiddleware,
        async (context) => {
            const databases = context.get("databases");
            const user = context.get("user");

            const { workspaceId } = context.req.param();

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member || member.role !== MemberRole.ADMIN) {
                return context.json({ error: "Unauthorized" }, 401);
            }

            await databases.deleteDocument(
                DATABASE_ID,
                COLLECTION_WORKSPACES_ID,
                workspaceId,
            );

            return context.json({ data: { $id: workspaceId } });
        },
    )
    .post(
        "/:workspaceId/reset-invite-code",
        sessionMiddleware,
        async (context) => {
            const databases = context.get("databases");
            const user = context.get("user");

            const { workspaceId } = context.req.param();

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member || member.role !== MemberRole.ADMIN) {
                return context.json({ error: "Unauthorized" }, 401);
            }

            const workspace = await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_WORKSPACES_ID,
                workspaceId,
                {
                    inviteCode: generateInviteCode(6),
                }
            );

            return context.json({ data: workspace });
        },
    )
    .post(
        "/:workspaceId/join",
        sessionMiddleware,
        zValidator(
            "json",
            z.object({
                code: z.string(),
            })
        ),
        async (context) => {
            const { workspaceId } = context.req.param();
            const { code } = context.req.valid("json");

            const databases = context.get("databases");
            const user = context.get("user");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (member) {
                return context.json({ error: "Already a member" }, 400);
            }

            const workspace = await databases.getDocument<Workspace>(
                DATABASE_ID,
                COLLECTION_WORKSPACES_ID,
                workspaceId,
            );

            if (workspace.inviteCode !== code) {
                return context.json({ error: "Invalid code" }, 400);
            }

            await databases.createDocument(
                DATABASE_ID,
                COLLECTION_MEMBERS_ID,
                ID.unique(),
                {
                    userId: user.$id,
                    workspaceId: workspaceId,
                    role: MemberRole.MEMBER,
                }
            );

            return context.json({ data: workspace });
        },
    )
    .get(
        "/:workspaceId/analytics",
        sessionMiddleware,
        async (context) => {
            const databases = context.get("databases");
            const user = context.get("user");
            const { workspaceId } = context.req.param();

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return context.json({ error: "Unauthorized" }, 401);
            }

            const now = new Date();
            const thisMonthStart = startOfMonth(now);
            const thisMonthEnd = endOfMonth(now);
            const lastMonthStart = startOfMonth(subMonths(now, 1));
            const lastMonthEnd = endOfMonth(subMonths(now, 1));

            // Monthly Task
            const thisMonthTasks = await databases.listDocuments<Task>(
                DATABASE_ID,
                COLLECTION_TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ],
            );

            const lastMonthTasks = await databases.listDocuments<Task>(
                DATABASE_ID,
                COLLECTION_TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ],
            );

            const taskCount = thisMonthTasks.total;
            const taskDifference = taskCount - lastMonthTasks.total;

            // Assigned
            const thisMonthAssignedTasks = await databases.listDocuments<Task>(
                DATABASE_ID,
                COLLECTION_TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ],
            );

            const lastMonthAssignedTasks = await databases.listDocuments<Task>(
                DATABASE_ID,
                COLLECTION_TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ],
            );

            const assignedTaskCount = thisMonthAssignedTasks.total;
            const assignedTaskDifference = assignedTaskCount - lastMonthAssignedTasks.total;

            // Incomplete
            const thisMonthIncompleteTasks = await databases.listDocuments<Task>(
                DATABASE_ID,
                COLLECTION_TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ],
            );

            const lastMonthIncomlpeteTasks = await databases.listDocuments<Task>(
                DATABASE_ID,
                COLLECTION_TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ],
            );

            const incompleteTaskCount = thisMonthIncompleteTasks.total;
            const incompleteTaskDifference = incompleteTaskCount - lastMonthIncomlpeteTasks.total;

            // Completed
            const thisMonthCompletedTasks = await databases.listDocuments<Task>(
                DATABASE_ID,
                COLLECTION_TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ],
            );

            const lastMonthComlpetedTasks = await databases.listDocuments<Task>(
                DATABASE_ID,
                COLLECTION_TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ],
            );

            const completedTaskCount = thisMonthCompletedTasks.total;
            const completedTaskDifference = completedTaskCount - lastMonthComlpetedTasks.total;

            // Overdue
            const thisMonthOverdueTasks = await databases.listDocuments<Task>(
                DATABASE_ID,
                COLLECTION_TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.lessThan("dueDate", now.toISOString()),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ],
            );

            const lastMonthOverdueTasks = await databases.listDocuments<Task>(
                DATABASE_ID,
                COLLECTION_TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.lessThan("dueDate", now.toISOString()),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                ],
            );

            const overdueTaskCount = thisMonthOverdueTasks.total;
            const overdueTaskDifference = overdueTaskCount - lastMonthOverdueTasks.total;

            return context.json({
                data: {
                    taskCount,
                    taskDifference,
                    assignedTaskCount,
                    assignedTaskDifference,
                    completedTaskCount,
                    completedTaskDifference,
                    incompleteTaskCount,
                    incompleteTaskDifference,
                    overdueTaskCount,
                    overdueTaskDifference,
                },
            });
        },
    );

export default app;