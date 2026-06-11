import * as ImagePicker from 'expo-image-picker';
import type { Href } from 'expo-router';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackButton } from '@/components/app-back-button';
import { AppNavBar } from '@/components/app-navbar';
import { ProfileAvatarSheet } from '@/components/profile/profile-avatar-sheet';
import { ProfileCard } from '@/components/profile/profile-card';
import { ProfileEditForm } from '@/components/profile/profile-edit-form';
import {
  getAllProfileFieldsBlurred,
  hasProfileFormErrors,
  type ProfileFormErrors,
  type ProfileFormFieldName,
  validateProfileForm,
  validateProfileFormField,
} from '@/constants/profile-form-validation';
import {
  BACKGROUND_COLOR,
  BRAND_COLOR,
  FORM_WIDTH,
  LABEL_COLOR,
} from '@/constants/auth-ui';
import { persistAvatarUri } from '@/lib/persist-avatar-uri';
import {
  getProfile,
  ProfileError,
  removeProfileAvatar,
  updateProfile,
  uploadProfileAvatar,
  type ProfileUser,
  type UpdateProfilePayload,
} from '@/services/profile-service';

const EMPTY_FORM_VALUES: UpdateProfilePayload = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
};

type ProfileEditViewProps = {
  userId: number;
  fallbackRoute: Href | string;
  shouldSyncSession?: boolean;
};

function getTrimmedFormValues(
  formValues: UpdateProfilePayload,
): UpdateProfilePayload {
  return {
    firstName: formValues.firstName.trim(),
    lastName: formValues.lastName.trim(),
    email: formValues.email.trim(),
    phone: formValues.phone.trim(),
    address: formValues.address.trim(),
  };
}

function mapProfileToFormValues(profile: ProfileUser): UpdateProfilePayload {
  return {
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    email: profile.email ?? '',
    phone: profile.phone ?? '',
    address: profile.address ?? '',
  };
}

export function ProfileEditView({
  userId,
  fallbackRoute,
  shouldSyncSession = true,
}: ProfileEditViewProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [formValues, setFormValues] =
    useState<UpdateProfilePayload>(EMPTY_FORM_VALUES);
  const [fieldErrors, setFieldErrors] = useState<ProfileFormErrors>({});
  const [blurredFields, setBlurredFields] = useState<
    Partial<Record<ProfileFormFieldName, boolean>>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAvatarSheetVisible, setIsAvatarSheetVisible] = useState(false);
  const [isAvatarActionInProgress, setIsAvatarActionInProgress] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasLoadedProfileRef = useRef(false);
  const mutationOptions = { shouldSyncSession };

  useFocusEffect(
    useCallback(() => {
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
            setFormValues(mapProfileToFormValues(data));
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
    }, [userId]),
  );

  function syncFieldError(
    fieldName: ProfileFormFieldName,
    values: UpdateProfilePayload,
  ) {
    const fieldError = validateProfileFormField(fieldName, values);

    setFieldErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };

      if (fieldError) {
        nextErrors[fieldName] = fieldError;
      } else {
        delete nextErrors[fieldName];
      }

      return nextErrors;
    });
  }

  function handleFieldChange(fieldName: ProfileFormFieldName, value: string) {
    const nextValues = { ...formValues, [fieldName]: value };
    setFormValues(nextValues);

    if (blurredFields[fieldName]) {
      syncFieldError(fieldName, nextValues);
    }
  }

  function handleFieldBlur(fieldName: ProfileFormFieldName) {
    setBlurredFields((currentFields) => ({
      ...currentFields,
      [fieldName]: true,
    }));
    syncFieldError(fieldName, formValues);
  }

  async function handleSave() {
    const trimmedValues = getTrimmedFormValues(formValues);
    const validationErrors = validateProfileForm(trimmedValues);

    setFieldErrors(validationErrors);
    setBlurredFields(getAllProfileFieldsBlurred());

    if (hasProfileFormErrors(validationErrors)) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await updateProfile(userId, trimmedValues, mutationOptions);
      router.back();
    } catch (error) {
      setErrorMessage(
        error instanceof ProfileError
          ? error.message
          : 'Failed to update profile. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUploadAvatar() {
    let pickerResult: ImagePicker.ImagePickerResult;

    try {
      pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: Platform.OS !== 'web',
        aspect: [1, 1],
        quality: 0.8,
      });
    } catch {
      Alert.alert(
        'Permission required',
        'Allow photo library access to upload an avatar.',
      );
      setIsAvatarSheetVisible(false);
      return;
    } finally {
      setIsAvatarSheetVisible(false);
    }

    if (pickerResult.canceled || !pickerResult.assets[0]?.uri) {
      return;
    }

    setIsAvatarActionInProgress(true);
    setErrorMessage(null);

    try {
      const persistedAvatarUri = await persistAvatarUri(
        userId,
        pickerResult.assets[0].uri,
      );
      const updatedProfile = await uploadProfileAvatar(
        userId,
        persistedAvatarUri,
        mutationOptions,
      );
      setProfile(updatedProfile);
    } catch (error) {
      setErrorMessage(
        error instanceof ProfileError
          ? error.message
          : 'Failed to upload avatar. Please try again.',
      );
    } finally {
      setIsAvatarActionInProgress(false);
    }
  }

  async function handleRemoveAvatar() {
    setIsAvatarSheetVisible(false);
    setIsAvatarActionInProgress(true);
    setErrorMessage(null);

    try {
      const updatedProfile = await removeProfileAvatar(userId, mutationOptions);
      setProfile(updatedProfile);
    } catch (error) {
      setErrorMessage(
        error instanceof ProfileError
          ? error.message
          : 'Failed to remove avatar. Please try again.',
      );
    } finally {
      setIsAvatarActionInProgress(false);
    }
  }

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppNavBar
          title="Profile"
          leftAction={<AppBackButton fallbackRoute={fallbackRoute} />}
        />
        <View style={styles.centered}>
          <ActivityIndicator color={BRAND_COLOR} />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppNavBar
          title="Profile"
          leftAction={<AppBackButton fallbackRoute={fallbackRoute} />}
        />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppNavBar
        title="Profile"
        leftAction={<AppBackButton fallbackRoute={fallbackRoute} />}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <ProfileCard
            displayName={profile.displayName}
            occupation={profile.occupation ?? ''}
            firstName={profile.firstName}
            lastName={profile.lastName}
            avatarUri={profile.avatarUri}
            hasEditBubble
            onEditAvatarPress={() => setIsAvatarSheetVisible(true)}
          />

          {isAvatarActionInProgress ? (
            <ActivityIndicator
              color={BRAND_COLOR}
              style={styles.avatarLoader}
            />
          ) : null}

          <ProfileEditForm
            formValues={formValues}
            fieldErrors={fieldErrors}
            blurredFields={blurredFields}
            onFieldChange={handleFieldChange}
            onFieldBlur={handleFieldBlur}
          />

          {errorMessage ? (
            <Text style={styles.inlineError}>{errorMessage}</Text>
          ) : null}

          <Pressable
            style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Edit Profile">
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Edit Profile</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <ProfileAvatarSheet
        isVisible={isAvatarSheetVisible}
        hasAvatar={Boolean(profile.avatarUri?.trim())}
        onClose={() => setIsAvatarSheetVisible(false)}
        onUploadPress={handleUploadAvatar}
        onRemovePress={handleRemoveAvatar}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  avatarLoader: {
    marginTop: -12,
  },
  saveButton: {
    width: FORM_WIDTH,
    alignSelf: 'center',
    height: 36,
    borderRadius: 4,
    backgroundColor: BRAND_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: LABEL_COLOR,
    fontSize: 14,
    textAlign: 'center',
  },
  inlineError: {
    color: '#FF616D',
    fontSize: 13,
    textAlign: 'center',
  },
});
