# Admin Pages → API Routes Mapping

This document maps all admin UI pages to their corresponding server-side API routes, expected HTTP methods, primary DB tables affected, services used, and key business logic applied in the codebase.

> Note: All admin API routes require authentication and admin role verification via `authenticateToken` + `requireAdmin` or equivalent checks. Many endpoints also use rate limits and custom middleware.

---

## Quick summary

- Admin front-end pages are implemented under `src/app/admin/*`.
- Admin API routes live at `src/app/api/admin/*`.
- Most server routes interact directly with DB via `query`, `queryOne`, or via services in `src/services/*`.
- Major services used by admin functionality: `withdrawalService`, `referralService`, `loginSecurityService`, `SessionManagementService`, `blockchainScannerService`, `paymentGatewayService`, `roiService`.

---

## Dashboard (Admin)
- Page: `src/app/admin/dashboard/page.tsx`
- API routes called: `GET /api/admin/stats`, `GET /api/admin/financial-stats` (possibly `GET /api/admin/transactions/with-blockchain` for details)
- Purpose: Overview of platform metrics, financial stats, recent activities, quick actions.
- Backend: `src/app/api/admin/stats/route.ts` and `financial-stats/route.ts`
- DB interactions: Aggregate queries across `User`, `Package`, `Withdrawal`, `Transaction`, `Earning` tables, `get_platform_statistics()` stored function.
- Services: `roiService` for ROI aggregated insights; `paymentScanner` for payment statuses.

---

## Login (Admin)
- Page: `src/app/admin/login/page.tsx`
- API: `POST /api/admin/login`
- Flow: Session creation with `SessionManagementService`, 2FA (speakeasy) checks, login attempt tracking via `LoginSecurityService`, and token creation.
- Key operations: get admin user from `User` table where `isAdmin = true`, record auth events & security logs.

---

## Users Management
- Page: `src/app/admin/users/page.tsx`
- APIs: `GET /api/admin/users`, `POST /api/admin/users/[id]/block`, `POST /api/admin/users/[id]/kyc`.
- DB tables: `User`, `Package` (joined), `AdminLog`.
- Highlights:
  - `users/route.ts` lists users, including active package stats and total invested.
  - KYC: `users/[id]/kyc/route.ts` allows admin to set `kycStatus` to `APPROVED` or `REJECTED`.
  - Block/Unblock: `users/[id]/block/route.ts` toggles `isBlocked` and `isActive`, logs admin action.
- Services: `logAdminAction` in audit-logger; rate limiter `adminLimiter`.

---

## Packages / Package Approvals
- Page: `src/app/admin/packages/page.tsx`
- APIs: `GET /api/admin/packages`, `POST /api/admin/packages/[id]/approve`
- Flow: Admin can manually approve packages created by users.
- Backend: Package approval updates `Package` status to `ACTIVE`, creates a `Transaction` of type `PACKAGE_PURCHASE`, and triggers the referral payout via `referralService.calculateReferralEarnings()`.
 - Backend: Package approval updates `Package` status to `ACTIVE`, creates a `Transaction` of type `PACKAGE_PURCHASE`, and triggers the referral payout via `referralService.calculateReferralEarnings()`.
  - After the DB inserts referral `Earning` and `Transaction` rows, the system schedules the distribution via `referralDistributionCron` or an immediate call to `referralService.distributeReferralEarningsOnChain()`.
  - The actual on-chain distribution is disabled by default. Enable with `ENABLE_ONCHAIN_DISTRIBUTION=true`.
  - Lost commissions (when upline has no bot) are recorded in `LostCommission` and a `PLATFORM_COLLECT` transaction is created in `PENDING` state to be processed by admin.
- DB interactions: `Package`, `Transaction`, `Earning` (via stored procedure), `User`.

---

## Bots / Bot Activation
- Page: `src/app/admin/bots/*` (UI pages) — `src/app/admin/bots` and `src/app/admin/bots/[id]` pages
- APIs: `GET /api/admin/bots`, `POST /api/admin/bots/[id]/approve`
- Backend: `bots/route.ts`, `bots/[id]/approve/route.ts`.
- Flow: Admin approves manual bot activations, marking them as ACTIVE and generating a `Transaction` record of type `BOT_ACTIVATION`.
- DB tables: `BotActivation`, `Transaction`, `User`, `AdminLog`.

---

## Payments
- Pages: `src/app/admin/payments` (various)
- APIs:
  - `GET /api/admin/payments/list` (list all payment requests)
  - `GET /api/admin/payments/pending` (pending admin approvals)
  - `POST /api/admin/payments/scan` (trigger payment scanner)
  - `POST /api/admin/payments/approve` (approve and send payout — use `sendUsdt`)
  - `GET /api/admin/payments/stats` (list statistics)
- Flow: Admins can re-scan blockchain logs for payments, approve payment requests (which triggers a blockchain payout), and fetch statistics.
- DB tables: `PaymentRequest`, `Transaction`, `User`.
- Services: `paymentGatewayService`, `blockchain` (sendUsdt), notifications.

---

## Withdrawals
- Page: `src/app/admin/withdrawals/page.tsx`
- APIs: `GET /api/admin/withdrawals`, `POST /api/admin/withdrawals/[id]/approve`, `POST /api/admin/withdrawals/[id]/reject`, `GET /api/admin/withdrawals/pending`
- Important: `withdrawalService.approveWithdrawal(withdrawalId, adminId)` handles the actual blockchain transfer via `sendUsdt`. This is used by both admin approvals and the auto-approval flow (where system uses 'SYSTEM_AUTO' admin id).
- DB tables: `Withdrawal`, `Transaction`, `AdminLog`.
- Auto-approval feature: controlled by `SystemSetting` keys — `AUTO_APPROVE_WITHDRAWALS`, `AUTO_APPROVE_WITHDRAWALS_MAX_AMOUNT`, `AUTO_APPROVE_WITHDRAWALS_KYC_REQUIRED`, and `WITHDRAWAL_PROCESSING_DELAY`.
- Business logic: Min withdrawal $20, cooldown 30 days, 10% fee apply (see `utils/calculations.ts`) and `canWithdraw()`.

---

## ROI Settings
- Page: `src/app/admin/roi-settings/page.tsx`
- APIs: `GET /api/admin/roi-settings`, `PUT /api/admin/roi-settings`, `PATCH /api/admin/roi-settings`.
- Purpose: Configure ROI percent per package amount. Each ROI setting row is in `RoiSettings` table with `packageAmount`, `roiPercentage`, `maxRoiPercentage`.
- Business rules: Cannot exceed `maxRoiPercentage` (validated in PUT/PATCH).

---

## System Settings
- Page: `src/app/admin/settings/page.tsx` (partially implemented)
- APIs: `GET /api/admin/system-settings`, `POST /api/admin/system-settings`
- Purpose: Read and write `SystemSetting` table; used for flags like `AUTO_APPROVE_WITHDRAWALS`, `WITHDRAWAL_PROCESSING_DELAY`, admin wallet addresses, RPC URLs and other runtime toggles.
- DB tables: `SystemSetting`, `AdminLog` (for logging changes).

---

## Transactions
- Page: `src/app/admin/transactions/page.tsx` and `blockchain-view.tsx`
- APIs: `GET /api/admin/transactions`, `GET /api/admin/transactions/with-blockchain`, `GET /api/admin/transactions/with-blockchain-cached`.
- Flow: Admins can list transactions and optionally fetch live blockchain data (with `fetchCompleteTransactionData` in `blockchain-scanner`). The cached route updates `Transaction.blockchainData` to store fetched details and reduces repeated on-chain calls.
- DB tables: `Transaction`, `User`; and uses `Transaction.blockchainData` fields.

---

## Sessions
- Page: session management UI (not always visible), e.g., `src/app/admin/sessions/*` components
- APIs: `POST /api/admin/sessions/manage` (allows revoke session/revoke all/revoke others/get sessions), `GET /api/admin/sessions/stats`, `POST /api/admin/sessions/cleanup`
- Services: `SessionManagementService` (session lifecycle), `Session` table handling.

---

## Cron Jobs (Admin Controls)
- Pages: cron & automation controls (UI entry points under admin)
- APIs: `GET /api/admin/cron/status`, `POST /api/admin/cron/roi/trigger`, `POST /api/admin/cron/expiration/trigger`
- Flow: Manually trigger ROI payout for packages and expiration processing; get cron job status via `cronManager`.
- Services: `roiPayoutCron`, `expirationCron`, `cronManager`.

---

## Compliance & Security
- Pages: `src/app/admin/compliance/*` and `src/app/admin/security/*`
- APIs: `GET /api/admin/compliance/stats`, `GET/POST /api/admin/security/login-stats`
- Use: KYC stats, cookie consent, login security metrics (LoginSecurityService), manual cleanup of old data.

---

## Wallet Addresses
- API: `GET /api/admin/wallet-address?network=BEP20|TRC20|ERC20`
- Purpose: Read admin deposit addresses for each network. Uses env vars: `ADMIN_WALLET_BSC`, `ADMIN_WALLET_TRON`, `ADMIN_WALLET_ETH`.
- Note: Admin wallet addresses are read-only for the front end.

---

## Admin Log / Audit
- DB table: `AdminLog`
- Many actions insert records into `AdminLog` to provide traces: package approvals, withdrawal approvals & rejections, KYC updates, system setting changes, etc.
- Service: `logAdminAction` abstraction in `lib/audit-logger`.

---

## Important API-Level Constraints & Security
- Admin endpoints require `authenticateToken` & `requireAdmin` or equivalent role checks.
- Rate limiting applied to sensitive admin routes: `adminLimiter`.
- Logging and auditing enforced with `AdminLog` and event recording.
- 2FA verification is required for admin login flows if enabled.

---

## Admin environment variables & SystemSetting keys
- Env variables commonly referenced:
  - `ADMIN_WALLET_BSC` - Deposit/receiving address for BEP20/USDT (BSC)
  - `ADMIN_WALLET_TRON` - Deposit/receiving address for TRC20/USDT (Tron)
  - `ADMIN_WALLET_ETH` - Deposit/receiving address for ERC20/USDT (Ethereum)
  - `ADMIN_PRIVATE_KEY_BSC` / `ADMIN_PRIVATE_KEY_TRON` - Private keys used to send blockchain payouts (keep secure)
  - `USDT_CONTRACT_BSC`, `USDT_CONTRACT_TRON` - USDT contract addresses used for QR generation and verification
  - RPC URLs / providers: `BSC_RPC_URL`, `TRON_RPC_URL`, et al.

- SystemSetting keys read by admin flows & features:
  - `AUTO_APPROVE_WITHDRAWALS` - When `true` the system may auto-approve withdrawals (per-stored rules)
  - `AUTO_APPROVE_WITHDRAWALS_MAX_AMOUNT` - Maximum amount eligible for auto-approval (0 = unlimited)
  - `AUTO_APPROVE_WITHDRAWALS_KYC_REQUIRED` - If `true`, only users with `KYC=APPROVED` are auto-approved
  - `WITHDRAWAL_PROCESSING_DELAY` - Time in minutes to delay auto-approval processing
  - Admin addresses are sometimes exposed via `NEXT_PUBLIC_*` env vars for client UI templates (be mindful of the split between private/public envs)

> Tip: `src/scripts/production-checklist.ts` verifies presence of some of these env vars during deployment validation. Ensure private keys are stored securely (e.g., in secrets manager), and public admin wallets are used for UI-only references.

---

## Key Services Called from Admin Routes
- `withdrawalService.approveWithdrawal` — sends blockchain USDT payout via `sendUsdt` and handles DB updates.
- `referralService.calculateReferralEarnings` — calls DB functions to compute referral earnings and creates `Earning` rows.
- `sessionManagementService` — manage sessions & create session tokens.
- `blockchainScanner` — verify deposits and fetch transactions from blockchain explorers.
- `paymentGatewayService` — create & maintain payment request lifecycles.

---

## DB Tables Frequently Touched by Admin Actions
- `User`, `Package`, `BotActivation`, `PaymentRequest`, `Withdrawal`, `Transaction`, `Earning`, `SystemSetting`, `AdminLog`, `RoiSettings`.

---

## Observations & Recommendations
1. ✅ Audit logging is largely implemented; ensure `AdminLog` is used consistently across all newly added admin routes.
2. ⚠️ Auto-approve withdrawal logic relies on `SystemSetting` keys; double-check these settings exist and are defaulted properly in DB migrations.
3. ✅ Referral payout is implemented at the database level via `calculate_referral_earnings` and JS wrapper `referralService.calculateReferralEarnings`. The JS constants were updated to set level 2 to 0.75%.
4. ⚠️ Confirm consistency of `Referral percentage` across marketing copy & UI; update any marketing text still saying 1.0% for level 2.
5. ⚙️ Consider adding an admin-only endpoint to recalculate historical referral `Earning` records if a business decision requires retroactive updates.
6. 🔧 Add conversion safety and explicit currency handling to protect from floating-point inconsistencies in JS/DB.

---

## Next steps (actionable)
1. Apply final verification across all admin pages to ensure routing & services are consistent with the mapping above. (I found all routes & pages and documented mapping in this file.)
2. Confirm `SystemSetting` default values (e.g., `AUTO_APPROVE_WITHDRAWALS`, `WITHDRAWAL_PROCESSING_DELAY`) in `database-schema/` and `seed` files.
3. If needed, create a safe migration to retroactively adjust referral `Earning` records and provide a script for audit logging before/after the recalculation.
4. Update UI copy/marketing pages referencing referral % values to reflect the 0.75% Level 2 if necessary.

---

If you'd like, I can:
- Generate a matching API documentation page (OpenAPI style) for these admin APIs.
- Add a check/CI linter rule to validate admin routes log to `AdminLog` on state changes.
- Create SQL migration + optional recalculation script for the referral change (non-retroactive or retroactive options).

