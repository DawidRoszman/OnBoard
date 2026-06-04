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
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import {
  BORDER_COLOR,
  BRAND_COLOR,
  LABEL_COLOR,
  PLACEHOLDER_COLOR,
} from '@/constants/auth-ui';

const PLACEHOLDER = 'Enter date of birth';

function getMaximumBirthDate(): Date {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
}

function getMaximumBirthDateIso(): string {
  const maximumDate = getMaximumBirthDate();
  const month = String(maximumDate.getMonth() + 1).padStart(2, '0');
  const day = String(maximumDate.getDate()).padStart(2, '0');

  return `${maximumDate.getFullYear()}-${month}-${day}`;
}

function clampToMaximumBirthDate(date: Date): Date {
  const maximumDate = getMaximumBirthDate();

  return date.getTime() > maximumDate.getTime() ? maximumDate : date;
}

type DateOfBirthFieldProps = {
  value: string;
  onChange: (value: string) => void;
  isEditable?: boolean;
};

function formatDateOfBirth(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

function parseDateOfBirth(value: string): Date | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  const year = Number(match[3]);
  const parsedDate = new Date(year, month, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
}

function toIsoDate(value: string): string {
  const parsedDate = parseDateOfBirth(value);

  if (!parsedDate) {
    return '';
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function fromIsoDate(isoValue: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoValue);

  if (!match) {
    return '';
  }

  return `${match[3]}.${match[2]}.${match[1]}`;
}

type WebDateInputProps = TextInputProps & {
  type?: 'date';
};

const WebDateInput = TextInput as typeof TextInput & {
  defaultProps?: Partial<WebDateInputProps>;
};

export function DateOfBirthField({
  value,
  onChange,
  isEditable = true,
}: DateOfBirthFieldProps) {
  const [isIosPickerVisible, setIsIosPickerVisible] = useState(false);
  const [iosPickerDate, setIosPickerDate] = useState(
    () => parseDateOfBirth(value) ?? new Date(1990, 0, 1),
  );
  const maximumBirthDate = getMaximumBirthDate();
  const selectedDate = clampToMaximumBirthDate(
    parseDateOfBirth(value) ?? new Date(1990, 0, 1),
  );

  function handleAndroidDateChange(
    event: DateTimePickerEvent,
    nextDate?: Date,
  ) {
    if (event.type === 'dismissed' || !nextDate) {
      return;
    }

    onChange(formatDateOfBirth(clampToMaximumBirthDate(nextDate)));
  }

  function openDatePicker() {
    if (!isEditable) {
      return;
    }

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: 'date',
        maximumDate: maximumBirthDate,
        onChange: handleAndroidDateChange,
      });
      return;
    }

    if (Platform.OS === 'ios') {
      setIosPickerDate(selectedDate);
      setIsIosPickerVisible(true);
    }
  }

  function handleIosDone() {
    onChange(formatDateOfBirth(clampToMaximumBirthDate(iosPickerDate)));
    setIsIosPickerVisible(false);
  }

  function handleIosCancel() {
    setIsIosPickerVisible(false);
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.field}>
        <WebDateInput
          style={styles.valueText}
          value={toIsoDate(value)}
          onChangeText={(isoValue) => {
            const nextValue = fromIsoDate(isoValue);

            if (!nextValue) {
              onChange('');
              return;
            }

            const parsedDate = parseDateOfBirth(nextValue);

            if (parsedDate && parsedDate.getTime() > maximumBirthDate.getTime()) {
              return;
            }

            onChange(nextValue);
          }}
          placeholder={PLACEHOLDER}
          placeholderTextColor={PLACEHOLDER_COLOR}
          editable={isEditable}
          accessibilityLabel={PLACEHOLDER}
          type="date"
          max={getMaximumBirthDateIso()}
        />
        <Ionicons name="calendar-outline" size={18} color={BRAND_COLOR} />
      </View>
    );
  }

  return (
    <>
      <Pressable
        style={styles.field}
        onPress={openDatePicker}
        disabled={!isEditable}
        accessibilityRole="button"
        accessibilityLabel={PLACEHOLDER}
        accessibilityState={{ disabled: !isEditable }}>
        <Text
          style={[styles.valueText, !value && styles.placeholderText]}
          numberOfLines={1}>
          {value || PLACEHOLDER}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={BRAND_COLOR} />
      </Pressable>

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
                  accessibilityLabel="Cancel date selection">
                  <Text style={styles.iosPickerAction}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleIosDone}
                  accessibilityRole="button"
                  accessibilityLabel="Confirm date selection">
                  <Text style={[styles.iosPickerAction, styles.iosPickerDone]}>
                    Done
                  </Text>
                </Pressable>
              </View>
              <View style={styles.iosPickerContainer}>
                <DateTimePicker
                  value={iosPickerDate}
                  mode="date"
                  display="spinner"
                  maximumDate={maximumBirthDate}
                  themeVariant="light"
                  textColor={LABEL_COLOR}
                  accentColor={BRAND_COLOR}
                  onChange={(_event, nextDate) => {
                    if (nextDate) {
                      setIosPickerDate(clampToMaximumBirthDate(nextDate));
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
  field: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 37,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  valueText: {
    flex: 1,
    fontSize: 14,
    color: LABEL_COLOR,
  },
  placeholderText: {
    color: PLACEHOLDER_COLOR,
  },
  iosModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  iosModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  iosPickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 16,
  },
  iosPickerContainer: {
    backgroundColor: '#FFFFFF',
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER_COLOR,
  },
  iosPickerAction: {
    fontSize: 16,
    color: LABEL_COLOR,
  },
  iosPickerDone: {
    color: BRAND_COLOR,
    fontWeight: '600',
  },
  iosPicker: {
    height: 216,
  },
});
