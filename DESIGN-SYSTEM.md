# Terminal UI Design System

This document outlines the design principles, visual specifications, and component guidelines for the Interactive Terminal Portfolio. The system creates a cyberpunk-inspired interface that emulates classic computer terminals with modern functionality.

## 1. Core Design Principles

The Terminal UI system is built on four key principles:

1.  Command-Line Aesthetics: Interface elements mimic terminal commands, with prefix identifiers (e.g., `$`, `[USR]`) and a consistent monospace typography.
2.  Segmented Information Architecture: Content is strictly compartmentalized in clearly bordered sections (panels), creating a structured and readable layout.
3.  High-Contrast Monochromatic Palette: The design relies on a limited color palette with a strong distinction between background, text, commands, and interactive elements.
4.  System Feedback Transparency: All significant user actions and system responses are explicitly logged in a prominent, real-time `SystemLog` component, making the application's state transparent.

---

## 2. Color System

The system supports both a dark (default) and a light theme. All colors are defined as custom utilities in `tailwind.config.js`.

### Dark Theme (Default)

| Element             | Tailwind Class          | Hex Code  | Usage                                         |
| :------------------ | :---------------------- | :-------- | :-------------------------------------------- |
| Background          | `bg-dark-bg`            | `#000000` | Main page background.                           |
| Primary Text        | `text-dark-text-primary`| `#4ade80` | Body copy, default text. (green-400)          |
| Secondary Text      | `text-dark-text-secondary`| `#9ca3af` | Subtitles, descriptions, log text. (gray-400) |
| Command Text        | `text-dark-text-command`| `#facc15` | Panel titles (`$`), prefixes (`[USR]`). (yellow-400) |
| Borders             | `border-dark-border`    | `#22c55e` | All panel and component borders. (green-500) |
| Active Element      | `bg-dark-active`        | `#15803d` | Active tab background. (green-800)          |
| Hover State         | `hover:bg-dark-hover`   | `rgba(34, 197, 94, 0.1)` | Subtle background highlight for buttons/links. |
| Error State         | `text-dark-error`       | `#f87171` | Error messages. (red-400)                   |
| Success State       | `text-dark-success`     | `#4ade80` | Success indicators, metrics. (green-400)    |
| Input Background    | `bg-dark-input-bg`      | `#111827` | Background for text input fields. (gray-900)  |

### Light Theme

| Element             | Tailwind Class           | Hex Code  | Usage                                         |
| :------------------ | :----------------------- | :-------- | :-------------------------------------------- |
| Background          | `bg-light-bg`            | `#f3f4f6` | Main page background. (gray-100)            |
| Primary Text        | `text-light-text-primary`| `#166534` | Body copy, default text. (green-800)          |
| Secondary Text      | `text-light-text-secondary`| `#4b5563` | Subtitles, descriptions, log text. (gray-600) |
| Command Text        | `text-light-text-command`| `#ca8a04` | Panel titles, prefixes. (yellow-600)        |
| Borders             | `border-light-border`    | `#15803d` | All panel and component borders. (green-700) |
| Active Element      | `bg-light-active`        | `#dcfce7` | Active tab background. (green-100)          |
| Hover State         | `hover:bg-light-hover`   | `rgba(22, 163, 74, 0.1)`  | Subtle background highlight for buttons/links. |
| Error State         | `text-light-error`       | `#dc2626` | Error messages. (red-600)                   |
| Success State       | `text-light-success`     | `#16a34a` | Success indicators, metrics. (green-600)    |
| Input Background    | `bg-light-input-bg`      | `#ffffff` | Background for text input fields. (white)   |

---

## 3. Typography

Consistency is maintained through a strict typographic scale.

-   Font Family: `font-mono` (`Roboto Mono`) is used exclusively across the entire interface. No other font families are permitted.
-   Font Sizes (defined in `tailwind.config.js`):
    -   `text-xs` (12px): Status labels, log entries, tags.
    -   `text-sm` (14px): Base text, body copy, descriptions.
    -   `text-base` (16px): Command text, panel titles.
    -   `text-lg` (18px): Screen headers.
    -   `text-xl` (20px): Emphasized data values.
-   Text Styles:
    -   No `italic` styles are used.
    -   Emphasis is achieved through `font-bold` or color changes (`text-dark-success`), not size changes.

---

## 4. Layout & Spacing

A consistent spacing system ensures a clean, grid-like structure.

-   Main Layout: The root layout is a vertical `flexbox` with `gap-4` (`1rem`) between the main window, analytics panel, and system log.
-   Container Padding: All primary containers and panels use `p-3` (`0.75rem`) or `p-4` (`1rem`) for internal padding.
-   Vertical Spacing: Vertical rhythm between elements within a panel is managed by a parent `space-y-2` (`0.5rem`) or `space-y-4` (`1rem`).
-   Grid Layouts: Data displays (e.g., in the analytics panel) use CSS Grid (`grid grid-cols-2`) with `gap-x-4` and `gap-y-1` to ensure perfect alignment of key-value pairs.

---

## 5. Component Guidelines

### 5.1. Panels & Containers

-   Borders: All logical content groups must be enclosed in a container with a `1px` border (`border border-dark-border` or `border-light-border`).
-   Radius: All containers use a standard border radius of `rounded` (`0.25rem`).
-   Headers: Panels that have a title must use a header section with a bottom border (`border-b`). The title itself must be styled with the command text color and prefixed with `$`.

### 5.2. Buttons

-   Structure: All interactive navigation elements are `<button>` or `<Link>` tags with consistent styling.
-   Padding: Standard buttons use `p-2` or `p-3`.
-   States:
    -   Default: Transparent background with a `1px` border.
    -   Hover: A subtle background color change (`hover:bg-dark-hover` or `hover:bg-light-hover`). No scaling or shadow effects.
    -   Disabled: `opacity-50` and `cursor-not-allowed`.

### 5.3. System Log Component

-   Structure: A fixed-height container (`h-32`) with vertical scroll (`overflow-y-auto`).
-   Content: Log entries are formatted as `[HH:MM:SS] MESSAGE`.
-   Behavior: Must auto-scroll to the latest entry. The log is capped at the last 20 entries to prevent performance degradation.

### 5.4. State & Interaction

-   Transitions: State changes should be immediate with no CSS animations or transitions, aside from a subtle `transition-colors` on hover states.
-   Focus States: Minimal visual change. No outlines or focus rings. Interactive elements like inputs may have a subtle background color change on focus.
-   Loading States: Asynchronous operations should display text changes (e.g., "AUTHENTICATING...") rather than spinners or skeletons to maintain the terminal aesthetic.