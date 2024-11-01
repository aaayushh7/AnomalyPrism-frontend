import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Grid,
  MenuItem
} from '@mui/material';
import { predictSingle } from '../services/api';

const CustomPrediction = () => {
  const [formData, setFormData] = useState({
    device_id: '',
    lock_status: 'lock',
    timestamp: '',
    name: 'VirtualSTS Lock 2',
    DeviceStatus: 'online',
    manufacturerName: 'SmartThingsCommunity',
    locationId: '',
    ownerId: '',
    roomId: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const response = await predictSingle(formData);
      setResult(response);
    } catch (err) {
      setError(err.message || 'Prediction failed');
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Custom Prediction
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="device_id"
                label="Device ID"
                value={formData.device_id}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="lock_status"
                label="Lock Status"
                select
                value={formData.lock_status}
                onChange={handleChange}
                fullWidth
                required
              >
                <MenuItem value="lock">Lock</MenuItem>
                <MenuItem value="unlock">Unlock</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="timestamp"
                label="Timestamp"
                type="datetime-local"
                value={formData.timestamp}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="locationId"
                label="Location ID"
                value={formData.locationId}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="ownerId"
                label="Owner ID"
                value={formData.ownerId}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="roomId"
                label="Room ID"
                value={formData.roomId}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
          </Grid>

          <Button 
            type="submit" 
            variant="contained" 
            sx={{ mt: 2 }}
            fullWidth
          >
            Predict
          </Button>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Alert 
            severity={result.is_anomaly ? "warning" : "success"} 
            sx={{ mt: 2 }}
          >
            This activity is {result.is_anomaly ? 'anomalous' : 'normal'}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default CustomPrediction;