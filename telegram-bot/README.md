# Portfolio CMS Telegram Bot v2.0

A modular Telegram bot for managing portfolio content without SSH access. Built with grammY framework.

## Architecture Overview

The bot follows a modular architecture pattern with clear separation of concerns:

- **bot.js** - Main entry point that orchestrates all modules
- **config/** - Centralized configuration and constants
- **commands/** - All bot command implementations
- **handlers/** - Event handling and conversation flows
- **services/** - External API integrations
- **utils/** - Reusable utility functions
- **middleware/** - Request preprocessing (auth, logging)

## Key Features

### Content Management
- Create, edit, and delete case studies with interactive wizards
- Preview content before making changes
- Automatic validation and error handling

### Version Control
- Automatic backups on every change
- View change history
- Rollback to any previous version
- Compare differences between versions

### Analytics Integration
- Real-time visitor notifications
- Automatic monitoring every 5 minutes
- Detailed visit information (location, device, pages viewed)

### Security
- Telegram User ID based authentication
- Bearer token for API access
- Confirmation prompts for destructive operations

## Development

### Prerequisites
- Node.js 20.x or later
- Telegram Bot Token (from @BotFather)

### Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Configure your `.env`:
   ```
   TELEGRAM_BOT_TOKEN=your-bot-token
   API_URL=http://localhost:3000/api/admin/content
   API_TOKEN=your-api-token
   ADMIN_USER_ID=your-telegram-id
   MATOMO_TOKEN=your-matomo-token
   ```

4. Run the bot:
   ```bash
   npm start
   ```

### Testing

Always test changes locally before deploying:

1. Start the portfolio locally (`npm run dev` in parent directory)
2. Run the bot with test configuration
3. Test all major command flows
4. Verify error handling works correctly

## Deployment

The bot is deployed via GitHub Actions:

1. Commit and push changes to main branch
2. GitHub Actions automatically deploys to server
3. Bot restarts via PM2

Monitor deployment:
```bash
pm2 logs portfolio-cms-bot --lines 100
```

## Command Reference

See main README or use `/help` command in the bot for full command list.

## Troubleshooting

### Bot not responding
- Check PM2 status: `pm2 status`
- View logs: `pm2 logs portfolio-cms-bot`
- Verify environment variables are set

### API connection errors
- Ensure portfolio is running
- Check API_TOKEN matches server configuration
- Verify network connectivity

### Analytics not working
- Confirm MATOMO_TOKEN is set correctly
- Test connection with `/test_matomo`
- Check Matomo API is accessible