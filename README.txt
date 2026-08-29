TRAIL COACH 2026/27 v1.5 — Goal & Phase Engine

1. Garmin post-workout feedback / Activity API
- Trail Coach läser icu_rpe (RPE 1–10), feel (1 bäst → 5 sämst), compliance, session_rpe,
  decoupling, icu_intensity, variability index, average stride, efficiency factor,
  HR/pace/power load, source och device_name när Intervals levererar dem.
- När en aktivitet öppnas gör appen ett on-demand-anrop:
  GET /api/v1/activity/{id}?intervals=true
  och visar även Intervals-intervaller/laps.
- Appen försöker även läsa /activity/{id}/messages; om endpointen saknas påverkas inget.
- Garmin RPE/Feel som anges på klockan före aktivitetens FIT-fil sparas kan följa med till Intervals.
  Ändringar som görs senare i Garmin Connect är inte garanterade att synkas tillbaka.

2. Goal & Phase Engine
- Race/mål med datum, A/B/C-prioritet, distans, höjdmeter, teknisk nivå och valfri måltid.
- Ett preliminärt Idre Fjällmaraton halv 2027-08-28 läggs in första gången; datumet är redigerbart.
- Automatisk fas: Base → Build → Specific → Peak → Taper → Race.
- Recovery kan tillfälligt överstyra kalenderfasen vid låg Trail Recovery.
- Fas kan fortfarande överstyras manuellt.
- Auto träningsläge väljer längdskidor Dec–Mar och trail övrig tid.

3. Race Readiness
Heuristisk profil för:
- träningskontinuitet
- time-on-feet/långpass
- vertikal kapacitet
- styrkekontinuitet
- teknisk trail-exponering
- intensitetsbalans
- återhämtningsrobusthet

4. Daglig check-in
- energi
- ben/kropp
- motivation
- stress
- smärta/obehag
- sjukdomskänsla
- kommentar
Check-in sparas lokalt på enheten och vägs in i Trail Recovery.

5. Coach Snapshot v3
Innehåller mål, fas, Race Readiness, check-ins och Garmin/Intervals feedbackfält.

GitHub Pages:
Ersätt index.html, manifest.json och sw.js. Ikonerna kan lämnas oförändrade.
