"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const DEFAULT_COLUMNS = [
    { name: "To Do", order: 0 },
    { name: "In Progress", order: 1 },
    { name: "Review", order: 2 },
    { name: "Done", order: 3 },
];

export async function getBoards() {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    return db.board.findMany({
        where: { ownerId: session.user.id },
        orderBy: { createdAt: "desc" },
    });
}

export async function createBoard(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    if (!name || name.trim().length === 0) {
        throw new Error("Board name is required");
    }

    const board = await db.board.create({
        data: {
            name: name.trim(),
            ownerId: session.user.id,
        },
    });

    // Create default columns
    const defaultColumns = [
        { name: "Ready", order: 0 },
        { name: "Doing", order: 1, wipLimit: 2 }, // Default WIP limit of 2 for Doing
        { name: "Review", order: 2, wipLimit: 5 }, // Default WIP limit of 5 for Review
        { name: "Done", order: 3 },
    ];

    await db.$transaction(
        defaultColumns.map((col) =>
            db.column.create({
                data: {
                    boardId: board.id,
                    name: col.name,
                    order: col.order,
                    wipLimit: col.wipLimit,
                },
            })
        )
    );

    revalidatePath("/app");
    redirect(`/app/board/${board.id}`);
}

export async function renameBoard(boardId: string, name: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const board = await db.board.findUnique({
        where: { id: boardId },
    });

    if (!board || board.ownerId !== session.user.id) {
        throw new Error("Board not found");
    }

    await db.board.update({
        where: { id: boardId },
        data: { name: name.trim() },
    });

    revalidatePath("/app");
    revalidatePath(`/app/board/${boardId}`);
}

export async function deleteBoard(boardId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const board = await db.board.findUnique({
        where: { id: boardId },
    });

    if (!board || board.ownerId !== session.user.id) {
        throw new Error("Board not found");
    }

    await db.board.delete({
        where: { id: boardId },
    });

    revalidatePath("/app");
    redirect("/app");
}
