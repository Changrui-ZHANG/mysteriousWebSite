package com.changrui.mysterious.domain.profile.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.changrui.mysterious.domain.profile.dto.ProfileResponse;
import com.changrui.mysterious.domain.profile.model.Achievement;
import com.changrui.mysterious.domain.profile.model.ActivityStats;
import com.changrui.mysterious.domain.profile.model.PrivacySettings;
import com.changrui.mysterious.domain.profile.model.UserAchievement;
import com.changrui.mysterious.domain.profile.model.UserProfile;
import com.changrui.mysterious.domain.profile.repository.AchievementRepository;
import com.changrui.mysterious.domain.profile.repository.ActivityStatsRepository;
import com.changrui.mysterious.domain.profile.repository.PrivacySettingsRepository;
import com.changrui.mysterious.domain.profile.repository.UserAchievementRepository;
import com.changrui.mysterious.domain.profile.repository.UserProfileRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProfileServiceTest {

    @Mock
    private UserProfileRepository profileRepository;

    @Mock
    private PrivacySettingsRepository privacyRepository;

    @Mock
    private ActivityStatsRepository statsRepository;

    @Mock
    private AchievementRepository achievementRepository;

    @Mock
    private UserAchievementRepository userAchievementRepository;

    @InjectMocks
    private ProfileService profileService;

    private UserProfile testProfile;
    private PrivacySettings testPrivacy;
    private ActivityStats testStats;
    private Achievement testAchievement;
    private UserAchievement testUserAchievement;

    @BeforeEach
    void setUp() {
        testProfile = new UserProfile("user123", "Test User");
        testProfile.setJoinDate(LocalDateTime.now());
        testProfile.setLastActive(LocalDateTime.now());
        testProfile.setPublic(true);

        testPrivacy = new PrivacySettings("user123");
        testStats = new ActivityStats("user123");

        testAchievement = new Achievement();
        testAchievement.setId("ach1");
        testAchievement.setName("Explorer");
        testAchievement.setDescription("Visited 5 pages");
        testAchievement.setIconUrl("icon.png");

        testUserAchievement = new UserAchievement("user123", "ach1");
        testUserAchievement.setUnlockedAt(LocalDateTime.now());
    }

    @Test
    void getProfile_AsOwner_ShouldIncludeAchievements() {
        // Given
        when(profileRepository.findByUserId("user123")).thenReturn(Optional.of(testProfile));
        when(privacyRepository.findByUserId("user123")).thenReturn(Optional.of(testPrivacy));
        when(statsRepository.findByUserId("user123")).thenReturn(Optional.of(testStats));
        when(userAchievementRepository.findByUserId("user123")).thenReturn(List.of(testUserAchievement));
        when(achievementRepository.findById("ach1")).thenReturn(Optional.of(testAchievement));

        // When
        ProfileResponse response = profileService.getProfile("user123", "user123", true);

        // Then
        assertNotNull(response);
        assertEquals("user123", response.userId());
        assertNotNull(response.achievements());
        assertEquals(1, response.achievements().size());
        assertEquals("Explorer", response.achievements().get(0).name());
    }

    @Test
    void getProfile_AsPublic_ShouldIncludeAchievements() {
        // Given
        when(profileRepository.findByUserId("user123")).thenReturn(Optional.of(testProfile));
        when(privacyRepository.findByUserId("user123")).thenReturn(Optional.of(testPrivacy));
        when(statsRepository.findByUserId("user123")).thenReturn(Optional.of(testStats));
        when(userAchievementRepository.findByUserId("user123")).thenReturn(List.of(testUserAchievement));
        when(achievementRepository.findById("ach1")).thenReturn(Optional.of(testAchievement));

        // When
        ProfileResponse response = profileService.getProfile("user123", "otherUser", false);

        // Then
        assertNotNull(response);
        assertNotNull(response.achievements());
        assertEquals(1, response.achievements().size());
    }
}
