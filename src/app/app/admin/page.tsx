import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AdminTeamList } from "@/components/admin/AdminTeamList";
import { AdminUserList } from "@/components/admin/AdminUserList";
import { AdminStats } from "@/components/admin/AdminStats";

export default async function AdminPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    // Check if user is admin
    if (!isAdmin(session.user.email)) {
        notFound();
    }

    // Fetch all data for admin view
    const [teams, users, cards, boards] = await Promise.all([
        db.team.findMany({
            include: {
                members: {
                    include: { user: true },
                },
                _count: { select: { cards: true } },
            },
            orderBy: { name: "asc" },
        }),
        db.user.findMany({
            include: {
                teamMemberships: {
                    include: { team: true },
                },
                _count: {
                    select: {
                        assignedCards: true,
                        boards: true,
                    }
                },
            },
            orderBy: { name: "asc" },
        }),
        db.card.count(),
        db.board.count(),
    ]);

    return (
        <div className="h-full flex flex-col p-6 overflow-auto">
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                    <Link href="/app" className="hover:text-zinc-300">
                        All Boards
                    </Link>
                    <span>/</span>
                    <span className="text-zinc-300">Admin</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-zinc-400 text-sm mt-1">
                    Manage teams, users, and system settings
                </p>
            </div>

            {/* Stats */}
            <AdminStats
                teamCount={teams.length}
                userCount={users.length}
                cardCount={cards}
                boardCount={boards}
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                {/* Teams */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-5">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        Teams ({teams.length})
                    </h2>
                    <AdminTeamList teams={teams} />
                </div>

                {/* Users */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-5">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        Users ({users.length})
                    </h2>
                    <AdminUserList users={users} teams={teams} />
                </div>
            </div>
        </div>
    );
}
