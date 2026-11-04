import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const subscribeToSubjectCardMetrics = (subjectId, grade, onMetrics, onError) => {
  const gradeValue = String(grade ?? '').trim();

  if (!subjectId || !gradeValue) {
    throw new Error('A subject and grade are required to load class metrics.');
  }

  const metrics = {
    studentCount: null,
    lessonCount: null,
    finishedLessonCount: null,
  };
  let lessons = null;
  let completedStudentsByLesson = new Map();

  const emitMetrics = () => {
    if (lessons === null) return;

    metrics.finishedLessonCount = Number.isInteger(metrics.studentCount) && metrics.studentCount > 0
      ? lessons.reduce(
          (count, lesson) =>
            count +
            (completedStudentsByLesson.get(lesson.id)?.size >= metrics.studentCount ? 1 : 0),
          0
        )
      : null;
    onMetrics({ ...metrics });
  };

  const unsubscribeStudentCount = onSnapshot(
    doc(db, 'studentCounts', `grade_${gradeValue}`),
    (snapshot) => {
      metrics.studentCount = snapshot.exists()
        ? Number(snapshot.data().count)
        : null;
      if (!Number.isFinite(metrics.studentCount)) metrics.studentCount = null;
      emitMetrics();
    },
    onError
  );
  const unsubscribeLessons = onSnapshot(
    query(collection(db, 'lessons'), where('subjectId', '==', subjectId)),
    (snapshot) => {
      lessons = snapshot.docs.map((lessonDoc) => ({ id: lessonDoc.id }));
      metrics.lessonCount = lessons.length;
      emitMetrics();
    },
    onError
  );
  const unsubscribeCompletions = onSnapshot(
    query(collection(db, 'completedLessons'), where('subjectId', '==', subjectId)),
    (snapshot) => {
      completedStudentsByLesson = new Map();
      snapshot.docs.forEach((completionDoc) => {
        const { lessonId, userId } = completionDoc.data();
        if (!lessonId || !userId) return;

        if (!completedStudentsByLesson.has(lessonId)) {
          completedStudentsByLesson.set(lessonId, new Set());
        }
        completedStudentsByLesson.get(lessonId).add(userId);
      });
      emitMetrics();
    },
    onError
  );

  return () => {
    unsubscribeStudentCount();
    unsubscribeLessons();
    unsubscribeCompletions();
  };
};

export const subscribeToGradeStudentCount = (grade, onCount, onError) => {
  const gradeValue = String(grade ?? '').trim();

  if (!gradeValue) {
    throw new Error('A grade is required to load its student count.');
  }

  return onSnapshot(
    doc(db, 'studentCounts', `grade_${gradeValue}`),
    (snapshot) => {
      const count = snapshot.exists() ? Number(snapshot.data().count) : null;
      onCount(Number.isFinite(count) ? count : null);
    },
    onError
  );
};
