import { useState, useEffect, useRef } from 'react';
import type { SaveStatus } from '../types';

export function useAutoSave<T>({ key, data, debounceMs = 2000 }: { key: string; data: T; debounceMs?: number }) {
  const [status, setStatus] = useState<SaveStatus>('saved');
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus('unsaved');
    timeoutRef.current = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(data));
      setStatus('saved');
    }, debounceMs);
    return () => clearTimeout(timeoutRef.current);
  }, [data, key, debounceMs]);

  return { status };
}
