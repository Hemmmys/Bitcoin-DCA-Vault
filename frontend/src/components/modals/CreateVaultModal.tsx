import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createVault } from '../../lib/api';
import { useWallet } from '../../context/WalletContext';

interface CreateVaultModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function CreateVaultModal({ isOpen, onClose, onCreated }: CreateVaultModalProps) {
    const { isConnected, opnetConfig } = useWallet();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [scheduleType, setScheduleType] = useState<'daily' | 'weekly'>('daily');
    const [duration, setDuration] = useState('30');
    const [minDeposit, setMinDeposit] = useState('0.0001');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await createVault(
                {
                    name: name.trim(),
                    description: description.trim(),
                    scheduleType,
                    duration: parseInt(duration) || 30,
                    minDeposit: Math.round(parseFloat(minDeposit) * 100_000_000),
                },
                opnetConfig,
            );
            onCreated();
            onClose();
            setName('');
            setDescription('');
            setDuration('30');
            setMinDeposit('0.0001');
        } catch (e: any) {
            setError(e?.message || 'Failed to create vault');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="modal-content"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="modal-header">
                            <h2>Create Vault</h2>
                            <button onClick={onClose} className="modal-close">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Schedule Type Tabs */}
                        <div className="modal-tabs">
                            <button
                                className={`modal-tab ${scheduleType === 'daily' ? 'active' : ''}`}
                                onClick={() => setScheduleType('daily')}
                            >
                                Daily
                            </button>
                            <button
                                className={`modal-tab ${scheduleType === 'weekly' ? 'active' : ''}`}
                                onClick={() => setScheduleType('weekly')}
                            >
                                Weekly
                            </button>
                        </div>

                        {/* Form */}
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Vault Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. My BTC Accumulator"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description of the vault strategy..."
                                    className="form-input form-textarea"
                                    rows={3}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Duration ({scheduleType === 'daily' ? 'days' : 'weeks'})</label>
                                    <input
                                        type="number"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="form-input"
                                        min="1"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Min Deposit (BTC)</label>
                                    <input
                                        type="text"
                                        value={minDeposit}
                                        onChange={(e) => setMinDeposit(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="px-6 pb-2">
                                <div className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-xl">
                                    {error}
                                </div>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="modal-footer">
                            <button
                                onClick={handleSubmit}
                                disabled={!name.trim() || isSubmitting || !isConnected}
                                className="btn-primary w-full py-4 text-base font-bold rounded-2xl"
                            >
                                {!isConnected
                                    ? 'Connect Wallet First'
                                    : isSubmitting
                                    ? 'Creating...'
                                    : 'Create Vault'
                                }
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
