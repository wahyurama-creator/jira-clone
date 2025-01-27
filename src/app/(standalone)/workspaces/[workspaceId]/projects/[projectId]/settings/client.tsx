"use client";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { UpdateProjectForm } from "@/features/projects/components/update-project-form";
import { useProjectId } from "@/features/projects/hook/use-project-id";

export const ProjectIdSettingsClient = () => {
    const projectId = useProjectId();
    const { data: initialValues, isLoading } = useGetProject({ projectId });

    if (isLoading) {
        return <PageLoader />
    }

    if (!initialValues) {
        return <PageError message="Project not found" />
    }

    <div className="w-full lg:max-w-xl">
        <UpdateProjectForm initialValues={initialValues} />
    </div>
};