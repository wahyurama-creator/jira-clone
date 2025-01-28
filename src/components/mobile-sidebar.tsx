"use client";

import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";
import {MenuIcon} from "lucide-react";
import {Sidebar} from "@/components/sidebar";
import {usePathname} from "next/navigation";
import {useEffect, useState} from "react";

export const MobileSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathName = usePathname();

    useEffect(() => {
        setIsOpen(false);
    }, [pathName]);

    return (
        <Sheet modal={false} open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button size={"icon"} variant={"secondary"} className={"lg:hidden"}>
                    <MenuIcon className={"size-4 text-neutral-500"}/>
                </Button>
            </SheetTrigger>
            <SheetContent side={"left"} className={"p-0"}>
                <Sidebar/>
            </SheetContent>
        </Sheet>
    );
};