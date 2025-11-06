# Migration Scripts

This directory contains utility scripts for data migrations and maintenance tasks.

## Peak Rating Migration

### Purpose
The `migrate-peak-ratings.ts` script calculates historic peak ratings for all existing players based on their rating history. This is useful when:

- You've just added the peak rating feature
- You want to recalculate peak ratings after fixing a bug
- You're migrating from a version without peak ratings

### What it does
For each player, the script:
1. Analyzes their complete rating history
2. Finds the highest rating they've ever achieved
3. Updates their `peakRating` field in the database
4. Shows a summary of changes

### How to run

**Prerequisites:**
- Make sure your `.env` file contains valid Upstash Redis credentials:
  ```
  UPSTASH_REDIS_REST_URL=https://...
  UPSTASH_REDIS_REST_TOKEN=...
  ```

**Run the migration:**
```bash
npm run migrate:peak-ratings
```

### Expected output

The script will display progress for each player:

```
🚀 Starting peak rating migration...

📊 Found 8 players to process

✅ Diego               | Current: 1523 | Peak: 1543 (new)
✅ María               | Current: 1489 | Peak: 1512 (was: 1500)
⏭️  Carlos              | Peak already correct: 1567
✅ Ana                 | Current: 1401 | Peak: 1500 (new)
...

============================================================
✨ Migration complete!
   Updated: 5 players
   Skipped: 3 players (already correct)
============================================================
```

### Safety

- ✅ **Read-only analysis**: The script only reads rating history
- ✅ **Non-destructive**: Only updates the `peakRating` field
- ✅ **Idempotent**: Safe to run multiple times
- ✅ **Shows changes**: Displays old vs new values before updating

### Troubleshooting

**Error: Missing environment variables**
- Check that `.env` file exists and contains valid Upstash credentials
- Make sure the file is at the project root

**Error: Player not found**
- This is a warning, not an error
- The script will skip that player and continue with others

**No players found**
- Verify your Upstash database connection
- Check that you're connecting to the correct database

### When to run

Run this script:
- ✅ Right after deploying the peak rating feature for the first time
- ✅ After restoring from a backup
- ✅ If you notice peak ratings are incorrect

Don't need to run if:
- ❌ You're starting fresh with no players
- ❌ Peak ratings are already being tracked correctly
- ❌ You just registered a new game (ratings update automatically)

## Adding new migration scripts

To add a new migration script:

1. Create a new `.ts` file in this directory
2. Import the Redis client from `@upstash/redis`
3. Use the same key structure as the API (`players:all`, `players:{id}`, etc.)
4. Add a script entry in `package.json`
5. Document it in this README

Example:
```typescript
import { Redis } from '@upstash/redis';

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function myMigration() {
  // Your migration logic here
}

myMigration();
```
