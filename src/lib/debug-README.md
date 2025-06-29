# Debug Utilities

## Overview
This module provides debug utilities for the Taco Tracker application that are restricted to specific developer accounts and only work in development mode.

## Features

### Debug Mode
- **Restricted Access**: Only shows for specific developer accounts (currently: Floofy)
- **Development Only**: Never appears in production builds
- **Collapsible UI**: Debug info is hidden by default behind a `<details>` element
- **Comprehensive Info**: Shows authentication status, user details, active tab, environment

### Usage

```typescript
import { isDebugMode, debugLog } from '$lib/debug';

// Check if debug mode is enabled for current user
if (isDebugMode(user)) {
  // Show debug UI
}

// Log debug messages (only in development)
debugLog('Something happened', data);
```

### Debug Functions

- `isDebugMode(user)`: Returns true if debug mode should be enabled for the user
- `debugLog(message, ...args)`: Logs debug messages (dev only)
- `debugWarn(message, ...args)`: Logs warning messages (dev only)  
- `debugError(message, ...args)`: Logs error messages (dev only)

### Adding New Developers

To add more developer accounts, edit the `DEVELOPER_ACCOUNTS` array in `src/lib/debug.ts`:

```typescript
const DEVELOPER_ACCOUNTS = [
  'Floofy',
  'NewDeveloper',  // Add new accounts here
];
```

### Security Notes

- Debug information is automatically disabled in production builds
- User matching is case-insensitive and checks both name and email
- No sensitive information should be logged through debug functions
- Debug UI only appears for authenticated users who match developer accounts

## Implementation

The debug mode is currently implemented in:
- `src/routes/+page.svelte` - Main debug UI panel
- `src/lib/debug.ts` - Core debug utilities
- Other components can import and use the debug utilities as needed
