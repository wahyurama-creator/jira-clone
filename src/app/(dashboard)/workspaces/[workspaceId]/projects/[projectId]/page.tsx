import { Button } from "@/components/ui/button";
import { getCurrent } from "@/features/auth/queries";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { GetProjectById } from "@/features/projects/queries";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";
import { PencilIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { toast } from "sonner";

interface ProjectIdPageProps {
    params: {
        projectId: string;
    }
}

const ProjectIdPage = async ({ params }: ProjectIdPageProps) => {
    const user = await getCurrent();
    if (!user) {
        redirect("/sign-in");
    }

    const { projectId } = await params;
    const initialProject = await GetProjectById({ projectId });

    if (!initialProject) {
        toast.error("Project Not Found");
        redirect("/");
    }

    return (
        <div className="flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-4">
                    <ProjectAvatar
                        name={initialProject?.name}
                        image={initialProject?.imageUrl}
                        className={"size-8"}
                    />
                    <p className="text-lg font-semibold">
                        {initialProject.name}
                    </p>
                </div>
                <div className="">
                    <Button variant={"secondary"} size={"sm"} asChild>
                        <Link href={`/workspaces/${initialProject.workspaceId}/projects/${initialProject.$id}/settings `}>
                            <PencilIcon className="size-4 mr-2" />
                            Edit Project
                        </Link>
                    </Button>
                </div>
            </div>
            <TaskViewSwitcher hideProjectFilter />
        </div>
    );
};

export default ProjectIdPage;