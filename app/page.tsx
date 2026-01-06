'use client';

import { useState, useEffect } from 'react';
import { usePageStore } from '@/stores/pageStore';
import { ThemeProvider } from '@/components/ThemeProvider';
import { PageEditor } from '@/components/PageEditor';
import { SearchModal } from '@/components/SearchModal';
import { SettingsModal } from '@/components/SettingsModal';
import { CommandBar } from '@/components/CommandBar';
import { StackView } from '@/components/StackView';
import {
  Command,
  FileText,
  Settings,
  Plus,
  Search,
  Star,
  Trash2,
  Layers,
} from 'lucide-react';

export default function Home() {
  const { pages, currentPageId, setCurrentPage, createPage, deletePage, fetchPages, isLoading } = usePageStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activePanel, setActivePanel] = useState<'pages' | 'stack'>('pages');
  const [voiceTrigger, setVoiceTrigger] = useState(false);

  // Handle hydration and fetch pages from backend
  useEffect(() => {
    setMounted(true);
    fetchPages();
  }, [fetchPages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === 'KeyK') {
        e.preventDefault();
        setCommandOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleNewPage();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNewPage = async () => {
    const page = await createPage();
    if (page) {
      setCurrentPage(page.id);
      setActivePanel('pages'); // Switch back to pages view
    }
  };

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

  const favoritePages = pages.filter((p) => p.isFavorite);
  const allPages = pages.filter((p) => !p.isFavorite);

  return (
    <ThemeProvider>
      <div className="app-layout">
        <div className="app-body">
          {/* Mini Sidebar - Icon Navigation */}
          <div className="mini-sidebar">
            <button
              className={`mini-sidebar-btn ${activePanel === 'pages' ? 'active' : ''}`}
              onClick={() => setActivePanel('pages')}
              title="Pages"
            >
              <FileText size={20} />
            </button>
            <button
              className={`mini-sidebar-btn ${activePanel === 'stack' ? 'active' : ''}`}
              onClick={() => setActivePanel('stack')}
              title="Stack View"
            >
              <Layers size={20} />
            </button>
            <button
              className="mini-sidebar-btn"
              onClick={() => setCommandOpen(true)}
              title="Command (⌘K)"
            >
              <Command size={20} />
            </button>
            <button
              className="mini-sidebar-btn"
              onClick={() => setSearchOpen(true)}
              title="Search"
            >
              <Search size={20} />
            </button>
            <div style={{ flex: 1 }} />
            <button
              className="mini-sidebar-btn"
              onClick={() => setSettingsOpen(true)}
              title="Settings"
            >
              <Settings size={20} />
            </button>
          </div>

          {/* Sidebar Panel */}
          {activePanel === 'pages' && (
            <div className="pages-panel">
              <div className="pages-panel-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="pages-panel-title">Workspace</span>
                  <button
                    className="btn-icon"
                    onClick={handleNewPage}
                    title="New Page (⌘N)"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="pages-panel-list">
                {favoritePages.length > 0 && (
                  <div className="sidebar-section">
                    <div className="sidebar-section-title">
                      <Star size={12} style={{ marginRight: 4 }} />
                      Favorites
                    </div>
                    {favoritePages.map((page) => (
                      <div
                        key={page.id}
                        className={`page-tree-item ${currentPageId === page.id ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page.id)}
                      >
                        <span className="page-emoji">{page.icon}</span>
                        <span className="page-title">{page.title || 'Untitled'}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="sidebar-section">
                  <div className="sidebar-section-title">Pages</div>
                  {allPages.map((page) => (
                    <div
                      key={page.id}
                      className={`page-tree-item ${currentPageId === page.id ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page.id)}
                    >
                      <span className="page-emoji">{page.icon}</span>
                      <span className="page-title">{page.title || 'Untitled'}</span>
                      <button
                        className="btn-icon delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePage(page.id);
                        }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {pages.length === 0 && (
                    <div
                      style={{
                        padding: '20px 12px',
                        textAlign: 'center',
                        color: 'var(--text-tertiary)',
                        fontSize: 13,
                      }}
                    >
                      No pages yet
                      <br />
                      <button
                        className="btn btn-ghost"
                        onClick={handleNewPage}
                        style={{ marginTop: 8 }}
                      >
                        <Plus size={14} /> Create first page
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Area: Editor or Stack View */}
          <div className="editor-area">
            {activePanel === 'stack' ? (
              <StackView
                onNavigate={(pageId) => {
                  setCurrentPage(pageId);
                  setActivePanel('pages');
                }}
              />
            ) : (
              <>
                {currentPageId ? (
                  <PageEditor
                    pageId={currentPageId}
                    voiceTrigger={voiceTrigger}
                    onVoiceTriggerHandled={() => setVoiceTrigger(false)}
                  />
                ) : (
                  <div className="editor-container">
                    <div className="empty-state">
                      <div className="empty-state-icon">✨</div>
                      <div className="empty-state-title">Welcome to Stacknotes</div>
                      <div className="empty-state-description">
                        Press <strong>⌘K</strong> to open the command bar
                        <br />
                        or select a page from the sidebar
                      </div>

                    </div>
                  </div>
                )}
                <div className="version-tag">Stacknotes 0.2 Unstable</div>
              </>
            )}
          </div>
        </div>

        {/* Modals */}
        <CommandBar
          isOpen={commandOpen}
          onClose={() => setCommandOpen(false)}
          onOpenSettings={() => setSettingsOpen(true)}
          onStartVoice={() => setVoiceTrigger(true)}
        />
        <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    </ThemeProvider>
  );
}
