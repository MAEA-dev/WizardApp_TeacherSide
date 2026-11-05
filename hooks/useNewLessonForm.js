import { useState } from 'react';
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { httpsCallable } from 'firebase/functions';
import { auth, lessonFunctions } from '../services/firebaseConfig';
import extractLessonText from '../utils/extractLessonText';

const generateLessonFromFile = httpsCallable(
  lessonFunctions,
  'generateLessonFromFile',
  { timeout: 300000 }
);
const MAX_TEXT_LENGTH = 20000;
const quarterLabel = (quarterNumber) =>
  `${quarterNumber}${['st', 'nd', 'rd', 'th'][quarterNumber - 1]}`;

export default function useNewLessonForm({ onClose, subjectId }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('Taglish');
  const [quarter, setQuarter] = useState(null);
  const [isPickingFile, setIsPickingFile] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');

  const pickFile = async () => {
    setIsPickingFile(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets?.[0]) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      Alert.alert(
        'Unable to select file',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setIsPickingFile(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setTitle('');
    setLanguage('Taglish');
    setQuarter(null);
    setGenerationError('');
  };

  const closeModal = () => {
    if (isGenerating) return;
    resetForm();
    onClose();
  };

  const handleGeneratePress = async () => {
    const user = auth.currentUser;

    if (!user) {
      setGenerationError('Please sign in again before creating a lesson.');
      return;
    }

    if (!subjectId || !selectedFile || !title.trim() || quarter === null) {
      setGenerationError('Choose a file, enter a title, and select a quarter.');
      return;
    }

    setIsGenerating(true);
    setGenerationError('');

    try {
      const fileName = selectedFile.name || 'lesson-file';
      const extractedText = await extractLessonText(selectedFile);
      const text = extractedText
        .replace(/\r\n/g, '\n')
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .slice(0, MAX_TEXT_LENGTH);

      if (!text) {
        throw new Error(
          'Could not extract readable text from the file. Scanned PDFs may need OCR.'
        );
      }

      const result = await generateLessonFromFile({
        text,
        fileName,
        title: title.trim(),
        language: language.toLowerCase(),
        subjectId,
        quarter,
      });

      if (!result.data?.success || !result.data.lessonId) {
        throw new Error('Lesson generation did not complete. Please try again.');
      }

      resetForm();
      onClose();
      Alert.alert(
        'Lesson created',
        `${title.trim()} was added to ${quarterLabel(quarter)} Quarter.`
      );
    } catch (error) {
      console.error('Unable to create lesson:', error);
      let message = error instanceof Error ? error.message : 'Unable to create lesson.';
      setGenerationError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = Boolean(
    selectedFile && title.trim() && quarter !== null && !isGenerating
  );

  return {
    selectedFile,
    title,
    setTitle,
    language,
    setLanguage,
    quarter,
    setQuarter,
    isPickingFile,
    isGenerating,
    generationError,
    pickFile,
    closeModal,
    handleGeneratePress,
    canGenerate,
    quarterLabel,
  };
}
