import {getCurrent} from "@/features/auth/actions";
import {redirect} from "next/navigation";
import {UpdateWorkspaceForm} from "@/features/workspaces/components/update-workspace-form";
import {getWorkspaceById} from "@/features/workspaces/actions";

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

    const workspaceId = params.workspaceId;

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