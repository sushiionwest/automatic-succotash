# SAE Task System - How It Works

## 🎯 The Big Picture

This is a task system for an SAE club where **members do work** and **leads prepare and approve work**.

The system exists to answer two questions:
- Members: *"What can I help with right now?"*
- Leads: *"What work is ready, and what needs approval?"*

```
┌─────────────────────────────────────────────────────┐
│                    THE SYSTEM                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│   MEMBERS (90% of users)      LEADS / ADMINS (10%)  │
│   ─────────────────────       ────────────────────  │
│   See: Tasks to grab          See: Control panels   │
│   Do: Claim → Do → Submit     Do: Prepare, release, │
│   Never manage tasks          review, approve       │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 🚶 Member Flow (No Thinking Required)

Members never manage tasks. They just do work.

**Mental model:** *"Pick one task. Do what it says. Send it to a lead."*

```
1. LOGIN
   ↓
2. LAND ON TEAM PAGE (/app/team/aerodynamics-team)

   ┌────────────────────────────────────────┐
   │  Pick one task → Follow instructions   │
   │  → Send to Lead                        │
   │                                        │
   │  🟢 START HERE (Safe, approved tasks)  │
   │  ┌────────────────┐ ┌────────────────┐│
   │  │ Build Wing Rib │ │ Test Motor      ││
   │  │ What to do:    │ │ What to do:     ││
   │  │ • Step 1       │ │ • Step 1        ││
   │  │ • Step 2       │ │ • Step 2        ││
   │  │ Done looks like│ │ Done looks like ││
   │  │ ✓ Photo taken  │ │ ✓ Data logged   ││
   │  │ [CLAIM TASK]   │ │ [CLAIM TASK]    ││
   │  └────────────────┘ └────────────────┘│
   └────────────────────────────────────────┘

3. CLICK "CLAIM TASK"
   → Task is assigned to you
   → Task moves to "Your Tasks"

4. DO THE WORK
   → Follow "What to do"
   → Check against "Done looks like"

5. CLICK "SEND TO LEAD"
   → Task goes to a lead for approval
   → You're done 🎉
```

Members never see boards, columns, or drag-and-drop.

---

## 👔 Lead / Admin Flow (Clear Responsibilities)

Leads don't "manage Kanban." Leads do **four specific jobs**.

### 1️⃣ Prepare Work
*"Is this task safe and clear for members?"*

- Write or auto-fill tasks using templates
- Ensure:
  - Team is set
  - "Done looks like" is clear
- Click **Release to Members**

(Behind the scenes: task moves to Ready)

### 2️⃣ Release Work to Members
Released tasks appear automatically in **Start Here**.
Members cannot see tasks until leads release them.

### 3️⃣ Review Submitted Work
*"Did this meet the definition of done?"*

- View tasks waiting for review
- Compare work against "Done looks like"
- Approve or send back

Approve = Done
Send back = Doing

### 4️⃣ (Optional) Board View – Advanced
For leads who want it.

```
┌───────────────┬───────────────┬───────────────┬───────────────┐
│ RELEASED      │ IN PROGRESS   │ WAITING LEAD  │ DONE          │
│ (Ready)       │ (Doing)       │ (Review)      │               │
├───────────────┼───────────────┼───────────────┼───────────────┤
│ Task A        │ Task C        │ Task E        │ Task G        │
│ Task B        │ Task D        │ Task F        │ Task H        │
│ [+Create]     │               │               │               │
└───────────────┴───────────────┴───────────────┴───────────────┘
```

Kanban is an **advanced control surface**, not the default admin tool.

---

## 🔒 How the System Protects People (Guardrails)

| Situation            | What the system does                  |
| -------------------- | ------------------------------------- |
| Task isn't clear     | Cannot be released to members         |
| Task not claimed     | Members can't accidentally work on it |
| Member finishes work | One button sends it to a lead         |
| Approval needed      | Only leads can mark tasks done        |

No one needs to remember rules — the UI enforces them.

---

## 📁 Where Things Live (Mental Map)

```
/app                          → Auto-redirect / team picker
/app/team/[slug]              → MEMBER VIEW (Task Vending Machine)
/app/team/[slug]/board        → LEAD VIEW (Advanced Board)
/app/board/[id]               → Legacy / power-user board
/app/admin                    → Admin dashboards (prepare / review)
```

---

## 🧩 The Data Model (For Builders / Leads)

```
Team
 └── TeamMember
       └── role: MEMBER | LEAD

Card
 ├── title
 ├── description        → "What to do"
 ├── acceptanceCriteria → "Done looks like"
 ├── teamId             → who owns it
 ├── assigneeId         → who claimed it
 ├── columnId           → Released / In Progress / Waiting / Done
 └── isOnboarding       → shows in "Start Here"
```

---

## 💡 The Core Idea (One Sentence)

**Kanban is the backend. Members just grab tasks and submit work. Leads decide what's ready and what's done.**

That's the whole system.
