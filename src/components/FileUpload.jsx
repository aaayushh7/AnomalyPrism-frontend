import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  Typography, 
  LinearProgress,
  Alert 
} from '@mui/material';

// eslint-disable-next-line react/prop-types
const FileUpload = ({ onUpload, title, acceptedFileTypes = ".csv", resetTrigger }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when resetTrigger changes
  useEffect(() => {
    setFile(null);
    setError('');
    setUploading(false);
  }, [resetTrigger]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  };

  const validateAndSetFile = (file) => {
    setError('');
    if (file && file.name.endsWith('.csv')) {
      setFile(file);
    } else {
      setError('Please select a valid CSV file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      await onUpload(file);
      setFile(null);
    } catch (err) {
      setError(err.message || 'Upload failed');
    }
    setUploading(false);
  };

  return (
    <Paper
      sx={{
        p: 3,
        mb: 2,
        border: '2px dashed #ccc',
        backgroundColor: '#fafafa'
      }}
    >
      <Box
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{ textAlign: 'center' }}
      >
        <Typography variant="h6" gutterBottom>
          {title || 'Upload File'}
        </Typography>
        
        <input
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id={`file-input-${title}`} // Make ID unique for each instance
        />
        
        <label htmlFor={`file-input-${title}`}>
          <Button variant="contained" component="span" sx={{ mt: 1 }}>
            Select File
          </Button>
        </label>

        {file && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">{file.name}</Typography>
            <Button 
              onClick={handleUpload}
              variant="contained" 
              color="primary"
              sx={{ mt: 1 }}
              disabled={uploading}
            >
              Upload
            </Button>
          </Box>
        )}

        {uploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default FileUpload;