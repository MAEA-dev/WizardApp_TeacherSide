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
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { auth, db, storage } from "../../../services/firebaseConfig";
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
  const { lessonId } = useLocalSearchParams();
  const router = useRouter();
  const currentLessonId = Array.isArray(lessonId) ? lessonId[0] : lessonId;
  const [lessonDocument, setLessonDocument] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  const [resultsError, setResultsError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [uploadingImageIndex, setUploadingImageIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
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
    if (isSaving || uploadingImageIndex !== null || !lessonDocument) return;

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

  const saveStepImage = async (stepIndex, imageFields) => {
    const updatedSteps = editor.interactiveSteps.map((step, index) => {
      if (index !== stepIndex) return step;
      const updatedStep = { ...step };
      delete updatedStep.imageUrl;
      delete updatedStep.imagePath;
      return { ...updatedStep, ...imageFields };
    });
    await updateTeacherLesson(currentLessonId, {
      interactiveSteps: updatedSteps,
    });
  };

  const handleUploadStepImage = async (stepIndex, step) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Sign in required", "Sign in again before uploading a photo.");
      return;
    }

    const currentImageCount = editor.interactiveSteps.filter(
      (item) => typeof item.imageUrl === "string" && item.imageUrl
    ).length;
    if (!step.imageUrl && currentImageCount >= 2) {
      Alert.alert(
        "Image limit reached",
        "A lesson can have photos on up to two explanation steps."
      );
      return;
    }

    let selection;
    try {
      selection = await DocumentPicker.getDocumentAsync({
        type: ["image/jpeg", "image/png", "image/webp"],
        copyToCacheDirectory: true,
        multiple: false,
      });
    } catch (error) {
      console.error("Unable to select lesson photo:", error);
      Alert.alert(
        "Unable to select photo",
        error instanceof Error ? error.message : "Please try again."
      );
      return;
    }
    if (selection.canceled || !selection.assets?.[0]) return;

    const asset = selection.assets[0];
    const selectedMimeType =
      asset.mimeType === "image/jpg" ? "image/jpeg" : asset.mimeType;
    const inferredType = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    }[asset.name?.split(".").pop()?.toLowerCase()];
    const contentType = selectedMimeType || inferredType;
    if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
      Alert.alert("Unsupported photo", "Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (asset.size > 8 * 1024 * 1024) {
      Alert.alert("Photo is too large", "Choose an image smaller than 8 MB.");
      return;
    }

    setUploadingImageIndex(stepIndex);
    let uploadedImageRef = null;
    try {
      const response = await fetch(asset.uri);
      if (!response.ok) {
        throw new Error("The selected photo could not be read.");
      }
      const imageBlob = await response.blob();
      if (!imageBlob.size || imageBlob.size > 8 * 1024 * 1024) {
        throw new Error("Choose a non-empty image smaller than 8 MB.");
      }

      const extension = contentType.split("/")[1].replace("jpeg", "jpg");
      const imagePath = `lessonImages/${user.uid}/${currentLessonId}/step-${
        stepIndex + 1
      }-${Date.now()}.${extension}`;
      uploadedImageRef = ref(storage, imagePath);
      await uploadBytes(uploadedImageRef, imageBlob, { contentType });
      const imageUrl = await getDownloadURL(uploadedImageRef);
      await saveStepImage(stepIndex, { imageUrl, imagePath });

      const ownedImagePrefix = `lessonImages/${user.uid}/${currentLessonId}/`;
      if (
        step.imagePath?.startsWith(ownedImagePrefix) &&
        step.imagePath !== imagePath
      ) {
        try {
          await deleteObject(ref(storage, step.imagePath));
        } catch (error) {
          console.warn("Previous lesson photo cleanup failed:", error);
        }
      }
    } catch (error) {
      if (uploadedImageRef) {
        try {
          await deleteObject(uploadedImageRef);
        } catch (cleanupError) {
          console.warn("Lesson photo cleanup failed:", cleanupError);
        }
      }
      console.error("Unable to upload lesson photo:", error);
      Alert.alert(
        "Photo upload failed",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setUploadingImageIndex(null);
    }
  };

  const handleRemoveStepImage = async (stepIndex, step) => {
    try {
      await saveStepImage(stepIndex, {});
      const ownedImagePrefix = `lessonImages/${auth.currentUser?.uid}/${currentLessonId}/`;
      if (step.imagePath?.startsWith(ownedImagePrefix)) {
        try {
          await deleteObject(ref(storage, step.imagePath));
        } catch (error) {
          console.warn("Removed lesson photo cleanup failed:", error);
        }
      }
    } catch (error) {
      console.error("Unable to remove lesson photo:", error);
      Alert.alert(
        "Unable to remove photo",
        error instanceof Error ? error.message : "Please try again."
      );
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

  if (isLoading || loadError || !lessonDocument) {
    return (
      <View style={styles.notFound}>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={styles.notFoundText}>{loadError || 'Lesson not found.'}</Text>
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
              onUploadImage={handleUploadStepImage}
              onRemoveImage={handleRemoveStepImage}
              uploadingImageIndex={uploadingImageIndex}
              imageCount={editor.interactiveSteps.filter(
                (step) => typeof step.imageUrl === "string" && step.imageUrl
              ).length}
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
              isSaveDisabled={uploadingImageIndex !== null}
              onPublish={confirmPublishLesson}
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
