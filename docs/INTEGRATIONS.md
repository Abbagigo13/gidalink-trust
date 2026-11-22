# Integrations

# GidaLink Trust

## 1. Overview

GidaLink Trust is designed to integrate with external services where they provide meaningful product value.

Integrations should be introduced gradually and must not compromise security, reliability or affordability.

## 2. Current Core Integration

### Supabase

Purpose:
Backend infrastructure.

Services:

- Authentication.
- PostgreSQL database.
- Row Level Security.
- Storage.
- Database functions.
- Triggers.

Status:
Initial project and database foundation established.

Remaining:
Complete application integration and test all workflows.

## 3. Development Integrations

### GitHub

Purpose:
Source code management and collaboration.

Potential functionality:

- Repository hosting.
- Version control.
- Pull requests.
- Issue tracking.
- Release management.

### Kane CLI / KaneAI

Purpose:
Browser testing and quality assurance.

Potential functionality:

- Test property discovery.
- Test authentication.
- Test property submission.
- Test verification workflows.
- Test inspection requests.
- Test reporting.
- Retest fixes.

Kane is a testing tool, not the primary application backend or coding agent.

## 4. Future Product Integrations

### Maps

Potential providers:

- Google Maps Platform.
- Mapbox.
- OpenStreetMap-based services.

Purpose:

- Property location display.
- Map-based search.
- Neighbourhood discovery.
- Location visualisation.

Provider selection should consider pricing, coverage and licensing.

### Email Notifications

Potential providers:

- Resend.
- Postmark.
- Other suitable transactional email services.

Purpose:

- Registration messages.
- Password recovery.
- Inspection updates.
- Verification decisions.
- Report updates.

### Messaging

Future options:

- In-app messaging.
- Realtime messaging through Supabase.
- External messaging providers where appropriate.

### Image Storage and Processing

Initial approach:
Supabase Storage.

Potential future capabilities:

- Image resizing.
- Compression.
- Thumbnail generation.
- Duplicate image detection.

### AI Assistance

Potential applications:

- Suspicious listing analysis.
- Duplicate property detection.
- Description quality checks.
- Moderation assistance.

AI must not independently certify legal property ownership.

## 5. Integration Standards

Every integration should:

- Solve a defined problem.
- Have a clear owner.
- Use secure credentials.
- Handle errors.
- Have appropriate rate limits.
- Be documented.
- Be tested.
- Be monitored for recurring costs.

## 6. Environment Variables

External service credentials must be stored in the appropriate environment or secret manager.

Never commit private API keys.

Public frontend configuration must not contain privileged credentials.

## 7. Cost Management

Before introducing a paid integration:

1. Review its pricing.
2. Check free-tier limits.
3. Estimate expected usage.
4. Identify recurring charges.
5. Consider simpler alternatives.
6. Avoid unnecessary services.

## 8. Integration Roadmap

Initial:

- Supabase.
- GitHub.
- Kane CLI/KaneAI.

Later:

- Email notifications.
- Mapping.
- In-app messaging.
- Image processing.

Future:

- AI-assisted trust analysis.
- Additional property data services.
- External verification providers where legally and technically appropriate.
