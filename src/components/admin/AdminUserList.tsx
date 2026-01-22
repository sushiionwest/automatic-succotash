"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminAddUserToTeam, adminRemoveUserFromTeam, adminSetUserRole } from "@/actions/admin";
import { toast } from "sonner";

interface TeamMembership {
    id: string;
    role: string;
    team: {
        id: string;
        name: string;
        slug: string;
    };
}

interface User {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    teamMemberships: TeamMembership[];
    _count: {
        assignedCards: number;
        boards: number;
    };
}

interface Team {
    id: string;
    name: string;
    slug: string;
}

interface AdminUserListProps {
    users: User[];
    teams: Team[];
}

export function AdminUserList({ users, teams }: AdminUserListProps) {
    const [loading, setLoading] = useState<string | null>(null);

    async function handleAddToTeam(userId: string, teamSlug: string, role: "LEAD" | "MEMBER") {
        setLoading(userId);
        try {
            await adminAddUserToTeam(userId, teamSlug, role);
            toast.success("Added to team");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add to team");
        } finally {
            setLoading(null);
        }
    }

    async function handleRemoveFromTeam(userId: string, teamSlug: string) {
        setLoading(userId);
        try {
            await adminRemoveUserFromTeam(userId, teamSlug);
            toast.success("Removed from team");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to remove from team");
        } finally {
            setLoading(null);
        }
    }

    async function handleSetRole(userId: string, teamSlug: string, role: "LEAD" | "MEMBER") {
        setLoading(userId);
        try {
            await adminSetUserRole(userId, teamSlug, role);
            toast.success(`Role updated to ${role}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update role");
        } finally {
            setLoading(null);
        }
    }

    if (users.length === 0) {
        return <p className="text-zinc-500">No users yet.</p>;
    }

    return (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {users.map((user) => {
                const userTeamIds = new Set(user.teamMemberships.map(m => m.team.id));
                const availableTeams = teams.filter(t => !userTeamIds.has(t.id));

                return (
                    <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-700 rounded-lg"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="w-9 h-9 shrink-0">
                                <AvatarImage src={user.image || undefined} />
                                <AvatarFallback className="bg-zinc-700 text-white text-sm">
                                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="text-white text-sm font-medium truncate">
                                    {user.name || "Unnamed"}
                                </p>
                                <p className="text-zinc-500 text-xs truncate">{user.email}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {user.teamMemberships.map((m) => (
                                        <Badge
                                            key={m.id}
                                            variant="outline"
                                            className={`text-[10px] py-0 h-4 ${
                                                m.role === "LEAD"
                                                    ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                                    : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                            }`}
                                        >
                                            {m.team.name.replace(" Team", "").replace(" 25-26", "")}
                                            {m.role === "LEAD" && " ★"}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-zinc-500">
                                {user._count.assignedCards} cards
                            </span>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-zinc-500 hover:text-white"
                                        disabled={loading === user.id}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                        </svg>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 w-56">
                                    {availableTeams.length > 0 && (
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger className="text-zinc-300 focus:text-white focus:bg-zinc-700">
                                                Add to team
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent className="bg-zinc-800 border-zinc-700">
                                                {availableTeams.map((team) => (
                                                    <DropdownMenuSub key={team.id}>
                                                        <DropdownMenuSubTrigger className="text-zinc-300 focus:text-white focus:bg-zinc-700">
                                                            {team.name}
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent className="bg-zinc-800 border-zinc-700">
                                                            <DropdownMenuItem
                                                                onClick={() => handleAddToTeam(user.id, team.slug, "MEMBER")}
                                                                className="text-zinc-300 focus:text-white focus:bg-zinc-700 cursor-pointer"
                                                            >
                                                                As Member
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleAddToTeam(user.id, team.slug, "LEAD")}
                                                                className="text-zinc-300 focus:text-white focus:bg-zinc-700 cursor-pointer"
                                                            >
                                                                As Lead
                                                            </DropdownMenuItem>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>
                                                ))}
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                    )}

                                    {user.teamMemberships.length > 0 && (
                                        <>
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger className="text-zinc-300 focus:text-white focus:bg-zinc-700">
                                                    Change role
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent className="bg-zinc-800 border-zinc-700">
                                                    {user.teamMemberships.map((m) => (
                                                        <DropdownMenuSub key={m.id}>
                                                            <DropdownMenuSubTrigger className="text-zinc-300 focus:text-white focus:bg-zinc-700">
                                                                {m.team.name}
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent className="bg-zinc-800 border-zinc-700">
                                                                <DropdownMenuItem
                                                                    onClick={() => handleSetRole(user.id, m.team.slug, "MEMBER")}
                                                                    disabled={m.role === "MEMBER"}
                                                                    className="text-zinc-300 focus:text-white focus:bg-zinc-700 cursor-pointer"
                                                                >
                                                                    Member {m.role === "MEMBER" && "✓"}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleSetRole(user.id, m.team.slug, "LEAD")}
                                                                    disabled={m.role === "LEAD"}
                                                                    className="text-zinc-300 focus:text-white focus:bg-zinc-700 cursor-pointer"
                                                                >
                                                                    Lead {m.role === "LEAD" && "✓"}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>
                                                    ))}
                                                </DropdownMenuSubContent>
                                            </DropdownMenuSub>

                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger className="text-red-400 focus:text-red-300 focus:bg-zinc-700">
                                                    Remove from team
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent className="bg-zinc-800 border-zinc-700">
                                                    {user.teamMemberships.map((m) => (
                                                        <DropdownMenuItem
                                                            key={m.id}
                                                            onClick={() => handleRemoveFromTeam(user.id, m.team.slug)}
                                                            className="text-red-400 focus:text-red-300 focus:bg-zinc-700 cursor-pointer"
                                                        >
                                                            {m.team.name}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuSubContent>
                                            </DropdownMenuSub>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
