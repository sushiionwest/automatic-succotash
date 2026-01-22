# Kanban App

A production-ready Kanban board application built with Next.js 14, featuring GitHub OAuth authentication, drag-and-drop functionality, and Vercel Postgres database.

## Features

- 🔐 **GitHub OAuth Authentication** via NextAuth.js
- 📋 **Kanban Boards** with columns and cards
- 🎯 **Drag & Drop** cards between columns using @dnd-kit
- 🔒 **Per-user Data Isolation** - users only see their own boards
- 💾 **Persistent Storage** with Vercel Postgres + Prisma
- 🎨 **Modern UI** with Tailwind CSS + shadcn/ui
- 🚀 **Optimized for Vercel** deployment

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth:** NextAuth.js v5 (Auth.js) with GitHub OAuth
- **Database:** Vercel Postgres
- **ORM:** Prisma
- **Drag/Drop:** @dnd-kit
- **Hosting:** Vercel

## Local Development Setup

### Prerequisites

- Node.js 18+
- npm
- PostgreSQL database (local or cloud)
- GitHub OAuth App

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd kanban-app
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kanban"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="generate-with: openssl rand -base64 32"

# GitHub OAuth (https://github.com/settings/developers)
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
```

### 3. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name:** Kanban App (Local)
   - **Homepage URL:** http://localhost:3000
   - **Authorization callback URL:** http://localhost:3000/api/auth/callback/github
4. Copy Client ID and Client Secret to your `.env.local`

### 4. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Vercel Deployment

### 1. Create Vercel Project

```bash
npx vercel
```

### 2. Set Up Vercel Postgres

1. Go to your Vercel project dashboard
2. Navigate to "Storage" → "Create Database" → "Postgres"
3. Connect the database to your project
4. The `DATABASE_URL` will be auto-populated

### 3. Create Production GitHub OAuth App

1. Create a new OAuth App at [GitHub Developer Settings](https://github.com/settings/developers)
2. Set callback URL to: `https://your-app.vercel.app/api/auth/callback/github`

### 4. Set Environment Variables in Vercel

In your Vercel project settings, add:

| Variable | Value |
|----------|-------|
| `AUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `AUTH_GITHUB_ID` | Your production GitHub OAuth App ID |
| `AUTH_GITHUB_SECRET` | Your production GitHub OAuth App Secret |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

### 5. Deploy

```bash
npx vercel --prod
```

### 6. Initialize Production Database

After first deploy, run migrations:

```bash
npx prisma db push
```

## Project Structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/  # NextAuth API route
│   ├── app/                      # Authenticated routes
│   │   ├── board/[boardId]/     # Board detail page
│   │   └── page.tsx             # Board list
│   ├── login/                   # Login page
│   └── layout.tsx               # Root layout
├── actions/                     # Server actions
│   ├── boards.ts               # Board CRUD
│   ├── columns.ts              # Column CRUD
│   └── cards.ts                # Card CRUD + moveCard
├── components/
│   ├── boards/                 # Board components
│   ├── kanban/                 # Kanban board components
│   ├── layout/                 # Layout components
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── auth.ts                 # NextAuth configuration
│   ├── db.ts                   # Prisma client
│   └── utils.ts                # Utility functions
└── types/                      # TypeScript types
```

## License

MIT
