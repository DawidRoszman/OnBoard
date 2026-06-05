import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  BACKGROUND_COLOR,
  BRAND_COLOR,
  LABEL_COLOR,
} from '@/constants/auth-ui';
import { SCHEDULE_TIMELINE_X } from '@/constants/schedule-layout';
import type { ScheduleTask, ScheduleTaskStatus } from '@/services/schedule-service';

export const SCHEDULE_TAG_WIDTH = 68;
const TAG_OVERLAP = 18;
const TAG_DOT_SIZE = 12;
const STATUS_CHIP_WIDTH = 78;
const STATUS_CHIP_LEFT_OFFSET = 4;

const STATUS_STYLES: Record<
  ScheduleTaskStatus,
  { cardBackground: string; tagColor: string; label: string }
> = {
  done: {
    cardBackground: '#C9F2C7',
    tagColor: BRAND_COLOR,
    label: 'DONE',
  },
  late: {
    cardBackground: '#E5F2C7',
    tagColor: '#697C68',
    label: 'LATE',
  },
  overdue: {
    cardBackground: '#FED1AA',
    tagColor: '#FB9D4B',
    label: 'OVERDUE',
  },
  todo: {
    cardBackground: '#C7EBFC',
    tagColor: '#57C2F6',
    label: 'TODO',
  },
};

type ScheduleTaskCardProps = {
  task: ScheduleTask;
  onPress?: () => void;
};

export function ScheduleTaskCard({ task, onPress }: ScheduleTaskCardProps) {
  const statusStyle = STATUS_STYLES[task.status];

  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${task.title}, ${statusStyle.label}`}>
      <View style={styles.tagColumn}>
        <View
          style={[
            styles.statusChip,
            {
              left:
                SCHEDULE_TIMELINE_X -
                TAG_DOT_SIZE / 2 -
                STATUS_CHIP_LEFT_OFFSET,
            },
          ]}>
          <View
            style={[styles.statusDot, { backgroundColor: statusStyle.tagColor }]}
          />
          <Text style={[styles.statusLabel, { color: statusStyle.tagColor }]}>
            {statusStyle.label}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: statusStyle.cardBackground },
        ]}>
        <View style={styles.cardTextBlock}>
          <Text style={styles.cardTitle}>{task.title}</Text>
          <Text style={styles.cardDescription}>{task.description}</Text>
        </View>
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={24} color={LABEL_COLOR} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 94,
    width: '100%',
  },
  tagColumn: {
    width: SCHEDULE_TAG_WIDTH,
    minHeight: 94,
    justifyContent: 'center',
    zIndex: 3,
    marginRight: -TAG_OVERLAP,
  },
  statusChip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    width: STATUS_CHIP_WIDTH,
    gap: 4,
    backgroundColor: BACKGROUND_COLOR,
    paddingLeft: 4,
    paddingRight: 10,
    paddingVertical: 6,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  statusDot: {
    width: TAG_DOT_SIZE,
    height: TAG_DOT_SIZE,
    borderRadius: TAG_DOT_SIZE / 2,
  },
  statusLabel: {
    flex: 1,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 36,
    minHeight: 94,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    zIndex: 1,
  },
  cardTextBlock: {
    flex: 1,
    paddingRight: 8,
    gap: 4,
  },
  cardTitle: {
    color: LABEL_COLOR,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  cardDescription: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
  },
  chevronContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
