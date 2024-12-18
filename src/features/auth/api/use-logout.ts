import {useMutation, useQueryClient} from "@tanstack/react-query";
import {InferResponseType} from "hono";
import {client} from "@/lib/rpc";
import {useRouter} from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.auth.logout["$post"]>;

export const useLogout = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error>({
        mutationFn: async () => {
            const response = await client.api.auth.logout["$post"]();
            return await response.json();
        },
        onSuccess: async () => {
            router.refresh();
            await queryClient.invalidateQueries({queryKey: ["current"]});
        }
    });
};