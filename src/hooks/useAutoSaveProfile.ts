/**
 * ════════════════════════════════════════════════════════════════
 * src/hooks/useAutoSaveProfile.ts
 * Auto-save Profile Hook — Issue 2 Fix
 *
 * Saves profile data automatically 1.5s after user stops typing.
 * When they click "Save" button: shows "✅ All saved!" message
 * then navigates back to profile.
 *
 * USAGE in EditProfile.tsx or Profile.tsx:
 *
 *   import { useAutoSaveProfile } from '@/hooks/useAutoSaveProfile';
 *
 *   const {
 *     formData, setField, saveStatus,
 *     handleManualSave, isDirty
 *   } = useAutoSaveProfile(initialProfileData, userId);
 *
 *   // In your input:
 *   <input
 *     value={formData.displayName}
 *     onChange={e => setField('displayName', e.target.value)}
 *   />
 *
 *   // Save button:
 *   <button onClick={handleManualSave}>
 *     {saveStatus === 'saving' ? 'Saving...' : 'Save Profile'}
 *   </button>
 *   {saveStatus === 'saved' && <p>✅ All saved! Returning to profile...</p>}
 *
 * © 2026 BAMBEH SARL / Bambeh. All rights reserved.
 * ════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface ProfileData {
  displayName: string;
  phone: string;
  bio: string;
  location: string;
  profilePhoto: string;
  [key: string]: unknown;
}

interface UseAutoSaveProfileReturn {
  formData: ProfileData;
  setField: (key: keyof ProfileData, value: string) => void;
  saveStatus: SaveStatus;
  isDirty: boolean;
  handleManualSave: () => Promise<void>;
  lastSavedAt: Date | null;
}

/**
 * @param initial   — The initial profile data loaded from your auth context / Supabase
 * @param userId    — Current user ID (used as localStorage key)
 * @param onSave    — Optional async function to persist to backend (Supabase, Firebase, etc.)
 */
export function useAutoSaveProfile(
  initial: ProfileData,
  userId: string,
  onSave?: (data: ProfileData) => Promise<void>,
): UseAutoSaveProfileReturn {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProfileData>(initial);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  useEffect(
    () => () => {
      isMounted.current = false;
    },
    [],
  );

  // ── Core save logic ───────────────────────────────────────────────────────
  const performSave = useCallback(
    async (data: ProfileData, isManual: boolean) => {
      if (!isMounted.current) return;
      setSaveStatus("saving");
      try {
        // 1. Save to localStorage immediately (offline-first)
        const storageKey = `Bambeh_profile_${userId}`;
        localStorage.setItem(
          storageKey,
          JSON.stringify({ ...data, savedAt: new Date().toISOString() }),
        );

        // 2. If a backend save function was provided, call it
        if (onSave) await onSave(data);

        if (!isMounted.current) return;
        setSaveStatus("saved");
        setIsDirty(false);
        setLastSavedAt(new Date());

        // 3. On manual save: hold the "saved" message for 2s, then redirect
        if (isManual) {
          setTimeout(() => {
            if (!isMounted.current) return;
            navigate("/profile", { state: { justSaved: true } });
          }, 2000);
        } else {
          // Auto-save: reset to idle after 3s
          setTimeout(() => {
            if (isMounted.current) setSaveStatus("idle");
          }, 3000);
        }
      } catch (e) {
        if (!isMounted.current) return;
        setSaveStatus("error");
        setTimeout(() => {
          if (isMounted.current) setSaveStatus("idle");
        }, 4000);
      }
    },
    [userId, onSave, navigate],
  );

  // ── Auto-save trigger — 1.5s debounce after typing ──────────────────────
  useEffect(() => {
    if (!isDirty) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      performSave(formData, false);
    }, 1500);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [formData, isDirty, performSave]);

  // ── Set a single field ────────────────────────────────────────────────────
  const setField = useCallback((key: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
    setSaveStatus("idle");
  }, []);

  // ── Manual save (Save button click) ──────────────────────────────────────
  const handleManualSave = useCallback(async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    await performSave(formData, true);
  }, [formData, performSave]);

  return {
    formData,
    setField,
    saveStatus,
    isDirty,
    handleManualSave,
    lastSavedAt
  };
}

