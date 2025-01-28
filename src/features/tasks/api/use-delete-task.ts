import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["$delete"], 200>;
type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["$delete"]>;

export const useDeleteTask = () => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.tasks[":taskId"]["$delete"]({ param });

            if (!response.ok) {
                throw new Error("Failed to delete task - " + response.statusText);
            }

            return await response.json();
        },
        onSuccess: async ({data}) => {
            toast.success("Task deleted successfully");

            await queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
            await queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
            
            await queryClient.invalidateQueries({ queryKey: ["tasks"] });
            await queryClient.invalidateQueries({ queryKey: ["task", data.$id] });
        },
        onError: (error) => {
            toast.error("Failed to delete task - " + error.message);
        },
    });
};