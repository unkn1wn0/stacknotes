'use client';

import { useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { X, Moon, Sun, Monitor } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { theme, setTheme } = useSettingsStore();

    if (!isOpen) return null;

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
                </div>
            </div>
        </div>
    );
}
