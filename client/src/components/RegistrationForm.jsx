import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, User, Home, AlertCircle, Calendar } from 'lucide-react';
import axios from 'axios';

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

            // Step 1: Upload image if exists
            if (formData.image) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', formData.image);
                
                const uploadRes = await axios.post('http://localhost:5000/api/upload', uploadFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedUrl = uploadRes.data.url;
            }

            // Step 2: Register complaint with image URL
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

            const response = await fetch('http://localhost:5000/api/complaints', {
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card"
            style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px' }}>
                <ClipboardList color="var(--primary)" />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 500, letterSpacing: '0.5px' }}>Register Complaint</h2>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Full Name</label>
                    <div className="input-with-icon">
                        <User size={16} className="input-icon" />
                        <input
                            required
                            className="form-input"
                            type="text"
                            placeholder="John Doe"
                            value={formData.userName}
                            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="form-label">Phone Number</label>
                    <input
                        required
                        className="form-input"
                        type="tel"
                        placeholder="+91 9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>

                <div>
                    <label className="form-label">Email Address</label>
                    <input
                        required
                        className="form-input"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Address</label>
                    <input
                        required
                        className="form-input"
                        type="text"
                        placeholder="123 Main St, City, State"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                </div>

                <div>
                    <label className="form-label">Appliance Type</label>
                    <select
                        className="form-input"
                        value={formData.applianceType}
                        onChange={(e) => setFormData({ ...formData, applianceType: e.target.value })}
                    >
                        <option>Washing Machine</option>
                        <option>Refrigerator</option>
                        <option>Air Conditioner</option>
                        <option>Microwave Oven</option>
                        <option>Television</option>
                    </select>
                </div>

                <div>
                    <label className="form-label">Appliance Brand</label>
                    <input
                        required
                        className="form-input"
                        type="text"
                        placeholder="Samsung, LG, etc."
                        value={formData.applianceBrand}
                        onChange={(e) => setFormData({ ...formData, applianceBrand: e.target.value })}
                    />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Issue Description</label>
                    <textarea
                        required
                        className="form-input"
                        rows="3"
                        placeholder="Describe the problem..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        style={{ resize: 'none' }}
                    />
                </div>

                <div>
                    <label className="form-label">Preferred Pickup Date</label>
                    <input
                        required
                        className="form-input"
                        type="date"
                        value={formData.pickupDate}
                        onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                    />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Evidence Photo (Optional)</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="form-input"
                        onChange={handleImageChange}
                        style={{ padding: '8px' }}
                    />
                    {formData.imagePreview && (
                        <div style={{ marginTop: '10px', position: 'relative', width: '100px', height: '100px' }}>
                            <img 
                                src={formData.imagePreview} 
                                alt="Preview" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--glass-border)' }} 
                            />
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', gridColumn: 'span 2' }}>
                    {error && <p style={{ color: '#ff4d4d', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}
                    <button
                        className="glow-button"
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? 'Processing...' : 'Generate Complaint ID'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default RegistrationForm;
