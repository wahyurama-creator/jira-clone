import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/hooks/use-confirm";
import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useDeleteTask } from "../api/use-delete-task";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useUpdateTaskModal } from "../hooks/use-update-task-modal";

interface TaskActionsProps {
    id: string;
    projectId: string;
    children: React.ReactNode;
};

export const TaskActions = ({ id, projectId, children }: TaskActionsProps) => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const [ConfirmDeleteDialog, confirmDelete] = useConfirm(
        "Delete Task",
        "Are you sure you want to delete this task?",
        "destructive",
    );

    const { open } = useUpdateTaskModal(); 

    const { mutate, isPending } = useDeleteTask();

    const onDelete = async () => {
        const ok = await confirmDelete();

        if (!ok) return;

        mutate({ param: { taskId: id } });
    };

    const onOpenTask = () => {
        router.push(`/workspaces/${workspaceId}/tasks/${id}`);
    };

    const onOpenProject = () => {
        router.push(`/workspaces/${workspaceId}/project/${projectId}`);
    };

    return (
        <div className="flex justify-end">
            <ConfirmDeleteDialog />
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                        onClick={onOpenTask}
                        className="font-medium p-[10px]">
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                        Task Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={onOpenProject}
                        className="font-medium p-[10px]">
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                        Open Project
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => open(id)}
                        className="font-medium p-[10px]">
                        <PencilIcon className="size-4 mr-2 stroke-2" />
                        Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={onDelete}
                        disabled={isPending}
                        className="text-amber-700 focues:text-amber-700 font-medium p-[10px]">
                        <TrashIcon className="size-4 mr-2 stroke-2" />
                        Delete Task
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};