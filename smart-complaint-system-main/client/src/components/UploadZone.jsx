import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileCode, CheckCircle, Image as ImageIcon, X } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../config';

const UploadZone = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const handleRemove = () => {
        setFile(null);
        setPreview(null);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);

        // Preparation for Azure Upload
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('applianceType', 'General');
        formData.append('description', 'Service Request via Portal');

        try {
            // Pointing to the backend API we created
            const response = await axios.post(`${API_BASE}/api/upload`, formData);
            setUploadedUrl(response.data.url);
            setUploading(false);
        } catch (err) {
            console.error(err);
            setUploading(false);
            // Fallback for demo if backend isn't running
            alert('Backend connection required for Azure Storage. Check console.');
        }
    };

    return (
        <div className="glass-card fade-in-up" style={{ padding: '30px', maxWidth: '600px', width: '100%', margin: '0 auto' }}>
            <AnimatePresence mode="wait">
                {!uploadedUrl ? (
                    <motion.div
                        key="upload-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <h2 style={{ marginBottom: '20px', fontWeight: 600 }}>Upload Appliance Photo</h2>

                        {!preview ? (
                            <label className="upload-area" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '250px',
                                border: '2px dashed var(--glass-border)',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                transition: 'border-color 0.3s'
                            }}>
                                <Upload size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
                                <p style={{ color: 'var(--text-muted)' }}>Click or drag photo of your appliance</p>
                                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                            </label>
                        ) : (
                            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
                                <img src={preview} alt="Preview" style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
                                <button
                                    onClick={handleRemove}
                                    style={{
                                        position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)',
                                        border: 'none', borderRadius: '50%', width: '36px', height: '36px',
                                        color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        )}

                        <button
                            className="glow-button"
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            style={{ width: '100%', marginTop: '24px', position: 'relative', height: '50px' }}
                        >
                            {uploading ? 'Processing Image...' : 'Submit Service Request'}
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="upload-success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: 'center', padding: '20px 0' }}
                    >
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-glow)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                        }}>
                            <CheckCircle size={48} color="var(--accent)" />
                        </div>
                        <h2 style={{ marginBottom: '10px' }}>Upload Successful!</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                            Our technician will review your photo and contact you shortly.
                        </p>
                        <div className="glass-card" style={{ padding: '10px', fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '20px' }}>
                            Reference ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                        </div>
                        <button className="glow-button" onClick={() => { setFile(null); setPreview(null); setUploadedUrl(null); }}>
                            Done
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UploadZone;
