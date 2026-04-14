import { create } from 'zustand';

interface SettingsState {
  loanDurationDays: number;
  fineRatePerDay: number;
  updateSettings: (settings: Partial<Omit<SettingsState, 'updateSettings'>>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  loanDurationDays: 14,
  fineRatePerDay: 1.5,
  updateSettings: (newSettings) => set((state) => ({ ...state, ...newSettings })),
}));
