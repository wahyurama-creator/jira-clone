import { getCurrent } from "@/features/auth/queries";
import { UpdateProjectForm } from "@/features/projects/components/update-project-form";
import { GetProjectById } from "@/features/projects/queries";
import { redirect } from "next/navigation";

interface ProjectIdSettingsPageProps {
    params: {
        projectId: string;
    }
};

const ProjectIdSettingsPage = async ({ params }: ProjectIdSettingsPageProps) => {
    const { projectId } = await params;
    const user = await getCurrent();
    if (!user) {
        redirect("/sign-in");
    }

    const initialProject = await GetProjectById({ projectId });

    return (
        <div className="w-full lg:max-w-xl">
            <UpdateProjectForm initialValues={initialProject} />
        </div>
    );
};

export default ProjectIdSettingsPage;