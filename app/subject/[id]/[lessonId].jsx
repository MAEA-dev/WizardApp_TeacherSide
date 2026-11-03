import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MOCK_AI_LESSON_ID, MockAiLesson } from "../../../Mocks/aiLesson";
import { LessonResults } from "../../../Mocks/lessonResults";
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
  const { lessonId } = useLocalSearchParams();
  const router = useRouter();
  const currentLessonId = Array.isArray(lessonId) ? lessonId[0] : lessonId;
  const lessonDocument =
    String(currentLessonId) === MOCK_AI_LESSON_ID ? MockAiLesson : null;
  const aiLesson = lessonDocument?.aiLesson;
  const editor = useLessonEditor(aiLesson, currentLessonId);

  if (!lessonDocument) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Lesson not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const title = lessonDocument.displayTitle ?? lessonDocument.title;
  const subtitle = `${lessonDocument.subjectName} · Grade ${lessonDocument.gradeLevel}`;

  return (
    <View style={styles.screen}>
      <LessonHeader subtitle={subtitle} onBack={() => router.back()} />

      <View style={styles.tabs} accessibilityRole="tablist">
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
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "results" ? (
          <LessonResultsReport
            lessonId={currentLessonId}
            lessonTitle={title}
            results={LessonResults[currentLessonId] ?? []}
          />
        ) : (
          <>
            <LessonContentCard
              title={title}
              introMessage={aiLesson.introMessage}
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

            <LessonFinalMessage message={aiLesson.finalMessage} />
            <LessonActions />
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
