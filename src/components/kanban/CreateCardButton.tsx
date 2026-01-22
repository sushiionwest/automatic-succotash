"use client";

import { useState } from "react";
import { createCard } from "@/actions/cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CreateCardButtonProps {
    columnId: string;
    boardId: string;
}

export function CreateCardButton({ columnId }: CreateCardButtonProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        try {
            await createCard(columnId, { title });
            toast.success("Card created");
            setTitle("");
            setIsCreating(false);
        } catch (error) {
            toast.error("Failed to create card");
        } finally {
            setLoading(false);
        }
    }

    if (isCreating) {
        return (
            <form onSubmit={handleSubmit} className="space-y-2">
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title..."
                    className="bg-zinc-900 border-zinc-600 text-white text-sm"
                    autoFocus
                />
                <div className="flex gap-2">
                    <Button
                        type="submit"
                        size="sm"
                        disabled={loading || !title.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {loading ? "Adding..." : "Add Card"}
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            setIsCreating(false);
                            setTitle("");
                        }}
                        className="text-zinc-400 hover:text-white"
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        );
    }

    return (
        <Button
            variant="ghost"
            onClick={() => setIsCreating(true)}
            className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-700"
        >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add a card
        </Button>
    );
}
