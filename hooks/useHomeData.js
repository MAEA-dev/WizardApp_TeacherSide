import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import { subscribeToSubjects } from '../services/teacherClasses';

export default function useHomeData() {
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [classesError, setClassesError] = useState('');
  const [teacherProfile, setTeacherProfile] = useState({
    name: '',
    gender: '',
    email: '',
  });
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    let unsubscribeProfile;
    let isActive = true;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeProfile?.();
      setProfileError('');
      setTeacherProfile({
        name: '',
        gender: '',
        email: user?.email || '',
      });

      if (!user) {
        setProfileError('Please sign in to load your teacher profile.');
        return;
      }

      unsubscribeProfile = onSnapshot(
        doc(db, 'users', user.uid),
        (snapshot) => {
          if (!isActive) return;
          if (!snapshot.exists()) {
            setProfileError('Teacher profile was not found.');
            return;
          }

          const userData = snapshot.data();
          const profile = userData.profile || {};
          setTeacherProfile({
            name: [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim(),
            gender: profile.gender || '',
            email: user.email || userData.email || '',
          });
          setProfileError('');
        },
        (error) => {
          console.error('Unable to load teacher profile:', error);
          if (isActive) {
            setProfileError(error.message || 'Unable to load teacher profile.');
          }
        }
      );
    });

    return () => {
      isActive = false;
      unsubscribeAuth();
      unsubscribeProfile?.();
    };
  }, []);

  useEffect(() => {
    try {
      return subscribeToSubjects(
        (subjects) => {
          setTeacherClasses(subjects);
          setIsLoadingClasses(false);
          setClassesError('');
        },
        (error) => {
          console.error('Unable to load teacher classes:', error);
          setClassesError(error.message || 'Please try again later.');
          setIsLoadingClasses(false);
          Alert.alert(
            'Unable to load classes',
            error.message || 'Please try again later.'
          );
        }
      );
    } catch (error) {
      console.error('Unable to subscribe to teacher classes:', error);
      setClassesError(error.message || 'Please sign in again.');
      setIsLoadingClasses(false);
      Alert.alert(
        'Unable to load classes',
        error.message || 'Please sign in again.'
      );
    }
  }, []);

  return {
    teacherClasses,
    isLoadingClasses,
    classesError,
    teacherProfile,
    profileError,
  };
}
