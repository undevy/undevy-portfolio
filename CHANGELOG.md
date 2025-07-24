# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Deployment:**
  - Deployed the Next.js application to the server.
  - Configured Nginx to serve the main site and Matomo on different subdomains.
  - Installed and configured PM2 to manage the application process.
- **Infrastructure:**
  - Installed and configured Matomo via Docker.
  - Configured Nginx as a reverse proxy for Matomo.
  - Set up DNS A-records for undevy.com.
  - Upgraded Droplet to 1GB RAM to support the stack.
  - Provisioned a new Droplet on DigitalOcean (Frankfurt).
- **Gated Access Logic:**
  - Implemented the core gated access logic on the main page.
- **Project Maintenance:**
  - Created and maintained `SECRETS.md` and `CHANGELOG.md`.
