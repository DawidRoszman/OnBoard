import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScheduleTimeField } from '@/components/admin/schedule/schedule-time-field';
import {
  ADMIN_SCHEDULE_DIVIDER_COLOR,
  ADMIN_SCHEDULE_LABEL_COLOR,
  ADMIN_SCHEDULE_REMOVE_BACKGROUND,
  ADMIN_SCHEDULE_REMOVE_BORDER,
  ADMIN_SCHEDULE_REMOVE_TEXT,
  ADMIN_SCHEDULE_TILE_BACKGROUND,
} from '@/constants/admin-schedule-ui';
import { MESSAGE_COLOR } from '@/constants/auth-ui';
import type { ScheduleTask } from '@/services/schedule-service';

type AdminScheduleTaskSectionProps = {
  task: ScheduleTask;
  onTimeChange: (field: 'time' | 'dueTime', value: string) => void;
  onEditDetails: () => void;
  onRemove: () => void;
  isUpdating?: boolean;
};

export function AdminScheduleTaskSection({
  task,
  onTimeChange,
  onEditDetails,
  onRemove,
  isUpdating = false,
}: AdminScheduleTaskSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.divider} />

      <View style={styles.headerCard}>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.subtitle}>{task.description}</Text>
      </View>

      <View style={styles.timeSection}>
        <ScheduleTimeField
          label="Starts at"
          iconName="stopwatch-outline"
          value={task.time}
          onChange={(value) => onTimeChange('time', value)}
          isDisabled={isUpdating}
        />
        <ScheduleTimeField
          label="Due at"
          iconName="time-outline"
          value={task.dueTime}
          onChange={(value) => onTimeChange('dueTime', value)}
          isDisabled={isUpdating}
        />
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          style={styles.editButton}
          onPress={onEditDetails}
          disabled={isUpdating}
          accessibilityRole="button"
          accessibilityLabel="Edit task details">
          <Ionicons name="create-outline" size={12} color={MESSAGE_COLOR} />
          <Text style={styles.editButtonText}>Edit task details</Text>
        </Pressable>

        <Pressable
          style={styles.removeButton}
          onPress={onRemove}
          disabled={isUpdating}
          accessibilityRole="button"
          accessibilityLabel="Remove task">
          {isUpdating ? (
            <ActivityIndicator size="small" color={ADMIN_SCHEDULE_REMOVE_TEXT} />
          ) : (
            <>
              <Ionicons
                name="trash-outline"
                size={12}
                color={ADMIN_SCHEDULE_REMOVE_TEXT}
              />
              <Text style={styles.removeButtonText}>Remove</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  divider: {
    height: 2,
    backgroundColor: ADMIN_SCHEDULE_DIVIDER_COLOR,
  },
  headerCard: {
    borderRadius: 16,
    backgroundColor: ADMIN_SCHEDULE_TILE_BACKGROUND,
    padding: 16,
    gap: 4,
  },
  title: {
    color: ADMIN_SCHEDULE_LABEL_COLOR,
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: ADMIN_SCHEDULE_LABEL_COLOR,
    fontSize: 14,
    lineHeight: 21,
  },
  timeSection: {
    gap: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  editButton: {
    flex: 1,
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 0.5,
    borderColor: MESSAGE_COLOR,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
  },
  editButtonText: {
    color: MESSAGE_COLOR,
    fontSize: 12,
    fontWeight: '500',
  },
  removeButton: {
    minWidth: 93,
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 0.5,
    borderColor: ADMIN_SCHEDULE_REMOVE_BORDER,
    borderRadius: 6,
    backgroundColor: ADMIN_SCHEDULE_REMOVE_BACKGROUND,
    paddingHorizontal: 14,
  },
  removeButtonText: {
    color: ADMIN_SCHEDULE_REMOVE_TEXT,
    fontSize: 12,
    fontWeight: '500',
  },
});
