import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.members[":memberId"]["$patch"], 200>;
type RequestType = InferRequestType<typeof client.api.members[":memberId"]["$patch"]>;

export const useUpdateMember = () => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param, json }) => {
            const response = await client.api.members[":memberId"]["$patch"]({ param, json });

            if (!response.ok) {
                throw new Error("Failed to update member - " + response.statusText);
            }

            return await response.json();
        },
        onSuccess: async () => {
            toast.success("Member updated successfully");
            await queryClient.invalidateQueries({ queryKey: ["members"] });
        },
        onError: (error) => {
            toast.error("Failed to update member  - " + error.message);
        },
    });
};