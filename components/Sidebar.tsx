'use client';

import { useState } from 'react';
import { usePageStore, Page } from '@/stores/pageStore';
import {
    ChevronRight,
    ChevronDown,
    Search,
    Settings,
    Sparkles,
    Plus,
    MoreHorizontal,
    Star,
    FileText,
    Menu,
    Trash2,
    Heart
} from 'lucide-react';

interface PageTreeItemProps {
    page: Page;
    level: number;
    onNavigate: (id: string) => void;
}

function PageTreeItem({ page, level, onNavigate }: PageTreeItemProps) {
    const [expanded, setExpanded] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const { currentPageId, getChildPages, deletePage, toggleFavorite } = usePageStore();
    const children = getChildPages(page.id);
    const hasChildren = children.length > 0;
    const isActive = currentPageId === page.id;

    return (
        <div>
            <div
                className={`page-tree-item ${isActive ? 'active' : ''}`}
                style={{ paddingLeft: `${12 + level * 16}px` }}
                onClick={() => onNavigate(page.id)}
                onMouseEnter={() => setShowMenu(true)}
                onMouseLeave={() => setShowMenu(false)}
            >
                <button
                    className="expand-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(!expanded);
                    }}
                    style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
                >
                    {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <span className="page-emoji">{page.icon}</span>
                <span className="page-title">{page.title || 'Untitled'}</span>
                {showMenu && (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="btn-icon"
                            style={{ width: 22, height: 22 }}
                            onClick={() => toggleFavorite(page.id)}
                            title={page.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            <Heart size={12} fill={page.isFavorite ? 'currentColor' : 'none'} />
                        </button>
                        <button
                            className="btn-icon"
                            style={{ width: 22, height: 22 }}
                            onClick={() => deletePage(page.id)}
                            title="Delete page"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                )}
            </div>
            {expanded && hasChildren && (
                <div>
                    {children.map((child) => (
                        <PageTreeItem
                            key={child.id}
                            page={child}
                            level={level + 1}
                            onNavigate={onNavigate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface SidebarProps {
    onOpenSearch: () => void;
    onOpenSettings: () => void;
}

export function Sidebar({ onOpenSearch, onOpenSettings }: SidebarProps) {
    const { pages, sidebarOpen, setSidebarOpen, createPage, setCurrentPage } = usePageStore();
    const rootPages = pages.filter((p) => p.parentId === null);
    const favoritePages = pages.filter((p) => p.isFavorite);

    const handleNewPage = async () => {
        const newPage = await createPage();
        if (newPage) {
            setCurrentPage(newPage.id);
        }
    };

    const handleNavigate = (id: string) => {
        setCurrentPage(id);
    };

    if (!sidebarOpen) {
        return (
            <button
                className="btn-icon"
                style={{
                    position: 'fixed',
                    top: 12,
                    left: 12,
                    zIndex: 101,
                }}
                onClick={() => setSidebarOpen(true)}
            >
                <Menu size={18} />
            </button>
        );
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>📚</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>Stacknotes</span>
                </div>
                <button className="btn-icon" onClick={() => setSidebarOpen(false)}>
                    <Menu size={16} />
                </button>
            </div>

            <nav className="sidebar-nav">
                {/* Quick Actions */}
                <div className="sidebar-section">
                    <div className="nav-item" onClick={onOpenSearch}>
                        <Search className="nav-item-icon" size={18} />
                        <span>Search</span>
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-tertiary)' }}>
                            ⌘K
                        </span>
                    </div>
                    <div className="nav-item" onClick={onOpenSettings}>
                        <Settings className="nav-item-icon" size={18} />
                        <span>Settings</span>
                    </div>
                </div>

                {/* Favorites */}
                {favoritePages.length > 0 && (
                    <div className="sidebar-section">
                        <div className="sidebar-section-title">
                            <Star size={12} style={{ display: 'inline', marginRight: 4 }} />
                            Favorites
                        </div>
                        {favoritePages.map((page) => (
                            <PageTreeItem
                                key={page.id}
                                page={page}
                                level={0}
                                onNavigate={handleNavigate}
                            />
                        ))}
                    </div>
                )}

                {/* All Pages */}
                <div className="sidebar-section">
                    <div className="sidebar-section-title">
                        <FileText size={12} style={{ display: 'inline', marginRight: 4 }} />
                        Pages
                    </div>
                    {rootPages.map((page) => (
                        <PageTreeItem
                            key={page.id}
                            page={page}
                            level={0}
                            onNavigate={handleNavigate}
                        />
                    ))}
                </div>
            </nav>

            {/* New Page Button */}
            <div style={{ padding: 12, borderTop: '1px solid var(--border-light)' }}>
                <button className="btn btn-ghost" style={{ width: '100%' }} onClick={handleNewPage}>
                    <Plus size={16} />
                    New Page
                </button>
            </div>
        </aside>
    );
}
