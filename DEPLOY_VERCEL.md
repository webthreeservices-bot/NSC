# Vercel deployment guide

This document explains how to deploy the `NSC` project to Vercel using UI and CLI.

1) Import your GitHub repository (UI method)
   - Go to https://vercel.com/new
   - Pick "Import Git Repository" and connect with GitHub
   - Select `webthreeservices-bot/NSC` and follow the prompts
   - Under "Build & Output Settings" use the defaults because `vercel.json` sets:
     - Framework: Next.js
     - Build Command: npm run build
     - Install Command: npm install

2) Add environment variables (Vercel > Settings > Environment Variables)
   - Required:
     - JWT_SECRET — secure random string (32+ chars)
     - JWT_REFRESH_SECRET — secure random string (32+ chars)
     - DATABASE_URL — production DB connection string
     - NEXT_PUBLIC_APP_URL — https://your-site.vercel.app
   - Optional:
     - SMTP_*, BSC_* and other keys if you need production email and blockchain.

3) Deployment
   - After connecting the repo, Vercel will create a staging deployment for the branch.
   - To deploy to Production:
     - Use `vercel --prod` with Vercel CLI
     - Or push to the default branch (main) while the project is linked to Vercel and it will auto-deploy.

4) Vercel CLI quick steps
   - Install CLI: `npm i -g vercel`
   - Login: `vercel login` (follow the browser prompt)
   - Link a project: `vercel link` (run in repo; it will prompt to choose or create a project)
   - Deploy preview: `vercel`
   - Deploy production: `vercel --prod`

5) Troubleshooting
   - If build fails on Vercel, check the build logs for errors. Common items:
     - Missing environment variables — set them in Vercel UI
     - Failing db connection: temporarily stub `DATABASE_URL` to a valid test db or set a mock value to enable build
     - If certain server-only imports run at build-time and throw, guard them similarly to how `JWT_SECRET` checks were moved to request time.
