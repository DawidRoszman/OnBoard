import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  ADMIN_SCHEDULE_LABEL_COLOR,
  ADMIN_SCHEDULE_TIME_CHIP_BACKGROUND,
  ADMIN_SCHEDULE_TIME_CHIP_TEXT,
} from '@/constants/admin-schedule-ui';
import { BRAND_COLOR } from '@/constants/auth-ui';

type ScheduleTimeFieldProps = {
  label: string;
  iconName: 'stopwatch-outline' | 'time-outline';
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
};

function parseTimeLabel(time: string): Date {
  const match = /^(\d{2}):(\d{2})$/.exec(time.trim());

  if (!match) {
    const fallback = new Date();
    fallback.setHours(9, 0, 0, 0);
    return fallback;
  }

  const date = new Date();
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return date;
}

function formatTimeLabel(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

function formatDisplayTime(time: string): string {
  const match = /^(\d{2}):(\d{2})$/.exec(time.trim());

  if (!match) {
    return 'Select time';
  }

  const hours24 = Number(match[1]);
  const minutes = match[2];
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;

  return `${String(hours12).padStart(2, '0')}:${minutes} ${period}`;
}

export function ScheduleTimeField({
  label,
  iconName,
  value,
  onChange,
  isDisabled = false,
}: ScheduleTimeFieldProps) {
  const [isIosPickerVisible, setIsIosPickerVisible] = useState(false);
  const [iosPickerDate, setIosPickerDate] = useState(() => parseTimeLabel(value));

  function handleAndroidTimeChange(
    event: DateTimePickerEvent,
    nextDate?: Date,
  ) {
    if (event.type === 'set' && nextDate) {
      onChange(formatTimeLabel(nextDate));
    }
  }

  function openTimePicker() {
    if (isDisabled) {
      return;
    }

    const selectedDate = parseTimeLabel(value);

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: 'time',
        is24Hour: false,
        onChange: handleAndroidTimeChange,
      });
      return;
    }

    if (Platform.OS === 'ios') {
      setIosPickerDate(selectedDate);
      setIsIosPickerVisible(true);
    }
  }

  function handleIosDone() {
    onChange(formatTimeLabel(iosPickerDate));
    setIsIosPickerVisible(false);
  }

  function handleIosCancel() {
    setIsIosPickerVisible(false);
  }

  return (
    <>
      <View style={styles.row}>
        <View style={styles.labelGroup}>
          <Ionicons
            name={iconName}
            size={24}
            color={ADMIN_SCHEDULE_LABEL_COLOR}
          />
          <Text style={styles.label}>{label}</Text>
        </View>

        <Pressable
          style={styles.timeChip}
          onPress={openTimePicker}
          disabled={isDisabled}
          accessibilityRole="button"
          accessibilityLabel={`${label} ${formatDisplayTime(value)}`}>
          <Text style={styles.timeChipText}>{formatDisplayTime(value)}</Text>
        </Pressable>
      </View>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={isIosPickerVisible}
          transparent
          animationType="slide"
          onRequestClose={handleIosCancel}>
          <View style={styles.iosModalRoot}>
            <Pressable
              style={styles.iosModalOverlay}
              onPress={handleIosCancel}
            />
            <View style={styles.iosPickerSheet}>
              <View style={styles.iosPickerHeader}>
                <Pressable
                  onPress={handleIosCancel}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel time selection">
                  <Text style={styles.iosPickerAction}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleIosDone}
                  accessibilityRole="button"
                  accessibilityLabel="Confirm time selection">
                  <Text style={[styles.iosPickerAction, styles.iosPickerDone]}>
                    Done
                  </Text>
                </Pressable>
              </View>
              <View style={styles.iosPickerContainer}>
                <DateTimePicker
                  value={iosPickerDate}
                  mode="time"
                  display="spinner"
                  themeVariant="light"
                  onChange={(_event, nextDate) => {
                    if (nextDate) {
                      setIosPickerDate(nextDate);
                    }
                  }}
                  style={styles.iosPicker}
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 34,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 109,
  },
  label: {
    color: ADMIN_SCHEDULE_LABEL_COLOR,
    fontSize: 18,
    lineHeight: 22,
  },
  timeChip: {
    borderRadius: 8,
    backgroundColor: ADMIN_SCHEDULE_TIME_CHIP_BACKGROUND,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 96,
    alignItems: 'center',
  },
  timeChipText: {
    color: ADMIN_SCHEDULE_TIME_CHIP_TEXT,
    fontSize: 17,
    fontWeight: '400',
  },
  iosModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  iosModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  iosPickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
  },
  iosPickerAction: {
    fontSize: 16,
    color: '#8F9098',
  },
  iosPickerDone: {
    color: BRAND_COLOR,
    fontWeight: '600',
  },
  iosPickerContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  iosPicker: {
    width: '100%',
    height: 216,
  },
});
