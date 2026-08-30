TRAIL COACH 2026/27 v1.6.1

Korrigeringar före fortsatt coachning:

1. Wellness-färskhet
- Trail Recovery använder senaste wellnessdagen som ankardatum.
- Signal från samma dag: 100% vikt.
- 1 dag äldre: 35% vikt.
- 2 dagar äldre: 10% vikt.
- >2 dagar äldre: ignoreras i Trail Recovery.
- Detta gäller HRV, vilopuls, sömn, Sleep Score, readiness, Body Battery och stress.
- Subjektiv check-in för idag vägs som tidigare fullt.
- Recovery-rutan visar antal färska + äldre signaler.
- Varje wellnesskort visar datum/färskhet; äldre kort markeras diskret gult.
- Coach Snapshot current_state innehåller metric_dates med date, age_days och freshness.

2. Stabilt A-lopp
- Om lokal goal storage är tom återställs standardmålet:
  Idre Fjällmaraton · halv, 2027-08-28, prioritet A.
- primaryGoal() har samma fallback.
- Snapshot exporterar aldrig goals: [] bara för att enheten saknar lokal lagring.
- Om sista målet tas bort återställs standardmålet.
- Detta löser att iPhone/webb kan ha separata localStorage-databaser för huvudmålet.

Obs:
- Egna extra B/C-lopp lagras fortfarande lokalt per webbläsare/enhet.
- Huvudmålet är däremot stabilt genom appens inbyggda fallback.

GitHub Pages:
Ersätt index.html och sw.js. manifest.json kan också ersättas.
