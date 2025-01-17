import {useMutation, useQueryClient} from "@tanstack/react-query";
import {InferRequestType, InferResponseType} from "hono";
import {client} from "@/lib/rpc";
import {toast} from "sonner";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["$patch"], 200>;
type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"] ["$patch"]>;

export const useUpdateWorkspaces = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({form, param}) => {
            const response = await client.api.workspaces[":workspaceId"]["$patch"]({form, param});

            if (!response.ok) {
                throw new Error("Failed to update workspace - " + response.statusText);
            }

            return await response.json();
        },
        onSuccess: async ({data}) => {
            toast.success("Workspace updated successfully");

            router.refresh();
            await queryClient.invalidateQueries({queryKey: ["workspaces"]});
            await queryClient.invalidateQueries({queryKey: ["workspace", data.$id]});
        },
        onError: (error) => {
            toast.error("Failed to create workspace - " + error.message);
        },
    });
};