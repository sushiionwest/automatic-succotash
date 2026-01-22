"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { TeamRole } from "@/types";

// SAE teams matching Discord structure
const SAE_TEAMS = [
    { name: "Electronics Team", slug: "electronics-team", discordChannel: "#electronics-team" },
    { name: "Aerodynamics Team", slug: "aerodynamics-team", discordChannel: "#aerodynamics-team" },
    { name: "Controls Team", slug: "controls-team", discordChannel: "#controls-team" },
    { name: "Wings Team 25-26", slug: "wings-25-26", discordChannel: "#wings-team-25-26" },
    { name: "Fuselage Team 25-26", slug: "fuselage-25-26", discordChannel: "#fuselage-team-25-26" },
    { name: "CFD Team 25-26", slug: "cfd-25-26", discordChannel: "#cfd-team-25-26" },
    { name: "Landing Gear Team 25-26", slug: "landing-gear-25-26", discordChannel: "#landing-gear-team-25-26" },
];

export async function getTeams() {
    return db.team.findMany({
        orderBy: { name: "asc" },
    });
}

export async function getTeamBySlug(slug: string) {
    return db.team.findUnique({
        where: { slug },
    });
}

export async function seedTeams() {
    const existingTeams = await db.team.findMany();

    if (existingTeams.length > 0) {
        return { created: 0, message: "Teams already exist" };
    }

    const created = await db.$transaction(
        SAE_TEAMS.map((team) =>
            db.team.create({
                data: team,
            })
        )
    );

    revalidatePath("/app");
    return { created: created.length, message: `Created ${created.length} teams` };
}

// ============ Team Membership Functions ============

// Get team with members
export async function getTeamWithMembers(teamSlug: string) {
    return db.team.findUnique({
        where: { slug: teamSlug },
        include: {
            members: {
                include: {
                    user: true,
                },
                orderBy: [
                    { role: "asc" }, // LEADs first
                    { createdAt: "asc" },
                ],
            },
        },
    });
}

// Get user's membership in a team
export async function getTeamMembership(teamId: string, userId: string) {
    return db.teamMember.findUnique({
        where: {
            teamId_userId: { teamId, userId },
        },
    });
}

// Check if user is a lead of the team
export async function isTeamLead(teamId: string, userId: string): Promise<boolean> {
    const membership = await getTeamMembership(teamId, userId);
    return membership?.role === "LEAD";
}

// Check if user is a member (any role) of the team
export async function isTeamMember(teamId: string, userId: string): Promise<boolean> {
    const membership = await getTeamMembership(teamId, userId);
    return !!membership;
}

// Join a team (self-service, defaults to MEMBER role)
export async function joinTeam(teamSlug: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const team = await db.team.findUnique({
        where: { slug: teamSlug },
    });

    if (!team) {
        throw new Error("Team not found");
    }

    // Check if already a member
    const existing = await getTeamMembership(team.id, session.user.id);
    if (existing) {
        throw new Error("Already a member of this team");
    }

    await db.teamMember.create({
        data: {
            teamId: team.id,
            userId: session.user.id,
            role: "MEMBER",
        },
    });

    revalidatePath(`/app/team/${teamSlug}`);
}

// Leave a team
export async function leaveTeam(teamSlug: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const team = await db.team.findUnique({
        where: { slug: teamSlug },
    });

    if (!team) {
        throw new Error("Team not found");
    }

    await db.teamMember.delete({
        where: {
            teamId_userId: { teamId: team.id, userId: session.user.id },
        },
    });

    revalidatePath(`/app/team/${teamSlug}`);
}

// Add member to team (lead only)
export async function addTeamMember(teamSlug: string, userEmail: string, role: TeamRole = "MEMBER") {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const team = await db.team.findUnique({
        where: { slug: teamSlug },
    });

    if (!team) {
        throw new Error("Team not found");
    }

    // Check if requester is a lead
    const isLead = await isTeamLead(team.id, session.user.id);
    if (!isLead) {
        throw new Error("Only team leads can add members");
    }

    // Find user by email
    const user = await db.user.findUnique({
        where: { email: userEmail },
    });

    if (!user) {
        throw new Error("User not found. They must sign in first.");
    }

    // Check if already a member
    const existing = await getTeamMembership(team.id, user.id);
    if (existing) {
        throw new Error("User is already a member of this team");
    }

    await db.teamMember.create({
        data: {
            teamId: team.id,
            userId: user.id,
            role,
        },
    });

    revalidatePath(`/app/team/${teamSlug}`);
}

// Remove member from team (lead only, or self)
export async function removeTeamMember(teamSlug: string, userId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const team = await db.team.findUnique({
        where: { slug: teamSlug },
    });

    if (!team) {
        throw new Error("Team not found");
    }

    // Check if requester is a lead or removing themselves
    const isLead = await isTeamLead(team.id, session.user.id);
    const isSelf = session.user.id === userId;

    if (!isLead && !isSelf) {
        throw new Error("Only team leads can remove other members");
    }

    await db.teamMember.delete({
        where: {
            teamId_userId: { teamId: team.id, userId },
        },
    });

    revalidatePath(`/app/team/${teamSlug}`);
}

// Update member role (lead only)
export async function updateTeamMemberRole(teamSlug: string, userId: string, role: TeamRole) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const team = await db.team.findUnique({
        where: { slug: teamSlug },
    });

    if (!team) {
        throw new Error("Team not found");
    }

    // Check if requester is a lead
    const isLead = await isTeamLead(team.id, session.user.id);
    if (!isLead) {
        throw new Error("Only team leads can update member roles");
    }

    await db.teamMember.update({
        where: {
            teamId_userId: { teamId: team.id, userId },
        },
        data: { role },
    });

    revalidatePath(`/app/team/${teamSlug}`);
}
