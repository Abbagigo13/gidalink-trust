# Feature Development Guide

# GidaLink Trust

## 1. Purpose

This document defines how new features should be planned, implemented and maintained.

## 2. Feature Development Principles

Every feature should:

- Solve a real user problem.
- Follow the product requirements.
- Preserve the established design.
- Use reusable components.
- Follow the existing architecture.
- Enforce backend permissions.
- Include validation and error handling.
- Be tested before being marked complete.

## 3. Standard Feature Workflow

### Step 1: Define the Feature

Document:

- Feature name.
- Problem being solved.
- Target user.
- Expected behaviour.
- Acceptance criteria.

### Step 2: Inspect Existing Code

Review:

- Related pages.
- Components.
- Services.
- Types.
- Database schema.
- Existing policies.

Do not rewrite working features without a reason.

### Step 3: Plan the Implementation

Identify:

- Frontend changes.
- Backend changes.
- Database changes.
- Security requirements.
- Test scenarios.

### Step 4: Implement

Keep business logic out of large UI components where practical.

Use:

- Components for reusable UI.
- Pages for route-level screens.
- Services for backend operations.
- Types for shared data structures.
- Hooks for reusable stateful logic.

### Step 5: Validate

Check:

- Required fields.
- Input formats.
- File uploads.
- Database constraints.
- User permissions.

### Step 6: Test

Test:

- Successful operation.
- Invalid input.
- Unauthenticated access.
- Unauthorised access.
- Empty states.
- Network errors.
- Mobile layouts.

### Step 7: Document

Update relevant documentation and note any unfinished work.

## 4. Feature Development Standards

### Property Discovery

Requirements:

- Retrieve public listings.
- Search by location.
- Filter by listing category.
- Filter by price.
- Sort results.
- Support pagination.
- Display listing status correctly.

Acceptance criteria:

- Search returns matching records.
- Filters can be combined.
- Empty results are handled.
- Demo listings are clearly identified.
- Suspended or rejected properties are not shown as normal public listings.

### Property Submission

Requirements:

- Authenticated landlord or agent.
- Form validation.
- Property photographs.
- Database insertion.
- Draft and submission workflows.

Acceptance criteria:

- Unauthorised users cannot create listings.
- Owner identity comes from the authenticated session.
- Invalid submissions are rejected.
- New submissions use an allowed status.

### Verification

Requirements:

- Evidence submission.
- Review queue.
- Reviewer permissions.
- Approval and rejection.
- Decision history.

Acceptance criteria:

- Property owners cannot approve their own listings.
- Buyers cannot perform verifier actions.
- Only authorised verifiers can record decisions.
- Decisions are traceable.

### Inspections

Requirements:

- Inspection request form.
- Request status.
- Property owner or authorised agent response.
- User request history.

Acceptance criteria:

- Requests reference valid properties.
- Unauthorised users cannot alter another user's requests.
- Status transitions are validated.

### Reporting

Requirements:

- Report submission.
- Reason and description.
- Admin investigation.
- Resolution or dismissal.

Acceptance criteria:

- Users can report listings.
- Reports are associated with their submitter.
- Only authorised administrators can moderate reports.

## 5. UI Development Rules

- Follow DESIGN.md.
- Preserve architectural imagery.
- Use existing spacing and typography.
- Maintain mobile responsiveness.
- Avoid generic SaaS styling.
- Provide loading, error and empty states.

## 6. Database Change Rules

- Inspect current schema first.
- Create migrations for schema changes.
- Add appropriate constraints.
- Review RLS policies.
- Test migrations before production use.

## 7. Pull Request / Change Review

Before merging a feature:

- [ ] Requirements satisfied.
- [ ] No unrelated UI removed.
- [ ] TypeScript checks pass.
- [ ] Build passes.
- [ ] Security reviewed.
- [ ] Relevant tests pass.
- [ ] Documentation updated.
