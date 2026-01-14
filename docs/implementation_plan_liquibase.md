# Liquibase Schema Update - Gender Field

This plan details the steps to update the database schema using Liquibase to include the new `gender` field in the `user_profiles` table, ensuring consistency between the Java entity and the database.

## Proposed Changes

### Database Schema (Liquibase)

#### [NEW] [004-add-gender-to-profile.xml](file:///c:/MyPlatform/Codes/mysteriousWebSite/server/src/main/resources/db/changelog/changes/004-add-gender-to-profile.xml)
- Create a new Liquibase changelog to add the `gender` column to the `user_profiles` table.
- Column details: `name="gender"`, `type="VARCHAR(10)"`.

#### [MODIFY] [db.changelog-master.xml](file:///c:/MyPlatform/Codes/mysteriousWebSite/server/src/main/resources/db/changelog/db.changelog-master.xml)
- Include the new changelog file in the master changelog.

## Verification Plan

### Automated Tests
- Run the Spring Boot application and verify it starts without Liquibase/Hibernate errors.
- Check the database schema (if possible) or verify functionality (registration/profile update) which depends on this field.
