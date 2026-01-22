"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { claimCard } from "@/actions/cards";
import { toast } from "sonner";

interface OnboardingCard {
    id: string;
    title: string;
    description: string | null;
    acceptanceCriteria: string | null;
    priority: string;
    assignee: { id: string; name: string | null } | null;
    team: { id: string; name: string } | null;
    column: {
        id: string;
        name: string;
        board: { id: string; name: string };
    };
}

interface OnboardingCardsProps {
    cards: OnboardingCard[];
    currentUserId: string;
}

export function OnboardingCards({ cards, currentUserId }: OnboardingCardsProps) {
    const [claimingId, setClaimingId] = useState<string | null>(null);

    async function handleClaim(card: OnboardingCard) {
        setClaimingId(card.id);
        try {
            await claimCard(card.id, card.column.board.id);
            toast.success(`Claimed "${card.title}"`, {
                description: "Card moved to Doing and assigned to you.",
            });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to claim card");
        } finally {
            setClaimingId(null);
        }
    }

    if (cards.length === 0) {
        return (
            <div className="text-center py-8 text-zinc-500">
                <p>No onboarding tasks available right now.</p>
                <p className="text-sm mt-1">Check back later or ask your team lead.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {cards.map((card) => (
                <div
                    key={card.id}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg p-4"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-white truncate">
                                {card.title}
                            </h3>
                            {card.acceptanceCriteria && (
                                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                                    {card.acceptanceCriteria}
                                </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                                <Badge
                                    variant="outline"
                                    className="text-[10px] py-0 h-5 bg-zinc-800 text-zinc-400 border-zinc-600"
                                >
                                    {card.column.board.name}
                                </Badge>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => handleClaim(card)}
                            disabled={claimingId === card.id}
                            className="bg-green-600 hover:bg-green-700 text-white shrink-0"
                        >
                            {claimingId === card.id ? "Claiming..." : "Claim"}
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
