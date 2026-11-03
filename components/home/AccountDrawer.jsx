import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Fredoka, Nunito } from "../../constants/fonts";
import { Colors, Opacity } from "../../constants/colors";

export default function AccountDrawer({
  visible,
  name,
  email,
  onClose,
  onSwitchUser,
  onLogout,
}) {
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.82, 320);
  const slide = useRef(new Animated.Value(-drawerWidth)).current;
  const [isClosing, setIsClosing] = useState(false);
  const initial = name?.trim().charAt(0).toUpperCase() || "?";

  useEffect(() => {
    if (visible) {
      setIsClosing(false);
      slide.setValue(-drawerWidth);
    }
  }, [drawerWidth, slide, visible]);

  const closeDrawer = (action) => {
    if (isClosing) return;
    setIsClosing(true);
    Animated.timing(slide, {
      toValue: -drawerWidth,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      onClose();
      action?.();
    });
  };

  return (
    <Modal
      animationType="none"
      onRequestClose={() => closeDrawer()}
      onShow={() =>
        Animated.timing(slide, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start()
      }
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close account menu"
          onPress={() => closeDrawer()}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          style={[
            styles.drawer,
            { width: drawerWidth, transform: [{ translateX: slide }] },
          ]}
        >
          <View style={styles.drawerHeader}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close account menu"
              onPress={() => closeDrawer()}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={22} color={Colors.text} />
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <Text numberOfLines={1} style={styles.name}>{name}</Text>
            {!!email && <Text numberOfLines={1} style={styles.email}>{email}</Text>}
          </View>

          <View style={styles.menu}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => closeDrawer(onSwitchUser)}
              style={styles.menuItem}
            >
              <MaterialIcons name="switch-account" size={22} color={Colors.primary} />
              <View style={styles.menuCopy}>
                <Text style={styles.menuTitle}>Switch user</Text>
                <Text style={styles.menuDescription}>Sign in with another account</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={Colors.neutral} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => closeDrawer(onLogout)}
              style={styles.menuItem}
            >
              <MaterialIcons name="logout" size={22} color={Colors.danger} />
              <View style={styles.menuCopy}>
                <Text style={[styles.menuTitle, styles.logoutTitle]}>Log out</Text>
                <Text style={styles.menuDescription}>Return to the login screen</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={Colors.neutral} />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Wizzar Teacher</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#11182777",
  },
  drawer: {
    height: "100%",
    backgroundColor: Colors.bg,
    paddingTop: 16,
    paddingBottom: 20,
    elevation: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  drawerHeader: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 30,
    paddingBottom: 24,
    backgroundColor: Colors.primary,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#FFFFFF33",
  },
  avatar: {
    width: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 34,
    borderWidth: 3,
    borderColor: Colors.bg + Opacity[70],
    backgroundColor: Colors.lightBlue,
  },
  avatarText: {
    color: Colors.primary,
    fontFamily: Fredoka.bold,
    fontSize: 36,
  },
  name: {
    maxWidth: "100%",
    marginTop: 10,
    color: Colors.bg,
    fontFamily: Fredoka.semiBold,
    fontSize: 20,
  },
  email: {
    maxWidth: "100%",
    marginTop: 2,
    color: Colors.bg,
    fontFamily: Nunito.medium,
    fontSize: 12,
    opacity: 0.85,
  },
  menu: {
    paddingHorizontal: 14,
    paddingTop: 18,
  },
  menuItem: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 10,
  },
  menuCopy: { flex: 1 },
  menuTitle: {
    color: Colors.text,
    fontFamily: Nunito.bold,
    fontSize: 14,
  },
  logoutTitle: { color: Colors.danger },
  menuDescription: {
    marginTop: 2,
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 11,
  },
  divider: {
    height: 1,
    marginHorizontal: 10,
    backgroundColor: Colors.border,
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
  },
  footerText: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 11,
  },
});
