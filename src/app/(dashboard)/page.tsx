import {getCurrent} from "@/features/auth/actions";
import {redirect} from "next/navigation";
import {CreateWorkspaceForm} from "@/features/workspaces/components/create-workspace-form";

export default async function Home() {
    const user = await getCurrent();

    if (!user) {
        redirect("/sign-in");
    }

    return (
        <div className="px-4 py-4">
            Home page view
            <div className={"text-neutral-500 h-full"}>
                <CreateWorkspaceForm/>
            </div>
        </div>
    );
}
