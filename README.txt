TRAIL COACH 2.6.0

QUALITY RELEASE
- Single self-contained runtime: index.html no longer depends on dynamic v25 module injection.
- Snapshot export tested with browser download and schema validation.
- Explicit selected-week publishing; only the selected week is written and mandatory server read-back is performed.
- Strength workout duration is normalized so Intervals structured workout duration matches planned minutes.
- Trail Engine uses SVG, eliminating the iOS canvas stretching/streaking defect.
- Plan redesigned around one weekly workflow: select week, review, adjust rhythm/constraint, publish.
- Secondary analysis/tools are collapsed by default.
- Flexible Gym A/B/C and Yoga preferences retained.
- Temporary no-trail/no-running substitution retained.
- Garmin FIT strength analytics retained.

REGRESSION QA PASSED
- JavaScript syntax
- service-worker syntax
- duplicate static ID check
- duplicate function declaration audit
- mobile/desktop load smoke tests
- five-tab navigation smoke test
- CoachPlan import with 7 workouts
- Snapshot contract: training_preferences, temporary_constraint, external_vo2_reference, strength_28d
- selected-week mock Intervals publishing
- Gym A/B duration normalization to 35 min
- failed verification remains READY
- flexible Gym A/B/C + Yoga schedule
- no-running to Rowing substitution
- Trail Engine SVG rendering

PRODUCTION CLEANUP
- No runtime QA hook.
- No dependency on base.html, app-2.5.css or v25-*.js.
- Service worker precaches only production assets.

Version: 2.6.0
Build: 2026-09-07
