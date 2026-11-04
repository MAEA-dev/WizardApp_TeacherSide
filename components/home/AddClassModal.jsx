import { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';

export default function AddClassModal({
  visible,
  onClose,
  onSubmit,
  isSaving,
  error,
}) {
  const [subjectName, setSubjectName] = useState('');
  const [grade, setGrade] = useState('');

  useEffect(() => {
    if (visible) {
      setSubjectName('');
      setGrade('');
    }
  }, [visible]);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={isSaving ? () => {} : onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Add a class</Text>
          <Text style={styles.label}>Subject</Text>
          <TextInput
            accessibilityLabel="Subject name"
            editable={!isSaving}
            onChangeText={setSubjectName}
            placeholder="Enter subject name"
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
            value={subjectName}
          />

          <Text style={styles.label}>Grade</Text>
          <TextInput
            accessibilityLabel="Grade"
            editable={!isSaving}
            keyboardType="number-pad"
            onChangeText={setGrade}
            placeholder="Enter grade level"
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
            value={grade}
          />

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.actions}>
            <TouchableOpacity
              disabled={isSaving}
              onPress={onClose}
              style={[styles.actionButton, styles.cancelButton]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={isSaving || !subjectName.trim() || !grade.trim()}
              onPress={() =>
                onSubmit({ subjectName: subjectName.trim(), grade: grade.trim() })
              }
              style={[
                styles.actionButton,
                styles.createButton,
                (isSaving || !subjectName.trim() || !grade.trim()) &&
                  styles.buttonDisabled,
              ]}
            >
              <Text style={styles.createText}>
                {isSaving ? 'Adding...' : 'Add class'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: 20,
  },
  card: {
    maxHeight: '90%',
    backgroundColor: Colors.surface,
    borderRadius: 22,
    padding: 20,
  },
  title: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  label: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 9,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
    borderRadius: 12,
    color: Colors.text,
    fontSize: 15,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  cancelButton: {
    backgroundColor: Colors.bg,
  },
  createButton: {
    backgroundColor: Colors.primary,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  cancelText: {
    color: Colors.text,
    fontWeight: '700',
  },
  createText: {
    color: Colors.surface,
    fontWeight: '700',
  },
});
