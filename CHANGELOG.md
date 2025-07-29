# Changelog

All notable changes to this project will be documented in this file.

---

## [Phase 6] - Headless CMS via Telegram Bot

This phase implemented a secure content management system accessible through Telegram, eliminating the need for SSH access to update portfolio content.

### Added
- **Admin API Endpoint** (`/api/admin/content`):
  - GET method to retrieve current content.json with statistics
  - PUT method to completely replace content.json
  - PATCH method for partial updates (with path-based targeting)
  - Bearer token authentication for all methods
  - Automatic JSON structure validation
  - Backup system that maintains last 10 versions

- **Content Validation System**:
  - `validator.js` module for structure verification
  - Ensures required fields (GLOBAL_DATA, profiles)
  - Validates profile meta structure
  - Prevents saving of malformed JSON

- **Telegram Bot Integration**:
  - Built with grammY library (modern, secure alternative to node-telegram-bot-api)
  - Commands: `/start`, `/status`, `/get`, `/test`
  - Inline keyboard navigation
  - User ID-based access control
  - Automatic file sending for large JSON responses

### Security Considerations
- API protected by Bearer token (to be replaced in production)
- Telegram bot restricted to admin user ID
- All modifications create automatic backups
- Content validation prevents structure corruption

### Technical Decisions
- Chose grammY over node-telegram-bot-api due to security vulnerabilities in the latter's dependencies
- Implemented path-based updates for future granular editing
- Backup retention limited to 10 versions to prevent disk overflow

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