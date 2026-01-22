# Kanban App - Full-Stack Web Application Plan

> **Project Type:** WEB  
> **Primary Agent:** `frontend-specialist`  
> **Tech Stack:** Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui + NextAuth + Prisma + Vercel Postgres

---

## 📋 Overview

Build a production-ready Kanban board application (Trello-lite) with:
- GitHub OAuth authentication via NextAuth
- Per-user data isolation (users only see their own boards)
- Drag-and-drop cards between columns using @dnd-kit
- Persistent data via Vercel Postgres + Prisma ORM
- Deployed to Vercel with working environment variables

---

## ✅ Success Criteria

| Criteria | Verification |
|----------|--------------|
| New user can sign in via GitHub | Manual test: OAuth flow completes |
| User can create a board with default columns | Columns auto-created on board creation |
| User can add/edit/delete cards | CRUD operations persist to DB |
| Drag-and-drop cards persists after refresh | Check DB order values update correctly |
| Users cannot access each other's boards | Direct URL returns 404/redirect |
| App deploys on Vercel with production DB | Live URL works end-to-end |

---

## 🛠️ Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Next.js 14 (App Router) | Server Components, Server Actions, optimized for Vercel |
| Language | TypeScript | Type safety, better DX |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI development with consistent design |
| Auth | NextAuth.js (Auth.js) | GitHub OAuth, session management, Prisma adapter |
| Database | Vercel Postgres | Native Vercel integration, serverless-friendly |
| ORM | Prisma | Type-safe queries, migrations, seeding |
| Drag/Drop | @dnd-kit | Modern, accessible, React-native DnD |
| Hosting | Vercel | Zero-config deploy, env var management |

---

## 📁 File Structure

```
kanban-app/
├── .env.local                    # Local environment variables
├── .env.example                  # Template for env vars
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Optional seed script
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── page.tsx              # Landing/redirect to /app or /login
│   │   ├── login/
│   │   │   └── page.tsx          # Login page with OAuth buttons
│   │   ├── app/
│   │   │   ├── layout.tsx        # Authenticated layout with sidebar
│   │   │   ├── page.tsx          # Board list view
│   │   │   └── board/
│   │   │       └── [boardId]/
│   │   │           └── page.tsx  # Board detail with columns/cards
│   │   └── api/
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.ts  # NextAuth API route
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── auth/
│   │   │   └── SignInButton.tsx
│   │   ├── boards/
│   │   │   ├── BoardList.tsx
│   │   │   ├── BoardCard.tsx
│   │   │   └── CreateBoardDialog.tsx
│   │   ├── columns/
│   │   │   ├── Column.tsx
│   │   │   ├── ColumnHeader.tsx
│   │   │   └── CreateColumnDialog.tsx
│   │   ├── cards/
│   │   │   ├── Card.tsx
│   │   │   ├── CardModal.tsx
│   │   │   └── CreateCardButton.tsx
│   │   └── dnd/
│   │       ├── DndContext.tsx
│   │       └── SortableCard.tsx
│   ├── lib/
│   │   ├── auth.ts               # NextAuth configuration
│   │   ├── db.ts                 # Prisma client singleton
│   │   └── utils.ts              # Utility functions (cn, reorder)
│   ├── actions/
│   │   ├── boards.ts             # Board CRUD server actions
│   │   ├── columns.ts            # Column CRUD server actions
│   │   └── cards.ts              # Card CRUD + moveCard server actions
│   └── types/
│       └── index.ts              # TypeScript types/interfaces
├── components.json               # shadcn/ui config
├── tailwind.config.ts
├── next.config.js
├── package.json
└── README.md                     # Setup + deploy instructions
```

---

## 📊 Data Model (Prisma Schema)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  boards        Board[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Board {
  id        String   @id @default(cuid())
  name      String
  ownerId   String
  owner     User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  columns   Column[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([ownerId])
}

enum Priority {
  P0
  P1
  P2
  P3
}

model Column {
  id        String   @id @default(cuid())
  name      String
  order     Int
  boardId   String
  board     Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  cards     Card[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([boardId])
}

model Card {
  id          String    @id @default(cuid())
  title       String
  description String?   @db.Text
  priority    Priority  @default(P2)
  dueDate     DateTime?
  order       Int
  columnId    String
  column      Column    @relation(fields: [columnId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([columnId])
}
```

---

## 📋 Task Breakdown

### Phase 1: Foundation (P0)

#### Task 1.1: Scaffold Next.js Application
- **Agent:** `frontend-specialist`
- **Priority:** P0
- **Dependencies:** None
- **INPUT:** Empty directory
- **OUTPUT:** Next.js 14 app with TypeScript, Tailwind, ESLint
- **VERIFY:** `npm run dev` starts without errors
- **Commands:**
  ```bash
  npx -y create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
  ```

#### Task 1.2: Install shadcn/ui
- **Agent:** `frontend-specialist`
- **Priority:** P0
- **Dependencies:** Task 1.1
- **INPUT:** Next.js app
- **OUTPUT:** shadcn/ui initialized with components
- **VERIFY:** `components.json` exists, `src/components/ui/button.tsx` exists
- **Commands:**
  ```bash
  npx shadcn@latest init -d
  npx shadcn@latest add button input dialog dropdown-menu card badge toast sonner
  ```

#### Task 1.3: Install Dependencies
- **Agent:** `frontend-specialist`
- **Priority:** P0
- **Dependencies:** Task 1.1
- **INPUT:** package.json
- **OUTPUT:** All dependencies installed
- **VERIFY:** `npm ls` shows all packages
- **Commands:**
  ```bash
  npm install next-auth @auth/prisma-adapter prisma @prisma/client
  npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
  npm install zod
  ```

---

### Phase 2: Database & Auth (P0)

#### Task 2.1: Setup Prisma Schema
- **Agent:** `database-architect`
- **Priority:** P0
- **Dependencies:** Task 1.3
- **INPUT:** Prisma installed
- **OUTPUT:** `prisma/schema.prisma` with all models
- **VERIFY:** `npx prisma validate` passes
- **Commands:**
  ```bash
  npx prisma init
  # Then write schema.prisma as defined above
  npx prisma validate
  ```

#### Task 2.2: Configure Database Connection
- **Agent:** `database-architect`
- **Priority:** P0
- **Dependencies:** Task 2.1
- **INPUT:** Vercel Postgres connection string
- **OUTPUT:** `.env.local` with DATABASE_URL
- **VERIFY:** `npx prisma db push` succeeds
- **Env Vars:**
  ```
  DATABASE_URL="postgres://..."
  DIRECT_URL="postgres://..."
  ```

#### Task 2.3: Run Initial Migration
- **Agent:** `database-architect`
- **Priority:** P0
- **Dependencies:** Task 2.2
- **INPUT:** Valid schema + connection
- **OUTPUT:** Database tables created
- **VERIFY:** Tables visible in Vercel Postgres dashboard
- **Commands:**
  ```bash
  npx prisma db push
  npx prisma generate
  ```

#### Task 2.4: Configure NextAuth
- **Agent:** `security-auditor`
- **Priority:** P0
- **Dependencies:** Task 2.3
- **INPUT:** Prisma adapter, GitHub OAuth app
- **OUTPUT:** `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`
- **VERIFY:** `/api/auth/providers` returns GitHub provider
- **Env Vars:**
  ```
  NEXTAUTH_URL="http://localhost:3000"
  NEXTAUTH_SECRET="generated-secret"
  GITHUB_ID="your-github-oauth-id"
  GITHUB_SECRET="your-github-oauth-secret"
  ```

#### Task 2.5: Create Prisma Client Singleton
- **Agent:** `backend-specialist`
- **Priority:** P0
- **Dependencies:** Task 2.3
- **INPUT:** Prisma generated client
- **OUTPUT:** `src/lib/db.ts` with singleton pattern
- **VERIFY:** Import works without "multiple instances" warning

---

### Phase 3: Authentication UI (P1)

#### Task 3.1: Create Login Page
- **Agent:** `frontend-specialist`
- **Priority:** P1
- **Dependencies:** Task 2.4
- **INPUT:** NextAuth configured
- **OUTPUT:** `src/app/login/page.tsx` with GitHub sign-in button
- **VERIFY:** Clicking button redirects to GitHub OAuth

#### Task 3.2: Protect /app Routes
- **Agent:** `security-auditor`
- **Priority:** P1
- **Dependencies:** Task 3.1
- **INPUT:** NextAuth session
- **OUTPUT:** Middleware or layout-level auth check
- **VERIFY:** Unauthenticated users redirected to /login

#### Task 3.3: Create Authenticated Layout
- **Agent:** `frontend-specialist`
- **Priority:** P1
- **Dependencies:** Task 3.2
- **INPUT:** Auth protection working
- **OUTPUT:** `src/app/app/layout.tsx` with sidebar skeleton
- **VERIFY:** Layout renders with user info in header

---

### Phase 4: Board Management (P1)

#### Task 4.1: Create Board List Server Action
- **Agent:** `backend-specialist`
- **Priority:** P1
- **Dependencies:** Task 2.5
- **INPUT:** Prisma client, session
- **OUTPUT:** `src/actions/boards.ts` with `getBoards()`, `createBoard()`
- **VERIFY:** Returns only boards where ownerId === session.user.id

#### Task 4.2: Create Board List UI
- **Agent:** `frontend-specialist`
- **Priority:** P1
- **Dependencies:** Task 4.1
- **INPUT:** Board server actions
- **OUTPUT:** `src/app/app/page.tsx`, `BoardList.tsx`, `CreateBoardDialog.tsx`
- **VERIFY:** New board appears in list after creation

#### Task 4.3: Auto-Create Default Columns
- **Agent:** `backend-specialist`
- **Priority:** P1
- **Dependencies:** Task 4.1
- **INPUT:** `createBoard` action
- **OUTPUT:** Board creation also creates 4 default columns
- **VERIFY:** New board has "To Do", "In Progress", "Review", "Done" columns
- **Default Columns:**
  ```typescript
  const DEFAULT_COLUMNS = [
    { name: "To Do", order: 0 },
    { name: "In Progress", order: 1 },
    { name: "Review", order: 2 },
    { name: "Done", order: 3 },
  ];
  ```

---

### Phase 5: Board Detail View (P1)

#### Task 5.1: Create Board Page
- **Agent:** `frontend-specialist`
- **Priority:** P1
- **Dependencies:** Task 4.3
- **INPUT:** Board with columns
- **OUTPUT:** `src/app/app/board/[boardId]/page.tsx`
- **VERIFY:** Page renders columns in correct order

#### Task 5.2: Authorization Check
- **Agent:** `security-auditor`
- **Priority:** P1
- **Dependencies:** Task 5.1
- **INPUT:** Board page with boardId param
- **OUTPUT:** Server-side check: board.ownerId === session.user.id
- **VERIFY:** Accessing another user's board returns 404

#### Task 5.3: Column Component
- **Agent:** `frontend-specialist`
- **Priority:** P1
- **Dependencies:** Task 5.1
- **INPUT:** Column data with cards
- **OUTPUT:** `Column.tsx`, `ColumnHeader.tsx` with rename/delete
- **VERIFY:** Column displays cards, header shows dropdown menu

---

### Phase 6: Card CRUD (P2)

#### Task 6.1: Card Server Actions
- **Agent:** `backend-specialist`
- **Priority:** P2
- **Dependencies:** Task 5.2
- **INPUT:** Prisma client, column/board context
- **OUTPUT:** `src/actions/cards.ts` with create/update/delete
- **VERIFY:** Cards persist to DB with correct order values

#### Task 6.2: Card Component
- **Agent:** `frontend-specialist`
- **Priority:** P2
- **Dependencies:** Task 6.1
- **INPUT:** Card data
- **OUTPUT:** `Card.tsx` with title, priority badge, due date
- **VERIFY:** Card renders all fields correctly

#### Task 6.3: Card Modal
- **Agent:** `frontend-specialist`
- **Priority:** P2
- **Dependencies:** Task 6.2
- **INPUT:** Card component
- **OUTPUT:** `CardModal.tsx` for create/edit with form validation
- **VERIFY:** Modal opens, form submits, card updates

---

### Phase 7: Drag & Drop (P2)

#### Task 7.1: Setup DnD Context
- **Agent:** `frontend-specialist`
- **Priority:** P2
- **Dependencies:** Task 6.2
- **INPUT:** @dnd-kit installed
- **OUTPUT:** `DndContext.tsx` wrapping board
- **VERIFY:** Cards are draggable (visual feedback)

#### Task 7.2: Implement moveCard Server Action
- **Agent:** `backend-specialist`
- **Priority:** P2
- **Dependencies:** Task 7.1
- **INPUT:** cardId, targetColumnId, targetIndex
- **OUTPUT:** `moveCard()` action with reorder logic
- **VERIFY:** Order values update correctly in DB
- **Reorder Logic:**
  ```typescript
  // Pure function for reordering
  function reorderCards(
    cards: { id: string; order: number }[],
    cardId: string,
    newIndex: number
  ): { id: string; order: number }[] {
    const card = cards.find(c => c.id === cardId);
    if (!card) return cards;
    
    const filtered = cards.filter(c => c.id !== cardId);
    filtered.splice(newIndex, 0, card);
    
    return filtered.map((c, i) => ({ ...c, order: i }));
  }
  ```

#### Task 7.3: Connect DnD to Server Action
- **Agent:** `frontend-specialist`
- **Priority:** P2
- **Dependencies:** Task 7.2
- **INPUT:** moveCard action, DnD context
- **OUTPUT:** onDragEnd handler calls moveCard
- **VERIFY:** Drag card, refresh page, card stays in new position

#### Task 7.4: Optimistic UI
- **Agent:** `frontend-specialist`
- **Priority:** P2
- **Dependencies:** Task 7.3
- **INPUT:** Working drag/drop
- **OUTPUT:** Optimistic update with rollback on error
- **VERIFY:** UI updates instantly, no flicker

---

### Phase 8: Polish (P3)

#### Task 8.1: Loading States
- **Agent:** `frontend-specialist`
- **Priority:** P3
- **Dependencies:** Task 7.4
- **INPUT:** All pages
- **OUTPUT:** Skeleton loaders for board list, columns, cards
- **VERIFY:** Skeletons show during data fetch

#### Task 8.2: Empty States
- **Agent:** `frontend-specialist`
- **Priority:** P3
- **Dependencies:** Task 8.1
- **INPUT:** Board page
- **OUTPUT:** "Create your first card" message when column empty
- **VERIFY:** Empty column shows helpful message

#### Task 8.3: Toast Notifications
- **Agent:** `frontend-specialist`
- **Priority:** P3
- **Dependencies:** Task 8.2
- **INPUT:** All mutations
- **OUTPUT:** Success/error toasts using sonner
- **VERIFY:** Toasts appear on create/update/delete

#### Task 8.4: Root Page Redirect
- **Agent:** `frontend-specialist`
- **Priority:** P3
- **Dependencies:** Task 3.2
- **INPUT:** Root page
- **OUTPUT:** Redirect to /app if authenticated, /login if not
- **VERIFY:** Correct redirect based on auth state

---

### Phase 9: Testing & Documentation (P3)

#### Task 9.1: Unit Test for Reorder Logic
- **Agent:** `test-engineer`
- **Priority:** P3
- **Dependencies:** Task 7.2
- **INPUT:** `reorderCards` function
- **OUTPUT:** `__tests__/reorder.test.ts`
- **VERIFY:** `npm test` passes
- **Test Cases:**
  - Move card to same position (no change)
  - Move card forward in list
  - Move card backward in list
  - Move card to empty list

#### Task 9.2: Write README
- **Agent:** `documentation-writer`
- **Priority:** P3
- **Dependencies:** Task 8.4
- **INPUT:** Complete app
- **OUTPUT:** `README.md` with setup + deploy instructions
- **VERIFY:** Following README allows fresh setup

#### Task 9.3: Create .env.example
- **Agent:** `documentation-writer`
- **Priority:** P3
- **Dependencies:** Task 9.2
- **INPUT:** All env vars used
- **OUTPUT:** `.env.example` with placeholders
- **VERIFY:** All required vars documented

---

### Phase 10: Deployment (P3)

#### Task 10.1: Vercel Configuration
- **Agent:** `devops-engineer`
- **Priority:** P3
- **Dependencies:** Task 9.3
- **INPUT:** Working local app
- **OUTPUT:** Vercel project with env vars configured
- **VERIFY:** Build succeeds on Vercel

#### Task 10.2: Production Database
- **Agent:** `devops-engineer`
- **Priority:** P3
- **Dependencies:** Task 10.1
- **INPUT:** Vercel Postgres setup
- **OUTPUT:** Production DB with tables created
- **VERIFY:** `npx prisma db push` against production

#### Task 10.3: Final Deploy
- **Agent:** `devops-engineer`
- **Priority:** P3
- **Dependencies:** Task 10.2
- **INPUT:** All env vars set
- **OUTPUT:** Live URL
- **VERIFY:** Full user flow works on production

---

## 🔐 Environment Variables

### Local Development (.env.local)

```bash
# Database (Vercel Postgres)
DATABASE_URL="postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
DIRECT_URL="postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="openssl rand -base64 32"

# GitHub OAuth
GITHUB_ID="your-github-oauth-app-id"
GITHUB_SECRET="your-github-oauth-app-secret"
```

### Vercel Production

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Auto-populated by Vercel Postgres |
| `DIRECT_URL` | Auto-populated by Vercel Postgres |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `GITHUB_ID` | GitHub OAuth App ID |
| `GITHUB_SECRET` | GitHub OAuth App Secret |

---

## Phase X: Verification Checklist

### Automated Checks
- [ ] `npm run lint` - No linting errors
- [ ] `npx tsc --noEmit` - No TypeScript errors
- [ ] `npm run build` - Production build succeeds
- [ ] `npm test` - Unit tests pass (reorder logic)

### Manual Verification
- [ ] Sign in with GitHub works
- [ ] Create new board → 4 default columns appear
- [ ] Add card to column → Card persists after refresh
- [ ] Drag card to different column → Position persists
- [ ] Edit card modal → Changes save correctly
- [ ] Delete card → Card removed
- [ ] Direct URL to another user's board → 404/redirect
- [ ] Sign out → Redirected to login

### Security Checks
- [ ] Server actions verify board ownership
- [ ] No sensitive data in client components
- [ ] Env vars not exposed to client

### Deployment Checks
- [ ] Vercel build succeeds
- [ ] Production database has tables
- [ ] OAuth callback URLs updated for production
- [ ] All env vars set in Vercel dashboard

---

## 🚀 Next Steps

After plan approval:
1. Run `/create` to begin implementation
2. Follow tasks in order (respect dependencies)
3. Complete Phase X verification before marking done
