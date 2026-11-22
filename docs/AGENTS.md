# Agent Instructions

# GidaLink Trust

This file defines the rules for AI coding agents and developers working on GidaLink Trust.

## 1. Project Identity

Project:
GidaLink Trust

Purpose:
A Nigerian property marketplace with property verification, inspection management and reporting.

## 2. Technology Stack

- React
- TypeScript
- Vite
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- React Router
- Lucide React
- Framer Motion
- Kane CLI / KaneAI for testing

## 3. Critical Design Rule

Preserve the existing Premium Editorial Real Estate design.

The established design includes:

- Warm ivory background.
- Forest-green accents.
- Playfair Display headings.
- Architectural property photography.
- Spacious layouts.
- Elegant property cards.

Do not redesign the homepage unnecessarily.

Do not remove the existing sample property images or sample properties when implementing backend functionality.

Keep sample listings as clearly labelled illustrative fallback content when the database has no real listings.

Never present sample verification as genuine verification.

## 4. Development Rules

Before changing files:

1. Inspect the existing implementation.
2. Understand the current component structure.
3. Inspect related service modules.
4. Inspect relevant database migrations.
5. Identify dependencies.
6. Avoid unnecessary rewrites.

When modifying a file:

- Prefer complete, working implementations.
- Preserve unrelated functionality.
- Avoid duplicated logic.
- Keep components reusable.
- Maintain TypeScript types.
- Remove unused imports and variables.

## 5. Database Rules

- Use the actual Supabase schema.
- Do not invent database columns.
- Check existing migrations before writing new ones.
- Use migrations for schema changes.
- Preserve existing constraints.
- Test RLS policies.
- Avoid destructive SQL without explicit approval.

## 6. Security Rules

- Never expose service-role keys.
- Never trust frontend-only role checks.
- Never allow users to approve their own listings.
- Never allow users to change their own privileged role.
- Protect verification evidence.
- Enforce ownership in the database.
- Validate all privileged operations on the trusted backend.

## 7. Role Definitions

buyer:
Discover properties and request inspections.

landlord:
Create and manage owned property listings.

agent:
Manage authorised property listings.

verifier:
Review submitted evidence and make verification decisions.

admin:
Manage platform operations and moderation.

## 8. Implementation Workflow

For every feature:

1. Inspect requirements.
2. Inspect existing code.
3. Define expected behaviour.
4. Implement the feature.
5. Add validation.
6. Apply backend permissions.
7. Add loading and error states.
8. Test the feature.
9. Run the production build.
10. Document important changes.

## 9. Testing Rules

Never claim a test passed unless it was actually executed.

Do not fabricate:

- Browser test results.
- Database records.
- Authentication results.
- Verification outcomes.
- Deployment status.

Use Kane CLI/KaneAI for browser-based testing where appropriate.

## 10. Code Quality

- Use strict TypeScript.
- Avoid unnecessary any types.
- Keep functions focused.
- Handle errors.
- Use semantic HTML.
- Ensure responsive behaviour.
- Avoid hardcoded secrets.
- Avoid unnecessary dependencies.

## 11. Communication

When reporting work, explain:

- Files created.
- Files changed.
- Functionality implemented.
- Database changes.
- Tests executed.
- Known limitations.
- Next recommended step.

## 12. Definition of Done

A feature is complete only when:

- The implementation exists.
- Its expected behaviour works.
- Permissions are enforced.
- Errors are handled.
- Relevant tests pass.
- The production build succeeds.
- Documentation is updated when necessary.
