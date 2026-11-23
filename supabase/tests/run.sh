#!/bin/sh
# Verifies the migrations and every trust rule against a throwaway local Postgres (needs Docker).
# Usage: sh supabase/tests/run.sh
set -e
cd "$(dirname "$0")/.."
docker rm -f gidalink-pgtest >/dev/null 2>&1 || true
docker run -d --name gidalink-pgtest -e POSTGRES_PASSWORD=postgres postgres:18-alpine >/dev/null
until docker exec gidalink-pgtest pg_isready -U postgres -q 2>/dev/null; do sleep 1; done
sleep 2
psql_run() { docker exec -i gidalink-pgtest psql -U postgres -v ON_ERROR_STOP=1 -q "$@"; }
psql_run < tests/00_supabase_stubs.sql
psql_run < migrations/20261119000000_initial_schema.sql >/dev/null 2>&1
psql_run < migrations/20261122000000_trust_engine.sql >/dev/null 2>&1
docker exec -i gidalink-pgtest psql -U postgres -q -o /dev/null < tests/10_trust_engine_test.sql >/dev/null 2>&1 || true
docker exec gidalink-pgtest psql -U postgres -P pager=off \
  -c "select name, detail from t_results where not ok order by name" \
  -c "select count(*) filter (where ok) as passed, count(*) filter (where not ok) as failed from t_results"
docker rm -f gidalink-pgtest >/dev/null
