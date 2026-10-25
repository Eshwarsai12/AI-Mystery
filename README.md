# Casefile · AI Mystery Room

An interactive, fictional detective game built to the product and technical requirements in [`spec.md`](./spec.md). Write a premise, investigate AI-generated exhibits, and submit one final suspect selection. All people, places, cases, and evidence are fictional.

## Requirements

- Node.js 20 or later and npm 10 or later.
- For persistent, AI-generated cases: a MongoDB database and a Google Gemini API key with access to the configured text model.
- Fixture mode is available for interface previews without credentials. It uses in-memory accounts and cases and explicitly does not save data across server restarts.

## Start locally

1. Install dependencies in the project root: `npm install`.
2. Copy `server/.env.example` to `server/.env`.
3. Generate a 32-character-or-longer JWT signing secret and set `JWT_SECRET`.
4. For a UI and API preview, keep `DEV_FIXTURES=true`. For persistent AI-powered cases, set `DEV_FIXTURES=false`, configure `MONGODB_URI`, `GEMINI_API_KEY`, and `GEMINI_TEXT_MODEL`.
5. Start the client and server together with `npm run dev`.
6. Open `http://localhost:5173` and create an account to save cases.

Alternatively run `npm run dev:client` and `npm run dev:server` in separate terminals. Configure `CLIENT_ORIGIN` to the exact client origin. The client API address can be changed in `client/.env` with `VITE_API_URL`.

Fixture mode requires only a JWT secret. For a quick local secret, use a random value of at least 32 characters in `server/.env`; never use a development secret in production. Accounts and cases in fixture mode are lost when the server restarts. Do not use fixture mode for production or enter real personal or sensitive information.

## Build

- `npm run build` creates the production frontend in `client/dist`.
- `npm start` starts the configured API server.
- `GET /health` reports server readiness and whether development fixtures are active.

## Deploy to Render

The repository includes a [`render.yaml`](./render.yaml) Blueprint for one web service that serves the built React app and the API at the same origin. Push the repository to GitHub, create a Render Blueprint deployment from it, then supply `MONGODB_URI` and `GEMINI_API_KEY` when Render prompts for the unsynced secrets. Render generates `JWT_SECRET`. The Blueprint sets `DEV_FIXTURES=false`; use a MongoDB Atlas connection string whose network access permits the Render service. The deployment is not ready until Render reports `/health` as healthy and both provider secrets are configured.

## Deploy the frontend to GitHub Pages

The [`pages.yml`](./.github/workflows/pages.yml) workflow builds only the `client` workspace and publishes only `client/dist` using the official GitHub Pages actions. Vite uses `/AI-Mystery/` for production project-site assets; the React app uses hash-based routing so refreshing a nested frontend route works on Pages. In repository **Settings → Pages**, set the source to **GitHub Actions**. A push to `main` or a manual workflow run publishes the site. The workflow does not deploy the Express server or any environment file.

The Pages frontend needs a separately hosted HTTPS API for account and investigation features. To connect one, add the repository Actions variable `VITE_API_URL` with the public API base URL (including `/api/v1`). This value is public client configuration; never put API keys, database URIs, or JWT secrets in it. Until configured, the frontend explains that its backend is disconnected instead of sending API requests to GitHub Pages.

## Implemented features

- Responsive landing, mystery intake, archive, suspect directory, exhibit viewer, timeline, field notes, final accusation, and solution reveal.
- React/Vite client and versioned Express JSON API.
- Session cookies with HTTP-only protection, bcrypt password hashing, request validation, API rate limits, owner-scoped case queries, and server-only culprit evaluation.
- Gemini structured case generation and server-side checks for suspect count, evidence count, IDs, references, and culprit consistency.
- MongoDB/Mongoose persistence when `DEV_FIXTURES=false`.
- Clearly disclosed in-memory development fixture mode for previews without provider credentials.

## Configure providers and fictional media

Gemini generates text case data; a text model does not itself make images or video. Image and CCTV evidence in the current UI is presented as a **fictional reconstruction**, never as actual surveillance or provider-generated media. Connect and verify configured image generation, object storage, and playable video rendering separately before describing those media capabilities as provider-generated or production-ready. See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## API documentation

See [`docs/API.md`](./docs/API.md) for routes, session behavior, and errors. The complete product requirements and acceptance criteria remain in [`spec.md`](./spec.md).
