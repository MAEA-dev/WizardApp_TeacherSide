export const getScore = (completion) => {
  const percentage = Number(completion.percentage);
  if (
    completion.percentage !== null &&
    completion.percentage !== undefined &&
    completion.percentage !== '' &&
    Number.isFinite(percentage)
  ) {
    return Math.max(0, Math.min(percentage, 100));
  }

  const correct = Number(completion.correctAnswers);
  const total = Number(completion.totalQuestions);
  return total > 0 && Number.isFinite(correct)
    ? Math.max(0, Math.min((correct / total) * 100, 100))
    : null;
};

export const getQuarter = (lesson) => {
  const quarter = Number(lesson.quarter);
  return Number.isInteger(quarter) && quarter >= 1 && quarter <= 4 ? quarter : null;
};

export const getLessonIdsByQuarter = (lessons) => {
  const map = new Map();
  lessons.forEach((lesson) => {
    const quarter = getQuarter(lesson);
    if (!quarter) return;
    if (!map.has(quarter)) map.set(quarter, new Set());
    map.get(quarter).add(lesson.id);
  });
  return map;
};

export const filterCompletionsByQuarter = (
  completions,
  lessonIdsByQuarter,
  selectedQuarter
) => {
  if (selectedQuarter === 'all') return completions;
  const lessonIds = lessonIdsByQuarter.get(selectedQuarter) || new Set();
  return completions.filter((completion) => lessonIds.has(completion.lessonId));
};

export const getStudentAverageScores = (quarterCompletions) => {
  const byStudent = new Map();
  quarterCompletions.forEach((completion) => {
    const score = getScore(completion);
    if (!completion.studentId || score === null) return;
    if (!byStudent.has(completion.studentId)) byStudent.set(completion.studentId, []);
    byStudent.get(completion.studentId).push(score);
  });
  return [...byStudent.values()].map((scores) =>
    scores.reduce((sum, score) => sum + score, 0) / scores.length
  );
};

export const getAnswerCounts = (quarterCompletions) => ({
  correctAnswerCount: quarterCompletions.reduce(
    (sum, completion) => sum + Math.max(0, Number(completion.correctAnswers) || 0),
    0
  ),
  totalAnswerCount: quarterCompletions.reduce(
    (sum, completion) => sum + Math.max(0, Number(completion.totalQuestions) || 0),
    0
  ),
});

export const getAverageDurationSeconds = (completions) => {
  const durations = completions
    .map(({ durationSeconds }) => {
      if (durationSeconds === null || durationSeconds === undefined || durationSeconds === '') {
        return null;
      }

      const duration = Number(durationSeconds);
      return Number.isFinite(duration) && duration >= 0 ? duration : null;
    })
    .filter((duration) => duration !== null);

  return durations.length
    ? Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length)
    : null;
};

export const getMostMissedQuestions = (quarterCompletions) => {
  const questionStats = new Map();
  quarterCompletions.forEach((completion) => {
    if (!Array.isArray(completion.answerDetails)) return;
    completion.answerDetails.forEach((answer) => {
      const question = String(answer.question || '').trim();
      if (!question) return;
      const stats = questionStats.get(question) || { attempts: 0, incorrect: 0 };
      stats.attempts += 1;
      if (answer.isCorrect !== true && answer.result !== 'correct') stats.incorrect += 1;
      questionStats.set(question, stats);
    });
  });

  return [...questionStats.entries()]
    .map(([question, stats]) => ({
      question,
      incorrectPercent: Math.round((stats.incorrect / stats.attempts) * 100),
    }))
    .sort((a, b) => b.incorrectPercent - a.incorrectPercent)
    .map((item) => ({ ...item, id: item.question }));
};

export const getCompletedLessonCount = (lessons, completions, gradeStudentCount) => {
  if (!Number.isInteger(gradeStudentCount) || gradeStudentCount <= 0) return null;

  const completionsByLesson = new Map();
  completions.forEach(({ lessonId, studentId }) => {
    if (!lessonId || !studentId) return;
    if (!completionsByLesson.has(lessonId)) completionsByLesson.set(lessonId, new Set());
    completionsByLesson.get(lessonId).add(studentId);
  });

  return lessons.filter(
    (lesson) => (completionsByLesson.get(lesson.id)?.size || 0) >= gradeStudentCount
  ).length;
};
