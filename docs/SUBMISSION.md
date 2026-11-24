# Hackathon submission kit (KaneCLI Online Hackathon)

Deadline: 11:59 PM IST, Thursday 26 November. Submit on the 25th. Replace every [bracket] before publishing.

## 1. Form answers

**GitHub URL:** https://github.com/Abbagigo13/gidalink-trust (make it public; first commit is 22 Nov)

**About your app (paste):**
GidaLink Trust is a Nigerian property marketplace where a listing is only shown as verified after a human reviewer has seen the owner's evidence. Landlords and agents create listings, upload photos and private ownership documents, and submit for review. Verifiers approve or reject with written reasons. Buyers request inspections and report suspicious listings, and admins moderate, suspend and read an audit log. Status changes happen only through database functions, so an owner cannot verify their own listing, and the street address is hidden until an inspection is accepted.

**Which agent:** Arc Studio coding agent (it wrote the app, migrations and tests). I reviewed the security decisions and ran the Kane scenarios on my own machine.

**What Kane does:** Kane CLI drives a real Chrome browser through 11 plain-English scenarios (public discovery, registration, login and logout, listing creation, validation, the verifier queue, and role permissions for buyer, landlord and admin). `npm run kane` writes the results to `kane/reports/` and a `KANE_FEEDBACK.md` file that the coding agent reads to fix failures. A pre-push hook (`npm run kane:gate`) blocks a push until the smoke scenarios pass, and a "Kane quality" page in the dashboard shows the latest run and a copy-ready fix prompt.

**What Kane caught (true to the commit history):**
1. Sign-out sent users to the login page instead of the home page (a race between the route guard and navigation). Found by K03, fixed in `3418f48`, confirmed in `dbdf774`.
2. Right after sign-in, the app could flash a "could not load your profile" error while the profile was still loading. Found by K07, fixed in `34a7861`, all 11 scenarios passing afterwards.
3. Two of my own scenarios were badly worded (one contradicted itself, one was too long). Kane's feedback made that obvious, and I rewrote them. These were not app bugs.

**Live URL:** [optional: your deployed link]

**Demo video:** [YouTube link]

**Launch posts:** [link 1], [link 2]

## 2. Demo video script (about 4:30)

| Time | Show | Say |
| --- | --- | --- |
| 0:00 | Landing page | Fake listings and unverified agents cost Nigerians real money. GidaLink only calls a listing verified after a reviewer has seen the evidence. |
| 0:30 | Sign in as landlord, My listings, New listing | Landlords create a draft. Submit without photos or documents and the database refuses. |
| 1:00 | Upload a photo and a document, submit | The listing moves to Pending review and can no longer be edited. |
| 1:25 | Sign in as verifier, Verification queue | The verifier opens the private evidence. Rejecting needs a reason. The owner can't review their own listing. |
| 1:55 | Admin: Users and Audit log | Every decision is recorded. |
| 2:15 | Terminal: `kane/scenarios.json`, then `npm run kane:smoke` | The tests are plain English. Kane runs them in a real browser. |
| 2:45 | Show the failure (see section 3), then `KANE_FEEDBACK.md` | Kane found a real bug and tells the agent which step failed and why. |
| 3:15 | The fix commit, then the re-run passing | The agent fixes the app, Kane confirms it. |
| 3:40 | Dashboard, Kane quality page, Run history | Failing runs and passing runs are kept as evidence. |
| 4:00 | `git push` blocked by the hook, then allowed | The loop is enforced, not optional. |
| 4:20 | Landing page | GidaLink: find your place, know what you trust. |

## 3. Reproduce a real failing-then-passing run on camera

The sign-out bug is in git history, so you can bring it back for the demo and fix it again:

```powershell
git checkout cd8a665 -- src/dashboard/DashboardLayout.tsx   # old sign-out code with the bug
npm run kane -- --only K03                                   # expect FAILED
git checkout HEAD -- src/dashboard/DashboardLayout.tsx       # the fix
npm run kane -- --only K03                                   # expect PASSED
```

Say clearly on camera that the bug was real and was found earlier in the build, and that you are replaying it from history.

## 4. Launch post drafts (edit in your own voice; publish at least two on different sites)

**X / Twitter (thread)**
1. In Nigeria a fake property listing can cost someone their savings. I built GidaLink Trust for the @TestMuAI KaneCLI hackathon: a marketplace where "verified" has to be earned with evidence. [repo link]
2. Landlords upload photos and private documents. A verifier reviews them, can only reject with a written reason, and can't review their own listing. The address stays hidden until an inspection is accepted.
3. The part I like most: Kane CLI tests it in a real browser. It caught a sign-out bug and a profile-loading race that I would have shipped. Its feedback goes straight back to the coding agent.
4. 11 plain-English scenarios, all passing, a pre-push hook that blocks unverified pushes, and the full run history in the repo. Demo: [video link] #KaneCLIHackDay

**LinkedIn**
I built GidaLink Trust, a Nigerian property marketplace where listings are only called verified after a reviewer has seen the evidence, for the KaneCLI Online Hackathon.

What made it interesting was the build loop: a coding agent writes the code, Kane CLI checks it in a real browser, and the failures are written to a file the agent reads. Kane found two real bugs (a sign-out redirect race and a profile-loading race) and showed me two scenarios I had worded badly. Everything is in the commit history.

Repo: [link] | Demo: [video link]

**Hacker News**
Title: Show HN: GidaLink Trust – a property marketplace where "verified" needs evidence, tested with Kane CLI
Text: A Nigerian property marketplace built around a review workflow: owners upload evidence, a verifier approves or rejects with a reason, and status changes can only happen through database functions (so owners can't verify themselves). The test loop uses Kane CLI in a real browser, with failures written to a file for the coding agent to fix and a pre-push gate. Repo and run history: [link]. Honest limits: the verified badge records that evidence was reviewed, not legal ownership, and the demo listings are seeded sample data.

**Reddit (r/webdev or r/nigeria, check each subreddit's self-promotion rules first)**
I built a property marketplace for Nigeria where listings only get a "verified" badge after a human reviews the owner's documents. I also wanted the tests to run in a real browser, so I used Kane CLI with plain-English scenarios. It caught two real bugs. Repo: [link]. Feedback welcome, especially on the review workflow.

## 5. Final checklist

- [ ] `git add kane/reports`, commit and push the all-passing run
- [ ] `npm run kane:hooks` (installs the push gate)
- [ ] Repo set to public; revoke the sandbox GitHub token
- [ ] Remove the seeded demo listings if you do not want them in the demo (`supabase/seed/99_remove_demo_listings.sql`)
- [ ] Record, upload and test the YouTube video link
- [ ] Publish two or more posts and paste the links into the form
- [ ] Submit before the deadline
