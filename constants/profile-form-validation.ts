import type { UpdateProfilePayload } from '@/services/profile-service';

export const PROFILE_FORM_ERROR_COLOR = '#FF616D';

export type ProfileFormFieldName = keyof UpdateProfilePayload;

export type ProfileFormErrors = Partial<Record<ProfileFormFieldName, string>>;

export const PROFILE_FORM_FIELD_NAMES: ProfileFormFieldName[] = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'address',
];

const ERROR_MESSAGES = {
  firstName: 'First name must start with a capital letter',
  lastName: 'Last name must start with a capital letter',
  email: 'Enter correct email address',
  phone: 'Enter correct phone number',
  address: 'Enter correct address',
} as const;

function getTrimmedValues(formValues: UpdateProfilePayload): UpdateProfilePayload {
  return {
    firstName: formValues.firstName.trim(),
    lastName: formValues.lastName.trim(),
    email: formValues.email.trim(),
    phone: formValues.phone.trim(),
    address: formValues.address.trim(),
  };
}

function startsWithCapitalLetter(value: string): boolean {
  return /^[A-Z]/.test(value);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string): boolean {
  const digitCount = value.replace(/\D/g, '').length;

  return digitCount >= 9;
}

function isValidAddress(value: string): boolean {
  return value.length >= 2;
}

export function validateProfileForm(
  formValues: UpdateProfilePayload,
): ProfileFormErrors {
  const values = getTrimmedValues(formValues);
  const errors: ProfileFormErrors = {};

  if (!values.firstName || !startsWithCapitalLetter(values.firstName)) {
    errors.firstName = ERROR_MESSAGES.firstName;
  }

  if (!values.lastName || !startsWithCapitalLetter(values.lastName)) {
    errors.lastName = ERROR_MESSAGES.lastName;
  }

  if (!isValidEmail(values.email)) {
    errors.email = ERROR_MESSAGES.email;
  }

  if (!isValidPhone(values.phone)) {
    errors.phone = ERROR_MESSAGES.phone;
  }

  if (!isValidAddress(values.address)) {
    errors.address = ERROR_MESSAGES.address;
  }

  return errors;
}

export function validateProfileFormField(
  fieldName: ProfileFormFieldName,
  formValues: UpdateProfilePayload,
): string | undefined {
  return validateProfileForm(formValues)[fieldName];
}

export function hasProfileFormErrors(errors: ProfileFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function getAllProfileFieldsBlurred(): Record<ProfileFormFieldName, boolean> {
  return PROFILE_FORM_FIELD_NAMES.reduce(
    (blurredFields, fieldName) => {
      blurredFields[fieldName] = true;
      return blurredFields;
    },
    {} as Record<ProfileFormFieldName, boolean>,
  );
}
