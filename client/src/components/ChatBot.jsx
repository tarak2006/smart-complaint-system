import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot, User, Sparkles } from 'lucide-react';
import { API_BASE } from '../config';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your UrbanCare AI assistant. How can I help you with your appliance service request today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            console.log('🤖 Sending message to UrbanCare AI...');

            const body = {
                type: 'message',
                text: currentInput,
                channelId: 'webchat',
                from: { id: 'user', name: 'User' },
                recipient: { id: 'bot', name: 'UrbanCare AI' },
                conversation: { id: 'temp-conv' },
                serviceUrl: API_BASE
            };

            // if user explicitly asks for technician, set flag so tracking page can open chat
            const lc = currentInput.toLowerCase();
            if (lc.includes('contact') && lc.includes('technician')) {
                localStorage.setItem('openTechChat', 'true');
            }

            const response = await fetch(`${API_BASE}/api/bot/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Bot Service Error:', response.status, errorData);
                throw new Error(errorData.message || 'Bot Service offline');
            }
            const data = await response.json();

            // if bot response asked for complaint id, also keep flag for chat window
            if (data && JSON.stringify(data).toLowerCase().includes('complaint id')) {
                localStorage.setItem('openTechChat', 'true');
            }

            // Handle array of activities (Synchronous Reply Hack)
            const botActivities = Array.isArray(data) ? data : [data];

            for (const activity of botActivities) {
                if (activity.text) {
                    setMessages(prev => [...prev, {
                        id: Date.now() + Math.random(),
                        text: activity.text,
                        sender: 'bot',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }]);
                    // Subtle delay between multiple messages
                    await new Promise(resolve => setTimeout(resolve, 600));
                }
            }
        } catch (error) {
            console.error('Bot Error:', error);
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: "I'm having trouble connecting. Please try again later!",
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="glass-card"
                        style={{
                            width: '420px',
                            height: '600px',
                            marginBottom: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(99, 102, 241, 0.3)'
                        }}
                    >
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            style={{
                                padding: '24px 20px',
                                background: 'var(--gradient-primary)',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    padding: '8px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Sparkles size={18} color="white" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, color: 'white' }}>UrbanCare AI</div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)' }}>Always online</div>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'white'
                                }}
                            >
                                <X size={18} />
                            </motion.button>
                        </motion.div>

                        {/* Messages */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15 }}
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                backgroundImage: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(236, 72, 153, 0.03) 100%)'
                            }}
                        >
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    style={{
                                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '80%',
                                        display: 'flex',
                                        gap: '8px',
                                        flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                                        alignItems: 'flex-end'
                                    }}
                                >
                                    {msg.sender === 'bot' && (
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'rgba(99, 102, 241, 0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            border: '1px solid rgba(99, 102, 241, 0.4)'
                                        }}>
                                            <Bot size={16} color="var(--primary)" />
                                        </div>
                                    )}
                                    <div style={{
                                        padding: '12px 16px',
                                        borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.5',
                                        background: msg.sender === 'user' ? 'var(--gradient-primary)' : 'rgba(255, 255, 255, 0.08)',
                                        border: msg.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                                        color: msg.sender === 'user' ? 'white' : 'var(--text-main)',
                                        boxShadow: msg.sender === 'user' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                                    }}>
                                        {msg.text}
                                    </div>
                                    {msg.sender === 'user' && (
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'var(--gradient-primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <User size={16} color="white" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        alignSelf: 'flex-start',
                                        display: 'flex',
                                        gap: '6px',
                                        padding: '12px 16px',
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        borderRadius: '18px 18px 18px 4px',
                                        border: '1px solid rgba(255, 255, 255, 0.15)'
                                    }}
                                >
                                    <motion.span
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}
                                    />
                                    <motion.span
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                        style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--secondary)' }}
                                    />
                                    <motion.span
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                        style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}
                                    />
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </motion.div>

                        {/* Input */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                padding: '16px',
                                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                gap: '12px',
                                background: 'rgba(255, 255, 255, 0.02)'
                            }}
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                                placeholder="Type your message..."
                                disabled={isLoading}
                                style={{
                                    flex: 1,
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '24px',
                                    padding: '10px 16px',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.3s ease',
                                    opacity: isLoading ? 0.6 : 1
                                }}
                                onFocus={(e) => {
                                    e.target.style.background = 'rgba(99, 102, 241, 0.2)';
                                    e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                                }}
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                style={{
                                    background: 'var(--gradient-primary)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading || !input.trim() ? 0.6 : 1,
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                                }}
                            >
                                <Send size={18} />
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--gradient-primary)',
                    boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4)',
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isOpen ? 'close' : 'open'}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ duration: 0.3 }}
                    >
                        {isOpen ? <X size={28} /> : <Bot size={28} />}
                    </motion.div>
                </AnimatePresence>
            </motion.button>
        </div>
    );
};

export default ChatBot;
