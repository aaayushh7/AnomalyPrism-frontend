import React, { useState } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import FileUpload from './FileUpload';
import ResultsDisplay from './ResultsDisplay';
import { predictBatch } from '../services/api';

const TestingSection = () => {
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [uploadKey, setUploadKey] = useState(0); // Add a key to force reset

  const handleTesting = async (file) => {
    try {
      setError('');
      const response = await predictBatch(file);
      setResults(response);
    } catch (err) {
      setError(err.message || 'Prediction failed');
    }
  };

  const handleDownload = () => {
    if (!results) return;

    const csv = results.predictions.map((pred, i) => 
      `${results.timestamp[i]},${pred}`
    ).join('\n');

    const blob = new Blob([`timestamp,prediction\n${csv}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'predictions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetUpload = () => {
    setResults(null);
    setError('');
    setUploadKey(prevKey => prevKey + 1); // Force FileUpload to reset
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Test Model
      </Typography>

      <FileUpload 
        key={uploadKey}
        onUpload={handleTesting}
        title="Upload Test Data"
        acceptedFileTypes=".csv"
        resetTrigger={uploadKey}
      />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {results && (
        <>
          <ResultsDisplay results={results} />
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={handleDownload}
            >
              Download Results
            </Button>
            <Button 
              variant="outlined" 
              onClick={resetUpload}
            >
              Upload New Test Data
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default TestingSection;