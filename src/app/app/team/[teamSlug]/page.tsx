import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { TaskCard } from "@/components/member/TaskCard";

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
    });

    if (!team) {
        notFound();
    }

    // Check if user is a member
    const membership = await db.teamMember.findUnique({
        where: {
            teamId_userId: { teamId: team.id, userId: session.user.id },
        },
    });

    const isLead = membership?.role === "LEAD";

    // Find a board that has cards for this team (we need the boardId for claiming)
    const boardWithCards = await db.board.findFirst({
        where: {
            columns: {
                some: {
                    cards: {
                        some: { teamId: team.id },
                    },
                },
            },
        },
        select: { id: true },
    });

    // Get "Start Here" tasks (onboarding, Ready column, not assigned)
    const startHereTasks = await db.card.findMany({
        where: {
            teamId: team.id,
            isOnboarding: true,
            assigneeId: null,
            column: { name: "Ready" },
        },
        include: {
            assignee: true,
            reviewer: true,
            team: true,
            column: true,
        },
        orderBy: { order: "asc" },
        take: 8,
    });

    // Get "Your Tasks" (assigned to current user, not in Done)
    const myTasks = await db.card.findMany({
        where: {
            teamId: team.id,
            assigneeId: session.user.id,
            column: { name: { not: "Done" } },
        },
        include: {
            assignee: true,
            reviewer: true,
            team: true,
            column: true,
        },
        orderBy: { order: "asc" },
    });

    // Get completed tasks count for motivation
    const completedCount = await db.card.count({
        where: {
            teamId: team.id,
            assigneeId: session.user.id,
            column: { name: "Done" },
        },
    });

    return (
        <div className="min-h-screen bg-zinc-900">
            {/* Header */}
            <div className="bg-zinc-800 border-b border-zinc-700 px-6 py-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <Link href="/app" className="text-sm text-zinc-500 hover:text-zinc-300 mb-1 block">
                                ← All Teams
                            </Link>
                            <h1 className="text-2xl font-bold text-white">{team.name}</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            {completedCount > 0 && (
                                <div className="text-sm text-zinc-400">
                                    ✓ {completedCount} task{completedCount > 1 ? "s" : ""} completed
                                </div>
                            )}
                            {!membership && (
                                <form action={async () => {
                                    "use server";
                                    const { joinTeam } = await import("@/actions/teams");
                                    await joinTeam(team.id);
                                }}>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                                    >
                                        Join Team
                                    </button>
                                </form>
                            )}
                            {isLead && (
                                <Link
                                    href={`/app/team/${teamSlug}/board`}
                                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm"
                                >
                                    Lead View →
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* One-sentence instruction */}
                <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg px-6 py-4 mb-8">
                    <p className="text-blue-200 text-center text-lg">
                        <span className="font-bold">Pick one task</span> → Follow "Done looks like" → <span className="font-bold">Send to Lead</span>
                    </p>
                </div>

                {/* Your Tasks section (if any) */}
                {myTasks.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                            Your Tasks
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {myTasks.map((task) => (
                                <div key={task.id} className="relative">
                                    <div className="absolute -top-2 -left-2 px-2 py-0.5 bg-zinc-700 rounded text-xs text-zinc-300">
                                        {task.column.name}
                                    </div>
                                    <TaskCard
                                        card={task}
                                        boardId={boardWithCards?.id || ""}
                                        currentUserId={session.user.id}
                                        mode="mine"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Start Here section */}
                {membership && startHereTasks.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            Start Here
                            <span className="text-sm font-normal text-zinc-500">
                                ({startHereTasks.length} available)
                            </span>
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {startHereTasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    card={task}
                                    boardId={boardWithCards?.id || ""}
                                    currentUserId={session.user.id}
                                    mode="available"
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty states */}
                {membership && startHereTasks.length === 0 && myTasks.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-xl font-bold text-white mb-2">All caught up!</h3>
                        <p className="text-zinc-400">
                            No tasks available right now. Check back later or ask a lead.
                        </p>
                    </div>
                )}

                {!membership && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">👋</div>
                        <h3 className="text-xl font-bold text-white mb-2">Join {team.name}</h3>
                        <p className="text-zinc-400 mb-6">
                            Click "Join Team" above to see available tasks.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
