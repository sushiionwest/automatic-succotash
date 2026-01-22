import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { db } from "@/lib/db";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const teams = await db.team.findMany({
        orderBy: { name: "asc" },
    });

    return (
        <div className="flex h-screen bg-zinc-900">
            <Sidebar user={session.user} teams={teams} />
            <main className="flex-1 overflow-auto">{children}</main>
            <Toaster position="bottom-right" />
        </div>
    );
}
