import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./info.css";

const REPO = "https://github.com/Abbagigo13/gidalink-trust";

const toc = [
  ["overview", "Overview"],
  ["lifecycle", "Property lifecycle"],
  ["roles", "Roles and permissions"],
  ["privacy", "Privacy and security"],
  ["inspections", "Inspections"],
  ["reports", "Reports and moderation"],
  ["quality", "How we test it"],
  ["samples", "Sample data"],
  ["limits", "What verified is not"],
  ["faq", "FAQ"],
  ["reference", "Technical reference"],
] as const;

export default function DocsPage() {
  useEffect(() => {
    document.title = "Documentation | GidaLink Trust";
  }, []);

  return (
    <div className="docs-page" data-testid="docs-page">
      <header className="docs-top">
        <Link to="/" className="docs-brand">
          <span className="brand-symbol">G.</span>
          <span>
            gidalink<span className="brand-light">trust</span>
          </span>
        </Link>
        <nav aria-label="Documentation">
          <Link to="/" className="hide-sm">
            <ArrowLeft size={14} style={{ verticalAlign: "-2px" }} /> Back to properties
          </Link>
          <Link to="/auth" className="primary-button" style={{ padding: "10px 18px" }}>
            Sign in
          </Link>
        </nav>
      </header>

      <div className="docs-hero">
        <div className="section-kicker">DOCUMENTATION</div>
        <h1>
          How GidaLink Trust <em>earns trust.</em>
        </h1>
        <p>
          A plain-language guide to how listings are reviewed, who can do what,
          how your data is protected, and how we prove the platform works as
          described.
        </p>
      </div>

      <div className="docs-layout">
        <nav className="docs-toc" aria-label="On this page">
          {toc.map(([id, label]) => (
            <a href={`#${id}`} key={id}>
              {label}
            </a>
          ))}
        </nav>

        <article className="docs-body">
          <section id="overview">
            <h2>Overview</h2>
            <p>
              GidaLink Trust is a Nigerian property marketplace for renting,
              buying and finding land. Anyone can browse. What makes it
              different is that every listing follows a visible review process,
              so you can tell a property that has been checked from one that is
              still waiting.
            </p>
            <p>The problems it targets:</p>
            <ul>
              <li>Fake listings and misleading photographs.</li>
              <li>Agents advertising properties they do not represent.</li>
              <li>The same property listed by several agents at different prices.</li>
              <li>Having no way to see whether a listing was ever checked.</li>
            </ul>
            <div className="docs-callout">
              <p>
                <strong>The short version:</strong> owners submit evidence, a
                reviewer decides, the status is public, and every decision is
                recorded.
              </p>
            </div>
          </section>

          <section id="lifecycle">
            <h2>Property lifecycle</h2>
            <p>Every listing moves through the same five statuses.</p>
            <div className="docs-table-wrap">
              <table className="docs-table">
                <thead>
                  <tr><th>Status</th><th>Who sees it</th><th>What happens next</th></tr>
                </thead>
                <tbody>
                  <tr><td><strong>Draft</strong></td><td>Only the owner</td><td>The owner adds details, photos and evidence, then submits. A draft can be edited or deleted.</td></tr>
                  <tr><td><strong>Pending review</strong></td><td>Everyone, clearly labelled</td><td>A verifier reviews it. The owner can withdraw it back to a draft but cannot edit it while it is under review.</td></tr>
                  <tr><td><strong>Verified</strong></td><td>Everyone</td><td>Stays live. An admin can suspend it if a report is upheld.</td></tr>
                  <tr><td><strong>Rejected</strong></td><td>The owner and staff</td><td>The owner reads the reviewer's reason, fixes the listing, adds new evidence and resubmits.</td></tr>
                  <tr><td><strong>Suspended</strong></td><td>The owner and staff</td><td>An admin can reinstate it, which sends it back to review.</td></tr>
                </tbody>
              </table>
            </div>
            <h3>Submission rules</h3>
            <ul>
              <li>At least one photograph is required (JPG, PNG or WebP, up to 5 MB each, eight at most).</li>
              <li>At least one supporting document is required (PDF, JPG or PNG, up to 10 MB), such as a certificate of occupancy, deed of assignment, survey plan or an agent authorisation letter.</li>
              <li>After a rejection, a fresh document must be uploaded before the listing can be resubmitted.</li>
            </ul>
          </section>

          <section id="roles">
            <h2>Roles and permissions</h2>
            <p>
              You choose Buyer, Landlord or Agent when you register. Verifier and
              admin accounts are created by the GidaLink team and can never be
              self-assigned.
            </p>
            <div className="docs-table-wrap">
              <table className="docs-table">
                <thead>
                  <tr><th>Role</th><th>Can do</th><th>Cannot do</th></tr>
                </thead>
                <tbody>
                  <tr><td><strong>Buyer</strong></td><td>Browse, save listings to the account, request and cancel inspections, report a listing.</td><td>Create listings, review anything, open staff pages.</td></tr>
                  <tr><td><strong>Landlord</strong></td><td>Everything a buyer can, plus create listings, upload photos and evidence, submit, withdraw and delete drafts, accept or decline inspections on their own listings.</td><td>Approve their own listing, edit it while under review, see staff pages.</td></tr>
                  <tr><td><strong>Agent</strong></td><td>The same as a landlord, for listings they manage on behalf of owners.</td><td>The same limits as a landlord.</td></tr>
                  <tr><td><strong>Verifier</strong></td><td>Open the review queue, read private evidence, approve or reject with notes, read reports, view the quality report.</td><td>Review their own listing, moderate reports, change roles.</td></tr>
                  <tr><td><strong>Admin</strong></td><td>Review listings, moderate reports, suspend and reinstate listings, change other users' roles, read the audit log.</td><td>Change their own role, review their own listing, create listings.</td></tr>
                </tbody>
              </table>
            </div>
            <p>
              The dashboard hides pages you cannot use, and the database enforces
              the same rules, so a hidden page cannot be reached by typing its
              address.
            </p>
          </section>

          <section id="privacy">
            <h2>Privacy and security</h2>
            <ul>
              <li><strong>Street addresses are hidden.</strong> Public pages show the neighbourhood and city only. The exact address is shown to the owner, to staff, and to a buyer whose inspection request has been accepted.</li>
              <li><strong>Evidence documents are private.</strong> They are visible only to the owner and to staff (verifiers and admins), through links that expire after two minutes.</li>
              <li><strong>Statuses cannot be faked.</strong> A listing's status changes only through reviewed steps in the database. An owner cannot mark their own listing verified, and a listing cannot be edited after it is submitted.</li>
              <li><strong>Everything important is recorded.</strong> Submissions, approvals, rejections, suspensions, role changes, inspection updates and report decisions are written to an audit log that admins can read.</li>
              <li><strong>No payments.</strong> This version of GidaLink does not take or hold money. Never pay anyone before you have inspected the property and confirmed the documents.</li>
            </ul>
          </section>

          <section id="inspections">
            <h2>Inspections</h2>
            <ol>
              <li>Sign in, open a live listing and choose <strong>Request an inspection</strong>. Pick a future date and add a message.</li>
              <li>The owner or agent sees the request in their dashboard and accepts or declines it.</li>
              <li>Once accepted, the exact address becomes visible to you. After the visit the owner marks it completed.</li>
              <li>You can cancel a request that is waiting or accepted. The owner can also cancel an accepted inspection.</li>
            </ol>
            <p>
              Sample listings on the home page cannot receive inspection requests.
              They exist only to show what a listing looks like.
            </p>
          </section>

          <section id="reports">
            <h2>Reports and moderation</h2>
            <p>
              Signed-in users can report a live listing for a reason such as fake
              photographs, an agent who does not represent the owner, or being
              asked to pay before an inspection. You can have one open report per
              listing.
            </p>
            <p>
              Admins start an investigation, then resolve or dismiss the report
              with a written note. If the report is upheld they can suspend the
              listing, and they can reinstate it later for another review.
              Verifiers can read reports but only admins can act on them.
            </p>
          </section>

          <section id="quality">
            <h2>How we test it</h2>
            <p>
              GidaLink Trust was built with a coding agent and checked with{" "}
              <a href="https://github.com/LambdaTest/kane-cli" target="_blank" rel="noopener noreferrer" style={{ color: "var(--green)", fontWeight: 600 }}>
                Kane CLI
              </a>
              , which opens a real Chrome browser and follows plain-English
              instructions. The results are kept in the repository, not just
              claimed.
            </p>
            <h3>What is covered</h3>
            <ul>
              <li>Public discovery, filters and the listing dialog.</li>
              <li>Registration, sign-in, protected pages and sign-out.</li>
              <li>A landlord creating a draft and being refused when evidence is missing.</li>
              <li>Form validation, the verifier queue and the rule that a rejection needs a reason.</li>
              <li>Buyer, landlord and admin permissions.</li>
              <li>Sample listings refusing inspections and reports, and the admin console.</li>
            </ul>
            <h3>The loop between Kane and the coding agent</h3>
            <ol>
              <li>Kane runs the scenarios and records each step.</li>
              <li>Failures are written to <code>KANE_FEEDBACK.md</code> with the failing step and Kane's explanation.</li>
              <li>The agent decides whether the app or the scenario is wrong, fixes it, and Kane runs again.</li>
              <li>A pre-push hook blocks pushes until the smoke scenarios pass, and the run history stays in <code>kane/reports/</code>.</li>
            </ol>
            <div className="docs-callout">
              <p>
                <strong>Real examples from the history:</strong> Kane found that
                signing out sent people to the login page instead of the home
                page, and that signing in could briefly show a profile error
                before the profile finished loading. Both were fixed and
                re-verified. It also showed that two of our own scenarios were
                badly worded, and those were rewritten.
              </p>
            </div>
            <h3>Run it yourself</h3>
<pre><code>npm install
npm run dev
npm run kane:smoke     # quick check
npm run kane           # every scenario</code></pre>
          </section>

          <section id="samples">
            <h2>Sample data</h2>
            <p>
              When the database has no live listings, the home page shows
              illustrative sample properties so you can see how the experience
              works. They are labelled as samples, they are not real offers, and
              their "Demo verified" label does not mean a real review happened.
              Listings seeded for demonstrations carry the note "Demo data
              seeded; not a real property".
            </p>
          </section>

          <section id="limits">
            <h2>What verified is not</h2>
            <div className="docs-callout warn">
              <p>
                <strong>Verified is not a guarantee of legal ownership.</strong>{" "}
                It records that a person examined the documents submitted for a
                listing and found them consistent with it. GidaLink does not
                search the land registry or replace a lawyer or surveyor.
              </p>
            </div>
            <ul>
              <li>Inspect the property in person before you pay.</li>
              <li>Confirm title documents and boundaries with a qualified professional.</li>
              <li>Pay only through traceable channels, and never to a person who pressures you to hurry.</li>
              <li>Report anything that looks wrong.</li>
            </ul>
          </section>

          <section id="faq" className="docs-faq">
            <h2>FAQ</h2>
            <details>
              <summary>Can I make myself a verifier or admin?</summary>
              <p>No. Registration only offers Buyer, Landlord and Agent. Staff roles are assigned by the GidaLink team.</p>
            </details>
            <details>
              <summary>Why can't I see a property's exact address?</summary>
              <p>To protect owners and tenants from scammers. The address is revealed after an owner accepts your inspection request.</p>
            </details>
            <details>
              <summary>Why was my listing rejected?</summary>
              <p>The reviewer's reason is shown on your listing's edit page. Fix the issue, upload new evidence and submit again.</p>
            </details>
            <details>
              <summary>Why can't I edit my listing?</summary>
              <p>Listings are locked while under review, and after approval, so the details cannot change after they were checked. Withdraw a pending listing to edit it.</p>
            </details>
            <details>
              <summary>Does GidaLink handle rent or purchase payments?</summary>
              <p>No. This version has no payments. Treat any request to pay through GidaLink as suspicious and report it.</p>
            </details>
            <details>
              <summary>Where are my documents stored?</summary>
              <p>In private storage that only you and verifiers can open, through short-lived links.</p>
            </details>
          </section>

          <section id="reference">
            <h2>Technical reference</h2>
            <p>
              Built with React, TypeScript and Vite, with Supabase for sign-in,
              the database and file storage. The full project documents are in
              the repository:
            </p>
            <ul className="docs-links">
              <li><a href={`${REPO}/blob/main/README.md`} target="_blank" rel="noopener noreferrer">README: project overview and status</a></li>
              <li><a href={`${REPO}/blob/main/docs/PRD.md`} target="_blank" rel="noopener noreferrer">Product requirements</a></li>
              <li><a href={`${REPO}/blob/main/docs/DATABASE.md`} target="_blank" rel="noopener noreferrer">Database design</a></li>
              <li><a href={`${REPO}/blob/main/docs/AUTHENTICATION_SECURITY.md`} target="_blank" rel="noopener noreferrer">Authentication and security</a></li>
              <li><a href={`${REPO}/blob/main/docs/TESTING.md`} target="_blank" rel="noopener noreferrer">Testing plan</a></li>
              <li><a href={`${REPO}/blob/main/docs/KANE.md`} target="_blank" rel="noopener noreferrer">Kane closed loop setup</a></li>
              <li><a href={`${REPO}/tree/main/kane/reports`} target="_blank" rel="noopener noreferrer">Kane run history</a></li>
            </ul>
          </section>
        </article>
      </div>
    </div>
  );
}
