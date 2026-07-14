# Coding Guidelines

## Purpose
These guidelines define the coding style and quality principles for the TODO app so the codebase remains consistent, readable, and maintainable as the project grows.

## Coding Philosophy
- Prefer clarity over cleverness.
- Keep code small, focused, and easy to reason about.
- Follow the DRY principle, but avoid over-abstraction.
- Optimize for maintainability first, then performance when needed.

## General Formatting Rules
- Use consistent indentation and whitespace per existing project files.
- Keep line length readable (target around 100 characters where practical).
- Use meaningful names for variables, functions, and files.
- Avoid single-letter names except in short, obvious contexts (for example, loop indexes).
- Use trailing commas and semicolons consistently according to project linting rules.

## File and Module Organization
- Keep files focused on one clear responsibility.
- Group related modules by feature or domain where possible.
- Avoid very large files; split when responsibilities diverge.
- Use index files only when they improve discoverability, not to hide structure.

## Import Organization
- Keep imports at the top of the file.
- Group imports in a consistent order:
  1. External packages
  2. Internal absolute or alias imports
  3. Relative imports
- Separate import groups with a blank line.
- Remove unused imports.
- Prefer named exports/imports for clarity unless a default export is clearly justified.

## JavaScript and React Best Practices
- Prefer `const`; use `let` only when reassignment is required.
- Avoid `var`.
- Use strict equality (`===` and `!==`).
- Prefer early returns to reduce nested conditionals.
- Keep functions small and focused on one behavior.
- In React, keep components composable and avoid excessive prop drilling.
- Move reusable UI logic into custom hooks or utility modules when duplication appears.

## Error Handling and Validation
- Validate inputs at system boundaries (API handlers, form submissions, utility entry points).
- Fail fast with clear, actionable error messages.
- Do not swallow errors silently.
- Handle async errors explicitly with `try/catch` where appropriate.

## Linting and Static Quality Checks
- Use ESLint as the baseline linter across frontend and backend code.
- Fix lint errors before merging changes.
- Warnings should be addressed unless there is a documented reason not to.
- Do not disable lint rules globally without team agreement.
- If a local rule disable is unavoidable, scope it narrowly and include a short rationale.

## DRY and Reuse Guidance
- Extract duplicated business logic into shared utilities.
- Do not duplicate validation logic across handlers/components when a shared helper is practical.
- Balance DRY with readability: duplication is sometimes preferable to fragile abstractions.
- Refactor repeated patterns once they are stable and clearly recurring.

## Comments and Documentation
- Write self-explanatory code first; use comments to explain why, not what.
- Keep comments concise and accurate.
- Update comments and docs when behavior changes.
- Public or shared functions should include short usage-oriented documentation when non-obvious.

## Code Review Readiness
- Keep pull requests focused and scoped.
- Ensure naming, structure, and behavior are consistent with existing patterns.
- Verify tests and lint checks pass before requesting review.
- Include tests for new behavior and bug fixes.

## Maintainability Checklist
Before finalizing a change, confirm:
- The code is readable and consistent with this guide.
- Duplication is minimized and intentional.
- Imports are organized and unused code is removed.
- Lint checks pass without broad rule suppression.
- Tests are added or updated where behavior changed.
