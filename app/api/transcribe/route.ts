import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const apiKey = request.headers.get('X-Groq-API-Key');

        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key is required' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as Blob;
        const model = formData.get('model') as string || 'whisper-large-v3-turbo';

        if (!file) {
            return NextResponse.json(
                { error: 'Audio file is required' },
                { status: 400 }
            );
        }

        // Create form data for Groq API
        const groqFormData = new FormData();
        groqFormData.append('file', file, 'recording.webm');
        groqFormData.append('model', model);

        // Call Groq Whisper API
        const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            body: groqFormData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.error?.message || 'Transcription failed' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json({ text: data.text });
    } catch (error) {
        console.error('Transcription error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
