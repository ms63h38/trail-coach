TRAIL COACH 2.5.0

FLEXIBLE WEEKLY TEMPLATE
- Gym sessions/week: 0–3.
- Gym A, B and C each have a selectable weekday.
- Default: A Tuesday + B Friday.
- Gym C is an optional complementary upper-body/core/stability session.
- Yoga sessions/week: 0–3, each with selectable weekday.
- Yoga is treated as recovery/stretch/mobility rather than primary strength work.
- Preferences are stored locally on the device and exported in Coach Snapshot.
- Existing taper/recovery logic can still reduce strength volume.

TEMPORARY REPRIORITISATION
- Plan includes a visible temporary constraint card.
- Modes: Normal / avoid technical trail / pause all running.
- Avoid technical trail converts planned trail to flat/treadmill Run in the local draft.
- Pause all running converts run drafts to Rowing or Indoor Cycling.
- Primary + secondary low-impact alternatives, optional end date and Coach note.
- Rowing long replacement is conservatively capped at 60 min; bike long replacement at 90 min.
- Constraint changes only the local draft; publication to Intervals remains explicit.
- Active constraints are applied to newly generated and imported CoachPlan drafts.
- Coach Snapshot exports temporary_constraint and coach_rules.
- Low-impact alternatives are never declared safe automatically; workout text says to use only pain-free options and stop/switch if pain increases.

VO2
- Garmin VO2max remains automatic and separate.
- Settings allow an optional external VO2 reference: WHOOP / Lab / Other.
- External value is stored in localStorage only and is not hardcoded in the public repository.
- Trail Engine remains the primary Trail Coach indicator for long-term sustainable aerobic development.
- A single Garmin point change is treated as possible estimator variability, not automatically as lost fitness.
- Snapshot exports external_vo2_reference.

STRENGTH
- Gym C structured workout added.
- A/B/C support Garmin-guided strength_steps.
- Garmin FIT strength analytics from v2.4 retained: sets, reps, weight, volume and session-RPE context.
- Coach rules explicitly say not to judge strength load from HR-load alone.

BUGFIXES RETAINED
- Hidden-canvas Trail Engine chart fix.
- iPhone 2x2 KPI layout.
- Verified Intervals publishing/read-back.

RUNTIME MODULES
- app-2.5.css
- v25-core.js
- v25-strength.js
- v25-plan.js
- v25-vo2.js
- sw.js injects these modules into the existing PWA shell and uses cache trailcoach-2-v250.

Version: 2.5.0
Build: 2026-09-06