import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Fredoka, Nunito } from "../../../constants/fonts";
import { formatDurationSeconds } from "../../../utils/formatDuration";
import { LESSON_EDITOR_COLORS as colors } from "./theme";

const escapeCsvCell = (value) => {
  let cell = String(value ?? "");
  if (/^[\s]*[=+\-@\t\r]/.test(cell)) {
    cell = `'${cell}`;
  }
  return `"${cell.replace(/"/g, '""')}"`;
};

const createCsvReport = (lessonTitle, results) => {
  const columns = [
    "Lesson",
    "Student",
    "Score (%)",
    "Correct answers",
    "Total questions",
    "Time spent",
  ];
  const rows = results.map(({ student, result }) => [
    lessonTitle,
    student.name,
    result?.totalQuestions > 0
      ? Math.round((result.correctAnswers / result.totalQuestions) * 100)
      : "",
    result?.correctAnswers ?? "",
    result?.totalQuestions ?? "",
    formatDurationSeconds(result?.durationSeconds),
  ]);

  return [columns, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n");
};

const getScorePercent = (result) =>
  Math.round((result.correctAnswers / result.totalQuestions) * 100);

export default function LessonResultsReport({
  lessonId,
  lessonTitle,
  results = [],
  isLoading = false,
  error = '',
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [exportMessage, setExportMessage] = useState("");

  const studentResults = useMemo(
    () => results.map((result, index) => ({
      student: {
        id: result.studentId ?? index,
        name: result.studentName || result.studentId || "Student",
      },
      result,
    })),
    [results]
  );
  const completedResults = results.filter(
    (result) => result.totalQuestions > 0 && result.correctAnswers >= 0
  );
  const averageScore = completedResults.length
    ? Math.round(
        completedResults.reduce(
          (total, result) => total + getScorePercent(result),
          0
        ) / completedResults.length
      )
    : null;

  const exportReport = async () => {
    setIsExporting(true);
    setExportError("");
    setExportMessage("");

    try {
      const csv = createCsvReport(lessonTitle, studentResults);
      const safeLessonId = String(lessonId).replace(/[^a-zA-Z0-9_-]/g, "_");
      const fileName = `${safeLessonId}-scores.csv`;

      if (Platform.OS === "web") {
        const file = new Blob(["\uFEFF", csv], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setExportMessage("The score report was downloaded.");
        return;
      }

      if (!FileSystem.cacheDirectory) {
        throw new Error("The app could not access temporary storage.");
      }

      if (Platform.OS === "android") {
        const permission =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
            FileSystem.StorageAccessFramework.getUriForDirectoryInRoot("Download")
          );

        if (!permission.granted) {
          setExportMessage("Download cancelled. Choose a folder to save the report.");
          return;
        }

        const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permission.directoryUri,
          fileName.replace(/\.csv$/i, ""),
          "text/csv"
        );
        await FileSystem.StorageAccessFramework.writeAsStringAsync(
          fileUri,
          `\uFEFF${csv}`,
          { encoding: FileSystem.EncodingType.UTF8 }
        );
        setExportMessage("The score report was saved to your selected folder.");
        return;
      }

      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, `\uFEFF${csv}`, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Sharing.shareAsync(fileUri, {
        dialogTitle: `Export ${lessonTitle} scores`,
        mimeType: "text/csv",
        UTI: "public.comma-separated-values-text",
      });
      setExportMessage("Choose Save to Files to download the report to your device.");
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : "The score report could not be exported."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text style={styles.title}>Student results</Text>
          <Text style={styles.subtitle}>Scores for this lesson</Text>
        </View>
        {averageScore !== null && (
          <View style={styles.averageBadge}>
            <Text style={styles.averageValue}>{averageScore}%</Text>
            <Text style={styles.averageLabel}>class avg.</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.resultsLoading} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : studentResults.length > 0 ? (
        <View style={styles.resultList}>
          {studentResults.map(({ student, result }) => {
            const initials = student.name
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <View key={student.id} style={styles.resultRow}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: student.avatarColor || colors.border },
                  ]}
                >
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.studentDetails}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.scoreDetail}>
                    {result?.totalQuestions > 0
                      ? `${result.correctAnswers} of ${result.totalQuestions} correct`
                      : "Score unavailable"}
                  </Text>
                  <Text style={styles.timeDetail}>
                    Time spent: {formatDurationSeconds(result?.durationSeconds)}
                  </Text>
                </View>
                <Text style={[styles.score, !(result?.totalQuestions > 0) && styles.pendingScore]}>
                  {result?.totalQuestions > 0 ? `${getScorePercent(result)}%` : "—"}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={styles.empty}>No students have completed this lesson yet.</Text>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isExporting }}
        disabled={isExporting}
        onPress={exportReport}
        style={({ pressed }) => [
          styles.exportButton,
          pressed && styles.exportButtonPressed,
          isExporting && styles.exportButtonDisabled,
        ]}
      >
        {isExporting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <MaterialIcons name="download" size={19} color="#FFFFFF" />
        )}
        <Text style={styles.exportButtonText}>
          {isExporting ? "Preparing report..." : "Download score report (CSV)"}
        </Text>
      </Pressable>
      <Text style={styles.exportHint}>
        CSV format opens in Excel and other spreadsheet apps.
      </Text>
      {!!exportError && <Text style={styles.error}>{exportError}</Text>}
      {!!exportMessage && <Text style={styles.success}>{exportMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  heading: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontFamily: Fredoka.medium,
    fontSize: 19,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: Nunito.medium,
    fontSize: 12,
    marginTop: 2,
  },
  averageBadge: {
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    minWidth: 68,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  averageValue: {
    color: colors.primary,
    fontFamily: Fredoka.medium,
    fontSize: 17,
  },
  averageLabel: {
    color: colors.muted,
    fontFamily: Nunito.medium,
    fontSize: 10,
  },
  resultList: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginBottom: 14,
  },
  resultRow: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 58,
    paddingVertical: 8,
  },
  avatar: {
    alignItems: "center",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  avatarText: {
    color: colors.text,
    fontFamily: Nunito.bold,
    fontSize: 11,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    color: colors.text,
    fontFamily: Nunito.bold,
    fontSize: 13,
  },
  scoreDetail: {
    color: colors.muted,
    fontFamily: Nunito.medium,
    fontSize: 11,
    marginTop: 1,
  },
  timeDetail: {
    color: colors.muted,
    fontFamily: Nunito.medium,
    fontSize: 11,
    marginTop: 1,
  },
  score: {
    color: colors.primary,
    fontFamily: Fredoka.medium,
    fontSize: 18,
  },
  pendingScore: {
    color: colors.muted,
  },
  empty: {
    color: colors.muted,
    fontFamily: Nunito.medium,
    fontSize: 13,
    paddingVertical: 16,
  },
  resultsLoading: {
    paddingVertical: 16,
  },
  exportButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 12,
  },
  exportButtonPressed: {
    opacity: 0.85,
  },
  exportButtonDisabled: {
    opacity: 0.65,
  },
  exportButtonText: {
    color: "#FFFFFF",
    fontFamily: Nunito.bold,
    fontSize: 13,
  },
  exportHint: {
    color: colors.muted,
    fontFamily: Nunito.medium,
    fontSize: 10,
    marginTop: 7,
    textAlign: "center",
  },
  error: {
    color: "#B91C1C",
    fontFamily: Nunito.medium,
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  success: {
    color: "#166534",
    fontFamily: Nunito.medium,
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
});
