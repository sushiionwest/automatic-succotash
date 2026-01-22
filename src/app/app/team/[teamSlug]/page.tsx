import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { OnboardingCards } from "@/components/team/OnboardingCards";
import { JoinTeamButton } from "@/components/team/JoinTeamButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface TeamPageProps {
    params: Promise<{ teamSlug: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
    const { teamSlug } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const team = await db.team.findUnique({
        where: { slug: teamSlug },
        include: {
            members: {
                include: {
                    user: true,
                },
                orderBy: [
                    { role: "asc" }, // LEADs first
                    { createdAt: "asc" },
                ],
            },
        },
    });

    if (!team) {
        notFound();
    }

    // Get current user's membership
    const currentMembership = team.members.find(m => m.userId === session.user.id);
    const isLead = currentMembership?.role === "LEAD";
    const isMember = !!currentMembership;

    // Get onboarding cards for this team that are in Ready status
    const onboardingCards = await db.card.findMany({
        where: {
            teamId: team.id,
            isOnboarding: true,
            column: {
                name: "Ready",
            },
        },
        include: {
            assignee: true,
            team: true,
            column: {
                include: {
                    board: true,
                },
            },
        },
        orderBy: { createdAt: "asc" },
    });

    const leads = team.members.filter(m => m.role === "LEAD");
    const members = team.members.filter(m => m.role === "MEMBER");

    return (
        <div className="h-full flex flex-col p-6">
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                    <Link href="/app" className="hover:text-zinc-300">
                        All Boards
                    </Link>
                    <span>/</span>
                    <span className="text-zinc-300">{team.name}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">{team.name}</h1>
                        {team.discordChannel && (
                            <p className="text-zinc-400 text-sm mt-1">
                                Discord: {team.discordChannel}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {isMember ? (
                            <Badge
                                variant="outline"
                                className={`${
                                    isLead
                                        ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                        : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                }`}
                            >
                                {isLead ? "LEAD" : "MEMBER"}
                            </Badge>
                        ) : (
                            <JoinTeamButton teamSlug={teamSlug} />
                        )}
                        {isLead && (
                            <Link
                                href={`/app/team/${teamSlug}/settings`}
                                className="px-3 py-1.5 text-sm bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                            >
                                Settings
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Start Here - Onboarding */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <span className="text-green-400">●</span>
                            Start Here
                        </h2>
                        <span className="text-xs text-zinc-500">
                            {onboardingCards.length} task{onboardingCards.length !== 1 ? "s" : ""} available
                        </span>
                    </div>
                    {!isMember ? (
                        <p className="text-sm text-zinc-400">
                            Join the team to claim onboarding tasks.
                        </p>
                    ) : (
                        <>
                            <p className="text-sm text-zinc-400 mb-4">
                                New to the team? Claim a task below to get started.
                            </p>
                            <OnboardingCards
                                cards={onboardingCards}
                                currentUserId={session.user.id}
                            />
                        </>
                    )}
                </div>

                {/* Quick Links */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-5">
                    <h2 className="text-lg font-semibold text-white mb-4">Quick Links</h2>
                    <div className="space-y-3">
                        <Link
                            href={`/app/team/${teamSlug}/board`}
                            className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors"
                        >
                            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-white font-medium">Team Board</p>
                                <p className="text-xs text-zinc-400">View all {team.name} tasks</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Team Members */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-5 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">
                            Team Members ({team.members.length})
                        </h2>
                        {isLead && (
                            <Link
                                href={`/app/team/${teamSlug}/settings`}
                                className="text-sm text-blue-400 hover:text-blue-300"
                            >
                                Manage
                            </Link>
                        )}
                    </div>

                    {team.members.length === 0 ? (
                        <p className="text-zinc-500 text-sm">No members yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {/* Leads */}
                            {leads.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                                        Leads
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {leads.map((member) => (
                                            <div
                                                key={member.id}
                                                className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg"
                                            >
                                                <Avatar className="w-7 h-7">
                                                    <AvatarImage src={member.user.image || undefined} />
                                                    <AvatarFallback className="bg-purple-600 text-white text-xs">
                                                        {member.user.name?.[0]?.toUpperCase() || "L"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm text-white">
                                                    {member.user.name || member.user.email}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Members */}
                            {members.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                                        Members
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {members.map((member) => (
                                            <div
                                                key={member.id}
                                                className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg"
                                            >
                                                <Avatar className="w-7 h-7">
                                                    <AvatarImage src={member.user.image || undefined} />
                                                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                                                        {member.user.name?.[0]?.toUpperCase() || "M"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm text-white">
                                                    {member.user.name || member.user.email}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
