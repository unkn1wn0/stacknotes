'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    Link as LinkIcon,
    Highlighter,
    Type,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    CheckSquare,
    Quote,
    Minus,
    Code2,
    AlertCircle,
    ChevronRight,
    Link2,
    Table,
} from 'lucide-react';
import Callout from './extensions/Callout';
import ToggleBlock from './extensions/Toggle';
import EmbedBlock from './extensions/Embed';

interface SlashMenuItem {
    title: string;
    description: string;
    icon: React.ReactNode;
    command: (editor: ReturnType<typeof useEditor>) => void;
}

const slashMenuItems: SlashMenuItem[] = [
    {
        title: 'Text',
        description: 'Just start writing with plain text.',
        icon: <Type size={20} />,
        command: (editor) => editor?.chain().focus().setParagraph().run(),
    },
    {
        title: 'Heading 1',
        description: 'Big section heading.',
        icon: <Heading1 size={20} />,
        command: (editor) => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
        title: 'Heading 2',
        description: 'Medium section heading.',
        icon: <Heading2 size={20} />,
        command: (editor) => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
        title: 'Heading 3',
        description: 'Small section heading.',
        icon: <Heading3 size={20} />,
        command: (editor) => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
        title: 'Bullet List',
        description: 'Create a simple bulleted list.',
        icon: <List size={20} />,
        command: (editor) => editor?.chain().focus().toggleBulletList().run(),
    },
    {
        title: 'Numbered List',
        description: 'Create a list with numbering.',
        icon: <ListOrdered size={20} />,
        command: (editor) => editor?.chain().focus().toggleOrderedList().run(),
    },
    {
        title: 'To-do List',
        description: 'Track tasks with a to-do list.',
        icon: <CheckSquare size={20} />,
        command: (editor) => editor?.chain().focus().toggleTaskList().run(),
    },
    {
        title: 'Quote',
        description: 'Capture a quote.',
        icon: <Quote size={20} />,
        command: (editor) => editor?.chain().focus().toggleBlockquote().run(),
    },
    {
        title: 'Divider',
        description: 'Visually divide blocks.',
        icon: <Minus size={20} />,
        command: (editor) => editor?.chain().focus().setHorizontalRule().run(),
    },
    {
        title: 'Code Block',
        description: 'Capture a code snippet.',
        icon: <Code2 size={20} />,
        command: (editor) => editor?.chain().focus().toggleCodeBlock().run(),
    },
    {
        title: 'Callout',
        description: 'Highlight important text.',
        icon: <AlertCircle size={20} />,
        command: (editor) => editor?.chain().focus().setCallout().run(),
    },
    {
        title: 'Toggle List',
        description: 'Collapsible block.',
        icon: <ChevronRight size={20} />,
        command: (editor) => editor?.chain().focus().setToggleBlock().run(),
    },
    {
        title: 'Embed',
        description: 'Embed external content.',
        icon: <Link2 size={20} />,
        command: (editor) => editor?.chain().focus().setEmbed().run(),
    },
    {
        title: 'Database',
        description: 'Insert a table database.',
        icon: <Table size={20} />,
        command: (editor) => editor?.chain().focus().insertContent({
            type: 'paragraph',
            content: [{ type: 'text', text: '📊 Database placeholder - coming soon!' }],
        }).run(),
    },
];

interface EditorProps {
    content: string;
    onUpdate: (content: string) => void;
}

export interface EditorRef {
    insertText: (text: string) => void;
}

import { forwardRef, useImperativeHandle } from 'react';

export const Editor = forwardRef<EditorRef, EditorProps>(function Editor({ content, onUpdate }, ref) {
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [filterText, setFilterText] = useState('');
    const [showBubbleMenu, setShowBubbleMenu] = useState(false);
    const [bubbleMenuPosition, setBubbleMenuPosition] = useState({ top: 0, left: 0 });
    const slashMenuRef = useRef<HTMLDivElement>(null);
    const bubbleMenuRef = useRef<HTMLDivElement>(null);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Placeholder.configure({
                placeholder: "Press '/' for commands...",
            }),
            Highlight,
            Link.configure({
                openOnClick: false,
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            TaskItem.configure({
                nested: true,
            }),
            Underline,
            Callout,
            ToggleBlock,
            EmbedBlock,
        ],
        content: content ? JSON.parse(content) : { type: 'doc', content: [{ type: 'paragraph' }] },
        editorProps: {
            attributes: {
                class: 'tiptap',
            },
        },
        onUpdate: ({ editor }) => {
            onUpdate(JSON.stringify(editor.getJSON()));
        },
        onSelectionUpdate: ({ editor }) => {
            const { from, to } = editor.state.selection;
            const hasSelection = from !== to;

            if (hasSelection) {
                const coords = editor.view.coordsAtPos(from);
                const endCoords = editor.view.coordsAtPos(to);
                setBubbleMenuPosition({
                    top: Math.min(coords.top, endCoords.top) - 50,
                    left: (coords.left + endCoords.left) / 2,
                });
                setShowBubbleMenu(true);
            } else {
                setShowBubbleMenu(false);
            }
        },
    });

    // Expose insertText method via ref
    useImperativeHandle(ref, () => ({
        insertText: (text: string) => {
            if (editor) {
                editor.chain().focus().insertContent(text).run();
            }
        },
    }), [editor]);

    // Filter slash menu items
    const filteredItems = slashMenuItems.filter((item) =>
        item.title.toLowerCase().includes(filterText.toLowerCase())
    );

    // Handle slash command keyboard navigation
    useEffect(() => {
        if (!editor) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (showSlashMenu) {
                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    setSelectedIndex((i) => (i + 1) % filteredItems.length);
                } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    setSelectedIndex((i) => (i - 1 + filteredItems.length) % filteredItems.length);
                } else if (event.key === 'Enter') {
                    event.preventDefault();
                    if (filteredItems[selectedIndex]) {
                        // Delete the slash and filter text
                        const { from } = editor.state.selection;
                        const textBefore = editor.state.doc.textBetween(Math.max(0, from - 20), from);
                        const slashIndex = textBefore.lastIndexOf('/');
                        if (slashIndex !== -1) {
                            editor
                                .chain()
                                .focus()
                                .deleteRange({ from: from - (textBefore.length - slashIndex), to: from })
                                .run();
                        }
                        filteredItems[selectedIndex].command(editor);
                        setShowSlashMenu(false);
                        setFilterText('');
                    }
                } else if (event.key === 'Escape') {
                    setShowSlashMenu(false);
                    setFilterText('');
                } else if (event.key === 'Backspace') {
                    if (filterText === '') {
                        setShowSlashMenu(false);
                    } else {
                        setFilterText((f) => f.slice(0, -1));
                    }
                } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
                    setFilterText((f) => f + event.key);
                    setSelectedIndex(0);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [editor, showSlashMenu, selectedIndex, filteredItems, filterText]);

    // Detect "/" typed
    useEffect(() => {
        if (!editor) return;

        const handleTransaction = () => {
            const { selection } = editor.state;
            const { from } = selection;
            const textBefore = editor.state.doc.textBetween(Math.max(0, from - 1), from);

            if (textBefore === '/' && !showSlashMenu) {
                // Get cursor position
                const coords = editor.view.coordsAtPos(from);
                setSlashMenuPosition({
                    top: coords.bottom + 8,
                    left: coords.left,
                });
                setShowSlashMenu(true);
                setSelectedIndex(0);
                setFilterText('');
            }
        };

        editor.on('transaction', handleTransaction);
        return () => {
            editor.off('transaction', handleTransaction);
        };
    }, [editor, showSlashMenu]);

    // Close menus on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (slashMenuRef.current && !slashMenuRef.current.contains(e.target as Node)) {
                setShowSlashMenu(false);
                setFilterText('');
            }
            if (bubbleMenuRef.current && !bubbleMenuRef.current.contains(e.target as Node)) {
                // Don't close if clicking in editor
                const editorEl = document.querySelector('.tiptap');
                if (!editorEl?.contains(e.target as Node)) {
                    setShowBubbleMenu(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSlashItemClick = (item: SlashMenuItem) => {
        if (!editor) return;
        const { from } = editor.state.selection;
        const textBefore = editor.state.doc.textBetween(Math.max(0, from - 20), from);
        const slashIndex = textBefore.lastIndexOf('/');
        if (slashIndex !== -1) {
            editor
                .chain()
                .focus()
                .deleteRange({ from: from - (textBefore.length - slashIndex), to: from })
                .run();
        }
        item.command(editor);
        setShowSlashMenu(false);
        setFilterText('');
    };

    if (!editor) return null;

    return (
        <div style={{ position: 'relative' }}>
            {/* Custom Bubble Menu */}
            {showBubbleMenu && (
                <div
                    ref={bubbleMenuRef}
                    className="bubble-menu"
                    style={{
                        position: 'fixed',
                        top: bubbleMenuPosition.top,
                        left: bubbleMenuPosition.left,
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                    }}
                >
                    <button
                        className={`bubble-menu-btn ${editor.isActive('bold') ? 'active' : ''}`}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        title="Bold"
                    >
                        <Bold size={16} />
                    </button>
                    <button
                        className={`bubble-menu-btn ${editor.isActive('italic') ? 'active' : ''}`}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        title="Italic"
                    >
                        <Italic size={16} />
                    </button>
                    <button
                        className={`bubble-menu-btn ${editor.isActive('underline') ? 'active' : ''}`}
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        title="Underline"
                    >
                        <UnderlineIcon size={16} />
                    </button>
                    <button
                        className={`bubble-menu-btn ${editor.isActive('strike') ? 'active' : ''}`}
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        title="Strikethrough"
                    >
                        <Strikethrough size={16} />
                    </button>
                    <div className="bubble-menu-divider" />
                    <button
                        className={`bubble-menu-btn ${editor.isActive('code') ? 'active' : ''}`}
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        title="Inline Code"
                    >
                        <Code size={16} />
                    </button>
                    <button
                        className={`bubble-menu-btn ${editor.isActive('highlight') ? 'active' : ''}`}
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        title="Highlight"
                    >
                        <Highlighter size={16} />
                    </button>
                    <button
                        className={`bubble-menu-btn ${editor.isActive('link') ? 'active' : ''}`}
                        onClick={() => {
                            const url = window.prompt('Enter URL:');
                            if (url) {
                                editor.chain().focus().setLink({ href: url }).run();
                            }
                        }}
                        title="Link"
                    >
                        <LinkIcon size={16} />
                    </button>

                </div>
            )}

            {/* Editor Content */}
            <EditorContent editor={editor} />

            {/* Slash Command Menu */}
            {showSlashMenu && filteredItems.length > 0 && (
                <div
                    ref={slashMenuRef}
                    className="slash-menu"
                    style={{
                        top: slashMenuPosition.top,
                        left: slashMenuPosition.left,
                        position: 'fixed',
                    }}
                >
                    <div className="slash-menu-section">Basic blocks</div>
                    {filteredItems.map((item, index) => (
                        <div
                            key={item.title}
                            className={`slash-menu-item ${index === selectedIndex ? 'selected' : ''}`}
                            onClick={() => handleSlashItemClick(item)}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <div className="slash-menu-item-icon">{item.icon}</div>
                            <div className="slash-menu-item-content">
                                <div className="slash-menu-item-title">{item.title}</div>
                                <div className="slash-menu-item-description">{item.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});
