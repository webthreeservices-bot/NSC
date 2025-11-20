# Migration Runner (run-migrations.js)

This file documents usage and recommended safety checks for running database migrations in `src/scripts/run-migrations.js`.

## Overview

- The migration runner applies SQL files found in `database-schema/` in numerical order.
- Supports computed splitting/ sanitization of SQL files and handling of dollar-quoted blocks.
- Per-statement savepoints are used to avoid cascading transaction aborts.
- Tracks per-file status via `public.MigrationLog` (unless run with `--dry-run`).
- Detects and stages view replacements that would drop columns to avoid destructive schema changes.

## CLI Flags

- `--dry-run` / `-n`: Parse and run statements in a transaction, then ROLLBACK so DB is not changed. Useful for CI checks and pre-flight.
- `--force` / `-f`: Force re-application/overrides of files marked as `success` in `MigrationLog` (useful for manual re-run).
- `--reapply` / `-r`: Re-apply files that are `partial` or `failed` in `MigrationLog`.
- `--apply-staged` / `-s`: Apply staged views (created when a replaced view would drop columns). Requires a careful (or forced) invocation as it may make destructive changes.
- `--fail-fast` / `-F`: Stop the migration at the first statement failure (writes `migration-failures.json` and exits). Useful when trying to identify a root cause without a long chain of `25P02`-style errors.

## Idempotence

- Duplicate keys, duplicate tables/columns errors are recognized and skipped as benign idempotent errors.
- The script stores a SHA256 hash of sanitized SQL for each file in `MigrationLog.details.hash` to recognize content changes.

## View handling

- `CREATE OR REPLACE VIEW` statements are handled carefully:
  - A temporary view is created to compute new columns.
  - If the new view removes columns present in the existing view, the new view is staged (renamed to `_<view>__staged__<timestamp>`) and logged for manual review.
  - Optionally, staged views can be applied via `--apply-staged`, which attempts to swap the staged view into place after backing up the existing view.

## CI Integration

- A sample GitHub Actions workflow `src/.github/workflows/migration-dry-run.yml` runs `npm run db:migrate:dry-run` for all PRs to ensure no parsing or SQL errors.

## Output

- `migration-failures.json` lists statement-level failures and errors to review.
- A summary of staged views is printed at the end of the run.
- `MigrationLog` table is consulted and updated to track per-file status (not in dry-run).
- `npm run db:parse-failures` provides a quick summary of the latest `migration-failures.json` and highlights the earliest non-25P02 error.

## Safety

- Always run `--dry-run` first.
- When applying staged views, prefer manual review unless `--force` is intended and a backup/rollback plan exists.

## Non-transactional statements (CONCURRENTLY)

- Some SQL statements cannot be executed inside a transaction block (e.g., `REFRESH MATERIALIZED VIEW CONCURRENTLY`, `CREATE INDEX CONCURRENTLY`).
- The migration runner will **skip these statements in `--dry-run`** and log them in `migration-failures.json` as skipped for manual review.
- When running for real (non-dry-run), the runner will commit the current transaction, execute the non-transactional statement, and then begin a new transaction so subsequent statements remain transactional.
- This ensures statements that must run outside transactions are handled safely while still allowing a mostly transactional migration flow.

## Example usage

```bash
# Dry-run:
node ./src/scripts/run-migrations.js --dry-run

# Apply migrations (non-dry-run):
node ./src/scripts/run-migrations.js

# Reapply failed/partial files only:
node ./src/scripts/run-migrations.js --reapply

# Force reapply even successful files:
node ./src/scripts/run-migrations.js --force

# Apply staged views on approve (careful):
node ./src/scripts/run-migrations.js --apply-staged --force
```

## Apply staged views helper

- Use `node ./src/scripts/apply-staged-views.js --preview` to list staged views and inspect column differences.
- Use `node ./src/scripts/apply-staged-views.js --apply` to perform the rename swap for staged views. Use `--force` to apply even if it will drop columns from the original view.
- You can run via npm script: `npm run db:apply-staged -- --apply --force`.
