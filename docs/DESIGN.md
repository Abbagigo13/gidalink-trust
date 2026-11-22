# Design System

# GidaLink Trust

Version: 1.0

## 1. Design Direction

GidaLink Trust uses a Premium Editorial Real Estate design direction.

The interface should feel like a premium property publication rather than a generic SaaS dashboard.

The visual experience should communicate:

- Trust
- Elegance
- Professionalism
- Simplicity
- Transparency
- Confidence

## 2. Visual Identity

### Colour Palette

Primary background:

- Warm ivory: #F8F7F3

Primary text:

- Dark ink: #20221E

Primary brand:

- Forest green: #315B48

Dark green:

- #244534

Muted text:

- #77786F

Borders:

- #E6E3DC

Status colours should be used consistently:

- Verified: green.
- Pending review: amber.
- Rejected: red.
- Suspended: dark red or neutral warning.
- Draft: muted grey.

## 3. Typography

Primary display font:

- Playfair Display

Body typography:

- Clean sans-serif font.

Typography hierarchy:

- Large editorial headings.
- Medium section headings.
- Clear property titles.
- Small muted metadata.
- Readable body descriptions.

## 4. Photography

Architectural photography is a major part of the GidaLink identity.

Requirements:

- Use high-quality property photography.
- Preserve the existing sample property images.
- Use consistent image aspect ratios.
- Avoid distorted images.
- Use object-fit: cover.
- Provide graceful image fallbacks.

Sample properties must be identified as illustrative demo content.

## 5. Layout Principles

- Generous whitespace.
- Clear visual hierarchy.
- Consistent alignment.
- Minimal decorative elements.
- Responsive property grids.
- Consistent card spacing.
- Clear separation between content sections.

## 6. Main Application Screens

### Public

- Homepage.
- Property discovery.
- Search results.
- Property detail.
- Login.
- Registration.

### User

- User dashboard.
- Profile settings.
- Favourite properties.
- Inspection requests.

### Landlord and Agent

- Listing dashboard.
- Create listing.
- Edit listing.
- Listing status.
- Inspection management.

### Verifier

- Verification dashboard.
- Review queue.
- Evidence review.
- Approve or reject submission.
- Verification history.

### Administrator

- Admin dashboard.
- User management.
- Property moderation.
- Report management.
- Audit history.

## 7. Property Cards

Each property card should support:

- Property photograph.
- Listing title.
- Location.
- Price.
- Listing category.
- Bedrooms and bathrooms where applicable.
- Verification status.
- Favourite control.
- Property details link.

Do not present demo verification as genuine verification.

## 8. Responsive Design

Desktop:

- Three-column property grid where space allows.
- Full navigation.
- Spacious content layout.

Tablet:

- Two-column property grid.
- Adapted navigation.

Mobile:

- Single-column property grid.
- Compact navigation.
- Touch-friendly controls.
- Readable property details.
- No horizontal overflow.

## 9. Interaction Principles

- Buttons must provide visible feedback.
- Forms must display validation errors.
- Loading states must be visible.
- Empty states must explain what happened.
- Destructive actions should require confirmation.
- Navigation must lead to working pages.

## 10. Design Consistency

New features must extend the existing design system.

Do not replace the existing homepage, architectural images or sample property cards when implementing backend functionality.

Avoid generic dashboard styling that conflicts with the premium editorial identity.
