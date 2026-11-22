# Product Requirements Document (PRD)

# GidaLink Trust

Version: 1.0
Status: Active Development
Platform: Web Application
Initial Market: Nigeria

## 1. Product Overview

GidaLink Trust is a Nigerian property marketplace that connects property seekers with landlords and real estate agents.

The platform supports renting, buying and discovering land while introducing a property verification workflow designed to improve transparency and reduce fraudulent listings.

The product combines property discovery with a Trust Engine for evidence submission, human verification, reporting and administrative oversight.

## 2. Problem Statement

Property seekers in Nigeria face challenges including:

- Fake property advertisements.
- Unauthorised agents.
- Misleading property photographs and descriptions.
- Duplicate listings and inconsistent prices.
- Difficulty confirming property representatives.
- Financial losses caused by property scams.
- Limited accountability when suspicious listings are discovered.

Existing property marketplaces often focus on listing quantity and discovery. GidaLink Trust places additional emphasis on credibility and accountability.

## 3. Product Vision

Make property discovery in Nigeria more transparent, accountable and trustworthy.

## 4. Target Users

### Buyers

People searching for houses, apartments, land and other properties to purchase.

### Tenants

People searching for residential or commercial properties to rent.

### Landlords

Property owners who want to advertise and manage their properties.

### Agents

Real estate representatives who manage property listings.

### Verifiers

Authorised reviewers responsible for reviewing property submissions and evidence.

### Administrators

Platform operators responsible for users, moderation, reports and operational oversight.

## 5. Product Goals

1. Provide a simple property discovery experience.
2. Allow landlords and agents to submit property listings.
3. Establish a structured property verification process.
4. Allow users to report suspicious listings.
5. Support property inspection requests.
6. Enforce permissions through Supabase and database security.
7. Provide administrators with marketplace management tools.
8. Maintain a premium, responsive user experience.

## 6. Product Scope

### Core features

- User registration and authentication.
- User profiles and roles.
- Property discovery.
- Property search and filtering.
- Property detail pages.
- Property favourites.
- Property listing creation.
- Listing management.
- Evidence submission.
- Verification workflow.
- Inspection requests.
- Suspicious listing reports.
- Admin moderation.
- Audit history.

### Out of scope for the initial release

- Direct property payments.
- Escrow services.
- Automatic legal ownership certification.
- Mortgage processing.
- Automated land registry integration.
- Guaranteed fraud detection.
- Native Android and iOS applications.

These may be considered in future versions.

## 7. Functional Requirements

### FR-01: Authentication

Users must be able to register, log in, log out and manage their profiles.

### FR-02: Property Discovery

Visitors must be able to browse publicly available property listings.

### FR-03: Property Search

Users must be able to search by location and filter by property category, price and property specifications.

### FR-04: Property Details

Each property must have a dedicated detail page showing its description, images, location, price and relevant specifications.

### FR-05: Property Submission

Authorised landlords and agents must be able to create and manage their own listings.

### FR-06: Verification

Submitted listings must be reviewable by authorised verifiers.

### FR-07: Inspection

Authenticated users must be able to request property inspections.

### FR-08: Reporting

Users must be able to report suspicious property listings.

### FR-09: Administration

Administrators must be able to manage users, listings, reports and verification operations.

### FR-10: Security

All sensitive operations must be protected by backend permissions and Row Level Security.

## 8. Property Lifecycle

draft
  -> pending_review
  -> verified

Alternative outcomes:

pending_review -> rejected
verified -> suspended

A suspended property must not be presented as a normal verified public listing.

## 9. Verification Principles

- Verification decisions must be made by authorised reviewers.
- Property owners must not approve their own listings.
- Evidence must be stored with appropriate access restrictions.
- Verification decisions should be auditable.
- A verification badge must not imply legal ownership certification unless that has actually been established.

## 10. Non-Functional Requirements

### Performance

- Optimise property images.
- Avoid unnecessary database requests.
- Provide loading and empty states.
- Use pagination for larger listing collections.

### Security

- Enforce Row Level Security.
- Protect private documents.
- Validate user input.
- Restrict privileged operations.
- Never expose service-role credentials in frontend code.

### Usability

- Responsive layouts.
- Clear navigation.
- Accessible controls.
- Understandable error messages.

### Reliability

- Handle database failures gracefully.
- Preserve sample properties as illustrative fallback content.
- Clearly distinguish sample listings from real user submissions.

## 11. Success Metrics

- Number of registered users.
- Number of active property listings.
- Number of submitted verification requests.
- Number of completed verification reviews.
- Number of inspection requests.
- Number of reported listings.
- Percentage of successfully completed core workflows.
- Number of critical security issues found during testing.

## 12. Release Strategy

Release 1: Marketplace foundation and authentication.

Release 2: Live property discovery and listing management.

Release 3: Verification and inspection workflows.

Release 4: Reporting and administration.

Release 5: Security hardening, testing and deployment.

## 13. Future Improvements

- Interactive property maps.
- In-app messaging.
- Email and push notifications.
- AI-assisted suspicious listing detection.
- Duplicate image detection.
- Agent authorisation workflows.
- Property document expiry monitoring.
- Personalised recommendations.
- Neighbourhood information.