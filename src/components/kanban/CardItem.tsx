"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CardWithAssigneeAndTeam, Priority, TaskType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardModal } from "./CardModal";
import { claimCard, submitForReview } from "@/actions/cards";
import { format } from "date-fns";
import { toast } from "sonner";

interface CardItemProps {
    card: CardWithAssigneeAndTeam;
    isDragging?: boolean;
    currentUserId?: string;
    isLead?: boolean;
    boardId?: string;
    columnName?: string;
}

const priorityColors: Record<Priority, string> = {
    P0: "bg-red-500/20 text-red-400 border-red-500/30",
    P1: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    P2: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    P3: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const taskTypeColors: Record<TaskType, string> = {
    Design: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Build: "bg-green-500/20 text-green-400 border-green-500/30",
    Test: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Docs: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Procurement: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

export function CardItem({ card, isDragging = false, currentUserId, isLead = false, boardId, columnName }: CardItemProps) {
    const [showModal, setShowModal] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [submitting, setSubmitting] = useState(false);

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
    const canClaim = !card.assigneeId && currentUserId && boardId;

    async function handleClaim(e: React.MouseEvent) {
        e.stopPropagation();
        if (!boardId) return;

        setClaiming(true);
        try {
            await claimCard(card.id, boardId);
            toast.success("Task claimed! Moved to Doing.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to claim task");
        } finally {
            setClaiming(false);
        }
    }

    async function handleSubmitForReview(e: React.MouseEvent) {
        e.stopPropagation();
        setSubmitting(true);
        try {
            await submitForReview(card.id);
            toast.success("Submitted for review!");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to submit");
        } finally {
            setSubmitting(false);
        }
    }

    const canSubmitForReview = columnName === "Doing" && card.assigneeId === currentUserId;

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                onClick={() => !isDragging && setShowModal(true)}
                className={`
                    bg-zinc-900 border rounded-lg p-3 cursor-pointer
                    hover:border-zinc-600 hover:bg-zinc-850 transition-all
                    ${isDragging ? "shadow-xl ring-2 ring-blue-500" : ""}
                    ${card.isBlocked ? "border-red-500/50 bg-red-950/20" : "border-zinc-700"}
                `}
            >
                {/* Top badges row */}
                <div className="flex flex-wrap gap-1 mb-2">
                    {card.team && (
                        <Badge variant="outline" className="text-[10px] py-0 h-5 bg-purple-500/10 text-purple-400 border-purple-500/30">
                            {card.team.name.replace(" Team", "").replace(" 25-26", "")}
                        </Badge>
                    )}
                    {card.taskType && (
                        <Badge variant="outline" className={`text-[10px] py-0 h-5 ${taskTypeColors[card.taskType as TaskType] || "bg-zinc-500/20 text-zinc-400"}`}>
                            {card.taskType}
                        </Badge>
                    )}
                    {card.isOnboarding && (
                        <Badge variant="outline" className="text-[10px] py-0 h-5 bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                            Onboarding
                        </Badge>
                    )}
                    {card.isBlocked && (
                        <Badge className="text-[10px] py-0 h-5 bg-red-500/30 text-red-300 border-red-500/50">
                            🚫 Blocked
                        </Badge>
                    )}
                    {card.isApproved && (
                        <Badge className="text-[10px] py-0 h-5 bg-green-500/20 text-green-400 border-green-500/30">
                            ✓ Approved
                        </Badge>
                    )}
                </div>

                {/* Title */}
                <h4 className="text-sm font-medium text-white mb-1.5">{card.title}</h4>

                {/* Blocked reason */}
                {card.isBlocked && card.blockedReason && (
                    <p className="text-[10px] text-red-400 mb-2 italic">
                        Blocked: {card.blockedReason}
                    </p>
                )}

                {/* Acceptance criteria */}
                {card.acceptanceCriteria ? (
                    <div className="flex items-start gap-1.5 mb-3 bg-zinc-800/50 p-1.5 rounded border border-zinc-800">
                        <span className="text-green-500 text-[10px] mt-0.5">✓</span>
                        <p className="text-[10px] text-zinc-400 line-clamp-1 italic">
                            "{card.acceptanceCriteria.split('\n')[0]}"
                        </p>
                    </div>
                ) : (
                    <div className="mb-3">
                        <p className="text-[10px] text-red-400/80 italic">Missing "done looks like"</p>
                    </div>
                )}

                {/* Inputs/Links preview */}
                {card.inputsLinks && (
                    <div className="mb-2">
                        <p className="text-[10px] text-zinc-500">
                            📎 {card.inputsLinks.split('\n').length} link{card.inputsLinks.split('\n').length > 1 ? 's' : ''}
                        </p>
                    </div>
                )}

                {/* Bottom row */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-800">
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={`text-[10px] py-0 h-5 px-1.5 ${priorityColors[card.priority as Priority]}`}
                        >
                            {card.priority}
                        </Badge>
                        {card.dueDate && (
                            <span className={`text-[10px] ${isOverdue ? "text-red-400" : "text-zinc-500"}`}>
                                {format(new Date(card.dueDate), "MMM d")}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Claim button for unassigned cards in Ready */}
                        {canClaim && (columnName === "Ready" || !columnName) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClaim}
                                disabled={claiming}
                                className="h-6 px-2 text-[10px] bg-green-600/20 text-green-400 hover:bg-green-600/30 hover:text-green-300"
                            >
                                {claiming ? "..." : "Claim"}
                            </Button>
                        )}

                        {/* Submit for Review button for cards in Doing */}
                        {canSubmitForReview && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSubmitForReview}
                                disabled={submitting}
                                className="h-6 px-2 text-[10px] bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300"
                            >
                                {submitting ? "..." : "Submit"}
                            </Button>
                        )}

                        {/* Assignee avatar */}
                        {card.assignee ? (
                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-medium" title={card.assignee.name || "User"}>
                                {card.assignee.name?.[0]?.toUpperCase() || "U"}
                            </div>
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500" title="Unassigned">
                                ?
                            </div>
                        )}

                        {/* Reviewer indicator */}
                        {card.reviewer && (
                            <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[10px] text-white font-medium" title={`Reviewer: ${card.reviewer.name || "Lead"}`}>
                                {card.reviewer.name?.[0]?.toUpperCase() || "R"}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CardModal
                card={card}
                open={showModal}
                onOpenChange={setShowModal}
                currentUserId={currentUserId}
                isLead={isLead}
            />
        </>
    );
}
