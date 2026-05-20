---
name: db-migration
description: >
  Activates when editing files in backend/migrations/ or when generating/running Alembic
  migrations. Enforces zero-downtime PostgreSQL + TimescaleDB migration safety rules.
---

# DB Migration Conventions — JanoraScout (Alembic + PostgreSQL + TimescaleDB)

## Always run these before generating a migration
```bash
alembic check           # confirm current DB matches last migration head
alembic history         # review migration chain
```

## Generating migrations
```bash
alembic revision --autogenerate -m "add_player_jersey_color"
# ALWAYS review the generated file before applying — autogenerate misses:
# - TimescaleDB hypertable creation
# - Custom indexes
# - Column type changes that require USING clause
```

## Applying migrations
```bash
alembic upgrade head    # apply all pending
alembic upgrade +1      # apply one at a time (safer for major changes)
alembic downgrade -1    # roll back one
```

## Zero-downtime patterns (PostgreSQL)
- **Adding a nullable column**: safe, no lock. `server_default` avoids table rewrite.
- **Adding a NOT NULL column**: add nullable first → backfill → add constraint in separate migration.
- **Adding an index**: use `CREATE INDEX CONCURRENTLY` via `op.execute()`, not `op.create_index()`.
- **Renaming a column**: add new column → dual-write in app → backfill → drop old in next release.
- **Dropping a column**: remove from ORM model first → deploy → then drop in migration.

## TimescaleDB hypertable
`player_tracking` is a hypertable — never use `alembic` autogenerate for it:
```python
# in migration upgrade():
op.execute("""
    SELECT create_hypertable('player_tracking', 'time',
        if_not_exists => TRUE)
""")
```
Downgrade must drop the hypertable explicitly.

## Never
- `alembic downgrade base` in production (destroys all data)
- Run migrations against a production DB without a backup confirmed
- Merge a migration that has conflicts in the `down_revision` chain
