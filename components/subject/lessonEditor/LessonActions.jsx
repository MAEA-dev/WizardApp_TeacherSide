import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Nunito } from "../../../constants/fonts";
import { LESSON_EDITOR_COLORS as colors } from "./theme";

export default function LessonActions({
  onSave,
  isSaving = false,
  isSaveDisabled = false,
  onPublish,
  isPublishing = false,
  isPublished = false,
  showPublish = true,
}) {
  return (
    <View style={styles.container}>
      {showPublish && <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ disabled: isSaving || isSaveDisabled || isPublishing }}
        disabled={isSaving || isSaveDisabled || isPublishing}
        onPress={onSave}
        style={[
          styles.saveButton,
          (isSaving || isSaveDisabled || isPublishing) && styles.buttonDisabled,
        ]}
      >
        {isSaving ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={styles.saveText}>Save changes</Text>
        )}
      </TouchableOpacity>}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ disabled: isPublishing || isPublished }}
        disabled={isPublishing || isPublished}
        onPress={onPublish}
        style={[
          styles.publishButton,
          (isPublishing || isPublished) && styles.buttonDisabled,
        ]}
      >
        {isPublishing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.publishText}>
            {isPublished ? "Published to class" : "Publish to class"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  publishButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  saveButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  saveText: {
    color: colors.primary,
    fontFamily: Nunito.bold,
    fontSize: 12,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  publishText: {
    color: "#FFFFFF",
    fontFamily: Nunito.bold,
    fontSize: 12,
  },
});
