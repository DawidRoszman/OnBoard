import { Switch, type SwitchProps } from 'react-native';

import { BRAND_COLOR } from '@/constants/auth-ui';
import {
  PROFILE_SWITCH_THUMB_COLOR,
  PROFILE_SWITCH_TRACK_OFF_COLOR,
} from '@/constants/profile-ui';

type ProfileSettingsSwitchProps = Omit<
  SwitchProps,
  'trackColor' | 'thumbColor' | 'ios_backgroundColor'
>;

export function ProfileSettingsSwitch(props: ProfileSettingsSwitchProps) {
  return (
    <Switch
      trackColor={{ false: PROFILE_SWITCH_TRACK_OFF_COLOR, true: BRAND_COLOR }}
      thumbColor={PROFILE_SWITCH_THUMB_COLOR}
      ios_backgroundColor={PROFILE_SWITCH_TRACK_OFF_COLOR}
      {...props}
    />
  );
}
