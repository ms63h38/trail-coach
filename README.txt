TRAIL COACH 2026/27 v1.5.1 — Responsive layout audit

Fixat:
- Intervaller/laps: RECOVERY/WORK har nu tillräcklig kolumnbredd och kan aldrig överlappa nästa fält.
- På iPhone flyttas Load till en egen rad under intervallets data.
- Aktiviteternas namn och metadata visas i fulltext i stället för ellipsis/trunkering.
- Grid- och flexbarn har min-width:0 så innehåll inte kan pressa sidan utanför viewport.
- Text, etiketter, mål, statistik och knappar får radbrytas på små skärmar.
- Aktivitetsstatistik och pulszoner kan radbrytas i stället för att kapas.
- Goal editor går till en kolumn på iPhone.
- Plan/check-in/settings har extra fallback för smala skärmar och större iOS-text.
- Tabeller fortsätter använda lokal horisontell scroll när en tabell faktiskt behöver mer bredd.

Test:
- JavaScript syntaxkontrollerad.
- HTML-ID:n kontrollerade för dubbletter.

GitHub Pages:
Ersätt index.html och sw.js. manifest.json kan också ersättas.
