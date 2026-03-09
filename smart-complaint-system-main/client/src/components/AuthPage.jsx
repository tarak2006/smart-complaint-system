import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../config';

const AuthPage = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'User'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');

        const endpoint = isLogin ? 'login' : 'register';
        try {
            const response = await axios.post(`${API_BASE}/api/auth/${endpoint}`, formData);
            if (isLogin) {
                // Login: go to dashboard
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                onAuthSuccess(response.data.user);
            } else {
                // Signup: show success message and switch to login
                setSuccessMsg('Account created successfully! Please log in.');
                setFormData({ name: '', email: '', password: '', role: 'User' });
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed. Please check if the server is running and your credentials are correct.');
            console.error('Auth Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{ padding: '40px', width: '100%', maxWidth: '400px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '12px',
                        background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 20px'
                    }}>
                        <ShieldCheck color="var(--primary)" size={28} />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', fontWeight: 500 }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{isLogin ? 'Login to your UrbanCare portal' : 'Join our service network'}</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {!isLogin && (
                        <div className="input-with-icon">
                            <UserIcon size={18} className="input-icon" />
                            <input
                                required
                                className="form-input"
                                type="text"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    )}
                    <div className="input-with-icon">
                        <Mail size={18} className="input-icon" />
                        <input
                            required
                            className="form-input"
                            type="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="input-with-icon">
                        <Lock size={18} className="input-icon" />
                        <input
                            required
                            className="form-input"
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    {!isLogin && (
                        <div>
                            <label className="form-label" style={{ marginBottom: '10px' }}>Select Role</label>
                            <select
                                className="form-input"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option>User</option>
                                <option>Technician</option>
                                <option>Admin</option>
                            </select>
                        </div>
                    )}

                    {successMsg && <p style={{ color: '#22c55e', fontSize: '0.85rem', textAlign: 'center', padding: '10px', background: 'rgba(34,197,94,0.1)', borderRadius: '8px' }}>{successMsg}</p>}
                    {error && <p style={{ color: '#ff4d4d', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}

                    <button className="glow-button" type="submit" disabled={loading} style={{ marginTop: '10px', width: '100%' }}>
                        {loading ? 'Authenticating...' : isLogin ? 'Login' : 'Continue ->'}
                    </button>
                </form>

                <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', marginLeft: '5px', fontWeight: 600 }}
                    >
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
