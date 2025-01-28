import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.members[":memberId"]["$delete"], 200>;
type RequestType = InferRequestType<typeof client.api.members[":memberId"]["$delete"]>;

export const useDeleteMember = () => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param }) => {
            const response = await client.api.members[":memberId"]["$delete"]({ param });

            if (!response.ok) {
                throw new Error("Failed to delete member - " + response.statusText);
            }

            return await response.json();
        },
        onSuccess: async () => {
            toast.success("Member deleted successfully");
            await queryClient.invalidateQueries({ queryKey: ["members"] });
        },
        onError: (error) => {
            toast.error("Failed to delete member  - " + error.message);
        },
    });
};