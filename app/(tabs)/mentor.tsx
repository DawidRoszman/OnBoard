import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackButton } from '@/components/app-back-button';
import { AppNavBar } from '@/components/app-navbar';
import {
  BACKGROUND_COLOR,
  BRAND_COLOR,
  MESSAGE_COLOR,
} from '@/constants/auth-ui';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type MentorContactAction = {
  id: string;
  iconName: IoniconName;
  label?: string;
  url: string;
  accessibilityLabel: string;
};

const MENTOR = {
  name: 'Elon Piżmo',
  role: 'IT Mentor',
  bio:
    'Entrepreneur, engineer, and future builder. I help founders turn bold ideas into impactful products, ' +
    'scale businesses, and solve problems that others consider impossible. My focus is on innovation, execution, ' +
    'and long-term thinking.',
  skills: [
    'Full-stack development',
    'Database',
    'Figma',
    'C++',
    'Rust',
    'JerzyScript',
  ],
  contacts: [
    {
      id: 'linkedin',
      iconName: 'logo-linkedin',
      url: 'https://www.linkedin.com',
      accessibilityLabel: 'Open mentor LinkedIn profile',
    },
    {
      id: 'facebook',
      iconName: 'logo-facebook',
      url: 'https://www.facebook.com',
      accessibilityLabel: 'Open mentor Facebook profile',
    },
    {
      id: 'email',
      iconName: 'mail',
      label: 'elon.piżmo@mail.com',
      url: 'mailto:elon.piżmo@mail.com',
      accessibilityLabel: 'Email mentor',
    },
    {
      id: 'phone',
      iconName: 'person',
      label: '+48 123 422 676',
      url: 'tel:+48123422676',
      accessibilityLabel: 'Call mentor',
    },
  ] satisfies MentorContactAction[],
};

export default function MentorScreen() {
  async function openContactAction(url: string) {
    try {
      const isExternalLinkingSupported = await Linking.canOpenURL(url);

      if (!isExternalLinkingSupported) {
        console.warn(`Unable to open mentor contact URL: ${url}`);
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      console.warn('Unable to open mentor contact action.', error);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppNavBar
        title="Your mentor"
        leftAction={<AppBackButton fallbackRoute="/(tabs)" />}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <Image
              source={require('@/assets/images/mentor-avatar.png')}
              style={styles.avatar}
              resizeMode="cover"
              accessibilityLabel={`${MENTOR.name} avatar`}
            />
            <View style={styles.profileText}>
              <Text style={styles.name}>{MENTOR.name}</Text>
              <Text style={styles.role}>{MENTOR.role}</Text>
            </View>
          </View>
        </View>

        <View style={styles.skills}>
          {MENTOR.skills.map((skill) => (
            <View key={skill} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bioCard}>
          <Text style={styles.bioText}>{MENTOR.bio}</Text>
        </View>

        <View style={styles.actionsGrid}>
          {MENTOR.contacts.map((contact) => (
            <Pressable
              key={contact.id}
              style={styles.contactAction}
              onPress={() => void openContactAction(contact.url)}
              accessibilityRole="button"
              accessibilityLabel={contact.accessibilityLabel}>
              <Ionicons name={contact.iconName} size={60} color={BRAND_COLOR} />
              {contact.label ? (
                <Text style={styles.contactLabel}>{contact.label}</Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 41,
    paddingBottom: 24,
  },
  profileSection: {
    height: 215,
  },
  profileCard: {
    height: 151,
    marginTop: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(98, 148, 96, 0.55)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 18,
  },
  avatar: {
    position: 'absolute',
    top: -64,
    width: 128,
    height: 128,
    borderRadius: 64,
  },
  profileText: {
    alignItems: 'center',
  },
  name: {
    color: '#FEFEFF',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 35,
    letterSpacing: 0.2,
  },
  role: {
    color: '#F5F5F5',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 21,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  skillTag: {
    minHeight: 24,
    borderRadius: 12,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillText: {
    color: BRAND_COLOR,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  bioCard: {
    minHeight: 182,
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(201, 242, 199, 0.44)',
    paddingHorizontal: 18,
    paddingVertical: 17,
  },
  bioText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 21,
    textAlign: 'justify',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginTop: 13,
  },
  contactAction: {
    width: 142,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  contactLabel: {
    marginTop: 3,
    color: MESSAGE_COLOR,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 16,
    textAlign: 'center',
  },
});
