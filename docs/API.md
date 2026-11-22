# API and Service Documentation

# GidaLink Trust

Version: 1.0

## 1. Overview

GidaLink Trust uses Supabase as its backend platform.

The frontend communicates with Supabase through the official Supabase JavaScript client.

The application should organise database operations into reusable service modules.

This document describes the intended application service interfaces. It does not claim that every endpoint or function has already been implemented.

## 2. Supabase Client

Location:

src/lib/supabase.ts

Responsibilities:

- Initialise Supabase.
- Read environment variables.
- Provide the shared client.
- Manage authenticated sessions.

Environment variables:

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

Never place the Supabase service-role key in frontend environment variables.

## 3. Suggested Service Structure

src/services/
  auth.service.ts
  properties.service.ts
  inspections.service.ts
  verification.service.ts
  reports.service.ts
  profiles.service.ts

## 4. Authentication Services

Suggested functions:

signUp(email, password, fullName)

signIn(email, password)

signOut()

resetPassword(email)

getCurrentUser()

getUserProfile()

updateProfile(profileData)

Expected behaviour:

- Use Supabase Auth.
- Create or retrieve the user's profile.
- Handle expired sessions.
- Return meaningful errors.
- Never trust frontend role values as proof of permission.

## 5. Property Services

Suggested functions:

getPublicProperties(filters)

getPropertyById(propertyId)

getMyProperties()

createProperty(propertyData)

updateProperty(propertyId, propertyData)

submitPropertyForReview(propertyId)

getFeaturedProperties()

searchProperties(searchQuery)

### Property filters

Possible filters:

- listing_type
- city
- state
- neighbourhood
- minimum price
- maximum price
- bedrooms
- bathrooms
- sorting
- pagination

### Property creation

Expected process:

1. Authenticate user.
2. Validate property fields.
3. Confirm that the user is permitted to create listings.
4. Insert the property.
5. Return the created record.

Database RLS must enforce the final permission checks.

## 6. Inspection Services

Suggested functions:

requestInspection(propertyId, inspectionData)

getMyInspectionRequests()

getPropertyInspectionRequests(propertyId)

updateInspectionStatus(inspectionId, status)

Supported statuses:

- requested
- accepted
- declined
- completed
- cancelled

Only authorised participants should be able to access or modify inspection records.

## 7. Verification Services

Suggested functions:

submitVerification(propertyId, evidence)

getVerificationQueue()

getVerificationByProperty(propertyId)

reviewVerification(verificationId, decision, notes)

Supported statuses:

- submitted
- in_review
- approved
- rejected

Only authorised verifiers should be able to make verification decisions.

The property status and verification record must remain consistent.

## 8. Reporting Services

Suggested functions:

reportProperty(propertyId, reportData)

getMyReports()

getAdminReports(filters)

updateReportStatus(reportId, status)

Supported statuses:

- open
- investigating
- resolved
- dismissed

Administrative actions must be protected by backend permissions.

## 9. Error Handling

Services should return predictable results.

Recommended structure:

{
  data: null,
  error: {
    message: "Readable error message",
    code: "ERROR_CODE"
  }
}

The frontend should:

- Display understandable errors.
- Avoid exposing sensitive database details.
- Preserve user input when possible.
- Handle network failures.
- Provide loading states.

## 10. Validation

Use Zod schemas for important forms.

Validate:

- Required fields.
- Property prices.
- Contact information.
- Listing categories.
- Property specifications.
- File size and file type.
- Report descriptions.
- Inspection dates.

Frontend validation improves usability but does not replace backend validation.

## 11. API Security

- Enforce RLS.
- Use authenticated requests.
- Do not trust client-supplied owner IDs.
- Restrict privileged actions.
- Protect private documents.
- Avoid exposing service-role credentials.
- Validate all user input.

## 12. Implementation Status

The functions described here are planned service contracts.

Mark each function as implemented only after the corresponding code, database permissions and tests are complete.
