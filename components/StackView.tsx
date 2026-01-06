'use client';

import { usePageStore } from '@/stores/pageStore';
import { FileText, Calendar, Grip } from 'lucide-react';

interface StackViewProps {
    onNavigate: (pageId: string) => void;
}

export function StackView({ onNavigate }: StackViewProps) {
    const { pages } = usePageStore();

    // Function to get a preview of content (strip HTML/JSON)
    const getPreview = (content: string) => {
        if (!content) return 'No content';
        if (content.startsWith('{')) return 'Structured content'; // For TipTap JSON
        return content.substring(0, 100) + (content.length > 100 ? '...' : '');
    };

    return (
        <div className="stack-view">
            <div className="stack-header">
                <div className="stack-title">
                    <Grip size={24} />
                    Stack View
                </div>
                <div className="stack-count">{pages.length} Pages</div>
            </div>

            <div className="stack-grid">
                {pages.map(page => (
                    <div
                        key={page.id}
                        className="stack-card"
                        onClick={() => onNavigate(page.id)}
                    >
                        <div className="stack-card-header">
                            <span className="stack-card-icon">{page.icon}</span>
                            <div className="stack-card-meta">
                                {page.updatedAt && (
                                    <span className="stack-card-date">
                                        <Calendar size={10} />
                                        {new Date(page.updatedAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <h3 className="stack-card-title">{page.title || 'Untitled'}</h3>
                        <div className="stack-card-preview">
                            <div className="stack-card-lines">
                                <span className="line short"></span>
                                <span className="line long"></span>
                                <span className="line medium"></span>
                            </div>
                        </div>
                        <div className="stack-card-footer">
                            {page.isFavorite && <span className="stack-tag">Favorite</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
