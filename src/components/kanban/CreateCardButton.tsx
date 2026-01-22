"use client";

import { useState } from "react";
import { createCard } from "@/actions/cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CARD_TEMPLATES, getTemplateById } from "@/lib/cardTemplates";
import { toast } from "sonner";

interface CreateCardButtonProps {
    columnId: string;
    boardId: string;
    defaultTeamId?: string;
}

export function CreateCardButton({ columnId, defaultTeamId }: CreateCardButtonProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState("");
    const [templateId, setTemplateId] = useState<string>("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        try {
            const template = templateId ? getTemplateById(templateId) : null;

            await createCard(columnId, {
                title,
                description: template?.description,
                acceptanceCriteria: template?.acceptanceCriteria,
                priority: template?.priority,
                taskType: template?.taskType as "Design" | "Build" | "Test" | "Docs" | "Procurement" | null,
                isOnboarding: template?.isOnboarding,
                teamId: defaultTeamId || null,
            });

            toast.success("Card created");
            setTitle("");
            setTemplateId("");
            setIsCreating(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create card");
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

                {/* Template selector */}
                <Select value={templateId} onValueChange={setTemplateId}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-600 text-white text-xs h-8">
                        <SelectValue placeholder="Use template (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="none" className="text-xs text-zinc-400">
                            No template
                        </SelectItem>
                        {CARD_TEMPLATES.map((t) => (
                            <SelectItem key={t.id} value={t.id} className="text-xs text-white">
                                {t.name} {t.isOnboarding ? "⭐" : ""}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

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
                            setTemplateId("");
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
