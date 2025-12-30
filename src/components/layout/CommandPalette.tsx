"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from "@/components/ui/command";
import {
    Calculator,
    Calendar,
    CreditCard,
    Gear,
    Smiley,
    User,
    BookOpen,
    Student,
    ChalkboardTeacher,
    MagnifyingGlass
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function CommandPalette() {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <>
            <Button
                variant="outline"
                className="w-full justify-start text-sm text-muted-foreground sm:pr-12 bg-white/50 border-qc-border-subtle hover:bg-white hover:border-qc-primary/30 transition-colors"
                onClick={() => setOpen(true)}
            >
                <MagnifyingGlass className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline-flex">Search...</span>
                <span className="inline-flex lg:hidden">Search...</span>

            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                        <CommandItem onSelect={() => runCommand(() => router.push("/students"))}>
                            <Student className="mr-2 h-4 w-4" />
                            <span>Students</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/courses"))}>
                            <ChalkboardTeacher className="mr-2 h-4 w-4" />
                            <span>Courses</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/living-library"))}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            <span>Living Library</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Actions">
                        <CommandItem onSelect={() => runCommand(() => router.push("/courses/new"))}>
                            <Calculator className="mr-2 h-4 w-4" />
                            <span>Create Course</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/living-library/scan"))}>
                            <Smiley className="mr-2 h-4 w-4" />
                            <span>Scan Book</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
