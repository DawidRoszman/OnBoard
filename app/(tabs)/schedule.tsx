import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppLoadingState } from '@/components/app-loading-state';
import { ScheduleMenuButton } from '@/components/schedule/schedule-menu-button';
import { ScheduleTaskCard } from '@/components/schedule/schedule-task-card';
import { ScheduleTimelineLine } from '@/components/schedule/schedule-timeline-line';
import {
  BACKGROUND_COLOR,
  LABEL_COLOR,
  MESSAGE_COLOR,
} from '@/constants/auth-ui';
import {
  SCHEDULE_CONTENT_HORIZONTAL,
  SCHEDULE_TIMELINE_X,
} from '@/constants/schedule-layout';
import {
  getSchedule,
  ScheduleError,
  type Schedule,
  type ScheduleTimelineItem,
} from '@/services/schedule-service';

export default function ScheduleScreen() {
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
                : 'Failed to load schedule. Please try again.',
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
    router.push(`./schedule-task/${taskId}`);
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppLoadingState message="Loading schedule" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.navBar}>
        <View style={styles.navSide} />
        <Text style={styles.navTitle}>{"Today's schedule"}</Text>
        <View style={[styles.navSide, styles.navSideRight]}>
          <ScheduleMenuButton />
        </View>
      </View>

      {errorMessage ? (
        <View style={styles.centeredState}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : schedule ? (
        schedule.tasks.length === 0 ? (
          <View style={styles.centeredState}>
            <Text style={styles.emptyTitle}>{schedule.greeting}</Text>
            <Text style={styles.emptyText}>
              Your schedule is empty. Check back later for new tasks.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <Text style={styles.greetingHeading}>{schedule.greeting}</Text>

            <ScheduleTimelineLine>
              {schedule.timelineItems.map((item, index) => (
                <ScheduleTimelineEntry
                  key={item.type === 'time' ? item.id : item.task.id}
                  item={item}
                  isLast={index === schedule.timelineItems.length - 1}
                  onTaskPress={openTask}
                />
              ))}
            </ScheduleTimelineLine>

            <Text style={styles.footerText}>{schedule.footerText}</Text>
          </ScrollView>
        )
      ) : null}
    </SafeAreaView>
  );
}

function ScheduleTimelineEntry({
  item,
  isLast,
  onTaskPress,
}: {
  item: ScheduleTimelineItem;
  isLast: boolean;
  onTaskPress: (taskId: string) => void;
}) {
  if (item.type === 'time') {
    return (
      <View style={[styles.timeEntry, isLast && styles.lastEntry]}>
        <View style={styles.timeBadge}>
          <Text style={styles.timeLabel}>{item.time}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.taskRow, isLast && styles.lastEntry]}>
      <ScheduleTaskCard
        task={item.task}
        onPress={() => onTaskPress(item.task.id)}
      />
    </View>
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
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2024',
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
  emptyTitle: {
    color: MESSAGE_COLOR,
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    color: LABEL_COLOR,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SCHEDULE_CONTENT_HORIZONTAL,
    paddingBottom: 32,
  },
  greetingHeading: {
    fontSize: 18,
    fontWeight: '400',
    color: MESSAGE_COLOR,
    lineHeight: 27,
    marginBottom: 4,
    marginLeft: 8,
  },
  timeEntry: {
    height: 26,
    marginBottom: 6,
    zIndex: 2,
  },
  timeBadge: {
    position: 'absolute',
    left: SCHEDULE_TIMELINE_X,
    transform: [{ translateX: '-50%' }],
    backgroundColor: BACKGROUND_COLOR,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  timeLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: MESSAGE_COLOR,
    lineHeight: 22,
  },
  taskRow: {
    marginBottom: 6,
  },
  lastEntry: {
    marginBottom: 0,
  },
  footerText: {
    fontSize: 18,
    fontWeight: '400',
    color: MESSAGE_COLOR,
    lineHeight: 27,
    marginTop: 20,
    marginLeft: 8,
  },
});
