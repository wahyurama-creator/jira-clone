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
import {useCreateWorkspace} from "@/features/workspaces/api/use-create-workspace";

interface CreateWorkspaceFormProps {
    onCancel?: () => void;
}

export const CreateWorkspaceForm = ({onCancel}: CreateWorkspaceFormProps) => {
    const {mutate, isPending} = useCreateWorkspace();

    const form = useForm<z.infer<typeof createWorkspaceSchema>>({
        resolver: zodResolver(createWorkspaceSchema),
        defaultValues: {
            name: "",
        }
    });

    const onSubmit = (values: z.infer<typeof createWorkspaceSchema>) => {
        mutate({json: values});
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