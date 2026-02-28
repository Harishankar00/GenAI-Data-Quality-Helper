import React, { useState } from 'react';
import { auth } from '../firebase';
import axios from 'axios';
import { UploadCloud, FileCheck, AlertCircle, Loader2, FileCode } from 'lucide-react';

const FileUpload = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please upload a valid CSV file.');
      setFile(null);
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    
    setUploading(true);
    setError('');

    try {
      // Get the Firebase ID Token [cite: 8, 18]
      const token = await auth.currentUser.getIdToken();

      const formData = new FormData();
      formData.append('file', file);

      // Backend must be on Hugging Face or Localhost:8000 [cite: 11, 19]
      const response = await axios.post('http://localhost:8000/analyze', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      onAnalysisComplete(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Connection to AI Backend failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={{...styles.dropZone, borderColor: file ? '#6366f1' : '#e2e8f0'}}>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          style={styles.hiddenInput} 
        />
        
        {file ? (
          <div style={styles.fileInfo}>
            <FileCode size={48} color="#6366f1" />
            <span style={styles.fileName}>{file.name}</span>
            <span style={styles.fileSize}>{(file.size / 1024).toFixed(2)} KB</span>
          </div>
        ) : (
          <div style={styles.uploadPrompt}>
            <div style={styles.iconCircle}>
              <UploadCloud size={32} color="#6366f1" />
            </div>
            <h3>Click or Drag CSV here</h3>
            <p>Upload documentation or FAQ datasets (20-200 rows) [cite: 45, 90]</p>
          </div>
        )}
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <button 
        onClick={uploadFile} 
        disabled={uploading || !file} 
        style={{
          ...styles.actionBtn, 
          background: (uploading || !file) ? '#cbd5e1' : 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
          cursor: (uploading || !file) ? 'not-allowed' : 'pointer'
        }}
      >
        {uploading ? (
          <>
            <Loader2 size={18} style={styles.spin} />
            <span>Analyzing Quality...</span>
          </>
        ) : (
          <>
            <FileCheck size={18} />
            <span>Scan Data Quality</span>
          </>
        )}
      </button>
    </div>
  );
};

// --- Modern Glassmorphism Styles ---
const styles = {
  container: { width: '100%', animation: 'fadeIn 0.5s ease' },
  dropZone: {
    position: 'relative',
    border: '2px dashed',
    borderRadius: '20px',
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px'
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    opacity: 0,
    cursor: 'pointer'
  },
  uploadPrompt: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  iconCircle: {
    padding: '16px',
    backgroundColor: '#f5f7ff',
    borderRadius: '50%',
    marginBottom: '12px'
  },
  fileInfo: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  fileName: { fontWeight: '700', color: '#1e293b' },
  fileSize: { fontSize: '0.8rem', color: '#64748b' },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '12px',
    marginTop: '16px',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  actionBtn: {
    width: '100%',
    marginTop: '24px',
    padding: '16px',
    border: 'none',
    borderRadius: '14px',
    color: '#fff',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
    transition: 'transform 0.2s ease'
  },
  spin: { animation: 'spin 1s linear infinite' }
};

export default FileUpload;