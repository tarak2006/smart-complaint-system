import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your UrbanCare AI assistant. How can I help you with your appliance service request today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
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

        try {
            const API_BASE = 'https://urbancare-bqdae0ckayb5bufc.centralindia-01.azurewebsites.net';
            console.log('🤖 Sending message to AstraBot...');

            const body = {
                type: 'message',
                text: currentInput,
                channelId: 'webchat',
                from: { id: 'user', name: 'User' },
                recipient: { id: 'bot', name: 'AstraBot' },
                conversation: { id: 'temp-conv' },
                serviceUrl: API_BASE
            };

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
                text: "I'm having trouble connecting to my Azure brain. Please try again later!",
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setIsLoading(false); // Always set loading to false after attempt
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
                        className="glass-card fade-in-up"
                        style={{
                            width: '350px', height: '500px', marginBottom: '20px',
                            display: 'flex', flexDirection: 'column', overflow: 'hidden'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '15px 20px', background: 'var(--primary-glow)',
                            borderBottom: '1px solid var(--glass-border)', display: 'flex',
                            justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Bot size={20} color="var(--accent)" />
                                <span style={{ fontWeight: 600 }}>UrbanCare AI Support</span>
                            </div>
                            <X size={18} cursor="pointer" onClick={() => setIsOpen(false)} />
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    style={{
                                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '80%', display: 'flex', gap: '8px',
                                        flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                                    }}
                                >
                                    {msg.sender === 'bot' && (
                                        <div style={{
                                            width: '28px', height: '28px', borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.05)', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            border: '1px solid var(--glass-border)'
                                        }}>
                                            <Bot size={16} color="var(--text-main)" />
                                        </div>
                                    )}
                                    <div style={{
                                        padding: '10px 14px', borderRadius: '15px', fontSize: '0.9rem',
                                        background: msg.sender === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                        border: msg.sender === 'user' ? 'none' : '1px solid var(--glass-border)',
                                        color: msg.sender === 'user' ? 'var(--bg-dark)' : 'var(--text-main)'
                                    }}>
                                        {msg.text}
                                    </div>
                                    {msg.sender === 'user' && (
                                        <div style={{
                                            width: '28px', height: '28px', borderRadius: '50%',
                                            background: 'var(--primary-glow)', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                        }}>
                                            <User size={16} color="var(--primary)" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{ padding: '15px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                style={{
                                    flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)',
                                    borderRadius: '20px', padding: '8px 15px', color: 'white', outline: 'none'
                                }}
                            />
                            <button
                                onClick={handleSend}
                                style={{
                                    background: 'var(--primary)', border: 'none', borderRadius: '50%',
                                    width: '35px', height: '35px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', color: 'white', cursor: 'pointer'
                                }}
                            >
                                <Send size={16} color="var(--bg-dark)" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)',
                    boxShadow: '0 8px 32px var(--primary-glow)', border: 'none', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
            >
                {isOpen ? <X size={28} color="var(--bg-dark)" /> : <Bot size={30} color="var(--bg-dark)" />}
            </motion.button>
        </div>
    );
};

export default ChatBot;
