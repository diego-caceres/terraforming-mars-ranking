# Storage Modes Documentation

## Overview

The app now supports two storage modes that can be configured via environment variables:

1. **localStorage Mode**: Browser-based storage (no backend required)
2. **Redis Mode**: Upstash Redis storage (full backend with API)

## Configuration

### Environment Variable

Set `VITE_USE_LOCAL_STORAGE` to control which storage mode to use:

```env
# localStorage mode (test/dev)
VITE_USE_LOCAL_STORAGE=true

# Redis mode (production)
VITE_USE_LOCAL_STORAGE=false
```

## localStorage Mode

### When to Use
- Test/dev environments
- Personal use without data sharing
- Quick setup without external services
- Demo/sandbox deployments

### Features
✅ No backend required
✅ No authentication needed
✅ All core features work (rankings, games, players, stats)
✅ Import/Export functionality
✅ Fast setup (no Redis configuration needed)

### Limitations
❌ Data NOT shared between devices/browsers
❌ Data lost if browser cache is cleared
❌ No monthly rankings feature
❌ No multi-device synchronization

### Technical Details
- Data stored in browser's `localStorage`
- Storage keys: `tm_rankings_players`, `tm_rankings_games`, `tm_rankings_version`
- All Elo calculations happen client-side
- No API calls made (except for features that explicitly require backend)

## Redis Mode

### When to Use
- Production deployments
- Multi-user/multi-device access
- Data persistence requirements
- Full feature set needed

### Features
✅ Data shared across all devices
✅ Persistent storage in Upstash Redis
✅ Monthly rankings (requires backend calculation)
✅ Authentication with admin password
✅ All features available

### Requirements
- Upstash Redis account
- Environment variables:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
  - `VITE_AUTH_PASSWORD`

### Technical Details
- Data stored in Upstash Redis
- API routes in `/api` directory handle all operations
- Server-side Elo calculations
- Authentication required for write operations

## Architecture

### Storage Service Layer

The app uses a storage service abstraction (`src/services/storageService.ts`) that routes calls to either:

- `localStorageService.ts` - Browser localStorage implementation
- `apiService.ts` - API calls to Vercel serverless functions

All components import from `storageService.ts`, which automatically selects the correct implementation based on `VITE_USE_LOCAL_STORAGE`.

### Authentication

The `authService.ts` checks the storage mode:

```typescript
// No authentication needed in localStorage mode
if (USE_LOCAL_STORAGE) {
  return true; // Always authenticated
}

// Check password in Redis mode
return password === AUTH_PASSWORD;
```

### File Structure

```
src/
├── services/
│   ├── storageService.ts          # Router (main import point)
│   ├── localStorageService.ts     # localStorage implementation
│   ├── apiService.ts              # API implementation
│   └── authService.ts             # Auth logic
└── components/                    # All import from storageService

api/
├── _lib/
│   ├── storage.ts                 # Storage interface
│   ├── redisStorage.ts            # Redis implementation
│   └── kv.ts                      # Upstash client
└── [routes].ts                    # API endpoints (Redis mode only)
```

## Migration Between Modes

### From localStorage to Redis

1. Export data in localStorage mode (Settings → Export)
2. Switch to Redis mode (`VITE_USE_LOCAL_STORAGE=false`)
3. Configure Redis credentials
4. Import data through the UI (Settings → Import)

### From Redis to localStorage

1. Export data in Redis mode (Settings → Export)
2. Switch to localStorage mode (`VITE_USE_LOCAL_STORAGE=true`)
3. Import data through the UI (Settings → Import)

## Development

### Running in localStorage Mode

```bash
# Configure
echo "VITE_USE_LOCAL_STORAGE=true" > .env.local

# Run
npm run dev
```

### Running in Redis Mode

```bash
# Configure
cat > .env.local << EOF
VITE_USE_LOCAL_STORAGE=false
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
VITE_AUTH_PASSWORD=your_password
EOF

# Run
vercel dev
```

## Deployment

### Netlify/Vercel with localStorage

Set environment variable:
```
VITE_USE_LOCAL_STORAGE=true
```

No other configuration needed. Each user gets their own local data.

### Vercel with Redis

Set environment variables:
```
VITE_USE_LOCAL_STORAGE=false
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
VITE_AUTH_PASSWORD=your_password
```

Requires Vercel (or compatible platform) for API routes.

## Testing

### Test localStorage Mode

1. Set `VITE_USE_LOCAL_STORAGE=true`
2. Run `npm run dev`
3. Open browser DevTools → Application → Local Storage
4. Verify data is stored under `tm_rankings_*` keys

### Test Redis Mode

1. Set `VITE_USE_LOCAL_STORAGE=false`
2. Configure Redis credentials
3. Run `vercel dev`
4. Use Upstash console to verify data in Redis

## Troubleshooting

### localStorage Mode Issues

**Data not persisting:**
- Check browser's local storage quota
- Ensure cookies/storage not disabled
- Check browser console for quota errors

**Import not working:**
- Verify JSON format matches expected schema
- Check browser console for parsing errors

### Redis Mode Issues

**Authentication failing:**
- Verify `VITE_AUTH_PASSWORD` is set correctly
- Check that mode is not localStorage (`false`)

**API errors:**
- Verify Upstash credentials are correct
- Check Upstash console for connection issues
- Ensure `vercel dev` is running (not `npm run dev`)

**Monthly rankings not working:**
- Only available in Redis mode
- Check that sufficient games exist for the month
