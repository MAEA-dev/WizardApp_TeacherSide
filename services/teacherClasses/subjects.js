import { doc, onSnapshot, collection } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

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
    onError
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
    onError
  );
