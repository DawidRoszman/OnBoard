import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdminScheduleTaskForm } from '@/components/admin/schedule/admin-schedule-task-form';
import { AppBackButton } from '@/components/app-back-button';
import { AppLoadingState } from '@/components/app-loading-state';
import { AppNavBar } from '@/components/app-navbar';
import {
  getAllAdminScheduleTaskFieldsBlurred,
  hasAdminScheduleTaskFormErrors,
  validateAdminScheduleTaskField,
  validateAdminScheduleTaskForm,
  type AdminScheduleTaskFieldName,
  type AdminScheduleTaskFormErrors,
  type AdminScheduleTaskFormValues,
} from '@/constants/admin-schedule-validation';
import { ADMIN_SCHEDULE_LABEL_COLOR } from '@/constants/admin-schedule-ui';
import {
  BACKGROUND_COLOR,
  BRAND_COLOR,
} from '@/constants/auth-ui';
import {
  AdminScheduleError,
  createScheduleTask,
  getScheduleForUser,
  updateScheduleTask,
} from '@/services/admin-schedule-service';

const EMPTY_FORM_VALUES: AdminScheduleTaskFormValues = {
  title: '',
  description: '',
  detailDescription: '',
  time: '09:00',
  dueTime: '09:15',
};

function parseUserIdParam(userId: string | string[] | undefined): number | null {
  const rawValue = Array.isArray(userId) ? userId[0] : userId;
  const parsedUserId = Number(rawValue);

  if (!Number.isInteger(parsedUserId)) {
    return null;
  }

  return parsedUserId;
}

function getTrimmedFormValues(
  formValues: AdminScheduleTaskFormValues,
): AdminScheduleTaskFormValues {
  return {
    title: formValues.title.trim(),
    description: formValues.description.trim(),
    detailDescription: formValues.detailDescription.trim(),
    time: formValues.time.trim(),
    dueTime: formValues.dueTime.trim(),
  };
}

export default function AdminScheduleTaskScreen() {
  const router = useRouter();
  const { userId, userName, taskId } = useLocalSearchParams<{
    userId?: string;
    userName?: string;
    taskId?: string;
  }>();
  const parsedUserId = parseUserIdParam(userId);
  const isEditMode = typeof taskId === 'string' && taskId.length > 0;

  const [formValues, setFormValues] =
    useState<AdminScheduleTaskFormValues>(EMPTY_FORM_VALUES);
  const [fieldErrors, setFieldErrors] = useState<AdminScheduleTaskFormErrors>(
    {},
  );
  const [blurredFields, setBlurredFields] = useState<
    Partial<Record<AdminScheduleTaskFieldName, boolean>>
  >({});
  const [isLoadingTask, setIsLoadingTask] = useState(isEditMode);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
    null,
  );

  const displayName = useMemo(() => {
    if (typeof userName === 'string' && userName.trim()) {
      return userName.trim();
    }

    return 'User';
  }, [userName]);

  const loadTask = useCallback(async () => {
    if (!isEditMode || parsedUserId === null || !taskId) {
      setIsLoadingTask(false);
      return;
    }

    setIsLoadingTask(true);

    try {
      const schedule = await getScheduleForUser(parsedUserId);
      const task = schedule.tasks.find((entry) => entry.id === taskId);

      if (!task) {
        setLoadErrorMessage('Task not found.');
        return;
      }

      setFormValues({
        title: task.title,
        description: task.description,
        detailDescription: task.detailDescription,
        time: task.time,
        dueTime: task.dueTime,
      });
      setLoadErrorMessage(null);
    } catch (error) {
      setLoadErrorMessage(
        error instanceof AdminScheduleError
          ? error.message
          : 'Failed to load task. Please try again.',
      );
    } finally {
      setIsLoadingTask(false);
    }
  }, [isEditMode, parsedUserId, taskId]);

  useFocusEffect(
    useCallback(() => {
      loadTask();
    }, [loadTask]),
  );

  function syncFieldError(
    fieldName: AdminScheduleTaskFieldName,
    values: AdminScheduleTaskFormValues,
  ) {
    const fieldError = validateAdminScheduleTaskField(fieldName, values);

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

  function handleFieldBlur(fieldName: AdminScheduleTaskFieldName) {
    setBlurredFields((currentBlurredFields) => ({
      ...currentBlurredFields,
      [fieldName]: true,
    }));
    syncFieldError(fieldName, formValues);
  }

  function handleFieldChange(
    fieldName: AdminScheduleTaskFieldName,
    value: string,
  ) {
    const nextValues = {
      ...formValues,
      [fieldName]: value,
    };

    setFormValues(nextValues);

    if (blurredFields[fieldName]) {
      syncFieldError(fieldName, nextValues);
    }

    if (fieldName === 'time' && blurredFields.dueTime) {
      syncFieldError('dueTime', nextValues);
    }
  }

  async function handleSave() {
    if (isSubmitting || parsedUserId === null) {
      return;
    }

    const validationErrors = validateAdminScheduleTaskForm(formValues);

    setBlurredFields(getAllAdminScheduleTaskFieldsBlurred());
    setFieldErrors(validationErrors);
    setSubmitErrorMessage(null);

    if (hasAdminScheduleTaskFormErrors(validationErrors)) {
      return;
    }

    const trimmedValues = getTrimmedFormValues(formValues);

    setIsSubmitting(true);

    try {
      if (isEditMode && taskId) {
        await updateScheduleTask(parsedUserId, taskId, trimmedValues);
      } else {
        await createScheduleTask(parsedUserId, trimmedValues);
      }

      router.back();
    } catch (error) {
      setSubmitErrorMessage(
        error instanceof AdminScheduleError
          ? error.message
          : 'Failed to save task. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingTask) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppNavBar
          title={isEditMode ? 'Edit task' : 'New task'}
          leftAction={
            <AppBackButton
              fallbackRoute={
                parsedUserId
                  ? `/(tabs)/admin-users/${parsedUserId}/schedule`
                  : '/(tabs)/admin-users'
              }
            />
          }
        />
        <AppLoadingState message="Loading task..." />
      </SafeAreaView>
    );
  }

  if (loadErrorMessage) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppNavBar
          title={isEditMode ? 'Edit task' : 'New task'}
          leftAction={
            <AppBackButton
              fallbackRoute={
                parsedUserId
                  ? `/(tabs)/admin-users/${parsedUserId}/schedule`
                  : '/(tabs)/admin-users'
              }
            />
          }
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{loadErrorMessage}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppNavBar
        title={isEditMode ? 'Edit task' : 'New task'}
        leftAction={
          <AppBackButton
            fallbackRoute={
              parsedUserId
                ? `/(tabs)/admin-users/${parsedUserId}/schedule`
                : '/(tabs)/admin-users'
            }
          />
        }
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>
            {isEditMode ? 'Edit task for' : 'New task for'} {displayName}
          </Text>

          <AdminScheduleTaskForm
            formValues={formValues}
            fieldErrors={fieldErrors}
            blurredFields={blurredFields}
            onFieldChange={handleFieldChange}
            onFieldBlur={handleFieldBlur}
          />

          {submitErrorMessage ? (
            <Text style={styles.submitErrorText} accessibilityRole="alert">
              {submitErrorMessage}
            </Text>
          ) : null}
        </ScrollView>

        <View style={styles.saveBar}>
          <Pressable
            style={[
              styles.saveButton,
              isSubmitting && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Save task">
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 20,
  },
  heading: {
    color: ADMIN_SCHEDULE_LABEL_COLOR,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  saveBar: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
  },
  saveButton: {
    minWidth: 75,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    backgroundColor: BRAND_COLOR,
    paddingHorizontal: 20,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: ADMIN_SCHEDULE_LABEL_COLOR,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  submitErrorText: {
    color: '#FF616D',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
