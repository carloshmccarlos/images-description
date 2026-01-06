import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPreferences {
  motherLanguage: string;
  learningLanguage: string;
  proficiencyLevel: string;
  name: string | null;
}

interface UserState {
  preferences: UserPreferences | null;
  setPreferences: (preferences: UserPreferences) => void;
  clearPreferences: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      preferences: null,
      setPreferences: (preferences) => set({ preferences }),
      clearPreferences: () => set({ preferences: null }),
    }),
    {
      name: 'user-preferences',
    }
  )
);
