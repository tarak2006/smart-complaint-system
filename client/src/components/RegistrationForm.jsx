import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, User, Mail, Phone, Home, AlertCircle, Calendar, Image, Package } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../config';

const RegistrationForm = ({ user, onSuccess }) => {
    const [formData, setFormData] = useState({
        userName: user?.name || '',
        phone: '',
        email: user?.email || '',
        address: '',
        applianceType: 'Washing Machine',
        applianceBrand: '',
        description: '',
        pickupDate: '',
        priority: 'Normal',
        image: null,
        imagePreview: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let uploadedUrl = null;

            if (formData.image) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', formData.image);
                
                const uploadRes = await axios.post(`${API_BASE}/api/upload`, uploadFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedUrl = uploadRes.data.url;
            }

            const complaintData = {
                userId: user?.id || 1,
                userName: formData.userName,
                email: formData.email,
                phone: formData.phone,
                applianceType: formData.applianceType,
                applianceBrand: formData.applianceBrand,
                issue: formData.description,
                address: formData.address,
                date: formData.pickupDate,
                imageUrl: uploadedUrl
            };

            const response = await fetch(`${API_BASE}/api/complaints`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(complaintData)
            });

            const result = await response.json();

            if (result.success) {
                onSuccess({ complaintId: result.ticketId, ...formData, imageUrl: uploadedUrl });
            } else {
                setError(result.message || 'Failed to register complaint.');
            }
        } catch (err) {
            console.error('Registration Error:', err);
            setError(err.response?.data?.error || 'Could not register complaint. Check server logs.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                image: file,
                imagePreview: URL.createObjectURL(file)
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}
        >
            {/* Header */}
            <div style={{ marginBottom: '50px', textAlign: 'center' }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}
                >
                    <div style={{ 
                        padding: '16px', 
                        background: 'var(--gradient-primary)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <ClipboardList size={32} color="white" />
                    </div>
                </motion.div>
                <h1 style={{ marginBottom: '10px', background: 'var(--gradient-primary)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Register Your Complaint
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                    Fill in your appliance details and get instant support
                </p>
            </div>

            {/* Main Form Card */}
            <motion.div
                className="glass-card"
                style={{ padding: '50px 40px' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <form onSubmit={handleSubmit}>
                    {/* Personal Information Section */}
                    <div style={{ marginBottom: '50px' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '30px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <User size={20} color="var(--primary)" />
                            Personal Information
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
                                <label className="form-label">Full Name</label>
                                <div className="input-with-icon">
                                    <User size={18} className="input-icon" />
                                    <input
                                        required
                                        className="form-input"
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.userName}
                                        onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                    />
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                                <label className="form-label">Phone Number</label>
                                <div className="input-with-icon">
                                    <Phone size={18} className="input-icon" />
                                    <input
                                        required
                                        className="form-input"
                                        type="tel"
                                        placeholder="+91 9876543210"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                                <label className="form-label">Email Address</label>
                                <div className="input-with-icon">
                                    <Mail size={18} className="input-icon" />
                                    <input
                                        required
                                        className="form-input"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                                <label className="form-label">Street Address</label>
                                <div className="input-with-icon">
                                    <Home size={18} className="input-icon" />
                                    <input
                                        required
                                        className="form-input"
                                        type="text"
                                        placeholder="123 Main St, City, State"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Appliance Information Section */}
                    <div style={{ marginBottom: '50px', paddingTop: '30px', borderTop: '1px solid var(--glass-border)' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '30px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Package size={20} color="var(--secondary)" />
                            Appliance Details
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                                <label className="form-label">Appliance Type</label>
                                <select
                                    className="form-input"
                                    value={formData.applianceType}
                                    onChange={(e) => setFormData({ ...formData, applianceType: e.target.value })}
                                    style={{ paddingRight: '40px' }}
                                >
                                    <option>Washing Machine</option>
                                    <option>Refrigerator</option>
                                    <option>Air Conditioner</option>
                                    <option>Microwave Oven</option>
                                    <option>Television</option>
                                    <option>Dishwasher</option>
                                    <option>Oven</option>
                                </select>
                            </motion.div>

                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                                <label className="form-label">Brand Name</label>
                                <input
                                    required
                                    className="form-input"
                                    type="text"
                                    placeholder="Samsung, LG, etc."
                                    value={formData.applianceBrand}
                                    onChange={(e) => setFormData({ ...formData, applianceBrand: e.target.value })}
                                />
                            </motion.div>

                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Issue Description</label>
                                <div className="input-with-icon">
                                    <AlertCircle size={18} className="input-icon" style={{ top: '18px' }} />
                                    <textarea
                                        required
                                        className="form-input"
                                        placeholder="Describe the problem in detail..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        style={{ paddingLeft: '42px', minHeight: '120px', resize: 'vertical' }}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Service Details Section */}
                    <div style={{ marginBottom: '50px', paddingTop: '30px', borderTop: '1px solid var(--glass-border)' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '30px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Calendar size={20} color="var(--success)" />
                            Service Schedule
                        </h3>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                            <label className="form-label">Preferred Pickup Date</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={18} style={{
                                    position: 'absolute',
                                    left: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--primary)',
                                    pointerEvents: 'none',
                                    zIndex: 1
                                }} />
                                <input
                                    required
                                    className="form-input"
                                    type="date"
                                    value={formData.pickupDate}
                                    onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                                    style={{
                                        paddingLeft: '50px',
                                        fontSize: '1.1rem',
                                        fontWeight: 500
                                    }}
                                />
                            </div>
                            <p style={{ color: 'var(--text-muted)', marginTop: '10px', fontSize: '0.9rem' }}>
                                Choose a date when our technician can pick up your appliance
                            </p>
                        </motion.div>
                    </div>

                    {/* Photo Upload Section */}
                    <div style={{ marginBottom: '40px', paddingTop: '30px', borderTop: '1px solid var(--glass-border)' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '30px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Image size={20} color="var(--warning)" />
                            Evidence Photo
                        </h3>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
                            <label className="form-label">Upload Photo (Optional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="form-input"
                                onChange={handleImageChange}
                                style={{ padding: '16px', cursor: 'pointer' }}
                            />
                            {formData.imagePreview && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{ marginTop: '20px' }}
                                >
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '12px', fontSize: '0.9rem' }}>Preview:</p>
                                    <img 
                                        src={formData.imagePreview} 
                                        alt="Preview" 
                                        style={{
                                            maxWidth: '200px',
                                            height: '200px',
                                            objectFit: 'cover',
                                            borderRadius: '12px',
                                            border: '2px solid var(--primary)',
                                            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)'
                                        }}
                                    />
                                </motion.div>
                            )}
                        </motion.div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                padding: '16px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.5)',
                                borderRadius: '10px',
                                marginBottom: '30px',
                                color: '#fca5a5',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                        className="glow-button"
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        style={{
                            width: '100%',
                            padding: '16px 32px',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            minHeight: '54px',
                            marginTop: '20px'
                        }}
                    >
                        {loading ? '🔄 Processing...' : '✨ Generate Complaint ID'}
                    </motion.button>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default RegistrationForm;
