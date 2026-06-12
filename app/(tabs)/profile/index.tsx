import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppNavBar } from '@/components/app-navbar';
import { ProfileCard } from '@/components/profile/profile-card';
import { ProfileSettingsRow } from '@/components/profile/profile-settings-row';
import { ProfileSettingsSwitch } from '@/components/profile/profile-settings-switch';
import { BACKGROUND_COLOR, BRAND_COLOR, MESSAGE_COLOR } from '@/constants/auth-ui';
import {
  getProfileLanguageLabel,
  isPolishLanguage,
} from '@/constants/profile-language';
import { withReturnTo } from '@/lib/back-navigation';
import { getAuthUser } from '@/services/auth-session';
import {
  getProfile,
  ProfileError,
  updateProfilePreferences,
  type ProfileUser,
} from '@/services/profile-service';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);
  const hasLoadedProfileRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      const authUser = getAuthUser();

      if (!authUser) {
        setErrorMessage('You must be signed in to view your profile.');
        setIsLoading(false);
        return;
      }

      const userId = authUser.id;
      let isMounted = true;
      const shouldShowLoading = !hasLoadedProfileRef.current;

      async function loadProfile() {
        if (shouldShowLoading) {
          setIsLoading(true);
        }

        try {
          const data = await getProfile(userId);

          if (isMounted) {
            setProfile(data);
            setErrorMessage(null);
            hasLoadedProfileRef.current = true;
          }
        } catch (error) {
          if (isMounted) {
            setErrorMessage(
              error instanceof ProfileError
                ? error.message
                : 'Failed to load profile. Please try again.',
            );
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }

      loadProfile();

      return () => {
        isMounted = false;
      };
    }, []),
  );

  async function handleLanguageToggle(isPolishSelected: boolean) {
    const authUser = getAuthUser();

    if (!authUser || !profile) {
      return;
    }

    setIsUpdatingLanguage(true);

    try {
      const updatedProfile = await updateProfilePreferences(authUser.id, {
        language: isPolishSelected ? 'pl' : 'en',
      });
      setProfile(updatedProfile);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof ProfileError
          ? error.message
          : 'Failed to update language. Please try again.',
      );
    } finally {
      setIsUpdatingLanguage(false);
    }
  }

  async function handleNotificationsToggle(nextValue: boolean) {
    const authUser = getAuthUser();

    if (!authUser || !profile) {
      return;
    }

    setIsUpdatingNotifications(true);

    try {
      const updatedProfile = await updateProfilePreferences(authUser.id, {
        hasNotificationsEnabled: nextValue,
      });
      setProfile(updatedProfile);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof ProfileError
          ? error.message
          : 'Failed to update notifications. Please try again.',
      );
    } finally {
      setIsUpdatingNotifications(false);
    }
  }

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppNavBar title="Profile" />
        <View style={styles.centered}>
          <ActivityIndicator color={BRAND_COLOR} />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppNavBar title="Profile" />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppNavBar title="Profile" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <ProfileCard
          displayName={profile.displayName}
          occupation={profile.occupation ?? ''}
          firstName={profile.firstName}
          lastName={profile.lastName}
          avatarUri={profile.avatarUri}
        />

        {errorMessage ? <Text style={styles.inlineError}>{errorMessage}</Text> : null}

        <View style={styles.settingsList}>
          <ProfileSettingsRow
            title="Edit profile information"
            onPress={() =>
              router.push(
                withReturnTo('/(tabs)/profile/edit', '/(tabs)/profile'),
              )
            }
          />
          <ProfileSettingsRow
            iconName="lock-closed-outline"
            title="Reset Password"
            onPress={() =>
              router.push(withReturnTo('/reset-password', '/(tabs)/profile'))
            }
          />
          <ProfileSettingsRow
            iconName="globe-outline"
            title="Language"
            subtitle={getProfileLanguageLabel(profile.language)}
            trailing={
              <ProfileSettingsSwitch
                value={isPolishLanguage(profile.language)}
                onValueChange={handleLanguageToggle}
                disabled={isUpdatingLanguage}
              />
            }
          />
          <ProfileSettingsRow
            iconName="notifications-outline"
            title="Notifications"
            trailing={
              <ProfileSettingsSwitch
                value={Boolean(profile.hasNotificationsEnabled)}
                onValueChange={handleNotificationsToggle}
                disabled={isUpdatingNotifications}
              />
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  settingsList: {
    gap: 12,
  },
  errorText: {
    color: MESSAGE_COLOR,
    fontSize: 14,
    textAlign: 'center',
  },
  inlineError: {
    color: '#FF616D',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
});
