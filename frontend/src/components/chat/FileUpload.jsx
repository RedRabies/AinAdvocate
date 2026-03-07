import React, { useState } from 'react';
import chatService from '../../services/chat.service';

const FileUpload = ({ onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token'); // Assuming simple token retrieval
            const result = await chatService.uploadFile(file, token);
            onUploadComplete(result); // Pass back metadata
        } catch (error) {
            console.error("Upload failed", error);
            alert("File upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <label style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                disabled={uploading}
            />
            {uploading ? (
                <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                </div>
            ) : (
                <div className="attach-btn" title="Attach File">
                    📎
                </div>
            )}
        </label>
    );
};

export default FileUpload;
