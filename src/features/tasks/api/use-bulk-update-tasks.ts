import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.tasks["bulk-update"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.tasks["bulk-update"]["$post"]>;

export const useBulkUpdateTasks = () => {
    // const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.tasks["bulk-update"]["$post"]({ json });

            if (!response.ok) {
                throw new Error("Failed to update tasks - " + response.statusText);
            }

            return await response.json();
        },
        onSuccess: async () => {
            toast.success("Tasks updated successfully");

            await queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
            await queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
            
            await queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
        onError: (error) => {
            toast.error("Failed to updated tasks - " + error.message);
        },
    });
};