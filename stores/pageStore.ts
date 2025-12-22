import { create } from 'zustand';

const API_BASE = '/api';

export interface Page {
    id: string;
    title: string;
    icon: string;
    content: string;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
    isFavorite: boolean;
}

interface PageStore {
    pages: Page[];
    currentPageId: string | null;
    sidebarOpen: boolean;
    isLoading: boolean;
    error: string | null;

    // API actions
    fetchPages: () => Promise<void>;
    createPage: (parentId?: string | null) => Promise<Page | null>;
    updatePage: (id: string, updates: Partial<Page>) => Promise<void>;
    deletePage: (id: string) => Promise<void>;

    // Local getters
    getPage: (id: string) => Page | undefined;
    getChildPages: (parentId: string | null) => Page[];
    toggleFavorite: (id: string) => Promise<void>;

    // Navigation
    setCurrentPage: (id: string | null) => void;

    // UI
    setSidebarOpen: (open: boolean) => void;
}

export const usePageStore = create<PageStore>((set, get) => ({
    pages: [],
    currentPageId: null,
    sidebarOpen: true,
    isLoading: false,
    error: null,

    fetchPages: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`${API_BASE}/pages`);
            if (!response.ok) throw new Error('Failed to fetch pages');
            const pages = await response.json();
            set({ pages, isLoading: false });

            // Set current page to first page if none selected
            if (!get().currentPageId && pages.length > 0) {
                set({ currentPageId: pages[0].id });
            }
        } catch (error) {
            console.error('Failed to fetch pages:', error);
            set({ error: 'Failed to load pages', isLoading: false });
        }
    },

    createPage: async (parentId = null) => {
        try {
            const response = await fetch(`${API_BASE}/pages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Untitled',
                    icon: '📄',
                    parentId,
                }),
            });

            if (!response.ok) throw new Error('Failed to create page');
            const newPage = await response.json();

            set((state) => ({ pages: [newPage, ...state.pages] }));
            return newPage;
        } catch (error) {
            console.error('Failed to create page:', error);
            set({ error: 'Failed to create page' });
            return null;
        }
    },

    updatePage: async (id, updates) => {
        // Optimistic update
        set((state) => ({
            pages: state.pages.map((page) =>
                page.id === id ? { ...page, ...updates, updatedAt: new Date().toISOString() } : page
            ),
        }));

        try {
            const response = await fetch(`${API_BASE}/pages/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!response.ok) throw new Error('Failed to update page');
            const updatedPage = await response.json();

            // Sync with server response
            set((state) => ({
                pages: state.pages.map((page) => (page.id === id ? updatedPage : page)),
            }));
        } catch (error) {
            console.error('Failed to update page:', error);
            // Revert on error - refetch
            get().fetchPages();
        }
    },

    deletePage: async (id) => {
        const previousPages = get().pages;
        const previousCurrentId = get().currentPageId;

        // Optimistic update
        set((state) => ({
            pages: state.pages.filter((page) => page.id !== id && page.parentId !== id),
            currentPageId: state.currentPageId === id ? null : state.currentPageId,
        }));

        try {
            const response = await fetch(`${API_BASE}/pages/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete page');
        } catch (error) {
            console.error('Failed to delete page:', error);
            // Revert on error
            set({ pages: previousPages, currentPageId: previousCurrentId });
        }
    },

    getPage: (id) => {
        return get().pages.find((page) => page.id === id);
    },

    getChildPages: (parentId) => {
        return get().pages.filter((page) => page.parentId === parentId);
    },

    toggleFavorite: async (id) => {
        const page = get().getPage(id);
        if (page) {
            await get().updatePage(id, { isFavorite: !page.isFavorite });
        }
    },

    setCurrentPage: (id) => set({ currentPageId: id }),

    setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
