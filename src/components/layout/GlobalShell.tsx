import { Sidebar } from "./Sidebar";
import { User } from "next-auth";

interface GlobalShellProps {
    children: React.ReactNode;
    user?: User;
}

export function GlobalShell({ children, user }: GlobalShellProps) {
    return (
        <div className="flex min-h-screen bg-qc-parchment">
            <Sidebar user={user} />

            <main className="flex-1 lg:ml-64 transition-all duration-300">
                <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}
