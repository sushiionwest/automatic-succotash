// Priority is a string literal type since SQLite doesn't support enums
export type Priority = "P0" | "P1" | "P2" | "P3";

// Task types for SAE workflow
export type TaskType = "Design" | "Build" | "Test" | "Docs" | "Procurement";

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
    wipLimit: number | null;
    boardId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Card {
    id: string;
    title: string;
    description: string | null;          // "What to do"
    acceptanceCriteria: string | null;   // "Done looks like"
    priority: string;                    // P0, P1, P2, P3
    taskType: string | null;             // Design, Build, Test, Docs, Procurement
    inputsLinks: string | null;          // CAD links, Drive, datasheets, rules
    artifacts: string | null;            // Photo URLs, CAD files, test data links
    /** @deprecated Use teamId instead */
    subsystem: string | null;
    isOnboarding: boolean;
    isBlocked: boolean;
    blockedReason: string | null;
    dueDate: Date | null;
    order: number;
    columnId: string;
    assigneeId: string | null;           // Owner
    reviewerId: string | null;           // Reviewer
    isApproved: boolean;                 // Lead approval for Done
    teamId: string | null;
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
    reviewer: User | null;
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
