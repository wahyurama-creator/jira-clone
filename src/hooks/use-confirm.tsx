import { ResponsiveModal } from "@/components/responsive-modal";
import { Button, ButtonProps } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export const useConfirm = (
    title: string,
    message: string,
    variant: ButtonProps["variant"] = "primary",
): [
        () => JSX.Element,
        () => Promise<unknown>
    ] => {
    const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);

    const confirm = async () => {
        return new Promise((resolve) => {
            setPromise({ resolve });
        });
    };

    const handleClose = () => {
        setPromise(null);
    };

    const handleConfirm = () => {
        promise?.resolve(true);
        handleClose();
    };

    const handleCancel = () => {
        promise?.resolve(false);
        handleClose();
    };

    const ConfirmationDialog = () => (
        <ResponsiveModal open={promise !== null} onOpenChange={handleClose}>
            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="pt-8">
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{message}</CardDescription>
                    </CardHeader>
                    <div className="pt-4 w-full flex flex-col gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
                        <Button
                            variant={"outline"}
                            onClick={handleCancel}
                            className={"w-full lg:w-auto"}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={variant}
                            onClick={handleConfirm}
                            className={"w-full lg:w-auto"}
                        >
                            Confirm
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </ResponsiveModal>
    );

    return [ConfirmationDialog, confirm];
};