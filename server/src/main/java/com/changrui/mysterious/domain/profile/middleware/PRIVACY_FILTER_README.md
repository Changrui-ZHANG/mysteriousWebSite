# Privacy Filtering Middleware

This middleware provides comprehensive privacy enforcement for the profile system, automatically filtering response data based on requester permissions and profile privacy settings.

## Components

### PrivacyFilterMiddleware
Core privacy logic that determines access levels and filters data:
- Privacy level determination (OWNER, ADMIN, PUBLIC, DENIED)
- Field-level access control based on privacy settings
- Profile filtering for different access levels
- Search result filtering with privacy awareness

### PrivacyFilterInterceptor
Spring MVC interceptor that enforces privacy rules before requests reach controllers:
- Validates operations based on privacy levels
- Extracts and stores privacy context for controllers
- Provides comprehensive audit logging

### PrivacyResponseFilter
Response body advice that automatically filters API responses:
- Removes privacy-sensitive fields from responses
- Handles different response types (ProfileResponse, UserProfile, Lists)
- Applies filtering based on requester permissions

### Annotations

#### @RequirePrivacyLevel
Method-level annotation to specify minimum privacy level required:
```java
@GetMapping("/{userId}")
@RequirePrivacyLevel(PrivacyFilterMiddleware.PrivacyLevel.PUBLIC)
public ResponseEntity<ProfileResponse> getProfile(@PathVariable String userId) {
    // ...
}
```

#### @FilterPrivateFields
Method-level annotation to enable automatic response filtering:
```java
@GetMapping("/{userId}")
@FilterPrivateFields(fields = {"bio", "lastActive", "stats", "achievements"})
public ResponseEntity<ProfileResponse> getProfile(@PathVariable String userId) {
    // ...
}
```

## Privacy Levels

### OWNER
- Full access to own profile data
- Can view and modify all fields
- No privacy restrictions applied

### ADMIN
- Administrative access to any profile
- Can view and modify all profiles
- Bypasses all privacy restrictions
- Requires valid admin code

### PUBLIC
- Limited access based on profile privacy settings
- Can only view public profiles
- Field access controlled by privacy settings
- Cannot modify profiles

### DENIED
- No access to profile data
- All operations blocked
- Applied to private profiles for non-owners/non-admins

## Privacy Settings Integration

The middleware integrates with the `PrivacySettings` model to control field visibility:

```java
// Privacy settings control field access
PrivacySettings settings = new PrivacySettings();
settings.setShowBio(false);        // Hide bio from public view
settings.setShowStats(true);       // Show stats to public
settings.setShowAchievements(false); // Hide achievements
settings.setShowLastActive(false); // Hide last active time
settings.setProfileVisibility("private"); // Make entire profile private
```

### Field-Level Privacy Control

| Field | Always Visible | Privacy Controlled |
|-------|---------------|-------------------|
| userId | ✓ | |
| displayName | ✓ | |
| avatarUrl | ✓ | |
| joinDate | ✓ | |
| bio | | ✓ (showBio) |
| lastActive | | ✓ (showLastActive) |
| activityStats | | ✓ (showStats) |
| achievements | | ✓ (showAchievements) |

## Usage Examples

### Basic Profile Access
```java
@GetMapping("/{userId}")
@RequirePrivacyLevel(PrivacyFilterMiddleware.PrivacyLevel.PUBLIC)
@FilterPrivateFields(fields = {"bio", "lastActive", "stats"})
public ResponseEntity<ProfileResponse> getProfile(@PathVariable String userId) {
    // Privacy filtering is automatically applied
    ProfileResponse profile = profileService.getProfile(userId);
    return ResponseEntity.ok(profile);
}
```

### Owner-Only Operations
```java
@PutMapping("/{userId}")
@RequirePrivacyLevel(PrivacyFilterMiddleware.PrivacyLevel.OWNER)
public ResponseEntity<Void> updateProfile(@PathVariable String userId, 
                                        @RequestBody UpdateRequest request) {
    // Only profile owner can access this endpoint
    profileService.updateProfile(userId, request);
    return ResponseEntity.ok().build();
}
```

### Admin Operations
```java
@GetMapping("/admin/{userId}")
@RequirePrivacyLevel(PrivacyFilterMiddleware.PrivacyLevel.ADMIN)
public ResponseEntity<ProfileResponse> adminGetProfile(@PathVariable String userId) {
    // Requires admin privileges, bypasses privacy settings
    ProfileResponse profile = profileService.getProfile(userId);
    return ResponseEntity.ok(profile);
}
```

### Manual Privacy Checking
```java
@Autowired
private PrivacyFilterMiddleware privacyFilterMiddleware;

public void processProfile(String profileUserId, String requesterId) {
    // Manual privacy level determination
    PrivacyLevel level = privacyFilterMiddleware.determinePrivacyLevel(
        profileUserId, requesterId, adminCode);
    
    // Check specific field access
    if (privacyFilterMiddleware.canAccessField(privacySettings, "bio", level)) {
        // Process bio field
    }
    
    // Validate operation
    privacyFilterMiddleware.validateOperation(
        profileUserId, requesterId, "read", adminCode);
}
```

## Search and Directory Privacy

The middleware provides special handling for search results and profile directories:

### Search Result Filtering
```java
// Automatically filters search results based on privacy
List<UserProfile> profiles = getAllProfiles();
List<UserProfile> filtered = privacyFilterMiddleware.filterSearchResults(
    profiles, requesterId, adminCode);
```

### Visibility in Search
```java
// Check if profile should appear in search results
boolean visible = privacyFilterMiddleware.isVisibleInSearch(
    profile, privacySettings, requesterId, adminCode);
```

## Security Logging

The middleware provides comprehensive audit logging for privacy-related operations:

```
[PRIVACY AUDIT] Privacy Access: read | Profile: user123 | Requester: user456 | Level: PUBLIC | Fields: request | Success: true
[PRIVACY AUDIT] Privacy Access: update | Profile: user123 | Requester: user456 | Level: DENIED | Fields: request | Success: false
```

Log entries include:
- Operation type (read, update, delete, admin_view, etc.)
- Profile being accessed
- Requester identity
- Privacy level granted
- Fields accessed
- Success/failure status

## Integration with Existing Systems

### Controller Integration
Controllers are updated with privacy annotations:
```java
@RestController
@RequestMapping("/api/profiles")
public class ProfileController {
    
    @GetMapping("/{userId}")
    @RequirePrivacyLevel(PrivacyFilterMiddleware.PrivacyLevel.PUBLIC)
    @FilterPrivateFields(fields = {"bio", "lastActive", "stats", "achievements"})
    public ResponseEntity<ProfileResponse> getProfile(@PathVariable String userId) {
        // Privacy filtering automatically applied
    }
}
```

### WebConfig Integration
Privacy interceptor is registered with highest priority:
```java
@Override
public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(privacyFilterInterceptor)
        .addPathPatterns("/api/profiles/**", "/api/avatars/**")
        .order(1); // Highest priority
}
```

## Configuration

Configure privacy behavior via application properties:

```properties
# Privacy settings
app.privacy.default-visibility=public
app.privacy.enable-audit-log=true
app.privacy.strict-mode=false
app.privacy.cache-privacy-settings=true
```

## Performance Considerations

### Caching
- Privacy settings can be cached to reduce database queries
- Privacy level determination is lightweight
- Response filtering is applied in memory

### Batch Operations
- Search result filtering processes lists efficiently
- Privacy settings are loaded in batches when possible
- Audit logging is asynchronous to avoid performance impact

### Database Queries
- Privacy checks use indexed fields (userId, isPublic)
- Privacy settings are loaded on-demand
- Efficient joins for profile and privacy data

## Testing

Comprehensive unit tests cover:
- Privacy level determination for all scenarios
- Field access control with various privacy settings
- Operation validation for different user types
- Response filtering for different data types
- Search result filtering and visibility

Run tests:
```bash
./gradlew test --tests "*PrivacyFilterMiddlewareTest"
```

## Security Best Practices

1. **Defense in Depth**: Multiple layers of privacy protection
2. **Fail Secure**: Default to denying access when in doubt
3. **Audit Everything**: Log all privacy-related operations
4. **Validate Consistently**: Apply same rules across all endpoints
5. **Regular Reviews**: Monitor audit logs for suspicious patterns

## Future Enhancements

### Planned Features
1. **Friends System**: Support for friends-only visibility
2. **Granular Permissions**: Per-field privacy controls
3. **Time-based Access**: Temporary access grants
4. **Privacy Analytics**: Usage patterns and recommendations
5. **GDPR Compliance**: Data export and deletion workflows

### Extensibility Points
- Custom privacy levels for specific use cases
- Plugin architecture for additional privacy rules
- Integration with external privacy management systems
- Advanced audit reporting and analytics

## Troubleshooting

### Common Issues

**Privacy settings not applied**
- Check if interceptor is registered correctly
- Verify annotations are present on controller methods
- Ensure privacy settings exist in database

**Access denied errors**
- Verify requester ID is being passed correctly
- Check admin code format and validation
- Review privacy level requirements for endpoint

**Response not filtered**
- Confirm ResponseBodyAdvice is active
- Check if response type is supported
- Verify privacy context is available

### Debug Logging
Enable debug logging to trace privacy decisions:
```properties
logging.level.com.changrui.mysterious.domain.profile.middleware=DEBUG
```