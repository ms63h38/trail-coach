TRAIL COACH 2.7.0

Production release from tested RC1.

Core fixes:
- Native manual Rowing/Ride publishing through the same verified Intervals pipeline as planned workouts.
- POST for new events, PUT for matched events, mandatory server read-back before PUBLISHED.
- Only READY/dirty items are written.
- Stable external_id for manual workouts.
- Snapshot contract validation.
- Trail Engine SVG and cross-training handling.
- Strength A/B/C structured workout support.
- Removed runtime hotfix architecture from 2.5/2.6.1.

QA before release:
- 40/40 browser/mock-Intervals regression tests passed.
- JavaScript/service-worker syntax passed.
- 270/270 unique static IDs.
- 316/316 unique function declarations.

Deployment note:
The tested 2.7 application is stored as a gzip/base64 static payload split into .tc27/index.part* and reconstructed by index.html at startup. This avoids the previous service-worker code-patching architecture; no runtime hotfix script is injected.

Version: 2.7.0
Build: 2026-09-10
