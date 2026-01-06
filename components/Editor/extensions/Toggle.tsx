import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { ChevronRight } from 'lucide-react';

function ToggleComponent({ node, updateAttributes }: any) {
    const toggle = () => {
        updateAttributes({ open: !node.attrs.open });
    };

    const isOpen = node.attrs.open;

    return (
        <NodeViewWrapper className={`toggle-block ${isOpen ? 'is-open' : 'is-closed'}`}>
            <div className="toggle-row">
                <button
                    contentEditable={false}
                    onClick={toggle}
                    className="toggle-button"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        marginRight: '6px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-tertiary)',
                        transition: 'transform 0.2s ease',
                        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                        marginTop: '4px', // Align with text
                    }}
                >
                    <ChevronRight size={18} />
                </button>
                {/* 
                   NodeViewContent will contain the paragraph (summary) 
                   and any other blocks (children)
                */}
                <NodeViewContent className="toggle-content" />
            </div>
        </NodeViewWrapper>
    );
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        toggleBlock: {
            setToggleBlock: () => ReturnType;
        };
    }
}

export const ToggleBlock = Node.create({
    name: 'toggleBlock',
    group: 'block',
    // The first child MUST be a paragraph (the header). 
    // Subsequent children are the collapsible content.
    content: 'paragraph block*',
    defining: true,
    draggable: true,

    addAttributes() {
        return {
            open: {
                default: false,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="toggle-block"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'toggle-block' }), 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ToggleComponent);
    },

    addCommands() {
        return {
            setToggleBlock:
                () =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            // Initialize with an empty paragraph for the header
                            content: [
                                {
                                    type: 'paragraph',
                                },
                            ],
                        });
                    },
        };
    },
});

export default ToggleBlock;
