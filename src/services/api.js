import axios from 'axios';

const API_URL = 'http://127.0.0.1:4000/api';  // Updated to match Flask server address

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
  },
});

export const trainModel = async (file) => {
    try {
      console.log('Starting file upload, file:', file);
      
      // Read and validate file content
      const text = await file.text();
      console.log('File content preview:', text.substring(0, 200));
      
      // Validate file structure
      const lines = text.trim().split('\n');
      if (lines.length < 1) {
        throw new Error('File is empty');
      }
      
      // Create FormData
      const formData = new FormData();
      const blob = new Blob([text], { type: 'text/csv' });
      formData.append('file', blob, 'data.csv');
      
      const response = await api.post('/train', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });
      
      console.log('Server response:', response);
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  };

export const predictBatch = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the server. Please ensure the server is running.');
    }
    throw new Error(error.response?.data?.error || 'Failed to make predictions');
  }
};

export const predictSingle = async (data) => {
  try {
    const response = await api.post('/predict-single', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the server. Please ensure the server is running.');
    }
    throw new Error(error.response?.data?.error || 'Failed to make prediction');
  }
};