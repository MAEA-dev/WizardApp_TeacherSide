import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

export default function useScreenAnimationKey() {
  const [playKey, setPlayKey] = useState(0);
  const hasFocused = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (hasFocused.current) {
        setPlayKey((key) => key + 1);
      } else {
        hasFocused.current = true;
      }
    }, [])
  );

  return { playKey, hidden: false };
}