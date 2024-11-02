import React, { useState, useMemo } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import FileUpload from './FileUpload';
import ResultsDisplay from './ResultsDisplay';
import MLVisualizationDashboard from '../components/TestingComponent';
import { predictBatch } from '../services/api';

const transformDataForVisualization = (results) => {
  // Validate input data
  if (!results?.data || !results.data.devices || !results.data.timestamps) {
    console.warn('Invalid or empty data received:', results);
    return null;
  }

  try {
    // Create time series data by combining timestamps with device predictions
    const time_series = results.data.timestamps.map((timestamp, index) => {
      const predictionsAtTimestamp = results.data.devices.filter((device, deviceIndex) => 
        Math.floor(deviceIndex / results.data.devices.length * results.data.timestamps.length) === index
      );
      
      const total = predictionsAtTimestamp.length;
      const anomaly_count = predictionsAtTimestamp.filter(device => device.prediction === 1).length;
      
      return {
        timestamp,
        total,
        anomaly_count,
        anomaly_rate: ((anomaly_count / total) * 100).toFixed(2)
      };
    });

    // Process device statistics
    const deviceMap = new Map();
    results.data.devices.forEach(device => {
      if (!deviceMap.has(device.device_id)) {
        deviceMap.set(device.device_id, {
          device_id: device.device_id,
          total_events: 0,
          anomaly_count: 0
        });
      }
      const stats = deviceMap.get(device.device_id);
      stats.total_events++;
      if (device.prediction === 1) stats.anomaly_count++;
    });

    const device_stats = Array.from(deviceMap.values()).map(device => ({
      ...device,
      anomaly_rate: ((device.anomaly_count / device.total_events) * 100).toFixed(2)
    }));

    // Use the provided location stats directly
    const location_stats = results.data.location_stats.map(location => ({
      ...location,
      total_events: location.total || 0,
      anomaly_count: location.anomalies || 0
    }));

    return {
      time_series,
      device_stats,
      location_stats,
      total_devices: results.data.total_devices,
      total_anomalies: results.data.total_anomalies
    };
  } catch (error) {
    console.error('Error transforming data:', error);
    return null;
  }
};

const TestingSection = () => {
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [uploadKey, setUploadKey] = useState(0);

  const visualizationData = useMemo(() => {
    if (!results) return null;
    const transformedData = transformDataForVisualization(results);
    console.log('Transformed Data:', transformedData); // Debug log
    return transformedData;
  }, [results]);

  const handleTesting = async (file) => {
    try {
      setError('');
      const response = await predictBatch(file);
      console.log('Prediction Results:', response);
      setResults(response);
    } catch (err) {
      setError(err.message || 'Prediction failed');
      console.error('Prediction error:', err);
    }
  };

  const handleDownload = () => {
    if (!results?.data?.devices) return;
    
    try {
      const csv = results.data.devices.map((device, index) => {
        const timestamp = results.data.timestamps[
          Math.floor(index / results.data.devices.length * results.data.timestamps.length)
        ];
        return `${timestamp},${device.device_id},${device.location_id},${device.lock_status},${device.prediction}`;
      }).join('\n');

      const blob = new Blob([
        `timestamp,device_id,location_id,lock_status,prediction\n${csv}`
      ], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'predictions.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download results');
    }
  };

  const resetUpload = () => {
    setResults(null);
    setError('');
    setUploadKey(prevKey => prevKey + 1);
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

          {visualizationData ? (
            <Box sx={{ mt: 4 }}>
              <MLVisualizationDashboard data={visualizationData} />
            </Box>
          ) : (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Unable to generate visualization. Please check the data format.
            </Alert>
          )}

          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleDownload}
              disabled={!results?.data?.devices}
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