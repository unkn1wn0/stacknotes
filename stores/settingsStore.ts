import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    groqApiKey: string;
}

interface SettingsStore extends Settings {
    setTheme: (theme: Settings['theme']) => void;
    setFontSize: (size: Settings['fontSize']) => void;
    setGroqApiKey: (key: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            theme: 'system',
            fontSize: 'medium',
            groqApiKey: '',

            setTheme: (theme) => set({ theme }),
            setFontSize: (size) => set({ fontSize: size }),
            setGroqApiKey: (key) => set({ groqApiKey: key }),
        }),
        {
            name: 'stacknotes-settings',
        }
    )
);
