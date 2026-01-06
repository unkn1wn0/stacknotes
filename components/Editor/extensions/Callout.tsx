import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { AlertCircle, Info, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';

// Callout types with their icons and colors
const CALLOUT_TYPES = {
    info: { icon: Info, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    tip: { icon: Lightbulb, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    warning: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    danger: { icon: AlertCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    success: { icon: CheckCircle, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
};

type CalloutType = keyof typeof CALLOUT_TYPES;

// React component for rendering the callout
function CalloutComponent({ node, updateAttributes }: { node: any; updateAttributes: (attrs: any) => void }) {
    const type = (node.attrs.type as CalloutType) || 'info';
    const config = CALLOUT_TYPES[type];
    const Icon = config.icon;

    return (
        <NodeViewWrapper>
            <div
                className="callout-block"
                style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '16px',
                    borderRadius: '8px',
                    background: config.bg,
                    borderLeft: `3px solid ${config.color}`,
                    margin: '8px 0',
                }}
            >
                <div
                    className="callout-icon"
                    style={{
                        color: config.color,
                        flexShrink: 0,
                        marginTop: '2px',
                    }}
                >
                    <Icon size={20} />
                </div>
                <NodeViewContent className="callout-content" style={{ flex: 1 }} />
            </div>
        </NodeViewWrapper>
    );
}

// TipTap Extension
export const Callout = Node.create({
    name: 'callout',
    group: 'block',
    content: 'block+',

    addAttributes() {
        return {
            type: {
                default: 'info',
                parseHTML: (element) => element.getAttribute('data-type') || 'info',
                renderHTML: (attributes) => ({ 'data-type': attributes.type }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-callout]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-callout': '' }), 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(CalloutComponent);
    },

    addCommands() {
        return {
            setCallout:
                (type: CalloutType = 'info') =>
                    ({ commands }: { commands: any }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: { type },
                            content: [{ type: 'paragraph' }],
                        });
                    },
            toggleCallout:
                (type: CalloutType = 'info') =>
                    ({ commands }: { commands: any }) => {
                        return commands.toggleWrap(this.name, { type });
                    },
        };
    },
});

export default Callout;

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        callout: {
            setCallout: (type?: CalloutType) => ReturnType;
            toggleCallout: (type?: CalloutType) => ReturnType;
        };
    }
}
