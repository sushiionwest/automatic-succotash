"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Priority } from "@/types";
import { revalidatePath } from "next/cache";

// Check if user has team permission for a card move
async function checkTeamMovePermission(
    userId: string,
    teamId: string | null,
    sourceColumnName: string,
    targetColumnName: string
): Promise<{ allowed: boolean; reason?: string }> {
    // If card has no team, allow all moves (legacy behavior)
    if (!teamId) {
        return { allowed: true };
    }

    // Get user's membership in the card's team
    const membership = await db.teamMember.findUnique({
        where: {
            teamId_userId: { teamId, userId },
        },
    });

    // Non-members can't move team cards
    if (!membership) {
        return { allowed: false, reason: "You must be a team member to move this card" };
    }

    const isLead = membership.role === "LEAD";

    // Leads can do anything
    if (isLead) {
        return { allowed: true };
    }

    // Members: can move Ready→Doing, Doing→Review
    const allowedMemberMoves = [
        { from: "Ready", to: "Doing" },
        { from: "Doing", to: "Review" },
        // Allow reordering within same column
        { from: sourceColumnName, to: sourceColumnName },
    ];

    const isAllowed = allowedMemberMoves.some(
        (move) => move.from === sourceColumnName && move.to === targetColumnName
    );

    if (!isAllowed) {
        // Review→Done requires lead
        if (sourceColumnName === "Review" && targetColumnName === "Done") {
            return { allowed: false, reason: "Only team leads can approve cards to Done" };
        }
        return { allowed: false, reason: `Members cannot move cards from ${sourceColumnName} to ${targetColumnName}` };
    }

    return { allowed: true };
}

async function verifyColumnOwnership(columnId: string, userId: string) {
    const column = await db.column.findUnique({
        where: { id: columnId },
        include: { board: { select: { ownerId: true } } },
    });
    return column?.board.ownerId === userId ? column : null;
}

async function verifyCardOwnership(cardId: string, userId: string) {
    const card = await db.card.findUnique({
        where: { id: cardId },
        include: { column: { include: { board: { select: { ownerId: true, id: true } } } } },
    });
    return card?.column.board.ownerId === userId ? card : null;
}

export async function createCard(
    columnId: string,
    data: {
        title: string;
        description?: string;
        acceptanceCriteria?: string;
        priority?: Priority;
        subsystem?: string;       // @deprecated - Use teamId instead
        teamId?: string | null;
        dueDate?: Date | null;
        assigneeId?: string | null;
    }
) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const column = await verifyColumnOwnership(columnId, session.user.id);
    if (!column) {
        throw new Error("Column not found");
    }

    // Check WIP limit for the target column
    if (column.wipLimit !== null) {
        const cardCount = await db.card.count({
            where: { columnId },
        });
        if (cardCount >= column.wipLimit) {
            throw new Error(`WIP limit of ${column.wipLimit} reached for this column`);
        }
    }

    // Get the highest order value in this column
    const lastCard = await db.card.findFirst({
        where: { columnId },
        orderBy: { order: "desc" },
    });

    await db.card.create({
        data: {
            title: data.title.trim(),
            description: data.description?.trim() || null,
            acceptanceCriteria: data.acceptanceCriteria?.trim() || null,
            priority: data.priority || "P2",
            subsystem: data.subsystem?.trim() || null,
            teamId: data.teamId || null,
            dueDate: data.dueDate || null,
            assigneeId: data.assigneeId || null,
            columnId,
            order: (lastCard?.order ?? -1) + 1,
        },
    });

    revalidatePath(`/app/board/${column.boardId}`);
}

export async function updateCard(
    cardId: string,
    data: {
        title?: string;
        description?: string;
        acceptanceCriteria?: string;
        priority?: Priority;
        subsystem?: string;       // @deprecated - Use teamId instead
        teamId?: string | null;
        dueDate?: Date | null;
        assigneeId?: string | null;
    }
) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const card = await verifyCardOwnership(cardId, session.user.id);
    if (!card) {
        throw new Error("Card not found");
    }

    await db.card.update({
        where: { id: cardId },
        data: {
            ...(data.title !== undefined && { title: data.title.trim() }),
            ...(data.description !== undefined && { description: data.description.trim() || null }),
            ...(data.acceptanceCriteria !== undefined && { acceptanceCriteria: data.acceptanceCriteria.trim() || null }),
            ...(data.priority !== undefined && { priority: data.priority }),
            ...(data.subsystem !== undefined && { subsystem: data.subsystem.trim() || null }),
            ...(data.teamId !== undefined && { teamId: data.teamId }),
            ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
            ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
        },
    });

    revalidatePath(`/app/board/${card.column.board.id}`);
}

export async function deleteCard(cardId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const card = await verifyCardOwnership(cardId, session.user.id);
    if (!card) {
        throw new Error("Card not found");
    }

    await db.card.delete({
        where: { id: cardId },
    });

    revalidatePath(`/app/board/${card.column.board.id}`);
}

export async function moveCard(
    cardId: string,
    targetColumnId: string,
    targetIndex: number
) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const card = await verifyCardOwnership(cardId, session.user.id);
    if (!card) {
        throw new Error("Card not found");
    }

    const targetColumn = await verifyColumnOwnership(targetColumnId, session.user.id);
    if (!targetColumn) {
        throw new Error("Target column not found");
    }

    const sourceColumnId = card.columnId;
    const boardId = card.column.board.id;

    // Get source column name for permission check
    const sourceColumn = await db.column.findUnique({
        where: { id: sourceColumnId },
        select: { name: true },
    });

    // Check team-based permissions for the move
    if (sourceColumn && sourceColumnId !== targetColumnId) {
        const permCheck = await checkTeamMovePermission(
            session.user.id,
            card.teamId,
            sourceColumn.name,
            targetColumn.name
        );
        if (!permCheck.allowed) {
            throw new Error(permCheck.reason || "Permission denied");
        }
    }

    // Check WIP limit if moving to a different column
    if (sourceColumnId !== targetColumnId && targetColumn.wipLimit !== null) {
        const cardCount = await db.card.count({
            where: { columnId: targetColumnId },
        });
        if (cardCount >= targetColumn.wipLimit) {
            throw new Error(`WIP limit of ${targetColumn.wipLimit} reached for column "${targetColumn.name}"`);
        }
    }

    // Get all cards in the target column
    const targetCards = await db.card.findMany({
        where: { columnId: targetColumnId },
        orderBy: { order: "asc" },
    });

    // If moving within the same column
    if (sourceColumnId === targetColumnId) {
        const filteredCards = targetCards.filter((c) => c.id !== cardId);
        filteredCards.splice(targetIndex, 0, card);

        await db.$transaction(
            filteredCards.map((c, idx) =>
                db.card.update({
                    where: { id: c.id },
                    data: { order: idx },
                })
            )
        );
    } else {
        // Moving to a different column
        // Update source column cards
        const sourceCards = await db.card.findMany({
            where: { columnId: sourceColumnId, id: { not: cardId } },
            orderBy: { order: "asc" },
        });

        // Insert card into target position
        const newTargetCards = [...targetCards];
        newTargetCards.splice(targetIndex, 0, { ...card, columnId: targetColumnId });

        await db.$transaction([
            // Update the moved card
            db.card.update({
                where: { id: cardId },
                data: { columnId: targetColumnId, order: targetIndex },
            }),
            // Reorder source column
            ...sourceCards.map((c, idx) =>
                db.card.update({
                    where: { id: c.id },
                    data: { order: idx },
                })
            ),
            // Reorder target column
            ...newTargetCards.map((c, idx) =>
                db.card.update({
                    where: { id: c.id },
                    data: { order: idx },
                })
            ),
        ]);
    }

    revalidatePath(`/app/board/${boardId}`);
}

// Claim an onboarding card - assigns to current user and moves to Doing
export async function claimCard(cardId: string, boardId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // Find the card with its column info
    const card = await db.card.findUnique({
        where: { id: cardId },
        include: {
            column: {
                include: {
                    board: true,
                },
            },
        },
    });

    if (!card) {
        throw new Error("Card not found");
    }

    // Verify the card is actually claimable (in Ready, is onboarding, not assigned)
    if (card.column.name !== "Ready") {
        throw new Error("Can only claim cards in Ready status");
    }

    if (card.assigneeId) {
        throw new Error("Card is already assigned");
    }

    // Check team membership if card belongs to a team
    if (card.teamId) {
        const membership = await db.teamMember.findUnique({
            where: {
                teamId_userId: { teamId: card.teamId, userId: session.user.id },
            },
        });
        if (!membership) {
            throw new Error("You must be a team member to claim this card");
        }
    }

    // Find the "Doing" column on this board
    const doingColumn = await db.column.findFirst({
        where: {
            boardId: card.column.boardId,
            name: "Doing",
        },
    });

    if (!doingColumn) {
        throw new Error("Doing column not found on this board");
    }

    // Check WIP limit for Doing column
    if (doingColumn.wipLimit !== null) {
        const cardCount = await db.card.count({
            where: { columnId: doingColumn.id },
        });
        if (cardCount >= doingColumn.wipLimit) {
            throw new Error(`WIP limit of ${doingColumn.wipLimit} reached for Doing column`);
        }
    }

    // Get the highest order in the Doing column
    const lastCard = await db.card.findFirst({
        where: { columnId: doingColumn.id },
        orderBy: { order: "desc" },
    });

    // Update the card: assign to user and move to Doing
    await db.card.update({
        where: { id: cardId },
        data: {
            assigneeId: session.user.id,
            columnId: doingColumn.id,
            order: (lastCard?.order ?? -1) + 1,
        },
    });

    // Revalidate relevant paths
    revalidatePath(`/app/board/${card.column.boardId}`);
    revalidatePath(`/app/team`);
}
