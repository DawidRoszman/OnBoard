import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState, type ComponentProps } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { AppLoadingState } from '@/components/app-loading-state';
import { HamburgerMenu } from '@/components/hamburger-menu';
import { ScheduleTaskCard } from '@/components/schedule/schedule-task-card';
import {
  BACKGROUND_COLOR,
  BRAND_COLOR,
  LABEL_COLOR,
  MESSAGE_COLOR,
} from '@/constants/auth-ui';
import { getAuthUser } from '@/services/auth-session';
import {
  getSchedule,
  ScheduleError,
  type Schedule,
  type ScheduleTask,
  type ScheduleTaskStatus,
} from '@/services/schedule-service';
import { withReturnTo } from '@/lib/back-navigation';

const SUMMARY_CARD_WIDTH = 337;
const PROGRESS_SIZE = 128;
const PROGRESS_STROKE_WIDTH = 12;
const PROGRESS_RADIUS = (PROGRESS_SIZE - PROGRESS_STROKE_WIDTH) / 2;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type StatusSummary = {
  status: ScheduleTaskStatus;
  label: string;
  iconName: IoniconName;
  color: string;
  count: number;
};

type ProgressSegment = {
  status: ScheduleTaskStatus;
  color: string;
  length: number;
  offset: number;
};

const STATUS_PRESENTATION: Record<
  ScheduleTaskStatus,
  Omit<StatusSummary, 'status' | 'count'>
> = {
  todo: {
    label: 'Todo',
    iconName: 'create-outline',
    color: '#57C2F6',
  },
  overdue: {
    label: 'Overdue',
    iconName: 'alert-circle',
    color: '#FB9D4B',
  },
  done: {
    label: 'Done',
    iconName: 'checkmark',
    color: BRAND_COLOR,
  },
  late: {
    label: 'Late',
    iconName: 'alert-circle',
    color: '#697C68',
  },
};

const STATUS_ORDER: ScheduleTaskStatus[] = ['todo', 'overdue', 'done', 'late'];

export default function HomeScreen() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasLoadedScheduleRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const shouldShowLoading = !hasLoadedScheduleRef.current;

      async function loadSchedule() {
        if (shouldShowLoading) {
          setIsLoading(true);
        }

        try {
          const data = await getSchedule();

          if (isMounted) {
            setSchedule(data);
            setErrorMessage(null);
            hasLoadedScheduleRef.current = true;
          }
        } catch (error) {
          if (isMounted) {
            setErrorMessage(
              error instanceof ScheduleError
                ? error.message
                : 'Failed to load home data. Please try again.',
            );
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }

      loadSchedule();

      return () => {
        isMounted = false;
      };
    }, []),
  );

  function openTask(taskId: string) {
    router.push(
      withReturnTo(`/(tabs)/schedule/${taskId}`, '/(tabs)'),
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppLoadingState message="Loading home" />
      </SafeAreaView>
    );
  }

  const currentUser = getAuthUser();
  const firstName =
    currentUser?.firstName ?? currentUser?.displayName.split(' ')[0] ?? 'there';
  const taskSummary = getTaskSummary(schedule?.tasks ?? []);
  const nextTask = getNextTask(schedule?.tasks ?? []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <HomeNavBar />

      {errorMessage ? (
        <View style={styles.centeredState}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <Text style={styles.greeting}>Hello, {firstName}!</Text>
            <Text style={styles.subtitle}>{"Let's get you OnBoard"}</Text>

            <TaskProgressChart
              percentage={taskSummary.completionPercentage}
              statuses={taskSummary.statuses}
            />

            <View style={styles.statusGrid}>
              {taskSummary.statuses.map((statusSummary) => (
                <StatusCard
                  key={statusSummary.status}
                  statusSummary={statusSummary}
                />
              ))}
            </View>
          </View>

          <Text style={styles.nextTaskHeading}>Next task:</Text>

          {nextTask ? (
            <ScheduleTaskCard
              task={nextTask}
              onPress={() => openTask(nextTask.id)}
            />
          ) : (
            <View style={styles.emptyTaskCard}>
              <Text style={styles.emptyTaskTitle}>All done</Text>
              <Text style={styles.emptyTaskText}>
                You do not have any pending tasks right now.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function HomeNavBar() {
  return (
    <View style={styles.navBar}>
      <View style={styles.navSide} />
      <Text style={styles.navTitle} numberOfLines={1}>
        OnBoard
      </Text>
      <View style={[styles.navSide, styles.navSideRight]}>
        <HamburgerMenu />
      </View>
    </View>
  );
}

function TaskProgressChart({
  percentage,
  statuses,
}: {
  percentage: number;
  statuses: StatusSummary[];
}) {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  const progressSegments = getProgressSegments(statuses);

  return (
    <View style={styles.progressContainer}>
      <Svg width={PROGRESS_SIZE} height={PROGRESS_SIZE}>
        <Circle
          cx={PROGRESS_SIZE / 2}
          cy={PROGRESS_SIZE / 2}
          r={PROGRESS_RADIUS}
          stroke="#E8E9F1"
          strokeWidth={PROGRESS_STROKE_WIDTH}
          fill="none"
          strokeLinecap="round"
        />
        {progressSegments.map((segment) => (
          <Circle
            key={segment.status}
            cx={PROGRESS_SIZE / 2}
            cy={PROGRESS_SIZE / 2}
            r={PROGRESS_RADIUS}
            stroke={segment.color}
            strokeWidth={PROGRESS_STROKE_WIDTH}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${segment.length} ${PROGRESS_CIRCUMFERENCE}`}
            strokeDashoffset={segment.offset}
            rotation="-90"
            originX={PROGRESS_SIZE / 2}
            originY={PROGRESS_SIZE / 2}
          />
        ))}
      </Svg>
      <Text style={styles.progressText}>{clampedPercentage}%</Text>
    </View>
  );
}

function StatusCard({ statusSummary }: { statusSummary: StatusSummary }) {
  return (
    <View style={styles.statusCard}>
      <View style={styles.statusCardHeader}>
        <View style={styles.statusIconContainer}>
          <Ionicons
            name={statusSummary.iconName}
            size={24}
            color={statusSummary.color}
          />
        </View>
        <Text style={[styles.statusCount, { color: statusSummary.color }]}>
          {statusSummary.count}
        </Text>
      </View>
      <Text style={styles.statusLabel}>{statusSummary.label}</Text>
    </View>
  );
}

function getTaskSummary(tasks: ScheduleTask[]) {
  const countByStatus = STATUS_ORDER.reduce(
    (counts, status) => ({
      ...counts,
      [status]: tasks.filter((task) => task.status === status).length,
    }),
    {} as Record<ScheduleTaskStatus, number>,
  );

  const completedCount = countByStatus.done + countByStatus.late;
  const completionPercentage =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);
  const statuses = STATUS_ORDER.map((status) => ({
    status,
    count: countByStatus[status],
    ...STATUS_PRESENTATION[status],
  }));

  return {
    completionPercentage,
    statuses,
  };
}

function getProgressSegments(statuses: StatusSummary[]): ProgressSegment[] {
  const totalCount = statuses.reduce(
    (count, statusSummary) => count + statusSummary.count,
    0,
  );
  let currentOffset = 0;

  if (totalCount === 0) {
    return [];
  }

  return statuses.flatMap((statusSummary) => {
    if (statusSummary.count === 0) {
      return [];
    }

    const length =
      (statusSummary.count / totalCount) * PROGRESS_CIRCUMFERENCE;
    const segment = {
      status: statusSummary.status,
      color: statusSummary.color,
      length,
      offset: -currentOffset,
    };

    currentOffset += length;

    return [segment];
  });
}

function getNextTask(tasks: ScheduleTask[]): ScheduleTask | undefined {
  return (
    tasks.find((task) => task.status === 'overdue') ??
    tasks.find((task) => task.status === 'todo')
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  navBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: BACKGROUND_COLOR,
  },
  navSide: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  navSideRight: {
    alignItems: 'flex-end',
  },
  navTitle: {
    flex: 1,
    color: BRAND_COLOR,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: LABEL_COLOR,
    fontSize: 16,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 29,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  summaryCard: {
    width: '100%',
    maxWidth: SUMMARY_CARD_WIDTH,
    minHeight: 455,
    alignItems: 'center',
    backgroundColor: 'rgba(201, 242, 199, 0.44)',
    borderRadius: 20,
    paddingTop: 14,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greeting: {
    color: MESSAGE_COLOR,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
    textAlign: 'center',
  },
  subtitle: {
    color: '#96BE8C',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 17,
    marginTop: -2,
    textAlign: 'center',
  },
  progressContainer: {
    width: PROGRESS_SIZE,
    height: PROGRESS_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 22,
  },
  progressText: {
    position: 'absolute',
    color: MESSAGE_COLOR,
    fontSize: 36,
    fontWeight: '700',
  },
  statusGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 20,
  },
  statusCard: {
    width: 126,
    height: 92,
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FE',
    borderRadius: 16,
    padding: 16,
  },
  statusCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8E9F1',
    borderRadius: 20,
  },
  statusCount: {
    minWidth: 18,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
    textAlign: 'right',
  },
  statusLabel: {
    color: MESSAGE_COLOR,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 17,
  },
  nextTaskHeading: {
    width: '100%',
    maxWidth: SUMMARY_CARD_WIDTH,
    color: MESSAGE_COLOR,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
    marginTop: 40,
    marginBottom: 8,
  },
  emptyTaskCard: {
    width: '100%',
    maxWidth: SUMMARY_CARD_WIDTH,
    minHeight: 94,
    justifyContent: 'center',
    backgroundColor: '#FED1AA',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    padding: 16,
  },
  emptyTaskTitle: {
    color: LABEL_COLOR,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  emptyTaskText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    marginTop: 4,
  },
});
