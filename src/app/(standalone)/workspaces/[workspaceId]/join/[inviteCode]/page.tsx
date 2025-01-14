import { getCurrent } from "@/features/auth/queries";
import { JoinWorkspaceForm } from "@/features/workspaces/components/join-workspace-form";
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

    const initialValues = await getWorkspaceInfoById({ workspaceId });

    if (!initialValues) redirect("/");

    return (
        <div className="w-full lg:max-w-2xl">
            <JoinWorkspaceForm initialValues={initialValues} />
        </div>
    );
};

export default WorkspaceIdJoinPage;