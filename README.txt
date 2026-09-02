TRAIL COACH 2026/27 v1.6.4 — Intervals week overview

Nytt överst i Plan:
- Läs-only liveöversikt från Intervals för innevarande vecka + nästa vecka.
- Hämtas automatiskt vid normal datauppdatering.
- Separat knapp "Uppdatera schema".
- Genomförda aktiviteter kommer från /activities.
- Planerade pass kommer från /events.
- Paired activity använder paired_event_id när Intervals har parat passet.
- Om samma sport finns samma dag men paired_event_id saknas visas "Utfört · ej parat"
  och det planerade passet ligger kvar separat. Appen gissar inte att de är parade.
- Parat pass visas som ett genomfört kort med planerad information under.
- Gamla planerade pass utan aktivitet visas "Planerat · ej utfört".

Kommande 7 dagar:
- antal planerade pass
- planerad tid
- planerad training load
- denna veckas genomförda pass

Layout:
- Desktop: 7-dagars veckor i kolumner.
- iPhone: varje vecka blir en kompakt vertikal daglista.
- Idag markeras blått.
- Dagar inom kommande 7 dagar får diskret grön ton.

Den lokala 4-veckorsplanen är oförändrad och ligger under liveöversikten.
Det gör att "vad som faktiskt ligger i Intervals" inte blandas ihop med den lokala roadmapen.

GitHub Pages:
Ersätt index.html och sw.js. manifest.json kan också ersättas.
