import React, { useState, useEffect, useRef } from 'react';
import chatService from '../../services/chat.service';
import MessageBubble from './MessageBubble';
import FileUpload from './FileUpload';
import '../../styles/pages/chat.css';

const ChatWindow = ({ caseId, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [attachedFiles, setAttachedFiles] = useState([]);
    const messagesEndRef = useRef(null);
    const chatRef = useRef(null);

    useEffect(() => {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');

        // Connect Socket
        const socket = chatService.initSocket();
        socket.emit('join_case_room', caseId);

        // Listen for messages
        socket.on('receive_message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        // Fetch History
        const fetchHistory = async () => {
            try {
                const history = await chatService.getMessages(caseId, token);
                setMessages(history);
            } catch (err) {
                console.error("Failed to load chat history", err);
            }
        };

        fetchHistory();

        return () => {
            socket.disconnect();
        };
    }, [caseId]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && attachedFiles.length === 0) return;

        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const messageData = {
                message: newMessage,
                files: attachedFiles
            };

            // Calculate optimistic update or wait for socket? 
            // We wait for socket/API response to avoid dupes if we also listen to socket
            // But API returns the saved message.

            await chatService.sendMessage(caseId, messageData, token);

            setNewMessage('');
            setAttachedFiles([]);
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    const handleUploadComplete = (fileMeta) => {
        setAttachedFiles((prev) => [...prev, fileMeta]);
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h3>Case Chat</h3>
                <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold' }}>
                    ● Live
                </span>
            </div>

            <div className="chat-messages-area" ref={chatRef}>
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <MessageBubble
                            key={idx}
                            message={msg}
                            isOwn={msg.sender.id === currentUser.id}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Attachments Preview */}
            {attachedFiles.length > 0 && (
                <div style={{ padding: '8px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px', overflowX: 'auto' }}>
                    {attachedFiles.map((file, idx) => (
                        <div key={idx} style={{ background: 'white', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>📄 {file.name}</span>
                            <button
                                onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                                style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                x
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="chat-input-area">
                <FileUpload onUploadComplete={handleUploadComplete} />

                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend(e)} // Pass event to prevent default
                />

                <button className="send-btn" onClick={handleSend} title="Send Message">
                    ➤
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
