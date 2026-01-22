"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { addTeamMember } from "@/actions/teams";
import { toast } from "sonner";
import { TeamRole } from "@/types";

interface AddMemberFormProps {
    teamSlug: string;
}

export function AddMemberForm({ teamSlug }: AddMemberFormProps) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<TeamRole>("MEMBER");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!email.trim()) {
            toast.error("Email is required");
            return;
        }

        setLoading(true);
        try {
            await addTeamMember(teamSlug, email.trim(), role);
            toast.success(`Added ${email} as ${role}`);
            setEmail("");
            setRole("MEMBER");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add member");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="flex-1 bg-zinc-900 border-zinc-600 text-white"
            />
            <Select value={role} onValueChange={(v) => setRole(v as TeamRole)}>
                <SelectTrigger className="w-32 bg-zinc-900 border-zinc-600 text-white">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="MEMBER" className="text-white">Member</SelectItem>
                    <SelectItem value="LEAD" className="text-white">Lead</SelectItem>
                </SelectContent>
            </Select>
            <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
            >
                {loading ? "Adding..." : "Add"}
            </Button>
        </form>
    );
}
