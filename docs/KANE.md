# Kane closed loop

GidaLink Trust is built with a coding agent and verified by Kane CLI in a real browser.
Kane's result is written back to files the agent reads, so a failing flow turns into a fix.

```
 agent changes code ──> npm run kane:smoke ──> Kane drives Chrome against the running app
        ^                                              |
        |                                              v
 agent reads KANE_FEEDBACK.md  <──  kane/reports/latest.json  (+ in-app "Kane quality" page)
        |
        └── git push is blocked by the pre-push hook until `npm run kane:gate` passes
```

## One-time setup

1. Install Chrome and Kane CLI, then log in once:
   ```bash
   npm install -g @testmuai/kane-cli
   kane-cli --tui        # then type /login, and /balance to check credits
   ```
2. Apply both Supabase migrations in order (SQL Editor):
   `supabase/migrations/20261119000000_initial_schema.sql`, then `20261122000000_trust_engine.sql`,
   then `20261123000000_policy_hardening.sql` (removes any leftover public read policy on the listings table).
3. In Supabase Authentication settings, turn **off** "Confirm email" for the test project
   (scenario K02 registers a throwaway account and expects an immediate session).
4. Create four test users in Authentication > Users > Add user (tick "Auto Confirm User"), for example
   `kane-buyer@example.com`, `kane-landlord@example.com`, `kane-verifier@example.com`, `kane-admin@example.com`.
   Then run `supabase/seed/01_test_roles.sql` in the SQL Editor (edit the emails at the top if yours differ).
   The buyer keeps the default role. Using the SQL Editor is the controlled admin process for verifier and admin access;
   the app never self-assigns those roles.
   Create a real landlord signup if you prefer, but the seed expects an account with the landlord or agent role.
   Optional: run `supabase/seed/02_demo_listings.sql` to add 6 verified and 2 pending demo listings
   (clearly labelled as seeded demo data, not real reviews). Remove them later with `99_remove_demo_listings.sql`.
5. Put the test credentials in `.env.kane` (git-ignored):
   ```bash
   cp kane/env.example .env.kane
   ```
6. Install the pre-push gate: `npm run kane:hooks`

## Daily loop

```bash
npm run dev            # terminal 1
npm run kane:smoke     # terminal 2: K01, K03, K07 (fast, a few credits)
npm run kane           # everything: K01 to K10
npm run kane -- --only K04,K07 --headless
```

If anything fails, `KANE_FEEDBACK.md` lists the scenario, the failing step and the evidence link.
Tell your coding agent: "Read KANE_FEEDBACK.md, fix the app, and re-run Kane until it passes."
The same prompt is available from the **Kane quality** page in the dashboard (verifier and admin accounts).

## Scenarios

| ID | What Kane proves |
| --- | --- |
| K01 | Public discovery, filters and the detail dialog disclaimer |
| K02 | A new buyer can register and lands on the dashboard |
| K03 | Protected routes redirect, sessions survive reload, sign out works |
| K04 | A landlord creates a draft; the trust engine refuses submission without photos and evidence |
| K05 | The listing form rejects empty and invalid input |
| K06 | The verifier queue and the rule that a rejection needs a reason |
| K07 | A buyer cannot reach landlord, verifier or admin pages |
| K08 | A landlord cannot reach verifier or admin pages |
| K09 | Sample listings cannot receive inspections or reports |
| K10 | The admin console shows users and the audit log |

Scenarios are plain English in `kane/scenarios.json`. Each ends in a check of the result, as Kane's docs recommend.

## Rules for honest results

- A scenario that Kane did not run is never reported as passed.
- Passwords are passed to Kane as secret variables and redacted from every file the runner writes.
- `KANE_SKIP=1 git push` bypasses the gate and prints that the push is unverified.
- Never point the scenarios at production data or real users.

## Database tests

`sh supabase/tests/run.sh` starts a throwaway Postgres in Docker, applies both migrations and checks 58 trust rules
(role self-assignment, status changes, address privacy, review rules, inspections, reports, admin actions, audit log).
Run it after any change to the migrations.
