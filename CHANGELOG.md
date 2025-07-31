# Changelog

All notable changes to this project will be documented in this file.

---

## [Phase 6] - Headless CMS via Telegram Bot

This phase implemented a secure content management system accessible through Telegram, eliminating the need for SSH access to update portfolio content.

### [Phase 6.4] - Interactive Content Editing `[FUTURE]`
-   [ ] Implement `/add_case`: A conversational wizard to create a new case study step by step.
-   [ ] Implement `/edit_case [id]`: An interactive wizard for editing fields of an existing case study.
-   [ ] Implement `/delete_case [id]`: A command to delete a case study with a confirmation step.
-   [ ] Use `grammY conversations` or `session` middleware to manage multi-step user interactions.

### [Phase 6.5] - Analytics Integration `[FUTURE]`
-   [ ] `/analytics`: Fetch and display key statistics from the self-hosted Matomo instance.
-   [ ] Set up alerts for significant events (e.g., a new visitor session with a high-value access code).
-   [ ] Implement a daily/weekly summary report command.

---

### [Phase 6.3] - Content Viewing & Code Stabilization `[COMPLETED]`

This phase implemented the "Read" part of CRUD operations and significantly improved code quality and stability.

#### Added
-   Content Viewing Commands:
    -   `/list_cases`: Displays a list of all available case studies from `content.json`.
    -   `/preview [case_id]`: Shows a detailed preview of a specific case study.
-   Stubs for Future Features: Added placeholder commands for `/edit_case` and `/delete_case` to outline future work.
-   Enhanced Logging: The authorization middleware now logs both successful and unauthorized access attempts.

#### Fixed
-   Critical `replyWithDocument` Bug: The `/get` command now uses `InputFile` for robust file sending, fixing the "invalid file HTTP URL" error.
-   `MarkdownV2` Parsing Errors: All static messages and dynamic content are now correctly escaped for `MarkdownV2`, fixing crashes on commands like `/start` and `/status`.
-   `ReferenceError` in `bot.catch`: Imported `GrammyError` and `HttpError` to ensure the global error handler works correctly.
-   Unsafe Array Check: The `/preview` command now safely checks if `caseDetails.approach` is an array before accessing its properties.

#### Changed
-   Code Refactoring:
    -   Created helper functions `getBackupFiles()` and `parseBackupName()` to remove code duplication (DRY principle).
    -   Moved all `require` statements to the top of the file for consistency and performance.
-   Configuration: The backup directory path is now read from a `.env` variable (`BACKUP_DIR`) for better portability.

---

### [Phase 6.2] - Version Control System `[COMPLETED]`

This phase implemented a robust system for versioning and restoring the `content.json` file.

#### Added
-   Backup & Restore Commands:
    -   `/history`: Displays the last 10 versions of the content file from the backups folder.
    -   `/rollback N`: Allows restoring the content to a previous version with an inline confirmation keyboard.
    -   `/diff N [M]`: Shows a summary of differences between the current version and a backup, or between two backups.

---

### [Phase 6.1] - Foundation & Core API `[COMPLETED]`

This phase laid the groundwork for the entire CMS system.

#### Added
-   Secure API Endpoint: Created a backend API to handle `GET` and `PUT` requests for `content.json`.
-   Automated Backups: The API now automatically creates a timestamped backup of `content.json` before every `PUT` operation.
-   Bot Scaffolding: Initialized a `grammY`-based Telegram bot.
-   Core Commands: Implemented `/start`, `/status`, and `/get` commands.
-   Authorization: Secured the bot by restricting access to a specific `ADMIN_USER_ID` from the `.env` file.

---

## [Phase 5] - Content Implementation

This phase implemented all remaining screens and created a complete, functional portfolio application.

### Added
- All Content Screens:
  - `Contact.js` - Contact information with email copy, external links, and availability status
  - `Introduction.js` - Enhanced profile display with structured data panels
  - `SkillsGrid.js` - Skills matrix with proficiency levels and visual indicators
  - `Timeline.js` - Dynamic experience timeline supporting multiple scenarios
  - `CaseList.js` - Filtered case studies based on user configuration
  - `CaseDetail.js` - Detailed case study view with tabbed content
  - `RoleDetail.js` - Comprehensive role information with expandable sections
  - `SkillDetail.js` - Detailed skill view with examples and impact metrics
  - `SideProjects.js` - Personal projects and public speaking engagements

- Reusable UI Components:
  - `Accordion.js` - Expandable content sections with chevron indicators
  - `Tabs.js` - Tabbed navigation for content organization

- Data Structure Enhancements:
  - Added `contact` object to test-content.json
  - Added `role_details` with comprehensive job information
  - Added `case_details` with challenge/approach/solution/results structure
  - Enhanced `profile` data structure with greeting_name and structured fields

### Changed
- Enhanced `selectedRole`, `selectedCase`, and `selectedSkill` state management in SessionContext
- Improved navigation flow between related screens
- Standardized component structure across all screens

### Technical Improvements
- Consistent theme application across all new screens
- Proper state handling for selected items
- Comprehensive logging for all user interactions
- Responsive layout considerations for all components

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