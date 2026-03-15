import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const StartupLoadingContext = createContext(null);

const clampProgress = (value) => {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.max(0, Math.min(100, numeric));
};

export function StartupLoadingProvider({ children }) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const frameRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    const totalDuration = 3000;

    const tick = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const nextProgress = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(nextProgress);

      if (nextProgress >= 100) {
        setProgress(100);
        setIsVisible(false);
        return;
      }

      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isVisible]);

  const setTaskProgress = useCallback((nextProgress) => {
    const safeProgress = clampProgress(nextProgress);
    setProgress((current) => Math.max(current, safeProgress));
  }, []);

  const markAppReady = useCallback(() => {}, []);

  const value = useMemo(
    () => ({
      progress,
      displayProgress: Math.round(progress),
      isLoading: isVisible,
      isVisible,
      isExiting: false,
      markAppReady,
      setTaskProgress,
    }),
    [isVisible, markAppReady, progress, setTaskProgress],
  );

  return <StartupLoadingContext.Provider value={value}>{children}</StartupLoadingContext.Provider>;
}

export function useStartupLoading() {
  const context = useContext(StartupLoadingContext);

  if (!context) {
    throw new Error('useStartupLoading must be used inside StartupLoadingProvider.');
  }

  return context;
}
