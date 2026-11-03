
import { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  ImageBackground,
} from 'react-native';

import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import Fontisto from '@expo/vector-icons/Fontisto';

import { Colors } from '../../constants/colors';
import { Nunito, Inter } from '../../constants/fonts';
import AnimatedView from '../../components/Animation/AnimatedView';
import useScreenAnimationKey from '../../hooks/useScreenAnimationKey';
import AnimatedText from '../../components/Animation/Animatedtext';






export default function Login() {
  
  const playKey = useScreenAnimationKey();
  const { width, height } = useWindowDimensions();

  const router = useRouter();

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';

    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const logoSize =  Math.min(width * 0.4, 145);;

  return (
    <ImageBackground
      source={require('../../assets/schoolBackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
      
          <View
            style={[styles.topSection, keyboardVisible && styles.topSectionCompact, {paddingTop: Math.min(height * 0.12, 100),}]} >
            {!keyboardVisible && (
              <View style={styles.welcomeRow}>
                <View style={styles.welcomeText}>
                  <AnimatedText animation='fadeIn' style={styles.welcomeTitle}  duration={1400}  delay={800} 
                       playKey={playKey}>
                    Welcome Teacher
                  </AnimatedText>

                  <AnimatedText animation='fadeIn' style={styles.welcomeSubtitle} duration={1400} delay={1400} playKey={playKey}>
                    Log in to upload lessons and track your class.
                  </AnimatedText>
                </View>
                <AnimatedView animation='zoomIn' duration={1400} playKey={playKey}>
                <Image
                  source={require('../../assets/logoGranby.png')}
                  style={[
                    styles.logo,
                    { width: logoSize, height: logoSize },
                  ]}
                  resizeMode="contain"
                />
                </AnimatedView>
              </View>
            )}
          </View>

          <AnimatedView animation='slideUp' duration={800} useSpring playKey={playKey} delay={200}>
                <View
            style={[
              styles.loginContainer,
              keyboardVisible && styles.loginContainerCompact,
            ]}
          >
            <Text style={styles.headerTitle}>Login</Text>

            <Text style={styles.registerPrompt}>
              Don't have an account?{' '}
              <Text
                style={styles.registerText}
                onPress={() => router.push('/register')}
              >
                Register
              </Text>
            </Text>

            <View style={styles.inputContainer}>
              <Fontisto
                name="email"
                size={22}
                color={Colors.neutral}
              />

              <TextInput
                style={styles.TextInput}
                placeholder="Email"
                placeholderTextColor={Colors.neutral}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputContainer}>
              <Feather
                name="lock"
                size={22}
                color={Colors.neutral}
              />

              <TextInput
                style={styles.TextInput}
                placeholder="Password"
                placeholderTextColor={Colors.neutral}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />
            </View>

            <TouchableOpacity
              onPress={() => router.push('/forgot-password')}
              style={styles.forgotPasswordButton}
            >
              <Text style={styles.forgetPassword}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <View style={styles.btnContainer}>
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.8}
                onPress={() => router.replace("/Screens/home")}
              >
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.8}
                onPress={() => router.push('/register')}
              >
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>

              
            </AnimatedView>
         

        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  screen: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: Colors.primaryLO,
  },

  scrollContent: {
    flexGrow: 1,
  },


  topSection: {
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
    minHeight: 150,
  },

  topSectionCompact: {
    flexGrow: 0,
    flexShrink: 0,
    minHeight: 100,
    padding: 0,
  },

  welcomeRow: {
    flexDirection: 'row',
    paddingLeft: 5,
    alignItems: 'center',
    width: '100%',  },

  welcomeText: {
    flexShrink: 1,
    minWidth: 0,
    alignItems: 'flex-start',

   
  },

  welcomeTitle: {
    fontFamily: Inter.bold,
    fontSize: 36,
    marginBottom: 6,
    color: Colors.surface,
    flexShrink: 1,

   textShadowColor: 'rgba(0, 0, 0, 0.5)',
   textShadowOffset: { width: 2, height: 3 },
   textShadowRadius: 4,


  },

  welcomeSubtitle: {
    fontSize: 16,
    fontFamily:"Nunito_500Medium",
    lineHeight: 22,
    color: Colors.surface,
    flexShrink: 1,

   textShadowColor: 'rgba(0, 0, 0, 0.5)',
   textShadowOffset: { width: 1, height: 3 },
   textShadowRadius: 2,
  },

  logo: {
    flexShrink: 0,
  },

  loginContainer: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    width: '100%',
  
    flexShrink: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  loginContainerCompact: {
    flexGrow: 1,
  },

  headerTitle: {
    marginBottom: 5,
    fontSize: 33,
    fontWeight: '800',
    textAlign: 'center',
    color: Colors.text,
  },

  registerPrompt: {
    fontSize: 15,
    marginBottom: 30,
    textAlign: 'center',
    color: Colors.text,
  },

  registerText: {
    color: Colors.primary,
    fontWeight: '600',
  },

  TextInput: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: Colors.text,
  },

  inputContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 15,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
  },

  forgotPasswordButton: {
    alignSelf: 'flex-end',
  },

  forgetPassword: {
    color: Colors.primary,
    textAlign: 'right',
    fontSize: 13,
  },

  btnContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },

  button: {
    flex: 1,
    minWidth: 0,
    minHeight: 45,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },

  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});
