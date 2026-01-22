// Priority is a string literal type since SQLite doesn't support enums
export type Priority = "P0" | "P1" | "P2" | "P3";

// Define types manually matching schema
export interface User {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
}

export interface Board {
    id: string;
    name: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Team {
    id: string;
    name: string;           // Matches Discord team name (e.g., "Electronics Team")
    slug: string;           // URL-safe identifier (e.g., "electronics-team")
    discordChannel: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// Team membership roles
export type TeamRole = "LEAD" | "MEMBER";

export interface TeamMember {
    id: string;
    teamId: string;
    userId: string;
    role: TeamRole;
    createdAt: Date;
    updatedAt: Date;
}

export interface TeamMemberWithUser extends TeamMember {
    user: User;
}

export interface TeamWithMembers extends Team {
    members: TeamMemberWithUser[];
}

export interface Column {
    id: string;
    name: string;
    order: number;
    wipLimit: number | null; // Added WIP limit
    boardId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Card {
    id: string;
    title: string;
    description: string | null;
    acceptanceCriteria: string | null;
    priority: string;
    /** @deprecated Use teamId instead */
    subsystem: string | null;
    isOnboarding: boolean;
    dueDate: Date | null;
    order: number;
    columnId: string;
    assigneeId: string | null;
    teamId: string | null;      // Team this card belongs to
    createdAt: Date;
    updatedAt: Date;
}

export interface CardWithColumn extends Card {
    column: Column;
}

export interface CardWithAssignee extends Card {
    assignee: User | null;
}

export interface CardWithTeam extends Card {
    team: Team | null;
}

export interface CardWithAssigneeAndTeam extends Card {
    assignee: User | null;
    team: Team | null;
}

export interface ColumnWithCards extends Column {
    cards: CardWithAssigneeAndTeam[];
}

export interface BoardWithColumns extends Board {
    columns: ColumnWithCards[];
}

export type BoardSummary = Pick<Board, "id" | "name" | "createdAt" | "updatedAt">;

// Reorder utilities
export interface ReorderResult {
    id: string;
    order: number;
}
