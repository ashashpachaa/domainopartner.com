import { useState, useEffect, useCallback, useRef } from "react";

interface AttendanceTimerState {
  isWorking: boolean;
  showPopup: boolean;
  timeRemaining: number; // seconds remaining to approve
  lastActivityTime: number;
  confirmationCount: number;
  missedCount: number;
}

export function useAttendanceTimer(staffId: string | null, workingHours?: { startTime: string; endTime: string }) {
  const [state, setState] = useState<AttendanceTimerState>({
    isWorking: false,
    showPopup: false,
    timeRemaining: 120, // 2 minutes
    lastActivityTime: Date.now(),
    confirmationCount: 0,
    missedCount: 0,
  });

  const nextCheckTimeRef = useRef<number>(0);
  const popupTimerRef = useRef<NodeJS.Timeout>();
  const inactivityTimerRef = useRef<NodeJS.Timeout>();
  const approvalTimerRef = useRef<NodeJS.Timeout>();

  // Generate random interval (in milliseconds) between checks
  // Options: 10min, 15min, 25min, 40min, 1hour, 2hour
  const generateRandomInterval = useCallback((): number => {
    const intervals = [
      10 * 60 * 1000,    // 10 minutes
      15 * 60 * 1000,    // 15 minutes
      25 * 60 * 1000,    // 25 minutes
      40 * 60 * 1000,    // 40 minutes
      60 * 60 * 1000,    // 1 hour
      120 * 60 * 1000,   // 2 hours
    ];
    return intervals[Math.floor(Math.random() * intervals.length)];
  }, []);

  // Check if currently within working hours
  const isWithinWorkingHours = useCallback((): boolean => {
    if (!workingHours) return true; // If no hours set, assume always working

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    return currentTime >= workingHours.startTime && currentTime <= workingHours.endTime;
  }, [workingHours]);

  // Start the popup timer
  const scheduleNextPopup = useCallback(() => {
    // Clear existing timers
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

    // Only schedule if within working hours
    if (!isWithinWorkingHours()) return;

    const nextInterval = generateRandomInterval();
    nextCheckTimeRef.current = Date.now() + nextInterval;

    popupTimerRef.current = setTimeout(() => {
      if (isWithinWorkingHours()) {
        setState((prev) => ({
          ...prev,
          showPopup: true,
          timeRemaining: 120, // 2 minutes in seconds
        }));

        // Start approval countdown
        startApprovalCountdown();
      } else {
        // Outside working hours, reschedule
        scheduleNextPopup();
      }
    }, nextInterval);
  }, [generateRandomInterval, isWithinWorkingHours]);

  // Start the 2-minute countdown
  const startApprovalCountdown = useCallback(() => {
    if (approvalTimerRef.current) clearInterval(approvalTimerRef.current);

    approvalTimerRef.current = setInterval(() => {
      setState((prev) => {
        const newTimeRemaining = prev.timeRemaining - 1;

        // If time is up, mark as missed
        if (newTimeRemaining <= 0) {
          if (approvalTimerRef.current) clearInterval(approvalTimerRef.current);
          setState((p) => ({
            ...p,
            showPopup: false,
            isWorking: false, // Mark as inactive
            missedCount: p.missedCount + 1,
          }));
          scheduleNextPopup();
          return prev;
        }

        return { ...prev, timeRemaining: newTimeRemaining };
      });
    }, 1000);
  }, [scheduleNextPopup]);

  // Approve attendance
  const approveAttendance = useCallback(() => {
    if (approvalTimerRef.current) clearInterval(approvalTimerRef.current);

    setState((prev) => ({
      ...prev,
      showPopup: false,
      isWorking: true,
      confirmationCount: prev.confirmationCount + 1,
      lastActivityTime: Date.now(),
    }));

    // Schedule next popup
    scheduleNextPopup();
  }, [scheduleNextPopup]);

  // Record activity (mouse move, keyboard, etc.)
  const recordActivity = useCallback(() => {
    setState((prev) => ({
      ...prev,
      lastActivityTime: Date.now(),
    }));

    // Only reschedule if popup is not currently showing
    setState((prev) => {
      if (!prev.showPopup) {
        // Reset the next check time
        scheduleNextPopup();
      }
      return prev;
    });
  }, [scheduleNextPopup]);

  // Initialize when component mounts
  useEffect(() => {
    if (!staffId) return;

    // Check if within working hours on mount
    if (isWithinWorkingHours()) {
      setState((prev) => ({ ...prev, isWorking: true }));
      scheduleNextPopup();
    }

    // Add activity listeners
    const handleActivity = () => recordActivity();

    window.addEventListener("mousemove", handleActivity, { once: true });
    window.addEventListener("keydown", handleActivity, { once: true });
    window.addEventListener("click", handleActivity, { once: true });

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);

      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (approvalTimerRef.current) clearInterval(approvalTimerRef.current);
    };
  }, [staffId, isWithinWorkingHours, scheduleNextPopup, recordActivity]);

  return {
    ...state,
    approveAttendance,
    recordActivity,
  };
}
