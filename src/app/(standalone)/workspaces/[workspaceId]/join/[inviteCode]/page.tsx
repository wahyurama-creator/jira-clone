import { getCurrent } from "@/features/auth/queries";
import { getWorkspaceInfoById } from "@/features/workspaces/queries";
import { redirect } from "next/navigation";


interface WorkspaceIdJoinPageProps {
    params: {
        workspaceId: string;
    }
};


const WorkspaceIdJoinPage = async ({ params }: WorkspaceIdJoinPageProps) => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");

    const { workspaceId } = await params;

    const workspace = await getWorkspaceInfoById({ workspaceId });

    return (
        <div>
            <p>{JSON.stringify(workspace)}</p>
        </div>
    );
};

export default WorkspaceIdJoinPage;