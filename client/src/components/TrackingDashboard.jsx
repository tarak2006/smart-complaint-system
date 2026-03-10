import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, TrendingUp, MapPin, Package, Wrench, Truck, Award } from 'lucide-react';

const TrackingDashboard = ({ data, onBack }) => {
    const stages = [
        { name: 'Complaint Registered', icon: '📋' },
        { name: 'Technician Assigned', icon: '👤' },
        { name: 'Pickup Scheduled', icon: '📅' },
        { name: 'Appliance Picked Up', icon: '🚗' },
        { name: 'Repair In Progress', icon: '🔧' },
        { name: 'Quality Check', icon: '✅' },
        { name: 'Ready for Delivery', icon: '📦' },
        { name: 'Delivered / Issue Resolved', icon: '🎉' }
    ];

    const currentStatus = data.status || 'Complaint Registered';
    const currentStep = stages.findIndex(s => s.name === currentStatus);
    const workCompleted = Math.round(((currentStep + 1) / stages.length) * 100);
    const daysRemaining = data.estimatedDays || 3;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}
        >
            {/* Header */}
            <div style={{ marginBottom: '50px' }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}
                >
                    <div style={{
                        padding: '16px',
                        background: 'var(--gradient-primary)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <TrendingUp size={32} color="white" />
                    </div>
                    <div>
                        <h1 style={{ marginBottom: '5px', background: 'var(--gradient-primary)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Complaint Track & Trace
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Real-time updates on your repair status
                        </p>
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="glass-card"
                style={{ padding: '50px 40px' }}
            >
                {/* Ticket ID Section */}
                <div style={{ textAlign: 'center', marginBottom: '50px', paddingBottom: '40px', borderBottom: '1px solid var(--glass-border)' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Your Ticket ID
                    </p>
                    <h2 style={{ fontSize: '3rem', fontWeight: 800, background: 'var(--gradient-primary)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '20px' }}>
                        {data.complaintId}
                    </h2>
                    <div style={{
                        display: 'inline-block',
                        padding: '12px 24px',
                        borderRadius: '50px',
                        background: `${currentStep <= stages.length - 1 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)'}`,
                        border: `1px solid ${currentStep <= stages.length - 1 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(139, 92, 246, 0.5)'}`,
                        color: currentStep <= stages.length - 1 ? '#10b981' : '#8b5cf6'
                    }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{currentStatus}</span>
                    </div>
                </div>

                {/* Progress Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '50px' }}
                >
                    <div style={{
                        padding: '24px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '16px',
                        textAlign: 'center'
                    }}>
                        <Clock size={32} color="var(--primary)" style={{ marginBottom: '12px' }} />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Estimated Time Left
                        </p>
                        <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                            {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'}
                        </p>
                    </div>

                    <div style={{
                        padding: '24px',
                        background: 'rgba(236, 72, 153, 0.1)',
                        border: '1px solid rgba(236, 72, 153, 0.3)',
                        borderRadius: '16px',
                        textAlign: 'center'
                    }}>
                        <TrendingUp size={32} color="var(--secondary)" style={{ marginBottom: '12px' }} />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Overall Progress
                        </p>
                        <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--secondary)' }}>
                            {workCompleted}%
                        </p>
                    </div>
                </motion.div>

                {/* Progress Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    style={{ marginBottom: '50px' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>Repair Progress Timeline</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Step {currentStep + 1} of {stages.length}</p>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${workCompleted}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                            style={{ height: '100%', background: 'var(--gradient-primary)', borderRadius: '10px' }}
                        />
                    </div>
                </motion.div>

                {/* Workflow Steps */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{ marginBottom: '50px', paddingBottom: '40px', borderBottom: '1px solid var(--glass-border)' }}
                >
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '28px', color: 'var(--text-main)' }}>
                        Service Journey
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                        {stages.map((stage, index) => (
                            <motion.div
                                key={stage.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.05 }}
                                style={{
                                    padding: '20px',
                                    background: index <= currentStep ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                    border: `2px solid ${index <= currentStep ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{
                                    fontSize: '1.8rem',
                                    marginBottom: '8px'
                                }}>
                                    {stage.icon}
                                </div>
                                <p style={{
                                    fontSize: '0.8rem',
                                    color: index <= currentStep ? 'var(--text-main)' : 'var(--text-muted)',
                                    lineHeight: '1.3',
                                    fontWeight: index === currentStep ? 600 : 400
                                }}>
                                    {stage.name}
                                </p>
                                {index === currentStep && (
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        style={{ fontSize: '1.2rem', marginTop: '8px' }}>
                                        ●
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Service Details */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    style={{ marginBottom: '40px' }}
                >
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', color: 'var(--text-main)' }}>
                        Appliance & Service Details
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        <div style={{
                            padding: '20px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px'
                        }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Appliance Type
                            </p>
                            <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                {data.applianceType}
                            </p>
                        </div>
                        <div style={{
                            padding: '20px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px'
                        }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Brand Name
                            </p>
                            <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                {data.applianceBrand || 'Not specified'}
                            </p>
                        </div>
                    </div>
                    <div style={{
                        padding: '20px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        marginBottom: '24px'
                    }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Issue Description
                        </p>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6', fontStyle: 'italic' }}>
                            "{data.issueDescription || data.issue || 'No description provided'}"
                        </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div style={{
                            padding: '20px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px'
                        }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Preferred Pickup Date
                            </p>
                            <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                {data.pickupDate || 'Not scheduled'}
                            </p>
                        </div>
                        <div style={{
                            padding: '20px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px'
                        }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Customer Name
                            </p>
                            <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                {data.customerName || data.userName}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Service Address */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    style={{
                        padding: '24px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '12px',
                        marginBottom: '40px'
                    }}
                >
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={16} /> Service Location
                    </p>
                    <p style={{ fontSize: '1rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                        {data.address || 'No address provided'}
                    </p>
                </motion.div>

                {/* Back Button */}
                <motion.button
                    className="glow-button"
                    onClick={onBack}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    style={{
                        width: '100%',
                        padding: '16px 32px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        minHeight: '54px'
                    }}
                >
                    Back to Portal
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default TrackingDashboard;
