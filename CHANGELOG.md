# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Refactored
- Centralized the main page layout (TerminalWindow + SystemLog) into the root `layout.js` to ensure consistency across all pages.
- Simplified page components by removing redundant layout and `<main>` tags.

### Fixed
- Resolved issue where the SystemLog component was rendering twice on the main page.
- Corrected the flexbox layout to prevent the SystemLog from shifting on subpages.
- Fixed navigation logging to correctly capture "Back" and "Close" actions.

### Changed
- Updated the main hub title to `$undevy_portfolio`.

### Changed
- Refactored `TerminalWindow` to use `useRouter` and `usePathname` for navigation logic.

### Added
- Implemented responsive behavior for the main window layout (`max-width`).
- Added dynamic "Back" and "Close" navigation controls to the `TerminalWindow` header.
- Implemented a dynamic theme switcher (dark/light) using React Context.
- Created a `ThemeManager` component to dynamically update global body styles.
- Made the `TerminalWindow` layout fully theme-aware.
- Applied the `TerminalWindow` layout to all existing pages for a consistent UI.
- Created a reusable `TerminalWindow` layout component and applied it globally.
- Implemented a global `SessionContext` to manage shared state like themes.
- Implemented the full Terminal UI design system (colors, typography) in Tailwind CSS.
- Enhanced the `content.json` data model with richer information for personalization.

---

## [Iteration 3]
### CI/CD, SSL, and Architecture

### Added
- Configured a full CI/CD pipeline with GitHub Actions for automated deployments on push to `main`.
- Installed and configured an SSL certificate using Let's Encrypt and Certbot for all domains.
- Decoupled content from code by creating a server-side `content.json` file, read by Next.js via `fs`.
- Upgraded DigitalOcean Droplet to 1GB RAM to support the full stack.

---

## [Iteration 2]
### Infrastructure, Deployment, and Analytics

### Added
- Provisioned and secured a DigitalOcean Droplet running Ubuntu 22.04.
- Installed and configured Nginx as a reverse proxy.
- Deployed a self-hosted Matomo analytics instance using Docker and Docker Compose.
- Deployed the Next.js application to the server using PM2 as a process manager.
- Integrated the Matomo tracking script into the application, passing the access code as a Custom Dimension.
- Set up DNS A-records to point `undevy.com` and subdomains to the server.

---

## [Iteration 1]
### Project Scaffolding and Core Logic

### Added
- Initialized the Next.js & Tailwind CSS project.
- Implemented the core gated access logic on the main page, validating a `?code=` URL parameter.
- Created placeholder components for the access gate and main hub.
- Set up the project repository on GitHub.
- Created initial project documentation (`README.md`, `CHANGELOG.md`, `SECRETS.md`).