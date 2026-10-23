
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

export default function useScreenAnimationKey() {
  const [playKey, setPlayKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setPlayKey((previousKey) => previousKey + 1);
    }, [])
  );

  return playKey;
}
