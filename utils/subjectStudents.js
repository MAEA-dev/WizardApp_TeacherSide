import { getCompletionTimestamp, isStudentAtRisk, isStudentInactive } from './studentActivity';

const getCompletionPercentage = (completion) => {
  if (
    completion.percentage !== null &&
    completion.percentage !== undefined &&
    completion.percentage !== ''
  ) {
    const percentage = Number(completion.percentage);
    if (Number.isFinite(percentage)) return percentage;
  }

  const correct = Number(completion.correctAnswers);
  const total = Number(completion.totalQuestions);
  return total > 0 && Number.isFinite(correct) ? (correct / total) * 100 : null;
};

export const buildSubjectStudents = (completions, lessonCount) => {
  const studentsById = new Map();

  completions.forEach((completion) => {
    if (!completion.studentId) return;

    if (!studentsById.has(completion.studentId)) {
      studentsById.set(completion.studentId, {
        id: completion.studentId,
        name: completion.studentName,
        level: completion.studentProfile?.level,
        exp: completion.studentProfile?.xp,
        lessonsById: new Map(),
        lastActiveAt: null,
      });
    }

    const student = studentsById.get(completion.studentId);
    if (completion.lessonId) student.lessonsById.set(completion.lessonId, completion);
    const completionTime = getCompletionTimestamp(completion.completedAt);
    if (completionTime !== null) {
      student.lastActiveAt = Math.max(student.lastActiveAt ?? completionTime, completionTime);
    }
  });

  return [...studentsById.values()].map((student) => {
    const studentCompletions = [...student.lessonsById.values()];
    const scores = studentCompletions
      .map(getCompletionPercentage)
      .filter((score) => score !== null);

    const averageScore = scores.length
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : null;
    const isInactive = isStudentInactive(student.lastActiveAt);
    const isAtRisk = isStudentAtRisk(averageScore, student.lastActiveAt);

    return {
      ...student,
      completedLessonCount: studentCompletions.length,
      averageScore,
      status: averageScore === null && !isInactive
        ? null
        : isAtRisk
          ? 'atRisk'
          : 'onTrack',
      progress: lessonCount
        ? Math.min(studentCompletions.length / lessonCount, 1)
        : 0,
    };
  });
};
