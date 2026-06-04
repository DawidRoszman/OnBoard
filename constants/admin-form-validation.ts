import { ADMIN_OCCUPATIONS, type AdminOccupation } from '@/constants/admin-occupations';
import type { CreateUserPayload } from '@/services/admin-service';

export const ADMIN_FORM_ERROR_COLOR = '#FF616D';

export type AdminFormFieldName = keyof CreateUserPayload;

export type AdminFormErrors = Partial<Record<AdminFormFieldName, string>>;

export const ADMIN_FORM_FIELD_NAMES: AdminFormFieldName[] = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'dateOfBirth',
  'address',
  'occupation',
];

const ERROR_MESSAGES = {
  firstName: 'First name must start with a capital letter',
  lastName: 'Last name must start with a capital letter',
  email: 'Enter correct email address',
  phone: 'Enter correct phone number',
  dateOfBirth: 'The date must be in the past',
  address: 'Enter correct address',
  occupation: 'Occupation must not be empty',
} as const;

function getTrimmedValues(formValues: CreateUserPayload): CreateUserPayload {
  return {
    firstName: formValues.firstName.trim(),
    lastName: formValues.lastName.trim(),
    email: formValues.email.trim(),
    phone: formValues.phone.trim(),
    dateOfBirth: formValues.dateOfBirth.trim(),
    address: formValues.address.trim(),
    occupation: formValues.occupation.trim(),
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

function parseDateOfBirth(value: string): Date | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  const year = Number(match[3]);
  const parsedDate = new Date(year, month, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
}

function isDateInPast(value: string): boolean {
  const parsedDate = parseDateOfBirth(value);

  if (!parsedDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return parsedDate.getTime() < today.getTime();
}

function isValidAddress(value: string): boolean {
  return value.length >= 3;
}

function isValidOccupation(value: string): value is AdminOccupation {
  return ADMIN_OCCUPATIONS.includes(value as AdminOccupation);
}

export function validateAdminCreateUserForm(
  formValues: CreateUserPayload,
): AdminFormErrors {
  const values = getTrimmedValues(formValues);
  const errors: AdminFormErrors = {};

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

  if (!isDateInPast(values.dateOfBirth)) {
    errors.dateOfBirth = ERROR_MESSAGES.dateOfBirth;
  }

  if (!isValidAddress(values.address)) {
    errors.address = ERROR_MESSAGES.address;
  }

  if (!isValidOccupation(values.occupation)) {
    errors.occupation = ERROR_MESSAGES.occupation;
  }

  return errors;
}

export function validateAdminFormField(
  fieldName: AdminFormFieldName,
  formValues: CreateUserPayload,
): string | undefined {
  return validateAdminCreateUserForm(formValues)[fieldName];
}

export function hasAdminFormErrors(errors: AdminFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function getAllFieldsBlurred(): Record<AdminFormFieldName, boolean> {
  return ADMIN_FORM_FIELD_NAMES.reduce(
    (blurredFields, fieldName) => {
      blurredFields[fieldName] = true;
      return blurredFields;
    },
    {} as Record<AdminFormFieldName, boolean>,
  );
}
