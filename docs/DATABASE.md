# Database Documentation

# GidaLink Trust

Version: 1.0
Database: Supabase PostgreSQL

## 1. Overview

GidaLink Trust uses PostgreSQL through Supabase.

The database supports:

- User profiles.
- Property listings.
- Listing ownership.
- Property verification.
- Inspection requests.
- Suspicious property reports.
- Administrative operations.

## 2. Existing Database Enums

### account_role

- buyer
- landlord
- agent
- verifier
- admin

### listing_type

- rent
- sale
- land

### property_status

- draft
- pending_review
- verified
- rejected
- suspended

### inspection_status

- requested
- accepted
- declined
- completed
- cancelled

### report_status

- open
- investigating
- resolved
- dismissed

### verification_status

- submitted
- in_review
- approved
- rejected

## 3. Profiles Table

Table: public.profiles

Known columns:

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| id | uuid | No | None |
| full_name | text | Yes | None |
| phone | text | Yes | None |
| role | account_role | No | buyer |
| created_at | timestamptz | No | now() |
| updated_at | timestamptz | No | now() |

### Relationships

profiles.id references the authenticated Supabase user ID.

The profile ID is used to associate users with property listings.

### Existing trigger

on_auth_user_created

Executes:
handle_new_user()

The function creates a profile after a new authentication user is registered.

The current function uses the user's full_name metadata when available and otherwise inserts an empty string.

### Existing update trigger

profiles_set_updated_at

Executes:
set_updated_at()

### Existing RLS policies

Profiles are readable by owner:

- SELECT
- User can read their own profile.

Users update own profile details:

- UPDATE
- User can update their own profile details.
- The current policy includes a role equality check.

Role changes must remain restricted to trusted administrative operations.

## 4. Properties Table

Table: public.properties

Known columns from the Supabase schema inspection:

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| id | uuid | No | gen_random_uuid() |
| owner_id | uuid | No | None |
| title | text | No | None |
| description | text | No | Empty string |
| listing_type | listing_type | No | None |
| price_ngn | numeric | No | None |
| price_period | text | Yes | None |
| bedrooms | integer | Yes | None |
| bathrooms | integer | Yes | None |
| area_sqm | numeric | Yes | None |
| address | text | No | None |
| neighbourhood | text | Yes | None |
| city | text | No | None |
| state | text | No | None |
| country | text | No | Nigeria |
| image_urls | text[] | No | Empty array |
| features | text[] | No | Empty array |
| status | property_status | No | draft |
| published_at | timestamptz | Yes | None |
| created_at | timestamptz | No | now() |
| updated_at | timestamptz | No | now() |

Note: Confirm the full column list against the live database before implementing migrations or generating database types.

### Relationships

properties.owner_id references profiles.id.

### Existing constraints

The database includes validation constraints for:

- title
- price_ngn
- bedrooms
- bathrooms
- area_sqm

The exact constraint expressions should be inspected before changing validation rules.

### Existing RLS policies

Landlords and agents can create listings:

- INSERT
- Owner must match auth.uid().
- Profile role must be landlord, agent or admin.
- New listing status must be draft or pending_review.

Owners can edit their own unverified listings:

- UPDATE
- Owner must match auth.uid().
- Status must be draft or pending_review.

Owners can view their own listings:

- SELECT
- Owner must match auth.uid().

Public can view published listings:

- SELECT
- Current policy allows pending_review and verified statuses.

Important:
The existing public policy should be reviewed. The intended product behaviour is that only verified listings are publicly presented as verified marketplace listings. Pending submissions should not be exposed as normal public listings.

## 5. Additional Planned Tables

The following entities are part of the product requirements. Their exact live schemas must be confirmed before implementation.

### verifications

Purpose:
Store verification submissions and review decisions.

Suggested information:

- Property reference.
- Submission status.
- Evidence references.
- Reviewer reference.
- Review decision.
- Review notes.
- Submission and review timestamps.

### inspections

Purpose:
Manage inspection requests.

Suggested information:

- Property reference.
- Requesting user.
- Requested date.
- Request status.
- Relevant notes.
- Creation and update timestamps.

### reports

Purpose:
Manage suspicious property reports.

Suggested information:

- Property reference.
- Reporting user.
- Report reason.
- Description.
- Report status.
- Assigned administrator.
- Resolution notes.
- Timestamps.

### audit_logs

Purpose:
Record sensitive platform operations.

Suggested information:

- Actor.
- Action.
- Target record.
- Relevant metadata.
- Timestamp.

These are planned data structures, not confirmed existing tables.

## 6. Database Security

- Enable RLS on exposed application tables.
- Restrict property updates to authorised owners.
- Restrict verification decisions to authorised verifiers.
- Restrict administrative operations to admins.
- Prevent users from changing their own privileged roles.
- Protect private evidence documents.
- Validate relationships with foreign keys.
- Use database constraints for critical data rules.

## 7. Data Integrity

- Every property must have an owner.
- Every property must have a valid listing type.
- Prices must satisfy database validation.
- Property status must use the defined enum.
- Verification decisions must be traceable.
- Inspection requests must reference valid properties and users.
- Reports must reference valid properties and reporting users.

## 8. Database Migration Rules

- Use version-controlled SQL migrations.
- Never rely only on manual dashboard changes.
- Review migrations before production execution.
- Avoid destructive changes without backups.
- Test RLS policies with different user roles.
- Keep development and production environments separate.

## 9. Future Database Improvements

- Property location coordinates.
- Property document records.
- Agent authorisation records.
- Verification history.
- Notifications.
- Saved properties.
- Search history.
- Duplicate listing detection metadata.
