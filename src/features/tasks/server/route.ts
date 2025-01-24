import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createTaskSchema } from "../schemas";
import { getMember } from "@/features/members/utils";
import { COLLECTION_MEMBERS_ID, COLLECTION_PROJECTS_ID, COLLECTION_TASKS_ID, DATABASE_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { Task, TaskStatus } from "../types";
import { createAdminClient } from "@/lib/appwrite";
import { Project } from "@/features/projects/types";

const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        zValidator(
            "query",
            z.object({
                workspaceId: z.string(),
                projectId: z.string().nullish(),
                assigneeId: z.string().nullish(),
                status: z.nativeEnum(TaskStatus).nullish(),
                search: z.string().nullish(),
                dueDate: z.string().nullish(),
            }),
        ),
        async (context) => {
            const { users } = await createAdminClient();
            const databases = context.get("databases");
            const user = context.get("user");

            const {
                workspaceId,
                projectId,
                status,
                search,
                assigneeId,
                dueDate,
            } = context.req.valid("query");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return context.json({ error: "Unauthorized" }, 401);
            }

            const query = [
                Query.equal("workspaceId", workspaceId),
                Query.orderDesc("$createdAt"),

            ];

            if (projectId) {
                query.push(Query.equal("projectId", projectId));
            }

            if (status) {
                query.push(Query.equal("status", status));
            }

            if (assigneeId) {
                query.push(Query.equal("assigneeId", assigneeId));
            }

            if (dueDate) {
                query.push(Query.equal("dueDate", dueDate));
            }

            if (search) {
                query.push(Query.search("name", search));
            }

            const tasks = await databases.listDocuments<Task>(
                DATABASE_ID,
                COLLECTION_TASKS_ID,
                query,
            )

            const projectIds = tasks.documents.map((task) => task.projectId);
            const assigneeIds = tasks.documents.map((task) => task.assigneeId);

            const projects = await databases.listDocuments<Project>(
                DATABASE_ID,
                COLLECTION_PROJECTS_ID,
                projectIds.length > 0 ? [Query.contains("$id", projectIds)] : [],
            );

            const members = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_MEMBERS_ID,
                assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : [],
            );

            const assignees = await Promise.all(
                members.documents.map(async (member) => {
                    const user = await users.get(member.userId);

                    return {
                        ...member,
                        name: user.name,
                        email: user.email,
                    }
                })
            );

            const populatedTasks = tasks.documents.map((task) => {
                const project = projects.documents.find(
                    (project) => project.$id === task.projectId,
                );

                const assignee = assignees.find(
                    (assignee) => assignee.$id === task.assigneeId,
                );

                return {
                    ...task,
                    project,
                    assignee,
                };
            });

            return context.json({
                data: {
                    ...tasks,
                    documents: populatedTasks,
                },
            });
        },
    )
    .post(
        "/",
        sessionMiddleware,
        zValidator("json", createTaskSchema),
        async (context) => {
            const user = context.get("user");
            const databases = context.get("databases");

            const {
                name,
                status,
                workspaceId,
                projectId,
                dueDate,
                assigneeId,
            } = context.req.valid("json");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return context.json({ error: "Unauthorized" }, 401);
            }

            const highestPositionTask = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_TASKS_ID,
                [
                    Query.equal("status", status),
                    Query.equal("workspaceId", workspaceId),
                    Query.orderAsc("position"),
                    Query.limit(1),
                ]
            )

            const newPosition =
                highestPositionTask.documents.length > 0 ?
                    highestPositionTask.documents[0].position + 1000 : 1000;

            const task = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_TASKS_ID,
                ID.unique(),
                {
                    name,
                    status,
                    workspaceId,
                    projectId,
                    dueDate,
                    assigneeId,
                    position: newPosition,
                }
            )

            return context.json({ data: task })
        },
    )
    .delete(
        "/:taskId",
        sessionMiddleware,
        async (context) => {
            const user = context.get("user");
            const databases = context.get("databases");
            const { taskId } = context.req.param();

            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                COLLECTION_TASKS_ID,
                taskId
            );

            const member = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return context.json({ error: "Unauthorized" }, 401);
            }

            await databases.deleteDocument(DATABASE_ID, COLLECTION_TASKS_ID, taskId);

            return context.json({ data: { $id: task.$id } });
        },
    )
    .patch(
        "/:taskId",
        sessionMiddleware,
        zValidator("json", createTaskSchema.partial()),
        async (context) => {
            const user = context.get("user");
            const databases = context.get("databases");

            const {
                name,
                status,
                description,
                projectId,
                dueDate,
                assigneeId,
            } = context.req.valid("json");
            const { taskId } = context.req.param();

            const existingTask = await databases.getDocument<Task>(DATABASE_ID, COLLECTION_TASKS_ID, taskId);

            const member = await getMember({
                databases,
                workspaceId: existingTask.workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return context.json({ error: "Unauthorized" }, 401);
            }

            const task = await databases.updateDocument<Task>(
                DATABASE_ID,
                COLLECTION_TASKS_ID,
                taskId,
                {
                    name,
                    status,
                    projectId,
                    dueDate,
                    assigneeId,
                    description,
                }
            )

            return context.json({ data: task })
        },
    )
    .get(
        "/:taskId",
        sessionMiddleware,
        async (context) => {
            const currentUser = context.get("user");
            const databases = context.get("databases");

            const { users } = await createAdminClient();
            const { taskId } = context.req.param();

            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                COLLECTION_TASKS_ID,
                taskId
            );

            const currentMember = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: currentUser.$id,
            });

            if (!currentMember) {
                return context.json({ error: "Unathorized" }, 401);
            }

            const project = await databases.getDocument(
                DATABASE_ID,
                COLLECTION_PROJECTS_ID,
                task.projectId,
            );

            const member = await databases.getDocument(
                DATABASE_ID,
                COLLECTION_MEMBERS_ID,
                task.assigneeId,
            );

            const user = await users.get(member.userId);

            const assignee = {
                ...member,
                name: user.name,
                email: user.email,
            };

            return context.json({
                data: {
                    ...task,
                    project,
                    assignee,
                }
            });
        }
    );

export default app;