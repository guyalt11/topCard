
import { useState, useCallback, useRef } from 'react';

export function useCardTimer() {
  const [timeSpent, setTimeSpent] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const timerIdRef = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    // Clear any existing timer
    if (timerIdRef.current !== null) {
      window.clearInterval(timerIdRef.current);
    }
    
    // Set the start time
    startTimeRef.current = Date.now();
    
    // Start a new timer that updates timeSpent every 100ms
    timerIdRef.current = window.setInterval(() => {
      if (startTimeRef.current) {
        setTimeSpent(prev => prev + 100);
      }
    }, 100);
  }, []);

  const stopTimer = useCallback(() => {
    // Clear the interval if it exists
    if (timerIdRef.current !== null) {
      window.clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    
    // Update the total time spent
    if (startTimeRef.current) {
      const additionalTime = Date.now() - startTimeRef.current;
      setTimeSpent(prev => prev + additionalTime);
      startTimeRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    // Clear any existing timer
    if (timerIdRef.current !== null) {
      window.clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    
    // Reset the time spent
    setTimeSpent(0);
    startTimeRef.current = null;
  }, []);

  return {
    timeSpent,
    startTimer,
    stopTimer,
    resetTimer
  };
}
