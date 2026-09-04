TRAIL COACH 2.4.0

BUGFIX
- Trail Engine chart on Trends no longer renders while its tab is display:none.
- Hidden canvas width=0 was the cause of the blurred/streaked iPhone graph.
- Trends canvases are redrawn after the tab becomes visible.

WEEKLY PLAN
- Normal target: 2 strength sessions/week.
- Friday is fixed as Gym B.
- Gym A is flexible Monday–Wednesday; Auto defaults to Tuesday.
- New Plan setting lets the flexible day be selected.
- Yoga target reduced from 3/week to 1–2/week.
- Normal default: Monday + Saturday.
- Taper/recovery: 1 yoga + 1 Friday strength session.
- Coach prompt now explicitly preserves these rules.

STRENGTH ANALYTICS
- Intervals HR/Training Load remains visible as aerobic/internal load.
- Trail Coach now also uses external strength load.
- Reads Intervals kg_lifted.
- Downloads Garmin original FIT from Intervals for strength activities.
- Decodes FIT Set message #225:
  duration field 0 /1000
  repetitions field 3
  weight field 4 /16 kg
  set_type field 5
  exercise category field 7
  category_subtype field 8
  message_index field 10
  wkt_step_index field 11
- Shows active sets, repetitions, weight, per-set volume and total external volume.
- Includes common Garmin exercise-category labels and detailed mappings for common bench press/deadlift/leg curl/lunge variants.
- Snapshot export hydrates recent strength FIT files before creating TC_Snap.
- Snapshot includes strength_28d and per-activity strength_fit.
- Coach instructions explicitly say not to assess strength load using HR alone.

LOAD MODEL
No fake combined "TSS" is created for strength.
Trail Coach keeps these separate:
1. Intervals Load / HR load
2. external volume (kg_lifted = reps × weight)
3. sets and repetitions
4. session-RPE load (duration × RPE) when RPE exists
This avoids corrupting aerobic CTL while giving strength work proper influence in Coach Review.

Version 2.4.0
Build 2026-09-04
