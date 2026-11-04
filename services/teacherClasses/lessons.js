import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../firebaseConfig';

const deleteTeacherLessonCall = httpsCallable(functions, 'deleteTeacherLesson');

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
