'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Loader2, X } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';

interface VoiceRecorderProps {
    onTranscription: (text: string) => void;
    externalTrigger?: boolean;
    onExternalTriggerHandled?: () => void;
}

export function VoiceRecorder({ onTranscription, externalTrigger, onExternalTriggerHandled }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const isRecordingRef = useRef(false); // Ref to track recording state for async callbacks
    const silenceStartRef = useRef<number | null>(null);
    const { groqApiKey } = useSettingsStore();

    // Handle external trigger from Cmd+K
    useEffect(() => {
        if (externalTrigger && !isRecording && !isProcessing) {
            startRecording();
            onExternalTriggerHandled?.();
        }
    }, [externalTrigger]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            console.log('Stopping recording...');
            isRecordingRef.current = false;
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            // Cleanup audio analysis
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
            analyserRef.current = null;
        }
    }, []);

    const startRecording = async () => {
        if (!groqApiKey) {
            setError('Please set your Groq API key in Settings first');
            setTimeout(() => setError(null), 3000);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Setup audio analysis for silence detection
            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;
            const analyser = audioContext.createAnalyser();
            analyserRef.current = analyser;
            analyser.fftSize = 256;
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const SILENCE_THRESHOLD = 15; // Slightly higher threshold
            const SILENCE_DURATION = 2000; // 2 seconds of silence to stop
            silenceStartRef.current = null;

            const checkAudioLevel = () => {
                // Check if we should still be running
                if (!isRecordingRef.current || !analyserRef.current) {
                    return;
                }

                analyserRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                setAudioLevel(Math.min(100, average * 2));

                if (average < SILENCE_THRESHOLD) {
                    if (silenceStartRef.current === null) {
                        silenceStartRef.current = Date.now();
                        console.log('Silence detected, starting timer...');
                    } else {
                        const silenceDuration = Date.now() - silenceStartRef.current;
                        if (silenceDuration > SILENCE_DURATION) {
                            console.log('Silence duration exceeded, stopping...');
                            stopRecording();
                            return;
                        }
                    }
                } else {
                    // Reset silence timer when sound is detected
                    if (silenceStartRef.current !== null) {
                        console.log('Sound detected, resetting silence timer');
                        silenceStartRef.current = null;
                    }
                }

                animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
            };

            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                console.log('MediaRecorder stopped');
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());

                // Only process if we have actual audio data
                if (chunksRef.current.length > 0) {
                    await processAudio(audioBlob);
                } else {
                    setShowDialog(false);
                }
            };

            mediaRecorder.start(100); // Request data every 100ms for more granular chunks
            isRecordingRef.current = true;
            setIsRecording(true);
            setShowDialog(true);
            setError(null);

            // Start audio level monitoring after a small delay
            // to skip initial silence before user starts speaking
            setTimeout(() => {
                if (isRecordingRef.current) {
                    checkAudioLevel();
                }
            }, 500);
        } catch (err) {
            setError('Microphone access denied');
            setTimeout(() => setError(null), 3000);
        }
    };

    const processAudio = async (audioBlob: Blob) => {
        setIsProcessing(true);
        setShowDialog(true);
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.webm');
            formData.append('model', 'whisper-large-v3-turbo');

            const response = await fetch('/api/transcribe', {
                method: 'POST',
                headers: {
                    'X-Groq-API-Key': groqApiKey,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Transcription failed');
            }

            const data = await response.json();
            if (data.text) {
                onTranscription(data.text);
            }
            setShowDialog(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Transcription failed');
            setTimeout(() => {
                setError(null);
                setShowDialog(false);
            }, 3000);
        } finally {
            setIsProcessing(false);
        }
    };

    const cancelRecording = () => {
        isRecordingRef.current = false;
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            streamRef.current?.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
        setShowDialog(false);
        setIsProcessing(false);

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    };

    return (
        <>
            {/* Mic Button in header */}
            <div className="voice-recorder">
                <button
                    className={`voice-recorder-btn ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                    title={isRecording ? 'Stop recording' : 'Start voice dictation'}
                >
                    {isProcessing ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : isRecording ? (
                        <Square size={16} />
                    ) : (
                        <Mic size={18} />
                    )}
                </button>
                {error && !showDialog && (
                    <div className="voice-recorder-error">
                        {error}
                    </div>
                )}
            </div>

            {/* Floating Dialog at bottom */}
            {showDialog && (
                <div className="voice-dialog-overlay">
                    <div className="voice-dialog">
                        <div className="voice-dialog-content">
                            {isRecording ? (
                                <>
                                    <div className="voice-dialog-icon recording">
                                        <Mic size={24} />
                                        <div
                                            className="voice-dialog-level"
                                            style={{ transform: `scaleY(${audioLevel / 100})` }}
                                        />
                                    </div>
                                    <div className="voice-dialog-text">
                                        <div className="voice-dialog-title">Listening...</div>
                                        <div className="voice-dialog-subtitle">Speak now • Stops after 2s of silence</div>
                                    </div>
                                </>
                            ) : isProcessing ? (
                                <>
                                    <div className="voice-dialog-icon processing">
                                        <Loader2 size={24} className="animate-spin" />
                                    </div>
                                    <div className="voice-dialog-text">
                                        <div className="voice-dialog-title">Transcribing...</div>
                                        <div className="voice-dialog-subtitle">Converting speech to text</div>
                                    </div>
                                </>
                            ) : error ? (
                                <>
                                    <div className="voice-dialog-icon error">
                                        <X size={24} />
                                    </div>
                                    <div className="voice-dialog-text">
                                        <div className="voice-dialog-title">Error</div>
                                        <div className="voice-dialog-subtitle">{error}</div>
                                    </div>
                                </>
                            ) : null}
                        </div>
                        <button
                            className="voice-dialog-close"
                            onClick={cancelRecording}
                            title="Cancel"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
