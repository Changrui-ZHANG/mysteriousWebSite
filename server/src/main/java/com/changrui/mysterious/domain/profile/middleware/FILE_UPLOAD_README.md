# File Upload Security Middleware

This middleware provides comprehensive security validation for file uploads in the profile system.

## Components

### FileUploadMiddleware
Core validation logic for uploaded files including:
- File size validation
- MIME type verification
- File extension validation
- Magic byte header verification
- Malicious content detection
- Secure filename generation

### FileUploadInterceptor
Spring MVC interceptor that automatically validates files before they reach controllers:
- Integrates with multipart requests
- Provides security logging
- Handles error reporting

### Annotations

#### @ValidateFileUpload
Parameter-level annotation for fine-grained file validation:
```java
@PostMapping("/upload")
public ResponseEntity<?> upload(
    @RequestParam("file") @ValidateFileUpload(
        fileType = "avatar", 
        maxSize = 5242880,
        allowedExtensions = "jpg,png"
    ) MultipartFile file) {
    // ...
}
```

#### @SecureFileUpload
Method-level annotation for endpoint security configuration:
```java
@PostMapping("/avatar/{userId}")
@SecureFileUpload(
    operation = "avatar_upload",
    requireAuth = true,
    maxFiles = 1
)
public ResponseEntity<?> uploadAvatar(...) {
    // ...
}
```

## Security Features

### File Validation
- **Size limits**: Configurable maximum file size (default 5MB)
- **Type validation**: MIME type and extension verification
- **Header verification**: Magic byte validation to prevent type spoofing
- **Dimension limits**: Maximum image dimensions to prevent memory attacks

### Content Security
- **Script detection**: Scans for embedded JavaScript, PHP, and other scripts
- **Path traversal protection**: Prevents directory traversal attacks
- **Filename sanitization**: Removes dangerous characters from filenames
- **Extension blacklist**: Blocks dangerous file extensions

### Malware Protection
- **Placeholder scanning**: Structure for integrating antivirus engines
- **Content analysis**: Basic pattern matching for malicious content
- **Quarantine support**: Framework for isolating suspicious files

## Configuration

Configure via application properties:

```properties
# File upload limits
app.upload.max-file-size=5242880
app.upload.allowed-image-types=jpg,jpeg,png,webp
app.upload.max-image-dimension=4096

# Security features
app.upload.enable-malware-scan=false
```

## Usage Examples

### Basic Avatar Upload
```java
@PostMapping("/avatars/{userId}")
@SecureFileUpload(operation = "avatar_upload")
public ResponseEntity<String> uploadAvatar(
    @PathVariable String userId,
    @RequestParam("avatar") @ValidateFileUpload(fileType = "avatar") MultipartFile file) {
    
    // File is automatically validated by interceptor and annotation
    String url = avatarService.uploadAvatar(userId, file);
    return ResponseEntity.ok(url);
}
```

### Custom Validation
```java
@Autowired
private FileUploadMiddleware fileUploadMiddleware;

public void processFile(MultipartFile file) {
    // Manual validation
    fileUploadMiddleware.validateUploadedFile(file, "avatar");
    
    // Generate secure filename
    String secureFilename = fileUploadMiddleware.generateSecureFilename(
        file.getOriginalFilename(), userId);
    
    // Process file...
}
```

## Security Logging

The middleware automatically logs:
- File upload attempts with client IP and user information
- Security violations and blocked uploads
- File processing errors and exceptions
- Malware scan results (when enabled)

Log format:
```
[FILE UPLOAD AUDIT] File Upload: /api/avatars/user123 | IP: 192.168.1.100 | User: user123 | File: avatar.jpg (1024 bytes) | Success: true
```

## Integration with Existing Systems

### AvatarController Integration
The AvatarController is updated to use the new middleware:
- `@SecureFileUpload` annotation on upload endpoints
- `@ValidateFileUpload` annotation on file parameters
- `@RequireProfileOwnership` for access control

### WebConfig Integration
File upload interceptor is registered for relevant endpoints:
```java
registry.addInterceptor(fileUploadInterceptor)
    .addPathPatterns("/api/avatars/**", "/api/profiles/**/upload");
```

## Future Enhancements

### Planned Features
1. **Real malware scanning**: Integration with ClamAV or commercial scanners
2. **Rate limiting**: Per-user upload rate limits
3. **Virus definition updates**: Automatic signature updates
4. **Advanced content analysis**: Deep file structure analysis
5. **Cloud storage integration**: Secure upload to S3/CloudFlare

### Extensibility Points
- `performMalwareScan()`: Implement real antivirus integration
- `validateFileHeader()`: Add support for more file types
- `checkForEmbeddedScripts()`: Enhanced script detection
- Custom validation rules via configuration

## Testing

Comprehensive unit tests cover:
- Valid file uploads
- Invalid file types and sizes
- Security attack scenarios
- Filename sanitization
- Header validation
- Malicious content detection

Run tests:
```bash
./gradlew test --tests "*FileUploadMiddlewareTest"
```

## Performance Considerations

- File validation is performed in memory for small files
- Large files are streamed to avoid memory issues
- Header validation occurs before full file processing
- Malware scanning can be disabled for performance-critical environments

## Security Best Practices

1. **Always validate on server**: Never trust client-side validation
2. **Use secure filenames**: Generate UUIDs or timestamps
3. **Isolate uploads**: Store in separate directory with restricted permissions
4. **Monitor uploads**: Log all upload attempts for security analysis
5. **Regular updates**: Keep malware definitions current
6. **Backup validation**: Multiple layers of security checks