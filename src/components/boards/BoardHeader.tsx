"use client";

import { useState } from "react";
import { Board } from "@/types";
import { renameBoard, deleteBoard } from "@/actions/boards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";

interface BoardHeaderProps {
    board: Board;
}

export function BoardHeader({ board }: BoardHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(board.name);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleRename() {
        if (name.trim() === board.name) {
            setIsEditing(false);
            return;
        }

        setLoading(true);
        try {
            await renameBoard(board.id, name);
            toast.success("Board renamed");
            setIsEditing(false);
        } catch (error) {
            toast.error("Failed to rename board");
            setName(board.name);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        setLoading(true);
        try {
            await deleteBoard(board.id);
            toast.success("Board deleted");
        } catch (error) {
            toast.error("Failed to delete board");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700 bg-zinc-800/50">
            <div className="flex items-center gap-4">
                <Link
                    href="/app"
                    className="text-zinc-400 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>

                {isEditing ? (
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={(e) => e.key === "Enter" && handleRename()}
                        className="w-64 bg-zinc-900 border-zinc-600 text-white text-xl font-semibold"
                        autoFocus
                    />
                ) : (
                    <h1
                        className="text-xl font-semibold text-white cursor-pointer hover:text-blue-400 transition-colors"
                        onClick={() => setIsEditing(true)}
                    >
                        {board.name}
                    </h1>
                )}
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                    <DropdownMenuItem
                        onClick={() => setIsEditing(true)}
                        className="text-zinc-300 focus:text-white focus:bg-zinc-700 cursor-pointer"
                    >
                        Rename board
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-400 focus:text-red-300 focus:bg-zinc-700 cursor-pointer"
                    >
                        Delete board
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="bg-zinc-800 border-zinc-700">
                    <DialogHeader>
                        <DialogTitle className="text-white">Delete Board</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Are you sure you want to delete &quot;{board.name}&quot;? This will permanently delete all columns and cards. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setShowDeleteDialog(false)}
                            className="text-zinc-400 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {loading ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
