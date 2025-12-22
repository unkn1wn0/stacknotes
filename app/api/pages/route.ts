import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

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

async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

async function getAllPages(): Promise<Page[]> {
    await ensureDataDir();

    try {
        const files = await fs.readdir(DATA_DIR);
        const pages: Page[] = [];

        for (const file of files) {
            if (file.endsWith('.json')) {
                try {
                    const filePath = path.join(DATA_DIR, file);
                    const content = await fs.readFile(filePath, 'utf-8');
                    pages.push(JSON.parse(content));
                } catch (e) {
                    console.error(`Error reading file ${file}:`, e);
                }
            }
        }

        return pages.sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    } catch (e) {
        console.error('Error reading data directory:', e);
        return [];
    }
}

async function savePage(page: Page): Promise<void> {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, `${page.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(page, null, 2));
}

// GET all pages
export async function GET() {
    try {
        const pages = await getAllPages();
        return NextResponse.json(pages);
    } catch (error) {
        console.error('Error in GET /api/pages:', error);
        return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
    }
}

// POST create page
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, icon, content, parentId, isFavorite } = body;

        const page: Page = {
            id: uuidv4(),
            title: title || 'Untitled',
            icon: icon || '📄',
            content: content || JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
            parentId: parentId || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isFavorite: isFavorite || false,
        };

        await savePage(page);
        return NextResponse.json(page, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/pages:', error);
        return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
    }
}
