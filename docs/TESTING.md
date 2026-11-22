# Testing and Quality Assurance

# GidaLink Trust

## 1. Purpose

Testing ensures that GidaLink Trust works correctly, protects user information and provides a reliable property marketplace experience.

Testing must cover both frontend behaviour and backend security.

## 2. Testing Tools

### Build and TypeScript

npm run build

Purpose:

- TypeScript validation.
- Production compilation.
- Detection of build errors.

### Kane CLI / KaneAI

Purpose:

- Browser automation.
- User workflow testing.
- Interface validation.
- Bug discovery.
- Regression testing.

### Supabase

Purpose:

- Database validation.
- RLS testing.
- Authentication checks.
- Storage permission checks.

## 3. Core Test Scenarios

### K01 — Public Property Discovery

Steps:

1. Open the homepage.
2. Navigate to property discovery.
3. Browse available properties.
4. Change listing categories.
5. Search by location.
6. Apply filters.
7. Open a property detail page.

Expected:

- Pages load successfully.
- Search and filters work.
- Property information is displayed correctly.
- Sample listings are clearly identified.
- Suspended or rejected listings are not presented as normal public listings.

### K02 — Authentication

Steps:

1. Register an account.
2. Log in.
3. Open a protected page.
4. Refresh the page.
5. Log out.

Expected:

- Account creation works.
- Profile is created.
- Session is maintained correctly.
- Protected pages require authentication.
- Logout clears the authenticated session.

### K03 — Property Submission

Steps:

1. Log in as a landlord or agent.
2. Open the listing dashboard.
3. Create a property.
4. Submit the property.
5. Inspect the resulting record.

Expected:

- Authorised users can create listings.
- The owner is associated with the authenticated user.
- Invalid fields are rejected.
- Listing status is valid.

### K04 — Verification

Steps:

1. Submit a property for review.
2. Log in as an authorised verifier.
3. Open the review queue.
4. Inspect evidence.
5. Approve or reject the submission.

Expected:

- Verifier can review authorised submissions.
- Verification decision is recorded.
- Property status is updated consistently.
- Property owners cannot approve their own listings.

### K05 — Inspection

Steps:

1. Open a property.
2. Request an inspection.
3. Log in as the authorised property representative.
4. Accept or decline the request.
5. Review the updated status.

Expected:

- Inspection request is created.
- Only authorised participants can manage it.
- Status changes are valid.

### K06 — Suspicious Property Reporting

Steps:

1. Open a property.
2. Submit a report.
3. Log in as an administrator.
4. Open the report dashboard.
5. Investigate and resolve or dismiss the report.

Expected:

- Report is stored.
- Reporting user is recorded.
- Only authorised administrators can moderate reports.
- Report status updates correctly.

### K07 — Trust and Permission Integrity

Test cases:

- Buyer cannot create a property listing.
- Buyer cannot approve a listing.
- Landlord cannot approve their own listing.
- Landlord cannot edit another user's property.
- Agent cannot access unrelated private records.
- Verifier cannot assign themselves admin.
- Admin can perform authorised moderation actions.
- Suspended properties cannot appear as normal verified listings.
- Private evidence cannot be accessed by unauthorised users.

Expected:
All unauthorised operations are rejected by backend permissions.

## 4. Additional Testing

### UI Testing

- Desktop layout.
- Tablet layout.
- Mobile layout.
- Navigation.
- Buttons.
- Forms.
- Loading states.
- Empty states.
- Error messages.

### Database Testing

- Foreign keys.
- Constraints.
- Enum validation.
- RLS policies.
- Triggers.
- Database functions.

### Authentication Testing

- Registration.
- Login.
- Logout.
- Password recovery.
- Session expiry.
- Protected routes.

### File Upload Testing

- Valid file types.
- Invalid file types.
- Maximum file size.
- Private document permissions.
- Image loading failures.

## 5. Regression Testing

After a bug fix:

1. Reproduce the original issue.
2. Implement the correction.
3. Run the relevant test again.
4. Run related workflows.
5. Run the production build.
6. Confirm that existing functionality remains intact.

## 6. Bug Reporting Format

Every discovered issue should include:

Title:
Short description.

Severity:
Critical / High / Medium / Low

Steps to reproduce:
Exact actions that trigger the issue.

Expected result:
What should happen.

Actual result:
What happened.

Evidence:
Screenshot, browser error or test output.

Affected area:
Frontend / Backend / Database / Security.

Status:
Open / In Progress / Fixed / Retested.

## 7. Definition of Test Completion

A feature can be marked tested when:

- Expected workflow passes.
- Invalid input is handled.
- Permissions are checked.
- Relevant error states are tested.
- No critical regression is introduced.
- Production build passes.

## 8. Test Reporting

Test reports must reflect actual execution.

Never claim:

- A browser test passed when it was not run.
- An RLS policy is secure without testing it.
- A property is verified without a real verification decision.
- A feature is complete based only on its UI.

## 9. Release Checklist

- [ ] Production build passes.
- [ ] Authentication tested.
- [ ] Property discovery tested.
- [ ] Listing creation tested.
- [ ] Verification tested.
- [ ] Inspection workflow tested.
- [ ] Reporting tested.
- [ ] RLS policies reviewed.
- [ ] Private storage permissions reviewed.
- [ ] Mobile layouts checked.
- [ ] Critical bugs resolved.
- [ ] Environment variables reviewed.
- [ ] Deployment configuration checked.
