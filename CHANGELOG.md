# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Infrastructure:**
  - Provisioned a new Droplet on DigitalOcean (Frankfurt).
- **Gated Access Logic:**
  - Implemented the core gated access logic on the main page.
  - The page now checks for a `?code=` parameter in the URL.
  - Displays a welcome message with personalized content for valid codes.
  - Displays an "Access Required" message for invalid or missing codes.
  - Created placeholder components `MainHub` and `AccessGate`.
  - Added a mock database of valid codes directly in `page.js`.
- **Project Maintenance:**
  - Cleaned up default Next.js styles and page content.
  - Created `CHANGELOG.md` to track project progress.
  - Created `SECRETS.md` and added it to `.gitignore`.
