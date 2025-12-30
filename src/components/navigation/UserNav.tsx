"use client";

import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileSettingsDialog } from "./ProfileSettingsDialog";
import { useState } from "react";
import { User } from "next-auth";
import { signOut } from "next-auth/react";

interface UserNavProps {
    user: User;
}

export function UserNav({ user }: UserNavProps) {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10 border border-qc-border-subtle">
                            <AvatarImage src={user.image || ""} alt={user.name || ""} referrerPolicy="no-referrer" />
                            <AvatarFallback className="bg-qc-primary text-white font-medium">
                                {user.name?.slice(0, 2).toUpperCase() || "ME"}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => setShowSettings(true)}>
                            Profile Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/context" className="w-full cursor-pointer">
                                All About Me
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ProfileSettingsDialog
                user={user}
                open={showSettings}
                onOpenChange={setShowSettings}
            />
        </>
    );
}
