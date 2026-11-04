import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

const subscribeToCompletedLessonQuery = (completedLessonsQuery, onCompletions, onError) => {
  let isActive = true;
  let revision = 0;
  const unsubscribe = onSnapshot(
    completedLessonsQuery,
    async (snapshot) => {
      const currentRevision = ++revision;

      try {
        const completionDocs = snapshot.docs.map((completionDoc) => ({
          id: completionDoc.id,
          ...completionDoc.data(),
        }));
        const studentIds = [
          ...new Set(completionDocs.map(({ userId }) => userId).filter(Boolean)),
        ];
        const studentProfiles = await Promise.all(
          studentIds.map(async (studentId) => {
            const studentSnapshot = await getDoc(doc(db, 'users', studentId));
            const studentData = studentSnapshot.exists() ? studentSnapshot.data() : {};
            const profile = studentData.profile || {};
            const name = [profile.firstName, profile.lastName]
              .filter(Boolean)
              .join(' ')
              .trim();

            return [
              studentId,
              {
                name,
                level: studentData.level,
                xp: studentData.xp,
              },
            ];
          })
        );
        const profilesById = new Map(studentProfiles);

        if (!isActive || currentRevision !== revision) return;

        onCompletions(
          completionDocs.map((completion) => {
            const studentProfile = profilesById.get(completion.userId) || {};
            return {
              ...completion,
              studentId: completion.userId,
              studentName: studentProfile.name || 'Student',
              studentProfile,
            };
          })
        );
      } catch (error) {
        if (isActive && currentRevision === revision) onError(error);
      }
    },
    onError
  );

  return () => {
    isActive = false;
    unsubscribe();
  };
};

export const subscribeToSubjectCompletions = (subjectId, onCompletions, onError) =>
  subscribeToCompletedLessonQuery(
    query(collection(db, 'completedLessons'), where('subjectId', '==', subjectId)),
    onCompletions,
    onError
  );

export const subscribeToLessonCompletions = (lessonId, onCompletions, onError) =>
  subscribeToCompletedLessonQuery(
    query(collection(db, 'completedLessons'), where('lessonId', '==', lessonId)),
    onCompletions,
    onError
  );
