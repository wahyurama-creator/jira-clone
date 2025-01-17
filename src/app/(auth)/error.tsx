"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

const ErrorPage = () => {
    return (
        <div className="h-screen flex flex-col gap-y-4 items-center justify-center">
            <AlertTriangle className="text-muted-foreground"/>
            <p className="text-sm text-muted-foreground">
                Something Went Wrong
            </p>
            <Button variant={"secondary"} size={"sm"}>
                <Link href={"/"}>
                    Back to Home
                </Link>
            </Button>
        </div>
    );
};

export default ErrorPage;