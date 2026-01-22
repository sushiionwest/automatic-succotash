"use client";

import { useState } from "react";
import { createColumn } from "@/actions/columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CreateColumnButtonProps {
    boardId: string;
}

export function CreateColumnButton({ boardId }: CreateColumnButtonProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            await createColumn(boardId, name);
            toast.success("Column created");
            setName("");
            setIsCreating(false);
        } catch (error) {
            toast.error("Failed to create column");
        } finally {
            setLoading(false);
        }
    }

    if (isCreating) {
        return (
            <div className="w-72 flex-shrink-0 bg-zinc-800 rounded-lg p-3">
                <form onSubmit={handleSubmit} className="space-y-2">
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter column name..."
                        className="bg-zinc-900 border-zinc-600 text-white text-sm"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            size="sm"
                            disabled={loading || !name.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading ? "Adding..." : "Add Column"}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                setIsCreating(false);
                                setName("");
                            }}
                            className="text-zinc-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <Button
            variant="ghost"
            onClick={() => setIsCreating(true)}
            className="w-72 flex-shrink-0 h-12 border-2 border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-zinc-800/50"
        >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Column
        </Button>
    );
}
