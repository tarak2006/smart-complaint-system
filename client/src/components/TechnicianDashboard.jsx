import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Package, Truck, AlertCircle, Bell, X, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../config';

const TechnicianDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/notifications`);
            setNotifications(response.data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get(`${API_BASE}/api/complaints`);
                setTasks(Array.isArray(response.data) ? response.data : [response.data]);
            } catch (err) {
                console.error('Failed to fetch tasks:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
        fetchNotifications();

        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000); // Poll every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const statusFlow = [
        'Pending',
        'Technician Assigned',
        'Pickup Scheduled',
        'Appliance Picked Up',
        'Repair In Progress',
        'Quality Check',
        'Ready for Delivery',
        'Delivered / Issue Resolved'
    ];

    const getStatusColor = (status) => {
        if (!status) return 'var(--text-muted)';
        if (status.includes('Pending')) return '#f59e0b';
        if (status.includes('In Progress')) return '#3b82f6';
        if (status.includes('Ready')) return '#10b981';
        if (status.includes('Delivered')) return '#8b5cf6';
        return 'var(--primary)';
    };

    const markAsRead = async (id) => {
        try {
            await axios.patch(`${API_BASE}/api/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const advanceStatus = async (id, currentStatus) => {
        const currentIndex = statusFlow.indexOf(currentStatus);
        const nextStatus = statusFlow[currentIndex + 1] || currentStatus;
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const technicianName = user.name || 'Unknown Technician';

        try {
            await axios.patch(`${API_BASE}/api/complaints/${id}`, { 
                status: nextStatus,
                technician: technicianName
            });
            setTasks(prev => prev.map(task =>
                task.complaintId === id ? { ...task, status: nextStatus, technician: technicianName } : task
            ));
        } catch (err) {
            console.error('Failed to advance status:', err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}
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
                        <Briefcase size={32} color="white" />
                    </div>
                    <div>
                        <h1 style={{ marginBottom: '5px', background: 'var(--gradient-primary)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Technician Dashboard
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {tasks.length} active task{tasks.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Alerts Section */}
            {notifications.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{ marginBottom: '50px' }}
                >
                    <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: 'var(--text-main)' }}>
                        <Bell size={24} color="var(--warning)" />
                        <span>Bot Alerts</span>
                        <span style={{ fontSize: '0.8rem', padding: '4px 12px', background: 'var(--warning)', color: '#fff', borderRadius: '20px', marginLeft: 'auto' }}>
                            {notifications.length}
                        </span>
                    </h2>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {notifications.map((notif, index) => (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + index * 0.05 }}
                                className="glass-card"
                                style={{
                                    padding: '18px 24px',
                                    borderLeft: '4px solid var(--warning)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: 'rgba(245, 158, 11, 0.08)'
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {notif.complaint_id ? `Ticket: ${notif.complaint_id}` : 'General Inquiry'} • {new Date(notif.created_at).toLocaleTimeString()}
                                    </div>
                                    <div style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 500 }}>{notif.message}</div>
                                </div>
                                <button
                                    onClick={() => markAsRead(notif.id)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                                        e.target.style.color = 'var(--primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                        e.target.style.color = 'var(--text-muted)';
                                    }}
                                    title="Dismiss"
                                >
                                    <X size={18} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Tasks Section */}
            <div>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '20px', color: 'var(--text-main)' }}>
                    Active Repair Orders
                </h2>
                {loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}
                    >
                        Loading tasks...
                    </motion.div>
                ) : tasks.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card"
                        style={{ padding: '60px 40px', textAlign: 'center' }}
                    >
                        <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: '16px', opacity: 0.6 }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                            Great! No active tasks. Relax until new assignments arrive.
                        </p>
                    </motion.div>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {tasks.map((task, index) => (
                            <motion.div
                                key={task.complaintId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 + index * 0.08 }}
                                className="glass-card"
                                style={{
                                    padding: '28px',
                                    borderLeft: `4px solid ${getStatusColor(task.status)}`
                                }}
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px' }}>
                                    {/* Task Info */}
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Ticket ID
                                        </p>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '16px' }}>
                                            {task.complaintId}
                                        </p>

                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Appliance
                                        </p>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '12px' }}>
                                            {task.applianceType} - {task.applianceBrand}
                                        </p>

                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Customer
                                        </p>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                            {task.customerName || task.userName}
                                        </p>
                                    </div>

                                    {/* Service Info */}
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Issue Description
                                        </p>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5', marginBottom: '16px' }}>
                                            {task.issue || task.description || 'No details provided'}
                                        </p>

                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Address
                                        </p>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                            <AlertCircle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                                            {task.address || 'Not provided'}
                                        </p>
                                    </div>

                                    {/* Status & Actions */}
                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                Current Status
                                            </p>
                                            <div style={{
                                                padding: '12px 16px',
                                                background: `${getStatusColor(task.status)}20`,
                                                borderLeft: `3px solid ${getStatusColor(task.status)}`,
                                                borderRadius: '8px',
                                                marginBottom: '20px'
                                            }}>
                                                <p style={{ color: getStatusColor(task.status), fontWeight: 600, fontSize: '0.95rem' }}>
                                                    {task.status || 'Pending'}
                                                </p>
                                            </div>

                                            {task.technician && (
                                                <div>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                        Assigned To
                                                    </p>
                                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                                        {task.technician}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => advanceStatus(task.complaintId, task.status || 'Pending')}
                                            disabled={task.status === 'Delivered / Issue Resolved'}
                                            className="glow-button"
                                            style={{
                                                width: '100%',
                                                padding: '12px 20px',
                                                fontSize: '0.95rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                marginTop: '12px',
                                                opacity: task.status === 'Delivered / Issue Resolved' ? 0.5 : 1,
                                                cursor: task.status === 'Delivered / Issue Resolved' ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            <Truck size={16} />
                                            {task.status === 'Ready for Delivery' ? 'Mark Delivered' : 'Next Stage'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default TechnicianDashboard;
