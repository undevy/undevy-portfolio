# ⚠️ REPOSITORY MOVED

This repository has been moved to the organization account.

**New location:** https://github.com/undevy-org/portfolio

Please update your bookmarks and local clones.

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

- Portfolio: `https://your-domain.com`
- Analytics Dashboard: `https://analytics.your-domain.com`

## Tech Stack

| Technology         | Purpose                        | Implementation Details                                                                                                     |
| :----------------- | :----------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| Next.js        | Full-Stack Framework           | Hybrid architecture: Server-side API for secure data delivery, client-side SPA for seamless navigation. |
| React Context  | State Management               | Comprehensive SessionContext manages navigation, UI state, selections, and system logging across the entire application. |
| Tailwind CSS   | CSS Framework                  | Powers a custom design system defined in `tailwind.config.js`, featuring a full color palette for themes, typography scales, and component styles. |
| Matomo         | Web Analytics                  | Runs in a Docker container on a dedicated subdomain. Tracks user sessions with an `accessCode` Custom Dimension for granular analysis. |
| DigitalOcean   | Cloud Hosting                  | A 2GB RAM Droplet running Ubuntu 22.04 hosts the entire stack.                                                             |
| Nginx          | Web Server / Reverse Proxy     | Manages incoming traffic, handles SSL termination with Certbot (Let's Encrypt), and routes requests to the Next.js app and Matomo service. |
| PM2            | Process Manager                | A production-grade process manager that keeps the Next.js application alive and handles graceful restarts during deployments. |
| Docker         | Containerization               | Isolates the Matomo stack (Matomo + MariaDB), ensuring a clean and reproducible service environment. |
| grammY         | Telegram Bot Framework | Modern, secure library for building the content management bot interface. |
| GitHub Actions | CI/CD Automation               | Automates the entire deployment process from push to production, including building, secure file transfer (SCP), and restarting the app via SSH. |

## System Architecture

### Application Flow
1. User visits `your-domain.com?code=XYZ123`
2. Next.js serves the SPA shell
3. Client checks for access code and authenticates via `/api/session`
4. API merges user profile with global data and returns complete session data
5. Application enters SPA mode - all navigation is client-side
6. URLs update with hash routing: `your-domain.com?code=XYZ123#Introduction`

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
                                  |--> route: your-domain.com --> [ PM2 ] -> [ Next.js App (Port 3000) ]
                                  |      |
                                  |      '--> API reads & merges --> [ /home/undevy/content.json ]
                                  |
                                  '--> route: analytics.your-domain.com -> [ Docker ] -> [ Matomo Service ]
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

- Phase 6: Headless CMS Development `[COMPLETED]`
    - [x] Create secure Admin API with validation
    - [x] Build Telegram bot for content management
    - [x] Implement backup system
    - [x] Add content editing capabilities
    - [x] Interactive case study creation wizard
    - [x] Case study editing with field preservation
    - [x] Safe deletion with preview and warnings

- Phase 7: Polish & Optimization `[FUTURE]`
    - [ ] Add screen transition animations
    - [ ] Implement lazy loading for screen components
    - [ ] Add keyboard navigation support
    - [ ] Mobile responsive design improvements

## Content Management

The portfolio includes a Telegram-based CMS for easy content updates without technical knowledge.

### Bot Architecture (v2.0)

The bot has been refactored into a modular architecture for better maintainability:

```
telegram-bot/
├── bot.js                    # Main orchestrator
├── config/
│   └── constants.js          # All configuration and constants
├── commands/                 # Bot command handlers
│   ├── system.js            # Basic commands (start, status, help)
│   ├── content.js           # Content management commands
│   ├── analytics.js         # Analytics integration
│   └── index.js             # Command registration
├── handlers/                 # Event and interaction handlers
│   ├── callbacks.js         # Inline button handlers
│   ├── conversations.js     # Multi-step dialog flows
│   └── errors.js            # Global error handling
├── services/                 # External service integrations
│   ├── api.js               # Portfolio API client
│   ├── backup.js            # Backup management
│   └── matomo.js            # Analytics API client
├── utils/                    # Helper functions
│   ├── format.js            # Text formatting utilities
│   ├── validators.js        # Input validation
│   └── helpers.js           # General utilities
├── middleware/
│   └── auth.js              # Authorization checks
├── stateManager.js          # Conversation state management
└── analytics.js             # Real-time visitor monitoring
```

This modular structure makes the bot easier to maintain, test, and extend with new features.

#### Available Commands

**Basic Operations:**
- `/start` - Initialize bot and see available commands
- `/status` - Check system status and content statistics
- `/get` - Download current content.json
- `/history` - View last 10 content versions
- `/rollback N` - Restore content to version N

**Case Study Management:**
- `/list_cases` - View all available case studies
- `/preview [case_id]` - View detailed case study information
- `/add_case` - Create new case study (interactive 10-step wizard)
- `/edit_case [case_id]` - Edit existing case study
- `/delete_case [case_id]` - Delete case study with preview confirmation

**Helper Commands:**
- `/cancel` - Cancel any active conversation
- `/skip` - Skip optional fields during case creation
- `/keep` - Keep existing value during case editing

#### Interactive Workflows

The bot uses a conversational interface for complex operations:

**Creating a Case Study:**
1. Bot guides through 10 fields (ID, title, description, metrics, tags, challenge, approach, solution, results, learnings)
2. Multi-line input support for arrays (approach steps, results)
3. Use `/skip` for optional fields
4. Automatic validation and duplicate checking

**Editing a Case Study:**
1. Shows current value for each field
2. Use `/keep` to retain existing values
3. Tracks and reports changes
4. Creates backup before saving

#### Security

- Bot access restricted by Telegram User ID
- API protected by Bearer token authentication
- All changes create automatic backups
- Confirmation required for deletions
- Warning when deleting cases used in profiles

## Analytics Integration

The portfolio includes real-time analytics monitoring through the Telegram bot.

### Features

- **Automatic Monitoring**: Bot checks for new visits every 5 minutes
- **Instant Notifications**: Get alerted when someone accesses your portfolio
- **Visitor Details**: See access codes, location, device type, and navigation paths
- **Manual Controls**: Force checks or view recent visits on demand

### Analytics Commands

- `/analytics` - Force check for new visits
- `/recent_visits` - Show last 5 visits with details
- `/analytics_stop` - Stop automatic monitoring
- `/analytics_start` - Resume monitoring
- `/test_matomo` - Test API connection
- `/debug_visits` - Debug raw visit data

### Setup

1. Get your Matomo API token from Settings → Personal → Security → Auth tokens
2. Add to bot's `.env` file:
```
MATOMO_TOKEN=your-token-here
```
3. Restart the bot to begin monitoring


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
