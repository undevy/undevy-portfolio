# Personal Portfolio with Gated Access & Tracking

This project is not just a standard portfolio website. It's an interactive platform designed for personalized outreach, featuring unique access links, custom content delivery, and detailed analytics for each visitor.

## Core Feature: Gated Access & Tracking

The main concept is to generate unique access links for different people (e.g., recruiters from specific companies). Each link contains a unique code that enables several key features:

1.  Gated Content: The site is inaccessible without a valid access code.
2.  Personalized Experience: Depending on the code, the site can display customized text, projects, or greetings (e.g., "Hello, Acme Corp. team!").
3.  Activity Tracking: Using a self-hosted Matomo analytics instance, we can track which pages a user with a specific code visited, how much time they spent, and what actions they took. This provides invaluable, granular feedback.

## Tech Stack

| Technology | Purpose | Why this choice? |
| :--- | :--- | :--- |
| Next.js | Frontend Framework | Enables fast, SEO-friendly websites. We'll leverage Server-Side Rendering (SSR) to generate pages on the server at request time. This is perfect for our use case, as we need to validate the access code and inject personalized content on the fly. |
| Tailwind CSS | CSS Framework | A modern, utility-first CSS framework that speeds up UI development by allowing us to style elements directly in the markup. |
| Matomo | Web Analytics | A self-hosted, free, and privacy-focused alternative to Google Analytics. It helps bypass many ad-blockers and gives us full ownership of the data. We'll use Custom Dimensions to associate each session with its unique access code. |
| DigitalOcean | Cloud Hosting | A reliable and flexible cloud provider. We'll use a virtual private server (Droplet) to host our application and the Matomo instance. |
| Nginx | Web Server | Will function as a reverse proxy. It will receive all incoming web traffic and route it to our running Next.js application and the Matomo service. It will also handle SSL termination in the future. |
| GitHub & GitHub Actions | Version Control & CI/CD | We'll host our code on GitHub. A mandatory part of the project is to set up a GitHub Actions workflow for automatically building and deploying the application to the server on every push to the `main` branch. |

## System Architecture

### User Flow Diagram

1.  A user receives a unique link: `https://undevy.com?code=XYZ123`.
2.  The browser sends a request to the server.
3.  Nginx on the DigitalOcean Droplet receives the request and forwards it to the Next.js application.
4.  The server-side part of Next.js inspects the request and finds the `code=XYZ123` query parameter. It validates this code against a predefined list (e.g., a simple database or a JSON file).
5.  If the code is valid, Next.js generates the HTML page with the appropriate personalized content and injects the Matomo tracking script, passing the access code to it.
6.  The browser renders the page. The Matomo script sends tracking data to our Matomo server, tagging the session with a custom dimension like `accessCode: XYZ123`.
7.  If the code is invalid or missing, the user is shown an "Access Denied" page.

### Deployment Architecture on DigitalOcean

```
[ The Internet ] <--> [ DigitalOcean Droplet ]
                           |
                           |--> [ Nginx (Port 80/443) ]
                                  |
                                  |--> Forwards to --> [ Next.js App (running on port 3000) ]
                                  |
                                  |--> Forwards to --> [ Matomo Service (running on its own port/subdomain) ]
```

## Development Roadmap

1.  Phase 1: Project Scaffolding.
    *   [x] Create project documentation (`README.md`).
    *   [ ] Initialize the Next.js + Tailwind CSS project.
    *   [ ] Create the basic page structure (home page, access denied page).
    *   [ ] Set up the GitHub repository.

2.  Phase 2: Gated Access Logic.
    *   [ ] Implement server-side validation for the access code from the URL (`?code=...`).
    *   [ ] Create a placeholder for the access code database (e.g., a simple JSON file or an in-code object).
    *   [ ] Implement the core logic: show content for a valid code, otherwise show the "Access Denied" page.

3.  Phase 3: Analytics Integration.
    *   [ ] Set up Matomo on the DigitalOcean server (likely using Docker for simplicity).
    *   [ ] Add the Matomo tracking script to the Next.js application.
    *   [ ] Configure the tracking script to pass the unique access code as a Matomo Custom Dimension.
    *   [ ] Verify that analytics are being collected correctly.

4.  Phase 4: Content and Visuals.
    *   [ ] Design and build the main portfolio pages using Tailwind CSS.
    *   [ ] Add real project details, text, and contact information.
    *   [ ] Implement the mechanism for displaying different content based on the access code.

5.  Phase 5: Deployment and Automation.
    *   [ ] Provision and secure the DigitalOcean Droplet.
    *   [ ] Install Nginx, Node.js, and PM2 (a process manager for Node.js).
    *   [ ] Perform the first manual deployment to the server.
    *   [ ] Point the `undevy.com` domain (from Squarespace) to the server's IP address.
    *   [ ] Set up an SSL certificate via Let's Encrypt.
    *   [ ] Configure the GitHub Actions workflow for automated CI/CD.