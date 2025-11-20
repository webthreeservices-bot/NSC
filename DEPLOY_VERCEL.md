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
  - Deploy production: `vercel --prod -SkipLocalBuild`

5) Troubleshooting
   - If build fails on Vercel, check the build logs for errors. Common items:
     - Missing environment variables — set them in Vercel UI
     - Failing db connection: temporarily stub `DATABASE_URL` to a valid test db or set a mock value to enable build
     - If certain server-only imports run at build-time and throw, guard them similarly to how `JWT_SECRET` checks were moved to request time.
  - If you'd like the script to build locally, omit the `-SkipLocalBuild` switch. On machines with limited RAM or on Windows you may get an error like:

    ⨯ Next.js build worker exited with code: 3221226505

  This is often caused by insufficient memory for Next's build worker threads (VirtualAlloc failed). If you need to build locally, try one of the following:

  - Increase Node's memory limit in the build command (in `package.json`):
    ```pwsh
    # set 4GB of memory
    cross-env NODE_OPTIONS='--no-warnings --max-old-space-size=4096' UV_THREADPOOL_SIZE=4 next build
    ```
  - Lower worker usage: set fewer threads (useful on Windows):
    ```pwsh
    $env:NODE_OPTIONS='--max-old-space-size=4096'
    $env:NEXT_BUILD_THREADS=1 # or another appropriate variable depending on Next/Turbopack versions
    npm run build
    ```
  - Or, skip local build and deploy via Vercel remote build using `-SkipLocalBuild`.
