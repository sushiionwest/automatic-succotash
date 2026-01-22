"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ColumnWithCards } from "@/types";
import { CardItem } from "./CardItem";
import { CreateCardButton } from "./CreateCardButton";
import { renameColumn, deleteColumn } from "@/actions/columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ColumnProps {
    column: ColumnWithCards;
    boardId: string;
}

export function Column({ column, boardId }: ColumnProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(column.name);
    const [loading, setLoading] = useState(false);

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

    async function handleRename() {
        if (name.trim() === column.name) {
            setIsEditing(false);
            return;
        }

        setLoading(true);
        try {
            await renameColumn(column.id, name);
            toast.success("Column renamed");
            setIsEditing(false);
        } catch (error) {
            toast.error("Failed to rename column");
            setName(column.name);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        setLoading(true);
        try {
            await deleteColumn(column.id);
            toast.success("Column deleted");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete column");
        } finally {
            setLoading(false);
        }
    }

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
                {isEditing ? (
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={(e) => e.key === "Enter" && handleRename()}
                        className="h-7 bg-zinc-900 border-zinc-600 text-white text-sm font-medium"
                        autoFocus
                    />
                ) : (
                    <div className="flex items-center gap-2">
                        <h3
                            className="text-sm font-medium text-zinc-300 cursor-pointer hover:text-white"
                            onClick={() => setIsEditing(true)}
                        >
                            {column.name}
                        </h3>
                        <span className="text-zinc-500 text-xs">
                            {column.cards.length} {column.wipLimit ? `/ ${column.wipLimit}` : ""}
                        </span>
                    </div>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-zinc-500 hover:text-white"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                        <DropdownMenuItem
                            onClick={() => setIsEditing(true)}
                            className="text-zinc-300 focus:text-white focus:bg-zinc-700 cursor-pointer"
                        >
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={handleDelete}
                            disabled={loading}
                            className="text-red-400 focus:text-red-300 focus:bg-zinc-700 cursor-pointer"
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                <SortableContext
                    items={column.cards.map((card) => card.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {column.cards.length === 0 ? (
                        <div className="text-center py-4 text-zinc-500 text-sm">
                            No cards yet
                        </div>
                    ) : (
                        column.cards.map((card) => (
                            <CardItem key={card.id} card={card} />
                        ))
                    )}
                </SortableContext>
            </div>

            {/* Add Card Button */}
            <div className="p-2 border-t border-zinc-700">
                <CreateCardButton columnId={column.id} boardId={boardId} />
            </div>
        </div>
    );
}
