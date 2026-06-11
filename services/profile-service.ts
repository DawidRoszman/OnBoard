import { API_BASE_URL } from '@/config/api';
import type { AuthUser } from '@/services/auth-service';
import { setAuthUser } from '@/services/auth-session';

export type ProfileUser = AuthUser;

export type UpdateProfilePayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
};

export type UpdateProfilePreferencesPayload = {
  language?: string;
  hasNotificationsEnabled?: boolean;
};

export class ProfileError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'ProfileError';
  }
}

type ErrorBody = {
  error?: unknown;
};

function getProfileErrorMessage(
  body: ErrorBody,
  statusCode: number,
  fallbackMessage: string,
): string {
  if (typeof body.error === 'string') {
    return body.error;
  }

  if (statusCode === 404) {
    return 'Profile not found.';
  }

  return fallbackMessage;
}

export function syncAuthUserFromProfile(user: ProfileUser) {
  setAuthUser(user);
}

export async function getProfile(userId: number): Promise<ProfileUser> {
  const response = await fetch(`${API_BASE_URL}/profile?userId=${userId}`);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = getProfileErrorMessage(
      body,
      response.status,
      'Failed to load profile. Please try again.',
    );
    throw new ProfileError(message, response.status);
  }

  return (body as { user: ProfileUser }).user;
}

export async function updateProfile(
  userId: number,
  payload: UpdateProfilePayload,
): Promise<ProfileUser> {
  const response = await fetch(`${API_BASE_URL}/profile?userId=${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = getProfileErrorMessage(
      body,
      response.status,
      'Failed to update profile. Please try again.',
    );
    throw new ProfileError(message, response.status);
  }

  const user = (body as { user: ProfileUser }).user;
  syncAuthUserFromProfile(user);
  return user;
}

export async function updateProfilePreferences(
  userId: number,
  payload: UpdateProfilePreferencesPayload,
): Promise<ProfileUser> {
  const response = await fetch(
    `${API_BASE_URL}/profile/preferences?userId=${userId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = getProfileErrorMessage(
      body,
      response.status,
      'Failed to update preferences. Please try again.',
    );
    throw new ProfileError(message, response.status);
  }

  const user = (body as { user: ProfileUser }).user;
  syncAuthUserFromProfile(user);
  return user;
}

export async function uploadProfileAvatar(
  userId: number,
  avatarUri: string,
): Promise<ProfileUser> {
  const response = await fetch(`${API_BASE_URL}/profile/avatar?userId=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ avatarUri }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = getProfileErrorMessage(
      body,
      response.status,
      'Failed to upload avatar. Please try again.',
    );
    throw new ProfileError(message, response.status);
  }

  const user = (body as { user: ProfileUser }).user;
  syncAuthUserFromProfile(user);
  return user;
}

export async function removeProfileAvatar(userId: number): Promise<ProfileUser> {
  const response = await fetch(`${API_BASE_URL}/profile/avatar?userId=${userId}`, {
    method: 'DELETE',
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = getProfileErrorMessage(
      body,
      response.status,
      'Failed to remove avatar. Please try again.',
    );
    throw new ProfileError(message, response.status);
  }

  const user = (body as { user: ProfileUser }).user;
  syncAuthUserFromProfile(user);
  return user;
}
