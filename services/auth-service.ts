import { API_BASE_URL } from '@/config/api';

export type AuthUser = {
  id: number;
  username: string;
  displayName: string;
};

export type LoginSuccess = {
  user: AuthUser;
};

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

type ErrorBody = {
  error?: unknown;
};

function getErrorMessage(
  body: ErrorBody,
  statusCode: number,
  fallbackMessage: string,
  notFoundMessage: string,
): string {
  if (typeof body.error === 'string') {
    return body.error;
  }

  if (statusCode === 404) {
    return notFoundMessage;
  }

  return fallbackMessage;
}

export async function login(
  username: string,
  password: string,
): Promise<LoginSuccess> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof body.error === 'string'
        ? body.error
        : 'Login failed. Please try again.';
    throw new AuthError(message, response.status);
  }

  return body as LoginSuccess;
}

export type RecoverSuccess = {
  message: string;
};

export async function recoverAccount(email: string): Promise<RecoverSuccess> {
  const response = await fetch(`${API_BASE_URL}/recover`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = getErrorMessage(
      body,
      response.status,
      'Account recovery failed. Please try again.',
      'Recovery endpoint not found. Restart the mock API with npm run mock-api.',
    );
    throw new AuthError(message, response.status);
  }

  return body as RecoverSuccess;
}

export type ResetPasswordSuccess = {
  message: string;
};

export async function resetPassword(
  password: string,
  confirmPassword: string,
): Promise<ResetPasswordSuccess> {
  const response = await fetch(`${API_BASE_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, confirmPassword }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof body.error === 'string'
        ? body.error
        : 'Password reset failed. Please try again.';
    throw new AuthError(message, response.status);
  }

  return body as ResetPasswordSuccess;
}
