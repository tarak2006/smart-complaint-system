import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import { Send, X } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatWindow = ({ complaintId, role, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const fetchMessages = async () => {
        if (!complaintId) return;
        try {
            const res = await axios.get(`${API_BASE}/api/chat/${complaintId}`);
            setMessages(res.data);
        } catch (err) {
            console.error('Failed to fetch chat messages', err);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [complaintId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || !complaintId) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        try {
            await axios.post(`${API_BASE}/api/chat`, {
                complaintId,
                senderRole: role,
                senderId: user.id || 0,
                message: input.trim(),
            });
            setInput('');
            fetchMessages();
        } catch (err) {
            console.error('Failed to send chat message', err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="glass-card"
            style={{
                position: 'fixed',
                bottom: '100px',
                right: '30px',
                width: '350px',
                height: '450px',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1100,
                overflow: 'hidden'
            }}
        >
            {/* header */}
            <div style={{
                padding: '10px 15px',
                background: 'var(--primary-glow)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{ fontWeight: 600 }}>Technician Chat {complaintId ? `(${complaintId})` : ''}</span>
                <X size={18} cursor="pointer" onClick={onClose} />
            </div>

            {/* messages */}
            <div style={{
                flex: 1,
                padding: '15px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                {messages.length === 0 && (
                    <div style={{ color: 'var(--text-muted)' }}>No messages yet.</div>
                )}
                {messages.map(msg => (
                    <div key={msg.id} style={{
                        alignSelf: msg.sender_role === role ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        background: msg.sender_role === role ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                        color: msg.sender_role === role ? 'var(--bg-dark)' : 'var(--text-main)',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        fontSize: '0.9rem'
                    }}>
                        {msg.message}
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* input */}
            <div style={{
                padding: '10px',
                borderTop: '1px solid var(--glass-border)',
                display: 'flex',
                gap: '8px'
            }}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    style={{
                        flex: 1,
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '20px',
                        padding: '8px 15px',
                        color: 'white',
                        outline: 'none'
                    }}
                />
                <button
                    onClick={sendMessage}
                    style={{
                        background: 'var(--primary)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '35px',
                        height: '35px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        cursor: 'pointer'
                    }}
                >
                    <Send size={16} color="var(--bg-dark)" />
                </button>
            </div>
        </motion.div>
    );
};

export default ChatWindow;
