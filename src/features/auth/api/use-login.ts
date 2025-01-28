import {useMutation, useQueryClient} from "@tanstack/react-query";
import {InferRequestType, InferResponseType} from "hono";
import {client} from "@/lib/rpc";
import {useRouter} from "next/navigation";
import {toast} from "sonner";

type ResponseType = InferResponseType<typeof client.api.auth.login["$post"]>;
type RequestType = InferRequestType<typeof client.api.auth.login["$post"]>;

export const useLogin = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json}) => {
            const response = await client.api.auth.login["$post"]({json});

            if (!response.ok) {
                throw new Error("Failed to login - " + response.statusText);
            }

            return await response.json();
        },
        onSuccess: async () => {
            toast.success("Logged in successfully");
            router.refresh();
            await queryClient.invalidateQueries({queryKey: ["current"]});
        },
        onError: (error) => {
            toast.error("Failed to login - " + error.message);
        },
    });
};