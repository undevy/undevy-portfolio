# Initial Setup Guide

This guide helps you deploy your own instance of the Interactive Terminal Portfolio.

## Prerequisites
- A domain name
- A DigitalOcean account (or similar VPS provider)
- Basic knowledge of terminal commands

## Step 1: Fork and Clone
1. Fork this repository to your GitHub account
2. Clone it locally: `git clone https://github.com/YOUR-USERNAME/portfolio-project.git`

## Step 2: Configure Your Domain
Replace all instances of example domains with your own:
- In Nginx configs: Replace `your-domain.com` with your actual domain
- In the codebase: The app automatically detects the domain and adjusts content

## Step 3: Set Up Secrets
1. Copy `.env.example` to `.env` and fill in your values
2. Add GitHub Secrets for deployment:
   - SSH_HOST: Your server's IP address
   - SSH_USER: Your server username  
   - SSH_PRIVATE_KEY: Your deployment SSH key

## Step 4: Content Configuration
1. Create your own `content.json` based on `test-content.json`
2. Add your personal profiles with unique access codes
3. Customize the GLOBAL_DATA section with your projects and skills

## Multi-Domain Support
This portfolio supports multiple domains out of the box. The content automatically adjusts based on the domain:
- Portfolio title changes: `domain_portfolio`
- Contact links update: `@domain` for Telegram
- Website URL updates to match current domain