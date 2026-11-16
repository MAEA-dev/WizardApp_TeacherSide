import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Fredoka, Nunito } from "../../constants/fonts";
import { Colors, Opacity } from "../../constants/colors";
import {
  changeCurrentUserPassword,
  getAuthErrorMessage,
} from "../../services/firebaseAuth";

export default function AccountDrawer({
  visible,
  name,
  email,
  onClose,
  onLogout,
  footerLabel = "Wizard Teacher",
}) {
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.82, 320);
  const slide = useRef(new Animated.Value(-drawerWidth)).current;
  const [isClosing, setIsClosing] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
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

  const clearPasswordForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordError("");
    setPasswordSuccess("");
  };

  const openPasswordModal = () => {
    closeDrawer(() => {
      clearPasswordForm();
      setIsPasswordModalVisible(true);
    });
  };

  const closePasswordModal = () => {
    if (isChangingPassword) return;
    setIsPasswordModalVisible(false);
    clearPasswordForm();
  };

  const handleChangePassword = async () => {
    if (isChangingPassword) return;
    setPasswordError("");
    setPasswordSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please complete all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must contain at least 8 characters.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changeCurrentUserPassword({ oldPassword, newPassword });
      clearPasswordForm();
      setPasswordSuccess("Your password was changed successfully.");
    } catch (error) {
      const message =
        error?.code === "auth/wrong-password" ||
        error?.code === "auth/invalid-credential"
          ? "The old password is incorrect."
          : error?.code === "auth/requires-recent-login"
            ? "Please sign in again before changing your password."
            : getAuthErrorMessage(error);
      setPasswordError(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <>
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

              <View style={styles.divider} />

              <TouchableOpacity
                accessibilityRole="button"
                onPress={openPasswordModal}
                style={styles.menuItem}
              >
                <MaterialIcons name="lock-reset" size={22} color={Colors.primary} />
                <View style={styles.menuCopy}>
                  <Text style={styles.menuTitle}>Change password</Text>
                  <Text style={styles.menuDescription}>Update your account password</Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={Colors.neutral} />
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{footerLabel}</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        onRequestClose={closePasswordModal}
        transparent
        visible={isPasswordModalVisible}
      >
        <View style={styles.passwordOverlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close change password dialog"
            disabled={isChangingPassword}
            onPress={closePasswordModal}
            style={StyleSheet.absoluteFill}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.passwordKeyboard}
          >
            <View style={styles.passwordModal}>
              <Text style={styles.passwordModalTitle}>Change Password</Text>
              {passwordSuccess ? (
                <View style={styles.passwordSuccessContainer}>
                  <MaterialIcons
                    name="check-circle"
                    size={28}
                    color={Colors.success}
                  />
                  <Text accessibilityRole="alert" style={styles.passwordSuccess}>
                    {passwordSuccess}
                  </Text>
                </View>
              ) : (
                <View style={styles.passwordFields}>
                  <PasswordField
                    label="Old Password"
                    autoComplete="current-password"
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    isVisible={showOldPassword}
                    onToggleVisibility={() =>
                      setShowOldPassword((visible) => !visible)
                    }
                    editable={!isChangingPassword}
                  />
                  <PasswordField
                    label="New Password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    isVisible={showNewPassword}
                    onToggleVisibility={() =>
                      setShowNewPassword((visible) => !visible)
                    }
                    editable={!isChangingPassword}
                  />
                  <PasswordField
                    label="Confirm Password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    isVisible={showConfirmPassword}
                    onToggleVisibility={() =>
                      setShowConfirmPassword((visible) => !visible)
                    }
                    editable={!isChangingPassword}
                  />
                </View>
              )}
              {!!passwordError && (
                <Text accessibilityRole="alert" style={styles.passwordError}>
                  {passwordError}
                </Text>
              )}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{
                  busy: isChangingPassword,
                  disabled: isChangingPassword,
                }}
                disabled={isChangingPassword}
                onPress={passwordSuccess ? closePasswordModal : handleChangePassword}
                style={[
                  styles.passwordSubmitButton,
                  isChangingPassword && styles.passwordSubmitDisabled,
                ]}
              >
                {isChangingPassword ? (
                  <ActivityIndicator color={Colors.surface} />
                ) : (
                  <Text style={styles.passwordSubmitText}>
                    {passwordSuccess ? "Done" : "OK"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

function PasswordField({
  label,
  autoComplete,
  value,
  onChangeText,
  isVisible,
  onToggleVisibility,
  editable,
}) {
  return (
    <View style={styles.passwordField}>
      <Text style={styles.passwordLabel}>{label}</Text>
      <View style={styles.passwordInputRow}>
        <TextInput
          accessibilityLabel={label}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect={false}
          editable={editable}
          onChangeText={onChangeText}
          secureTextEntry={!isVisible}
          style={styles.passwordInput}
          value={value}
        />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`${isVisible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          disabled={!editable}
          onPress={onToggleVisibility}
          style={styles.passwordVisibilityButton}
        >
          <MaterialIcons
            name={isVisible ? "visibility-off" : "visibility"}
            size={20}
            color={Colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
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
  passwordOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#11182777",
  },
  passwordKeyboard: {
    alignItems: "center",
    width: "100%",
  },
  passwordModal: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "96%",
    padding: 20,
    borderRadius: 22,
    backgroundColor: Colors.bg,
  },
  passwordModalTitle: {
    marginBottom: 16,
    color: Colors.text,
    fontFamily: Fredoka.semiBold,
    fontSize: 22,
  },
  passwordFields: {
    gap: 14,
  },
  passwordField: {
    gap: 6,
  },
  passwordLabel: {
    color: Colors.text,
    fontFamily: Nunito.bold,
    fontSize: 13,
  },
  passwordInputRow: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 13,
    backgroundColor: Colors.surface,
    paddingLeft: 12,
  },
  passwordInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 11,
    color: Colors.text,
    fontFamily: Nunito.medium,
    fontSize: 14,
  },
  passwordVisibilityButton: {
    width: 44,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  passwordError: {
    color: Colors.danger,
    fontFamily: Nunito.medium,
    fontSize: 12,
  },
  passwordSuccessContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    minHeight: 100,
    justifyContent: "center",
  },
  passwordSuccess: {
    color: Colors.success,
    flex: 1,
    fontFamily: Nunito.bold,
    fontSize: 14,
  },
  passwordSubmitButton: {
    minHeight: 48,
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: Colors.primary,
  },
  passwordSubmitDisabled: {
    opacity: 0.65,
  },
  passwordSubmitText: {
    color: Colors.surface,
    fontFamily: Nunito.bold,
    fontSize: 15,
  },
});
