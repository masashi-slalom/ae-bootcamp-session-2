# UI Guidelines

## Purpose
These guidelines define the core user interface standards for the TODO app to ensure consistency, usability, and accessibility across screens.

## Design System
- Use Material Design components for all core UI elements.
- Prefer component usage from one Material-based library consistently across the app.
- Do not mix multiple UI libraries for primary controls.

## Visual Style
- Keep the UI clean, simple, and task-focused.
- Use consistent spacing and alignment with an 8px spacing scale.
- Use card-based grouping for task lists and related actions.

## Color Palette
- Primary color: `#1976D2` (buttons, active states, key actions).
- Secondary color: `#455A64` (supporting UI accents).
- Success color: `#2E7D32` (completed/success states).
- Warning color: `#ED6C02` (warnings, upcoming due dates).
- Error color: `#D32F2F` (validation errors, destructive actions).
- Background color: `#F5F7FA` (page background).
- Surface color: `#FFFFFF` (cards, modals, panels).
- Text colors:
  - Primary text: `#1F2937`
  - Secondary text: `#6B7280`

## Typography
- Use the Material default typography scale.
- Base font size should be 16px for body text.
- Ensure line-height is readable (minimum 1.4 for body content).
- Use clear heading hierarchy (H1, H2, H3) without skipping levels.

## Buttons and Inputs
- Use contained primary buttons for main actions (for example, Add Task, Save).
- Use outlined or text buttons for secondary actions.
- Use destructive button styling for delete actions (error color).
- Maintain consistent button height, padding, and corner radius.
- All input fields must have visible labels and helpful placeholder examples where relevant.

## Task List UI Behavior
- Each task item should show:
  - Completion checkbox
  - Task title
  - Optional due date
  - Edit action
  - Delete action
- Completed tasks should have a clear visual state change (for example, dimmed text and strikethrough).
- Overdue tasks should be visually highlighted without relying on color alone.

## Layout and Responsiveness
- Mobile-first layout.
- Support common viewport widths from 320px and up.
- On small screens, stack controls vertically where needed.
- Keep primary actions reachable and visible without excessive scrolling.

## Feedback and States
- Show clear hover, focus, active, disabled, loading, empty, and error states.
- Show inline validation messages for form errors.
- Use snackbars or alerts for important action feedback (for example, task saved, task deleted).

## Accessibility Requirements
- Meet WCAG 2.1 AA contrast standards.
- Ensure full keyboard navigation for all interactive elements.
- Provide visible focus indicators for keyboard users.
- Ensure interactive targets are at least 44px by 44px.
- Use semantic HTML and ARIA attributes only when necessary.
- Associate all form controls with labels.
- Do not rely on color alone to convey status.

## Icons and Motion
- Use Material icons consistently for common actions.
- Keep animations subtle and purposeful (100ms to 250ms typical duration).
- Respect reduced motion preferences when enabled by the user.

## Consistency Rules
- Reuse shared components for repeated UI patterns.
- Keep labels, terminology, and action names consistent throughout the app.
- Avoid one-off custom styles unless there is a clear product need.
