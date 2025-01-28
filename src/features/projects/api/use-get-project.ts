import { useQuery } from '@tanstack/react-query';
import { client } from "@/lib/rpc";

interface useGetProjectProps {
    projectId: string;
};

export const useGetProject = ({ projectId }: useGetProjectProps) => {
    return useQuery({
        queryKey: ["project", projectId],
        queryFn: async () => {
            const response = await client.api.projects[":projectId"].$get({
                param: { projectId },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch project  - " + response.statusText);
            }

            const { data } = await response.json();
            return data;
        },
    });
}