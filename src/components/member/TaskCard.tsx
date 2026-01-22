"use client";

import { CardWithAssigneeAndTeam } from "@/types";
import { claimCard, submitForReview } from "@/actions/cards";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface TaskCardProps {
    card: CardWithAssigneeAndTeam;
    boardId: string;
    currentUserId: string;
    mode: "available" | "mine";
}

export function TaskCard({ card, boardId, currentUserId, mode }: TaskCardProps) {
    const [loading, setLoading] = useState(false);

    // Parse description into bullets (first 3 lines)
    const descriptionBullets = (card.description || "")
        .split("\n")
        .filter(line => line.trim())
        .slice(0, 3);

    // Parse acceptance criteria into bullets (first 3 lines)
    const criteriaBullets = (card.acceptanceCriteria || "")
        .split("\n")
        .filter(line => line.trim())
        .slice(0, 3);

    async function handleClaim() {
        setLoading(true);
        try {
            await claimCard(card.id, boardId);
            toast.success("Task claimed! It's now in Your Tasks.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to claim");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit() {
        setLoading(true);
        try {
            await submitForReview(card.id);
            toast.success("Submitted for review! A lead will check it.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to submit");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors">
            {/* Title */}
            <h3 className="text-lg font-semibold text-white mb-3">{card.title}</h3>

            {/* What to do */}
            {descriptionBullets.length > 0 && (
                <div className="mb-3">
                    <p className="text-xs font-medium text-zinc-500 uppercase mb-1">What to do</p>
                    <ul className="space-y-1">
                        {descriptionBullets.map((line, i) => (
                            <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                                <span className="text-blue-400 mt-0.5">•</span>
                                <span>{line.replace(/^[\d\.\-\*]+\s*/, "")}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Done looks like */}
            {criteriaBullets.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs font-medium text-zinc-500 uppercase mb-1">Done looks like</p>
                    <ul className="space-y-1">
                        {criteriaBullets.map((line, i) => (
                            <li key={i} className="text-sm text-green-400 flex items-start gap-2">
                                <span className="mt-0.5">✓</span>
                                <span>{line.replace(/^[\-\*\[\]x\s]+/, "")}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Action button */}
            {mode === "available" ? (
                <Button
                    onClick={handleClaim}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
                >
                    {loading ? "Claiming..." : "Claim This Task"}
                </Button>
            ) : (
                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                    {loading ? "Submitting..." : "Submit for Review"}
                </Button>
            )}
        </div>
    );
}
