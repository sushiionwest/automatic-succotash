"use client";

import { useState, useCallback } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { BoardWithColumns } from "@/types";
import { Column } from "./Column";
import { CardItem } from "./CardItem";
import { CreateColumnButton } from "./CreateColumnButton";
import { updateCard, moveCard } from "@/actions/cards";
import { CardWithAssigneeAndTeam } from "@/types";
import { toast } from "sonner";

interface KanbanBoardProps {
    board: BoardWithColumns;
    currentUserId: string;
}

export function KanbanBoard({ board, currentUserId }: KanbanBoardProps) {
    const [columns, setColumns] = useState(board.columns);
    const [activeCard, setActiveCard] = useState<CardWithAssigneeAndTeam | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor)
    );

    const findColumnByCardId = useCallback(
        (cardId: string) => {
            return columns.find((col) => col.cards.some((card) => card.id === cardId));
        },
        [columns]
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        const column = columns.find((col) =>
            col.cards.some((card) => card.id === active.id)
        );
        if (column) {
            const card = column.cards.find((c) => c.id === active.id);
            if (card) {
                setActiveCard(card);
            }
        }
    }, [columns]);

    const handleDragOver = useCallback((event: DragOverEvent) => {
        // ... (same as before) ...
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeColumn = findColumnByCardId(activeId);
        const overColumn = findColumnByCardId(overId) || columns.find((col) => col.id === overId);

        if (!activeColumn || !overColumn || activeColumn.id === activeColumn.id && activeColumn.id === overColumn.id) {
            // Wait, this allows reordering in same column.
        }

        if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) return;

        setColumns((prev) => {
            const activeCards = activeColumn.cards;
            const overCards = overColumn.cards;

            const activeIndex = activeCards.findIndex((c) => c.id === activeId);
            const overIndex = overCards.findIndex((c) => c.id === overId);

            const newIndex = overIndex >= 0 ? overIndex : overCards.length;

            return prev.map((col) => {
                if (col.id === activeColumn.id) {
                    return {
                        ...col,
                        cards: col.cards.filter((c) => c.id !== activeId),
                    };
                }
                if (col.id === overColumn.id) {
                    const updatedCards = [...col.cards];
                    const movingCard = activeCards[activeIndex];
                    updatedCards.splice(newIndex, 0, { ...movingCard, columnId: col.id });
                    return {
                        ...col,
                        cards: updatedCards,
                    };
                }
                return col;
            });
        });
    }, [columns, findColumnByCardId]);

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCard(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId === overId) return;

        const overColumn = findColumnByCardId(overId) || columns.find((col) => col.id === overId);
        if (!overColumn) return;

        // --- KANBAN RULES ENFORCEMENT ---

        // Find the card object (it might have moved in state, so look in overColumn or board)
        // We need the *original* card data to check current state, but we also want the one being moved.
        // Actually, 'activeCard' state is set on DragStart, use that?
        // But activeCard state is cleared at start of this function? No, right above.
        // Wait, I cleared it line 109. I should capture it before clearing.

        // Let's refetch from columns state (which simulates the move) or board props?
        // Better to use board.columns to check "before move" properties like acceptanceCriteria?
        // Or activeCard state if it was preserved.

        // Retrying finding card in current state (it's already moved optimally in handleDragOver if column changed)
        // But for "Ready" check, we simply check the card's properties.
        const cardInColumn = overColumn.cards.find(c => c.id === activeId);

        if (cardInColumn) {
            // Rule 1: Ready requires Team + Acceptance Criteria
            const missingTeam = !cardInColumn.teamId;
            const missingCriteria = !cardInColumn.acceptanceCriteria?.trim();

            if (overColumn.name === "Ready" && (missingTeam || missingCriteria)) {
                const missing = [
                    missingTeam && "Team",
                    missingCriteria && "Done looks like"
                ].filter(Boolean).join(" + ");

                toast.error(`Cannot move to Ready: Set ${missing} first.`, {
                    duration: 4000
                });
                // Revert state
                setColumns(board.columns);
                return;
            }

            // Rule 2: Doing auto-assigns
            if (overColumn.name === "Doing" && !cardInColumn.assigneeId) {
                toast.success("Card auto-assigned to you.");
                // Fire and forget update (or await?)
                updateCard(activeId, { assigneeId: currentUserId });
            }
        }

        const overIndex = overColumn.cards.findIndex((c) => c.id === overId);
        const targetIndex = overIndex >= 0 ? overIndex : overColumn.cards.length;

        try {
            await moveCard(activeId, overColumn.id, targetIndex);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to move card");
            setColumns(board.columns);
        }
    }, [columns, findColumnByCardId, board.columns, currentUserId]);

    const handleCardDeleted = useCallback((cardId: string) => {
        setColumns((prev) =>
            prev.map((col) => ({
                ...col,
                cards: col.cards.filter((card) => card.id !== cardId),
            }))
        );
    }, []);

    return (
        <div className="flex-1 overflow-x-auto p-6">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 h-full">
                    <SortableContext
                        items={columns.map((col) => col.id)}
                        strategy={horizontalListSortingStrategy}
                    >
                        {columns.map((column) => (
                            <Column
                                key={column.id}
                                column={column}
                                boardId={board.id}
                                currentUserId={currentUserId}
                                onCardDeleted={handleCardDeleted}
                            />
                        ))}
                    </SortableContext>

                    <CreateColumnButton boardId={board.id} />
                </div>

                <DragOverlay>
                    {activeCard ? (
                        <CardItem card={activeCard} isDragging />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
