
import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  useWindowDimensions
} from 'react-native';

import { useState } from 'react';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Colors } from '../../constant/colors';
import AnimatedView from "../../components/Animation/AnimatedView"
import useScreenAnimationKey from '../../hooks/useScreenAnimationKey';
export default function Register() {
  const { width, height } = useWindowDimensions();
  const logoSize =  Math.min(width * 0.24, 80); 
  const playKey = useScreenAnimationKey();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = () => {
    setError('');

    if (
      !fullName.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError('Please complete all fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

   
    setError('Registration is not connected yet.');
  };

  return (
    <ImageBackground
      style={styles.background}
      source={require('../../assets/schoolBackground.png')}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
                <AnimatedView animation='zoomIn' duration={1000} delay={1000} playKey={playKey} >
                    <Image source={require('../../assets/logoGranby.png')} style={[{width: logoSize, height: logoSize}]}  resizeMode='contain'/>
              </AnimatedView>
              <AnimatedView animation='fadeIn' duration={1400} delay={800} style={styles.headerText} playKey={playKey}>
                <Text style={styles.welcomeText}>Get started building you Lessons.</Text>
              </AnimatedView>
              
            </View>

           <AnimatedView animation='slideUp' duration={800} useSpring playKey={playKey} delay={200}>     
            <View style={styles.registerCard}>
              <View style={styles.cardHeading}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.description}>
                  Fill in your details to get started.
                </Text>
              </View>

           
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="user"
                  size={19}
                  color={Colors.textMuted}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

           
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="at-sign"
                  size={19}
                  color={Colors.textMuted}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Choose a username"
                  placeholderTextColor={Colors.textMuted}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

         
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="mail"
                  size={19}
                  color={Colors.textMuted}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

         
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="lock"
                  size={19}
                  color={Colors.textMuted}
                />
                <TextInput
                  style={styles.input}
                  placeholder="At least 8 characters"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />

                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  accessibilityLabel={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={19}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="shield"
                  size={19}
                  color={Colors.textMuted}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter your password"
                  placeholderTextColor={Colors.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  accessibilityLabel={
                    showConfirmPassword
                      ? 'Hide confirm password'
                      : 'Show confirm password'
                  }
                >
                  <Feather
                    name={
                      showConfirmPassword ? 'eye-off' : 'eye'
                    }
                    size={19}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              
              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
                activeOpacity={0.85}
              >
                <Text style={styles.registerButtonText}>
                  Create Account
                </Text>
                <Feather
                  name="arrow-right"
                  size={19}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              <View style={styles.loginRow}>
                <Text style={styles.loginText}>
                  Already have an account?
                </Text>

                <TouchableOpacity
                  onPress={() => router.replace('/login')}
                >
                  <Text style={styles.loginLink}> Sign in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </AnimatedView>
        </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: Colors.primaryLO || '#0B1F4B55',
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 28,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 10,
    gap: 5,
    marginBottom: 22
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerText: {
    flex: 1,
    minWidth: 0
  },

  welcomeText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    flexShrink: 1,

   textShadowColor: 'rgba(0, 0, 0, 0.5)',
   textShadowOffset: { width: 2, height: 3 },
   textShadowRadius: 4,
  },

  subtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 4,
  },

  registerCard: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: Colors.surface || '#FFFFFF',
    borderRadius: 28,
    padding: 22,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  cardHeading: {
    marginBottom: 18,
  },

  title: {
    color: Colors.text || '#0B1F4B',
    fontSize: 27,
    fontWeight: '800',
  },

  description: {
    color: Colors.textMuted || '#64748B',
    fontSize: 14,
    marginTop: 5,
  },

  label: {
    color: Colors.text || '#0B1F4B',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 7,
    marginTop: 12,
  },

  inputContainer: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border || '#DCE4F2',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 10,
  },

  input: {
    flex: 1,
    minWidth: 0,
    color: Colors.text || '#0B1F4B',
    fontSize: 15,
    paddingVertical: 12,
  },

  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 12,
  },

  registerButton: {
    minHeight: 54,
    backgroundColor: Colors.primary || '#1D4ED8',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 22,
  },

  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 20,
  },

  loginText: {
    color: Colors.textMuted || '#64748B',
    fontSize: 14,
  },

  loginLink: {
    color: Colors.primary || '#1D4ED8',
    fontSize: 14,
    fontWeight: '800',
  },

  footerText: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 18,
  },
});
