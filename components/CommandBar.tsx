'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePageStore } from '@/stores/pageStore';
import {
    Search,
    Plus,
    FileText,
    Settings,
    Command,
    ArrowRight,
    Hash,
    Sparkles,
    Table,
    CheckSquare,
    LayoutGrid,
    Link2,
    Code,
    Quote,
    Minus,
    Image,
    Video,
    Mic,
} from 'lucide-react';

interface CommandItem {
    id: string;
    title: string;
    description?: string;
    icon: React.ReactNode;
    category: 'navigation' | 'create' | 'insert' | 'action';
    action: () => void;
    keywords?: string[];
}

interface CommandBarProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenSettings: () => void;
    onStartVoice?: () => void;
}

export function CommandBar({ isOpen, onClose, onOpenSettings, onStartVoice }: CommandBarProps) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const { pages, createPage, setCurrentPage } = usePageStore();

    // Build command list
    const commands: CommandItem[] = [
        // Navigation
        ...pages.map((page) => ({
            id: `nav-${page.id}`,
            title: page.title || 'Untitled',
            description: 'Navigate to page',
            icon: <span style={{ fontSize: 16 }}>{page.icon}</span>,
            category: 'navigation' as const,
            action: () => {
                setCurrentPage(page.id);
                onClose();
            },
            keywords: [page.title.toLowerCase()],
        })),
        // Create actions
        {
            id: 'create-page',
            title: 'New Page',
            description: 'Create a blank page',
            icon: <Plus size={16} />,
            category: 'create',
            action: async () => {
                const page = await createPage();
                if (page) setCurrentPage(page.id);
                onClose();
            },
            keywords: ['new', 'create', 'page', 'note'],
        },
        {
            id: 'create-database',
            title: 'New Database',
            description: 'Create a table database',
            icon: <Table size={16} />,
            category: 'create',
            action: async () => {
                const page = await createPage();
                if (page) setCurrentPage(page.id);
                onClose();
            },
            keywords: ['database', 'table', 'data'],
        },
        // Actions
        {
            id: 'action-voice',
            title: 'Voice Dictation',
            description: 'Speak to type',
            icon: <Mic size={16} />,
            category: 'action',
            action: () => {
                onClose();
                onStartVoice?.();
            },
            keywords: ['voice', 'dictation', 'speak', 'microphone', 'transcribe'],
        },
        {
            id: 'action-settings',
            title: 'Settings',
            description: 'Open app settings',
            icon: <Settings size={16} />,
            category: 'action',
            action: () => {
                onOpenSettings();
                onClose();
            },
            keywords: ['settings', 'preferences', 'config'],
        },
    ];

    // Filter commands based on query
    const filteredCommands = query.trim()
        ? commands.filter((cmd) => {
            const q = query.toLowerCase();
            return (
                cmd.title.toLowerCase().includes(q) ||
                cmd.description?.toLowerCase().includes(q) ||
                cmd.keywords?.some((k) => k.includes(q))
            );
        })
        : commands;

    // Group by category
    const groupedCommands = {
        navigation: filteredCommands.filter((c) => c.category === 'navigation'),
        create: filteredCommands.filter((c) => c.category === 'create'),
        action: filteredCommands.filter((c) => c.category === 'action'),
    };

    const flatFiltered = [
        ...groupedCommands.navigation,
        ...groupedCommands.create,
        ...groupedCommands.action,
    ];

    // Keyboard navigation
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex((i) => Math.max(i - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (flatFiltered[selectedIndex]) {
                        flatFiltered[selectedIndex].action();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        },
        [isOpen, selectedIndex, flatFiltered, onClose]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Scroll selected item into view
    useEffect(() => {
        const selectedEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
        selectedEl?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    if (!isOpen) return null;

    const renderCategory = (title: string, items: CommandItem[], startIndex: number) => {
        if (items.length === 0) return null;
        return (
            <div className="command-category">
                <div className="command-category-title">{title}</div>
                {items.map((cmd, i) => {
                    const index = startIndex + i;
                    return (
                        <div
                            key={cmd.id}
                            data-index={index}
                            className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
                            onClick={cmd.action}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <div className="command-item-icon">{cmd.icon}</div>
                            <div className="command-item-content">
                                <div className="command-item-title">{cmd.title}</div>
                                {cmd.description && (
                                    <div className="command-item-description">{cmd.description}</div>
                                )}
                            </div>
                            <ArrowRight size={14} className="command-item-arrow" />
                        </div>
                    );
                })}
            </div>
        );
    };

    let currentIndex = 0;

    return (
        <div className="command-overlay" onClick={onClose}>
            <div className="command-bar" onClick={(e) => e.stopPropagation()}>
                <div className="command-input-wrapper">
                    <Command size={18} className="command-input-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="command-input"
                        placeholder="Search or type a command..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                    />
                    <kbd className="command-shortcut">ESC</kbd>
                </div>
                <div className="command-list" ref={listRef}>
                    {flatFiltered.length === 0 ? (
                        <div className="command-empty">
                            <Search size={24} />
                            <span>No results found</span>
                        </div>
                    ) : (
                        <>
                            {renderCategory('Pages', groupedCommands.navigation, (currentIndex = 0))}
                            {renderCategory(
                                'Create',
                                groupedCommands.create,
                                (currentIndex += groupedCommands.navigation.length)
                            )}
                            {renderCategory(
                                'Actions',
                                groupedCommands.action,
                                (currentIndex += groupedCommands.create.length)
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
