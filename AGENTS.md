# TutorMonkey — Agent Instructions

## 1. Project Context

TutorMonkey is an AI-powered tutoring application.

The repository contains project documentation exported from Notion in `/docs`.

### Source of Truth

- Treat `/docs` as the source of truth for product requirements, milestones, architecture, and design decisions.
- Before starting a task, inspect `/docs` and read the relevant documentation.
- Follow the current milestone's scope. Do not implement features belonging to future milestones.
- Do not invent requirements or make significant product decisions without approval.
- If documentation is missing, ambiguous, or contradictory, ask for clarification.
- If existing code conflicts with documentation, identify the conflict before changing the implementation.
- Explicit user instructions take precedence over repository documentation.

Do not read every document unnecessarily. Read only what is relevant to the current task.

## 2. Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- pnpm

### Backend
- Python
- FastAPI
- uv

Follow the existing repository structure and established conventions.

Do not introduce new frameworks, libraries, or infrastructure without a clear reason.

## 3. Code Style

### No Comments

Code should be self-explanatory. Comments should be avoided as much as possible.

- Write clear, descriptive variable and function names.
- Structure code so its intent is obvious.
- Only add comments if absolutely required, such as explaining a non-obvious workaround or complex algorithm that cannot be simplified.
- If code needs a comment to be understood, refactor it first.

### General Principles

- Prefer simple, readable, maintainable code.
- Avoid premature optimization and overengineering.
- Avoid unnecessary abstractions.
- Keep functions and components focused on a single responsibility.
- Prefer existing utilities and components over duplicate implementations.
- Use descriptive names rather than abbreviations.
- Maintain consistency with surrounding code.
- Remove unused imports, variables, and dead code introduced by your changes.

### TypeScript

- Use strict typing.
- Avoid `any` unless genuinely unavoidable.
- Prefer type inference when types are obvious.
- Define explicit types for shared interfaces and API contracts.
- Avoid unnecessary type assertions.

### Python

- Follow established Python conventions.
- Use type hints for function parameters and return values.
- Prefer straightforward implementations over unnecessary abstraction.
- Use Pydantic models for API request and response validation where appropriate.

## 4. Architecture

- Respect the architecture documented in `/docs`.
- Keep frontend and backend responsibilities clearly separated.
- Avoid unnecessary coupling between modules.
- Keep business logic separate from presentation logic.
- Do not introduce architectural patterns solely for hypothetical future requirements.
- Do not change database schemas, authentication flows, storage architecture, or payment infrastructure without approval.
- Do not introduce new external services without approval.

Favor the simplest implementation that satisfies the documented requirements.

## 5. Frontend Development

### Design System

Follow TutorMonkey's established visual design:

- Notion-inspired interface
- Minimal, clean layouts
- Light and dark theme support
- Warm neutral backgrounds
- Sage green primary accent
- Dusty rose secondary accent

Use the documented color palette and design specifications in `/docs` where available.

### UI Implementation

- Prefer shadcn/ui components when appropriate.
- Use Tailwind CSS for styling.
- Reuse existing components and design tokens.
- Avoid hardcoded colors when design tokens exist.
- Support responsive layouts.
- Maintain accessibility through semantic HTML, keyboard navigation, and appropriate labels.
- Provide appropriate loading, empty, and error states.
- Avoid unnecessary animations and visual complexity.

Do not redesign existing interfaces unless explicitly requested.

## 6. Backend Development

- Follow existing FastAPI conventions.
- Use Pydantic for request and response validation.
- Keep API endpoints focused.
- Separate business logic from HTTP request handling when complexity warrants it.
- Handle errors explicitly.
- Do not expose internal exceptions or sensitive information in API responses.
- Keep configuration and secrets in environment variables.
- Never hardcode credentials or API keys.

Avoid introducing unnecessary layers of abstraction.

## 7. Implementation Workflow

### Before Coding

1. Understand the user's request.
2. Read relevant documentation in `/docs`.
3. Inspect the existing implementation.
4. Identify reusable code and established patterns.
5. Determine the smallest reasonable implementation.

For large or architectural tasks, propose a plan before modifying files.

For straightforward, well-defined tasks, proceed directly.

### During Implementation

- Make focused changes.
- Avoid modifying unrelated files.
- Preserve existing functionality.
- Do not silently expand the task's scope.
- Prefer incremental implementation over large rewrites.
- Do not add dependencies unless necessary.
- Do not modify generated files manually.

### After Implementation

1. Review the changes for correctness.
2. Run relevant linting, type checks, and tests when available.
3. Run a build when appropriate.
4. Fix issues introduced by the changes.
5. Report any checks that could not be completed.

Do not claim that something works unless it has been verified.

## 8. Testing

- Add or update tests when implementing meaningful business logic.
- Test important API behavior and edge cases.
- Prefer focused tests over excessive test coverage.
- Do not write tests solely to increase coverage metrics.
- Do not modify tests merely to make failing code appear correct.
- Do not remove existing tests without justification.

## 9. Safety and Permissions

Ask for approval before:

- Making major architectural changes.
- Adding external services or infrastructure.
- Introducing significant new dependencies.
- Performing destructive database operations.
- Deleting substantial existing functionality.
- Changing authentication, authorization, or payment behavior.
- Modifying production configuration.
- Deploying or publishing the application.

Never expose secrets, credentials, or sensitive user data.

## 10. Communication

- Be concise and technical.
- Explain important tradeoffs when making decisions.
- Ask questions only when ambiguity materially affects implementation.
- Do not repeatedly ask for approval for routine implementation details.
- Clearly distinguish verified behavior from assumptions.
- After completing a task, summarize:
  - What changed.
  - What was tested.
  - Any remaining issues or decisions.

Prioritize working, maintainable software over unnecessary complexity.