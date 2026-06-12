import { Platform } from 'react-native';

const DEFAULT_PORT = 3004;

function getDefaultHost(): string {
  if (Platform.OS === 'android') {
    return `http://100.123.252.14:${DEFAULT_PORT}`;
  }
  return `http://localhost:${DEFAULT_PORT}`;
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? getDefaultHost();
