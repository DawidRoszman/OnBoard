import { API_BASE_URL } from '@/config/api';

export type CreateUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  occupation: string;
};

export type CreatedUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  occupation: string;
  username: string;
  displayName: string;
  createdAt: string;
};

export type CreateUserSuccess = {
  user: CreatedUser;
  message: string;
};

export class AdminError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'AdminError';
  }
}

export async function createUser(
  payload: CreateUserPayload,
): Promise<CreateUserSuccess> {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = getAdminErrorMessage(body, response.status);
    throw new AdminError(message, response.status);
  }

  return body as CreateUserSuccess;
}

function getAdminErrorMessage(
  body: { error?: unknown },
  statusCode: number,
): string {
  if (typeof body.error === 'string') {
    return body.error;
  }

  if (statusCode === 404) {
    return 'Admin endpoint not found. Restart the mock API with npm run mock-api.';
  }

  return 'User creation failed. Please try again.';
}
