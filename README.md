# TimeOptima

Find the time you didn’t know you had. A private, browser-only tool for understanding a recurring weekly schedule.

## Run locally

Requires Node.js 20+ and npm.

```sh
npm install
npm run dev
npm test
npm run build
npm run lint
```

## Use it

- Add a commitment, choose its repeat days and times, and select a color.
- Select an event to edit or delete it. Use **Undo** to restore the last schedule change (up to 20 changes).
- Click an empty calendar hour or a free interval to add a commitment.
- The availability panel shows free intervals and the longest opening. Ties use weekday and start-time order.
- **Find me time** searches selected days within a requested time range. It suggests the earliest exact-duration slot in each qualifying free interval. Selecting a result opens the commitment editor; it does not book automatically.
- **Availability hours** defaults to 8 AM–8 PM and can be adjusted. Events outside those hours remain visible in the calendar.
- Mobile uses a day picker, chronological agenda, and selected-day availability. Desktop shows the full week.

This is a repeating weekly planner, not a dated calendar. Overnight commitments must be split into separate events on the two days. Times use the device’s local interpretation; no time-zone conversion is performed. Availability is based only on the commitments entered here.

## Privacy

Schedules and undo history live only in React memory. There is no account, server schedule storage, calendar connection, telemetry, or external font request. Refreshing or closing the page clears the schedule. On startup, the app removes the previous version’s `events` and `lastEvents` localStorage keys and its `hasLoaded` sessionStorage marker; old saved events are not imported. Browser storage can be blocked without breaking the app. Normal hosting still serves the application files.

## Architecture

React 18, TypeScript, Vite, Mantine and Tabler icons. No dependencies were added. Mantine provides focus-trapped dialogs, Escape dismissal and focus restoration; forms use visible labels and keyboard-operable controls. Events carry names and times as well as colors. Reduced-motion preferences disable transitions.

- `App.tsx`: in-memory schedule, undo, dialogs and page sections.
- `components/ScheduleCalendar.tsx`: desktop calendar and mobile day agenda.
- `components/AvailabilityPanel.tsx`: computed gaps and longest opening.
- `components/EventModal.tsx`: validated creation/editing with repeat days and overlap notices.
- `components/FindTimeModal.tsx`: duration/day/window search.
- `utils/scheduling.ts`: minute-based interval merging, clipping, free-time calculation, slot finding, overlap layout, validation and formatting. These pure functions do not use browser storage or dates.

Overlapping commitments are allowed. Connected overlap groups use separate calendar lanes; availability merges their occupied intervals first so shared time is counted once. Touching intervals do not produce a zero-length free gap.

## Verification

`npm test` uses Node’s test runner and the existing esbuild dependency to load TypeScript without adding a testing package. It checks nested/chained/touching overlaps, interval clipping, full/empty days, duration/day search constraints, validation, calendar lane assignment, formatting, and 100 deterministic generated schedules whose free/busy coverage must partition the search window.

Production compilation: `npm run build`. Code checks: `npm run lint`. Browser interaction and responsive visual checks should also be performed when changing the UI.
