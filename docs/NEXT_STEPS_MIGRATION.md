# Next Steps: Apply Database Migration

## Current Status ✅

All code implementation is complete:

### Frontend ✅
- Channel system with 3 default channels (Général, Annonces, Chat)
- Channel tabs with glassmorphic design
- Message filtering by channel (client-side)
- Reaction system with emoji picker
- Optimistic updates for reactions
- WebSocket synchronization for real-time updates

### Backend ✅
- `Message.java` entity with `channelId` and `reactions` fields
- `MessageReaction.java` model for reaction data
- REST endpoints: `/api/messages/reactions/add` and `/api/messages/reactions/remove`
- WebSocket broadcast for reaction updates
- Reaction business logic in `MessageService.java`

### Database Migration ✅
- Migration file created: `005-add-channels-and-reactions.xml`
- Added to master changelog: `db.changelog-master.xml`

## What You Need to Do Now 🚀

### Step 1: Restart Backend Server

The database migration will be applied automatically when you restart the Spring Boot backend.

**Option A - Using Docker Compose:**
```bash
docker-compose restart server
```

**Option B - If running locally:**
1. Stop the backend server (Ctrl+C)
2. Start it again with your usual command (e.g., `mvn spring-boot:run`)

### Step 2: Verify Migration Success

Check the backend logs for a message like:
```
Liquibase: Successfully applied changeset: 027-add-channels-and-reactions-to-messages
```

### Step 3: Test the Features

1. **Test Channels:**
   - Open MessageWall in browser
   - Click on different channel tabs (Général, Annonces, Chat)
   - Send a message in each channel
   - Verify messages appear only in their respective channels
   - Refresh page and verify channel selection persists

2. **Test Reactions:**
   - Hover over any message
   - Click the 😊 button in the hover menu
   - Select an emoji from the picker
   - Verify emoji appears below the message with count
   - Click the emoji again to remove your reaction
   - Open MessageWall in another browser tab
   - Add/remove reactions and verify they sync in real-time

## Troubleshooting

### If migration fails:

1. **Check PostgreSQL is running:**
   ```bash
   docker-compose ps
   ```

2. **Check database connection in backend logs**

3. **Manually verify columns don't already exist:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'messages' 
   AND column_name IN ('channel_id', 'reactions');
   ```

4. **If columns already exist**, the migration will be marked as `MARK_RAN` and skipped (this is normal)

### If reactions don't work:

1. **Check browser console for errors**
2. **Verify backend endpoints are responding:**
   - Open browser DevTools → Network tab
   - Try adding a reaction
   - Look for POST request to `/api/messages/reactions/add`
   - Check response status (should be 200)

3. **Check backend logs for errors**

## Files Modified

### Created:
- `server/src/main/resources/db/changelog/changes/005-add-channels-and-reactions.xml`
- `docs/CHANNELS_AND_REACTIONS_MIGRATION.md`
- `docs/NEXT_STEPS_MIGRATION.md` (this file)

### Modified:
- `server/src/main/resources/db/changelog/db.changelog-master.xml`

## Documentation

See `docs/CHANNELS_AND_REACTIONS_MIGRATION.md` for complete technical details about the migration.

---

**Ready to proceed?** Just restart your backend server and test! 🎉
