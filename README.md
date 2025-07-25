# Interactive Terminal Portfolio

This project is an interactive portfolio experience designed to look and feel like a classic computer terminal. It features a unique gated access system, dynamic content based on the access code, and detailed, self-hosted analytics.

## Core Features

1.  Terminal UI & Design System: The entire interface is built around a custom, documented design system that emulates a terminal aesthetic, including monospace fonts, high-contrast themes (dark/light), and command-line-inspired components.
2.  Gated & Personalized Access: The site is accessible only via a unique code in the URL (`?code=...`). Based on this code, the content (greetings, available projects, etc.) is dynamically personalized for the visitor.
3.  Decoupled Content: All personalized data is stored in a `content.json` file on the server, completely separate from the application code. This allows for easy updates to content without redeploying the entire application.
4.  Privacy-First Analytics: Using a self-hosted Matomo instance, we track user interactions for each session. The access code is passed as a Custom Dimension, providing granular insights while maintaining full data ownership and bypassing most ad-blockers.
5.  Automated CI/CD: A GitHub Actions workflow automatically builds, tests, and deploys the application to the production server on every push to the `main` branch.

## Tech Stack

| Technology | Purpose | Implementation Details |
| :--- | :--- | :--- |
| Next.js | Frontend Framework | Leverages Server-Side Rendering (SSR) to read from `content.json` on the server and generate personalized pages on-demand. Uses React Context for global state management (theme, session data). |
| Tailwind CSS | CSS Framework | Implements a custom, project-specific design system defined in `tailwind.config.js`, including a full color palette for dark/light themes, typography scales, and component styles. |
| Matomo | Web Analytics | Runs in a Docker container, served on a dedicated subdomain (`analytics.undevy.com`). Tracks user sessions with a `accessCode` Custom Dimension. |
| DigitalOcean | Cloud Hosting | A 1GB RAM Droplet running Ubuntu 22.04, hosting the Next.js app and Dockerized services. |
| Nginx | Web Server | Acts as a reverse proxy, handling SSL termination (via Certbot) and routing traffic to the Next.js app (`undevy.com`) and the Matomo service (`analytics.undevy.com`). |
| PM2 | Process Manager | Keeps the Next.js application running continuously on the server and handles restarts gracefully. |
| Docker | Containerization | Isolates the Matomo and its database (MariaDB) for clean, manageable, and reproducible deployment. |
| GitHub Actions | CI/CD Pipeline | Automates the entire deployment process: installs dependencies, builds the project, and securely copies files to the server, then restarts the application via PM2. |

## System Architecture

### Deployment & Data Flow

```
[ User (`?code=...`) ] -> [ HTTPS ] -> [ DigitalOcean Droplet ]
                                               |
[ GitHub Push ] -> [ GitHub Actions ]          |--> [ Nginx (SSL) ]
        |                  |                       |
        |              [ Build & Deploy ]          |--> route: undevy.com --> [ PM2 ] -> [ Next.js App ] --(reads)--> [ /home/undevy/content.json ]
        |                      |                   |
        V----------------------|-------------------> route: analytics.undevy.com -> [ Docker ] -> [ Matomo Service ]
[ Code Repository ]
```

## Project Status & Roadmap

The project is structured in iterative phases.

   Phase 1: Scaffolding & Gated Access [COMPLETED]
       [x] Initialized project and set up repository.
       [x] Implemented core gated access logic based on URL code.

   Phase 2: Infrastructure & Deployment [COMPLETED]
       [x] Provisioned and secured a DigitalOcean server.
       [x] Deployed Matomo analytics using Docker.
       [x] Deployed the Next.js application using PM2.
       [x] Configured Nginx as a reverse proxy with SSL.
       [x] Set up a full CI/CD pipeline with GitHub Actions.
       [x] Decoupled content from code using a server-side `content.json` file.

   Phase 3: UI Foundation & State Management [IN PROGRESS]
       [x] Implemented a comprehensive design system in Tailwind CSS.
       [x] Created a reusable `TerminalWindow` layout component.
       [x] Set up a global `SessionContext` for state management.
       [ ] Implement theme switching (dark/light).
       [ ] Pass session data from the server to the global context.
       [ ] Implement the `$system_log` component.

   Phase 4: Content & Feature Implementation [NEXT]
       [ ] Build out all portfolio sections (`/overview`, `/experience`, `/cases`, etc.).
       [ ] Implement the interactive elements as per the design mockups.
       [ ] Populate with final content.

   Phase 5: Content Management [FUTURE]
       [ ] Develop a headless CMS (e.g., via a Telegram bot) to manage `content.json`.