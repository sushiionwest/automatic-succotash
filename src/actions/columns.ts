"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function verifyBoardOwnership(boardId: string, userId: string) {
    const board = await db.board.findUnique({
        where: { id: boardId },
        select: { ownerId: true },
    });
    return board?.ownerId === userId;
}

export async function createColumn(boardId: string, name: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    if (!(await verifyBoardOwnership(boardId, session.user.id))) {
        throw new Error("Board not found");
    }

    // Get the highest order value
    const lastColumn = await db.column.findFirst({
        where: { boardId },
        orderBy: { order: "desc" },
    });

    await db.column.create({
        data: {
            name: name.trim(),
            boardId,
            order: (lastColumn?.order ?? -1) + 1,
        },
    });

    revalidatePath(`/app/board/${boardId}`);
}

export async function renameColumn(columnId: string, name: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const column = await db.column.findUnique({
        where: { id: columnId },
        include: { board: { select: { ownerId: true, id: true } } },
    });

    if (!column || column.board.ownerId !== session.user.id) {
        throw new Error("Column not found");
    }

    await db.column.update({
        where: { id: columnId },
        data: { name: name.trim() },
    });

    revalidatePath(`/app/board/${column.board.id}`);
}

export async function deleteColumn(columnId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const column = await db.column.findUnique({
        where: { id: columnId },
        include: {
            board: { select: { ownerId: true, id: true } },
            cards: { select: { id: true } },
        },
    });

    if (!column || column.board.ownerId !== session.user.id) {
        throw new Error("Column not found");
    }

    if (column.cards.length > 0) {
        throw new Error("Cannot delete column with cards. Move or delete cards first.");
    }

    await db.column.delete({
        where: { id: columnId },
    });

    revalidatePath(`/app/board/${column.board.id}`);
}

export async function reorderColumns(boardId: string, columnIds: string[]) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    if (!(await verifyBoardOwnership(boardId, session.user.id))) {
        throw new Error("Board not found");
    }

    // Update each column's order
    await db.$transaction(
        columnIds.map((id, index) =>
            db.column.update({
                where: { id },
                data: { order: index },
            })
        )
    );

    revalidatePath(`/app/board/${boardId}`);
}
