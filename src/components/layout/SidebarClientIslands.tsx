"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { X, List } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface SidebarNavItem {
    href: string;
    label: string;
    icon: any;
}

interface SidebarNavigationProps {
    navItems: SidebarNavItem[];
    onMobileClose?: () => void;
}

/**
 * Client island for sidebar navigation with active state detection
 */
export function SidebarNavigation({ navItems, onMobileClose }: SidebarNavigationProps) {
    const pathname = usePathname();

    return (
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onMobileClose}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-qc-md text-sm font-medium transition-colors",
                            isActive
                                ? "bg-qc-primary/10 text-qc-primary"
                                : "text-qc-text-muted hover:bg-qc-primary/5 hover:text-qc-charcoal"
                        )}
                    >
                        <Icon className={cn("w-5 h-5", isActive ? "weight-fill" : "")} weight={isActive ? "fill" : "regular"} />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}

/**
 * Client island for mobile sidebar toggle
 */
export function MobileSidebarToggle() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile Trigger */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="bg-white/90 backdrop-blur shadow-sm"
                >
                    {mobileOpen ? <X /> : <List />}
                </Button>
            </div>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/20 lg:hidden backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Pass mobile state to parent via CSS class */}
            <style jsx global>{`
                .sidebar-mobile-control {
                    transform: translateX(${mobileOpen ? '0' : '-100%'});
                }
                @media (min-width: 1024px) {
                    .sidebar-mobile-control {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </>
    );
}

/**
 * Client island for settings dialog trigger
 */
interface SettingsButtonProps {
    hasUser: boolean;
    onOpenSettings: () => void;
}

export function SettingsButton({ hasUser, onOpenSettings }: SettingsButtonProps) {
    return (
        <button
            onClick={hasUser ? onOpenSettings : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-qc-md text-sm font-medium text-qc-text-muted hover:bg-qc-primary/5 hover:text-qc-charcoal transition-colors text-left"
            disabled={!hasUser}
        >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Settings
        </button>
    );
}
