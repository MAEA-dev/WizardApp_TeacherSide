import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const getSubjectsCollection = () => {
  if (!auth.currentUser?.uid) {
    throw new Error('You must be signed in to manage classes.');
  }

  return collection(db, 'subjects');
};

export const addTeacherClass = async ({ subjectName, grade }) => {
  const teacherId = auth.currentUser?.uid;

  if (!teacherId) {
    throw new Error('You must be signed in to manage classes.');
  }

  const subjectData = {
    teacher: teacherId,
    subjectName: subjectName.trim(),
    gradeLevel: String(grade),
    lessonCounts: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const subjectRef = await addDoc(collection(db, 'subjects'), subjectData);

  return {
    id: subjectRef.id,
    ...subjectData,
    name: subjectData.subjectName,
    grade: Number(subjectData.gradeLevel),
    lessonCounts: subjectData.lessonCounts,
  };
};

const mapSubjectDocument = async (subjectDoc) => {
  const subjectData = subjectDoc.data();
  let createdBy = '';
  let teacherProfile = null;

  if (subjectData.teacher) {
    const teacherSnap = await getDoc(doc(db, 'users', subjectData.teacher));
    const teacherData = teacherSnap.exists() ? teacherSnap.data() : null;
    teacherProfile = teacherData?.profile || null;
    createdBy = [teacherProfile?.firstName, teacherProfile?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
  }

  return {
    id: subjectDoc.id,
    ...subjectData,
    name: subjectData.subjectName,
    grade: Number(subjectData.gradeLevel),
    lessonCounts: Number(subjectData.lessonCounts) || 0,
    createdBy,
    teacherProfile,
  };
};

export const subscribeToSubjects = (onSubjects, onError) =>
  onSnapshot(
    getSubjectsCollection(),
    async (snapshot) => {
      try {
        const subjects = await Promise.all(snapshot.docs.map(mapSubjectDocument));
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
        onSubject(snapshot.exists() ? await mapSubjectDocument(snapshot) : null);
      } catch (error) {
        onError(error);
      }
    },
    onError
  );
