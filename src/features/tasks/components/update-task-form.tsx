"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DottedSeparator from "@/components/dotted-separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import { createTaskSchema } from "../schemas";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { DatePicker } from "@/components/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { Task, TaskStatus } from "../types";
import { CheckCircle, ClipboardList, Hourglass, Search, StickyNote } from "lucide-react";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useUpdateTask } from "../api/use-update-task";

interface UpdateTaskFormProps {
    onCancel?: () => void;
    projectOptions: { id: string, name: string, imageUrl: string }[],
    memberOptions: { id: string, name: string }[],
    initialValues: Task;
}

export const UpdateTaskForm = ({
    onCancel,
    projectOptions,
    memberOptions,
    initialValues,
}: UpdateTaskFormProps) => {
    const workspaceId = useWorkspaceId();
    const { mutate, isPending } = useUpdateTask();

    const form = useForm<z.infer<typeof createTaskSchema>>({
        resolver: zodResolver(createTaskSchema.omit({ workspaceId: true, description: true })),
        defaultValues: {
            ...initialValues,
            dueDate: initialValues.dueDate ? new Date(initialValues.dueDate) : undefined,
        },
    });

    const onSubmit = (values: z.infer<typeof createTaskSchema>) => {
        mutate(
            { json: values, param: { taskId: initialValues.$id } },
            {
                onSuccess: () => {
                    form.reset();
                    onCancel?.();
                }
            },
        );
    };

    const statusIcons = {
        [TaskStatus.BACKLOG]: <ClipboardList className="mr-2 text-gray-500" size={20} />,
        [TaskStatus.IN_PROGRESS]: <Hourglass className="mr-2 text-blue-500" size={20} />,
        [TaskStatus.IN_REVIEW]: <Search className="mr-2 text-yellow-500" size={20} />,
        [TaskStatus.DONE]: <CheckCircle className="mr-2 text-green-500" size={20} />,
        [TaskStatus.TODO]: <StickyNote className="mr-2 text-purple-500" size={20} />,
    };

    return (
        <Card className={"w-full h-full border-none shadow-none"}>
            <CardHeader className={"flex p-7"}>
                <CardTitle className={"text-xl font-bold"}>
                    Edit a new task
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
                                            Task Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder={"Enter task name"}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}>
                            </FormField>
                            <FormField
                                control={form.control}
                                name={"dueDate"}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Due Date
                                        </FormLabel>
                                        <FormControl>
                                            <DatePicker {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}>
                            </FormField>
                            <FormField
                                control={form.control}
                                name={"assigneeId"}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Assign To
                                        </FormLabel>
                                        <Select
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select member" className="text-muted-foreground" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <FormMessage />
                                            <SelectContent>
                                                {memberOptions.map((member) => (
                                                    <SelectItem key={member.id} value={member.id} className="bg-white hover:bg-gray-100">
                                                        <div className="flex items-center gap-x-2">
                                                            <MemberAvatar
                                                                className="size-6"
                                                                name={member.name} />
                                                            {member.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}>
                            </FormField>
                            <FormField
                                control={form.control}
                                name={"status"}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Status
                                        </FormLabel>
                                        <Select
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" className="text-muted-foreground" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <FormMessage />
                                            <SelectContent>
                                                <SelectItem value={TaskStatus.BACKLOG} className="bg-white hover:bg-gray-100">
                                                    <div className="flex items-center gap-x-2">
                                                        {statusIcons[TaskStatus.BACKLOG]}
                                                        Backlog
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value={TaskStatus.IN_PROGRESS} className="bg-white hover:bg-gray-100">
                                                    <div className="flex items-center gap-x-2">
                                                        {statusIcons[TaskStatus.IN_PROGRESS]}
                                                        In Progress
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value={TaskStatus.IN_REVIEW} className="bg-white hover:bg-gray-100">
                                                    <div className="flex items-center gap-x-2">
                                                        {statusIcons[TaskStatus.IN_REVIEW]}
                                                        In Review
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value={TaskStatus.DONE} className="bg-white hover:bg-gray-100">
                                                    <div className="flex items-center gap-x-2">
                                                        {statusIcons[TaskStatus.DONE]}
                                                        Done
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value={TaskStatus.TODO} className="bg-white hover:bg-gray-100">
                                                    <div className="flex items-center gap-x-2">
                                                        {statusIcons[TaskStatus.TODO]}
                                                        To Do
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}>
                            </FormField>
                            <FormField
                                control={form.control}
                                name={"projectId"}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Project
                                        </FormLabel>
                                        <Select
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select project" className="text-muted-foreground" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <FormMessage />
                                            <SelectContent>
                                                {projectOptions.map((project) => (
                                                    <SelectItem key={project.id} value={project.id} className="bg-white hover:bg-gray-100">
                                                        <div className="flex items-center gap-x-2">
                                                            <ProjectAvatar
                                                                className="size-6"
                                                                name={project.name}
                                                                image={project.imageUrl} />
                                                            {project.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}>
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
    );
}