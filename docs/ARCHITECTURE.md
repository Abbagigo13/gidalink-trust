# System Architecture

# GidaLink Trust

Version: 1.0

## 1. Architecture Overview

GidaLink Trust uses a frontend application connected to Supabase services.

Frontend:
React + TypeScript + Vite

Backend services:
Supabase

Database:
PostgreSQL

Authentication:
Supabase Auth

File storage:
Supabase Storage

Security:
PostgreSQL Row Level Security

Testing:
Kane CLI and KaneAI

## 2. High-Level Architecture

User
 |
 v
React Frontend
 |
 +---- Authentication
 |
 +---- Property Discovery
 |
 +---- Listing Management
 |
 +---- Inspection Management
 |
 +---- Verification Interface
 |
 +---- Reporting Interface
 |
 v
Supabase Client
 |
 +---- Supabase Auth
 |
 +---- PostgreSQL Database
 |
 +---- Row Level Security
 |
 +---- Database Functions and Triggers
 |
 +---- Supabase Storage

## 3. Frontend Architecture

The frontend is responsible for:

- Rendering the user interface.
- Managing navigation.
- Collecting user input.
- Displaying property data.
- Handling authentication state.
- Calling backend services.
- Displaying errors and loading states.

The frontend must not be trusted to enforce security by itself.

## 4. Backend Architecture

Supabase provides:

### Authentication

Manages user identity and sessions.

### PostgreSQL

Stores application records.

### Row Level Security

Restricts database access according to authenticated identity and permissions.

### Storage

Stores property photographs and private verification evidence.

### Database Functions

Handles controlled database operations.

### Triggers

Automates selected database events.

## 5. Application Layers

### Presentation Layer

Pages, components, layouts and UI state.

### Service Layer

Reusable functions for:

- Authentication.
- Property queries.
- Property submissions.
- Inspections.
- Reports.
- Verification.

### Data Layer

Supabase client and database types.

### Security Layer

RLS policies, database constraints and protected backend operations.

## 6. Suggested Frontend Structure

src/
  assets/
  components/
  layouts/
  pages/
  hooks/
  lib/
    supabase.ts
  services/
  types/
  App.tsx
  App.css
  index.css
  main.tsx

## 7. User Roles

buyer
landlord
agent
verifier
admin

Roles are stored in the profiles table.

Privileged roles must be assigned through controlled administrative processes.

## 8. Main Data Flows

### Property Discovery

1. User opens the discovery page.
2. Frontend requests public listings.
3. Supabase applies RLS.
4. Frontend renders returned records.
5. Illustrative sample properties are used only as clearly labelled fallback content when appropriate.

### Property Submission

1. Authenticated landlord or agent submits a listing.
2. Frontend validates input.
3. Backend checks user permissions.
4. Property record is created.
5. Listing begins in draft or pending_review status.

### Verification

1. Verifier opens the review queue.
2. Verifier reviews listing details and evidence.
3. Authorised backend operation records the decision.
4. Property status is updated.
5. Relevant history is recorded.

### Reporting

1. User submits a report.
2. Report is stored.
3. Admin reviews the report.
4. Admin resolves, dismisses or investigates it.
5. Necessary moderation action is recorded.

## 9. Security Architecture

- RLS enabled on exposed application tables.
- Ownership checks for property management.
- Role checks for privileged actions.
- Private storage for sensitive documents.
- Server-side validation of important operations.
- Audit history for sensitive actions.
- No service-role key in browser code.

## 10. Deployment Architecture

Development:
Local Vite server.

Backend:
Supabase project.

Production:
Static frontend hosting with production environment variables and Supabase production services.

## 11. Architecture Principles

- Keep frontend components reusable.
- Keep database access in service modules.
- Avoid duplicated business logic.
- Keep privileged operations on trusted backend paths.
- Validate all external input.
- Keep sample content separate from real property records.
- Design for future expansion without unnecessary complexity.
