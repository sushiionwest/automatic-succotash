"use client";

import { useState, useEffect } from "react";
import { CardWithAssigneeAndTeam, Priority, TaskType, Team, User } from "@/types";
import { updateCard, deleteCard, approveCard } from "@/actions/cards";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface CardModalProps {
    card: CardWithAssigneeAndTeam;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentUserId?: string;
    isLead?: boolean;
    onDelete?: (cardId: string) => void;
}

const TASK_TYPES: TaskType[] = ["Design", "Build", "Test", "Docs", "Procurement"];

export function CardModal({ card, open, onOpenChange, currentUserId, isLead = false, onDelete }: CardModalProps) {
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description || "");
    const [acceptanceCriteria, setAcceptanceCriteria] = useState(card.acceptanceCriteria || "");
    const [teamId, setTeamId] = useState(card.teamId || "");
    const [taskType, setTaskType] = useState<string>(card.taskType || "");
    const [priority, setPriority] = useState<Priority>(card.priority as Priority);
    const [inputsLinks, setInputsLinks] = useState(card.inputsLinks || "");
    const [artifacts, setArtifacts] = useState(card.artifacts || "");
    const [isOnboarding, setIsOnboarding] = useState(card.isOnboarding);
    const [isBlocked, setIsBlocked] = useState(card.isBlocked);
    const [blockedReason, setBlockedReason] = useState(card.blockedReason || "");
    const [dueDate, setDueDate] = useState(
        card.dueDate ? new Date(card.dueDate).toISOString().split("T")[0] : ""
    );
    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        getTeams().then(setTeams);
    }, []);

    // Reset form when card changes
    useEffect(() => {
        setTitle(card.title);
        setDescription(card.description || "");
        setAcceptanceCriteria(card.acceptanceCriteria || "");
        setTeamId(card.teamId || "");
        setTaskType(card.taskType || "");
        setPriority(card.priority as Priority);
        setInputsLinks(card.inputsLinks || "");
        setArtifacts(card.artifacts || "");
        setIsOnboarding(card.isOnboarding);
        setIsBlocked(card.isBlocked);
        setBlockedReason(card.blockedReason || "");
        setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split("T")[0] : "");
    }, [card]);

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
                taskType: taskType as TaskType || null,
                priority,
                inputsLinks: inputsLinks || null,
                artifacts: artifacts || null,
                isOnboarding,
                isBlocked,
                blockedReason: isBlocked ? blockedReason : null,
                dueDate: dueDate ? new Date(dueDate) : null,
            });
            toast.success("Card updated");
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update card");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this card?")) return;

        setLoading(true);
        try {
            await deleteCard(card.id);
            toast.success("Card deleted");
            onDelete?.(card.id);
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to delete card");
        } finally {
            setLoading(false);
        }
    }

    async function handleApprove() {
        setLoading(true);
        try {
            await approveCard(card.id);
            toast.success("Card approved");
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to approve card");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-800 border-zinc-700 max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <DialogTitle className="text-white">Edit Card</DialogTitle>
                        {card.isApproved && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                Approved
                            </Badge>
                        )}
                        {card.isBlocked && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                Blocked
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Title */}
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

                    {/* Description - What to do */}
                    <div>
                        <label className="text-sm font-medium text-zinc-400 mb-1 block">
                            What to do
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full h-20 px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-md text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe what needs to be done..."
                        />
                    </div>

                    {/* Acceptance Criteria - Done looks like */}
                    <div>
                        <label className="text-sm font-medium text-zinc-400 mb-1 block">
                            Done looks like <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={acceptanceCriteria}
                            onChange={(e) => setAcceptanceCriteria(e.target.value)}
                            className="w-full h-20 px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-md text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="- Criteria 1&#10;- Criteria 2&#10;- Photos attached"
                        />
                        {acceptanceCriteria.length > 0 && acceptanceCriteria.length < 10 && (
                            <p className="text-red-400 text-xs mt-1">Minimum 10 characters required</p>
                        )}
                    </div>

                    {/* Team & Task Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-zinc-400 mb-1 block">
                                Team <span className="text-red-400">*</span>
                            </label>
                            <Select value={teamId} onValueChange={setTeamId}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-600 text-white">
                                    <SelectValue placeholder="Select team..." />
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

                        <div>
                            <label className="text-sm font-medium text-zinc-400 mb-1 block">
                                Task Type
                            </label>
                            <Select value={taskType} onValueChange={setTaskType}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-600 text-white">
                                    <SelectValue placeholder="Select type..." />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-zinc-700">
                                    {TASK_TYPES.map((type) => (
                                        <SelectItem key={type} value={type} className="text-white">
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Priority & Due Date */}
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
                    </div>

                    {/* Inputs/Links */}
                    <div>
                        <label className="text-sm font-medium text-zinc-400 mb-1 block">
                            Inputs / Links
                        </label>
                        <textarea
                            value={inputsLinks}
                            onChange={(e) => setInputsLinks(e.target.value)}
                            className="w-full h-16 px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-md text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="CAD link, Drive folder, datasheet URL, rule reference..."
                        />
                    </div>

                    {/* Artifacts */}
                    <div>
                        <label className="text-sm font-medium text-zinc-400 mb-1 block">
                            Artifacts (proof of completion)
                        </label>
                        <textarea
                            value={artifacts}
                            onChange={(e) => setArtifacts(e.target.value)}
                            className="w-full h-16 px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-md text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Photo URLs, test data links, document links..."
                        />
                    </div>

                    {/* Toggles row */}
                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isOnboarding}
                                onChange={(e) => setIsOnboarding(e.target.checked)}
                                className="w-4 h-4 bg-zinc-900 border-zinc-600 rounded"
                            />
                            <span className="text-sm text-zinc-300">Onboarding task</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isBlocked}
                                onChange={(e) => setIsBlocked(e.target.checked)}
                                className="w-4 h-4 bg-zinc-900 border-zinc-600 rounded"
                            />
                            <span className="text-sm text-red-400">Blocked</span>
                        </label>
                    </div>

                    {/* Blocked reason */}
                    {isBlocked && (
                        <div>
                            <label className="text-sm font-medium text-red-400 mb-1 block">
                                Blocked reason
                            </label>
                            <Input
                                value={blockedReason}
                                onChange={(e) => setBlockedReason(e.target.value)}
                                className="bg-zinc-900 border-red-600/50 text-white"
                                placeholder="Why is this blocked?"
                            />
                        </div>
                    )}

                    {/* Owner & Reviewer info */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-700">
                        <div>
                            <p className="text-xs text-zinc-500 mb-1">Owner</p>
                            {card.assignee ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white">
                                        {card.assignee.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <span className="text-sm text-zinc-300">{card.assignee.name || card.assignee.email}</span>
                                </div>
                            ) : (
                                <span className="text-sm text-zinc-500">Unassigned</span>
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 mb-1">Reviewer</p>
                            {card.reviewer ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-[10px] text-white">
                                        {card.reviewer.name?.[0]?.toUpperCase() || "R"}
                                    </div>
                                    <span className="text-sm text-zinc-300">{card.reviewer.name || card.reviewer.email}</span>
                                </div>
                            ) : (
                                <span className="text-sm text-zinc-500">Not reviewed</span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between pt-4 border-t border-zinc-700">
                        <Button
                            variant="ghost"
                            onClick={handleDelete}
                            disabled={loading}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                            Delete
                        </Button>
                        <div className="flex gap-2">
                            {/* Approve button for leads on cards in Review */}
                            {isLead && !card.isApproved && (
                                <Button
                                    variant="outline"
                                    onClick={handleApprove}
                                    disabled={loading}
                                    className="border-green-600 text-green-400 hover:bg-green-600/20"
                                >
                                    Approve
                                </Button>
                            )}
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
