"use client";

interface AdminStatsProps {
    teamCount: number;
    userCount: number;
    cardCount: number;
    boardCount: number;
}

export function AdminStats({ teamCount, userCount, cardCount, boardCount }: AdminStatsProps) {
    const stats = [
        { label: "Teams", value: teamCount, color: "bg-purple-500/20 text-purple-400" },
        { label: "Users", value: userCount, color: "bg-blue-500/20 text-blue-400" },
        { label: "Cards", value: cardCount, color: "bg-green-500/20 text-green-400" },
        { label: "Boards", value: boardCount, color: "bg-orange-500/20 text-orange-400" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg p-4"
                >
                    <p className="text-zinc-400 text-sm">{stat.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${stat.color.split(" ")[1]}`}>
                        {stat.value}
                    </p>
                </div>
            ))}
        </div>
    );
}
