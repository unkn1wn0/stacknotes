import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

interface Page {
    id: string;
    title: string;
    icon: string;
    content: string;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
    isFavorite: boolean;
}

async function getPage(id: string): Promise<Page | null> {
    const filePath = path.join(DATA_DIR, `${id}.json`);
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
    } catch {
        return null;
    }
}

async function savePage(page: Page): Promise<void> {
    const filePath = path.join(DATA_DIR, `${page.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(page, null, 2));
}

async function deletePage(id: string): Promise<boolean> {
    const filePath = path.join(DATA_DIR, `${id}.json`);
    try {
        await fs.unlink(filePath);
        return true;
    } catch {
        return false;
    }
}

// GET single page
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const page = await getPage(id);
        if (!page) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }
        return NextResponse.json(page);
    } catch (error) {
        console.error('Error fetching page:', error);
        return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
    }
}

// PUT update page
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const existingPage = await getPage(id);
        if (!existingPage) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        const body = await request.json();
        const updatedPage: Page = {
            ...existingPage,
            ...body,
            id: existingPage.id,
            createdAt: existingPage.createdAt,
            updatedAt: new Date().toISOString(),
        };

        await savePage(updatedPage);
        return NextResponse.json(updatedPage);
    } catch (error) {
        console.error('Error updating page:', error);
        return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
    }
}

// DELETE page
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const deleted = await deletePage(id);
        if (!deleted) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting page:', error);
        return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
    }
}
