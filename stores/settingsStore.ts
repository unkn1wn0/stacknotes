import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
}

interface SettingsStore extends Settings {
    setTheme: (theme: Settings['theme']) => void;
    setFontSize: (size: Settings['fontSize']) => void;
}

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            theme: 'system',
            fontSize: 'medium',

            setTheme: (theme) => set({ theme }),
            setFontSize: (size) => set({ fontSize: size }),
        }),
        {
            name: 'stacknotes-settings',
        }
    )
);
