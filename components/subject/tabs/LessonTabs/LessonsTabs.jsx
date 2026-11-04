import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "../../../../constants/colors";
import { Nunito } from "../../../../constants/fonts";
import { deleteTeacherLesson } from "../../../../services/teacherClasses";
import LessonCard from "../LessonTabs/lessonCard";

const getDeleteErrorMessage = (error) => {
  switch (error?.code) {
    case "functions/permission-denied":
      return "You can only delete lessons you created. This lesson belongs to another teacher.";
    case "functions/unauthenticated":
      return "Your sign-in session has expired. Sign in again to delete this lesson.";
    case "functions/not-found":
      return "This lesson was already deleted or is no longer available.";
    default:
      return typeof error?.message === "string" && error.message.trim()
        ? error.message
        : "Unable to delete this lesson. Please try again.";
  }
};

export default function LessonsTab({
  subjectId,
  lessons,
  teacher,
  error,
  isLoading,
}) {
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [deletingLessonId, setDeletingLessonId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const confirmDelete = async () => {
    if (!lessonToDelete || deletingLessonId) return;

    setDeletingLessonId(lessonToDelete.id);
    setDeleteError("");
    try {
      await deleteTeacherLesson(lessonToDelete.id);
      setLessonToDelete(null);
    } catch (error) {
      if (error?.code !== "functions/permission-denied") {
        console.error("Unable to delete lesson:", error);
      }
      setDeleteError(getDeleteErrorMessage(error));
    } finally {
      setDeletingLessonId(null);
    }
  };

  return (
    <>
      <FlatList
        data={lessons}
        keyExtractor={(l) => String(l.id)}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={Colors.primary} style={styles.empty} />
          ) : (
            <Text style={styles.empty}>{error || 'No lessons yet.'}</Text>
          )
        }
        renderItem={({ item }) => (
          <LessonCard
            id={item.id}
            subjectId={subjectId}
            title={item.title}
            teacher={teacher}
            status={item.status}
            quarter={item.quarter}
            createdAt={item.createdAt || item.publishedAt}
            onDelete={() => {
              setDeleteError("");
              setLessonToDelete({ id: item.id, title: item.title });
            }}
            isDeleting={deletingLessonId === item.id}
          />
        )}
      />

      <Modal
        animationType="fade"
        onRequestClose={() => {
          if (!deletingLessonId) setLessonToDelete(null);
        }}
        transparent
        visible={lessonToDelete !== null}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>
              {deleteError ? "Unable to delete lesson" : "Delete lesson?"}
            </Text>
            <Text style={styles.dialogText}>
              Delete “{lessonToDelete?.title}” and all student completion records for this lesson?
              This action cannot be undone.
            </Text>
            {!!deleteError && <Text accessibilityRole="alert" style={styles.error}>{deleteError}</Text>}
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                disabled={deletingLessonId !== null}
                onPress={() => setLessonToDelete(null)}
                style={[styles.actionButton, styles.cancelButton]}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={deletingLessonId !== null}
                onPress={confirmDelete}
                style={[styles.actionButton, styles.deleteButton]}
              >
                {deletingLessonId !== null ? (
                  <ActivityIndicator color={Colors.surface} />
                ) : (
                  <Text style={styles.deleteText}>Delete</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: "center", marginTop: 30, fontFamily: Nunito.medium, },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  dialog: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    gap: 12,
    maxWidth: 420,
    padding: 20,
    width: "100%",
  },
  dialogTitle: {
    color: Colors.text,
    fontFamily: Nunito.bold,
    fontSize: 18,
  },
  dialogText: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    color: Colors.danger,
    fontFamily: Nunito.medium,
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 4,
  },
  actionButton: {
    alignItems: "center",
    borderRadius: 10,
    justifyContent: "center",
    minHeight: 40,
    minWidth: 88,
    paddingHorizontal: 14,
  },
  cancelButton: {
    backgroundColor: Colors.primarySoft,
  },
  cancelText: {
    color: Colors.text,
    fontFamily: Nunito.bold,
    fontSize: 13,
  },
  deleteButton: {
    backgroundColor: Colors.danger,
  },
  deleteText: {
    color: Colors.surface,
    fontFamily: Nunito.bold,
    fontSize: 13,
  },
});