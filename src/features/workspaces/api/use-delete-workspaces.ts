import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["$delete"], 200>;
type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"]["$delete"]>;

export const useDeleteWorkspaces = () => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.workspaces[":workspaceId"]["$delete"]({ param });

            if (!response.ok) {
                throw new Error("Failed to delete workspace - " + response.statusText);
            }

            return await response.json();
        },
        onSuccess: async ({ data }) => {
            toast.success("Workspace deleted successfully");
            await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            await queryClient.invalidateQueries({ queryKey: ["workspace", data.$id] });
        },
        onError: (error) => {
            toast.error("Failed to delete workspace - " + error.message);
        },
    });
};