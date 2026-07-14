# Testing Guidelines

## Purpose
These guidelines define the required testing approach for the TODO app to ensure code quality, reliability, and long-term maintainability.

## Core Principles
- All tests must be isolated and independent.
- Every test must set up its own data and must not depend on test execution order.
- Setup and teardown hooks are required where applicable so tests pass reliably across repeated runs.
- Tests should be readable, maintainable, and aligned with project best practices.
- All new features and bug fixes must include appropriate automated tests.

## Unit Tests
- Framework: Use Jest to test individual functions and React components in isolation.
- Naming convention: Unit tests must use `*.test.js` or `*.test.ts`.
- Backend location: Place backend unit tests in `packages/backend/__tests__/`.
- Frontend location: Place frontend unit tests in `packages/frontend/src/__tests__/`.
- File naming: Name test files to match what they test.
  - Example: `app.test.js` for `app.js`.

## Integration Tests
- Frameworks: Use Jest + Supertest.
- Scope: Test backend API endpoints using real HTTP requests.
- Location: Place integration tests in `packages/backend/__tests__/integration/`.
- Naming convention: Integration tests must use `*.test.js` or `*.test.ts`.
- File naming: Name files clearly based on endpoint/domain under test.
  - Example: `todos-api.test.js` for TODO API endpoints.

## End-to-End (E2E) Tests
- Framework: Playwright (required).
- Scope: Test complete UI workflows through browser automation.
- Location: Place E2E tests in `tests/e2e/`.
- Naming convention: E2E tests must use `*.spec.js` or `*.spec.ts`.
- File naming: Name files by user journey.
  - Example: `todo-workflow.spec.js`.

## Playwright-Specific Requirements
- Use one browser only for Playwright test execution.
- Use the Page Object Model (POM) pattern for maintainable E2E tests.
- Limit E2E coverage to 5-8 critical user journeys.
- Prioritize happy paths and key edge cases over exhaustive UI permutations.

## Port Configuration Standards
Always use environment variables with sensible defaults for ports so local runs and CI/CD are compatible.

- Backend:

```js
const PORT = process.env.PORT || 3030;
```

- Frontend:
  - Default React development port is `3000`.
  - Allow overriding via `PORT` environment variable.

This enables CI/CD pipelines and test runners to assign dynamic ports safely.

## Test Maintenance Expectations
- Keep tests deterministic and avoid flaky timing assumptions.
- Prefer explicit assertions with clear failure messages.
- Refactor test utilities when duplication appears across suites.
- Update or add tests whenever behavior changes.
- Ensure test structure and naming remain consistent with this guide.
