import type { AuthUser } from '@/services/auth-service';

let currentUser: AuthUser | null = null;
let pendingTemporaryPassword: string | null = null;

export function setAuthUser(user: AuthUser | null) {
  currentUser = user;
}

export function getAuthUser(): AuthUser | null {
  return currentUser;
}

export function setPendingTemporaryPassword(password: string | null) {
  pendingTemporaryPassword = password;
}

export function getPendingTemporaryPassword(): string | null {
  return pendingTemporaryPassword;
}

export function clearPendingTemporaryPassword() {
  pendingTemporaryPassword = null;
}

export function clearAuthSession() {
  currentUser = null;
  pendingTemporaryPassword = null;
}
