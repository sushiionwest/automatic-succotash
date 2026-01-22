"use client";

import { useRouter } from "next/navigation";

interface Board {
    id: string;
    name: string;
}

interface BoardSelectorProps {
    boards: Board[];
    teamSlug: string;
    selectedBoardId?: string;
}

export function BoardSelector({ boards, teamSlug, selectedBoardId }: BoardSelectorProps) {
    const router = useRouter();

    function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const boardId = e.target.value;
        const url = boardId
            ? `/app/team/${teamSlug}/board?boardId=${boardId}`
            : `/app/team/${teamSlug}/board`;
        router.push(url);
    }

    return (
        <select
            value={selectedBoardId || ""}
            onChange={handleChange}
            className="bg-zinc-900 border border-zinc-600 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <option value="">Select a board...</option>
            {boards.map((board) => (
                <option key={board.id} value={board.id}>
                    {board.name}
                </option>
            ))}
        </select>
    );
}
