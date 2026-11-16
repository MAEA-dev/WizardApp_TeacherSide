import Feather from '@expo/vector-icons/Feather';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { ADMIN_EMAIL } from '../../services/firebaseAuth';
import { auth, db } from '../../services/firebaseConfig';
import { Inter } from '../../constants/fonts';
import AccountDrawer from '../home/AccountDrawer';

const COLORS = {
  background: '#F4F1FF',
  border: '#E3DDF8',
  primary: '#4538D2',
  text: '#24213F',
  muted: '#706C91',
};

const TABS = [
  { key: 'home', label: 'Home', icon: 'home', route: '/Admin' },
  { key: 'quarters', label: 'Quarters', icon: 'clock', route: '/Admin/quarters' },
  { key: 'subjects', label: 'Subjects', icon: 'book-open', route: '/Admin/subjects' },
  { key: 'lessons', label: 'Lessons', icon: 'file-text', route: '/Admin/lessons' },
];

export const AdminColors = COLORS;

export function AdminCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function AdminText({ children, style, ...props }) {
  return (
    <Text {...props} style={[styles.text, style]}>
      {children}
    </Text>
  );
}

export function AdminShell({ activeTab, title, children }) {
  const router = useRouter();
  const [access, setAccess] = useState('loading');
  const [accountMenuVisible, setAccountMenuVisible] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [accountEmail, setAccountEmail] = useState(ADMIN_EMAIL);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (active) setAccess('denied');
        return;
      }

      try {
        setAccountEmail(user.email || ADMIN_EMAIL);
        const userSnapshot = await getDoc(doc(db, 'users', user.uid));
        if (!active) return;

        const isAdmin =
          user.email?.toLowerCase() === ADMIN_EMAIL &&
          userSnapshot.exists() &&
          userSnapshot.data().role === 'admin';
        setAccess(isAdmin ? 'allowed' : 'denied');
      } catch (error) {
        console.error('Unable to verify admin access:', error);
        if (active) setAccess('error');
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const leaveAdmin = async (action) => {
    setAccountMenuVisible(false);
    setIsSigningOut(true);
    try {
      await firebaseSignOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error(`Unable to ${action.toLowerCase()} from the admin console:`, error);
      Alert.alert('Unable to sign out', 'Please try again.');
      setIsSigningOut(false);
    }
  };

  if (access === 'loading') {
    return (
      <View style={styles.accessState}>
        <ActivityIndicator color={COLORS.primary} />
        <Text style={styles.accessText}>Verifying admin access...</Text>
      </View>
    );
  }

  if (access !== 'allowed') {
    return (
      <View style={styles.accessState}>
        <Text style={styles.accessText}>
          {access === 'error'
            ? 'Unable to verify admin access. Check your connection and try again.'
            : 'This account does not have admin access.'}
        </Text>
        <Pressable onPress={() => router.replace('/login')} style={styles.signInButton}>
          <Text style={styles.signInText}>Go to sign in</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#3930A8', '#4538D2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View pointerEvents="none" style={styles.headerDecorationLarge} />
        <View pointerEvents="none" style={styles.headerDecorationSmall} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open admin account menu"
          accessibilityState={{ expanded: accountMenuVisible }}
          disabled={isSigningOut}
          onPress={() => setAccountMenuVisible(true)}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>AD</Text>
        </Pressable>
        <View style={styles.headerIdentity}>
          <View style={styles.headerTitles}>
            <Text style={styles.eyebrow}>Wizard · Admin Console</Text>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.page}>
        {children}
      </View>

      <View style={styles.navigation}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => router.replace(tab.route)}
              style={styles.navigationItem}
            >
              <Feather
                name={tab.icon}
                size={21}
                color={isActive ? COLORS.primary : COLORS.muted}
              />
              <Text style={[styles.navigationLabel, isActive && styles.activeNavigationLabel]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <AccountDrawer
        visible={accountMenuVisible}
        name="Admin"
        email={accountEmail}
        footerLabel="Wizzar Admin"
        onClose={() => setAccountMenuVisible(false)}
        onLogout={() => leaveAdmin('log out')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    flexDirection: 'row',
    height: 88,
    justifyContent: 'flex-start',
    overflow: 'hidden',
    paddingHorizontal: 18,
  },
  headerDecorationLarge: {
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderRadius: 60,
    height: 82,
    position: 'absolute',
    right: 38,
    top: 24,
    width: 82,
  },
  headerDecorationSmall: {
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderRadius: 50,
    height: 70,
    position: 'absolute',
    right: -18,
    top: -30,
    width: 70,
  },
  headerIdentity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
    paddingLeft: 8,
  },
  headerTitles: {
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#FFF4C7',
    borderRadius: 21,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  avatarText: {
    color: '#A64B0A',
    fontFamily: Inter.bold,
    fontSize: 15,
  },
  accessState: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  accessText: {
    color: COLORS.text,
    fontFamily: Inter.medium,
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  signInText: {
    color: '#FFFFFF',
    fontFamily: Inter.semiBold,
  },
  page: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.72)',
    fontFamily: Inter.semiBold,
    fontSize: 10,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: Inter.bold,
    fontSize: 20,
    lineHeight: 23,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.border,
    borderRadius: 17,
    borderWidth: 1,
    padding: 16,
  },
  text: {
    color: COLORS.text,
    fontFamily: Inter.medium,
  
  },
  navigation: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    height: 88,
    justifyContent: 'space-around',
  },
  navigationItem: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
    justifyContent: 'center',
  },
  navigationLabel: {
    color: COLORS.muted,
    fontFamily: Inter.medium,
    fontSize: 12,
  },
  activeNavigationLabel: {
    color: COLORS.primary,
    fontFamily: Inter.semiBold,
  },
});
