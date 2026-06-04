import { Ionicons } from '@expo/vector-icons';
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
  groupScheduleTasksByTime,
  SCHEDULE_DATE_LABEL,
  SCHEDULE_TASKS,
} from '@/constants/schedule-data';

export default function ScheduleScreen() {
  const scheduleGroups = groupScheduleTasksByTime(SCHEDULE_TASKS);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.navBar}>
        <View style={styles.navSide}>
          <Ionicons name="chevron-back" size={20} color={BRAND_COLOR} />
        </View>
        <Text style={styles.navTitle}>{"Today's schedule"}</Text>
        <View style={[styles.navSide, styles.navSideRight]}>
          <View style={styles.avatar}>
            <View style={styles.avatarInner} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.dateHeading}>{SCHEDULE_DATE_LABEL}</Text>

        <ScheduleTimelineLine>
          {scheduleGroups.map((group, groupIndex) => (
            <View
              key={`${group.time}-${groupIndex}`}
              style={[
                styles.timeGroup,
                groupIndex < scheduleGroups.length - 1 && styles.timeGroupGap,
              ]}>
              <View style={styles.timeSlot}>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeLabel}>{group.time}</Text>
                </View>
              </View>

              {group.tasks.map((task, taskIndex) => (
                <View
                  key={task.id}
                  style={[
                    styles.taskRow,
                    taskIndex > 0 && styles.taskRowSameTime,
                  ]}>
                  <ScheduleTaskCard task={task} />
                </View>
              ))}
            </View>
          ))}
        </ScheduleTimelineLine>

        <Text style={styles.footerText}>See you next time!</Text>
      </ScrollView>
    </SafeAreaView>
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#333333',
  },
  avatarInner: {
    flex: 1,
    backgroundColor: '#D4A574',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SCHEDULE_CONTENT_HORIZONTAL,
    paddingBottom: 32,
  },
  dateHeading: {
    fontSize: 18,
    fontWeight: '400',
    color: MESSAGE_COLOR,
    lineHeight: 27,
    marginBottom: 12,
    marginLeft: 8,
  },
  timeGroup: {
    marginBottom: 4,
  },
  timeGroupGap: {
    marginBottom: 10,
  },
  timeSlot: {
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
    marginTop: 4,
  },
  taskRowSameTime: {
    marginTop: 10,
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
