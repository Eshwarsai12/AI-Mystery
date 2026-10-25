# Casefile API

Base path: `/api/v1`; JSON bodies and responses. Authentication is an HTTP-only, `SameSite=Lax` cookie named `casefile_session`; browser requests include credentials. Set `CLIENT_ORIGIN` to the exact frontend origin.

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | No | Create account; `{ name, email, password }` |
| POST | `/auth/login` | No | Start session; `{ email, password }` |
| POST | `/auth/logout` | No | Clear session cookie |
| GET | `/auth/me` | Yes | Current user |
| POST | `/cases` | Yes | Validate premise and enqueue case generation; `{ scenario, difficulty, genre, suspectCount, evidenceCount }` |
| GET | `/cases` | Yes | List owned cases |
| GET | `/cases/:caseId` | Yes | Read an owned case; private solution fields are withheld until submission |
| GET | `/cases/:caseId/status` | Yes | Poll generation status and stage |
| POST | `/cases/:caseId/retry-generation` | Yes | Retry generation of an owned failed case |
| DELETE | `/cases/:caseId` | Yes | Delete an owned case |
| GET | `/cases/:caseId/evidence` | Yes | List ready-case exhibits |
| GET | `/cases/:caseId/evidence/:evidenceId` | Yes | Read one exhibit |
| POST | `/cases/:caseId/evidence/:evidenceId/open` | Yes | Confirm an exhibit belongs to the case |
| GET | `/cases/:caseId/progress` | Yes | Retrieve saved notes and answer progress |
| PUT | `/cases/:caseId/notes` | Yes | Save `{ notes }` (maximum 5,000 characters) |
| POST | `/cases/:caseId/submit-answer` | Yes | Submit `{ suspectId }`; one submission per case |
| GET | `/cases/:caseId/result` | Yes | Retrieve solution after an answer exists |

Create returns `202` with a case ID and status URL. Poll status until `READY` or `FAILED`. Answer submission returns `{ submitted, correct, score, resultUrl }`; the culprit ID is never returned. The result endpoint is access-controlled and unavailable before submission. Case listing, reads, progress, notes, deletion, and answer submission all enforce ownership server-side.

Errors use `{ error: { code, message, requestId } }`. Common codes include `VALIDATION_ERROR`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CASE_NOT_READY`, `GENERATION_FAILED`, `RATE_LIMITED`, and `ANSWER_ALREADY_SUBMITTED`.

## Current limitations

- Generation is queued in the running API process; use a durable job worker before multi-process or production deployment.
- Generated image and CCTV evidence is described as fictional reconstruction and currently renders a styled still. It is not an actual image-provider integration or playable video. Do not treat these as satisfying the specification’s generated-image or video completion criteria.
- Fixture mode is in-memory only; it is for local previews.
