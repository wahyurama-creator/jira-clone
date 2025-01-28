import {useMutation, useQueryClient} from "@tanstack/react-query";
import {InferRequestType, InferResponseType} from "hono";
import {client} from "@/lib/rpc";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.auth.register["$post"]>;
type RequestType = InferRequestType<typeof client.api.auth.register["$post"]>;

export const useRegister = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json}) => {
            const response = await client.api.auth.register["$post"]({json});

            if (!response.ok) {
                throw new Error("Failed to register - " + response.statusText);
            }

            return await response.json();
        },
        onSuccess: async () => {
            toast.success("Registered successfully");
            router.refresh();
            await queryClient.invalidateQueries({queryKey: ["current"]});
        },
        onError: (error) => {
            toast.error("Failed to register - " + error.message);
        },
    });
};