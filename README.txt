TRAIL COACH 2026/27 v1.6.3

Intervals pairing fix
- Root cause addressed: previous versions posted workout description/type/name but not explicit moving_time or icu_training_load.
- Intervals auto-pairing depends on planned/completed workout similarity; large load differences can leave two calendar cards.
- v1.6.3 sends explicit moving_time and a dynamically estimated icu_training_load.
- Run/ski planned load is calibrated from the median recent HR-load/minute over 42 days, adjusted for easy/long/recovery/quality.
- Running in trail mode is posted as TrailRun instead of generic Run.
- HR-based run/ski events set target=HR.
- Existing Trail Coach events on the same date/name are UPDATED via PUT instead of silently skipped, so already-published future workouts can be corrected.
- Plan view shows estimated pairing load as “Load ~N”.
- The documented API does not expose a reliable force-pair operation. For an already completed old workout that remains unpaired, pair manually in Intervals by drag/drop.

v1.6.2 carry-forward
- Garmin Execution Score normalized (83 or 8300 -> 83%).
- Up to 12 recent relevant FIT files are hydrated automatically on refresh and cached locally.
- Intervals compliance=0 is ignored when paired_event_id is null.
- Trends use Garmin Execution Score as the primary execution metric.

Goals
- One-time v1.6.3 seed/migration adds the shared race baseline if missing:
  Idre Fjällmaraton half 18 km / 500 hm / A / 3:00 / 2027-08-28
  Hamra trail 12 km / 300 hm / C / 2027-07-31
  Vemdalen winter classics 11 km / C / 2027-02-20 / XC skiing
- Existing user edits are preserved; missing fields are filled only once.

GitHub Pages
- Replace index.html and sw.js. Replace manifest.json as well.
