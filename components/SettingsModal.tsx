'use client';

import { useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { X, Moon, Sun, Monitor, Mic, Eye, EyeOff } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { theme, setTheme, groqApiKey, setGroqApiKey } = useSettingsStore();
    const [showApiKey, setShowApiKey] = useState(false);
    const [tempApiKey, setTempApiKey] = useState(groqApiKey);

    if (!isOpen) return null;

    const handleSaveApiKey = () => {
        setGroqApiKey(tempApiKey);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Settings</h2>
                    <button className="btn-icon" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                <div className="modal-body">
                    {/* Appearance Section */}
                    <div className="settings-section">
                        <div className="settings-section-title">Appearance</div>
                        <div className="settings-row">
                            <div>
                                <div className="settings-label">Theme</div>
                                <div className="settings-description">Choose your preferred color scheme</div>
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                                <button
                                    className={`btn-icon ${theme === 'light' ? 'active' : ''}`}
                                    onClick={() => setTheme('light')}
                                    title="Light"
                                    style={{
                                        background: theme === 'light' ? 'var(--bg-active)' : undefined,
                                        color: theme === 'light' ? 'var(--color-primary)' : undefined,
                                    }}
                                >
                                    <Sun size={16} />
                                </button>
                                <button
                                    className={`btn-icon ${theme === 'dark' ? 'active' : ''}`}
                                    onClick={() => setTheme('dark')}
                                    title="Dark"
                                    style={{
                                        background: theme === 'dark' ? 'var(--bg-active)' : undefined,
                                        color: theme === 'dark' ? 'var(--color-primary)' : undefined,
                                    }}
                                >
                                    <Moon size={16} />
                                </button>
                                <button
                                    className={`btn-icon ${theme === 'system' ? 'active' : ''}`}
                                    onClick={() => setTheme('system')}
                                    title="System"
                                    style={{
                                        background: theme === 'system' ? 'var(--bg-active)' : undefined,
                                        color: theme === 'system' ? 'var(--color-primary)' : undefined,
                                    }}
                                >
                                    <Monitor size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Voice Dictation Section */}
                    <div className="settings-section">
                        <div className="settings-section-title">
                            <Mic size={12} style={{ marginRight: 4, display: 'inline' }} />
                            Voice Dictation
                        </div>
                        <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                            <div>
                                <div className="settings-label">Groq API Key</div>
                                <div className="settings-description">Required for voice-to-text transcription</div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input
                                        type={showApiKey ? 'text' : 'password'}
                                        className="settings-input"
                                        style={{ width: '100%', paddingRight: 36 }}
                                        value={tempApiKey}
                                        onChange={(e) => setTempApiKey(e.target.value)}
                                        placeholder="gsk_..."
                                    />
                                    <button
                                        className="btn-icon"
                                        style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}
                                        onClick={() => setShowApiKey(!showApiKey)}
                                    >
                                        {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSaveApiKey}
                                    disabled={tempApiKey === groqApiKey}
                                >
                                    Save
                                </button>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                                Get your API key from <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">console.groq.com</a>
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div
                        style={{
                            marginTop: 24,
                            padding: 16,
                            background: 'var(--bg-secondary)',
                            borderRadius: 8,
                            fontSize: 13,
                            color: 'var(--text-secondary)',
                        }}
                    >
                        <strong style={{ color: 'var(--text-primary)' }}>Note:</strong> All data is stored
                        locally in your browser. Your API key is never sent to our servers.
                    </div>
                    <div className="settings-row">
                        <div>
                            <div className="settings-label">Version</div>
                            <div className="settings-description">Current application version</div>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                            Stacknotes 0.2 Unstable
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
