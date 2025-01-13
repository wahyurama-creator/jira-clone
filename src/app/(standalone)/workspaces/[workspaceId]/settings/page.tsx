import {getCurrent} from "@/features/auth/queries";
import {redirect} from "next/navigation";
import {UpdateWorkspaceForm} from "@/features/workspaces/components/update-workspace-form";
import {getWorkspaceById} from "@/features/workspaces/queries";

interface WorkspaceIdSettingsPageProps {
    params: {
        workspaceId: string;
    },
}

const WorkspaceIdSettingsPage = async ({params}: WorkspaceIdSettingsPageProps) => {
    const user = await getCurrent();
    if (!user) {
        redirect("/sign-in");
    }

    const {workspaceId} = await params;

    const initialValue = await getWorkspaceById({workspaceId});
    if (!initialValue) {
        redirect(`/workspaces/${workspaceId}`);
    }

    return (
        <div className={"w-full lg:max-w-xl"}>
            <UpdateWorkspaceForm initialValues={initialValue}/>
        </div>
    );
};

export default WorkspaceIdSettingsPage;