"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateWorkspaceSchema } from "@/features/workspaces/schemas";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DottedSeparator from "@/components/dotted-separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { ArrowLeftIcon, CopyIcon, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Workspace } from "@/features/workspaces/types";
import { useUpdateWorkspace } from "../api/use-update-workspace";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteWorkspaces } from "../api/use-delete-workspaces";
import { toast } from "sonner";
import { useResetInviteCode } from "../api/use-reset-invite-code";

interface UpdateWorkspaceFormProps {
    onCancel?: () => void;
    initialValues: Workspace;
}

export const UpdateWorkspaceForm = ({ onCancel, initialValues }: UpdateWorkspaceFormProps) => {
    const router = useRouter();
    const { mutate, isPending } = useUpdateWorkspace();
    const { mutate: deleteWorkspace, isPending: isDeletingWorkspace } = useDeleteWorkspaces();
    const { mutate: resetInviteCode, isPending: isResetInviteCode } = useResetInviteCode();
    const inputRef = useRef<HTMLInputElement>(null);

    const [ConfirmDialogDelete, confirmDelete] = useConfirm(
        "Delete Workspace",
        "Are you sure you want to delete this workspace?",
        "destructive",
    );
    const [ConfirmDialogResetInviteCode, confirmReset] = useConfirm(
        "Reset Invite Code",
        "Are you sure you want to reset the invite code for this workspace?",
        "destructive",
    );

    const handleDelete = async () => {
        const isOk = await confirmDelete();

        if (!isOk) {
            return;
        }

        deleteWorkspace(
            {
                param: { workspaceId: initialValues.$id },
            },
            {
                onSuccess: () => {
                    window.location.href = "/";
                },
            });
    };

    const handleResetInviteCode = async () => {
        const isOk = await confirmReset();

        if (!isOk) {
            return;
        }

        resetInviteCode(
            {
                param: { workspaceId: initialValues.$id },
            },
        );
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(fullInviteLink)
            .then(() => {
                toast.success("Invite link copied to clipboard");
            });
    };

    const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
        resolver: zodResolver(updateWorkspaceSchema),
        defaultValues: {
            ...initialValues,
            image: initialValues.imageUrl ?? "",
        }
    });

    const onSubmit = (values: z.infer<typeof updateWorkspaceSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : "",
        };

        mutate(
            {
                form: finalValues,
                param: { workspaceId: initialValues.$id },
            },
        );
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            form.setValue("image", file);
        }
    };

    const fullInviteLink = `${window.location.origin}/workspaces/${initialValues.$id}/join/${initialValues.inviteCode}`;

    return (
        <div className={"flex flex-col gap-y-4"}>
            <ConfirmDialogDelete />
            <ConfirmDialogResetInviteCode />
            <Card className={"w-full h-full border-none shadow-none"}>
                <CardHeader className={"flex flex-row items-center gap-x-4 p-7 space-y-0"}>
                    <Button size={"sm"}
                        variant={"secondary"}
                        onClick={onCancel ? onCancel : () => router.back()}
                    >
                        <ArrowLeftIcon className={"size-5 mr-2"} />
                        Back
                    </Button>
                    <CardTitle className={"text-xl font-bold"}>
                        {initialValues.name}
                    </CardTitle>
                </CardHeader>
                <div className={"px-7"}>
                    <DottedSeparator />
                </div>
                <CardContent className={"p-7"}>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className={"flex flex-col gap-y-4"}>
                                <FormField
                                    control={form.control}
                                    name={"name"}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Workspace name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder={"Enter workspace name"}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}>
                                </FormField>
                                <FormField
                                    control={form.control}
                                    name={"image"}
                                    render={({ field }) => (
                                        <div className={"flex flex-col gap-y-2"}>
                                            <div className={"flex items-center gap-x-3"}>
                                                {field.value ? (
                                                    <div className={"size-[72px] relative rounded-md overflow-hidden"}>
                                                        <Image
                                                            alt={"Image"}
                                                            src={
                                                                field.value instanceof File
                                                                    ? URL.createObjectURL(field.value)
                                                                    : field.value
                                                            }
                                                            fill={true}
                                                            className={"object-cover"}
                                                        />
                                                    </div>
                                                ) : (
                                                    <Avatar className={"size-[72px] p-2"}>
                                                        <AvatarFallback>
                                                            <ImageIcon className={"size-[36px] text-neutral-500"} />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className={"flex flex-col"}>
                                                    <p className={"text-sm"}>Workspace Icon</p>
                                                    <p className={"text-sm text-muted-foreground"}>
                                                        JPG, PNG, JPEG, SVG. Max size of 1MB
                                                    </p>
                                                    <input
                                                        type="file"
                                                        className={"hidden"}
                                                        accept={".jpg, .png, .jpeg, .svg"}
                                                        ref={inputRef}
                                                        disabled={isPending}
                                                        onChange={handleImageChange}
                                                    />
                                                    {
                                                        field.value ? (
                                                            <Button
                                                                className={"w-fit mt-2"}
                                                                type={"button"}
                                                                disabled={isPending}
                                                                variant={"destructive"}
                                                                size={"xs"}
                                                                onClick={() => {
                                                                    field.onChange(null);
                                                                    if (inputRef.current) {
                                                                        inputRef.current.value = "";
                                                                    }
                                                                }}
                                                            >
                                                                Remove Image
                                                            </Button>) : (
                                                            <Button
                                                                className={"w-fit mt-2"}
                                                                type={"button"}
                                                                disabled={isPending}
                                                                variant={"teritary"}
                                                                size={"xs"}
                                                                onClick={() => inputRef.current?.click()}
                                                            >
                                                                Upload Image
                                                            </Button>)
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                >
                                </FormField>
                            </div>
                            <DottedSeparator className={"py-7"} />
                            <div className={"flex items-center justify-end gap-x-2"}>
                                <Button type={"button"}
                                    size={"lg"}
                                    variant={"secondary"}
                                    onClick={onCancel}
                                    disabled={isPending}
                                    className={cn(!onCancel && "invisible")}>
                                    Cancel
                                </Button>
                                <Button size={"lg"} variant={"primary"} disabled={isPending}>
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card className={"w-full h-full border-none shadow-none"}>
                <CardContent className={"p-7"}>
                    <div className={"flex flex-col"}>
                        <h3 className={"font-bold"}>
                            Invite Members
                        </h3>
                        <p className={"mt-2 text-sm text-muted-foreground"}>
                            Use the invite link to add new members to your workspace.
                        </p>
                        <div className="mt-4">
                            <div className="flex flex-row items-center gap-x-2">
                                <Input disabled value={fullInviteLink} className="bg-slate-300" />
                                <Button
                                    onClick={handleCopyLink}
                                    className={"size-12"}
                                    variant={"secondary"}
                                >
                                    <CopyIcon className="size-5" />
                                </Button>
                            </div>
                        </div>
                        <DottedSeparator className="py-7" />
                        <Button
                            className="w-fit ml-auto"
                            size={"sm"}
                            variant={"destructive"}
                            type={"button"}
                            onClick={handleResetInviteCode}
                            disabled={isPending || isDeletingWorkspace || isResetInviteCode}
                        >
                            Reset Invite Code
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className={"w-full h-full border-none shadow-none"}>
                <CardContent className={"p-7"}>
                    <div className={"flex flex-col"}>
                        <h3 className={"font-bold"}>
                            Danger Zone
                        </h3>
                        <p className={"mt-2 text-sm text-muted-foreground"}>
                            Deleting a workspace is irreversible. All data will be lost.
                        </p>
                        <DottedSeparator className="py-7" />
                        <Button
                            className="w-fit ml-auto"
                            size={"sm"}
                            variant={"destructive"}
                            type={"button"}
                            onClick={handleDelete}
                            disabled={isPending || isDeletingWorkspace}
                        >
                            Delete Workspace
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}