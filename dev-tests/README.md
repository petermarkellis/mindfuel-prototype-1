# Development Tests

This folder contains utility scripts for testing and validating the application during development.

## Test Scripts

### `test-supabase-connection.js`
**Purpose**: Validates Supabase database connection and setup

**Usage**:
```bash
node dev-tests/test-supabase-connection.js
```

**What it tests**:
- ✅ Environment variables are set correctly
- ✅ Database connection is working
- ✅ Tables exist and have correct schema
- ✅ Sample data is loaded
- ✅ Read/write permissions work
- ✅ CRUD operations function properly

**When to use**:
- After setting up Supabase for the first time
- When troubleshooting database connection issues
- Before deploying to verify everything works
- When onboarding new developers

### `keep-alive.js`
**Purpose**: Prevents Supabase database from sleeping due to inactivity

**Usage**:
```bash
node dev-tests/keep-alive.js
```

**What it does**:
- 🏓 Sends a simple ping query to the database
- ✅ Keeps database active on free tier
- 📝 Logs timestamp and response status

**Automation options**:
- **GitHub Actions**: Run every 6 days via workflow
- **Cron Job**: Schedule locally with `crontab`
- **Vercel**: Deploy as serverless function
- **Manual**: Run periodically as needed

## Running Tests

Make sure you have the required dependencies:
```bash
npm install
```

Then run any test:
```bash
node dev-tests/test-supabase-connection.js
```

## Adding New Tests

When adding new test scripts:
1. Name them descriptively: `test-{feature-name}.js`
2. Include error handling and clear output
3. Document what the test does in this README
4. Make tests idempotent (safe to run multiple times)

## Test Categories

- **Connection Tests**: Verify external service connections
- **Schema Tests**: Validate database structure
- **Integration Tests**: Test component interactions
- **Performance Tests**: Check load times and responsiveness
