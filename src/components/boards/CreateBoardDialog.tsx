"use client";

import { useState } from "react";
import { createBoard } from "@/actions/boards";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function CreateBoardDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            await createBoard(formData);
            toast.success("Board created successfully!");
            setOpen(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create board");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Board
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-800 border-zinc-700">
                <DialogHeader>
                    <DialogTitle className="text-white">Create New Board</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Give your board a name to get started.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="space-y-4">
                        <Input
                            name="name"
                            placeholder="Board name"
                            className="bg-zinc-900 border-zinc-600 text-white placeholder:text-zinc-500"
                            required
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                className="text-zinc-400 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {loading ? "Creating..." : "Create Board"}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
