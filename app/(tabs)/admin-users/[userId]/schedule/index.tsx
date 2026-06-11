import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdminScheduleTaskSection } from '@/components/admin/schedule/admin-schedule-task-section';
import { AppBackButton } from '@/components/app-back-button';
import { AppLoadingState } from '@/components/app-loading-state';
import { AppNavBar } from '@/components/app-navbar';
import {
  ADMIN_SCHEDULE_DIVIDER_COLOR,
  ADMIN_SCHEDULE_LABEL_COLOR,
  ADMIN_SCHEDULE_TILE_BACKGROUND,
} from '@/constants/admin-schedule-ui';
import { BACKGROUND_COLOR } from '@/constants/auth-ui';
import { withReturnTo } from '@/lib/back-navigation';
import {
  AdminScheduleError,
  deleteScheduleTask,
  getScheduleForUser,
  updateScheduleTask,
} from '@/services/admin-schedule-service';
import type { Schedule, ScheduleTask } from '@/services/schedule-service';

function parseUserIdParam(userId: string | string[] | undefined): number | null {
  const rawValue = Array.isArray(userId) ? userId[0] : userId;
  const parsedUserId = Number(rawValue);

  if (!Number.isInteger(parsedUserId)) {
    return null;
  }

  return parsedUserId;
}

function sortTasksByTime(tasks: ScheduleTask[]): ScheduleTask[] {
  return [...tasks].sort((leftTask, rightTask) => {
    const leftMinutes =
      Number(leftTask.time.split(':')[0]) * 60 +
      Number(leftTask.time.split(':')[1]);
    const rightMinutes =
      Number(rightTask.time.split(':')[0]) * 60 +
      Number(rightTask.time.split(':')[1]);

    return leftMinutes - rightMinutes;
  });
}

export default function EditScheduleScreen() {
  const router = useRouter();
  const { userId, userName } = useLocalSearchParams<{
    userId?: string;
    userName?: string;
  }>();
  const parsedUserId = parseUserIdParam(userId);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const hasLoadedScheduleRef = useRef(false);

  const displayName = useMemo(() => {
    if (typeof userName === 'string' && userName.trim()) {
      return userName.trim();
    }

    return 'User';
  }, [userName]);

  const sortedTasks = useMemo(() => {
    if (!schedule) {
      return [];
    }

    return sortTasksByTime(schedule.tasks);
  }, [schedule]);

  const loadSchedule = useCallback(async () => {
    if (parsedUserId === null) {
      setErrorMessage('Invalid user selected.');
      setIsLoading(false);
      return;
    }

    const shouldShowLoading = !hasLoadedScheduleRef.current;

    if (shouldShowLoading) {
      setIsLoading(true);
    }

    try {
      const data = await getScheduleForUser(parsedUserId);
      setSchedule(data);
      setErrorMessage(null);
      hasLoadedScheduleRef.current = true;
    } catch (error) {
      setErrorMessage(
        error instanceof AdminScheduleError
          ? error.message
          : 'Failed to load schedule. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [parsedUserId]);

  useFocusEffect(
    useCallback(() => {
      loadSchedule();
    }, [loadSchedule]),
  );

  function openAddTask() {
    if (parsedUserId === null) {
      return;
    }

    const taskRoute = `/(tabs)/admin-users/${parsedUserId}/schedule/task?userName=${encodeURIComponent(displayName)}`;

    router.push(
      withReturnTo(taskRoute, `/(tabs)/admin-users/${parsedUserId}/schedule`),
    );
  }

  function openEditTask(taskId: string) {
    if (parsedUserId === null) {
      return;
    }

    const taskRoute = `/(tabs)/admin-users/${parsedUserId}/schedule/task?taskId=${taskId}&userName=${encodeURIComponent(displayName)}`;

    router.push(
      withReturnTo(taskRoute, `/(tabs)/admin-users/${parsedUserId}/schedule`),
    );
  }

  async function handleTimeChange(
    task: ScheduleTask,
    field: 'time' | 'dueTime',
    value: string,
  ) {
    if (parsedUserId === null || updatingTaskId) {
      return;
    }

    setUpdatingTaskId(task.id);

    try {
      const updatedTask = await updateScheduleTask(parsedUserId, task.id, {
        [field]: value,
      });

      setSchedule((currentSchedule) => {
        if (!currentSchedule) {
          return currentSchedule;
        }

        return {
          ...currentSchedule,
          tasks: currentSchedule.tasks.map((entry) =>
            entry.id === updatedTask.id ? updatedTask : entry,
          ),
        };
      });
    } catch (error) {
      Alert.alert(
        'Update failed',
        error instanceof AdminScheduleError
          ? error.message
          : 'Failed to update task time. Please try again.',
      );
    } finally {
      setUpdatingTaskId(null);
    }
  }

  function confirmRemoveTask(task: ScheduleTask) {
    Alert.alert(
      'Remove task',
      `Remove "${task.title}" from the schedule?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => handleRemoveTask(task.id),
        },
      ],
    );
  }

  async function handleRemoveTask(taskId: string) {
    if (parsedUserId === null) {
      return;
    }

    setUpdatingTaskId(taskId);

    try {
      await deleteScheduleTask(parsedUserId, taskId);
      await loadSchedule();
    } catch (error) {
      Alert.alert(
        'Remove failed',
        error instanceof AdminScheduleError
          ? error.message
          : 'Failed to remove task. Please try again.',
      );
    } finally {
      setUpdatingTaskId(null);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppNavBar
          title="Edit schedule"
          leftAction={
            <AppBackButton fallbackRoute="/(tabs)/admin-users" />
          }
        />
        <AppLoadingState message="Loading schedule..." />
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppNavBar
          title="Edit schedule"
          leftAction={
            <AppBackButton fallbackRoute="/(tabs)/admin-users" />
          }
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppNavBar
        title="Edit schedule"
        leftAction={<AppBackButton fallbackRoute="/(tabs)/admin-users" />}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>
          Edit {displayName}
          {"'"}s schedule
        </Text>

        <View style={styles.taskList}>
          {sortedTasks.map((task) => (
            <AdminScheduleTaskSection
              key={task.id}
              task={task}
              isUpdating={updatingTaskId === task.id}
              onTimeChange={(field, value) =>
                handleTimeChange(task, field, value)
              }
              onEditDetails={() => openEditTask(task.id)}
              onRemove={() => confirmRemoveTask(task)}
            />
          ))}

          <View style={styles.addSection}>
            <View style={styles.divider} />
            <Pressable
              style={styles.addCard}
              onPress={openAddTask}
              accessibilityRole="button"
              accessibilityLabel="Add new task">
              <Ionicons
                name="add-circle-outline"
                size={24}
                color={ADMIN_SCHEDULE_LABEL_COLOR}
              />
              <Text style={styles.addCardText}>Add new task</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 20,
  },
  heading: {
    color: ADMIN_SCHEDULE_LABEL_COLOR,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  taskList: {
    gap: 20,
  },
  addSection: {
    gap: 8,
  },
  divider: {
    height: 2,
    backgroundColor: ADMIN_SCHEDULE_DIVIDER_COLOR,
  },
  addCard: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 16,
    backgroundColor: ADMIN_SCHEDULE_TILE_BACKGROUND,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  addCardText: {
    flex: 1,
    color: ADMIN_SCHEDULE_LABEL_COLOR,
    fontSize: 14,
    lineHeight: 21,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: ADMIN_SCHEDULE_LABEL_COLOR,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
