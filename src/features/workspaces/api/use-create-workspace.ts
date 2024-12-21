import {useMutation, useQueryClient} from "@tanstack/react-query";
import {InferRequestType, InferResponseType} from "hono";
import {client} from "@/lib/rpc";
import {toast} from "sonner";

type ResponseType = InferResponseType<typeof client.api.workspaces["$post"]>;
type RequestType = InferRequestType<typeof client.api.workspaces["$post"]>;

export const useCreateWorkspace = () => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json}) => {
            const response = await client.api.workspaces["$post"]({json});

            if (!response.ok) {
                throw new Error("Failed to create workspace - " + response.statusText);
            }

            return await response.json();
        },
        onSuccess: async () => {
            toast.success("Workspace created successfully");
            await queryClient.invalidateQueries({queryKey: ["workspaces"]});
        },
        onError: (error) => {
            toast.error("Failed to create workspace - " + error.message);
        },
    });
};