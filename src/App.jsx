import React from 'react';
import { Container, Typography, Box, CssBaseline } from '@mui/material';
import TrainingSection from './components/TrainingSection';
import TestingSection from './components/TestingSection';
import CustomPrediction from './components/CustomPrediction';

function App() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Smart Lock Anomaly Detection
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            <TrainingSection />
            <TestingSection />
            <CustomPrediction />
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default App;