import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { TeamKanbanBoard } from "@/components/team/TeamKanbanBoard";
import { BoardSelector } from "@/components/team/BoardSelector";

interface TeamBoardPageProps {
    params: Promise<{ teamSlug: string }>;
    searchParams: Promise<{ boardId?: string }>;
}

export default async function TeamBoardPage({ params, searchParams }: TeamBoardPageProps) {
    const { teamSlug } = await params;
    const { boardId } = await searchParams;
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

    // Find all boards that have cards for this team
    const boardsWithTeamCards = await db.board.findMany({
        where: {
            columns: {
                some: {
                    cards: {
                        some: {
                            teamId: team.id,
                        },
                    },
                },
            },
        },
        orderBy: { name: "asc" },
    });

    // If boardId is specified, load that board with team-filtered cards
    let selectedBoard = null;
    if (boardId) {
        selectedBoard = await db.board.findUnique({
            where: { id: boardId },
            include: {
                columns: {
                    orderBy: { order: "asc" },
                    include: {
                        cards: {
                            where: { teamId: team.id },
                            orderBy: { order: "asc" },
                            include: {
                                assignee: true,
                                team: true,
                            },
                        },
                    },
                },
            },
        });
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-zinc-800 border-b border-zinc-700 px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-1">
                    <Link href="/app" className="hover:text-zinc-300">
                        All Boards
                    </Link>
                    <span>/</span>
                    <Link href={`/app/team/${teamSlug}`} className="hover:text-zinc-300">
                        {team.name}
                    </Link>
                    <span>/</span>
                    <span className="text-zinc-300">Board</span>
                </div>
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white">
                        {team.name} - Board View
                    </h1>

                    {/* Board selector */}
                    {boardsWithTeamCards.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-zinc-400">Board:</span>
                            <BoardSelector
                                boards={boardsWithTeamCards}
                                teamSlug={teamSlug}
                                selectedBoardId={boardId}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            {!boardId ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        {boardsWithTeamCards.length === 0 ? (
                            <>
                                <p className="text-zinc-400 mb-2">No boards have {team.name} cards yet.</p>
                                <p className="text-sm text-zinc-500">
                                    Create cards and assign them to this team to see them here.
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-zinc-400 mb-4">Select a board to view {team.name} tasks.</p>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {boardsWithTeamCards.map((board) => (
                                        <Link
                                            key={board.id}
                                            href={`/app/team/${teamSlug}/board?boardId=${board.id}`}
                                            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white hover:border-zinc-600 transition-colors"
                                        >
                                            {board.name}
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : selectedBoard ? (
                <TeamKanbanBoard
                    board={selectedBoard}
                    team={team}
                    currentUserId={session.user.id}
                />
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-zinc-400">Board not found.</p>
                </div>
            )}
        </div>
    );
}
