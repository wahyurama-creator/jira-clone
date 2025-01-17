import { COLLECTION_PROJECTS_ID, DATABASE_ID } from "@/config";
import { createSessionClient } from "@/lib/appwrite";
import { Project } from "./types";
import { getMember } from "../members/utils";


interface GetProjectByIdProps {
    projectId: string;
}

export const GetProjectById = async ({ projectId }: GetProjectByIdProps) => {
    const { account, databases } = await createSessionClient();
    const user = await account.get();


    const project = await databases.getDocument<Project>(
        DATABASE_ID,
        COLLECTION_PROJECTS_ID,
        projectId,
    );

    const member = await getMember({
        databases,
        userId: user.$id,
        workspaceId: project.workspaceId,
    });

    if (!member) {
        throw new Error("You are not a member of this project");
    }

    return project;
}