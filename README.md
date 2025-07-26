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
| Next.js | Frontend Framework | Leverages a file-system based router, API Routes for data fetching, and Server-Side Rendering (SSR). Uses React Context for global state management. |
| Tailwind CSS | CSS Framework | Implements a custom, project-specific design system defined in `tailwind.config.js`, including a full color palette for dark/light themes and typography scales. |
| Matomo | Web Analytics | Runs in a Docker container, served on a dedicated subdomain (`analytics.undevy.com`). Tracks user sessions with a `accessCode` Custom Dimension. |
| DigitalOcean | Cloud Hosting | A 1GB RAM Droplet running Ubuntu 22.04, hosting the Next.js app and Dockerized services. |
| Nginx | Web Server | Acts as a reverse proxy, handling SSL termination (via Certbot) and routing traffic to the Next.js app (`undevy.com`) and the Matomo service. |
| PM2 | Process Manager | Keeps the Next.js application running continuously on the server and handles restarts gracefully. |
| Docker | Containerization | Isolates the Matomo and its database for clean, manageable, and reproducible deployment. |
| GitHub Actions | CI/CD Pipeline | Automates the entire deployment process: installs dependencies, builds the project, and securely copies files to the server, then restarts the application via PM2. |

## Project Status & Roadmap

The project is structured in iterative phases. The content plan is based on a detailed prototype.

   Phase 1-3: Foundation & Infrastructure [COMPLETED]
       [x] Set up project, infrastructure, deployment, CI/CD, and analytics.
       [x] Implemented core gated access logic and decoupled content via an API route.
       [x] Built the foundational UI (`TerminalWindow`, themes, global state via Context).

   Phase 4: Content & Feature Implementation [IN PROGRESS]
       [ ] Home Hub: Finalize the main navigation hub.
       [ ] `/overview` Section:
           [ ] Build `Introduction` screen with dynamic content.
           [ ] Build `CurrentStatus` screen.
           [ ] Build `ValueProp` screen.
       [ ] `/experience` Section:
           [ ] Build interactive `Timeline` screen.
           [ ] Build `RoleDetail` screen with accordion component.
           [ ] Build `Metrics` screen.
       [ ] `/cases` Section:
           [ ] Build dynamic `CaseList` screen based on config.
           [ ] Build `CaseOverview`, `CaseChallenge`, `CaseSolution`, `CaseResults` screens.
       [ ] `/skills` Section:
           [ ] Build `SkillsGrid` screen.
           [ ] Build `SkillDetail` screen.
       [ ] `/contact` Section:
           [ ] Build `NextSteps` call-to-action screen.

   Phase 5: Content Management [FUTURE]
       [ ] Develop a headless CMS (e.g., via a Telegram bot) to manage `content.json`.