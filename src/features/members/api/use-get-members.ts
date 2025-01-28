import { useQuery } from '@tanstack/react-query';
import { client } from "@/lib/rpc";

interface UseGetMembersProps {
    workspaceId: string;
}

export const useGetMembers = ({ workspaceId }: UseGetMembersProps) => {
    return useQuery({
        queryKey: ["members", workspaceId],
        queryFn: async () => {
            const response = await client.api.members.$get({ query: { workspaceId } });

            if (!response.ok) {
                throw new Error("Failed to fetch members - " + response.statusText);
            }

            const { data } = await response.json();
            return data;
        },
    });
}