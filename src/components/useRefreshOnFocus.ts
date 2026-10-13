import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/** Jalankan fungsi tiap layar mendapat fokus (termasuk saat kembali dari layar lain). */
export function useRefreshOnFocus(fn: () => void) {
  const ref = useRef(fn);
  ref.current = fn;
  useFocusEffect(
    useCallback(() => {
      ref.current();
    }, [])
  );
}
