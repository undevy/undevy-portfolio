# Interactive Terminal Portfolio

This project is an interactive portfolio experience designed to look and feel like a classic computer terminal. It features a unique gated access system, dynamic content based on the access code, and detailed, self-hosted analytics. After authentication, the application operates as a seamless Single Page Application (SPA) with hash-based routing.

## Core Features

- Terminal UI & Design System: The entire interface is built around a custom, documented design system that emulates a terminal aesthetic, including monospace fonts, high-contrast themes (dark/light), and command-line-inspired components.
- Gated & Personalized Access: The site is accessible only via a unique code in the URL (`?code=...`). Based on this code, the content—greetings, available projects, and even the experience timeline—is dynamically personalized for the visitor.
- Single Page Application: After initial authentication, all navigation happens client-side with instant screen transitions. URLs use hash routing (`#ScreenName`) to enable bookmarking and sharing while maintaining auth state.
- Decoupled Content: All personalized data is stored in a `content.json` file on the server, completely separate from the application code. The API intelligently merges user profiles with global data.
- Privacy-First Analytics: Using a self-hosted Matomo instance, we track user interactions for each session. The access code is passed as a Custom Dimension, providing granular insights while maintaining full data ownership.
- Automated CI/CD: A GitHub Actions workflow automatically builds, tests, and deploys the application to the production server on every push to the `main` branch.
- Headless CMS via Telegram Bot: Edit portfolio content directly from Telegram without SSH access. Features include content viewing, editing, version history, and automatic backups.

## Live Demo

- Portfolio: [`https://undevy.com`](https://undevy.com)
- Analytics Dashboard: [`https://analytics.undevy.com`](https://analytics.undevy.com)

## Tech Stack

| Technology         | Purpose                        | Implementation Details                                                                                                     |
| :----------------- | :----------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| Next.js        | Full-Stack Framework           | Hybrid architecture: Server-side API for secure data delivery, client-side SPA for seamless navigation. |
| React Context  | State Management               | Comprehensive SessionContext manages navigation, UI state, selections, and system logging across the entire application. |
| Tailwind CSS   | CSS Framework                  | Powers a custom design system defined in `tailwind.config.js`, featuring a full color palette for themes, typography scales, and component styles. |
| Matomo         | Web Analytics                  | Runs in a Docker container on a dedicated subdomain. Tracks user sessions with an `accessCode` Custom Dimension for granular analysis. |
| DigitalOcean   | Cloud Hosting                  | A 1GB RAM Droplet running Ubuntu 22.04 hosts the entire stack.                                                             |
| Nginx          | Web Server / Reverse Proxy     | Manages incoming traffic, handles SSL termination with Certbot (Let's Encrypt), and routes requests to the Next.js app and Matomo service. |
| PM2            | Process Manager                | A production-grade process manager that keeps the Next.js application alive and handles graceful restarts during deployments. |
| Docker         | Containerization               | Isolates the Matomo stack (Matomo + MariaDB), ensuring a clean and reproducible service environment. |
| grammY         | Telegram Bot Framework | Modern, secure library for building the content management bot interface. |
| GitHub Actions | CI/CD Automation               | Automates the entire deployment process from push to production, including building, secure file transfer (SCP), and restarting the app via SSH. |

## System Architecture

### Application Flow
1. User visits `undevy.com?code=XYZ123`
2. Next.js serves the SPA shell
3. Client checks for access code and authenticates via `/api/session`
4. API merges user profile with global data and returns complete session data
5. Application enters SPA mode - all navigation is client-side
6. URLs update with hash routing: `undevy.com?code=XYZ123#Introduction`

### SPA Architecture
```
src/
├── app/
│   ├── screens/          # All screen components
│   │   ├── Entry.js      # Authentication screen
│   │   ├── MainHub.js    # Main navigation menu
│   │   ├── Introduction.js # About section
│   │   ├── Timeline.js   # Experience timeline
│   │   ├── RoleDetail.js # Detailed role information
│   │   ├── CaseList.js   # Filtered case studies
│   │   ├── CaseDetail.js # Case study details
│   │   ├── SkillsGrid.js # Skills matrix
│   │   ├── SkillDetail.js # Skill details
│   │   ├── SideProjects.js # Personal projects
│   │   └── Contact.js    # Contact information
│   ├── components/       
│   │   ├── ui/          # Reusable UI components
│   │   │   ├── Accordion.js # Expandable sections
│   │   │   └── Tabs.js      # Tabbed content
│   │   ├── ScreenRenderer.js # Dynamic screen router
│   │   ├── AnalyticsPanel.js # Session analytics
│   │   └── SystemLog.js      # Real-time activity log
```

### Deployment Architecture
```
[ The Internet ] <--> [ DigitalOcean Droplet ]
                           |
                           |--> [ Nginx (SSL @ Port 443) ]
                                  |
                                  |--> route: undevy.com --> [ PM2 ] -> [ Next.js App (Port 3000) ]
                                  |      |
                                  |      '--> API reads & merges --> [ /home/undevy/content.json ]
                                  |
                                  '--> route: analytics.undevy.com -> [ Docker ] -> [ Matomo Service ]
```

## Project Status & Roadmap

The project is developed in iterative phases. The content plan is based on a detailed prototype.

- Phase 1-3: Foundation & Infrastructure `[COMPLETED]`
    - [x] Set up project, infrastructure, deployment, CI/CD, and analytics
    - [x] Implemented core gated access logic and decoupled content via an API route
    - [x] Built the foundational UI (`TerminalWindow`, themes, global state via Context)

- Phase 4: SPA Transformation `[COMPLETED]`
    - [x] Refactored to Single Page Application architecture
    - [x] Implemented ScreenRenderer for dynamic screen management
    - [x] Created comprehensive SessionContext for state management
    - [x] Built Entry and MainHub screens
    - [x] Added hash-based routing with state preservation
    - [x] Implemented breadcrumb navigation

- Phase 5: Content Implementation `[COMPLETED]`
    - [x] `/experience` Section:
        - [x] Build interactive `Timeline` screen
        - [x] Build `RoleDetail` screen with accordion component
    - [x] `/cases` Section:
        - [x] Build dynamic `CaseList` screen based on config
        - [x] Build `CaseDetail` screen with tabbed navigation
    - [x] `/skills` Section:
        - [x] Build `SkillsGrid` and `SkillDetail` screens
    - [x] `/side_projects` and `/contact` sections

- Phase 6: Headless CMS Development `[IN PROGRESS]`
    - [x] Create secure Admin API with validation
    - [x] Build Telegram bot for content management
    - [x] Implement backup system
    - [ ] Add content editing capabilities

- Phase 7: Polish & Optimization `[FUTURE]`
    - [ ] Add screen transition animations
    - [ ] Implement lazy loading for screen components
    - [ ] Add keyboard navigation support
    - [ ] Mobile responsive design improvements

## Content Management

The portfolio includes a Telegram-based CMS for easy content updates without technical knowledge.

### Setting Up the CMS Bot

1. Create a bot via @BotFather on Telegram
2. Configure the bot environment:
   ```bash
   cd telegram-bot
   cp .env.example .env
   # Edit .env with your bot token and settings
   ```
3. Start the bot:
   ```bash
   npm install
   npm start
   ```

#### Available Commands

- /start - Initialize bot and see available commands
- /status - Check system status and content statistics
- /get - Download current content.json
- /test - Interactive menu with action buttons

#### Security

- Bot access restricted by Telegram User ID
- API protected by Bearer token authentication
- All changes create automatic backups

## Local Development

```bash
# Clone the repository
git clone https://github.com/undevy/undevy-portfolio.git
cd undevy-portfolio

# Install dependencies
npm install

# Run development server
npm run dev
```

Access the local version at `http://localhost:3000/?code=LOCAL_TEST`

## Documentation

- [`/docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - System architecture and data flow
- [`/docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) - Terminal UI design specifications
- [`/docs/CONTENT-MODEL.md`](docs/CONTENT-MODEL.md) - Content structure and data model
- [`/docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) - Server setup and deployment guide
- [`/docs/STRATEGY.md`](docs/STRATEGY.md) - Project vision and success metrics