import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { BoardHeader } from "@/components/boards/BoardHeader";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

interface BoardPageProps {
    params: Promise<{ boardId: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
    const { boardId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const board = await db.board.findUnique({
        where: { id: boardId },
        include: {
            columns: {
                orderBy: { order: "asc" },
                include: {
                    cards: {
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

    if (!board) {
        notFound();
    }

    // Authorization check
    if (board.ownerId !== session.user.id) {
        notFound();
    }

    return (
        <div className="h-full flex flex-col">
            <BoardHeader board={board} />
            <KanbanBoard board={board} currentUserId={session.user.id} />
        </div>
    );
}

