"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { TeamRole } from "@/types";

async function requireAdmin() {
    const session = await auth();
    if (!session?.user?.id || !isAdmin(session.user.email)) {
        throw new Error("Unauthorized: Admin access required");
    }
    return session;
}

// Add user to team (admin only)
export async function adminAddUserToTeam(userId: string, teamSlug: string, role: TeamRole = "MEMBER") {
    await requireAdmin();

    const team = await db.team.findUnique({
        where: { slug: teamSlug },
    });

    if (!team) {
        throw new Error("Team not found");
    }

    // Check if already a member
    const existing = await db.teamMember.findUnique({
        where: {
            teamId_userId: { teamId: team.id, userId },
        },
    });

    if (existing) {
        throw new Error("User is already a member of this team");
    }

    await db.teamMember.create({
        data: {
            teamId: team.id,
            userId,
            role,
        },
    });

    revalidatePath("/app/admin");
    revalidatePath(`/app/team/${teamSlug}`);
}

// Remove user from team (admin only)
export async function adminRemoveUserFromTeam(userId: string, teamSlug: string) {
    await requireAdmin();

    const team = await db.team.findUnique({
        where: { slug: teamSlug },
    });

    if (!team) {
        throw new Error("Team not found");
    }

    await db.teamMember.delete({
        where: {
            teamId_userId: { teamId: team.id, userId },
        },
    });

    revalidatePath("/app/admin");
    revalidatePath(`/app/team/${teamSlug}`);
}

// Set user role in team (admin only)
export async function adminSetUserRole(userId: string, teamSlug: string, role: TeamRole) {
    await requireAdmin();

    const team = await db.team.findUnique({
        where: { slug: teamSlug },
    });

    if (!team) {
        throw new Error("Team not found");
    }

    await db.teamMember.update({
        where: {
            teamId_userId: { teamId: team.id, userId },
        },
        data: { role },
    });

    revalidatePath("/app/admin");
    revalidatePath(`/app/team/${teamSlug}`);
}

// Create a new team (admin only)
export async function adminCreateTeam(name: string, slug: string, discordChannel?: string) {
    await requireAdmin();

    // Check if slug already exists
    const existing = await db.team.findUnique({
        where: { slug },
    });

    if (existing) {
        throw new Error("Team with this slug already exists");
    }

    await db.team.create({
        data: {
            name,
            slug,
            discordChannel: discordChannel || null,
        },
    });

    revalidatePath("/app/admin");
    revalidatePath("/app");
}

// Delete a team (admin only)
export async function adminDeleteTeam(teamSlug: string) {
    await requireAdmin();

    const team = await db.team.findUnique({
        where: { slug: teamSlug },
        include: {
            _count: { select: { cards: true, members: true } },
        },
    });

    if (!team) {
        throw new Error("Team not found");
    }

    if (team._count.cards > 0) {
        throw new Error(`Cannot delete team with ${team._count.cards} cards. Remove cards first.`);
    }

    await db.team.delete({
        where: { slug: teamSlug },
    });

    revalidatePath("/app/admin");
    revalidatePath("/app");
}
