# Walkthrough - Gendered Avatars & Default Profile Pictures

I have successfully implemented gendered avatars and default profile pictures across the backend and frontend.

## Changes Made

### Backend (Java / Spring Boot)
- **`UserProfile.java`**: Added `gender` field to store user gender.
- **Liquibase**: Created `004-add-gender-to-profile.xml` to add the `gender` column to the `user_profiles` table, ensuring database consistency.
- **Privacy Middleware**: Fixed `PrivacyResponseFilter.java` and `PrivacyFilterMiddleware.java` to support the new `gender` field, resolving a 500 error caused by mismatched constructor calls.
- **Terminology Update**: Renamed gender labels from "Boy/Girl" (Garçon/Fille) to "Man/Woman" (Homme/Femme) in English, French, and Chinese for a more mature user experience.
- **Frontend Bug Fix**: Updated `ProfileTransformer.ts` to correctly map the `gender` field from the backend response, resolving the issue where gender was not appearing on the profile page.
- **Navbar UI Overhaul**: 
    - Redesigned the `UserDropdownMenu` with a premium glassmorphism aesthetic, including subtle glows, better icons, and Framer Motion animations.
    - Added user avatar and improved layout to the `MobileMenu` for a consistent experience.
    - Integrated multi-language support for all menu items.
- **`RegisterDTO.java`**: Added `gender` field to capture gender during registration.
- **`ProfileService.java`**:
    - Updated `createProfile` to set a default avatar based on gender:
        - Male (`H`, `M`, `B`) -> `/api/avatars/files/default-B.jpeg`
        - Female (`F`, `G`) -> `/api/avatars/files/default-G.jpeg`
        - Unspecified -> No default avatar (stays null).
    - Updated `updateProfile` to support gender updates.
- **`AuthController.java`**: Integrated `ProfileService` to automatically create a profile during registration and pass the gender.

### Frontend (React / TypeScript)
- **`AuthModal.tsx`**: Added a gender selection UI (Male/Female/None) to the registration form.
- **`ProfilePage.tsx`**: Fixed multiple TypeScript errors and integrated gender updates.
- **`ProfileCard.tsx`**: Now displays the user's gender with icons (♂️/♀️).
- **`ProfileForm.tsx`**: Added buttons to select/change gender in the profile settings.
- **Types & Schemas**: Updated `UserProfile`, `CreateProfileRequest`, `UpdateProfileRequest`, and form schemas to include the `gender` field (string | null).
- **i18n**: Added translation keys for gender titles and options in English, French, and Chinese.

### Assets
- Generated and placed default avatar images in `uploads/avatars/`:
    - `default-B.jpeg` (Boy)
    - `default-G.jpeg` (Girl)

## Verification Results
- **TypeScript Type-Check**: Successfully passed `npx tsc --noEmit`.
- **Translations**: Verified for all supported languages.
- **Logic**: Verified that registration payload includes gender and backend correctly assigns avatars.

> [!NOTE]
> The default avatars will be automatically applied to NEW users based on their selected gender. Existing users can update their gender in their profile settings.
