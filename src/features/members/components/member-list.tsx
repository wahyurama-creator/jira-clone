"use client";

import DottedSeparator from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { ArrowLeftIcon, MoreVerticalIcon } from "lucide-react";
import Link from "next/link";
import { useGetMembers } from "../api/use-get-members";
import { Fragment } from "react";
import { MemberAvatar } from "./member-avatar";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useDeleteMember } from "../api/use-delete-member";
import { useUpdateMember } from "../api/use-update-member";
import { MemberRole } from "../types";
import { useConfirm } from "@/hooks/use-confirm";

export const MemberList = () => {
    const workspaceId = useWorkspaceId();
    const { data } = useGetMembers({ workspaceId });

    const [ConfirmDeleteDialog, confirmDelete] = useConfirm(
        "Remove Member",
        "Are you sure you want to remove this member?",
        "destructive",
    );

    const {
        mutate: deleteMember,
        isPending: isDeletingMember
    } = useDeleteMember();
    const {
        mutate: updateMember,
        isPending: isUpdatingMember
    } = useUpdateMember();

    const handleUpdateMember = async (memberId: string, role: MemberRole) => {
        updateMember(
            {
                json: { role },
                param: { memberId }
            }
        );
    };

    const handleDeleteMember = async (memberId: string) => {
        const ok = await confirmDelete();
        if (!ok) return;

        deleteMember(
            { param: { memberId } },
            {
                onSuccess: () => {
                    window.location.reload();
                },
            }
        );
    };

    return (
        <Card className="w-full h-full border-none shadow-none">
            <ConfirmDeleteDialog />
            <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
                <Button
                    asChild
                    variant={"secondary"}
                    size={"sm"}
                >
                    <Link href={`/workspaces/${workspaceId}`}>
                        <ArrowLeftIcon className="size-4 mr-2" />
                        Back
                    </Link>
                </Button>
                <CardTitle className="text-xl font-bold">
                    Members List
                </CardTitle>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="px-7 pt-7">
                {data?.documents.map((member, index) => (
                    <Fragment key={member.$id}>
                        <div className="flex items-center gap-4">
                            <MemberAvatar
                                className="size-10"
                                fallbackClassName="text-lg"
                                name={member.name}
                            />
                            <div className="flex flex-col">
                                <p className="text-sm font-bold">{member.name}</p>
                                <p className="text-xs to-muted-foreground">{member.email}</p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        className="ml-auto"
                                        variant={"secondary"}
                                        size={"icon"}>
                                        <MoreVerticalIcon className="size-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side="bottom"
                                    align="end">
                                    <DropdownMenuItem
                                        className="font-medium"
                                        onClick={() => handleUpdateMember(member.$id, MemberRole.ADMIN)}
                                        disabled={isUpdatingMember || isDeletingMember}>
                                        Set as Admin
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="font-medium"
                                        onClick={() => handleUpdateMember(member.$id, MemberRole.MEMBER)}
                                        disabled={isUpdatingMember || isDeletingMember}>
                                        Set as Member
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="font-medium text-red-500"
                                        onClick={() => handleDeleteMember(member.$id)}
                                        disabled={isUpdatingMember || isDeletingMember}>
                                        Remove {member.name}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        {index !== data.documents.length - 1 && (<Separator className="my-3" />)}
                    </Fragment>
                ))}
            </CardContent>
        </Card>
    );
};