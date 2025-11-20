# Netlify Deployment Guide

This document explains steps to push your repo to GitHub and deploy to Netlify.

1. Create a GitHub repo
   - Option A (recommended - uses GH CLI):
     ```pwsh
     gh auth login
     gh repo create NSC --public --source . --remote origin --push
     ```

   - Option B (manual):
     1. Visit https://github.com/new and create a new repository named `NSC`.
     2. In your repo root run:
     ```pwsh
     git remote add origin https://github.com/<your-username>/NSC.git
     git branch -M main
     git push -u origin main
     ```

2. Add production environment variables to Netlify (Settings > Build & deploy > Environment):
   - Required (add at minimum):
     - DATABASE_URL
     - JWT_SECRET (32+ chars random string)
     - JWT_REFRESH_SECRET (32+ chars random string)
     - NEXT_PUBLIC_APP_URL (https://your-site.netlify.app)
     - SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM (optional but recommended)
     - BSC_RPC_URL, ADMIN_WALLET_BSC, ADMIN_PRIVATE_KEY_BSC (if blockchain features used)

3. Clear Netlify cache & deploy
   - In Netlify > Site > Deploys > Trigger deploy > Clear cache and deploy

4. Troubleshooting
   - If Netlify fails at dependency install, set env var NPM_FLAGS to `--loglevel verbose` to see full npm logs.
   - If peer dependency issues persist temporarily, use `--legacy-peer-deps` as a short-term workaround (not recommended long-term).

5. Additional: Netlify CLI
   - To deploy using the Netlify CLI:
     ```pwsh
     npm i -g netlify-cli
     netlify login
     netlify init  # connect site
     netlify deploy --prod
     ```

6. Security
   - Do not commit `.env` files. They are ignored via `.gitignore`.
   - Always generate secure JWT secrets with at least 32 characters; do not use defaults in production.
