import { Board } from "@/types";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface BoardCardProps {
    board: Board;
}

export function BoardCard({ board }: BoardCardProps) {
    return (
        <Link href={`/app/board/${board.id}`}>
            <Card className="bg-zinc-800 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-750 transition-all cursor-pointer group">
                <CardHeader>
                    <CardTitle className="text-white group-hover:text-blue-400 transition-colors">
                        {board.name}
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Updated {formatDistanceToNow(new Date(board.updatedAt), { addSuffix: true })}
                    </CardDescription>
                </CardHeader>
            </Card>
        </Link>
    );
}
