# Architecture and implementation status

## Request path

`React/Vite → Express/REST → Zod input validation → authenticated owner-scoped service → MongoDB/Mongoose → Gemini text generation`

Gemini credentials, the stored culprit ID, and the solution object stay server-side. `GET /cases/:caseId` omits culprit and solution unless the case already has a submitted answer. `POST /submit-answer` checks the user's case ownership, ready state, one-answer limit, and suspect ID before comparing with the stored culprit.

## Case generation

1. Validate bounded scenario text and allowed settings.
2. Create a `GENERATING` case.
3. Request one JSON case blueprint from the configured Gemini text model.
4. Validate the case structure, requested suspect/evidence counts, unique IDs, suspect references, and solution/suspect name consistency.
5. Save the validated case as `READY`, or record `FAILED` and a user-safe reason.

The AI-generated solution is canonical before it is shown to the player. Generated user-facing strings are rendered as React text, never injected as HTML. A durable resumable job queue, additional evidence contradiction analysis, bounded automatic retries, and resilience across restarts are follow-up hardening needed before production.

## Persistence and development preview

With `DEV_FIXTURES=true`, data lives in a process-local store and is intentionally disposable. With `DEV_FIXTURES=false`, startup requires MongoDB and configured Gemini credentials; Mongoose stores users, cases, notes, evidence, and answer state. Password hashes use bcrypt; sessions are signed, HTTP-only cookies.

## Media status

No image-generation, object-storage, or video-rendering provider is currently wired in. Image/CCTV cards are clearly fictional reconstruction stills, not generated images or surveillance video. The case prompt explicitly avoids claiming real footage. The product acceptance criteria require these integrations to be implemented and verified before the MVP is complete.
