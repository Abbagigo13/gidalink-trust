# MCP Connection Guide

# GidaLink Trust

## 1. Purpose

Model Context Protocol (MCP) allows compatible AI tools to connect to external tools and services through a standardised interface.

For GidaLink Trust, MCP may be used to improve development, database inspection, testing and automation.

MCP is a development and integration capability, not a requirement for the public marketplace to function.

## 2. Potential MCP Connections

### Supabase MCP

Potential capabilities:

- Inspect database schema.
- Review tables.
- Inspect migrations.
- Execute approved database operations.
- Investigate database errors.

### GitHub MCP

Potential capabilities:

- Inspect repository files.
- Review changes.
- Manage issues.
- Review pull requests.
- Assist with development workflows.

### Browser Testing Tools

Potential capabilities:

- Navigate the application.
- Test user workflows.
- Inspect browser errors.
- Validate responsive layouts.
- Report failures.

Kane CLI/KaneAI remains part of the planned testing workflow.

## 3. Security Requirements

MCP connections must follow least-privilege principles.

- Use the minimum required permissions.
- Avoid unrestricted production database access.
- Do not expose service-role credentials.
- Do not allow an agent to modify production data without approval.
- Review destructive operations.
- Keep credentials outside source control.

## 4. Development Workflow

Coding agent:

- Implements features.
- Updates code.
- Creates migrations when needed.

MCP-connected tools:

- Inspect permitted resources.
- Assist with database and repository workflows.

Kane:

- Runs browser scenarios.
- Reports bugs.
- Retests fixes.

Developer:

- Reviews changes.
- Approves sensitive operations.
- Confirms test results.

## 5. Connection Configuration

Connection details depend on the MCP client being used.

Use the official documentation for:

- Supabase MCP.
- GitHub MCP.
- The selected browser-testing integration.

Do not copy credentials into this documentation.

## 6. Approval Rules

Require explicit review before:

- Dropping tables.
- Deleting records.
- Changing production RLS policies.
- Changing user roles.
- Modifying production authentication settings.
- Exposing private documents.

## 7. Implementation Status

MCP integration is an optional development enhancement.

A connection should only be marked active after it has been configured and tested successfully.
