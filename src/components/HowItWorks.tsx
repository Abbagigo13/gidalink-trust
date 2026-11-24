import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarCheck,
  ClipboardCheck,
  FileUp,
  Flag,
  ShieldCheck,
} from "lucide-react";
import "../pages/info.css";

const steps = [
  {
    icon: FileUp,
    title: "1. Owners list with evidence",
    body: "A landlord or agent creates a listing, adds photographs and uploads private documents, such as a certificate of occupancy or an agent authorisation letter. A listing cannot be submitted without both.",
  },
  {
    icon: ClipboardCheck,
    title: "2. A verifier reviews it",
    body: "A trained reviewer opens the documents and decides. Rejecting needs a written reason the owner can act on, and nobody can review their own listing.",
  },
  {
    icon: ShieldCheck,
    title: "3. The status is published",
    body: "Approved listings show as Verified. Listings still waiting show as Pending review, so you always see where a property stands. Only the review process can change a status.",
  },
  {
    icon: CalendarCheck,
    title: "4. You inspect before you pay",
    body: "Request an inspection from any live listing. The owner accepts or declines, and the exact street address is revealed to you only once the inspection is accepted.",
  },
  {
    icon: Flag,
    title: "5. Anyone can report a problem",
    body: "See something suspicious? Report the listing. Admins investigate, can suspend it, and every decision is written to an audit log.",
  },
];

const statuses = [
  ["Draft", "Being prepared by the owner. Not public."],
  ["Pending review", "Submitted with evidence and waiting for a verifier. Visible, clearly labelled."],
  ["Verified", "A reviewer examined the submitted evidence and approved the listing."],
  ["Rejected", "The reviewer found a problem and gave a reason. Not public. The owner can fix and resubmit."],
  ["Suspended", "Removed by an admin after a report or investigation. Not public."],
];

export default function HowItWorks() {
  return (
    <section className="how-section" id="how-it-works" data-testid="how-it-works">
      <div className="section-kicker">HOW IT WORKS</div>
      <h2 className="how-title">
        From a listing to a <em>decision you can follow.</em>
      </h2>
      <p className="how-lede">
        GidaLink Trust is built around one idea: a property should earn the word
        verified. Here is exactly what happens to every listing, and who is
        responsible at each step.
      </p>

      <ol className="how-steps">
        {steps.map(({ icon: Icon, title, body }) => (
          <li className="how-step" key={title}>
            <span className="how-icon">
              <Icon size={20} strokeWidth={1.6} />
            </span>
            <h3>{title}</h3>
            <p>{body}</p>
          </li>
        ))}
      </ol>

      <div className="how-grid">
        <div className="how-card">
          <h3>What each status means</h3>
          <dl className="status-legend">
            {statuses.map(([name, text]) => (
              <div key={name}>
                <dt>{name}</dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="how-card how-card-honest">
          <h3>What verified does and does not mean</h3>
          <p>
            <strong>It means</strong> a person at GidaLink examined the documents
            the owner or agent submitted and found them consistent with the
            listing.
          </p>
          <p>
            <strong>It does not mean</strong> that GidaLink has searched the land
            registry or guaranteed legal ownership. Always inspect the property
            and confirm the title with a qualified professional before you pay
            anyone. GidaLink does not process payments.
          </p>
          <p className="how-note">
            Listings marked as samples on the home page are demonstration data,
            not real offers.
          </p>
        </div>
      </div>

      <div className="how-cta">
        <div>
          <h3>Built to be checked</h3>
          <p>
            The whole workflow is tested in a real browser with Kane CLI, and the
            results are kept in the open. Read how roles, privacy, reviews and
            testing work in the documentation.
          </p>
        </div>
        <Link to="/docs" className="primary-button" data-testid="docs-link">
          Read the documentation
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </section>
  );
}
