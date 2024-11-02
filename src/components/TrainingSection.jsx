import React, { useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import FileUpload from './FileUpload';
import DataVisualization from '../components/DataVisualisation';
import { trainModel } from '../services/api';

const TrainingSection = () => {
  const [trainingStatus, setTrainingStatus] = useState(null);
  const [error, setError] = useState('');
  const [visualizationData, setVisualizationData] = useState(null);

  const handleTraining = async (file) => {
    try {
      setError('');
      setTrainingStatus('Training in progress...');
      const response = await trainModel(file);
      
      if (response.status === 'success') {
        setTrainingStatus('Model trained successfully!');
        if (response.visualization_data) {
          setVisualizationData(response.visualization_data);
        }
      } else {
        throw new Error(response.message || 'Training failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to train model');
      setTrainingStatus(null);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Train Model
      </Typography>
      
      <FileUpload 
        onUpload={handleTraining}
        title="Upload Training Data"
        acceptedFileTypes=".csv"
      />
      
      {trainingStatus && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {trainingStatus}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {visualizationData && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Training Data Analysis
          </Typography>
          <DataVisualization data={visualizationData} />
        </Box>
      )}
    </Box>
  );
};

export default TrainingSection;