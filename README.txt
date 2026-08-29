TRAIL COACH 2026/27 v1.4.1 — Auto Sync

Automatisk uppdatering:
- När appen öppnas och en API-nyckel är sparad hämtas färska data automatiskt.
- När appen återgår från bakgrunden hämtas nya data om senaste hämtningen är äldre än 5 minuter.
- När webben/PWA:n är öppen kontrolleras data periodiskt var 15:e minut.
- Återanslutning till nätet triggar också en kontroll.
- 'Senast uppdaterad' visas i apphuvudet.
- Inställningar har en toggle för automatisk uppdatering.

Viktigt på iPhone:
En PWA kan inte tillförlitligt fortsätta hämta Intervals-data när appen är helt stängd eller suspenderad.
Trail Coach uppdaterar därför så snart den öppnas/återgår till förgrunden.

GitHub Pages:
Ersätt index.html, manifest.json och sw.js.
