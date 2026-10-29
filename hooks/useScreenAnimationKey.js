import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

export default function useScreenAnimationKey() {
  const [playKey, setPlayKey] = useState(0);
  const [hidden, setHidden] = useState(false);
  const timer = useRef(null);
  const firstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      clearTimeout(timer.current);
      setHidden(false);

    
      if (firstFocus.current) {
        firstFocus.current = false;
      } else {
        setPlayKey((k) => k + 1);
      }

      return () => {
        
        timer.current = setTimeout(() => setHidden(true), 400);
      };
    }, [])
  );

  return { playKey, hidden };
}