import React from 'react';

const MessageBubble = ({ message, isOwn }) => {
    return (
        <div className={`message-row ${isOwn ? 'own' : 'other'}`}>
            <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
                {!isOwn && <div className="message-sender">{message.sender?.name || 'Unknown'}</div>}

                {message.message && <div style={{ marginBottom: message.files?.length ? '8px' : '0' }}>{message.message}</div>}

                {/* File Attachments */}
                {message.files && message.files.length > 0 && (
                    <div>
                        {message.files.map((file, idx) => (
                            <div key={idx} className="message-attachment">
                                {file.type?.startsWith('image/') ? (
                                    <img src={`http://localhost:5000${file.url}`} alt={file.name} />
                                ) : (
                                    <a
                                        href={`http://localhost:5000${file.url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'inherit', textDecoration: 'none', padding: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }}
                                    >
                                        <span style={{ fontSize: '1.2rem' }}>📄</span>
                                        <span style={{ textDecoration: 'underline' }}>{file.name}</span>
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <span className="message-time">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
};

export default MessageBubble;
