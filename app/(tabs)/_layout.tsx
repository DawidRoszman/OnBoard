import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { BRAND_COLOR } from '@/constants/auth-ui';

const INACTIVE_TAB_COLOR = '#B8C9B7';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type TabBarIconProps = {
  outlineName: IoniconName;
  filledName: IoniconName;
  color: string;
  size: number;
  focused: boolean;
};

function TabBarIcon({
  outlineName,
  filledName,
  color,
  size,
  focused,
}: TabBarIconProps) {
  return (
    <Ionicons
      name={focused ? filledName : outlineName}
      size={size}
      color={color}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BRAND_COLOR,
        tabBarInactiveTintColor: INACTIVE_TAB_COLOR,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E8E8E8',
          height: 72,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              outlineName="home-outline"
              filledName="home"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              outlineName="time-outline"
              filledName="time"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="docs"
        options={{
          title: 'Docs',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              outlineName="document-text-outline"
              filledName="document-text"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              outlineName="person-outline"
              filledName="person"
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen name="schedule-task/[taskId]" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
