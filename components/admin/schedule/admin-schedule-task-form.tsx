import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AdminFormField } from '@/components/admin/admin-form-field';
import { ScheduleTimeField } from '@/components/admin/schedule/schedule-time-field';
import {
  ADMIN_SCHEDULE_DIVIDER_COLOR,
  ADMIN_SCHEDULE_TILE_BACKGROUND,
} from '@/constants/admin-schedule-ui';
import {
  BORDER_COLOR,
  LABEL_COLOR,
  PLACEHOLDER_COLOR,
} from '@/constants/auth-ui';
import type {
  AdminScheduleTaskFormErrors,
  AdminScheduleTaskFormValues,
} from '@/constants/admin-schedule-validation';

type AdminScheduleTaskFormProps = {
  formValues: AdminScheduleTaskFormValues;
  fieldErrors: AdminScheduleTaskFormErrors;
  blurredFields: Partial<Record<keyof AdminScheduleTaskFormValues, boolean>>;
  onFieldChange: (
    fieldName: keyof AdminScheduleTaskFormValues,
    value: string,
  ) => void;
  onFieldBlur: (fieldName: keyof AdminScheduleTaskFormValues) => void;
};

function getVisibleFieldError(
  fieldName: keyof AdminScheduleTaskFormValues,
  fieldErrors: AdminScheduleTaskFormErrors,
  blurredFields: Partial<Record<keyof AdminScheduleTaskFormValues, boolean>>,
): string | undefined {
  if (!blurredFields[fieldName]) {
    return undefined;
  }

  return fieldErrors[fieldName];
}

export function AdminScheduleTaskForm({
  formValues,
  fieldErrors,
  blurredFields,
  onFieldChange,
  onFieldBlur,
}: AdminScheduleTaskFormProps) {
  return (
    <View style={styles.form}>
      <View style={styles.section}>
        <View style={styles.divider} />

        <View style={styles.headerCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Title</Text>
            <AdminFormField
              value={formValues.title}
              placeholder="Check e-mail"
              onChangeText={(value) => onFieldChange('title', value)}
              onBlur={() => onFieldBlur('title')}
              errorMessage={getVisibleFieldError(
                'title',
                fieldErrors,
                blurredFields,
              )}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Subtitle</Text>
            <AdminFormField
              value={formValues.description}
              placeholder="Start your day with seeing what's going on"
              onChangeText={(value) => onFieldChange('description', value)}
              onBlur={() => onFieldBlur('description')}
              errorMessage={getVisibleFieldError(
                'description',
                fieldErrors,
                blurredFields,
              )}
            />
          </View>
        </View>

        <View style={styles.timeSection}>
          <ScheduleTimeField
            label="Starts at"
            iconName="stopwatch-outline"
            value={formValues.time}
            onChange={(value) => {
              onFieldChange('time', value);
              if (blurredFields.dueTime) {
                onFieldBlur('dueTime');
              }
            }}
          />
          <ScheduleTimeField
            label="Due at"
            iconName="time-outline"
            value={formValues.dueTime}
            onChange={(value) => onFieldChange('dueTime', value)}
          />
          {getVisibleFieldError('time', fieldErrors, blurredFields) ? (
            <Text style={styles.errorText} accessibilityRole="alert">
              {getVisibleFieldError('time', fieldErrors, blurredFields)}
            </Text>
          ) : null}
          {getVisibleFieldError('dueTime', fieldErrors, blurredFields) ? (
            <Text style={styles.errorText} accessibilityRole="alert">
              {getVisibleFieldError('dueTime', fieldErrors, blurredFields)}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.descriptionSection}>
        <Text style={styles.fieldLabel}>Description</Text>
        <TextInput
          style={styles.descriptionInput}
          value={formValues.detailDescription}
          placeholder="Start by scanning your inbox..."
          placeholderTextColor={PLACEHOLDER_COLOR}
          multiline
          textAlignVertical="top"
          onChangeText={(value) => onFieldChange('detailDescription', value)}
          onBlur={() => onFieldBlur('detailDescription')}
        />
        {getVisibleFieldError(
          'detailDescription',
          fieldErrors,
          blurredFields,
        ) ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {getVisibleFieldError(
              'detailDescription',
              fieldErrors,
              blurredFields,
            )}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 20,
  },
  section: {
    gap: 8,
  },
  divider: {
    height: 2,
    backgroundColor: ADMIN_SCHEDULE_DIVIDER_COLOR,
  },
  headerCard: {
    borderRadius: 16,
    backgroundColor: ADMIN_SCHEDULE_TILE_BACKGROUND,
    padding: 16,
    gap: 8,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: LABEL_COLOR,
    fontSize: 14,
    fontWeight: '500',
  },
  timeSection: {
    gap: 12,
  },
  descriptionSection: {
    gap: 6,
  },
  descriptionInput: {
    minHeight: 208,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 21,
    color: LABEL_COLOR,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#FF616D',
    fontSize: 12,
    lineHeight: 16,
  },
});
