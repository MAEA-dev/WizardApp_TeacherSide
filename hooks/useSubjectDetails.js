import { useEffect, useMemo, useState } from 'react';
import {
  subscribeToGradeStudentCount,
  subscribeToSubjectCompletions,
  subscribeToSubject,
  subscribeToSubjectLessons,
} from '../services/teacherClasses';
import { buildSubjectStudents } from '../utils/subjectStudents';

export default function useSubjectDetails(subjectId) {
  const [subject, setSubject] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [gradeStudentCount, setGradeStudentCount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);
  const [isLoadingCompletions, setIsLoadingCompletions] = useState(true);
  const [gradeCountError, setGradeCountError] = useState('');
  const [completionsError, setCompletionsError] = useState('');
  const [error, setError] = useState('');
  const [lessonsError, setLessonsError] = useState('');

  useEffect(() => {
    if (!subjectId) {
      setError('Subject not found.');
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    setError('');
    const unsubscribe = subscribeToSubject(
      subjectId,
      (subjectDocument) => {
        setSubject(subjectDocument);
        setIsLoading(false);
        if (!subjectDocument) setError('Subject not found.');
      },
      (loadError) => {
        console.error('Unable to load subject:', loadError);
        setError(loadError.message || 'Unable to load this subject.');
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, [subjectId]);

  useEffect(() => {
    if (!subjectId) return undefined;

    setIsLoadingLessons(true);
    return subscribeToSubjectLessons(
      subjectId,
      (subjectLessons) => {
        setLessons(subjectLessons);
        setLessonsError('');
        setIsLoadingLessons(false);
      },
      (loadError) => {
        console.error('Unable to load subject lessons:', loadError);
        setLessonsError(loadError.message || 'Unable to load lessons.');
        setIsLoadingLessons(false);
      }
    );
  }, [subjectId]);

  useEffect(() => {
    if (!subject?.grade) {
      setGradeStudentCount(null);
      setGradeCountError('');
      return undefined;
    }

    setGradeStudentCount(null);
    setGradeCountError('');
    return subscribeToGradeStudentCount(
      subject.grade,
      setGradeStudentCount,
      (loadError) => {
        console.error('Unable to load grade student count:', loadError);
        setGradeStudentCount(null);
        setGradeCountError(loadError.message || 'Unable to load grade student count.');
      }
    );
  }, [subject?.grade]);

  useEffect(() => {
    if (!subjectId) return undefined;

    setCompletions([]);
    setIsLoadingCompletions(true);
    setCompletionsError('');
    return subscribeToSubjectCompletions(
      subjectId,
      (subjectCompletions) => {
        setCompletions(subjectCompletions);
        setCompletionsError('');
        setIsLoadingCompletions(false);
      },
      (loadError) => {
        console.error('Unable to load completed lessons:', loadError);
        setCompletionsError(loadError.message || 'Unable to load student performance.');
        setIsLoadingCompletions(false);
      }
    );
  }, [subjectId]);

  const students = useMemo(
    () => buildSubjectStudents(completions, lessons.length),
    [completions, lessons.length]
  );

  return {
    subject,
    lessons,
    completions,
    gradeStudentCount,
    isLoading,
    isLoadingLessons,
    isLoadingCompletions,
    gradeCountError,
    completionsError,
    error,
    lessonsError,
    students,
  };
}
