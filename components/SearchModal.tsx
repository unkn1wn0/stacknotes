'use client';

import { useState, useEffect, useRef } from 'react';
import { usePageStore } from '@/stores/pageStore';
import { Search, FileText, Clock } from 'lucide-react';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { pages, setCurrentPage } = usePageStore();
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredPages = pages.filter((page) =>
        page.title.toLowerCase().includes(query.toLowerCase())
    );

    // Sort by most recently updated
    const sortedPages = [...filteredPages].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((i) => Math.min(i + 1, sortedPages.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === 'Enter' && sortedPages[selectedIndex]) {
                setCurrentPage(sortedPages[selectedIndex].id);
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, sortedPages, selectedIndex, setCurrentPage]);

    // Keyboard shortcut to open
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handlePageClick = (pageId: string) => {
        setCurrentPage(pageId);
        onClose();
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal search-modal" onClick={(e) => e.stopPropagation()}>
                <div className="search-input-container">
                    <div style={{ position: 'relative' }}>
                        <Search
                            size={18}
                            style={{
                                position: 'absolute',
                                left: 14,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-tertiary)',
                            }}
                        />
                        <input
                            ref={inputRef}
                            type="text"
                            className="search-input"
                            style={{ paddingLeft: 44 }}
                            placeholder="Search pages..."
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setSelectedIndex(0);
                            }}
                        />
                    </div>
                </div>
                <div className="search-results">
                    {sortedPages.length === 0 ? (
                        <div className="empty-state" style={{ padding: 40 }}>
                            <div className="empty-state-title">No pages found</div>
                            <div className="empty-state-description">
                                Try searching for something else
                            </div>
                        </div>
                    ) : (
                        <>
                            {!query && (
                                <div
                                    style={{
                                        padding: '8px 12px',
                                        fontSize: 11,
                                        color: 'var(--text-tertiary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                    }}
                                >
                                    <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                                    Recent
                                </div>
                            )}
                            {sortedPages.map((page, index) => (
                                <div
                                    key={page.id}
                                    className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
                                    onClick={() => handlePageClick(page.id)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <span style={{ fontSize: 18 }}>{page.icon}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            className="truncate"
                                            style={{ fontWeight: 500, color: 'var(--text-primary)' }}
                                        >
                                            {page.title || 'Untitled'}
                                        </div>
                                    </div>
                                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                                        {formatDate(page.updatedAt)}
                                    </span>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
