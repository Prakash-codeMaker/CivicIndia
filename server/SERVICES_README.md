CV Service and Routing Engine (scaffolds)

This folder contains two scaffold microservices used to prototype computer vision and routing/escalation features.

Files:
- `cv-service.js` - lightweight image analysis service. Endpoint: POST /analyze (multipart 'photos' or JSON { imageUrls: [...] }). Returns detections and severity. Currently uses a simple mock detector; replace `detectObjects` with a real model or provider call.
- `routing-engine.js` - assigns reports to departments and tracks a very small SLA store. Endpoints: POST /assign, GET /sla/:reportId, POST /detect-duplicate.
- `cv-db.json`, `routing-db.json` - small persisted stores for prototypes.

Run:
node server/cv-service.js
node server/routing-engine.js

Notes:
- These are scaffolds for local testing and integration only. For production, add authentication, rate-limiting, queuing, and replace mock detectors with actual CV models or provider APIs.
