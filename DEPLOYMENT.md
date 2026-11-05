# Production deployment

The frontend is a Next.js app. Its API and Better Auth endpoints are provided by the separate `studio-space-backend` service.

## Deploy the API first

1. Push the `studio-space-backend` repository to GitHub.
2. In Render, create a **Blueprint** from that repository. Render reads `render.yaml` and prompts for the secret environment variables.
3. Set `MONGODB_URI`, `DB_NAME`, and `BETTER_AUTH_SECRET`. Use the same MongoDB database and Better Auth secret for both projects.
4. Set `BETTER_AUTH_URL` to the public HTTPS origin Render assigns to the API service (no `/api` suffix).
5. Set `CLIENT_URL` to the Vercel frontend origin (no path). To allow Vercel preview domains too, enter comma-separated origins.
6. Confirm the API is healthy at `<API origin>/api/health`.

## Deploy the frontend to Vercel

1. Import the `studio-space-frontend` GitHub repository as a new Vercel project. Keep the repository root as the Root Directory and use the detected Next.js build settings.
2. Add these environment variables for Production (and Preview if needed):
   - `MONGODB_URI` and `MONGODB_DB`: the same MongoDB connection/database used by the API.
   - `BETTER_AUTH_SECRET`: the same secret used by the API.
   - `BETTER_AUTH_URL`: the Vercel frontend origin.
   - `NEXT_PUBLIC_AUTH_URL`: the Render API origin, without `/api`.
   - `NEXT_PUBLIC_API_URL`: the Render API origin followed by `/api`.
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
3. Add the API auth callback URL `<API origin>/api/auth/callback/google` to the Google OAuth client's authorized redirect URIs.
4. Redeploy after setting environment variables.

Copy local values from `.env` into the hosting dashboards manually. Never commit `.env`; `.env.example` contains names and local defaults only.
