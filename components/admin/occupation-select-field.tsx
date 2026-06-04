import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AdminFormFieldShell } from '@/components/admin/admin-form-field-shell';
import {
  ADMIN_OCCUPATIONS,
  type AdminOccupation,
} from '@/constants/admin-occupations';
import {
  BACKGROUND_COLOR,
  BORDER_COLOR,
  BRAND_COLOR,
  LABEL_COLOR,
  PLACEHOLDER_COLOR,
} from '@/constants/auth-ui';

const PLACEHOLDER = 'Select occupation';

type OccupationSelectFieldProps = {
  value: string;
  onCommit: (value: AdminOccupation) => void;
  onBlur?: () => void;
  isEditable?: boolean;
  errorMessage?: string;
};

export function OccupationSelectField({
  value,
  onCommit,
  onBlur,
  isEditable = true,
  errorMessage,
}: OccupationSelectFieldProps) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  function dismissPicker() {
    setIsPickerVisible(false);
    onBlur?.();
  }

  function handleSelect(occupation: AdminOccupation) {
    setIsPickerVisible(false);
    onCommit(occupation);
  }

  return (
    <AdminFormFieldShell errorMessage={errorMessage}>
      <Pressable
        style={styles.field}
        onPress={() => isEditable && setIsPickerVisible(true)}
        disabled={!isEditable}
        accessibilityRole="button"
        accessibilityLabel={PLACEHOLDER}
        accessibilityState={{ disabled: !isEditable }}>
        <Text
          style={[styles.valueText, !value && styles.placeholderText]}
          numberOfLines={1}>
          {value || PLACEHOLDER}
        </Text>
        <Ionicons name="chevron-down" size={18} color={BRAND_COLOR} />
      </Pressable>

      <Modal
        visible={isPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={dismissPicker}>
        <Pressable
          style={styles.modalOverlay}
          onPress={dismissPicker}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select occupation</Text>
            {ADMIN_OCCUPATIONS.map((occupation) => {
              const isSelected = occupation === value;

              return (
                <Pressable
                  key={occupation}
                  style={[
                    styles.optionRow,
                    isSelected && styles.optionRowSelected,
                  ]}
                  onPress={() => handleSelect(occupation)}
                  accessibilityRole="button"
                  accessibilityLabel={occupation}
                  accessibilityState={{ selected: isSelected }}>
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}>
                    {occupation}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </AdminFormFieldShell>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: 8,
    paddingVertical: 12,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: LABEL_COLOR,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  optionRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionRowSelected: {
    backgroundColor: '#E8F0E8',
  },
  optionText: {
    fontSize: 14,
    color: LABEL_COLOR,
  },
  optionTextSelected: {
    color: BRAND_COLOR,
    fontWeight: '600',
  },
});
