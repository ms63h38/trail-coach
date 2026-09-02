TRAIL COACH 2.0.0 — UX + verified Intervals publishing

WHY 2.0
The v1 flow mixed local planning, Intervals calendar state and Coach Review actions.
v2 separates them:
- Intervals = published source of truth
- Local plan = draft/change set
- CoachPlan = one source of local changes
- Publish = explicit action followed by server read-back verification

CRITICAL PUBLISH FIX
1. No bulk-upsert for normal plan publishing.
2. Existing event:
   PUT /api/v1/athlete/0/events/{eventId}
3. New event:
   POST /api/v1/athlete/0/events
4. Existing event matching:
   - event_id
   - exact external_id
   - exact date + name
   - single Trail Coach event with same date + sport
   - conservative name similarity
5. New stable external IDs use tc2-... and do not contain the app version.
6. After every publish:
   GET /events for the same date range
   and verify date, sport, name and duration.
7. A workout is marked PUBLISHED only if read-back verification passes.
8. UI shows every created/updated/failed item and any Garmin push_errors.
9. Schedule view is refreshed immediately after a successful write.

UX
PLAN
- New top command center shows one next action.
- "Publicera aktiv vecka" is the primary action.
- "Skapa 4-veckorsutkast" explicitly creates a LOCAL draft only.
- Advanced planning tools are collapsed by default.
- Imported CoachPlan appears as a draft, not as if it were already in Intervals.
- "Skicka nästa vecka" wording is removed.

COACH
- Three visible steps:
  1 Export snapshot
  2 Import CoachPlan
  3 Review & publish
- Button opens Plan when CoachPlan is ready.

TODAY
- New "Nästa pass" card from the Intervals calendar.

SETTINGS
- Version and build date are visible.
- Current release: 2.0.0, build 2026-09-02.

GITHUB PAGES
Replace:
- index.html
- sw.js
- manifest.json recommended
Icons can remain unchanged.
