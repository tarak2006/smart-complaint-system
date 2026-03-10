import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, ShieldCheck, ArrowRight } from 'lucide-react';
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
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '20px'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', maxWidth: '480px' }}
            >
                {/* Header */}
                <div style={{ marginBottom: '50px', textAlign: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        style={{
                            display: 'inline-flex',
                            padding: '20px',
                            background: 'var(--gradient-primary)',
                            borderRadius: '16px',
                            marginBottom: '24px'
                        }}
                    >
                        <ShieldCheck size={40} color="white" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        style={{
                            fontSize: '2rem',
                            fontWeight: 700,
                            marginBottom: '12px',
                            background: 'var(--gradient-primary)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            color: 'var(--text-muted)',
                            fontSize: '1rem',
                            margin: 0
                        }}
                    >
                        {isLogin ? 'Sign in to access your UrbanCare portal' : 'Join our trusted appliance service network'}
                    </motion.p>
                </div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="glass-card"
                    style={{ padding: '50px 40px' }}
                >
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Name Input for Registration */}
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <label className="form-label">Full Name</label>
                                <div className="input-with-icon">
                                    <UserIcon size={18} className="input-icon" />
                                    <input
                                        required
                                        className="form-input"
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Email Input */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                        >
                            <label className="form-label">Email Address</label>
                            <div className="input-with-icon">
                                <Mail size={18} className="input-icon" />
                                <input
                                    required
                                    className="form-input"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </motion.div>

                        {/* Password Input */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label className="form-label">Password</label>
                            <div className="input-with-icon">
                                <Lock size={18} className="input-icon" />
                                <input
                                    required
                                    className="form-input"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </motion.div>

                        {/* Role Selection for Registration */}
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45 }}
                            >
                                <label className="form-label">Select Your Role</label>
                                <select
                                    className="form-input"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    style={{ paddingRight: '40px' }}
                                >
                                    <option>User</option>
                                    <option>Technician</option>
                                    <option>Admin</option>
                                </select>
                            </motion.div>
                        )}

                        {/* Messages */}
                        {successMsg && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    padding: '16px',
                                    background: 'rgba(34, 197, 94, 0.15)',
                                    border: '1px solid rgba(34, 197, 94, 0.5)',
                                    borderRadius: '10px',
                                    color: '#86efac',
                                    fontSize: '0.9rem',
                                    textAlign: 'center',
                                    fontWeight: 500
                                }}
                            >
                                {successMsg}
                            </motion.div>
                        )}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    padding: '16px',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid rgba(239, 68, 68, 0.5)',
                                    borderRadius: '10px',
                                    color: '#fca5a5',
                                    fontSize: '0.9rem',
                                    textAlign: 'center'
                                }}
                            >
                                {error}
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
                            transition={{ delay: 0.5 }}
                            style={{
                                width: '100%',
                                padding: '16px 32px',
                                fontSize: '1.05rem',
                                fontWeight: 600,
                                minHeight: '54px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                marginTop: '8px'
                            }}
                        >
                            {loading ? (
                                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                                    🔄
                                </motion.span>
                            ) : (
                                <>
                                    {isLogin ? (
                                        <>
                                            <LogIn size={18} />
                                            Sign In
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={18} />
                                            Create Account
                                        </>
                                    )}
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Auth Toggle */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.55 }}
                        style={{
                            marginTop: '40px',
                            paddingTop: '30px',
                            borderTop: '1px solid var(--glass-border)',
                            textAlign: 'center'
                        }}
                    >
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, marginBottom: '12px' }}>
                            {isLogin ? "Don't have an account yet?" : 'Already have an account?'}
                        </p>
                        <motion.button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                setSuccessMsg('');
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary)',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: 700,
                                padding: '8px 16px',
                                borderRadius: '8px',
                                transition: 'all 0.3s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(99, 102, 241, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'none';
                            }}
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                            <ArrowRight size={16} />
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* Footer Info */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    style={{
                        marginTop: '40px',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem'
                    }}
                >
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </motion.p>
            </motion.div>
        </div>
    );
};

export default AuthPage;
