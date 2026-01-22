"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface Team {
    id: string;
    name: string;
    slug: string;
}

interface SidebarProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    teams: Team[];
    isAdmin?: boolean;
}

export function Sidebar({ user, teams, isAdmin = false }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className="w-64 bg-zinc-800 border-r border-zinc-700 flex flex-col">
            {/* Logo */}
            <div className="p-4">
                <Link href="/app" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold text-white">Kanban</span>
                </Link>
            </div>

            <Separator className="bg-zinc-700" />

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <Link
                    href="/app"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${pathname === "/app"
                            ? "bg-zinc-700 text-white"
                            : "text-zinc-400 hover:bg-zinc-700/50 hover:text-white"
                        }`}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    All Boards
                </Link>

                {/* Teams Section */}
                {teams.length > 0 && (
                    <div className="mt-6">
                        <h3 className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                            Teams
                        </h3>
                        <div className="space-y-1">
                            {teams.map((team) => {
                                const isActive = pathname.startsWith(`/app/team/${team.slug}`);
                                return (
                                    <Link
                                        key={team.id}
                                        href={`/app/team/${team.slug}`}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                                            isActive
                                                ? "bg-zinc-700 text-white"
                                                : "text-zinc-400 hover:bg-zinc-700/50 hover:text-white"
                                        }`}
                                    >
                                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                                        <span className="truncate">{team.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Admin Section */}
                {isAdmin && (
                    <div className="mt-6">
                        <h3 className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                            Admin
                        </h3>
                        <Link
                            href="/app/admin"
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                                pathname === "/app/admin"
                                    ? "bg-zinc-700 text-white"
                                    : "text-zinc-400 hover:bg-zinc-700/50 hover:text-white"
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Dashboard
                        </Link>
                    </div>
                )}
            </nav>

            <Separator className="bg-zinc-700" />

            {/* User menu */}
            <div className="p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start gap-2 text-zinc-300 hover:text-white hover:bg-zinc-700">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={user.image || undefined} />
                                <AvatarFallback className="bg-zinc-600 text-white">
                                    {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <span className="truncate">{user.name || user.email}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 bg-zinc-800 border-zinc-700">
                        <DropdownMenuItem
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="text-zinc-300 focus:text-white focus:bg-zinc-700 cursor-pointer"
                        >
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
