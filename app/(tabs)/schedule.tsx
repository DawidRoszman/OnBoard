import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScheduleTaskCard } from '@/components/schedule/schedule-task-card';
import { ScheduleTimelineLine } from '@/components/schedule/schedule-timeline-line';
import {
  BACKGROUND_COLOR,
  BRAND_COLOR,
  MESSAGE_COLOR,
} from '@/constants/auth-ui';
import {
  SCHEDULE_CONTENT_HORIZONTAL,
  SCHEDULE_TIMELINE_X,
} from '@/constants/schedule-layout';
import {
  SCHEDULE_GREETING,
  SCHEDULE_TIMELINE_ITEMS,
  type ScheduleTimelineItem,
} from '@/constants/schedule-data';

export default function ScheduleScreen() {
  const router = useRouter();

  function openTask(taskId: string) {
    router.push(`./schedule-task/${taskId}`);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.navBar}>
        <View style={styles.navSide}>
          <Ionicons name="chevron-back" size={20} color={BRAND_COLOR} />
        </View>
        <Text style={styles.navTitle}>{"Today's schedule"}</Text>
        <View style={[styles.navSide, styles.navSideRight]}>
          <Ionicons name="menu" size={20} color={BRAND_COLOR} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.greetingHeading}>{SCHEDULE_GREETING}</Text>

        <ScheduleTimelineLine>
          {SCHEDULE_TIMELINE_ITEMS.map((item, index) => (
            <ScheduleTimelineEntry
              key={item.type === 'time' ? item.id : item.task.id}
              item={item}
              isLast={index === SCHEDULE_TIMELINE_ITEMS.length - 1}
              onTaskPress={openTask}
            />
          ))}
        </ScheduleTimelineLine>

        <Text style={styles.footerText}>See you next time!</Text>
      </ScrollView>
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
