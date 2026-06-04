import { useState, type ReactNode } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import {
  SCHEDULE_TIMELINE_COLOR,
  SCHEDULE_TIMELINE_DASH,
  SCHEDULE_TIMELINE_X,
} from '@/constants/schedule-layout';

type ScheduleTimelineLineProps = {
  children: ReactNode;
};

export function ScheduleTimelineLine({ children }: ScheduleTimelineLineProps) {
  const [lineHeight, setLineHeight] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    setLineHeight(event.nativeEvent.layout.height);
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {lineHeight > 0 ? (
        <Svg
          style={styles.svg}
          width={SCHEDULE_TIMELINE_X + 2}
          height={lineHeight}
          pointerEvents="none">
          <Line
            x1={SCHEDULE_TIMELINE_X}
            y1={0}
            x2={SCHEDULE_TIMELINE_X}
            y2={lineHeight}
            stroke={SCHEDULE_TIMELINE_COLOR}
            strokeWidth={1}
            strokeDasharray={SCHEDULE_TIMELINE_DASH}
          />
        </Svg>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  svg: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 0,
  },
});
