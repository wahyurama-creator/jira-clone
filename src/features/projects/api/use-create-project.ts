import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.projects["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.projects["$post"]>;

export const useCreateProject = () => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ form }) => {
            const response = await client.api.projects["$post"]({ form });

            if (!response.ok) {
                throw new Error("Failed to create project - " + response.statusText);
            }

            return await response.json();
        },
        onSuccess: async () => {
            toast.success("Project created successfully");

            await queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
        onError: (error) => {
            toast.error("Failed to create project - " + error.message);
        },
    });
};