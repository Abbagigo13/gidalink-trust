# Demo video guide (target 4:15, hard limit 5:00)

Judges score four things equally: it ships, Kane caught or proved something, Kane's result fed back to the agent, and craft. Every minute of the video should serve one of those. Spend about 40% on the app and 60% on the Kane loop.

## 1. Prepare (45 minutes, do this before you press record)

**Recorder.** OBS Studio (free) at 1920x1080, 30 fps, MP4 output, microphone on. Do a 10-second test and play it back to check the sound.

**Clean screen.**
- Turn on Do Not Disturb so no notifications pop up.
- Close every tab except the ones you need. Hide bookmarks.
- Zoom Chrome to 110% and raise the VS Code font size so a phone screen can read it.
- NEVER show these on camera: `.env`, `.env.kane`, the Supabase API keys page, GitHub token pages, your judge passwords, or terminal history that contains tokens. Close those files and tabs first.

**Windows to line up.**
1. Chrome window A (normal): the live site, signed out.
2. Chrome window B (Incognito): for the verifier, so you do not have to sign out of window A. Sign in as verifier here, but only AFTER the landlord submits.
3. VS Code with two terminals: terminal 1 runs `npm run dev`, terminal 2 is for Kane commands. Keep `kane/scenarios.json`, `KANE_FEEDBACK.md`, `AGENTS.md` and `src/dashboard/DashboardLayout.tsx` open in tabs.
4. Local app at http://localhost:5173 for the "Kane quality" page (that page needs the local report files).

**Files and data.**
- Put a sample photo (`house.jpg`) and a sample PDF (`sample-document.pdf`) on your Desktop. Use harmless fake content, never a real title document.
- In the Supabase SQL Editor, remove old test drafts: `delete from public.properties where title = 'Kane test flat in Gwarinpa';`
- Confirm the landlord, verifier and admin accounts sign in.
- Do one full dry run without recording. The second take is always better.

**Kane run time.** A single scenario takes a minute or more. Do not make viewers wait. Either say "sped up" and cut, or start the run, talk over it for 15 seconds, then cut to the finished result. Run K03 only on camera (see section 3).

## 2. Shot list with narration

Say it in your own words. These lines are a floor, not a script to read.

| Time | On screen | Say |
| --- | --- | --- |
| 0:00-0:25 | Live site home page | "Fake listings cost Nigerians real money. GidaLink Trust only calls a listing verified after a reviewer has seen the owner's evidence. I built it with a coding agent and checked it with Kane CLI in a real browser." |
| 0:25-1:10 | Sign in as landlord. My listings, New listing. Fill the form. Click Submit for review with nothing uploaded | "A landlord creates a draft. If I try to submit without photos or documents, the database itself refuses." (Show the error message.) |
| 1:10-1:35 | Upload `house.jpg` and `sample-document.pdf`, submit | "With evidence attached, it moves to Pending review and the owner can no longer edit it." |
| 1:35-2:15 | Incognito window B: sign in as verifier, Verification queue, open the listing, open the document, try Reject with no reason, then Approve | "The verifier opens the private document. Rejecting needs a written reason and an owner can't review their own listing." |
| 2:15-2:30 | Back on the home page, the listing shows as Verified. Then Admin, Audit log | "Every decision is in the audit log." |
| 2:30-3:00 | VS Code: `kane/scenarios.json`, then terminal: `npm run kane:smoke` | "The tests are plain English. Kane runs each one in a real Chrome." (Let Chrome open, then cut to the result.) |
| 3:00-3:45 | The replayed failure (section 3), then `KANE_FEEDBACK.md` | "Kane found a real bug: signing out sent people to the login page. Here is its feedback with the failing step. I give that to the agent, it fixes the app, and Kane re-runs." |
| 3:45-4:05 | The fix in `DashboardLayout.tsx`, then K03 passing | "The agent fixed a race between the route guard and navigation. Kane confirms it." |
| 4:05-4:20 | Local Kane quality page, Run history. Then `AGENTS.md` | "The run history stays in the repo. `AGENTS.md` tells any local agent to run Kane and read the feedback by itself." |
| 4:20-4:35 | Terminal: `git push` blocked by the hook, then allowed (optional) | "A pre-push hook blocks pushes that Kane has not passed." |
| 4:35-4:50 | Home page, URL and repo link on screen | "GidaLink Trust: find your place, know what you trust." |

If you run long, cut the audit log, the push hook and the second half of the verifier shot first. Never cut the Kane failure and fix.

## 3. Replay the real failure on camera

The sign-out bug was real and is in git history. Say so on camera so nobody thinks it is staged.

```powershell
git checkout cd8a665 -- src/dashboard/DashboardLayout.tsx    # old sign-out code (has the bug)
npm run kane -- --only K03                                    # Kane reports FAILED
# open KANE_FEEDBACK.md and show it, then restore the fix:
git checkout HEAD -- src/dashboard/DashboardLayout.tsx
npm run kane -- --only K03                                    # Kane reports PASSED
```

Notes:
- `npm run dev` must be running in the other terminal for both runs.
- Do a dry run first. If the first run unexpectedly passes, the old file did not restore. Run `git status` and check that `DashboardLayout.tsx` shows as modified.
- Afterwards run `git checkout HEAD -- src/dashboard/DashboardLayout.tsx` and `git status` to make sure the repo is clean. Do NOT commit the buggy file.
- Say what is true: "In the build, Kane's feedback went to the coding agent and it fixed the app. The repo now also has an AGENTS.md so a local agent can do this alone."

## 4. Recording tips

- Talk slightly slower than feels natural. Short sentences. Do not read from the screen.
- Move the mouse deliberately and pause on the thing you are describing.
- If you make a mistake, pause, then repeat the sentence. You can trim the pause out.
- Free editors: Clipchamp (Windows) or CapCut. Only trim, cut dead time and speed up Kane waits. No effects are needed.
- Add short on-screen captions for the three scores if you like: "Ships", "Verified by Kane", "Closed loop".

## 5. Upload to YouTube

1. YouTube Studio, Create, Upload video. Title: `GidaLink Trust: a property marketplace verified with Kane CLI (KaneCLI Hackathon)`.
2. Description: one-sentence summary, then the repo link, the live site link and the timestamps from the shot list. Add `#KaneCLIHackDay`.
3. Audience: "No, it's not made for kids". Visibility: **Public** is the safest. Unlisted also works for anyone with the link, but check the submission form wording and choose Public if unsure.
4. Wait for HD processing, then open the link in a private window to confirm it plays without being signed in.
5. Put the link in the form and in your launch posts.

## 6. Final check before you submit

- [ ] Length is between 3 and 5 minutes
- [ ] Nobody can read a key, token, password or the `.env` file anywhere in the video
- [ ] The Kane failure, the feedback file, the fix and the passing re-run are all visible
- [ ] The link plays in a private window
- [ ] Repo is public and `kane/reports/` is committed
