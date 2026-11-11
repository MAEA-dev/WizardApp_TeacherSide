import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../firebaseConfig';

const deleteTeacherLessonCall = httpsCallable(functions, 'deleteTeacherLesson');
const publishTeacherLessonCall = httpsCallable(functions, 'publishTeacherLesson');
const updateTeacherLessonCall = httpsCallable(functions, 'updateTeacherLesson');

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
    (snapshot) => {
      const lessons = snapshot.docs.map((lessonDoc) => {
        const lesson = lessonDoc.data();
        return {
          id: lessonDoc.id,
          ...lesson,
          title: lesson.displayTitle || lesson.title || 'Untitled lesson',
          status: lesson.isPublished ? 'published' : 'review',
        };
      });
      onLessons(lessons);
    },
    onError
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
    onError
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
