import { useEffect, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebaseConfig";
import {
  publishTeacherLesson,
  subscribeToLessonCompletions,
  updateTeacherLesson,
} from "../../../services/teacherClasses";
import useLessonEditor from "../../../hooks/useLessonEditor";
import LessonActions from "../../../components/subject/lessonEditor/LessonActions";
import LessonContentCard from "../../../components/subject/lessonEditor/LessonContentCard";
import LessonFinalMessage from "../../../components/subject/lessonEditor/LessonFinalMessage";
import LessonHeader from "../../../components/subject/lessonEditor/LessonHeader";
import LessonSummaryEditor from "../../../components/subject/lessonEditor/LessonSummaryEditor";
import InteractiveStepsEditor from "../../../components/subject/lessonEditor/InteractiveStepsEditor";
import LessonResultsReport from "../../../components/subject/lessonEditor/LessonResultsReport";
import { LESSON_EDITOR_COLORS as colors } from "../../../components/subject/lessonEditor/theme";
import { Nunito } from "../../../constants/fonts";

export default function LessonScreen() {
  const [activeTab, setActiveTab] = useState("results");
  const { id, lessonId, admin } = useLocalSearchParams();
  const router = useRouter();
  const routeSubjectId = Array.isArray(id) ? id[0] : id;
  const currentLessonId = Array.isArray(lessonId) ? lessonId[0] : lessonId;
  const isAdminContext = (Array.isArray(admin) ? admin[0] : admin) === '1';
  const [lessonDocument, setLessonDocument] = useState(null);
  const [subjectStatus, setSubjectStatus] = useState({
    subjectId: null,
    status: "loading",
  });
  const [results, setResults] = useState([]);
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  const [resultsError, setResultsError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const subjectId = routeSubjectId || lessonDocument?.subjectId;
  const subjectAvailability = !subjectId
    ? lessonDocument
      ? "error"
      : "loading"
    : subjectStatus.subjectId === subjectId
      ? subjectStatus.status
      : "loading";

  useEffect(() => {
    if (!subjectId) return undefined;
    return onSnapshot(
      doc(db, "subjects", subjectId),
      (snapshot) => {
        setSubjectStatus({
          subjectId,
          status:
            snapshot.exists() && snapshot.data().active !== false
              ? "active"
              : "inactive",
        });
      },
      (error) => {
        console.error("Unable to verify subject availability:", error);
        setSubjectStatus({ subjectId, status: "error" });
      }
    );
  }, [subjectId]);

  useEffect(() => {
    if (!currentLessonId) {
      setLoadError('Lesson not found.');
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    setLoadError('');
    return onSnapshot(
      doc(db, "lessons", currentLessonId),
      (snapshot) => {
        setLessonDocument(
          snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
        );
        setIsLoading(false);
        if (!snapshot.exists()) setLoadError('Lesson not found.');
      },
      (error) => {
        console.error("Unable to load lesson:", error);
        setLoadError(error.message || "Unable to load this lesson.");
        setIsLoading(false);
      }
    );
  }, [currentLessonId]);

  useEffect(() => {
    if (!currentLessonId) return undefined;

    setResults([]);
    setIsLoadingResults(true);
    setResultsError('');
    return subscribeToLessonCompletions(
      currentLessonId,
      (lessonResults) => {
        setResults(
          lessonResults.map((result) => ({
            studentId: result.studentId,
            studentName: result.studentName,
            correctAnswers: Number(result.correctAnswers) || 0,
            totalQuestions: Number(result.totalQuestions) || 0,
            durationSeconds: result.durationSeconds,
            completedAt: result.completedAt,
          }))
        );
        setResultsError('');
        setIsLoadingResults(false);
      },
      (error) => {
        console.error("Unable to load lesson results:", error);
        setResultsError(error.message || "Unable to load lesson results.");
        setIsLoadingResults(false);
      }
    );
  }, [currentLessonId]);

  const aiLesson = lessonDocument?.aiLesson;
  const editor = useLessonEditor(aiLesson, currentLessonId);

  const handleSaveLesson = async () => {
    if (isSaving || !lessonDocument) return;

    const changes = editor.getChangesToSave();
    if (!changes) return;

    setIsSaving(true);
    try {
      await updateTeacherLesson(currentLessonId, changes);
      Alert.alert(
        "Lesson updated",
        lessonDocument.isPublished
          ? "Your changes are saved and available to students."
          : "Your lesson changes have been saved."
      );
    } catch (error) {
      console.error("Unable to save lesson changes:", error);
      Alert.alert(
        "Unable to save lesson",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishLesson = async () => {
    if (lessonDocument?.isPublished || isPublishing) return;

    setIsPublishing(true);
    try {
      await publishTeacherLesson(currentLessonId);
      Alert.alert(
        "Lesson published",
        "Students in this class can now access the lesson."
      );
    } catch (error) {
      console.error("Unable to publish lesson:", error);
      Alert.alert(
        "Unable to publish lesson",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const confirmPublishLesson = () => {
    if (lessonDocument?.isPublished || isPublishing) return;

    Alert.alert(
      "Publish lesson?",
      "Students in this class will be able to open this lesson.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Publish", onPress: handlePublishLesson },
      ]
    );
  };

  if (
    isLoading ||
    loadError ||
    !lessonDocument ||
    (!isAdminContext && subjectAvailability !== "active")
  ) {
    return (
      <View style={styles.notFound}>
        {isLoading || (!loadError && subjectAvailability === "loading") ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={styles.notFoundText}>
            {loadError ||
              (subjectAvailability === "inactive"
                ? "This subject is inactive and unavailable."
                : subjectAvailability === "error"
                  ? "Unable to verify whether this subject is active."
                  : "Lesson not found.")}
          </Text>
        )}
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const title = lessonDocument.displayTitle ?? lessonDocument.title;
  const subtitle = `${lessonDocument.subjectName ?? 'Subject'} · ${lessonDocument.gradeLevel ?? ''}`;

  return (
    <View style={styles.screen}>
      <LessonHeader title={title} subtitle={subtitle} onBack={() => router.back()} />

      {!isAdminContext && <View style={styles.tabs} accessibilityRole="tablist">
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "results" }}
          onPress={() => setActiveTab("results")}
          style={[styles.tab, activeTab === "results" && styles.activeTab]}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === "results" && styles.activeTabLabel,
            ]}
          >
            Students result
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "edit" }}
          onPress={() => setActiveTab("edit")}
          style={[styles.tab, activeTab === "edit" && styles.activeTab]}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === "edit" && styles.activeTabLabel,
            ]}
          >
            Edit Lesson
          </Text>
        </Pressable>
      </View>}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!isAdminContext && activeTab === "results" ? (
          <LessonResultsReport
            lessonId={currentLessonId}
            lessonTitle={title}
            results={results}
            isLoading={isLoadingResults}
            error={resultsError}
          />
        ) : (
          <>
            <LessonContentCard
              title={title}
              introMessage={aiLesson?.introMessage ?? ''}
              language={lessonDocument.language}
            />

            <InteractiveStepsEditor
              aiStatus={lessonDocument.aiStatus}
              steps={editor.editableSteps}
              editingStepIndex={editor.editingStepIndex}
              draftText={editor.draftText}
              onChangeText={editor.setDraftText}
              draftChoices={editor.draftChoices}
              onChangeChoice={editor.updateStepChoice}
              onAddChoice={editor.addStepChoice}
              onRemoveChoice={editor.removeStepChoice}
              draftAnswer={editor.draftAnswer}
              onChangeAnswer={editor.setDraftAnswer}
              editError={editor.editStepError}
              onToggleEdit={editor.toggleStepEditing}
              addingStepType={editor.addingStepType}
              newStepDraft={editor.newStepDraft}
              newStepError={editor.newStepError}
              onStartAdding={editor.startAddingStep}
              onChangeNewDraft={(field, value) =>
                editor.setNewStepDraft((draft) => ({ ...draft, [field]: value }))
              }
              onChangeNewChoice={editor.updateNewChoice}
              onAddNewChoice={editor.addNewChoice}
              onRemoveNewChoice={editor.removeNewChoice}
              onCancelAdd={editor.cancelAddingStep}
              onSubmitAdd={editor.addInteractiveStep}
            />

            <LessonSummaryEditor
              items={editor.summary}
              editingIndex={editor.editingSummaryIndex}
              onAdd={editor.addSummaryPoint}
              onChange={editor.updateSummaryPoint}
              onToggleEdit={(index) =>
                editor.setEditingSummaryIndex((current) => current === index ? null : index)
              }
              onRemove={editor.removeSummaryPoint}
            />

            <LessonFinalMessage message={aiLesson?.finalMessage ?? ''} />
            <LessonActions
              onSave={handleSaveLesson}
              isSaving={isSaving}
              onPublish={confirmPublishLesson}
              showPublish={!isAdminContext}
              isPublishing={isPublishing}
              isPublished={lessonDocument.isPublished === true}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  tabs: {
    backgroundColor: "#E9E7F5",
    borderRadius: 16,
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
    padding: 4,
  },
  tab: {
    alignItems: "center",
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 8,
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
  },
  tabLabel: {
    color: colors.muted,
    fontFamily: Nunito.bold,
    fontSize: 13,
  },
  activeTabLabel: {
    color: colors.primary,
  },
  notFound: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    color: colors.text,
    fontFamily: Nunito.bold,
    fontSize: 16,
  },
  backLink: {
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  backLinkText: {
    color: colors.primary,
    fontFamily: Nunito.bold,
  },
});
