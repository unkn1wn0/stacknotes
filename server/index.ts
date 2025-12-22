import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_DIR = path.join(__dirname, 'data');

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Types
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

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Helper functions
async function getAllPages(): Promise<Page[]> {
    await ensureDataDir();
    const files = await fs.readdir(DATA_DIR);
    const pages: Page[] = [];

    for (const file of files) {
        if (file.endsWith('.json')) {
            const filePath = path.join(DATA_DIR, file);
            const content = await fs.readFile(filePath, 'utf-8');
            pages.push(JSON.parse(content));
        }
    }

    return pages.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
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
    await ensureDataDir();
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

// Routes

// GET all pages
app.get('/api/pages', async (req: Request, res: Response) => {
    try {
        const pages = await getAllPages();
        res.json(pages);
    } catch (error) {
        console.error('Error fetching pages:', error);
        res.status(500).json({ error: 'Failed to fetch pages' });
    }
});

// GET single page
app.get('/api/pages/:id', async (req: Request, res: Response) => {
    try {
        const page = await getPage(req.params.id);
        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }
        res.json(page);
    } catch (error) {
        console.error('Error fetching page:', error);
        res.status(500).json({ error: 'Failed to fetch page' });
    }
});

// POST create page
app.post('/api/pages', async (req: Request, res: Response) => {
    try {
        const { title, icon, content, parentId, isFavorite } = req.body;

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
        res.status(201).json(page);
    } catch (error) {
        console.error('Error creating page:', error);
        res.status(500).json({ error: 'Failed to create page' });
    }
});

// PUT update page
app.put('/api/pages/:id', async (req: Request, res: Response) => {
    try {
        const existingPage = await getPage(req.params.id);
        if (!existingPage) {
            return res.status(404).json({ error: 'Page not found' });
        }

        const updatedPage: Page = {
            ...existingPage,
            ...req.body,
            id: existingPage.id, // Prevent ID changes
            createdAt: existingPage.createdAt, // Preserve creation time
            updatedAt: new Date().toISOString(),
        };

        await savePage(updatedPage);
        res.json(updatedPage);
    } catch (error) {
        console.error('Error updating page:', error);
        res.status(500).json({ error: 'Failed to update page' });
    }
});

// DELETE page
app.delete('/api/pages/:id', async (req: Request, res: Response) => {
    try {
        const deleted = await deletePage(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Page not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting page:', error);
        res.status(500).json({ error: 'Failed to delete page' });
    }
});

// AI Proxy endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
    try {
        const { provider, apiKey, messages, context } = req.body;

        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        let response;

        if (provider === 'openai') {
            response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a helpful AI assistant integrated into a note-taking app called Stacknotes. Help the user with their notes, writing, and questions. Be concise but thorough.${context ? `\n\nCurrent page context:\n${context.substring(0, 2000)}` : ''}`,
                        },
                        ...messages,
                    ],
                    max_tokens: 1000,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'OpenAI API error');
            }

            const data = await response.json();
            res.json({ content: data.choices[0].message.content });

        } else if (provider === 'anthropic') {
            response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 1000,
                    system: `You are a helpful AI assistant integrated into a note-taking app called Stacknotes. Help the user with their notes, writing, and questions. Be concise but thorough.${context ? `\n\nCurrent page context:\n${context.substring(0, 2000)}` : ''}`,
                    messages: messages,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Anthropic API error');
            }

            const data = await response.json();
            res.json({ content: data.content[0].text });

        } else if (provider === 'google') {
            response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `You are a helpful AI assistant integrated into a note-taking app called Stacknotes. Help the user with their notes, writing, and questions. Be concise but thorough.${context ? `\n\nCurrent page context:\n${context.substring(0, 2000)}` : ''}\n\nUser: ${messages[messages.length - 1]?.content || ''}`,
                            }],
                        }],
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Google AI API error');
            }

            const data = await response.json();
            res.json({ content: data.candidates[0].content.parts[0].text });

        } else {
            return res.status(400).json({ error: 'Invalid AI provider' });
        }

    } catch (error) {
        console.error('AI API error:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'AI request failed' });
    }
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Stacknotes API server running at http://localhost:${PORT}`);
    console.log(`📁 Data directory: ${DATA_DIR}`);
});
