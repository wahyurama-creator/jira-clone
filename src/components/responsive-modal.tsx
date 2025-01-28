import React from "react";
import { useMedia } from "react-use";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ResponsiveModalProps {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ResponsiveModal = (
    { children, open, onOpenChange }: ResponsiveModalProps
) => {
    const isDesktop = useMedia("(min-width: 1024px)", true);

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className={"w-full sm:max-w-lg p-0 border-none overflow-y-auto hide-scrollbar max-h-[85vh]"}>
                    <DialogTitle>
                        <VisuallyHidden>Create a new workspace</VisuallyHidden>
                    </DialogTitle>
                    {children}
                </DialogContent>
            </Dialog>
        );
    } else {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent>
                    <div className={"overflow-y-auto hide-scrollbar max-h-[85vh]"}>
                        {children}
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }
};