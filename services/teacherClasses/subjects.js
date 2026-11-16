import { doc, onSnapshot, collection } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { shouldIgnoreSignedOutPermissionError } from '../clientErrors';

const handleSnapshotError = (onError) => (error) => {
  if (shouldIgnoreSignedOutPermissionError(error, Boolean(auth.currentUser))) return;
  onError?.(error);
};

const getSubjectsCollection = () => {
  if (!auth.currentUser?.uid) {
    throw new Error('You must be signed in to view subjects.');
  }

  return collection(db, 'subjects');
};

const mapSubjectDocument = (subjectDoc) => {
  const subjectData = subjectDoc.data();

  return {
    id: subjectDoc.id,
    ...subjectData,
    name: subjectData.subjectName,
    grade: Number(subjectData.gradeLevel),
    lessonCounts: Number(subjectData.lessonCounts) || 0,
  };
};

export const subscribeToSubjects = (onSubjects, onError) =>
  onSnapshot(
    getSubjectsCollection(),
    async (snapshot) => {
      try {
        const subjects = snapshot.docs.map(mapSubjectDocument);
        onSubjects(subjects);
      } catch (error) {
        onError(error);
      }
    },
    handleSnapshotError(onError)
  );

export const subscribeToSubject = (subjectId, onSubject, onError) =>
  onSnapshot(
    doc(db, 'subjects', subjectId),
    async (snapshot) => {
      try {
        onSubject(snapshot.exists() ? mapSubjectDocument(snapshot) : null);
      } catch (error) {
        onError(error);
      }
    },
    handleSnapshotError(onError)
  );
