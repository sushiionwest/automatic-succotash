import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { TeamMemberList } from "@/components/team/TeamMemberList";
import { AddMemberForm } from "@/components/team/AddMemberForm";

interface TeamSettingsPageProps {
    params: Promise<{ teamSlug: string }>;
}

export default async function TeamSettingsPage({ params }: TeamSettingsPageProps) {
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

    // Check if current user is a lead
    const currentMembership = team.members.find(m => m.userId === session.user.id);
    const isLead = currentMembership?.role === "LEAD";

    if (!isLead) {
        // Redirect non-leads to team page
        redirect(`/app/team/${teamSlug}`);
    }

    return (
        <div className="h-full flex flex-col p-6 max-w-4xl">
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                    <Link href="/app" className="hover:text-zinc-300">
                        All Boards
                    </Link>
                    <span>/</span>
                    <Link href={`/app/team/${teamSlug}`} className="hover:text-zinc-300">
                        {team.name}
                    </Link>
                    <span>/</span>
                    <span className="text-zinc-300">Settings</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Team Settings</h1>
                <p className="text-zinc-400 text-sm mt-1">
                    Manage members and roles for {team.name}
                </p>
            </div>

            <div className="space-y-6">
                {/* Add Member Section */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-5">
                    <h2 className="text-lg font-semibold text-white mb-4">Add Member</h2>
                    <AddMemberForm teamSlug={teamSlug} />
                </div>

                {/* Members List */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-5">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        Members ({team.members.length})
                    </h2>
                    <TeamMemberList
                        members={team.members}
                        teamSlug={teamSlug}
                        currentUserId={session.user.id}
                    />
                </div>

                {/* Permissions Info */}
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-5">
                    <h2 className="text-lg font-semibold text-white mb-3">Role Permissions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h3 className="text-purple-400 font-medium mb-2">LEAD</h3>
                            <ul className="text-zinc-400 space-y-1">
                                <li>- All member permissions</li>
                                <li>- Move cards Review → Done</li>
                                <li>- Add/remove team members</li>
                                <li>- Change member roles</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-blue-400 font-medium mb-2">MEMBER</h3>
                            <ul className="text-zinc-400 space-y-1">
                                <li>- Create and claim cards</li>
                                <li>- Move cards Ready → Doing</li>
                                <li>- Move cards Doing → Review</li>
                                <li>- Edit own assigned cards</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
