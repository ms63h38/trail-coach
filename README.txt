TRAIL COACH 2.6.0

QUALITY RELEASE
- Single self-contained runtime again: index.html no longer depends on dynamic v25 module injection.
- Snapshot export tested with actual browser download and schema validation.
- Explicit selected-week publishing; publication writes only the selected week and performs mandatory read-back verification.
- Strength workout duration is normalized so Intervals structured workout duration matches planned minutes.
- Trail Engine charts use SVG, eliminating the iOS canvas stretching/streaking defect.
- Plan tab redesigned around one weekly workflow: select week, review, adjust rhythm/constraint, publish.
- Secondary analysis/tools are collapsed by default.
- Flexible Gym A/B/C and Yoga preferences retained.
- Temporary no-trail/no-running substitution retained.
- Garmin FIT strength analytics retained.

REGRESSION QA PASSED
- JavaScript syntax check
- duplicate-ID check
- static DOM-reference audit
- mobile/desktop load without console/page errors
- no horizontal overflow at 390px and 1440px
- all five tabs smoke-tested
- production build imports actual TC_Coach_260907.json and displays all 7 workouts
- Snapshot download includes training_preferences, temporary_constraint, external_vo2_reference, strength_28d
- selected-week Intervals mock publish: 7/7 verified
- Gym A/B parsed duration: 35/35 min
- failed verification correctly stays READY
- 4-week generation with Gym A/B/C, Yoga and no-running→Rowing tested
- Trail Engine SVG charts tested on mobile

QUALITY CLEANUP
- Removed unused legacy Body Battery chart code that referenced obsolete DOM ids.
- No duplicate function declarations, TODO/FIXME, eval or debug logging in production runtime.
- Production build contains no QA/test hook.

Version: 2.6.0
Build: 2026-09-06
