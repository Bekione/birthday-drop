import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ThemeId } from "@/lib/themes";

export interface WizardState {
  // Step
  step: number;

  // Step 0 — Who
  personName: string;
  birthDate: string;
  photoFile: File | null;
  photoPreview: string | null;
  teaserMessage: string;
  allowAnonymous: boolean;

  // Step 1 — Theme
  theme: ThemeId;

  // Step 2 — Music
  selectedTrackId: string;
  audioLoop: boolean;
  audioVolume: number;
  audioAutoplay: boolean;
  customAudioFile: File | null;

  // Step 3 — Security
  adminPassword: string;
  confirmPassword: string;
  wishDeadline: string;

  // Actions
  setStep: (step: number) => void;
  setField: <K extends keyof WizardState>(
    key: K,
    value: WizardState[K],
  ) => void;
  reset: () => void;
}

const defaults = {
  step: 0,
  personName: "",
  birthDate: "",
  photoFile: null,
  photoPreview: null,
  teaserMessage: "",
  allowAnonymous: true,
  theme: "confetti" as ThemeId,
  selectedTrackId: "track-1",
  audioLoop: true,
  audioVolume: 0.7,
  audioAutoplay: false,
  customAudioFile: null,
  adminPassword: "",
  confirmPassword: "",
  wishDeadline: "",
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      ...defaults,
      setStep: (step) => set({ step }),
      setField: (key, value) => set({ [key]: value } as Partial<WizardState>),
      reset: () => set({ ...defaults }),
    }),
    {
      name: "birthdaydrop-wizard",
      storage: createJSONStorage(() => sessionStorage),
      // Never persist sensitive data or non-serialisable objects
      partialize: (state) => ({
        ...state,
        photoFile: null,
        photoPreview: null, // blob URL — not stable across sessions
        customAudioFile: null,
        adminPassword: "", // is sensitive
        confirmPassword: "", // is sensitive
      }),
    },
  ),
);
