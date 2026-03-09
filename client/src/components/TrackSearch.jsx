import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Hash, Loader2 } from 'lucide-react';
import axios from 'axios';

const TrackSearch = ({ onSearchResult }) => {
    const [complaintId, setComplaintId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!complaintId.trim()) return;

        setLoading(true);
        setError('');

        try {
            const response = await axios.get(`http://localhost:5000/api/complaints/${complaintId.trim()}`);
            onSearchResult(response.data);
        } catch (err) {
            console.error(err);
            setError('Complaint ID not found. Please check and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card fade-in-up"
            style={{ padding: '30px', maxWidth: '500px', width: '100%' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                <Search color="var(--accent)" />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Track Your Request</h2>
            </div>

            <form onSubmit={handleSearch}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Enter Complaint ID
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Hash size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--primary)' }} />
                        <input
                            required
                            className="form-input"
                            type="text"
                            placeholder="AST-2026-XXXXXX"
                            value={complaintId}
                            onChange={(e) => setComplaintId(e.target.value.toUpperCase())}
                            style={{ width: '100%', paddingLeft: '40px' }}
                        />
                    </div>
                    {error && <p style={{ color: '#ff4d4d', fontSize: '0.8rem', marginTop: '8px' }}>{error}</p>}
                </div>

                <button
                    className="glow-button"
                    type="submit"
                    disabled={loading || !complaintId.trim()}
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Track Progress'}
                </button>
            </form>

            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Tip: You can find your Complaint ID in the confirmation email sent after registration.
            </div>
        </motion.div>
    );
};

export default TrackSearch;
