"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sparkle, X } from "@phosphor-icons/react";
import GeneratorsClient from "@/app/creation-station/GeneratorsClient"; // Re-using existing client
import { useState } from "react";
import { usePathname } from "next/navigation";

export function CreationDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Don't show drawer trigger if we are already on the full page to avoid confusion
    if (pathname.startsWith("/creation-station")) return null;

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    className="w-full gap-2 bg-gradient-to-r from-qc-primary to-qc-secondary text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                    size="lg"
                >
                    <Sparkle weight="fill" className="w-5 h-5" />
                    <span>Creation Station</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[540px] md:w-[700px] overflow-y-auto sm:max-w-none p-0">
                <div className="h-full bg-qc-parchment">
                    <div className="p-6">
                        <SheetHeader className="mb-6 text-left">
                            <SheetTitle className="font-display text-2xl font-bold text-qc-charcoal">Quick Create</SheetTitle>
                            <SheetDescription className="text-sm text-qc-text-muted">Generate content without leaving your workflow</SheetDescription>
                        </SheetHeader>

                        {/* 
                  We are reusing the GeneratorsClient here. 
                  NOTE: GeneratorsClient expects to read URL params. 
                  In a drawer, we might need to refactor it to accept props instead of solely relying on URL.
                  For now, we will render it as is, but this suggests a future refactor task.
                */}
                        <div className="bg-white rounded-xl border border-qc-border-subtle p-1 shadow-sm">
                            {/* Temporary: Embedding the client. Ideally we pass a 'compact' prop */}
                            <GeneratorsClient organizationId="current-org-id-placeholder" />
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
