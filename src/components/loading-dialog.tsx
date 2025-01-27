import { Loader } from "lucide-react";

interface LoadingDialogProps {
    isOpen: boolean;
    message?: string;
}

export const LoadingDialog = ({
    isOpen,
    message = "Please wait...",
}: LoadingDialogProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg space-y-4">
                <Loader className="size-7 animate-spin text-muted-foreground" />
                <p className="text-md font-medium text-primary">{message}</p>
            </div>
        </div>
    );
};
