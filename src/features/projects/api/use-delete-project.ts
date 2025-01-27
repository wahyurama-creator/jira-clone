import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.projects[":projectId"]["$delete"], 200>;
type RequestType = InferRequestType<typeof client.api.projects[":projectId"]["$delete"]>;

export const useDeleteProject = () => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.projects[":projectId"]["$delete"]({ param });

            if (!response.ok) {
                throw new Error("Failed to delete project - " + response.statusText);
            }

            return await response.json();
        },
        onSuccess: async ({ data }) => {
            toast.success("Project delete successfully");

            await queryClient.invalidateQueries({ queryKey: ["projects"] });
            await queryClient.invalidateQueries({ queryKey: ["project", data.$id] });
        },
        onError: (error) => {
            toast.error("Failed to delete project - " + error.message);
        },
    });
};