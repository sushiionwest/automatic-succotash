"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CardWithAssigneeAndTeam, Priority } from "@/types";
import { Badge } from "@/components/ui/badge";
import { CardModal } from "./CardModal";
import { format } from "date-fns";

interface CardItemProps {
    card: CardWithAssigneeAndTeam;
    isDragging?: boolean;
}

const priorityColors: Record<Priority, string> = {
    P0: "bg-red-500/20 text-red-400 border-red-500/30",
    P1: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    P2: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    P3: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const priorityLabels: Record<Priority, string> = {
    P0: "Critical",
    P1: "High",
    P2: "Medium",
    P3: "Low",
};

export function CardItem({ card, isDragging = false }: CardItemProps) {
    const [showModal, setShowModal] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({
        id: card.id,
        data: { type: "card", card },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.5 : 1,
    };

    const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                onClick={() => !isDragging && setShowModal(true)}
                className={`
          bg-zinc-900 border border-zinc-700 rounded-lg p-3 cursor-pointer
          hover:border-zinc-600 hover:bg-zinc-850 transition-all
          ${isDragging ? "shadow-xl ring-2 ring-blue-500" : ""}
        `}
            >
                {card.team && (
                    <Badge variant="outline" className="text-[10px] py-0 h-5 bg-purple-500/10 text-purple-400 border-purple-500/30 mb-2">
                        {card.team.name}
                    </Badge>
                )}

                <h4 className="text-sm font-medium text-white mb-1.5">{card.title}</h4>

                {card.acceptanceCriteria ? (
                    <div className="flex items-start gap-1.5 mb-3 bg-zinc-800/50 p-1.5 rounded border border-zinc-800">
                        <span className="text-green-500 text-[10px] mt-0.5">✓</span>
                        <p className="text-[10px] text-zinc-400 line-clamp-1 italic">
                            "{card.acceptanceCriteria.split('\n')[0]}"
                        </p>
                    </div>
                ) : (
                    <div className="mb-3">
                        <p className="text-[10px] text-red-400/80 italic">Missing acceptance criteria</p>
                    </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-800">
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={`text-[10px] py-0 h-5 px-1.5 ${priorityColors[card.priority as Priority]}`}
                        >
                            {priorityLabels[card.priority as Priority]}
                        </Badge>
                        {card.dueDate && (
                            <span className={`text-[10px] ${isOverdue ? "text-red-400" : "text-zinc-500"}`}>
                                {format(new Date(card.dueDate), "MMM d")}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center">
                        {card.assignee ? (
                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-medium" title={card.assignee.name || "User"}>
                                {card.assignee.name?.[0]?.toUpperCase() || "U"}
                            </div>
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500" title="Unassigned">
                                ?
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CardModal
                card={card}
                open={showModal}
                onOpenChange={setShowModal}
            />
        </>
    );
}
