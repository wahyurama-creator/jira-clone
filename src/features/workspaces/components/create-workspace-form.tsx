"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {createWorkspaceSchema} from "@/features/workspaces/schemas";
import {z} from "zod";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import DottedSeparator from "@/components/dotted-separator";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useCreateWorkspaces} from "@/features/workspaces/api/use-create-workspaces";
import React, {useRef} from "react";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import Image from "next/image";
import {ImageIcon} from "lucide-react";
import {useRouter} from "next/navigation";

interface CreateWorkspaceFormProps {
    onCancel?: () => void;
}

export const CreateWorkspaceForm = ({onCancel}: CreateWorkspaceFormProps) => {
    const router = useRouter();
    const {mutate, isPending} = useCreateWorkspaces();
    const inputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof createWorkspaceSchema>>({
        resolver: zodResolver(createWorkspaceSchema),
        defaultValues: {
            name: "",
        }
    });

    const onSubmit = (values: z.infer<typeof createWorkspaceSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : "",
        };

        mutate(
            {form: finalValues},
            {
                onSuccess: ({data}) => {
                    console.log("Response Data:", data);
                    form.reset();
                    router.push(`/workspaces/${data.$id}`);
                }
            },
        );
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            form.setValue("image", file);
        }
    };

    return (
        <Card className={"w-full h-full border-none shadow-none"}>
            <CardHeader className={"flex p-7"}>
                <CardTitle className={"text-xl font-bold"}>
                    Create a new workspace
                </CardTitle>
            </CardHeader>
            <div className={"px-7"}>
                <DottedSeparator/>
            </div>
            <CardContent className={"p-7"}>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className={"flex flex-col gap-y-4"}>
                            <FormField
                                control={form.control}
                                name={"name"}
                                render={({field}) => (
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
                                        <FormMessage/>
                                    </FormItem>
                                )}>
                            </FormField>
                            <FormField
                                control={form.control}
                                name={"image"}
                                render={({field}) => (
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
                                                        <ImageIcon className={"size-[36px] text-neutral-500"}/>
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
                                                <Button
                                                    className={"w-fit mt-2"}
                                                    type={"button"}
                                                    disabled={isPending}
                                                    variant={"teritary"}
                                                    size={"xs"}
                                                    onClick={() => inputRef.current?.click()}
                                                >
                                                    Upload Image
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            >
                            </FormField>
                        </div>
                        <DottedSeparator className={"py-7"}/>
                        <div className={"flex items-center justify-end gap-x-2"}>
                            <Button type={"button"}
                                    size={"lg"}
                                    variant={"secondary"}
                                    onClick={onCancel}
                                    disabled={isPending}>
                                Cancel
                            </Button>
                            <Button size={"lg"} variant={"primary"} disabled={isPending}>
                                Create Workspace
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}