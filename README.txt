TRAIL COACH 2026/27 v1.6.5

1. Roadmap
- En tom roadmap är nu uttryckligen "not_created", inte en motsägelse.
- Snapshot har roadmap_status + local_plan.
- roadmap_4_weeks fylls endast när minst fyra lokala veckor faktiskt finns.
- planning_model säger "optional 4-week roadmap".

2. Compliance / schema
- Compliance använder scheduleEvents från Intervals, inte den gamla calendarEvents-listan.
- Kalenderhämtningen går 28 dagar bakåt + till slutet av nästa vecka.
- Snapshot skiljer på:
  planned_in_schedule_overview
  planned_due_last_28d
  intervals_paired_count
  trailcoach_candidate_match_count
  estimated_plan_coverage_percent
- Intervals compliance med 0 på ett oparat pass tas inte med i genomsnitt.

3. Pairing
- paired_event_id är enda officiella Intervals-parningen.
- Trail Coach kan märka "Trolig match NN% · ej Intervals-parad" baserat på:
  samma datum + sport + namnlikhet + load/tid.
- Heuristiken är bara diagnostik och ändrar aldrig paired_event_id.

4–6. Garmin Execution Score
- Gammal v1-cache är övergiven; v2-cache används.
- session.xxx185 behandlas som direkt heltalsprocent 0–100.
- Ogiltigt FIT-värde 255 skalas inte längre till 2.55%.
- Fraktionella värden som 2.55 avvisas.
- Genomsnitt beräknas bara på validerade värden.
- 94% och 81% behålls; falska 2.55%-värden försvinner efter omladdning.

7. Body Battery
- Borttagen från aktiv UI, Recovery, trender, field inventory och Coach Snapshot.
- Trail Coach använder endast signaler som Intervals faktiskt levererar.

8. Klickbart planerat pass
- Klicka på ett planerat kort i Intervals-veckoöversikten.
- Trail Coach hämtar GET /athlete/0/events/{eventId}.
- Modal visar planerad tid/load, workout_doc steps, intervallmål och description/workout syntax.
- Även parade aktivitetskort får "Visa pass".

9. Kort snapshotfil
- TC_Snap_yymmdd.json
- Exempel: TC_Snap_260902.json

GitHub Pages:
Ersätt index.html och sw.js. manifest.json kan också ersättas.
