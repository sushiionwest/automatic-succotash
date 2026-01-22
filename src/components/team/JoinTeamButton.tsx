"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { joinTeam } from "@/actions/teams";
import { toast } from "sonner";

interface JoinTeamButtonProps {
    teamSlug: string;
}

export function JoinTeamButton({ teamSlug }: JoinTeamButtonProps) {
    const [loading, setLoading] = useState(false);

    async function handleJoin() {
        setLoading(true);
        try {
            await joinTeam(teamSlug);
            toast.success("Joined team successfully!");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to join team");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button
            onClick={handleJoin}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
        >
            {loading ? "Joining..." : "Join Team"}
        </Button>
    );
}
