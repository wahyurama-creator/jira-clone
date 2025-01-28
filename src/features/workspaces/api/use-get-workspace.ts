import { useQuery } from '@tanstack/react-query';
import { client } from "@/lib/rpc";

interface UseGetWorkspaceProps {
    workspaceId: string;
};

export const useGetWorkspace = ({ workspaceId }: UseGetWorkspaceProps) => {
    return useQuery({
        queryKey: ["workspace", workspaceId],
        queryFn: async () => {
            const response = await client.api.workspaces[":workspaceId"].$get({
                param: { workspaceId }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch workspace - " + response.statusText);
            }

            const { data } = await response.json();
            return data;
        },
    });
}