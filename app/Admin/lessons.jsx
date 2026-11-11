import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import {
  AdminCard,
  AdminColors,
  AdminShell,
  AdminText,
} from '../../components/admin/AdminShell';
import { Inter } from '../../constants/fonts';
import { deleteTeacherLesson, subscribeToAllLessons } from '../../services/teacherClasses';

const formatDate = (date) => {
  const value = date?.toDate?.();
  return value ? value.toLocaleDateString() : 'Date unavailable';
};

export default function AdminLessons() {
  const router = useRouter();
  const [lessons, setLessons] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingLessonId, setDeletingLessonId] = useState('');

  useEffect(() => subscribeToAllLessons(
    (items) => {
      setLessons(items);
      setIsLoading(false);
      setError('');
    },
    (loadError) => {
      console.error('Unable to load admin lessons:', loadError);
      setError(loadError.message || 'Unable to load lessons.');
      setIsLoading(false);
    }
  ), []);

  const filteredLessons = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return lessons;
    return lessons.filter((lesson) =>
      [lesson.title, lesson.subjectName, lesson.gradeLevel, lesson.createdBy]
        .some((value) => String(value || '').toLowerCase().includes(needle))
    );
  }, [lessons, search]);

  const removeLesson = async (lesson) => {
    if (deletingLessonId) return;
    setDeletingLessonId(lesson.id);
    setError('');
    try {
      await deleteTeacherLesson(lesson.id);
      setLessons((previous) => previous.filter((item) => item.id !== lesson.id));
    } catch (deleteError) {
      console.error('Unable to delete admin lesson:', deleteError);
      setError(deleteError.message || 'Unable to delete this lesson.');
    } finally {
      setDeletingLessonId('');
    }
  };

  const confirmDelete = (lesson) => Alert.alert(
    'Delete lesson?',
    `Delete “${lesson.title}” and its student completion records? This cannot be undone.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeLesson(lesson) },
    ]
  );

  return (
    <AdminShell activeTab="lessons" title="Lesson management">
      <View style={styles.content}>
        <AdminCard style={styles.searchCard}>
          <Feather name="search" size={17} color={AdminColors.muted} />
          <TextInput
            accessibilityLabel="Search lessons"
            onChangeText={setSearch}
            placeholder="Search lessons or subjects"
            placeholderTextColor={AdminColors.muted}
            style={styles.searchInput}
            value={search}
          />
        </AdminCard>

        {!!error && <AdminText accessibilityRole="alert" style={styles.error}>{error}</AdminText>}
        {isLoading ? (
          <ActivityIndicator color={AdminColors.primary} style={styles.loading} />
        ) : (
          <FlatList
            data={filteredLessons}
            keyExtractor={(lesson) => lesson.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={(
              <AdminText style={styles.empty}>
                {error ? 'Lessons could not be loaded.' : 'No lessons found.'}
              </AdminText>
            )}
            renderItem={({ item }) => (
              <AdminCard style={styles.lessonCard}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Edit lesson ${item.title}`}
                  disabled={Boolean(deletingLessonId)}
                  onPress={() => router.push({
                    pathname: '/subject/[id]/[lessonId]',
                    params: { id: item.subjectId || '', lessonId: item.id, admin: '1' },
                  })}
                  style={styles.lessonDetails}
                >
                  <View style={styles.titleRow}>
                    <AdminText numberOfLines={1} style={styles.lessonTitle}>{item.title}</AdminText>
                    <AdminText style={item.isPublished ? styles.published : styles.review}>
                      {item.isPublished ? 'Published' : 'For review'}
                    </AdminText>
                  </View>
                  <AdminText numberOfLines={1} style={styles.subtitle}>
                    {item.subjectName || 'Unknown subject'} · Grade {item.gradeLevel || '?'}
                  </AdminText>
                  <AdminText style={styles.date}>Uploaded {formatDate(item.createdAt)}</AdminText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${item.title}`}
                  disabled={Boolean(deletingLessonId)}
                  onPress={() => router.push({
                    pathname: '/subject/[id]/[lessonId]',
                    params: { id: item.subjectId || '', lessonId: item.id, admin: '1' },
                  })}
                  style={styles.iconButton}
                >
                  <Feather name="edit-2" size={17} color={AdminColors.primary} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${item.title}`}
                  disabled={Boolean(deletingLessonId)}
                  onPress={() => confirmDelete(item)}
                  style={styles.iconButton}
                >
                  {deletingLessonId === item.id ? (
                    <ActivityIndicator size="small" color="#B42318" />
                  ) : (
                    <Feather name="trash-2" size={17} color="#B42318" />
                  )}
                </Pressable>
              </AdminCard>
            )}
          />
        )}
      </View>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, gap: 10 },
  searchCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
    paddingVertical: 7,
  },
  searchInput: {
    color: AdminColors.text,
    flex: 1,
    fontFamily: Inter.regular,
    fontSize: 13,
    minHeight: 34,
    padding: 0,
  },
  list: { gap: 8, paddingBottom: 12 },
  lessonCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 12,
  },
  lessonDetails: { flex: 1, gap: 3, minWidth: 0 },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  lessonTitle: { flex: 1, fontFamily: Inter.semiBold, fontSize: 13 },
  subtitle: { color: AdminColors.muted, fontFamily: Inter.medium, fontSize: 11 },
  date: { color: AdminColors.muted, fontFamily: Inter.regular, fontSize: 10 },
  published: { color: '#08785E', fontFamily: Inter.semiBold, fontSize: 10 },
  review: { color: '#A64B0A', fontFamily: Inter.semiBold, fontSize: 10 },
  iconButton: { alignItems: 'center', height: 36, justifyContent: 'center', width: 32 },
  loading: { marginTop: 30 },
  empty: { color: AdminColors.muted, padding: 20, textAlign: 'center' },
  error: { color: '#B42318', fontSize: 12 },
});
