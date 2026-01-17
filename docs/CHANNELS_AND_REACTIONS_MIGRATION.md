# Channels and Reactions Database Migration

## Overview
This document describes the database migration created to support the MessageWall channels and reactions features.

## Migration Details

**File**: `server/src/main/resources/db/changelog/changes/005-add-channels-and-reactions.xml`

**Changeset ID**: `027-add-channels-and-reactions-to-messages`

**Changes**:
1. Added `channel_id` column to `messages` table
   - Type: VARCHAR(50)
   - Nullable: true
   - Default value: 'general'

2. Added `reactions` column to `messages` table
   - Type: TEXT
   - Nullable: true
   - Stores JSON array of reactions

## How to Apply

The migration will be applied automatically when you restart the backend server. Liquibase will detect the new changeset and execute it.

### Steps:
1. Ensure PostgreSQL database is running
2. Restart the Spring Boot backend server
3. Check logs for migration success message
4. Verify columns exist in database:
   ```sql
   SELECT column_name, data_type, is_nullable, column_default 
   FROM information_schema.columns 
   WHERE table_name = 'messages' 
   AND column_name IN ('channel_id', 'reactions');
   ```

## Testing

After migration is applied:

1. **Test Channel Filtering**:
   - Open MessageWall
   - Switch between channels (Général, Annonces, Chat)
   - Send messages in different channels
   - Verify messages appear only in their respective channels

2. **Test Reactions**:
   - Hover over a message
   - Click the reaction button (😊) in the hover menu
   - Select an emoji
   - Verify emoji appears below the message
   - Click emoji again to remove reaction
   - Verify reaction count updates correctly

3. **Test WebSocket Updates**:
   - Open MessageWall in two browser tabs
   - Add reaction in one tab
   - Verify reaction appears in real-time in the other tab

## Rollback

If needed, the migration can be rolled back using Liquibase rollback commands. However, this will remove the `channel_id` and `reactions` columns and any data stored in them.

## Related Files

**Backend**:
- `Message.java` - Entity with new fields
- `MessageReaction.java` - Reaction model
- `MessageService.java` - Reaction business logic
- `MessageController.java` - REST endpoints for reactions
- `MessageWebSocketController.java` - WebSocket events for reactions

**Frontend**:
- `channel.types.ts` - Channel type definitions
- `channelStore.ts` - Channel state management
- `ChannelTabs.tsx` - Channel UI component
- `MessageReactions.tsx` - Reaction display component
- `useReactions.ts` - Reaction hook with optimistic updates
- `useMessages.ts` - Message hook with channel filtering

## Notes

- Existing messages will have `channel_id = 'general'` by default
- Existing messages will have `reactions = null` (empty reactions list)
- The migration uses `MARK_RAN` precondition to avoid duplicate execution
- Reactions are stored as JSON for flexibility and order preservation (LinkedList)
