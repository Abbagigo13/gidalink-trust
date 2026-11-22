# GidaLink Trust

### Discover properties. Verify ownership. Make confident decisions

GidaLink Trust is a Nigerian property marketplace designed to make renting, buying and investing in property safer, more transparent and more accessible.

The platform connects property seekers with landlords and real estate agents while introducing a trust and verification system that helps users distinguish verified properties from listings that are still awaiting review.

Our central idea is simple: **finding a property should not mean gambling with your money or trusting strangers blindly.**

---

## 1. What We're Building

GidaLink Trust is a web-based property marketplace focused on three major categories:

- **Rent:** Discover houses and apartments available for rent.
- **Buy:** Find residential and commercial properties for sale.
- **Land:** Discover land and plots available for purchase.

Unlike a traditional property listing website, GidaLink Trust puts property credibility and user trust at the centre of the experience.

The platform is being designed around five main user roles:

| Role | Responsibility |
| --- | --- |
| Buyer | Search for properties and request inspections. |
| Landlord | Create and manage property listings. |
| Agent | Manage listings on behalf of property owners. |
| Verifier | Review submitted property evidence and make verification decisions. |
| Admin | Manage users, listings, reports and platform operations. |

## 2. The Problem We're Solving

The Nigerian real estate market has several trust challenges:

- Fake property listings and misleading photographs.
- Agents advertising properties they do not have permission to represent.
- Multiple agents advertising the same property with different prices.
- People losing money to fraudulent agents and property scams.
- Difficulty determining whether a property or its representative is legitimate.
- Lack of transparency around property verification.

GidaLink Trust aims to address these problems through structured property submissions, evidence-based verification, reporting tools and transparent listing statuses.

## 3. Our Solution: The Trust Engine

The Trust Engine is the central feature that differentiates GidaLink from an ordinary property marketplace.

Every property listing follows a defined lifecycle.

**Property lifecycle:**

1. A landlord or agent creates a property listing.
2. The listing is saved as a draft or submitted for review.
3. The verifier reviews the submitted property information and supporting evidence.
4. The verifier approves or rejects the submission.
5. Approved properties become verified listings.
6. Suspicious listings can be reported and investigated.
7. Administrators can suspend listings when necessary.

### Verification statuses

| Status | Meaning |
| --- | --- |
| Draft | Listing is being prepared. |
| Pending Review | Listing has been submitted for verification. |
| Verified | Listing has passed the verification process. |
| Rejected | Listing did not pass verification. |
| Suspended | Listing has been restricted by platform administration. |

Verification is intended to be based on submitted evidence and human review. A verified badge must never be presented as proof of legal ownership unless the relevant checks have actually established that fact.

## 4. Technology Stack

The project uses a modern web application architecture.

### Frontend

- React
- TypeScript
- Vite
- CSS
- React Router
- Lucide React
- Framer Motion

### Backend and database

- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Row Level Security (RLS)
- Supabase Storage
- Supabase database functions and triggers

### Testing and quality assurance

- Kane CLI
- KaneAI
- Browser-based functional testing
- Automated build checks
- Manual quality assurance

### Development approach

We use an AI-assisted development workflow, with coding and testing treated as separate responsibilities.

- Coding agent: implements features and fixes.
- Kane CLI/KaneAI: tests the application and reports issues.
- Developer: reviews implementation, security decisions and test results.

---

## 5. What We Have Achieved So Far

The project has progressed through its initial setup and foundation stages.

### Phase 1 — Project Foundation

**Status: Completed**

- Created the GidaLink Trust project.
- Set up React, TypeScript and Vite.
- Installed the required frontend dependencies.
- Established the project structure.
- Configured the development environment.
- Confirmed that the production build runs successfully.

### Phase 2 — Visual Identity and Frontend

**Status: Initial implementation completed**

We established a distinctive premium editorial real estate design.

The design direction includes:

- Warm ivory backgrounds.
- Forest-green accents.
- Elegant serif typography.
- Architectural property photography.
- Spacious layouts.
- Premium property cards.
- Responsive layouts for different screen sizes.

The initial frontend includes:

- Homepage and navigation.
- Property discovery interface.
- Rent, Buy and Land categories.
- Sample property listings.
- Property images and details.
- Favourite controls.
- Property verification labels.
- Trust-focused sections.

**Important:** The existing sample properties and photographs are part of the product's visual foundation. They will remain available as illustrative fallback content when the database has no real listings.

Sample verification labels are demonstrations, not claims of real-world property verification.

### Phase 3 — Supabase Backend Foundation

**Status: Initial database implementation completed; integration ongoing**

We created the Supabase project and established the initial database structure.

The database includes:

- `profiles`
- `properties`
- Account role enums.
- Listing type enums.
- Property status enums.
- Inspection status enums.
- Report status enums.
- Verification status enums.

The account roles include:

- Buyer
- Landlord
- Agent
- Verifier
- Admin

We also established:

- Automatic profile creation when a user registers.
- Automatic `updated_at` timestamp handling.
- Ownership relationships between profiles and properties.
- Property validation constraints.
- Initial Row Level Security policies.

The current database foundation is intended to ensure that users can only perform actions permitted by their roles and ownership relationships.

---

## 6. Development Roadmap

The remaining work is organised into development phases.

### Phase 4 — Authentication and User Management

**Goal:** Give users secure accounts and role-based access.

Implementation:

- User registration.
- User login and logout.
- Password recovery.
- Profile management.
- Role assignment.
- Protected routes.
- Session persistence.
- Account permissions.

Users should be able to register as buyers, landlords or agents. Verifier and admin privileges must be assigned through controlled administrative processes, not ordinary public registration.

### Phase 5 — Real Property Discovery

**Goal:** Connect the existing beautiful frontend to actual Supabase property records.

Implementation:

- Fetch listings from Supabase.
- Preserve the four existing sample properties as fallback data.
- Search by location.
- Filter by listing category.
- Filter by price range.
- Filter by bedrooms and bathrooms.
- Sort by price and newest listings.
- Display property details.
- Display property images.
- Add favourite listings.

The discovery experience should distinguish actual database listings from illustrative sample listings.

### Phase 6 — Property Details and Inspection Requests

**Goal:** Allow users to explore properties and arrange inspections.

Implementation:

- Dedicated property detail pages.
- Property descriptions.
- Image galleries.
- Location information.
- Price and property specifications.
- Agent or landlord information.
- Inspection request form.
- Inspection request management.
- Inspection status tracking.

Inspection statuses:

- Requested
- Accepted
- Declined
- Completed
- Cancelled

### Phase 7 — Landlord and Agent Dashboard

**Goal:** Allow property representatives to manage their listings.

Implementation:

- Dashboard overview.
- Create property listings.
- Upload property photographs.
- Edit property details.
- Save drafts.
- Submit listings for verification.
- Track verification progress.
- Manage inspection requests.
- View listing activity.

Listings must be associated with their authenticated owner.

### Phase 8 — Trust Engine and Verification Dashboard

**Goal:** Build the core property verification workflow.

Implementation:

- Property verification submissions.
- Evidence uploads.
- Verification queue.
- Verifier dashboard.
- Review property information.
- Approve or reject submissions.
- Record verification decisions.
- Track verification status.
- Maintain verification history.

Verification must be performed by authorised verifiers.

Property owners must not be able to approve their own listings or modify protected verification decisions.

### Phase 9 — Suspicious Property Reporting

**Goal:** Give users a way to report potentially fraudulent listings.

Implementation:

- Report property button.
- Report reason selection.
- Report description.
- Admin report dashboard.
- Investigation workflow.
- Resolve or dismiss reports.
- Suspend suspicious listings when appropriate.

Report statuses:

- Open
- Investigating
- Resolved
- Dismissed

### Phase 10 — Admin Dashboard and Platform Management

**Goal:** Provide administrators with the tools to manage the marketplace.

Implementation:

- User management.
- Role management.
- Property management.
- Verification oversight.
- Report management.
- Listing suspension.
- Platform activity overview.
- Audit logs.

Administrative actions must be protected by server-side permissions and database policies.

### Phase 11 — Security, Testing and Quality Assurance

**Goal:** Make sure the application works correctly and that important permissions cannot be bypassed.

Implementation:

- Review all RLS policies.
- Test role-based permissions.
- Validate database operations.
- Test authentication flows.
- Test property submission.
- Test verification workflows.
- Test inspection requests.
- Test suspicious property reporting.
- Test responsive layouts.
- Test error and empty states.
- Fix discovered bugs.
- Run production builds.

Kane CLI and KaneAI will be used to execute browser-based scenarios and report failures.

### Phase 12 — Deployment and Hackathon Presentation

**Goal:** Prepare a working, demonstrable product.

Implementation:

- Production configuration.
- Environment variable review.
- Deployment.
- Production database checks.
- Final browser testing.
- Public GitHub repository.
- Project documentation.
- Demo video.
- Hackathon submission.

---

## 7. Future Implementations

After the core marketplace is functional, we plan to expand GidaLink Trust with additional features.

### Property identity and ownership verification

- More structured property documentation.
- Property ownership evidence review.
- Agent authorisation checks.
- Verification history.
- Document expiry and re-verification workflows.

### Location and mapping

- Interactive property maps.
- Nearby landmarks.
- Neighbourhood discovery.
- Map-based property search.
- Location-based filtering.

### Communication

- In-app messaging.
- Landlord and agent contact options.
- Inspection scheduling.
- Notifications.
- Email alerts.

### Advanced marketplace features

- Saved searches.
- Personalised property recommendations.
- Price comparison.
- Recently viewed properties.
- Property availability updates.
- Duplicate listing detection.

### AI-powered trust assistance

Potential future AI features:

- Suspicious listing pattern detection.
- Duplicate property image detection.
- Inconsistent property information detection.
- Listing description analysis.
- Automated moderation assistance.

AI should assist human review, not independently certify legal ownership or guarantee that a property is legitimate.

### Expansion

The initial focus is the Nigerian market, with a long-term opportunity to expand across more cities and states as the platform grows.

---

## 8. Security Principles

Trust is the foundation of GidaLink, so security must be part of the architecture rather than an afterthought.

Our principles:

1. Users can only manage listings they own or are authorised to manage.
2. Buyers cannot create or approve property verification records.
3. Landlords and agents cannot approve their own listings.
4. Only authorised verifiers can make verification decisions.
5. Administrative actions require administrative permissions.
6. Suspended listings must not appear as normal public listings.
7. Sensitive documents must not be publicly accessible.
8. Important actions should be recorded in audit logs.
9. Frontend role checks must never replace backend security.
10. Supabase service-role credentials must never be exposed in frontend code.

---

## 9. Project Structure

The frontend follows a modular structure that will grow as new features are implemented.

```text
gidalink-trust/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │
│   ├── pages/
│   │
│   ├── layouts/
│   │
│   ├── lib/
│   │   └── supabase.ts
│   │
│   ├── services/
│   │
│   ├── types/
│   │
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── supabase/
│   └── migrations/
│
├── .env.example
├── README.md
├── package.json
└── vite.config.ts
```

The structure may evolve as the application grows.

---

## 10. Current Project Status

| Area | Status |
| --- | --- |
| Project setup | Completed |
| Frontend visual foundation | Implemented |
| Sample property listings | Implemented |
| Supabase project | Created |
| Initial database schema | Implemented |
| Database enums | Implemented |
| Initial RLS policies | Implemented |
| Authentication integration | In progress |
| Live property discovery | Pending |
| Property detail pages | Pending |
| Landlord dashboard | Pending |
| Inspection workflow | Pending |
| Verification dashboard | Pending |
| Reporting system | Pending |
| Admin dashboard | Pending |
| Kane automated testing | Pending |
| Production deployment | Pending |

*Status describes the development plan and known progress; a feature is not considered complete until its implementation has been tested.*

---

## 11. What Success Looks Like

Our goal is not simply to build another website where people upload property photographs.

We want GidaLink Trust to become a property discovery platform where:

- Buyers can discover properties with greater confidence.
- Landlords can present their properties professionally.
- Agents can manage legitimate listings.
- Verifiers can review property evidence.
- Users can report suspicious activity.
- Administrators can enforce marketplace standards.
- Every important trust decision has a clear process and history.

**The vision: Make property discovery in Nigeria more transparent, accountable and trustworthy.**

---

## 12. Final Product Vision

GidaLink Trust brings together property discovery, identity and evidence review, inspection management and marketplace accountability in one platform.

We are building it in phases: first establish a beautiful and usable marketplace, then connect real data, implement secure user workflows, introduce verification and reporting, and finally expand into a complete property trust ecosystem.

**GidaLink Trust — Find your place. Know what you trust.**
