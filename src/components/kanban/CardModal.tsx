"use client";

import { useState, useEffect } from "react";
import { CardWithAssigneeAndTeam, Priority, Team } from "@/types";
import { updateCard, deleteCard } from "@/actions/cards";
import { getTeams } from "@/actions/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CardModalProps {
    card: CardWithAssigneeAndTeam;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CardModal({ card, open, onOpenChange }: CardModalProps) {
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description || "");
    const [acceptanceCriteria, setAcceptanceCriteria] = useState(card.acceptanceCriteria || "");
    const [teamId, setTeamId] = useState(card.teamId || "");
    const [priority, setPriority] = useState<Priority>(card.priority as Priority);
    const [dueDate, setDueDate] = useState(
        card.dueDate ? new Date(card.dueDate).toISOString().split("T")[0] : ""
    );
    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        getTeams().then(setTeams);
    }, []);

    async function handleSave() {
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        setLoading(true);
        try {
            await updateCard(card.id, {
                title,
                description,
                acceptanceCriteria,
                teamId: teamId || null,
                priority,
                dueDate: dueDate ? new Date(dueDate) : null,
            });
            toast.success("Card updated");
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to update card");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        setLoading(true);
        try {
            await deleteCard(card.id);
            toast.success("Card deleted");
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to delete card");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-800 border-zinc-700 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white">Edit Card</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-zinc-400 mb-1 block">
                            Title
                        </label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-zinc-900 border-zinc-600 text-white"
                            placeholder="Card title"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-zinc-400 mb-1 block">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full h-24 px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-md text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add a description..."
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-zinc-400 mb-1 block">
                            Acceptance Criteria ("Done looks like")
                        </label>
                        <textarea
                            value={acceptanceCriteria}
                            onChange={(e) => setAcceptanceCriteria(e.target.value)}
                            className="w-full h-24 px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-md text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="- Criteria 1&#10;- Criteria 2"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-zinc-400 mb-1 block">
                                Priority
                            </label>
                            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-600 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-zinc-700">
                                    <SelectItem value="P0" className="text-red-400">P0 - Critical</SelectItem>
                                    <SelectItem value="P1" className="text-orange-400">P1 - High</SelectItem>
                                    <SelectItem value="P2" className="text-blue-400">P2 - Medium</SelectItem>
                                    <SelectItem value="P3" className="text-zinc-400">P3 - Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-zinc-400 mb-1 block">
                                Due Date
                            </label>
                            <Input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="bg-zinc-900 border-zinc-600 text-white"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="text-sm font-medium text-zinc-400 mb-1 block">
                                Team
                            </label>
                            <Select value={teamId} onValueChange={setTeamId}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-600 text-white">
                                    <SelectValue placeholder="Select a team..." />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-zinc-700">
                                    {teams.map((team) => (
                                        <SelectItem key={team.id} value={team.id} className="text-white">
                                            {team.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button
                            variant="ghost"
                            onClick={handleDelete}
                            disabled={loading}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                            Delete
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="text-zinc-400 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {loading ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
