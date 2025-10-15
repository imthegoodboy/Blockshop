# Deploying Blockshop to Render (step-by-step)

This guide shows how to deploy the `web/` Next.js frontend to Render using the `render.yaml` already included in the repository. It also explains which environment variables you must set (both for the frontend and the contracts scripts) and how to keep secrets safe.

## What we added
- `render.yaml` — declarative service for Render that builds from `web/` and runs `npm run start`.
- `.renderignore` — avoids sending node_modules, local env files, and build artefacts to Render.
- `web/.env.example` — lists the frontend environment variables (no secrets included).

## Required environment variables

Set these values in Render's dashboard as Environment -> Environment Variables for the service. For values marked PUBLIC, they will be exposed to the browser (client bundle). For values marked SERVER, keep them secret in Render and do NOT prefix them with `NEXT_PUBLIC_`.

- NEXT_PUBLIC_MARKETPLACE_ADDRESS (PUBLIC) — deployed Marketplace contract address for web UI to call.
- NEXT_PUBLIC_WALLETCONNECT_ID (PUBLIC) — WalletConnect project id or `demo`.
- WEB3_STORAGE_TOKEN (SERVER) — API token for web3.storage or other IPFS provider used by uploads (server-side routes should use the server value; if your upload route uses NEXT_PUBLIC_, it may be used client-side).
- NEXT_PUBLIC_LIGHTHOUSE_API_KEY (PUBLIC) or LIGHTHOUSE_API_KEY (SERVER) — API key for Lighthouse upload SDK. The code prefers public value first, then server. Prefer setting the server key as `LIGHTHOUSE_API_KEY` for privacy and set the public one only if safe.
- GEMINI_API_KEY (SERVER) — API key used by the chat API route. Keep this secret.
- MONGODB_URI (SERVER) — MongoDB connection string. Required if you use server-side DB features (auth, product metadata). Example: `mongodb+srv://user:pass@cluster...`.
- MONGODB_DB (SERVER) — optional DB name; default `blockshopy`.
- JWT_SECRET (SERVER) — secret used to sign login JWTs and cookies. Replace `dev-secret-change` with a strong value.

Contract-related env vars (for `contracts/` local use only):
- AMOY_RPC_URL — RPC URL for Polygon Amoy (used when running hardhat deploys locally).
- PRIVATE_KEY — deployer private key (keep offline and never push to Git).
- POLYGONSCAN_API_KEY — optional for verification.
- FEE_RECIPIENT, PLATFORM_FEE_BPS — optional deployment params.

Note: The `contracts/.env` in this repository currently contains values (do not commit or share private keys). Never add your private key to public repo or Render env variables unless it's intentionally for automation (but be cautious!).

## Steps to deploy on Render

1. Push your repo to GitHub (or use the repo already connected to Render).
2. Open Render (https://dashboard.render.com) and create a new service.
   - Choose "Web Service" and connect your Git repo.
   - Render will detect `render.yaml` and propose using it. If not, choose manual settings:
     - Environment: Node
     - Build Command: cd web && npm ci && npm run build
     - Start Command: cd web && npm run start
     - Branch: main (or your branch)
3. In the service settings -> Environment, add the environment variables listed above. For secrets (MONGODB_URI, PRIVATE_KEY if used, GEMINI_API_KEY, JWT_SECRET, WEB3_STORAGE_TOKEN), mark them as Private/Protected so they are not exposed.
4. Choose instance plan (free is usually fine for test deployments).
5. Trigger a manual deploy or push to `main` — Render will run the build and start the service.
6. After deploy succeeds, open the provided URL and test the site.

## How to handle the two `.env` files you have

You mentioned you have two `.env` files. From this repo, it looks like:
- `contracts/.env` — used for Hardhat scripts and contains `AMOY_RPC_URL` and `PRIVATE_KEY`. Keep this local only. Do not upload to Render. Use your local environment or a CI secret for contract deployments.
- `web/.env` or local env for frontend — set the values in Render dashboard instead of committing `.env`.

If you need to run the contracts deploy automatically in CI (Render has Cron jobs and background workers), create a separate deploy job and add `PRIVATE_KEY` and `AMOY_RPC_URL` as encrypted secrets in the CI provider or use Render's background workers with protected env vars. I recommend running contract deploys locally or from GitHub Actions with secrets stored in GitHub.

## Post-deploy checks

- Verify homepage loads and API routes that require server-side secrets (upload, chat, login) return expected responses. If any route reports a missing env var, add it to Render's service environment variables and redeploy.
- Check logs (Render dashboard -> Logs) for build errors (missing dependencies, Node version mismatches). If Node version is important, add an `.nvmrc` with the Node version used locally or set the Build environment in Render to use the same Node.

## Troubleshooting tips

- Build errors referencing unsupported Node features: set Node version to 18+.
- Mongo connection errors: ensure `MONGODB_URI` is reachable from Render and includes correct user/pass and IP access rules.
- Upload API failing with API key: confirm `LIGHTHOUSE_API_KEY` or `WEB3_STORAGE_TOKEN` is set as server secret.

## Security notes

- Never commit private keys or production secrets to Git. Use Render's secret env variables feature.
- Prefer server-side API keys for uploads or chat; avoid exposing them with `NEXT_PUBLIC_` unless the key is safe to be public.

If you'd like, I can also add a small GitHub Actions workflow to build and run tests, or set up a separate Render background worker for contract deployments — tell me which you'd prefer.
