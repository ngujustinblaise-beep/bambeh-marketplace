// @ts-nocheck
import React, { createContext, useContext, useRef } from "react";
import type { ReactNode } from "react";

interface Mark { name: string; startTime: number; duration?: number; }

interface PerformanceContextValue {
  startMark: (name: string) => void;
  endMark:   (name: string) => Mark | null;
  getMarks:  () => Mark[];
}

const PerformanceContext = createContext<PerformanceContextValue | null>(null);

export const PerformanceProvider = ({ children }: { children: ReactNode }): React.ReactElement => {
  const marks = useRef(new Map<string, Mark>());

  const startMark = (name: string): void => {
    marks.current.set(name, { name, startTime: performance.now() });
  };

  const endMark = (name: string): Mark | null => {
    const m = marks.current.get(name);
    if (!m) return null;
    m.duration = performance.now() - m.startTime;
    marks.current.set(name, m);
    return m;
  };

  const getMarks = (): Mark[] => Array.from(marks.current.values());

  return (
    <PerformanceContext.Provider value={{ startMark, endMark, getMarks }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => {
  const ctx = useContext(PerformanceContext);
  if (!ctx) throw new Error("usePerformance must be inside PerformanceProvider");
  return ctx;
};




