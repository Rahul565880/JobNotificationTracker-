## Job Notification App – Design System Foundation

This repository contains the **foundational design system** for the Job Notification App. It focuses on **tokens, layout, and core UI components**, without any product-specific features or business logic.

### Design Philosophy

- **Calm, intentional, coherent, confident**
- **Not** flashy, playful, or hackathon-style
- No gradients, glassmorphism, neon colors, or animation noise

### Color System

All colors are expressed as a small, deliberate set of tokens. No other hex colors should be introduced.

- **Background**: `--color-bg = #F7F6F3` (off‑white, never pure white)
- **Primary text**: `--color-text = #111111`
- **Accent (primary action)**: `--color-accent = #8B0000` (deep red)
- **Success**: `--color-success = #2F6A4F` (muted green)
- **Warning**: `--color-warning = #A26B1F` (muted amber)

Neutrals and borders are derived from the text color using alpha (e.g. `rgba(17, 17, 17, 0.08)`) instead of new hex values. Do **not** add new brand colors.

### Typography

- **Headings (display/section titles)**: serif stack  
  `--font-serif: "Georgia", "Times New Roman", serif;`
- **Body and UI**: clean sans-serif stack  
  `--font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;`
- **Body size**: 16–18px only, with line-height 1.6–1.8
- **Max readable text width**: 720px (`.text-block`)
- No decorative fonts, no ad-hoc font sizes.

Recommended type tokens:

- `--font-size-body: 16px`
- `--font-size-body-large: 18px`
- `--font-size-heading-lg: 32px`
- `--font-size-heading-xl: 40px`

### Spacing System

Only the following spacing tokens are allowed. All paddings, margins, and gaps must use this scale:

- `--space-1: 8px`
- `--space-2: 16px`
- `--space-3: 24px`
- `--space-4: 40px`
- `--space-5: 64px`

No arbitrary spacing values (e.g. 13px, 27px) should appear anywhere.

### Global Layout Structure

Every page follows the same high-level structure:

1. **Top Bar**
   - Left: App name (`Job Notification App`)
   - Center: Progress indicator (`Step X / Y`)
   - Right: Status badge (`Not Started`, `In Progress`, `Shipped`)
2. **Context Header**
   - Large serif headline
   - One-line subtext
   - Clear, neutral purpose (no hype language)
3. **Primary Workspace (70%) + Secondary Panel (30%)**
   - Two-column layout on desktop
   - Primary workspace uses cards with subtle borders and predictable components
   - Secondary panel contains step explanation, a copyable prompt box, and consistently styled buttons
4. **Proof Footer**
   - Fixed structure checklist:
     - □ UI Built
     - □ Logic Working
     - □ Test Passed
     - □ Deployed

The reference implementation of this layout is in `index.html` styled by `styles.css`.

### Core Components

All components are defined using semantic HTML with classes and CSS tokens.

- **Buttons**
  - Primary button: `.button.button--primary`
    - Solid deep red background (`--color-accent`)
    - Text on primary uses the background color token for high contrast
  - Secondary button: `.button.button--secondary`
    - Transparent background, 1px border using subtle neutral
  - Shared rules:
    - Same border radius everywhere (`--radius-md`)
    - Minimum touch target height of 40px
    - Transitions (hover/focus/active) between 150–200ms, `ease-in-out`

- **Inputs**
  - `.field`, `.field-label`, `.field-input`
  - Clean 1px border with alpha-based neutral
  - Clear focus state using `--color-accent` (border + subtle outline)
  - No inner shadows, no heavy chrome

- **Cards**
  - `.card`
    - Subtle 1px border
    - Shared radius token (`--radius-md`)
    - No drop shadows
    - Used for sections inside both primary and secondary panels

- **Status badge**
  - `.status-badge` + modifiers:
    - `.status-badge--idle` (Not Started)
    - `.status-badge--active` (In Progress)
    - `.status-badge--shipped` (Shipped)
  - Uses border, background tints, and text color derived from the main tokens.

- **Alerts and States**
  - `.alert.alert--error`
    - Uses accent color to indicate errors
    - Copy explains what went wrong and how to fix it; never blames the user
  - `.alert.alert--empty`
    - Empty state with a clear next step (reference to using a primary action or configuration)

- **Prompt box**
  - `.prompt-box`
    - Monospace or regular sans-serif with subtle border
    - Optional copy button styled as a secondary button
    - Intended for “copyable prompt” content in the secondary panel

### Interaction Rules

- Transitions: **150–200ms**, `ease-in-out`
- No bounce, parallax, or attention-grabbing animation
- Hover and focus rely on small, predictable changes:
  - Background lightening/darkening
  - Border emphasis
  - Underlines on text links where needed

### Error & Empty States

- Errors:
  - Explain **what happened**, **what it affects**, and **how to fix it**
  - Example: “We couldn’t save this notification rule. Check your network connection and try again. Your current changes are safe on this page.”
  - Never blame the user or use negative language.
- Empty:
  - Always show a concise explanation and a suggested next action.
  - Example: “You haven’t set up any notification rules yet. Use the primary action above to create your first rule.”

### Files in This Design System

- **`index.html`**  
  Example page implementing:
  - Top Bar
  - Context Header
  - Primary workspace and secondary panel
  - Proof footer checklist
  - Sample cards, buttons, inputs, alerts, and empty state

- **`styles.css`**  
  Contains:
  - Design tokens (colors, typography, spacing, radius, transitions)
  - Global resets and base typography
  - Layout primitives (shell, top bar, context header, workspace grid, footer)
  - Component styles for buttons, inputs, cards, badges, alerts, and prompt box

### How to Use

- Treat the CSS variables and component classes as the **single source of truth** for the design system.
- When introducing new UI:
  - Reuse existing layout primitives (`.app-shell`, `.app-main`, `.workspace`)
  - Reuse and compose existing components (`.card`, `.button`, `.field`, `.status-badge`, `.alert`)
  - Only use the defined color, spacing, and typography tokens.
- When integrating into a framework (React, Vue, etc.), wrap these classes into components but **do not** change the underlying design tokens or introduce new ad-hoc styles.

This repository currently contains the **foundation only**. No product features, flows, or domain logic have been implemented yet.

