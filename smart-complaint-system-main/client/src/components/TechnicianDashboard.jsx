import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { Briefcase, Clipboard, CheckCircle, Package, Truck, AlertCircle, Bell, X } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../config';

const TechnicianDashboard = () => {
    const [chatOpen, setChatOpen] = useState(false);
    const [chatComplaintId, setChatComplaintId] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
        // Fetch chat messages for a complaint
        const fetchChatMessages = async (complaintId) => {
            setChatLoading(true);
            try {
                const res = await axios.get(`${API_BASE}/api/chat/${complaintId}`);
                setChatMessages(res.data);
            } catch (err) {
                setChatMessages([]);
            } finally {
                setChatLoading(false);
            }
        };

        // Send chat message
        const sendChatMessage = async () => {
            if (!chatInput.trim() || !chatComplaintId) return;
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            try {
                await axios.post(`${API_BASE}/api/chat`, {
                    complaintId: chatComplaintId,
                    senderRole: 'Technician',
                    senderId: user.id,
                    message: chatInput
                });
                setChatInput('');
                fetchChatMessages(chatComplaintId);
            } catch (err) {}
        };
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="tech-dashboard fade-in-up"
            style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}
        >
            <div style={{ marginBottom: '40px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px' }}>
                <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: 500 }}>
                    <Briefcase color="var(--primary)" /> Assigned Tasks
                </h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.9rem' }}>Manage your active repair orders and update status.</p>
            </div>

            {notifications.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: 'var(--accent)' }}>
                        <Bell size={20} /> Active Bot Alerts
                    </h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {notifications.map(notif => (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card"
                                style={{ padding: '15px 20px', borderLeft: '4px solid var(--accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 107, 107, 0.05)' }}
                            >
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                        {notif.complaint_id ? `Ticket: ${notif.complaint_id}` : 'General Inquiry'} • {new Date(notif.created_at).toLocaleTimeString()}
                                    </div>
                                    <div style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{notif.message}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                        onClick={() => markAsRead(notif.id)}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px' }}
                                        title="Mark as Read"
                                    >
                                        <X size={18} />
                                    </button>
                                    {notif.complaint_id && (
                                        <button
                                            className="glow-button"
                                            style={{ padding: '6px 14px', fontSize: '0.85rem', background: 'var(--accent)', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                            onClick={() => {
                                                setChatOpen(true);
                                                setChatComplaintId(notif.complaint_id);
                                                fetchChatMessages(notif.complaint_id);
                                                markAsRead(notif.id);
                                            }}
                                        >
                                            Accept & Chat
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gap: '20px' }}>
                {tasks.map(task => (
                    <motion.div
                        key={task.complaintId}
                        className="glass-card"
                        style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent)' }}>{task.complaintId}</span>
                                <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}>{task.applianceType}</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', marginBottom: '5px' }}>
                                <strong>Customer:</strong> {task.customerName}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <AlertCircle size={14} /> {task.address || 'Address not provided'}
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Status</div>
                                <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{task.status || 'Pending'}</div>
                            </div>
                            <button
                                onClick={() => advanceStatus(task.complaintId, task.status || 'Pending')}
                                className="glow-button"
                                style={{ padding: '10px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
                                disabled={task.status === 'Delivered / Issue Resolved'}
                            >
                                <Truck size={16} /> {task.status === 'Ready for Delivery' ? 'Mark Delivered' : 'Next Stage'}
                            </button>
                            <button
                                className="glow-button"
                                style={{ padding: '8px 16px', fontSize: '0.85rem', marginTop: '5px', background: 'var(--accent)', color: 'white' }}
                                onClick={() => {
                                    setChatOpen(true);
                                    setChatComplaintId(task.complaintId);
                                    fetchChatMessages(task.complaintId);
                                }}
                            >
                                <MessageCircle size={16} /> Chat
                            </button>
                        </div>
                    </motion.div>
                ))}
                {!loading && tasks.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No active tasks found.
                    </div>
                )}
            </div>
        <AnimatePresence>
            {chatOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="glass-card fade-in-up"
                    style={{ position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: '400px', maxHeight: '70vh', overflow: 'auto', boxShadow: '0 8px 32px var(--accent-glow)' }}
                >
                    <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>Chat for {chatComplaintId}</span>
                        <X size={18} cursor="pointer" onClick={() => setChatOpen(false)} />
                    </div>
                    <div style={{ padding: '15px', minHeight: '200px', maxHeight: '300px', overflowY: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                        {chatLoading ? <div>Loading...</div> : (
                            chatMessages.length === 0 ? <div style={{ color: 'var(--text-muted)' }}>No messages yet.</div> : (
                                chatMessages.map(msg => (
                                    <div key={msg.id} style={{ marginBottom: '10px', textAlign: msg.sender_role === 'Technician' ? 'right' : 'left' }}>
                                        <span style={{ fontWeight: 500, color: msg.sender_role === 'Technician' ? 'var(--accent)' : 'var(--primary)' }}>{msg.sender_role}:</span>
                                        <span style={{ marginLeft: '8px', color: 'var(--text-main)' }}>{msg.message}</span>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(msg.created_at).toLocaleString()}</div>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                    <div style={{ padding: '15px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            placeholder="Type a message..."
                            style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '8px 15px', color: 'white', outline: 'none' }}
                            onKeyPress={e => e.key === 'Enter' && sendChatMessage()}
                        />
                        <button
                            onClick={sendChatMessage}
                            style={{ background: 'var(--accent)', border: 'none', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
                        >
                            <Send size={16} color="var(--bg-dark)" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        </motion.div>
    );
};

export default TechnicianDashboard;
