import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../firebaseConfig';
import { shouldIgnoreSignedOutPermissionError } from '../clientErrors';

const deleteTeacherLessonCall = httpsCallable(functions, 'deleteTeacherLesson');
const publishTeacherLessonCall = httpsCallable(functions, 'publishTeacherLesson');
const updateTeacherLessonCall = httpsCallable(functions, 'updateTeacherLesson');

const handleSnapshotError = (onError) => (error) => {
  if (shouldIgnoreSignedOutPermissionError(error, Boolean(auth.currentUser))) return;
  onError?.(error);
};

const getUploaderNames = async (lessons) => {
  const uploaderIds = [...new Set(lessons.map((lesson) => lesson.createdBy).filter(Boolean))];
  const entries = await Promise.all(uploaderIds.map(async (uid) => {
    try {
      const snapshot = await getDoc(doc(db, 'users', uid));
      if (!snapshot.exists()) return [uid, 'Unknown teacher'];

      const userData = snapshot.data();
      const profile = userData.profile || {};
      const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim()
        || userData.displayName
        || userData.username
        || 'Unknown teacher';
      return [uid, name];
    } catch (error) {
      if (!shouldIgnoreSignedOutPermissionError(error, Boolean(auth.currentUser))) {
        console.warn('Unable to load lesson uploader:', error);
      }
      return [uid, 'Unknown teacher'];
    }
  }));

  return new Map(entries);
};

export const updateTeacherLesson = async (lessonId, changes) => {
  if (!lessonId) {
    throw new Error('A lesson is required to save changes.');
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be signed in to update this lesson.');
  }

  await user.getIdToken(true);
  const result = await updateTeacherLessonCall({ lessonId, ...changes });
  if (!result.data?.success) {
    throw new Error('Unable to update this lesson. Please try again.');
  }

  return result.data;
};

export const publishTeacherLesson = async (lessonId) => {
  if (!lessonId) {
    throw new Error('A lesson is required to publish it.');
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be signed in to publish this lesson.');
  }

  await user.getIdToken(true);
  const result = await publishTeacherLessonCall({ lessonId });
  if (!result.data?.success) {
    throw new Error('Unable to publish this lesson. Please try again.');
  }

  return result.data;
};

export const subscribeToSubjectLessons = (subjectId, onLessons, onError) =>
  onSnapshot(
    query(collection(db, 'lessons'), where('subjectId', '==', subjectId)),
    async (snapshot) => {
      const lessonData = snapshot.docs.map((lessonDoc) => ({
        id: lessonDoc.id,
        ...lessonDoc.data(),
      }));
      const uploaderNames = await getUploaderNames(lessonData);
      const lessons = lessonData.map((lesson) => ({
        ...lesson,
        uploaderName: uploaderNames.get(lesson.createdBy) || 'Unknown teacher',
        title: lesson.displayTitle || lesson.title || 'Untitled lesson',
        status: lesson.isPublished ? 'published' : 'review',
      }));
      onLessons(lessons);
    },
    handleSnapshotError(onError)
  );

export const subscribeToAllLessons = (onLessons, onError) =>
  onSnapshot(
    collection(db, 'lessons'),
    (snapshot) => {
      const lessons = snapshot.docs
        .map((lessonDoc) => {
          const lesson = lessonDoc.data();
          return {
            id: lessonDoc.id,
            ...lesson,
            title: lesson.displayTitle || lesson.title || 'Untitled lesson',
            status: lesson.isPublished ? 'published' : 'review',
          };
        })
        .sort((left, right) =>
          (right.createdAt?.toMillis?.() || 0) - (left.createdAt?.toMillis?.() || 0)
        );
      onLessons(lessons);
    },
    handleSnapshotError(onError)
  );

export const deleteTeacherLesson = async (lessonId) => {
  if (!lessonId) {
    throw new Error('A lesson is required to delete lesson data.');
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error('Your sign-in session has expired. Sign in again to delete this lesson.');
  }

  await user.getIdToken(true);

  try {
    const result = await deleteTeacherLessonCall({ lessonId });
    if (!result.data?.success) {
      throw new Error('Unable to delete this lesson. Please try again.');
    }

    return result.data;
  } catch (error) {
    if (error.code === 'functions/unauthenticated') {
      throw new Error('Firebase could not verify your sign-in. Sign out and sign in again.');
    }
    throw error;
  }
};
