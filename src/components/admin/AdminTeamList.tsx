"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamMember {
    id: string;
    role: string;
    user: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
    };
}

interface Team {
    id: string;
    name: string;
    slug: string;
    discordChannel: string | null;
    members: TeamMember[];
    _count: { cards: number };
}

interface AdminTeamListProps {
    teams: Team[];
}

export function AdminTeamList({ teams }: AdminTeamListProps) {
    const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

    if (teams.length === 0) {
        return <p className="text-zinc-500">No teams yet.</p>;
    }

    return (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {teams.map((team) => {
                const leads = team.members.filter(m => m.role === "LEAD");
                const members = team.members.filter(m => m.role === "MEMBER");
                const isExpanded = expandedTeam === team.id;

                return (
                    <div
                        key={team.id}
                        className="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden"
                    >
                        <div
                            className="p-3 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                            onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium">{team.name}</p>
                                    <p className="text-xs text-zinc-500">{team.slug}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs bg-zinc-800 text-zinc-400 border-zinc-600">
                                        {team.members.length} members
                                    </Badge>
                                    <Badge variant="outline" className="text-xs bg-zinc-800 text-zinc-400 border-zinc-600">
                                        {team._count.cards} cards
                                    </Badge>
                                    <svg
                                        className={`w-4 h-4 text-zinc-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="border-t border-zinc-700 p-3 bg-zinc-800/30">
                                {team.members.length === 0 ? (
                                    <p className="text-zinc-500 text-sm">No members</p>
                                ) : (
                                    <div className="space-y-2">
                                        {leads.length > 0 && (
                                            <div>
                                                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Leads</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {leads.map((m) => (
                                                        <div key={m.id} className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-xs">
                                                            <Avatar className="w-4 h-4">
                                                                <AvatarImage src={m.user.image || undefined} />
                                                                <AvatarFallback className="bg-purple-600 text-white text-[8px]">
                                                                    {m.user.name?.[0] || "L"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-purple-300">{m.user.name || m.user.email}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {members.length > 0 && (
                                            <div>
                                                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Members</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {members.map((m) => (
                                                        <div key={m.id} className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-xs">
                                                            <Avatar className="w-4 h-4">
                                                                <AvatarImage src={m.user.image || undefined} />
                                                                <AvatarFallback className="bg-blue-600 text-white text-[8px]">
                                                                    {m.user.name?.[0] || "M"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-blue-300">{m.user.name || m.user.email}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="mt-3 pt-3 border-t border-zinc-700">
                                    <Link
                                        href={`/app/team/${team.slug}/settings`}
                                        className="text-xs text-blue-400 hover:text-blue-300"
                                    >
                                        Manage team →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
