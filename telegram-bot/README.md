// telegram-bot/README.md

# Portfolio CMS Telegram Bot

A Telegram bot for managing portfolio content without SSH access. Built with grammY framework.

## Architecture

### Core Components

1. bot.js - Main bot application
   - Command handlers for all bot operations
   - Message processing and routing
   - Integration with Admin API

2. stateManager.js - Conversation state management
   - In-memory storage for multi-step conversations
   - Automatic cleanup of stale sessions (1 hour timeout)
   - Support for different conversation flows

### State Management

The bot uses a simple state machine approach for handling multi-step conversations:

```javascript
userStates = {
  userId: {
    command: 'add_case',        // Current command
    currentStep: 'waiting_title', // Current step in conversation
    data: {},                   // Collected data
    startedAt: timestamp        // For cleanup
  }
}
```

### API Integration

The bot communicates with the portfolio's Admin API:
- Endpoint: `/api/admin/content`
- Authentication: Bearer token
- Operations: GET (read), PUT (full update), PATCH (partial update)

## Development Setup

### Prerequisites
- Node.js 20.x or later
- Telegram Bot Token (from @BotFather)
- Access to portfolio API

### Local Development

1. Create test bot via @BotFather
2. Configure environment:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with test bot token
   ```

3. Start portfolio locally:
   ```bash
   cd ..
   npm run dev
   ```

4. Start bot:
   ```bash
   node bot.js
   ```

### Environment Variables

```env
TELEGRAM_BOT_TOKEN=your-bot-token
API_URL=http://localhost:3000/api/admin/content
API_TOKEN=your-api-token
ADMIN_USER_ID=your-telegram-id
BACKUP_DIR=./test-backups
```

## Command Reference

### Content Viewing
- `/get` - Download complete content.json
- `/status` - System status and statistics
- `/list_cases` - List all case studies
- `/preview [id]` - View case study details

### Content Management
- `/add_case` - Create new case study
- `/edit_case [id]` - Edit existing case
- `/delete_case [id]` - Delete case with confirmation

### Version Control
- `/history` - View last 10 versions
- `/rollback N` - Restore version N
- `/diff N [M]` - Compare versions

### Conversation Control
- `/cancel` - Abort active conversation
- `/skip` - Skip optional field
- `/keep` - Keep existing value (edit mode)

## Conversation Flows

### Add Case Flow
1. Ask for case ID (required, validated)
2. Ask for title (optional)
3. Ask for description (optional)
4. Ask for metrics (optional)
5. Ask for tags (comma-separated, optional)
6. Ask for challenge (optional)
7. Ask for approach (multi-line, optional)
8. Ask for solution (optional)
9. Ask for results (multi-line, optional)
10. Ask for learnings (optional)

### Edit Case Flow
- Shows current value for each field
- User can enter new value or `/keep` to retain
- Tracks changes and shows summary

### Delete Case Flow
- Shows complete preview of case
- Warns if case is used in profiles
- Requires confirmation via inline keyboard

## Error Handling

The bot handles various error scenarios:
- Invalid case ID format
- Duplicate case IDs
- Missing required fields
- API connection failures
- Invalid user input

All errors are logged and user-friendly messages are displayed.

## Security

- User authentication via Telegram ID whitelist
- API authentication via Bearer token
- No sensitive data stored in bot memory
- Automatic session cleanup
- Confirmation for destructive operations

## Production Deployment

The bot runs on the server via PM2:

```bash
pm2 start bot.js --name "portfolio-cms-bot"
pm2 save
```

Logs can be viewed with:
```bash
pm2 logs portfolio-cms-bot
```

## Future Enhancements

1. Bulk Operations - Add/remove tags from multiple cases
2. Search Functionality - Find cases by keyword
3. Templates - Save and reuse case templates
4. Export/Import - CSV or JSON bulk operations
5. Rich Media - Support for images in cases
6. Audit Log - Track who made what changes when