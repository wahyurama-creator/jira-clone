import { useQuery } from '@tanstack/react-query';
import { client } from "@/lib/rpc";
import { InferResponseType } from 'hono';

interface useGetWorkspaceAnalyticsProps {
    workspaceId: string;
};

export type ProjectAnalyticsResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["analytics"]["$get"], 200>;

export const useGetWorkspaceAnalytics = ({ workspaceId }: useGetWorkspaceAnalyticsProps) => {
    return useQuery({
        queryKey: ["workspace-analytics", workspaceId],
        queryFn: async () => {
            const response = await client.api.workspaces[":workspaceId"]["analytics"].$get({
                param: { workspaceId },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch workspace analytics  - " + response.statusText);
            }

            const { data } = await response.json();
            return data;
        },
    });
}