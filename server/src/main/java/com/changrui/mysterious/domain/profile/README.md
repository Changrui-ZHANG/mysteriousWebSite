# Profile Domain

This domain implements a comprehensive user profile management system with activity tracking, achievements, and privacy controls.

## Architecture

The profile domain follows the established domain-driven architecture pattern:

```
domain/profile/
├── controller/          # REST endpoints
│   ├── ProfileController.java
│   ├── ActivityController.java
│   ├── AvatarController.java
│   └── AdminProfileController.java
├── service/            # Business logic
│   ├── ProfileService.java
│   ├── ActivityService.java
│   ├── AvatarService.java
│   ├── ProfileIntegrationService.java
│   └── ProfileMigrationService.java
├── repository/         # Data access
│   ├── UserProfileRepository.java
│   ├── PrivacySettingsRepository.java
│   ├── ActivityStatsRepository.java
│   ├── AchievementRepository.java
│   └── UserAchievementRepository.java
├── model/             # JPA entities
│   ├── UserProfile.java
│   ├── PrivacySettings.java
│   ├── ActivityStats.java
│   ├── Achievement.java
│   ├── UserAchievement.java
│   └── UserAchievementId.java
├── dto/               # Data transfer objects
│   ├── CreateProfileRequest.java
│   ├── UpdateProfileRequest.java
│   ├── UpdatePrivacyRequest.java
│   ├── ProfileResponse.java
│   └── BasicProfileInfo.java
└── config/            # Configuration
    └── ProfileConfig.java
```

## Features Implemented

### ✅ Core Profile Management
- **Profile Creation**: Create profiles with display name and bio
- **Profile Updates**: Edit profile information with validation
- **Profile Viewing**: View profiles with privacy-aware filtering
- **Profile Search**: Search profiles by display name or bio
- **Profile Directory**: Browse public profiles

### ✅ Privacy Controls
- **Visibility Settings**: Public, friends-only, private profiles
- **Granular Privacy**: Control visibility of bio, stats, achievements, last active
- **Privacy Enforcement**: Automatic filtering based on privacy settings

### ✅ Activity Tracking
- **Message Activity**: Track messages sent, update statistics
- **Game Activity**: Track games played, record best scores
- **Real-time Updates**: Statistics updated immediately on activity
- **Activity Integration**: Seamless integration with existing message and game systems

### ✅ Achievement System
- **Default Achievements**: Pre-defined achievements for messaging, gaming, social, time
- **Auto-unlock**: Achievements automatically unlocked based on activity
- **Achievement Categories**: Organized by messaging, gaming, social, time
- **Achievement Display**: View user achievements with unlock dates

### ✅ Database Integration
- **Liquibase Migrations**: Complete database schema with proper constraints
- **JPA Entities**: Full entity mapping with relationships
- **Indexes**: Performance-optimized database indexes
- **Foreign Keys**: Proper referential integrity

### ✅ System Integration
- **Message Wall Integration**: Activity tracking on message send
- **Game System Integration**: Activity tracking on score submission
- **Profile Information**: Basic profile info for message display
- **Last Active Updates**: Automatic last active timestamp updates

### ✅ Data Migration
- **Existing User Migration**: Automatic migration of existing users to profiles
- **Activity Migration**: Migrate existing message and game counts
- **Startup Migration**: Automatic migration on application startup

### ✅ Admin Features
- **Achievement Initialization**: Admin endpoint to initialize default achievements
- **Force Migration**: Admin endpoint to trigger user migration
- **Achievement Checking**: Admin endpoint to force check user achievements

## API Endpoints

### Profile Management
- `POST /api/profiles` - Create profile
- `GET /api/profiles/{userId}` - Get profile
- `PUT /api/profiles/{userId}` - Update profile
- `DELETE /api/profiles/{userId}` - Delete profile
- `GET /api/profiles/search?q={query}` - Search profiles
- `GET /api/profiles/directory` - Get public profiles
- `PUT /api/profiles/{userId}/privacy` - Update privacy settings
- `GET /api/profiles/{userId}/basic` - Get basic profile info for messages

### Activity & Achievements
- `POST /api/activity/message` - Record message activity
- `POST /api/activity/game` - Record game activity
- `GET /api/activity/{userId}/stats` - Get activity statistics
- `GET /api/activity/{userId}/achievements` - Get user achievements

### Avatar Management
- `PUT /api/avatars/{userId}` - Update avatar URL
- `DELETE /api/avatars/{userId}` - Delete avatar
- `GET /api/avatars/defaults` - Get default avatars

### Admin Endpoints
- `POST /api/admin/profiles/achievements/init` - Initialize achievements
- `POST /api/admin/profiles/{userId}/achievements/check` - Check user achievements
- `POST /api/admin/profiles/migrate` - Force user migration

## Database Schema

### Tables Created
- `user_profiles` - Main profile information
- `profile_privacy_settings` - Privacy configuration
- `user_activity_stats` - Activity statistics
- `achievements` - System achievements
- `user_achievements` - User achievement unlocks

### Key Features
- **Proper Constraints**: Foreign keys, unique constraints, not null constraints
- **Performance Indexes**: Optimized for search and filtering operations
- **Default Values**: Sensible defaults for all settings
- **Referential Integrity**: Proper relationships between entities

## Integration Points

### Message Wall
- Activity tracking on message send
- Profile information display in messages
- Last active timestamp updates

### Game System
- Activity tracking on score submission
- Best score tracking in activity stats
- Achievement unlocks based on game performance

### Authentication System
- Profile creation for new users
- User ID consistency across systems

## Configuration

The system supports configuration through `application.properties`:

```properties
# Profile system configuration
app.profile.avatar.max-file-size=5242880
app.profile.avatar.target-size=256
app.profile.avatar.upload-path=/uploads/avatars/
app.profile.privacy.default-visibility=public
```

## Future Enhancements

### 🔄 Planned Features
- **File Upload**: Direct avatar file upload with image processing
- **Friend System**: Friend requests and friend-only privacy
- **Profile Themes**: Customizable profile themes and colors
- **Social Features**: Profile visits, mutual connections
- **Advanced Achievements**: Dynamic achievement system
- **Profile Analytics**: Detailed activity analytics

### 🔧 Technical Improvements
- **Caching**: Redis caching for frequently accessed profiles
- **CDN Integration**: Avatar storage with CDN support
- **Real-time Updates**: WebSocket updates for profile changes
- **Bulk Operations**: Batch profile operations for admin
- **API Rate Limiting**: Rate limiting for profile operations

## Error Handling

The system includes comprehensive error handling:
- **Validation Errors**: Field-specific validation with clear messages
- **Authorization Errors**: Ownership verification for profile operations
- **Not Found Errors**: Proper 404 responses for missing profiles
- **Privacy Errors**: Respect privacy settings in all operations

## Testing Strategy

The system is designed for comprehensive testing:
- **Unit Tests**: Service layer business logic testing
- **Integration Tests**: Controller and repository testing
- **Property Tests**: Universal property validation
- **Migration Tests**: Data migration validation

## Performance Considerations

- **Database Indexes**: Optimized for common query patterns
- **Lazy Loading**: Efficient entity loading strategies
- **Batch Operations**: Bulk operations for migration and admin tasks
- **Query Optimization**: Efficient queries for search and filtering