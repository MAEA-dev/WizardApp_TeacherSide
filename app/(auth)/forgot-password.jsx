import { useState } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import LoadingModal from '../../components/LoadingModal';
import { Colors } from '../../constants/colors';
import { getAuthErrorMessage, sendPasswordReset } from '../../services/firebaseAuth';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = async () => {
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (resetError) {
      setError(getAuthErrorMessage(resetError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/schoolBackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/login')}>
              <Feather name="arrow-left" size={20} color={Colors.primary} />
              <Text style={styles.backText}>Back to login</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Forgot password?</Text>
            <Text style={styles.description}>
              {sent
                ? 'If an account uses this email, you’ll receive a link to reset your password.'
                : 'Enter the email address linked to your account and we’ll send you a password reset link.'}
            </Text>

            {!sent && (
              <>
                <View style={styles.inputContainer}>
                  <Feather name="mail" size={20} color={Colors.neutral} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor={Colors.neutral}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="send"
                    onSubmitEditing={handleReset}
                  />
                </View>
                {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
                <TouchableOpacity
                  style={styles.button}
                  activeOpacity={0.8}
                  onPress={handleReset}
                  disabled={isSubmitting}
                >
                  <Text style={styles.buttonText}>Send reset link</Text>
                </TouchableOpacity>
              </>
            )}

            {sent && (
              <TouchableOpacity style={styles.button} onPress={() => router.replace('/login')}>
                <Text style={styles.buttonText}>Return to login</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <LoadingModal visible={isSubmitting} message="Sending reset link..." />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  screen: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  backButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 8, paddingVertical: 8 },
  backText: { color: Colors.primary, fontWeight: '600' },
  title: { marginTop: 16, marginBottom: 8, fontSize: 28, fontWeight: '800', textAlign: 'center', color: Colors.text },
  description: { marginBottom: 24, fontSize: 15, lineHeight: 22, textAlign: 'center', color: Colors.textMuted },
  inputContainer: {
    minHeight: 50,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 15,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: { flex: 1, minWidth: 0, paddingVertical: 8, color: Colors.text },
  error: { color: Colors.danger, fontSize: 13, marginBottom: 12 },
  button: { minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, marginTop: 8 },
  buttonText: { color: Colors.surface, fontWeight: '700' },
});
