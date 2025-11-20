If `pg_dump` is not found in PATH, use the helper script to detect and add the Postgres bin to your PATH:

```powershell
.\add_postgres_to_path.ps1
# or to add it to the user PATH persistently (you will need a new shell session to pick up the change):
.\add_postgres_to_path.ps1 -Persist
```
If `pg_dump` is not installed, the script will print the `pg_dump` command you should run once you install the Postgres client.

If you need help running the commands or want me to attempt the export from here and you permit installing the Postgres client on this environment, reply with confirmation.

⚠️ Note: If you plan to rebuild the schema from migrations, the repo currently lacks `database-schema` SQL files and some JS migration modules referenced by `migrate.js`.
- `migrate-simple.js` expects `database-schema/01_enums.sql`, `02_core_tables.sql`, ..., `09_indexes_optimization.sql` — which are not present in this repo. Instead, `scripts/sql-sanitized-changes.patch` contains the full schema content; you can extract the SQL files from that patch or use the `live_neon_db.sql` generated above to populate `database-schema`.
- `database-migration/migrations/index.js` references JS migration modules (e.g., `02-core-tables.js`) that are not currently present; you can:
	1. Create JS migration wrappers that import the file contents from `database-schema`, or
	2. Use `migrate-simple.js` to execute raw SQL files if you populate `database-schema`.

If you'd like, I can:
 - Create the `database-schema/*.sql` files from `scripts/sql-sanitized-changes.patch` for you, and/or
 - Create the missing `migrations/*.js` wrappers so `migrate.js` becomes runnable.
# Export Neon DB Schema (live_neon_db.sql)

This folder contains a PowerShell helper script to export the full database schema (including enums, types, functions, views, and table definitions) from a Neon Postgres database.

Prerequisites
- `pg_dump` (Postgres client utilities) must be available in your PATH.
- Access to the Neon DB (the connection string is typically stored in `.env` as `DATABASE_URL`).

Quick run (PowerShell)

1. Load credentials or ensure `DATABASE_URL` is present in a `.env` file in this folder (or in the repo root).
2. Run:

```powershell
# From the `database-migration` folder
.\export_live_neon_db.ps1
```

This will attempt to run pg_dump using the `DATABASE_URL` env var and output `live_neon_db.sql` (schema-only).

If you prefer to run `pg_dump` manually, use this exact command (PowerShell quoting):

```powershell
$env:DATABASE_URL = 'postgresql://username:password@host:port/dbname?sslmode=require'
pg_dump --schema-only --no-owner --no-privileges "$env:DATABASE_URL" -f "live_neon_db.sql"
```

Notes
- `--schema-only` ensures the output is DDL only — tables, columns, constraints, enums, types, functions — no data.
- `--no-owner` and `--no-privileges` avoid including role ownership and grant statements.
- If `pg_dump` is not installed, the script will print the `pg_dump` command you should run once you install the Postgres client.

Alternative fallback (if you only need enums):

If you can't use `pg_dump`, but you have `psql`, you can get only enums using:

```powershell
# Set DB URL
$env:DATABASE_URL = 'postgresql://username:password@host:port/dbname?sslmode=require'

# Run query to generate CREATE TYPE statements for enums
psql "$env:DATABASE_URL" -t -c "\
SELECT 'CREATE TYPE ' || quote_ident(n.nspname) || '.' || quote_ident(t.typname) || ' AS ENUM (' || string_agg(quote_literal(e.enumlabel), ', ' ORDER BY e.enumsortorder) || ');' as ddl \
FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid JOIN pg_namespace n ON n.oid = t.typnamespace GROUP BY n.nspname, t.typname ORDER BY n.nspname, t.typname;\" -o live_neon_db_enum_only.sql
```

This will produce a file containing only enum DDL statements.

If you need help running the commands or want me to attempt the export from here and you permit installing the Postgres client on this environment, reply with confirmation.
