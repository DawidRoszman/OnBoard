import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppLoadingState } from '@/components/app-loading-state';
import { AppNavBar } from '@/components/app-navbar';
import {
  BACKGROUND_COLOR,
  BRAND_COLOR,
  LABEL_COLOR,
  MESSAGE_COLOR,
} from '@/constants/auth-ui';
import {
  completeScheduleTask,
  getScheduleTask,
  ScheduleError,
  type ScheduleTask,
  type ScheduleTaskStatus,
} from '@/services/schedule-service';

type DetailStatus = Extract<
  ScheduleTaskStatus,
  'done' | 'late' | 'overdue' | 'todo'
>;

const STATUS_STYLES: Record<
  DetailStatus,
  {
    label: string;
    color: string;
    badgeBackground: string;
    buttonBackground: string;
    isCompleted: boolean;
  }
> = {
  done: {
    label: 'DONE',
    color: BRAND_COLOR,
    badgeBackground: '#C9F2C7',
    buttonBackground: 'rgba(98, 148, 96, 0.55)',
    isCompleted: true,
  },
  late: {
    label: 'LATE',
    color: '#85AE25',
    badgeBackground: '#85AE25',
    buttonBackground: 'rgba(133, 174, 37, 0.55)',
    isCompleted: true,
  },
  overdue: {
    label: 'OVERDUE',
    color: '#FB9D4B',
    badgeBackground: '#FECCAA',
    buttonBackground: '#FDB474',
    isCompleted: false,
  },
  todo: {
    label: 'TODO',
    color: MESSAGE_COLOR,
    badgeBackground: '#57C2F6',
    buttonBackground: BRAND_COLOR,
    isCompleted: false,
  },
};

const CONFETTI_PIECES = [
  { color: '#F8D348', left: '46%', bottom: 120, x: -120, y: -360, rotate: '-35deg' },
  { color: '#F8D348', left: '49%', bottom: 120, x: -84, y: -430, rotate: '42deg' },
  { color: '#F8D348', left: '51%', bottom: 120, x: -42, y: -500, rotate: '-18deg' },
  { color: '#F8D348', left: '53%', bottom: 120, x: 8, y: -540, rotate: '34deg' },
  { color: '#F8D348', left: '55%', bottom: 120, x: 58, y: -500, rotate: '-28deg' },
  { color: '#F8D348', left: '57%', bottom: 120, x: 100, y: -420, rotate: '20deg' },
  { color: '#FF616D', left: '50%', bottom: 120, x: -20, y: -470, rotate: '55deg' },
  { color: '#FF616D', left: '54%', bottom: 120, x: 82, y: -380, rotate: '-48deg' },
  { color: '#FEFEFF', left: '52%', bottom: 120, x: 28, y: -450, rotate: '18deg' },
  { color: '#57C2F6', left: '45%', bottom: 116, x: -150, y: -300, rotate: '70deg' },
  { color: '#57C2F6', left: '48%', bottom: 118, x: -105, y: -520, rotate: '-72deg' },
  { color: '#57C2F6', left: '56%', bottom: 116, x: 128, y: -315, rotate: '-64deg' },
  { color: '#57C2F6', left: '59%', bottom: 118, x: 145, y: -490, rotate: '66deg' },
  { color: '#629460', left: '47%', bottom: 122, x: -64, y: -335, rotate: '-100deg' },
  { color: '#629460', left: '50%', bottom: 122, x: -10, y: -570, rotate: '96deg' },
  { color: '#629460', left: '54%', bottom: 122, x: 52, y: -560, rotate: '-92deg' },
  { color: '#629460', left: '58%', bottom: 122, x: 112, y: -350, rotate: '104deg' },
  { color: '#FDB474', left: '46%', bottom: 126, x: -132, y: -440, rotate: '124deg' },
  { color: '#FDB474', left: '52%', bottom: 126, x: 18, y: -610, rotate: '-118deg' },
  { color: '#FDB474', left: '57%', bottom: 126, x: 136, y: -460, rotate: '132deg' },
  { color: '#FEFEFF', left: '49%', bottom: 124, x: -38, y: -390, rotate: '-140deg' },
  { color: '#FEFEFF', left: '55%', bottom: 124, x: 76, y: -405, rotate: '148deg' },
] as const;

export default function ScheduleTaskDetailsScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId?: string }>();
  const [task, setTask] = useState<ScheduleTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [confettiBurstId, setConfettiBurstId] = useState(0);

  useEffect(() => {
    let isMounted = true;

    setTask(null);
    setIsLoading(true);
    setErrorMessage(null);
    setCompletionError(null);
    setConfettiBurstId(0);

    async function loadTask() {
      if (!taskId) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      const requestedTaskId = taskId;

      try {
        const data = await getScheduleTask(requestedTaskId);

        if (isMounted && data.id === requestedTaskId) {
          setTask(data);
          setErrorMessage(null);
        }
      } catch (error) {
        if (isMounted) {
          setTask(null);
          setErrorMessage(
            error instanceof ScheduleError
              ? error.message
              : 'Failed to load task. Please try again.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTask();

    return () => {
      isMounted = false;
    };
  }, [taskId]);

  function navigateToSchedule() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/schedule');
  }

  const detail = useMemo(() => {
    if (!task) {
      return undefined;
    }

    return getTaskDetail(task);
  }, [task]);

  const isShowingStaleTask = task !== null && task.id !== taskId;
  const navTitle = task?.title ?? 'Task';

  if (isLoading || isShowingStaleTask) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppLoadingState message="Loading task" />
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScheduleTaskNavBar title={navTitle} onBack={navigateToSchedule} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{errorMessage}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!task || !detail) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScheduleTaskNavBar title={navTitle} onBack={navigateToSchedule} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Task not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = STATUS_STYLES[detail.status];

  async function handleMarkAsCompleted() {
    if (statusStyle.isCompleted || isCompleting || !task) {
      return;
    }

    setIsCompleting(true);
    setCompletionError(null);

    try {
      const updatedTask = await completeScheduleTask(task.id);
      setTask(updatedTask);
      setConfettiBurstId((currentBurstId) => currentBurstId + 1);
    } catch (error) {
      setCompletionError(
        error instanceof ScheduleError
          ? error.message
          : 'Failed to complete task. Please try again.',
      );
    } finally {
      setIsCompleting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScheduleTaskNavBar title={task.title} onBack={navigateToSchedule} />

      <View style={styles.content}>
        <View style={styles.summaryRow}>
          <View style={styles.metaColumn}>
            <ScheduleTaskMetaRow
              iconName="time"
              color={statusStyle.color}
              label="Due at"
              time={task.dueTime}
            />
            <ScheduleTaskMetaRow
              iconName="alarm-outline"
              color={statusStyle.color}
              label={detail.secondaryLabel}
              time={detail.completedTime}
            />
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusStyle.badgeBackground },
            ]}>
            <Text style={styles.statusBadgeText}>{statusStyle.label}</Text>
          </View>
        </View>

        <Text style={styles.description}>{task.detailDescription}</Text>
      </View>

      <View style={styles.bottomActions}>
        <Pressable
          style={[
            styles.completeButton,
            { backgroundColor: statusStyle.buttonBackground },
          ]}
          onPress={handleMarkAsCompleted}
          disabled={statusStyle.isCompleted || isCompleting}
          accessibilityRole="button"
          accessibilityLabel={
            statusStyle.isCompleted ? 'Marked as completed' : 'Mark as completed'
          }>
          {isCompleting ? (
            <ActivityIndicator color="#FEFEFF" size="small" />
          ) : (
            <Text style={styles.completeButtonText}>
              {statusStyle.isCompleted
                ? 'Marked as completed'
                : 'Mark as completed'}
            </Text>
          )}
        </Pressable>

        {completionError ? (
          <Text style={styles.completionError}>{completionError}</Text>
        ) : null}

        {detail.message ? (
          <Text style={[styles.completedMessage, { color: statusStyle.color }]}>
            {detail.message}
          </Text>
        ) : null}
      </View>

      {confettiBurstId > 0 ? (
        <ConfettiBurst
          key={confettiBurstId}
          onFinished={() => setConfettiBurstId(0)}
        />
      ) : null}
    </SafeAreaView>
  );
}

function ConfettiBurst({ onFinished }: { onFinished: () => void }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 2400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished) {
        onFinished();
      }
    });

    return () => {
      animation.stop();
    };
  }, [onFinished, progress]);

  return (
    <View pointerEvents="none" style={styles.confettiOverlay}>
      {CONFETTI_PIECES.map((piece, index) => {
        const translateX = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, piece.x],
        });
        const translateY = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, piece.y],
        });
        const rotate = progress.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', piece.rotate],
        });
        const opacity = progress.interpolate({
          inputRange: [0, 0.12, 0.86, 1],
          outputRange: [0, 1, 1, 0],
        });

        return (
          <Animated.View
            key={`${piece.color}-${index}`}
            style={[
              styles.confettiPiece,
              {
                backgroundColor: piece.color,
                left: piece.left,
                bottom: piece.bottom,
                opacity,
                transform: [{ translateX }, { translateY }, { rotate }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

function ScheduleTaskNavBar({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <AppNavBar
      title={title}
      leftAction={
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={BRAND_COLOR} />
        </Pressable>
      }
    />
  );
}

function ScheduleTaskMetaRow({
  iconName,
  color,
  label,
  time,
}: {
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
  time?: string;
}) {
  return (
    <View style={styles.metaRow}>
      <Ionicons name={iconName} size={32} color={color} />
      <Text style={[styles.metaText, { color }]}>
        {label}
        {time ? (
          <Text style={styles.metaTime}> {time}</Text>
        ) : null}
      </Text>
    </View>
  );
}

function getTaskDetail(task: ScheduleTask): {
  status: DetailStatus;
  secondaryLabel: string;
  completedTime?: string;
  message?: string;
} {
  if (task.status === 'todo') {
    return {
      status: task.status,
      secondaryLabel: 'Up next',
    };
  }

  if (task.status === 'overdue') {
    return {
      status: task.status,
      secondaryLabel: "You haven't completed this task yet!",
    };
  }

  if (task.status === 'late') {
    return {
      status: task.status,
      secondaryLabel: 'Completed at',
      completedTime: task.completedTime ?? '09:41',
      message: task.completedMessage ?? 'Done at last!',
    };
  }

  return {
    status: 'done',
    secondaryLabel: 'Completed at',
    completedTime: task.completedTime ?? task.dueTime,
    message: task.completedMessage ?? 'Well done on time! 🎉',
  };
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaColumn: {
    flex: 1,
    gap: 16,
  },
  metaRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: '400',
  },
  metaTime: {
    fontWeight: '600',
  },
  statusBadge: {
    minWidth: 103,
    height: 32,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 7,
  },
  statusBadgeText: {
    color: MESSAGE_COLOR,
    fontSize: 18,
    fontWeight: '500',
  },
  description: {
    marginTop: 16,
    paddingHorizontal: 4,
    color: MESSAGE_COLOR,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 19,
    textAlign: 'justify',
  },
  bottomActions: {
    paddingHorizontal: 40,
    paddingBottom: 64,
    gap: 16,
  },
  completeButton: {
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  completeButtonText: {
    color: '#FEFEFF',
    fontSize: 24,
    fontWeight: '500',
  },
  completedMessage: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '500',
  },
  completionError: {
    textAlign: 'center',
    color: LABEL_COLOR,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    color: LABEL_COLOR,
    fontSize: 16,
  },
  confettiOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  confettiPiece: {
    position: 'absolute',
    width: 12,
    height: 4,
    borderRadius: 2,
  },
});
