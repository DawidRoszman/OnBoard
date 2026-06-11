import { Stack } from 'expo-router';

export default function AdminUserScheduleLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="task" />
    </Stack>
  );
}
