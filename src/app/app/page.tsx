import { getBoards } from "@/actions/boards";
import { BoardList } from "@/components/boards/BoardList";
import { CreateBoardDialog } from "@/components/boards/CreateBoardDialog";

export default async function AppPage() {
    const boards = await getBoards();

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Your Boards</h1>
                <CreateBoardDialog />
            </div>
            <BoardList boards={boards} />
        </div>
    );
}
