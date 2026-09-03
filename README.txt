TRAIL COACH 2.1.0 — UI refresh + Today plan/execution

VERSIONING
- v2.0.0 can remain tagged as the stable reference release.
- v2.1.0 is a feature/UI release.

UI / UX
- Shadcn/Tailwind-inspired design language implemented with native CSS.
- No React/Tailwind runtime dependency added.
- Dark neutral background, compact cards, thin borders, tighter typography,
  status pills and stronger hierarchy.
- This preserves the existing single-file/PWA architecture and offline behavior.

TODAY
The former "Next workout" card is now context aware.

If there is a planned workout today:
- shows the plan
- official paired activity is detected through paired_event_id
- if Intervals has not paired it, Trail Coach may show a conservative
  "Utfört · match NN%" candidate based on existing date/sport/name/load/time logic
- shows plan vs actual side-by-side (stacked on iPhone)
- shows actual duration, distance, load, Garmin Execution Score, RPE, Feel
  and Intervals compliance only when valid
- "Visa plan" opens the planned Intervals workout detail
- "Visa utförande" opens the full activity detail

If today's planned workout is completed:
- status changes to GENOMFÖRT
- the card does not jump directly to tomorrow and hide today's result
- next planned workout is shown as a small follow-up line

If there are multiple workouts today:
- an unfinished one is prioritized
- if all are completed, the most substantial completed workout is shown
- a note indicates additional workouts and completion count

If there is no planned workout but an activity was completed:
- shows GENOMFÖRT · EJ PLANERAT
- execution detail remains available

If there is no workout today:
- falls back to the next future planned workout.

TECH
- Existing verified Intervals publish engine from v2.0 is unchanged.
- Existing Coach, Recovery, plan/calendar, Garmin FIT Execution Score and data audit remain.
- Version in header/settings is 2.1.0, build 2026-09-03.

GITHUB PAGES
Replace:
- index.html
- sw.js
- manifest.json recommended
Icons unchanged.
