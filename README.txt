TRAIL COACH 2026/27 v1.6.6 — Garmin / Intervals data audit

Research findings:
- Intervals Wellness model supports avgSleepingHR, sleepQuality, hrvSDNN and many additional fields.
- Garmin -> Intervals does not necessarily populate every field in the Intervals model.
- Avg Sleeping HR is a known example: model support exists but Garmin direct sync often does not populate it.
- Body Battery can be supported through custom wellness fields BodyBatteryMin / BodyBatteryMax when configured and supplied.
- Garmin Training Readiness is not assumed to be the generic Intervals readiness field.
- Direct Garmin sleep stages (REM/Deep/Light) are not treated as native Intervals wellness data.

App changes:
1. Sleep Quality
- Added to wellness model.
- Shows in Health & Recovery trends.
- Current Garmin values such as sleepQuality=2 are no longer ignored.
- It is NOT added separately to Trail Recovery because Sleep Score already represents sleep quality; avoids double-counting.

2. Sleeping HR
- avgSleepingHR aliases expanded:
  avgSleepingHR, averageSleepingHR, avg_sleep_hr, sleepingHR, sleep_hr.
- Searches both top-level wellness fields and customFields.
- Diagnostics explicitly says whether the field is absent upstream.

3. HRV SDNN
- Added and auto-detected if Intervals starts populating it.

4. Body Battery
- Reintroduced only as optional/diagnostic metrics.
- Supports top-level and customFields aliases for BodyBatteryMin/Max.
- Not used in Trail Recovery unless intentionally added later.

5. Raw wellness audit
- Scans every populated scalar field returned by Intervals for the last 28 days.
- Scans nested customFields too.
- Unknown/new fields are labelled "Nytt/okänt".
- This means future Garmin/Intervals additions will be visible even before Trail Coach explicitly supports them.

6. Athlete wellness configuration
- Tries GET /athlete/0 and displays icu_wellness_keys when the endpoint supplies them.

7. Activity customFields
- Scans completed activities for customFields.
- Useful for Garmin running dynamics or other FIT-derived custom fields configured in Intervals.

8. Coach Snapshot
- Adds data_audit with diagnostics, raw wellness fields, activity custom fields and athlete wellness keys.
- Adds sleep_quality, hrv_sdnn, weight and optional Body Battery to current state.
- Recent activities also include temperature, calories, GAP, HR recovery and customFields.

Important:
Trail Coach can only consume data that reaches Intervals or is present in activity FIT/custom fields.
Garmin metrics visible only inside Garmin Connect but not exposed through Garmin's official integration cannot be retrieved through this architecture.

GitHub Pages:
Replace index.html and sw.js. manifest.json can also be replaced.
