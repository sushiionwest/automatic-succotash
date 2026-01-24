"use client";

import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CardWithAssigneeAndTeam } from "@/types";
import { CardItem } from "@/components/kanban/CardItem";

interface TeamColumnProps {
    column: {
        id: string;
        name: string;
        order: number;
        wipLimit: number | null;
        boardId: string;
        createdAt: Date;
        updatedAt: Date;
        cards: CardWithAssigneeAndTeam[];
    };
    teamName: string;
    currentUserId?: string;
    boardId?: string;
    onCardDeleted?: (cardId: string) => void;
}

export function TeamColumn({ column, teamName, currentUserId, boardId, onCardDeleted }: TeamColumnProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: { type: "column", column },
    });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="w-72 flex-shrink-0 bg-zinc-800 rounded-lg flex flex-col max-h-full"
        >
            {/* Column Header */}
            <div
                className="flex items-center justify-between px-3 py-2 border-b border-zinc-700"
                {...attributes}
                {...listeners}
            >
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-zinc-300">
                        {column.name}
                    </h3>
                    <span className="text-zinc-500 text-xs">
                        {column.cards.length} {column.wipLimit ? `/ ${column.wipLimit}` : ""}
                    </span>
                </div>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                <SortableContext
                    items={column.cards.map((card) => card.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {column.cards.length === 0 ? (
                        <div className="text-center py-4 text-zinc-500 text-sm">
                            No {teamName} cards
                        </div>
                    ) : (
                        column.cards.map((card) => (
                            <CardItem
                                key={card.id}
                                card={card}
                                currentUserId={currentUserId}
                                boardId={boardId}
                                columnName={column.name}
                                onDelete={onCardDeleted}
                            />
                        ))
                    )}
                </SortableContext>
            </div>
        </div>
    );
}
