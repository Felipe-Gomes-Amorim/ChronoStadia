# ChronoStadia

> A self-contained productivity desktop built to look and feel like Windows 98.

![Electron](https://img.shields.io/badge/Electron-42-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Windows-0078D4?logo=windows&logoColor=white)

---

## The Problem

Productivity tools are fragmented. A task manager here, a calendar there, sticky notes somewhere else, expense spreadsheets in another tab. Each app has its own account, its own sync, its own notification system. The mental overhead of switching between them adds up — and none of them feel like they belong together.

## The Solution

ChronoStadia is a single desktop app that behaves like a tiny operating system. You get a real desktop: drag program icons around, open multiple resizable windows, keep always-on widgets pinned to the corners. Everything — tasks, notes, folders, calendar, timer, expenses — lives in one place, offline, with no accounts required.

The Win98 aesthetic is a deliberate choice, not just nostalgia. Its visual language is immediately understood by anyone who touched a computer in the last 30 years: icons you double-click, windows with title bars you drag, a Start menu, a taskbar. It removes all ambiguity about how the UI works, which frees up attention for the actual work.

---

## What It Does

### Desktop

Drag-and-drop icons on a 96×96 grid. Right-click anywhere for a creation menu. Each icon type opens a different kind of window.

### Tasks

Create task icons with a description textarea and a checklist. Progress bar fills as items are checked off. Icons use pixel art from a built-in picker or emoji.

### Notes

Resizable note windows with a plain textarea. Font size adjustable per window (13 → 20 px). Content saved automatically.

### Folders / Kanban

Each folder icon opens a Kanban board with To Do / In Progress / Done columns. Drag task cards between columns. Columns are per-folder; the task itself stays on the desktop.

### Calendar

Monthly grid. Click a day to attach tasks (one-off) or right-click a weekday header to set weekly recurring tasks. Expenses work the same way — daily, weekly, or monthly recurring. Handles edge cases like scheduling a monthly recurring expense on day 31 for months that don't have it.

### Pomodoro Timer

Always-visible widget in the top-right corner. Set a duration, start the countdown, attach any task icon. The attached task's checklist appears directly in the timer for quick checking without opening a separate window.

### Upcoming Days

Widget showing today, tomorrow, and the day after — all scheduled tasks resolved from both one-off and recurring rules.

### Expense Tracker

Each expense is its own icon. A spending widget shows totals broken down by day, week, and month across all expenses.

### My Computer

A Windows Explorer–style list of every icon on the desktop. Searchable. Right-click items for the same context menu as the desktop (open, pin, properties, delete, reset position).

### Screen Saver

A DVD-style bouncing logo activated from the Start menu. Dismissed by any click.

---

## Architecture

```text
Electron 42
└─ BrowserWindow
   ├─ preload  →  contextBridge exposes window.api (fullscreen toggle)
   └─ renderer  →  React 19 + Vite 7
        ├─ App.tsx              all global state, window routing, event handlers
        ├─ Desktop.tsx          icon grid, icon context menus
        ├─ WindowFrame.tsx      draggable + resizable shell (useDraggable hook)
        ├─ Taskbar.tsx          open-window buttons + clock
        ├─ StartMenu.tsx        pinned programs + system area
        └─ components/          one file per feature window or widget
```

**Storage:** `localStorage` only. No backend, no network calls. All keys are versioned (`chronostadia.icons.v1`, etc.) with migration logic that recovers missing `builtin` fields from `INITIAL_ICONS` on load.

---

## Key Design Decisions

**All state in `App.tsx`.** `openWindows`, `icons`, calendar data, expense data — everything flows down as props. No global store. The app is small enough that prop-drilling is simpler and more traceable than introducing a context or a store.

**Widgets are siblings of Desktop, not children.** `TimerWidget`, `UpcomingWidget`, and `SpendingWidget` sit alongside `<Desktop>` inside the OS shell div. Right-click events from widgets bubble to the shell — not to `Desktop`. The empty-desktop creation menu is attached to the `os-shell`'s `onContextMenu` handler so right-clicking on any surface (widget or desktop) shows it, while icon right-clicks stop propagation.

**Icon grid collision resolution.** `resolveCollisions()` processes icons in array order (lower index = priority) and assigns each one the first free cell by walking down the column and then to the right. `findFreeCell()` is called on creation so new icons always land in the first visible, unoccupied slot — no off-screen placement.

**Drag bounds enforced at the hook level.** `useDraggable` accepts a `bounds` option. `DesktopIcon` computes `maxX` and `maxY` from the live window dimensions on each render and passes them in. A `ref` inside the hook holds the current bounds so the `mousemove` handler always reads the latest value without needing to re-subscribe.

**Widget layout is height-budget math.** At render time, `App.tsx` sums the estimated heights of all visible right-column widgets (Timer, Upcoming, Note, Spending). If the total exceeds the available vertical space, Timer and Upcoming shift left by `264px` (the width of the right column + gap + margin) instead of stacking over each other.

**`position: fixed` for context menus.** Context menus use `position: fixed` so viewport coordinates work correctly regardless of any ancestor's `overflow: hidden`, which the desktop div uses to clip icons at the taskbar boundary.

---

## Tech Stack

| Layer | Choice |
| --- | --- |
| Runtime | Electron 42 |
| UI framework | React 19 |
| Language | TypeScript 6 |
| Bundler | electron-vite (Vite 7) |
| Styles | 98.css + custom CSS |
| Storage | localStorage |
| Packaging | electron-builder (NSIS + portable) |

---

## Running Locally

```bash
npm install
npm run dev          # Electron + hot-reload renderer
npm run typecheck    # TypeScript check (no emit)
npm run build:win    # Windows installer (.exe) → release/
```

> If `ELECTRON_RUN_AS_NODE` is set in your shell environment, unset it before running `npm run dev`. When set, Electron skips the app bootstrap and the process exits immediately with `app undefined`.

---

## Credits

Pixel art icons by [Justin Arnold](https://zeromatrix.itch.io/rpgiab-icons) — [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

Win98 CSS by [jdan/98.css](https://github.com/jdan/98.css) — MIT
