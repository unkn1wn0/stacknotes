import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { Link2 } from 'lucide-react';

function EmbedComponent({ node, updateAttributes }: any) {
    const src = node.attrs.src;

    // Helper to normalize URLs or detect type
    const getEmbedType = (url: string) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
        if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
        return 'generic';
    };

    const type = getEmbedType(src);

    const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        if (value.trim()) {
            updateAttributes({ src: value });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const value = e.currentTarget.value;
            if (value.trim()) {
                updateAttributes({ src: value });
            }
        }
    };

    if (!src) {
        return (
            <NodeViewWrapper className="embed-block-placeholder">
                <div className="embed-placeholder-content">
                    <Link2 size={24} />
                    <input
                        type="text"
                        placeholder="Paste an embed link (YouTube, Twitter, etc.) and press Enter"
                        onBlur={handleInput}
                        onKeyDown={handleKeyDown}
                        className="embed-input"
                        autoFocus
                    />
                </div>
            </NodeViewWrapper>
        );
    }

    return (
        <NodeViewWrapper className="embed-block">
            <div className="embed-container">
                {type === 'youtube' ? (
                    <iframe
                        width="100%"
                        height="400"
                        src={src.replace('watch?v=', 'embed/')}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ borderRadius: '8px' }}
                    />
                ) : (
                    <iframe
                        src={src}
                        width="100%"
                        height="400"
                        frameBorder="0"
                        style={{ borderRadius: '8px', border: '1px solid var(--border-color)' }}
                    />
                )}
            </div>
            <div className="embed-caption">
                <input
                    type="text"
                    className="embed-caption-input"
                    placeholder="Write a caption..."
                    defaultValue={node.attrs.caption}
                    onBlur={(e) => updateAttributes({ caption: e.target.value })}
                />
            </div>
        </NodeViewWrapper>
    );
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        embed: {
            setEmbed: (options?: { src: string }) => ReturnType;
        };
    }
}

export const EmbedBlock = Node.create({
    name: 'embedBlock',
    group: 'block',
    atom: true, // It's a leaf node

    addAttributes() {
        return {
            src: {
                default: null,
            },
            caption: {
                default: '',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="embed-block"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'embed-block' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(EmbedComponent);
    },

    addCommands() {
        return {
            setEmbed:
                (options = { src: '' }) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: options,
                        });
                    },
        };
    },
});

export default EmbedBlock;
