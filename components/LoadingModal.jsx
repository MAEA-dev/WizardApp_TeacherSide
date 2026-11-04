import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors } from '../constants/colors';

export default function LoadingModal({ visible, message = 'Loading...' }) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: 24,
  },
  card: {
    minWidth: 220,
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface || '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  message: {
    color: Colors.text || '#0B1F4B',
    fontSize: 15,
    fontWeight: '700',
  },
});
