# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Known Issues
- Close button (×) doesn't properly logout - it redirects but the code remains in URL causing re-authentication

---

## [Iteration #8] - SPA Transformation

This iteration completely transformed the application from file-based routing to a true Single Page Application with hash-based navigation.

### Added
- ScreenRenderer Component: Central router that dynamically renders screens based on SessionContext state
- Screen Components Architecture: All screens now live in `/src/app/screens/` directory
  - `Entry.js` - Simplified authentication screen with code input
  - `MainHub.js` - Main navigation menu with dynamic content from sessionData
  - Placeholder screens for all other sections
- Hash-Based Routing: Navigation updates URL hash while preserving query parameters
- Breadcrumb Navigation: Clickable navigation path in analytics panel
- Visit Counter: `screensVisitedCount` that tracks total screen visits (never decreases)
- GET CODE Button: Opens Telegram link in new tab for requesting access codes

### Changed
- API Route Enhancement: `/api/session` now merges user profiles with GLOBAL_DATA intelligently
  - Filters content based on user configuration
  - Returns complete session data in single response
- SessionContext Expansion: Now manages entire application state
  - Navigation (currentScreen, history, navigate, goBack)
  - Selections (case, role, skill)
  - UI state (theme, expanded sections, tabs)
  - Session management (data, endSession)
- Authentication Flow: Moved from page component to dedicated Entry screen
- URL Format: Now uses `/?code=CODE#ScreenName` pattern

### Removed
- File-based routing directories (`/overview`, `/experience`)
- Old Navigation component
- Fixed height from TerminalWindow
- Test codes display in Entry screen

### Fixed
- Auto-authentication when URL contains code parameter
- Navigation history properly maintained through breadcrumbs
- Theme state persistence across screens
- Container width consistency (all max-w-2xl)

---

## [Phase 4] - UI Foundation & State Management

This phase focused on building the UI foundation and establishing proper state management patterns.

### Added
- Implemented a global `SessionContext` to manage all shared client-side state
- Implemented a dynamic theme switcher (dark/light) with a `ThemeManager`
- Created a real-time `SystemLog` and a dynamic `AnalyticsPanel`
- Added dynamic "Back" and "Close" navigation controls to the header
- Built out the complete user flow for the `/overview` section (`Introduction`, `CurrentStatus`, `ValueProp`)
- Created reusable panel components (`ProfileDataPanel`, `ConfigurationPanel`)

### Changed
- Enhanced the `content.json` data model with richer information for full personalization
- Updated the main hub title to `$undevy_portfolio`

### Refactored
- Centralized the main page layout: The entire structure (`TerminalWindow` + `AnalyticsPanel` + `SystemLog`) is now managed in the root `layout.js`, ensuring consistency across all pages
- Simplified all page components by removing redundant layout tags

### Fixed
- Resolved layout bugs where components would render twice or shift position on subpages
- Corrected navigation logging to properly capture "Back" and "Close" actions
- Fixed critical bugs related to font loading and build errors (`Suspense` boundary)

---

## [Phase 3] - Infrastructure & Core Logic

This phase focused on building the backend infrastructure, deploying the application, and establishing the core data flow.

### Added
- Deployed a self-hosted Matomo analytics instance using Docker
- Integrated the Matomo tracking script with a `accessCode` Custom Dimension
- Implemented a decoupled content architecture with a server-side `content.json` file
- Created a Next.js API Route (`/api/session`) to securely serve personalized content
- Deployed the Next.js application using PM2 and configured Nginx as a reverse proxy
- Secured all endpoints with SSL certificates from Let's Encrypt

### Infrastructure Details
- Provisioned DigitalOcean Droplet (1GB RAM, Ubuntu 22.04)
- Configured UFW firewall for security
- Set up Docker Compose for Matomo + MariaDB
- Established PM2 for Node.js process management
- Configured Nginx for reverse proxy and SSL termination

---

## [Phase 2] - Project Scaffolding & CI/CD

This phase laid the groundwork for automation and initial functionality.

### Added
- Initialized the Next.js and Tailwind CSS project
- Set up the project repository on GitHub
- Implemented the foundational gated access logic based on a `?code=` URL parameter
- Established a complete CI/CD pipeline using GitHub Actions for automated deployments
- Created comprehensive documentation structure

### Technical Setup
- Node.js v20.x with npm
- Next.js 14 with App Router
- Tailwind CSS with custom design system
- GitHub Actions workflow for automated deployment
- SSH key-based authentication for deployment

---

## [Phase 1] - Project Inception

### Added
- Created initial project documentation (`README.md`, `CHANGELOG.md`, architecture plans)
- Defined project goals and technical requirements
- Established coding standards and collaboration protocols
- Set up local development environment