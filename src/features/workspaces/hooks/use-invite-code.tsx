import {useParams} from "next/navigation";

export const useInviteCode = () => {
    const param = useParams();
    return param.inviteCode as string;
};