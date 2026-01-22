import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getBoards } from "@/actions/boards";
import { BoardList } from "@/components/boards/BoardList";
import { CreateBoardDialog } from "@/components/boards/CreateBoardDialog";

export default async function AppPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    // Get user's team memberships
    const memberships = await db.teamMember.findMany({
        where: { userId: session.user.id },
        include: { team: true },
    });

    // If user belongs to exactly one team, redirect to that team
    if (memberships.length === 1) {
        redirect(`/app/team/${memberships[0].team.slug}`);
    }

    // Check if user is a lead anywhere (show boards if so)
    const isLeadAnywhere = memberships.some(m => m.role === "LEAD");

    // Get all teams for display
    const allTeams = await db.team.findMany({
        orderBy: { name: "asc" },
        include: {
            _count: {
                select: {
                    members: true,
                    cards: {
                        where: {
                            column: { name: "Ready" },
                            isOnboarding: true,
                            assigneeId: null,
                        },
                    },
                },
            },
        },
    });

    const boards = isLeadAnywhere ? await getBoards() : [];

    return (
        <div className="p-8">
            {/* Team Tiles Section */}
            <section className="mb-12">
                <h1 className="text-2xl font-bold text-white mb-6">
                    {memberships.length > 0 ? "Your Teams" : "Join a Team"}
                </h1>

                {memberships.length === 0 && (
                    <p className="text-zinc-400 mb-6">
                        Pick a team to get started with your first task.
                    </p>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {allTeams.map((team) => {
                        const isMember = memberships.some(m => m.teamId === team.id);
                        const isLead = memberships.find(m => m.teamId === team.id)?.role === "LEAD";
                        const availableTasks = team._count.cards;

                        return (
                            <Link
                                key={team.id}
                                href={`/app/team/${team.slug}`}
                                className={`
                                    block p-6 rounded-xl border-2 transition-all
                                    ${isMember
                                        ? "bg-zinc-800 border-blue-500/50 hover:border-blue-400"
                                        : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
                                    }
                                `}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-white">
                                        {team.name}
                                    </h3>
                                    {isLead && (
                                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                                            Lead
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-zinc-400">
                                    <span>{team._count.members} member{team._count.members !== 1 ? "s" : ""}</span>
                                    {availableTasks > 0 && (
                                        <span className="text-green-400">
                                            {availableTasks} task{availableTasks !== 1 ? "s" : ""} available
                                        </span>
                                    )}
                                </div>

                                {!isMember && (
                                    <div className="mt-3 text-sm text-blue-400">
                                        Click to join →
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Boards section - only for leads */}
            {isLeadAnywhere && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Your Boards</h2>
                        <CreateBoardDialog />
                    </div>
                    <BoardList boards={boards} />
                </section>
            )}
        </div>
    );
}
