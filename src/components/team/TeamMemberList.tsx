"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { removeTeamMember, updateTeamMemberRole } from "@/actions/teams";
import { toast } from "sonner";

interface Member {
    id: string;
    userId: string;
    role: string;
    user: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
    };
}

interface TeamMemberListProps {
    members: Member[];
    teamSlug: string;
    currentUserId: string;
}

export function TeamMemberList({ members, teamSlug, currentUserId }: TeamMemberListProps) {
    const [loading, setLoading] = useState<string | null>(null);

    async function handleRoleChange(userId: string, newRole: "LEAD" | "MEMBER") {
        setLoading(userId);
        try {
            await updateTeamMemberRole(teamSlug, userId, newRole);
            toast.success(`Role updated to ${newRole}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update role");
        } finally {
            setLoading(null);
        }
    }

    async function handleRemove(userId: string, userName: string | null) {
        if (!confirm(`Remove ${userName || "this user"} from the team?`)) {
            return;
        }

        setLoading(userId);
        try {
            await removeTeamMember(teamSlug, userId);
            toast.success("Member removed");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to remove member");
        } finally {
            setLoading(null);
        }
    }

    if (members.length === 0) {
        return (
            <p className="text-zinc-500 text-center py-4">
                No members yet. Add someone to get started.
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {members.map((member) => {
                const isSelf = member.userId === currentUserId;
                const isLead = member.role === "LEAD";

                return (
                    <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-700 rounded-lg"
                    >
                        <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9">
                                <AvatarImage src={member.user.image || undefined} />
                                <AvatarFallback className="bg-zinc-700 text-white text-sm">
                                    {member.user.name?.[0]?.toUpperCase() || member.user.email?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-white text-sm font-medium">
                                    {member.user.name || member.user.email}
                                    {isSelf && <span className="text-zinc-500 ml-1">(you)</span>}
                                </p>
                                {member.user.name && member.user.email && (
                                    <p className="text-zinc-500 text-xs">{member.user.email}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={`text-xs ${
                                    isLead
                                        ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                        : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                }`}
                            >
                                {member.role}
                            </Badge>

                            {!isSelf && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-zinc-500 hover:text-white"
                                            disabled={loading === member.userId}
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                            </svg>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                                        {isLead ? (
                                            <DropdownMenuItem
                                                onClick={() => handleRoleChange(member.userId, "MEMBER")}
                                                className="text-zinc-300 focus:text-white focus:bg-zinc-700 cursor-pointer"
                                            >
                                                Change to Member
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem
                                                onClick={() => handleRoleChange(member.userId, "LEAD")}
                                                className="text-zinc-300 focus:text-white focus:bg-zinc-700 cursor-pointer"
                                            >
                                                Promote to Lead
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                            onClick={() => handleRemove(member.userId, member.user.name)}
                                            className="text-red-400 focus:text-red-300 focus:bg-zinc-700 cursor-pointer"
                                        >
                                            Remove from team
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
