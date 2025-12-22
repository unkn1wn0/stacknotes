'use client';

import { useState, useEffect } from 'react';
import { usePageStore } from '@/stores/pageStore';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { PageEditor } from '@/components/PageEditor';
import { SearchModal } from '@/components/SearchModal';
import { SettingsModal } from '@/components/SettingsModal';

export default function Home() {
  const { currentPageId, sidebarOpen, fetchPages, isLoading } = usePageStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle hydration and fetch pages from backend
  useEffect(() => {
    setMounted(true);
    fetchPages();
  }, [fetchPages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
        }}
      >
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="app-container">
        {/* Sidebar */}
        <Sidebar
          onOpenSearch={() => setSearchOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        {/* Main Content */}
        <main
          className="main-content"
          style={{
            marginLeft: sidebarOpen ? 'var(--sidebar-width)' : 0,
            transition: 'margin 0.2s ease',
          }}
        >
          <Header />
          <div className="page-content">
            {currentPageId ? (
              <PageEditor pageId={currentPageId} />
            ) : (
              <div className="editor-container">
                <div className="empty-state">
                  <div className="empty-state-icon">📚</div>
                  <div className="empty-state-title">Welcome to Stacknotes</div>
                  <div className="empty-state-description">
                    Select a page from the sidebar or create a new one to get started
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Modals */}
        <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    </ThemeProvider>
  );
}
