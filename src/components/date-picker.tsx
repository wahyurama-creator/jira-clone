"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DatePickerProps {
    value: Date | undefined;
    onChange: (date: Date) => void;
    className?: string;
    placeholder?: string;
};

export const DatePicker = ({
    value,
    onChange,
    className,
    placeholder = "Select Date",
}: DatePickerProps) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const handleSelect = (date: Date | undefined) => {
        if (date) {
            onChange(date);
            setIsOpen(false);
        }
    };

    return (
        <Popover
            modal
            open={isOpen}
            onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    size={"lg"}
                    className={cn(
                        "w-full justify-start text-left font-normal px-3",
                        !value && "text-muted-foreground",
                        className,
                    )}>
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    {value ? format(value, "PPP") : <span className="font-medium">{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" >
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={handleSelect}
                    disabled={(date) =>
                        date.getTime() < new Date(Date.now()).setHours(0, 0, 0, 0)
                    }
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
};