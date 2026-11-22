# Authentication and Security

# GidaLink Trust

## 1. Security Objective

GidaLink Trust handles user accounts, property information, verification evidence and reports.

Security must protect:

- User identity.
- Property ownership.
- Private documents.
- Verification decisions.
- Inspection records.
- Administrative operations.

## 2. Authentication Provider

Supabase Auth.

Supported functionality:

- Registration.
- Login.
- Logout.
- Password recovery.
- Session management.
- User identity retrieval.

## 3. User Roles

buyer
landlord
agent
verifier
admin

The role is stored in profiles.role.

A user must not be allowed to grant themselves a privileged role through an ordinary profile update.

## 4. Registration

Expected flow:

1. User submits registration details.
2. Supabase Auth creates the account.
3. The on_auth_user_created trigger executes handle_new_user().
4. A profile is created.
5. The user receives the appropriate account access.

The current database function creates a profile with a default buyer role.

Additional role assignment must use controlled processes.

## 5. Session Management

The frontend should:

- Restore authenticated sessions.
- Listen for authentication changes.
- Protect private pages.
- Handle expired sessions.
- Clear private UI state after logout.

A protected route is a user experience feature, not a substitute for RLS.

## 6. Row Level Security

RLS must protect all exposed application tables.

### Profiles

Users may:

- Read their own profile.
- Update permitted profile details.

Users must not:

- Assign themselves admin.
- Assign themselves verifier.
- Change another user's profile.

### Properties

Users may:

- View their own listings.
- Create listings when authorised.
- Edit their own permitted unverified listings.

Public users should only receive listings intended for public discovery.

The existing policy currently allows public SELECT access to pending_review and verified properties. Review and tighten this before production so pending submissions are not exposed as ordinary public listings.

### Verification

Only authorised verifiers may review and decide verification submissions.

Property owners must not approve their own properties.

### Inspections

Users may access only records they are authorised to see or manage.

### Reports

Users may create reports.

Only authorised administrators may manage investigation and resolution statuses.

## 7. Sensitive File Storage

Verification evidence may contain sensitive information.

Requirements:

- Use private storage buckets.
- Restrict access through storage policies.
- Use signed URLs when appropriate.
- Validate file types.
- Restrict file sizes.
- Avoid exposing private evidence through public URLs.

Property photographs intended for public discovery may use a separate public bucket.

## 8. Secrets Management

Frontend:

- Supabase project URL.
- Public client key.

Backend:

- Privileged credentials only in trusted server environments.

Never:

- Commit .env.
- Expose service-role keys.
- Put privileged credentials in browser code.
- Print secrets in logs.
- Send private credentials to AI coding agents unnecessarily.

## 9. Input Validation

Validate:

- Email addresses.
- Phone numbers.
- Property prices.
- Property descriptions.
- File uploads.
- Inspection dates.
- Report descriptions.
- IDs and relationships.

Use frontend validation for usability and database/backend validation for security.

## 10. Verification Security

- Only authorised verifiers can make decisions.
- Owners cannot approve their own submissions.
- Verification records must be traceable.
- Evidence must be protected.
- Suspended listings must not be presented as verified and available.

## 11. Audit Logging

Important operations should be recorded:

- Role changes.
- Verification decisions.
- Listing suspension.
- Report resolution.
- Administrative actions.

Audit records should not be editable by ordinary users.

## 12. Security Testing

Test:

- Anonymous access.
- Buyer access.
- Landlord access.
- Agent access.
- Verifier access.
- Admin access.
- Cross-user record access.
- Role escalation attempts.
- Direct database requests.
- Private file access.

## 13. Security Principle

Never trust the frontend to enforce an important security decision.

The database and trusted backend operations must enforce permissions.
