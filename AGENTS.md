# Agent instructions (read this first)

Project rules, design and security principles live in `docs/AGENTS.md`. Read that too.

## Kane closed loop (required for every change to app behaviour)

Kane CLI verifies this app in a real browser. A coding agent working on this repo must close the loop itself:

1. After you change anything under `src/` or `supabase/`, make sure the app is running (`npm run dev`).
2. Run `npm run kane:smoke` for a quick check, or `npm run kane -- --only <IDs>` for the scenarios you touched.
3. If anything fails, read `KANE_FEEDBACK.md`. It names the scenario, the failing step and Kane's explanation, with an evidence link.
4. Decide honestly which side is wrong:
   - The app is wrong: fix the app, then re-run the same scenarios.
   - The scenario is wrong (ambiguous wording, contradicts the product rules, or too long): say so and change `kane/scenarios.json`, explaining why. Never weaken a scenario just to turn it green.
5. Repeat until the selected scenarios pass, then run `npm run kane:gate` before you push.
6. Commit `kane/reports/` so the failing and passing history stays in the repository.

Never claim a Kane scenario passed unless you ran it and saw `PASSED`. Never put test credentials in the repository: they live in `.env.kane`, which is git-ignored (see `docs/KANE.md`).
