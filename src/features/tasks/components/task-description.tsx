import { Button } from "@/components/ui/button";
import { Task } from "../types";
import { PencilIcon, XIcon } from "lucide-react";
import DottedSeparator from "@/components/dotted-separator";
import { useState } from "react";
import { useUpdateTask } from "../api/use-update-task";
import { Textarea } from "@/components/ui/textarea";

interface TaskDescriptionProps {
    task: Task;
};

export const TaskDescription = ({ task }: TaskDescriptionProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(task.description);

    const { mutate: updateTask, isPending: isPendingUpdate } = useUpdateTask();

    const handleSaveChange = () => {
        updateTask({
            json: { description: value },
            param: { taskId: task.$id },
        });
    };

    return (
        <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">Overview</p>
                <Button
                    onClick={() => setIsEditing((prev) => !prev)}
                    size={"sm"}
                    variant={"secondary"}
                >
                    {isEditing ? (
                        <XIcon className="size-4 mr-2" />
                    ) : (
                        <PencilIcon className="size-4 mr-2" />
                    )}
                    {isEditing ? "Cancel" : "Edit"}
                </Button>
            </div>
            <DottedSeparator className="my-4" />
            {isEditing ? (
                <div className="flex flex-col gap-y-4">
                    <Textarea
                        placeholder="Add a description..."
                        value={value}
                        rows={4}
                        onChange={(event) => setValue(event.target.value)}
                        disabled={isPendingUpdate}
                    />
                    <Button
                        size={"sm"}
                        className="w-fit ml-auto"
                        disabled={isPendingUpdate}
                    >
                        {isPendingUpdate ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col gap-y-4">
                    {task.description || (
                        <span className="text-muted-foreground">
                            No description available
                        </span>
                    )}
                </div>
            )}

        </div>
    );
};