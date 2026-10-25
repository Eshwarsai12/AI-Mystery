# AI MYSTERY ROOM
## Single Source of Truth (SSOT) — Product & Technical Specification

**Document type:** Product Requirements + Software Design Specification  
**Project name:** AI Mystery Room  
**Document status:** Master specification for implementation  
**Primary audience:** OpenAI Codex, developers, testers  
**Frontend:** React.js  
**Backend:** Node.js + Express.js  
**Database:** MongoDB + Mongoose  
**AI provider:** Google Gemini API  
**Language:** JavaScript / TypeScript-compatible architecture  
**Initial release:** MVP (Minimum Viable Product)

---

# 1. DOCUMENT AUTHORITY

This document is the single source of truth for building AI Mystery Room.

All implementation decisions, features, database models, API contracts, user journeys, business rules, and acceptance criteria must follow this document.

### Rules for Codex

1. Read this entire specification before modifying or generating project code.
2. Inspect the existing repository before creating, deleting, or replacing files.
3. Treat this document as authoritative when deciding how features should behave.
4. Do not invent additional product features without approval.
5. Do not hardcode Gemini API keys, credentials, or production secrets.
6. Do not expose AI provider credentials or privileged operations to the browser.
7. Implement real, functional features—not decorative buttons or mock responses presented as real functionality.
8. Use mock data only for explicitly identified development fixtures and automated tests.
9. Keep the frontend, backend, database, and AI generation logic separated.
10. Update the relevant documentation whenever an approved requirement changes.
11. Do not mark a feature complete until its acceptance criteria and tests pass.
12. If a requirement cannot be implemented as specified because of an API limitation, document the limitation and implement the closest approved fallback without silently changing the product behavior.

**Conflict resolution:** Explicit requirements in this document take precedence over assumptions made during implementation. Any product-level change must be approved and reflected in this document before implementation.

---

# 2. PRODUCT OVERVIEW

## 2.1 Product concept

AI Mystery Room is an interactive, AI-powered mystery investigation website.

A user provides a short story, scenario, or mystery premise. The system transforms that input into a fictional investigation containing:

- A crime or mysterious incident.
- A list of suspects.
- A definitive culprit.
- Motives, timelines, and alibis.
- AI-generated evidence.
- Chat and WhatsApp-style conversations.
- Images and photographs.
- CCTV-style recordings or reconstructed footage.
- Witness statements and investigation reports.
- Clues, contradictions, and red herrings.
- An interactive investigation interface.
- A final culprit selection.
- A result screen explaining the solution.

The user investigates the case, reviews the evidence, forms a theory, and selects the person they believe is responsible.

The platform evaluates the user's selection against the authoritative solution stored by the backend.

## 2.2 Product vision

Create an immersive digital mystery-solving experience in which users feel like investigators examining a real case file, while every case and its supporting evidence are fictional and generated for entertainment.

## 2.3 Core value proposition

**Give users a story. Let AI turn it into a mystery. Let the user solve it.**

## 2.4 Target audience

- Mystery and detective-story enthusiasts.
- Puzzle and escape-room players.
- Students interested in logical reasoning.
- Casual gamers.
- Users who enjoy interactive storytelling.

## 2.5 Core gameplay loop

1. Create a mystery.
2. Wait for AI generation.
3. Enter the investigation room.
4. Review suspects and evidence.
5. Connect clues and contradictions.
6. Submit a culprit selection.
7. Receive the result and explanation.
8. Start another investigation.

## 2.6 Product boundaries

The initial release is a fictional investigation game.

It must not be presented as a real police investigation service, forensic service, surveillance product, or system for identifying real-world criminals.

All generated evidence, identities, conversations, recordings, and incidents must be fictional.

---

# 3. MVP SCOPE

## 3.1 Features required for the first release

| Feature | Requirement |
|---|---|
| Landing page | Required |
| Create-mystery form | Required |
| User-submitted story or scenario | Required |
| Difficulty selection | Required |
| Mystery generation through Gemini | Required |
| Backend validation of AI output | Required |
| Suspect profiles | Required |
| Evidence management interface | Required |
| Chat/message evidence | Required |
| AI-generated evidence images | Required, subject to provider capability |
| CCTV-style evidence | Required through a working supported implementation |
| Investigation timeline | Required |
| Culprit selection | Required |
| Solution reveal and explanation | Required |
| Save and resume cases | Required for authenticated users |
| Case history | Required for authenticated users |
| Responsive interface | Required |
| Error, loading, and empty states | Required |
| Secure backend API | Required |
| Automated tests | Required |

## 3.2 Features excluded from the initial MVP

Do not implement these unless separately approved:

- Multiplayer investigations.
- Live player-versus-player competitions.
- Real police or criminal databases.
- Real-world face recognition or suspect identification.
- Public user-generated case publishing.
- Social networking and messaging between users.
- Subscription payments and premium billing.
- A marketplace for mysteries.
- Real surveillance-camera integrations.
- A production moderation dashboard beyond essential operational logging.

The architecture should permit future expansion without requiring these features in the MVP.

---

# 4. TECHNICAL ARCHITECTURE

## 4.1 Technology stack

### Frontend

- React.js
- Vite
- React Router
- JavaScript or TypeScript
- CSS Modules, plain CSS, or an approved consistent styling system
- Fetch API or Axios
- React Context or a lightweight state-management solution where needed

### Backend

- Node.js
- Express.js
- JavaScript or TypeScript, using one consistent language across the codebase
- REST API
- Mongoose
- Zod or an equivalent request-validation library
- Google Gemini SDK
- JWT-based authentication for the MVP's authenticated features
- bcrypt or bcryptjs for password hashing if email/password authentication is implemented

### Database

- MongoDB Atlas or a compatible MongoDB deployment.
- Mongoose schemas and indexes.
- MongoDB for users, cases, evidence metadata, answers, and investigation state.
- Object storage for generated images and media when required.

### AI and media generation

- Google Gemini API for structured story and mystery generation.
- A Gemini image-generation-capable model or another explicitly configured image provider for visual assets.
- A video-generation provider if actual video generation is supported and configured.
- A deterministic backend renderer for CCTV-style reconstructed footage when direct video generation is unavailable.

**Important implementation constraint:** Gemini text-generation capability does not automatically imply that the selected model can generate images or videos. Codex must verify the configured model's actual capabilities. The application must not claim to have generated a real video when it has only generated a text transcript or a static image.

## 4.2 High-level system architecture

```text
USER
  |
  v
REACT FRONTEND
  |
  | HTTPS / REST API
  v
EXPRESS BACKEND
  |
  +---- Authentication & Authorization
  |
  +---- Mystery Case Service
  |
  +---- Evidence Generation Service
  |         |
  |         +---- Gemini Text Generation
  |         +---- Image Generation Adapter
  |         +---- CCTV / Video Renderer
  |
  +---- Case Validation & Consistency Engine
  |
  +---- Answer Evaluation Service
  |
  +---- Media Storage Service
  |
  +---- MongoDB / Mongoose
```

## 4.3 Architectural principles

1. The frontend never calls Gemini directly using a secret API key.
2. The backend owns the authoritative mystery solution.
3. The backend validates every generated case before publication.
4. Generated media is stored separately from large case documents where practical.
5. Evidence is linked to a particular case and suspect where applicable.
6. The solution remains hidden until the user is authorized to reveal it.
7. Case generation and media generation must be designed to handle failures and retries.
8. AI output is untrusted input and must be parsed, validated, and sanitized.
9. No API endpoint may trust a client-supplied culprit or score.
10. The application must use server-side authorization for all private case operations.

---

# 5. USER ROLES

## 5.1 Guest

A guest may:

- View the landing page.
- Read how the game works.
- Enter a scenario into the creation form.
- Start a limited guest investigation if guest access is enabled.

Guest limitations:

- No persistent account-based history.
- No access to other users' cases.
- No access to unpublished solutions.
- Guest limits must be enforced by the backend, not only by the UI.

For the initial MVP, support authenticated users as the primary experience. Guest mode is optional and must not delay the core investigation workflow.

## 5.2 Registered user

A registered user may:

- Create a mystery.
- View generation progress.
- Investigate their cases.
- Open evidence.
- Track clues and notes.
- Submit one final answer per case by default.
- View the solution after submission.
- Resume an unfinished case.
- View previous cases and results.
- Delete their own cases.

## 5.3 Administrator

An administrator is an operational role, not a normal gameplay role.

Administrator capabilities may include:

- Inspecting generation failures.
- Reviewing sanitized operational logs.
- Managing model configuration through secure server-side settings.
- Managing abusive usage and rate limits.

Do not build a large administrator dashboard in the MVP unless specifically requested.

---

# 6. CORE USER JOURNEY

## 6.1 Journey A: Create a mystery

1. User opens the landing page.
2. User selects **Create a Mystery**.
3. The application opens the creation form.
4. User enters a scenario.
5. User selects difficulty and preferred case settings.
6. Frontend validates the form.
7. Backend validates the request and checks generation limits.
8. Backend creates a case record with `GENERATING` status.
9. Mystery-generation service calls Gemini.
10. Backend parses and validates the generated case.
11. Evidence assets are generated or rendered.
12. Backend validates required assets and case consistency.
13. Case becomes `READY`.
14. Frontend navigates to the investigation room.

If generation fails, the application must show an understandable error and allow a safe retry. It must not expose an incomplete case as ready.

## 6.2 Journey B: Investigate a case

1. User opens the investigation room.
2. The system displays the incident summary.
3. User opens the suspect directory.
4. User reviews suspect profiles.
5. User opens evidence cards.
6. User inspects message threads, images, witness statements, and CCTV-style footage.
7. User records optional notes.
8. User can revisit previously opened evidence.
9. User chooses a suspect as the culprit.
10. User reviews the final accusation.
11. User submits the answer.

Evidence access and notes must remain available when the user resumes an unfinished case.

## 6.3 Journey C: Reveal the solution

1. Backend verifies case ownership.
2. Backend verifies that the case is ready and the answer has not already been submitted.
3. Backend compares the selected suspect ID with the stored culprit ID.
4. Backend records the answer and completion timestamp.
5. Backend calculates the result.
6. Backend returns the permitted solution details.
7. Frontend displays whether the answer is correct.
8. Frontend explains the decisive clues, contradictions, motive, and timeline.
9. User may return to their case history or create another mystery.

**MVP rule:** One final submission per case. The backend must enforce this rule. Any future retry or hint-based scoring system requires an approved specification change.

---

# 7. MYSTERY CREATION REQUIREMENTS

## 7.1 Creation form

Required field:

- `scenario`: The user's story or mystery premise.

Recommended defaults:

| Setting | Default | Allowed values |
|---|---|---|
| Difficulty | MEDIUM | EASY, MEDIUM, HARD |
| Number of suspects | 4 | 3–6 |
| Evidence items | 8 | 6–12 |
| Estimated play time | 10–20 minutes | Informational estimate |
| Language | English | English for MVP |

Optional settings:

- Case title preference.
- Mystery genre: murder mystery, theft, disappearance, sabotage, or general mystery.
- Desired atmosphere: classic detective, suspense, noir, or lighthearted.
- Number of suspects, within the allowed range.

The backend must enforce the allowed limits even if a modified frontend sends invalid values.

## 7.2 Scenario validation

Reject or request correction for:

- Empty scenarios.
- Scenarios exceeding the configured character limit.
- Requests unrelated to creating a fictional mystery.
- Prompts attempting to override system instructions.
- Attempts to extract API keys, hidden prompts, or internal solutions.
- Requests to generate real-person accusations or deceptive real-world evidence.

A suggested initial scenario limit is 5,000 characters. This must be configurable.

Show clear validation messages instead of a generic server error.

## 7.3 Mystery generation requirements

The AI must generate a complete, coherent case containing:

1. Case title.
2. Case summary.
3. Incident details.
4. Fictional setting.
5. Incident date and time.
6. Victim or affected party, where relevant.
7. Suspects.
8. One definitive culprit.
9. Motive.
10. Opportunity and access.
11. Timeline of relevant events.
12. Suspect statements.
13. Evidence items.
14. Clues and contradictions.
15. Red herrings.
16. Authoritative solution.
17. Explanation of how the evidence proves the solution.
18. Evidence dependencies and relationships.
19. References linking decisive clues to the suspects or events they support.

All dates, timestamps, character names, locations, and relationships must remain consistent throughout the case.

## 7.4 Mystery genres

The MVP may support:

- Murder or fictional homicide mystery.
- Theft.
- Missing object.
- Disappearance.
- Corporate sabotage.
- General detective mystery.

All stories must remain fictional and appropriate for the target audience.

---

# 8. AI MYSTERY ENGINE

## 8.1 Fundamental design rule

**Generate the mystery's truth before generating its evidence.**

The backend must first establish an authoritative case blueprint. Evidence is generated afterward from that blueprint.

Do not ask separate, independent AI prompts to invent the culprit, WhatsApp messages, CCTV events, and final explanation without sharing the same authoritative case facts.

## 8.2 Recommended generation pipeline

### Stage 1: Generate the case blueprint

Ask Gemini to generate a structured JSON object containing:

- Case metadata.
- Suspect IDs and profiles.
- The culprit ID.
- Motive.
- Timeline.
- Actual sequence of events.
- Each suspect's actual involvement.
- What each suspect claims happened.
- The true explanation of the incident.
- Required decisive clues.
- Possible red herrings.
- Evidence-generation instructions.

### Stage 2: Validate the blueprint

Backend validation must check:

- Valid JSON and schema.
- Required fields.
- Unique IDs.
- Valid culprit reference.
- Minimum and maximum suspect counts.
- Plausible chronology.
- Consistent character identities.
- A solvable mystery.
- No contradictions between the authoritative truth and required evidence.
- Enough evidence to justify the answer.

If validation fails, retry a bounded number of times or mark the generation as failed. Never silently accept invalid output.

### Stage 3: Generate evidence

Generate individual evidence items from the approved blueprint.

Evidence generation must receive the relevant timeline events, character identities, established facts, and intended clue purpose.

The model must not invent a new culprit or change the case's established truth during this stage.

### Stage 4: Generate or render media

For each evidence item:

- Generate message threads as structured text.
- Generate witness statements as structured text.
- Generate images using a configured image provider.
- Generate CCTV-style visuals using an available video model or a deterministic video-rendering pipeline.
- Record media metadata and storage references.

### Stage 5: Run consistency checks

Validate the completed case:

- The culprit exists.
- Decisive evidence supports the stored solution.
- Timestamps agree with the timeline.
- Names and identities are consistent.
- Suspect statements are consistent with their established knowledge.
- Red herrings do not make an innocent suspect equally or more conclusively guilty.
- The solution explanation references existing evidence IDs.
- All required media assets exist or have approved fallbacks.

### Stage 6: Publish the case

Only after the required validations pass should the case be marked `READY`.

## 8.3 Structured Gemini output

Use the currently supported structured-output or JSON-schema capabilities of the selected Gemini model where available.

The backend must still validate the returned data independently. Model-generated JSON is not automatically trustworthy.

Use server-side prompt templates with version numbers. Record the model identifier and prompt version for debugging and reproducibility.

## 8.4 Retry and failure policy

- Set a bounded retry limit.
- Use timeouts for external API calls.
- Distinguish temporary provider errors from invalid generated content.
- Avoid duplicate charges and duplicate case creation during retries.
- Make generation operations idempotent where possible.
- Store sanitized error codes.
- Never expose raw provider responses, secrets, or internal prompts to users.
- Allow a failed case to be retried without exposing an incomplete solution.

---

# 9. EVIDENCE SYSTEM

Evidence is the central gameplay mechanic.

Every evidence item must have a purpose. It must either support a hypothesis, contradict a statement, establish a timeline, reveal motive, establish opportunity, or act as a deliberate red herring.

## 9.1 Supported evidence types

Use the following enum:

- `CHAT`
- `IMAGE`
- `CCTV`
- `WITNESS_STATEMENT`
- `DOCUMENT`
- `TIMELINE_EVENT`
- `AUDIO_TRANSCRIPT`

The MVP must prioritize the first five categories. Timeline events should also be available in the investigation timeline.

## 9.2 Evidence card requirements

Each evidence card must support:

- Evidence title.
- Evidence type.
- Short summary.
- Discovery timestamp, if relevant.
- Event timestamp, if relevant.
- Content or media reference.
- Relevant suspect references.
- Relevant timeline references.
- Optional location.
- Optional source or origin within the fictional world.
- Read/opened state.
- A concise investigator-facing description.

Do not display internal AI reasoning, hidden clue labels, the culprit ID, or the answer explanation before submission.

## 9.3 Chat and WhatsApp-style evidence

Generated conversations should include:

- Fictional participant names.
- Participant IDs linked to suspect profiles where applicable.
- Message IDs.
- Timestamp.
- Sender.
- Message text.
- Optional attachment reference.
- Conversation ID.

Example:

```json
{
  "type": "CHAT",
  "conversationId": "conv_001",
  "participants": ["suspect_01", "suspect_02"],
  "messages": [
    {
      "id": "msg_001",
      "senderId": "suspect_01",
      "timestamp": "2026-10-20T19:30:00Z",
      "text": "Did you leave the office already?"
    }
  ]
}
```

The frontend may present these as a familiar messaging interface. It must not use actual WhatsApp branding in a way that implies the fictional messages are authentic records from WhatsApp.

All conversations are synthetic and belong to the fictional case.

## 9.4 Image evidence

Images may include:

- A fictional crime scene.
- A room or office.
- An object involved in the incident.
- A fictional photograph.
- An object showing a relevant clue.
- A location connected to the timeline.

Each generated image must be associated with an evidence record.

Store:

- Provider.
- Model identifier.
- Storage key or URL.
- MIME type.
- Width and height where available.
- Generation status.
- Associated evidence ID.
- Generation metadata needed for debugging.

Do not embed large base64 images directly into case documents.

Generated images should not accidentally depict a real person as the culprit of an actual crime.

## 9.5 CCTV-style evidence

CCTV evidence must be implemented as an actual usable visual artifact, not just a decorative button.

Preferred implementation order:

1. Use a configured video-generation provider if it is available and suitable.
2. Otherwise generate a sequence of consistent, fictional frames or scene images.
3. Render the frames into a short MP4 or WebM clip using a backend media-rendering utility.
4. Add fictional timestamps, a camera label, and a CCTV-style overlay.
5. Store the generated clip and expose it through a media URL.
6. If rendering fails, retry or mark the individual asset as failed; do not pretend a transcript is a video.

If a generated CCTV clip contains no meaningful visual event, it cannot count as decisive visual evidence. The backend must validate that the intended event is represented sufficiently for the case to remain solvable.

A transcript may accompany the video, but it is supplementary evidence, not a replacement for the requested visual artifact.

## 9.6 Red herrings

Red herrings are permitted, but they must be fair.

A red herring may make a suspect appear suspicious temporarily. However, it must not create an unavoidable contradiction in the case's underlying truth or make the final answer impossible to determine.

The final solution must explain why major misleading clues were misleading.

## 9.7 Evidence relationships

Every decisive clue must reference one or more relevant facts, timeline events, or suspects.

The backend should be able to answer:

- Which facts does this evidence establish?
- Which suspect statement does it support or contradict?
- Which timeline event does it confirm?
- Does it materially support the true solution?
- Does it function as a red herring?

This relationship data enables meaningful solution explanations rather than generic AI-generated conclusions.

---

# 10. CULPRIT SELECTION AND SCORING

## 10.1 Selection interface

The investigation page must display suspects as selectable profiles.

Each profile includes:

- Fictional name.
- Portrait or avatar.
- Age, where appropriate.
- Occupation or role.
- Relationship to the incident.
- Publicly available background.
- Stated alibi.
- Relevant known facts.

Do not reveal the actual culprit through profile labels, API responses, hidden frontend fields, or CSS.

## 10.2 Submission behavior

1. User selects one suspect.
2. The interface enables the final submission action.
3. The user confirms the accusation.
4. Frontend submits the selected suspect ID.
5. Backend checks authentication, ownership, case status, and answer status.
6. Backend compares the selected ID with the authoritative culprit ID.
7. Backend stores the answer.
8. Backend returns the result and authorized solution explanation.

The frontend must never determine correctness independently.

## 10.3 Result calculation

For the MVP:

- Correct selection: `correct = true`.
- Incorrect selection: `correct = false`.
- Score: 100 for correct, 0 for incorrect.
- One final submission per case.

The score is based on the final answer, not the number of evidence cards opened.

Do not introduce hidden score multipliers, leaderboards, time penalties, or retry penalties in the MVP.

## 10.4 Solution reveal

After submission, display:

- Correct culprit.
- User's selected suspect.
- Correct or incorrect result.
- Culprit's motive.
- How the incident occurred.
- Relevant timeline.
- Key decisive evidence.
- Contradictions in the culprit's statements.
- Explanation of the major red herrings.
- References to the exact evidence cards that support the solution.

All solution references must point to valid evidence IDs.

---

# 11. UI/UX SPECIFICATION

## 11.1 Design direction

The interface should feel like a premium detective investigation room.

Recommended visual direction:

- Dark charcoal or deep navy background.
- Muted neutral panels.
- Restrained red accent for critical clues.
- Warm amber accent for evidence highlights.
- Clear typography.
- High contrast for readability.
- Subtle borders and shadows.
- Controlled animations.
- Realistic evidence cards and file-style layouts.

Avoid excessive glow effects, distracting gradients, clutter, and oversized decorative elements.

The interface must prioritize usability over visual effects.

## 11.2 Global navigation

Authenticated users should have access to:

- Home.
- Create Mystery.
- My Cases.
- Profile.
- Sign In / Sign Out, as applicable.

The navigation must work on desktop and mobile.

## 11.3 Landing page

Required sections:

1. Header and navigation.
2. Hero section.
3. Clear product description.
4. Primary **Create a Mystery** action.
5. Explanation of how the game works.
6. Evidence type showcase.
7. Sample fictional mystery preview.
8. Footer.

The main action must navigate to the creation form.

## 11.4 Create-mystery page

Required elements:

- Scenario textarea.
- Character count.
- Difficulty selector.
- Genre selector.
- Suspect count selector.
- Evidence count selector.
- Submit button.
- Input validation.
- Loading state.
- Generation status.
- Error and retry state.

Disable duplicate submissions while a request is being processed.

## 11.5 Generation progress page

Show meaningful progress states such as:

- Creating the case outline.
- Establishing suspects and timeline.
- Generating evidence.
- Creating visual assets.
- Validating the mystery.
- Preparing the investigation room.

These statuses must reflect actual backend stages. Do not display invented percentage completion.

The frontend should poll a generation-status endpoint or use an explicitly implemented real-time mechanism.

## 11.6 Investigation room

Recommended desktop layout:

- Left sidebar: suspects and case navigation.
- Main content: evidence workspace.
- Right panel: investigation notes, timeline, or clue summary.

On mobile, collapse the panels into accessible tabs or drawers.

Required components:

- Case header.
- Incident summary.
- Suspect directory.
- Evidence grid or list.
- Evidence viewer.
- Timeline.
- Notes panel.
- Final accusation section.
- Completion status.

Evidence cards must support opening, closing, and revisiting evidence.

## 11.7 Evidence viewer

The viewer must render the appropriate content based on evidence type:

- Chat: conversation interface.
- Image: image viewer with zoom or enlargement.
- CCTV: video player with standard controls.
- Witness statement: readable statement document.
- Document: document-style viewer.
- Timeline event: structured event details.
- Audio transcript: readable transcript.

The viewer must handle missing media and unsupported formats gracefully.

## 11.8 Solution screen

The solution screen should clearly separate:

- Result.
- Correct suspect.
- Case reconstruction.
- Decisive clues.
- Timeline explanation.
- Misleading evidence.
- Play-again action.

The play-again action should navigate to mystery creation.

## 11.9 Accessibility and responsiveness

- Support keyboard navigation.
- Use semantic HTML.
- Provide accessible labels for controls.
- Provide meaningful alternative text for images.
- Do not rely on color alone to convey correctness.
- Support narrow mobile screens.
- Show visible focus states.
- Respect reduced-motion preferences.
- Ensure media controls are usable by keyboard where supported.

---

# 12. FRONTEND ROUTES

Recommended routes:

| Route | Purpose | Access |
|---|---|---|
| `/` | Landing page | Public |
| `/create` | Create a mystery | Public or authenticated |
| `/login` | Sign in | Public |
| `/register` | Register | Public |
| `/cases` | User's cases | Authenticated |
| `/cases/:caseId` | Investigation room | Owner only |
| `/cases/:caseId/result` | Solution and result | Owner only, after submission |
| `/profile` | User profile | Authenticated |
| `*` | Not found | Public |

Unauthenticated users who access protected routes should be redirected to sign in.

Case ownership must be enforced on the backend, even when frontend route guards are present.

---

# 13. BACKEND API CONTRACT

Base prefix: `/api/v1`

All endpoints must return JSON, use consistent HTTP status codes, validate request bodies, and return a predictable error structure.

## 13.1 Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Authenticate |
| POST | `/auth/logout` | End session or invalidate refresh/session credentials, as implemented |
| GET | `/auth/me` | Get authenticated user |

Use secure password hashing. Do not store plaintext passwords.

If JWTs are used, prefer a secure, appropriately configured session or refresh-token strategy. Browser token storage and cookie settings must be documented and protected against common web vulnerabilities.

## 13.2 Mystery cases

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/cases` | Create case and start generation |
| GET | `/cases` | List current user's cases |
| GET | `/cases/:caseId` | Get case details permitted to the user |
| GET | `/cases/:caseId/status` | Check generation status |
| DELETE | `/cases/:caseId` | Delete the user's case |
| POST | `/cases/:caseId/retry-generation` | Retry an eligible failed generation |

The case response before completion must not reveal the solution.

## 13.3 Evidence

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/cases/:caseId/evidence` | List permitted evidence |
| GET | `/cases/:caseId/evidence/:evidenceId` | Retrieve one evidence item |
| POST | `/cases/:caseId/evidence/:evidenceId/open` | Record evidence access, if tracking is enabled |

Evidence access tracking is for gameplay continuity. It must not reveal hidden clue classifications.

## 13.4 Investigation and answers

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/cases/:caseId/progress` | Retrieve investigation progress |
| PUT | `/cases/:caseId/notes` | Save investigator notes |
| POST | `/cases/:caseId/submit-answer` | Submit the final culprit selection |
| GET | `/cases/:caseId/result` | Retrieve permitted results after submission |

## 13.5 Request examples

### Create case

Request:

```json
{
  "scenario": "A rare diamond disappeared from a locked hotel suite during a private dinner.",
  "difficulty": "MEDIUM",
  "genre": "THEFT",
  "suspectCount": 4,
  "evidenceCount": 8
}
```

Response: `202 Accepted`

```json
{
  "caseId": "case_abc123",
  "status": "GENERATING",
  "statusUrl": "/api/v1/cases/case_abc123/status"
}
```

The case ID format is illustrative. Production IDs should use a consistent, secure ID strategy.

### Check generation status

Response:

```json
{
  "caseId": "case_abc123",
  "status": "GENERATING",
  "stage": "GENERATING_EVIDENCE"
}
```

When generation is successful:

```json
{
  "caseId": "case_abc123",
  "status": "READY",
  "stage": "COMPLETED"
}
```

### Submit answer

Request:

```json
{
  "suspectId": "suspect_02"
}
```

Successful submission:

```json
{
  "submitted": true,
  "correct": false,
  "score": 0,
  "resultUrl": "/api/v1/cases/case_abc123/result"
}
```

The backend must not return the stored culprit ID or complete solution to the client before answer submission.

## 13.6 Standard error response

Use a consistent structure:

```json
{
  "error": {
    "code": "CASE_NOT_READY",
    "message": "This mystery is not ready yet.",
    "requestId": "req_example"
  }
}
```

Suggested error codes:

- `VALIDATION_ERROR`
- `UNAUTHENTICATED`
- `FORBIDDEN`
- `NOT_FOUND`
- `CASE_NOT_READY`
- `GENERATION_FAILED`
- `RATE_LIMITED`
- `ANSWER_ALREADY_SUBMITTED`
- `MEDIA_UNAVAILABLE`
- `INTERNAL_ERROR`

Do not return stack traces, database internals, or provider secrets to the client.

---

# 14. DATABASE DESIGN

Use MongoDB with Mongoose schemas and appropriate indexes.

All records must have timestamps where appropriate.

The examples below illustrate the data contracts; they are not permission to expose internal fields in API responses.

## 14.1 User model

Collection: `users`

Fields:

```text
_id
name
email
passwordHash
role                 USER | ADMIN
createdAt
updatedAt
```

Requirements:

- Unique normalized email.
- Password hash only.
- Never return `passwordHash` to the frontend.
- Use an explicit allowlist for user responses.

## 14.2 Case model

Collection: `cases`

Fields:

```text
_id
ownerId
title
scenario
summary
genre
difficulty
status
generationStage
suspectIds[]
evidenceIds[]
timeline[]
culpritId
motive
solution
solutionEvidenceIds[]
answerSubmission
generationMetadata
createdAt
updatedAt
completedAt
```

Recommended status enum:

- `GENERATING`
- `READY`
- `FAILED`
- `COMPLETED`

Recommended generation stages:

- `QUEUED`
- `GENERATING_BLUEPRINT`
- `VALIDATING_BLUEPRINT`
- `GENERATING_EVIDENCE`
- `GENERATING_MEDIA`
- `VALIDATING_CASE`
- `COMPLETED`

`COMPLETED` as a case status means the user has completed the investigation. Generation completion should be represented by the appropriate stage and `READY` status.

Internal fields such as `culpritId`, `motive`, and `solution` must be removed from normal pre-submission API projections.

For a production deployment, consider separating the authoritative solution into a restricted solution collection so ordinary case reads cannot accidentally expose it.

## 14.3 Suspect model

Collection: `suspects`

Fields:

```text
_id
caseId
name
age
occupation
roleDescription
background
publicAlibi
portraitAssetId
createdAt
updatedAt
```

Suspects must belong to exactly one case in the MVP.

Do not expose internal truth, hidden motives, or the suspect's actual involvement before the solution is revealed.

## 14.4 Evidence model

Collection: `evidence`

Fields:

```text
_id
caseId
type
title
summary
content
assetIds[]
relatedSuspectIds[]
relatedTimelineEventIds[]
discoveredAt
eventTimestamp
location
sourceDescription
createdAt
updatedAt
```

Store long message threads and large evidence content separately if document size or access patterns require it.

## 14.5 Media asset model

Collection: `mediaAssets`

Fields:

```text
_id
caseId
evidenceId
assetType
provider
model
storageKey
mimeType
width
height
durationSeconds
status
generationMetadata
createdAt
updatedAt
```

Recommended `assetType` values:

- `IMAGE`
- `VIDEO`
- `AUDIO`
- `DOCUMENT`

Recommended status values:

- `PENDING`
- `GENERATING`
- `READY`
- `FAILED`

Use private object storage and signed URLs where appropriate.

## 14.6 Answer submission

MVP: one final submission per case.

Fields:

```text
caseId
userId
selectedSuspectId
isCorrect
score
submittedAt
```

Enforce one submission per user per case through appropriate database constraints and backend logic.

## 14.7 Investigation progress

Progress may be stored in a separate collection if needed.

Fields:

```text
caseId
userId
openedEvidenceIds[]
notes
lastViewedAt
updatedAt
```

Use a unique compound index on `caseId` and `userId`.

## 14.8 Required indexes

At minimum:

- `users.email`: unique.
- `cases.ownerId + createdAt`: case history.
- `cases.status + createdAt`: operational queries.
- `suspects.caseId`: suspect retrieval.
- `evidence.caseId`: evidence retrieval.
- `mediaAssets.caseId + evidenceId`: media lookup.
- `answerSubmissions.caseId + userId`: unique answer constraint.
- `investigationProgress.caseId + userId`: unique progress record.

Use actual schema references and ObjectIds or a consistently implemented alternative. Do not mix incompatible ID formats.

---

# 15. CASE JSON CONTRACT

The AI output must conform to a versioned, validated case structure.

A simplified example:

```json
{
  "schemaVersion": "1.0",
  "title": "The Missing Diamond",
  "summary": "A diamond vanished during a private hotel dinner.",
  "genre": "THEFT",
  "difficulty": "MEDIUM",
  "incident": {
    "type": "THEFT",
    "location": "Fictional Hotel, Suite 401",
    "occurredAt": "2026-10-20T20:00:00Z",
    "description": "A diamond disappeared from a locked display case."
  },
  "suspects": [
    {
      "id": "suspect_01",
      "name": "Alex Morgan",
      "occupation": "Event Manager",
      "background": "Managed the private dinner.",
      "publicAlibi": "Claims to have been in the lobby."
    }
  ],
  "truth": {
    "culpritId": "suspect_01",
    "motive": "A fictional financial motive.",
    "actualSequence": [
      {
        "timestamp": "2026-10-20T19:50:00Z",
        "description": "The suspect entered the private suite."
      }
    ]
  },
  "timeline": [
    {
      "id": "event_01",
      "timestamp": "2026-10-20T19:50:00Z",
      "description": "A suspect entered the suite."
    }
  ],
  "evidencePlan": [
    {
      "id": "evidence_01",
      "type": "CHAT",
      "title": "A Suspicious Message",
      "purpose": "Establish a contradiction in the suspect's alibi.",
      "relatedSuspectIds": ["suspect_01"],
      "decisive": true
    }
  ],
  "solution": {
    "explanation": "The timeline and message establish the contradiction.",
    "evidenceIds": ["evidence_01"]
  }
}
```

This is a structural illustration, not a complete playable mystery. Production validation must require all mandatory fields, valid references, sufficient evidence, and a consistent timeline.

The case blueprint may contain private truth fields that are never sent to the frontend until authorized.

### Validation rules

- All IDs must be unique within their appropriate scope.
- Every referenced suspect, event, and evidence item must exist.
- `culpritId` must match an existing suspect.
- Every solution evidence ID must match an existing evidence item.
- Every decisive clue must have a defined relationship to the solution.
- Timestamps must use a consistent timezone convention, preferably UTC.
- User-facing timestamps must be localized by the frontend where appropriate.
- The schema must be versioned.
- Unknown or invalid fields must not bypass validation.
- Missing required media must prevent publication when that media is essential to solving the case.

---

# 16. SOLUTION INTEGRITY AND FAIRNESS

This section is mandatory.

## 16.1 One authoritative truth

Store one authoritative case blueprint.

The following must derive from it:

- Suspect identities.
- Motives.
- Timeline.
- Messages.
- Statements.
- Images and video prompts.
- Decisive clues.
- Final solution.

## 16.2 Solvability requirements

Before publishing a case, verify that:

1. At least one evidence item establishes a relevant fact about the culprit.
2. The combined evidence supports the culprit's guilt.
3. The decisive clues are accessible to the user.
4. Major alibis and contradictions are logically consistent.
5. Innocent suspects can be distinguished from the culprit.
6. The final explanation references actual evidence.
7. The solution does not depend on information that was never shown to the player.
8. No contradictory generated asset invalidates the answer.

## 16.3 Automated consistency checks

Implement deterministic checks for:

- Missing IDs.
- Invalid references.
- Duplicate timestamps where prohibited.
- Invalid chronology.
- Unsupported evidence types.
- Missing media.
- Broken asset URLs.
- Invalid culprit references.
- Invalid solution evidence references.
- Missing required decisive clues.
- Case status inconsistencies.

AI-assisted critique may be added, but it does not replace deterministic validation.

## 16.4 Human review

Human review is not mandatory for each case in the MVP.

However, if validation repeatedly fails, the system must fail safely instead of publishing an unplayable mystery.

---

# 17. SECURITY REQUIREMENTS

Security is part of the implementation, not an optional enhancement.

## 17.1 API key protection

- Store Gemini and media-provider API keys in server-side environment variables or a managed secret store.
- Never include secrets in frontend bundles.
- Never commit `.env` files.
- Provide `.env.example` containing placeholder values only.
- Rotate compromised credentials.
- Avoid logging complete provider request headers or secret-bearing payloads.

## 17.2 Authentication and authorization

- Hash passwords using an established password-hashing library.
- Enforce access control on every private case endpoint.
- Verify case ownership on evidence, progress, answer, result, and deletion routes.
- Do not rely on hidden UI buttons or frontend routing for authorization.
- Prevent access to another user's cases by guessing case IDs.
- Ensure the solution cannot be retrieved through unprotected routes.

## 17.3 Input validation

- Validate every API request.
- Enforce payload-size limits.
- Sanitize rendered user content.
- Protect against NoSQL injection.
- Avoid unsafe HTML rendering.
- Validate generated URLs and asset metadata.
- Do not execute generated code or generated shell commands.

## 17.4 Rate limiting and cost control

Apply configurable limits to:

- Login attempts.
- Account creation.
- Mystery generation.
- Generation retries.
- Media generation.
- Answer submission.

Set generation budgets and maximum output sizes. Use a bounded number of AI calls per case.

Protect against duplicate submissions and accidental repeated generation.

## 17.5 Media security

- Validate media types.
- Restrict upload functionality if user uploads are introduced later.
- Store generated assets outside executable application directories.
- Use signed URLs or protected media endpoints for private assets.
- Prevent path traversal and unsafe file naming.
- Set maximum asset size and duration limits.

## 17.6 Privacy

Collect only information needed for the application.

Users must not be able to read other users' private investigation data, notes, or case histories.

Delete associated media when a case is deleted, subject to any required retention policy.

---

# 18. ERROR HANDLING AND RELIABILITY

Handle these conditions explicitly:

- MongoDB unavailable.
- Gemini API unavailable.
- Gemini rate limit exceeded.
- Gemini returns invalid JSON.
- Generated mystery fails validation.
- Image generation fails.
- Video generation fails.
- Media rendering fails.
- Storage upload fails.
- User session expires.
- Case is still generating.
- Case is already completed.
- Answer was already submitted.
- Requested evidence does not exist.
- User does not own the case.
- Network request times out.
- A case is deleted while the frontend is open.

### Recovery rules

1. Show a clear message for recoverable failures.
2. Retry only where safe.
3. Use bounded retries and exponential backoff where appropriate.
4. Do not create duplicate cases during retries.
5. Persist generation status so a page refresh does not lose progress.
6. Mark unrecoverable cases as `FAILED`.
7. Never show a partially generated case as fully playable.
8. Never silently replace failed decisive evidence with unrelated evidence.
9. Log internal diagnostics without exposing secrets or the answer.
10. Make media and generation operations safe to resume after a server restart.

---

# 19. OBSERVABILITY AND LOGGING

Use structured server logs.

Include:

- Request ID.
- Case ID when applicable.
- Generation stage.
- Provider/model identifier.
- Operation duration.
- Error code.
- Retry count.
- Asset status.

Do not log:

- Passwords.
- Authentication tokens.
- API keys.
- Unnecessary personal information.
- Full confidential solution payloads in ordinary application logs.

The application should make it possible to diagnose why a case failed without exposing private data or secrets.

---

# 20. PERFORMANCE REQUIREMENTS

These are initial engineering targets, to be measured under an agreed test environment.

- Normal API requests: target p95 under 500 ms, excluding AI generation and large media delivery.
- Case-list loading: target under 2 seconds for a normal-sized list.
- Investigation page: render the initial layout before all large media finishes loading.
- Images: use suitable dimensions and compression.
- Videos: use browser-compatible formats and sensible resolution limits.
- AI generation: asynchronous; do not hold a single HTTP request open throughout the entire workflow.
- Polling: use a configurable interval and stop polling when generation finishes or fails.
- Database: use indexes and pagination where appropriate.
- Media: use object storage and CDN delivery where available.

AI generation latency depends on external providers and must be measured rather than guaranteed.

---

# 21. RECOMMENDED PROJECT STRUCTURE

Codex must inspect the existing repository first. If the repository is empty, use a structure similar to the following:

```text
ai-mystery-room/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── mystery/
│   │   │   ├── evidence/
│   │   │   └── common/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── mystery/
│   │   │   ├── evidence/
│   │   │   ├── ai/
│   │   │   ├── media/
│   │   │   └── storage/
│   │   ├── validators/
│   │   ├── middleware/
│   │   ├── prompts/
│   │   ├── jobs/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── docs/
│   ├── SPEC.md
│   ├── API.md
│   └── ARCHITECTURE.md
│
├── .gitignore
├── README.md
└── package.json
```

Use a shared package for schemas and API contracts only if the repository's tooling supports it cleanly.

Avoid unnecessary abstractions and excessive dependencies.

---

# 22. ENVIRONMENT CONFIGURATION

The server's `.env.example` should document the required configuration.

Example:

```dotenv
NODE_ENV=development
PORT=5000

MONGODB_URI=

JWT_SECRET=
JWT_ACCESS_TOKEN_TTL=15m

GEMINI_API_KEY=
GEMINI_TEXT_MODEL=

IMAGE_PROVIDER=
IMAGE_MODEL=

VIDEO_PROVIDER=
VIDEO_MODEL=

STORAGE_PROVIDER=
STORAGE_BUCKET=
STORAGE_REGION=

CLIENT_ORIGIN=http://localhost:5173

CASE_GENERATION_MAX_RETRIES=2
CASE_GENERATION_TIMEOUT_MS=60000
MAX_SCENARIO_LENGTH=5000
```

These are example variable names and initial values, not claims that every model or provider supports every capability.

Codex must document any additional required environment variables and their purposes.

Requirements:

- Fail fast with a clear startup error when mandatory configuration is missing.
- Never print secret values.
- Keep production and development configuration separate.
- Validate environment configuration at startup.
- Use a provider adapter for optional image and video services.
- Ensure a missing video provider does not cause the application to misrepresent a transcript as generated video.

---

# 23. TESTING STRATEGY

## 23.1 Unit tests

Test:

- Request validators.
- Case blueprint validation.
- Evidence reference validation.
- Timeline consistency.
- Culprit reference validation.
- Answer scoring.
- Ownership checks.
- Case state transitions.
- Solution redaction.
- Generation retry logic.

## 23.2 Integration tests

Test:

- Registration and login.
- MongoDB persistence.
- Case creation.
- Generation-status updates.
- Evidence retrieval.
- Media metadata persistence.
- Answer submission.
- Duplicate submission rejection.
- Case deletion.
- Unauthorized access prevention.

Use a test database and mock external AI providers in deterministic automated tests.

## 23.3 End-to-end tests

A complete MVP test must cover:

1. Open the website.
2. Create or sign into an account.
3. Enter a fictional scenario.
4. Start mystery generation.
5. Observe generation status.
6. Open the completed case.
7. Inspect suspects.
8. Open chat evidence.
9. Open image evidence.
10. Play CCTV-style evidence.
11. Inspect the timeline.
12. Select a suspect.
13. Submit the final answer.
14. View the result.
15. Confirm that the solution explanation references valid evidence.
16. Return to case history.

## 23.4 Required security tests

Verify that:

- User A cannot retrieve User B's case.
- User A cannot access User B's evidence.
- User A cannot read User B's notes.
- The culprit is not exposed before submission.
- An incorrect suspect ID is rejected.
- Duplicate answers are rejected.
- Invalid scenario input is rejected.
- API secrets are not present in frontend build artifacts.
- Rate limits work.
- Generated text cannot inject executable HTML into the interface.

---

# 24. ACCEPTANCE CRITERIA

The MVP is not complete until all applicable criteria pass.

### AC-01: Project setup

- Frontend starts successfully.
- Backend starts successfully.
- MongoDB connects successfully.
- Environment configuration is documented.
- README contains setup instructions.

### AC-02: Mystery creation

- A valid scenario is accepted.
- Invalid scenarios are rejected.
- Backend creates a case record.
- Generation occurs asynchronously.
- Frontend can retrieve the generation status.

### AC-03: AI generation

- Gemini produces a valid structured case blueprint.
- The backend validates the result.
- The case contains one definitive culprit.
- Evidence is generated from the approved truth.
- The case is not published if mandatory validation fails.

### AC-04: Evidence

- The evidence list loads correctly.
- Chat messages render correctly.
- Generated images load correctly.
- CCTV-style footage plays correctly.
- Evidence IDs and suspect references are valid.
- Missing assets are handled visibly.

### AC-05: Investigation

- Users can navigate suspects and evidence.
- Timeline information is displayed.
- Investigation notes persist if implemented.
- The case can be resumed after refreshing the page.

### AC-06: Answer submission

- A user can select a suspect.
- Backend determines correctness.
- The answer is persisted.
- Duplicate submissions are rejected.
- Unauthorized submissions are rejected.

### AC-07: Solution

- The result screen displays the correct outcome.
- The authoritative solution is hidden before submission.
- The solution explains decisive evidence.
- The referenced evidence exists.
- Major red herrings are explained.

### AC-08: Security

- No Gemini or media-provider secret is exposed in frontend code.
- Ownership checks protect private data.
- Passwords are hashed.
- API input validation is active.
- Rate limiting is implemented for expensive operations.

### AC-09: User experience

- Responsive layouts work on desktop and mobile.
- Loading and error states are implemented.
- Buttons perform real actions.
- Navigation is functional.
- No major route relies on placeholder content.

### AC-10: Testing and documentation

- Automated tests pass.
- The application can be run using documented commands.
- API endpoints are documented.
- Environment variables are documented.
- Known limitations are recorded.

---

# 25. IMPLEMENTATION PHASES FOR CODEX

Build in the following order. Do not attempt to implement every feature simultaneously.

## Phase 1 — Repository and foundation

- Inspect existing files.
- Confirm the runtime and installed dependencies.
- Set up the React application.
- Set up the Express server.
- Configure MongoDB.
- Configure environment validation.
- Add health-check endpoint.
- Establish consistent error handling.
- Create the initial documentation.

**Exit condition:** Frontend, backend, and database connectivity work.

## Phase 2 — UI foundation

- Implement the landing page.
- Implement global navigation.
- Implement responsive styling.
- Build the create-mystery form.
- Add loading, validation, and error states.
- Build reusable suspect and evidence components.

**Exit condition:** Users can navigate the complete UI structure without dead controls.

## Phase 3 — Authentication and persistence

- Implement registration and login.
- Implement protected routes.
- Create the user, case, suspect, evidence, media, and progress schemas.
- Add indexes and ownership middleware.
- Implement case history.

**Exit condition:** Authenticated users can securely access their own data.

## Phase 4 — Gemini mystery engine

- Configure Gemini.
- Implement prompt templates.
- Generate structured case blueprints.
- Validate and store the blueprint.
- Generate evidence from the blueprint.
- Implement consistency checks.
- Implement generation status and retries.

**Exit condition:** A valid scenario produces a coherent, validated mystery.

## Phase 5 — Evidence and media

- Implement chat evidence.
- Implement image generation and storage.
- Implement CCTV generation or deterministic rendering.
- Implement the media viewer.
- Connect evidence to the investigation timeline.

**Exit condition:** Every mandatory evidence type is usable.

## Phase 6 — Investigation and solution

- Implement suspect selection.
- Implement evidence navigation.
- Implement answer submission.
- Implement backend scoring.
- Implement solution reveal.
- Implement case completion and history.

**Exit condition:** The complete gameplay loop works end to end.

## Phase 7 — Hardening

- Run automated tests.
- Test authorization and solution secrecy.
- Test generation failures.
- Test missing media.
- Optimize loading.
- Check responsive layouts.
- Complete deployment documentation.

**Exit condition:** All MVP acceptance criteria pass.

---

# 26. CODEX EXECUTION RULES

Codex must follow these rules throughout development.

1. Start by inspecting the repository and identifying existing code, dependencies, and conventions.
2. Do not overwrite functioning files without understanding their purpose.
3. Work phase by phase.
4. Implement the backend contract before connecting dependent frontend features.
5. Use typed or validated contracts for AI-generated JSON and API payloads.
6. Keep AI prompts in versioned server-side files or modules.
7. Keep model selection and provider configuration centralized.
8. Never use generated content as trusted application instructions.
9. Never hardcode a correct answer in the frontend.
10. Keep the solution inaccessible until the backend authorizes its release.
11. Write tests alongside critical functionality.
12. Run relevant tests and builds after changes.
13. Fix failures rather than hiding or bypassing them.
14. Do not claim an API integration works unless it has been tested.
15. Do not claim a generated video works until an actual playable media asset has been verified.
16. Keep `.env` and secret-bearing files out of version control.
17. Update `README.md` when setup, scripts, or required configuration changes.
18. Update `docs/API.md` when API contracts change.
19. Update this SSOT only when an approved requirement changes.
20. At the end of each phase, report implemented functionality, tests run, results, and outstanding blockers.

---

# 27. DEFINITION OF DONE

The AI Mystery Room MVP is considered complete only when:

- A user can create a fictional mystery from a short scenario.
- Gemini generates a structured and internally consistent case.
- The backend establishes and preserves one authoritative culprit.
- Suspects and evidence are linked correctly.
- Chat evidence works.
- Image evidence works.
- CCTV-style evidence is available as actual playable video.
- The investigation interface is usable on desktop and mobile.
- The user can select and submit a culprit.
- The backend evaluates the answer correctly.
- The solution is revealed only after an authorized submission.
- The explanation cites valid, decisive evidence.
- Case history and access controls work.
- Failure handling is functional.
- Automated tests pass.
- Setup, configuration, and API documentation are complete.

A visually complete interface with nonfunctional backend operations does not meet the definition of done.

---

# 28. FINAL PRODUCT PRINCIPLES

These principles govern implementation decisions when details are not explicitly specified.

**Truth before evidence:** Establish the case's authoritative solution before generating clues.

**Evidence before explanation:** Every important conclusion must be supported by evidence available to the user.

**Backend authority:** The server controls ownership, case state, answer evaluation, and solution access.

**Real functionality:** A feature must work as described, not merely look finished.

**Graceful failure:** Invalid AI output or failed media generation must not produce an unplayable case.

**Fictional integrity:** The experience must remain clearly fictional and must not fabricate real-world accusations.

**Consistent experience:** The same case must retain its suspects, timeline, evidence, and solution across reloads.

**Incremental development:** Build and verify each phase before proceeding to the next.

---

## END OF SPECIFICATION

This document is the authoritative product and technical specification for the AI Mystery Room MVP. All implementation work must comply with it unless an explicit, approved change is recorded.
