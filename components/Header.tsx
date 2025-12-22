'use client';

import { usePageStore } from '@/stores/pageStore';
import { ChevronRight, Share, MoreHorizontal, Menu } from 'lucide-react';

export function Header() {
    const { currentPageId, pages, sidebarOpen, setSidebarOpen } = usePageStore();
    const currentPage = pages.find((p) => p.id === currentPageId);

    // Build breadcrumb trail
    const getBreadcrumbs = () => {
        if (!currentPage) return [];
        const crumbs = [currentPage];
        let parent = pages.find((p) => p.id === currentPage.parentId);
        while (parent) {
            crumbs.unshift(parent);
            parent = pages.find((p) => p.id === parent?.parentId);
        }
        return crumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <header className="header">
            <div className="header-left">
                {!sidebarOpen && (
                    <button className="btn-icon" onClick={() => setSidebarOpen(true)}>
                        <Menu size={18} />
                    </button>
                )}
                <nav className="breadcrumb">
                    {breadcrumbs.map((page, index) => (
                        <div key={page.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {index > 0 && <ChevronRight size={14} className="breadcrumb-separator" />}
                            <span className="breadcrumb-item">
                                <span style={{ marginRight: 4 }}>{page.icon}</span>
                                {page.title || 'Untitled'}
                            </span>
                        </div>
                    ))}
                </nav>
            </div>
            <div className="header-right">
                <button className="btn btn-ghost" style={{ fontSize: 13 }}>
                    <Share size={14} />
                    Share
                </button>
                <button className="btn-icon">
                    <MoreHorizontal size={18} />
                </button>
            </div>
        </header>
    );
}
