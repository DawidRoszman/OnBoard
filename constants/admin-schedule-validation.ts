import { ADMIN_FORM_ERROR_COLOR } from '@/constants/admin-form-validation';

export { ADMIN_FORM_ERROR_COLOR as ADMIN_SCHEDULE_ERROR_COLOR };

export type AdminScheduleTaskFieldName =
  | 'title'
  | 'description'
  | 'detailDescription'
  | 'time'
  | 'dueTime';

export type AdminScheduleTaskFormValues = {
  title: string;
  description: string;
  detailDescription: string;
  time: string;
  dueTime: string;
};

export type AdminScheduleTaskFormErrors = Partial<
  Record<AdminScheduleTaskFieldName, string>
>;

const ERROR_MESSAGES = {
  title: 'Title cannot be empty',
  description: 'Subtitle cannot be empty',
  detailDescription: 'Description cannot be empty',
  time: 'Starts at time is invalid',
  dueTime: 'Due at time is invalid',
} as const;

function parseTimeToMinutes(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time.trim());

  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function isValidTimeLabel(time: string): boolean {
  return parseTimeToMinutes(time) !== null;
}

function getTrimmedValues(
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

export function validateAdminScheduleTaskField(
  fieldName: AdminScheduleTaskFieldName,
  formValues: AdminScheduleTaskFormValues,
): string | undefined {
  const trimmedValues = getTrimmedValues(formValues);

  if (fieldName === 'title' && !trimmedValues.title) {
    return ERROR_MESSAGES.title;
  }

  if (fieldName === 'description' && !trimmedValues.description) {
    return ERROR_MESSAGES.description;
  }

  if (fieldName === 'detailDescription' && !trimmedValues.detailDescription) {
    return ERROR_MESSAGES.detailDescription;
  }

  if (fieldName === 'time' && !isValidTimeLabel(trimmedValues.time)) {
    return ERROR_MESSAGES.time;
  }

  if (fieldName === 'dueTime') {
    if (!isValidTimeLabel(trimmedValues.dueTime)) {
      return ERROR_MESSAGES.dueTime;
    }

    const startMinutes = parseTimeToMinutes(trimmedValues.time);
    const dueMinutes = parseTimeToMinutes(trimmedValues.dueTime);

    if (
      startMinutes !== null &&
      dueMinutes !== null &&
      dueMinutes <= startMinutes
    ) {
      return 'Due at must be after starts at';
    }
  }

  return undefined;
}

export function validateAdminScheduleTaskForm(
  formValues: AdminScheduleTaskFormValues,
): AdminScheduleTaskFormErrors {
  const fieldNames: AdminScheduleTaskFieldName[] = [
    'title',
    'description',
    'detailDescription',
    'time',
    'dueTime',
  ];

  const errors: AdminScheduleTaskFormErrors = {};

  for (const fieldName of fieldNames) {
    const fieldError = validateAdminScheduleTaskField(fieldName, formValues);

    if (fieldError) {
      errors[fieldName] = fieldError;
    }
  }

  return errors;
}

export function hasAdminScheduleTaskFormErrors(
  errors: AdminScheduleTaskFormErrors,
): boolean {
  return Object.keys(errors).length > 0;
}

export function getAllAdminScheduleTaskFieldsBlurred(): Partial<
  Record<AdminScheduleTaskFieldName, boolean>
> {
  return {
    title: true,
    description: true,
    detailDescription: true,
    time: true,
    dueTime: true,
  };
}
