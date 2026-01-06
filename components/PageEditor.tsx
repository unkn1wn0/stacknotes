'use client';

import { useState, useRef, useEffect } from 'react';
import { usePageStore } from '@/stores/pageStore';
import { Editor, EditorRef } from '@/components/Editor/Editor';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { Smile } from 'lucide-react';

const EMOJI_LIST = ['📄', '📝', '📓', '📔', '📕', '📗', '📘', '📙', '🗒️', '📋', '📃', '📑', '🗃️', '🗂️', '📁', '📂', '🗄️', '💼', '🎯', '✅', '⭐', '💡', '🔥', '💎', '🚀', '🎨', '🎭', '🎬', '🎮', '🎵', '🎹', '🎸', '🎺', '🥁', '🎻', '📷', '📸', '🖼️', '🎰', '🎲', '🎯', '🎳', '♟️', '🧩', '🎪', '🎠', '🎡', '🎢', '🛝', '⛺', '🏕️', '🌅', '🌄', '🏜️', '🏖️', '🏝️', '🗻', '🏔️', '⛰️', '🌋', '🗾', '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽', '⛪'];

interface PageEditorProps {
    pageId: string;
    voiceTrigger?: boolean;
    onVoiceTriggerHandled?: () => void;
}

export function PageEditor({ pageId, voiceTrigger, onVoiceTriggerHandled }: PageEditorProps) {
    const { getPage, updatePage } = usePageStore();
    const page = getPage(pageId);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [title, setTitle] = useState(page?.title || '');
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<EditorRef | null>(null);

    useEffect(() => {
        setTitle(page?.title || '');
    }, [pageId, page?.title]);

    // Close emoji picker on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTranscription = (text: string) => {
        if (editorRef.current) {
            editorRef.current.insertText(text);
        }
    };

    if (!page) {
        return (
            <div className="editor-container">
                <div className="empty-state">
                    <div className="empty-state-icon">📄</div>
                    <div className="empty-state-title">No page selected</div>
                    <div className="empty-state-description">
                        Select a page from the sidebar or create a new one
                    </div>
                </div>
            </div>
        );
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        updatePage(pageId, { title: e.target.value });
    };

    const handleContentUpdate = (content: string) => {
        updatePage(pageId, { content });
    };

    const handleIconSelect = (emoji: string) => {
        updatePage(pageId, { icon: emoji });
        setShowEmojiPicker(false);
    };

    return (
        <div className="editor-container">
            {/* Page Header */}
            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                    <div className="page-icon-container" style={{ position: 'relative' }}>
                        <div
                            className="page-icon"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            role="button"
                            tabIndex={0}
                        >
                            {page.icon}
                        </div>

                        {/* Emoji Picker */}
                        {showEmojiPicker && (
                            <div
                                ref={emojiPickerRef}
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    zIndex: 100,
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 12,
                                    boxShadow: 'var(--shadow-lg)',
                                    padding: 12,
                                    width: 320,
                                    maxHeight: 300,
                                    overflowY: 'auto',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(8, 1fr)',
                                        gap: 4,
                                    }}
                                >
                                    {EMOJI_LIST.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleIconSelect(emoji)}
                                            style={{
                                                width: 32,
                                                height: 32,
                                                border: 'none',
                                                background: 'transparent',
                                                cursor: 'pointer',
                                                fontSize: 20,
                                                borderRadius: 6,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'background 0.15s ease',
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.background = 'var(--bg-hover)')
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.background = 'transparent')
                                            }
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <input
                        ref={titleInputRef}
                        type="text"
                        className="page-title-input"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Untitled"
                    />
                </div>
                <VoiceRecorder
                    onTranscription={handleTranscription}
                    externalTrigger={voiceTrigger}
                    onExternalTriggerHandled={onVoiceTriggerHandled}
                />
            </div>

            {/* Editor */}
            <Editor
                ref={editorRef}
                content={page.content}
                onUpdate={handleContentUpdate}
            />
        </div>
    );
}
