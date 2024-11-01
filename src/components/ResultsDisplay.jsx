import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const SAMPLE_SIZES = [10, 20, 50, 100, 200, 500];

const ResultsDisplay = ({ results }) => {
  const [sampleSize, setSampleSize] = useState(50);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);

  // Basic validation
  if (!results?.data) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="info">No results available</Alert>
      </Box>
    );
  }

  const { devices, total_devices, total_anomalies, location_stats } = results.data;

  if (!devices?.length) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="warning">No device data available</Alert>
      </Box>
    );
  }

  // Sample data for chart
  const sampleData = useMemo(() => {
    if (devices.length <= sampleSize) return devices;
    const step = Math.floor(devices.length / sampleSize);
    return devices
      .filter((_, index) => index % step === 0)
      .slice(0, sampleSize);
  }, [devices, sampleSize]);

  // Calculate anomaly percentage
  const anomalyPercentage = ((total_anomalies / total_devices) * 100).toFixed(2);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Analysis Results
            </Typography>
            <Typography variant="body1">
              Total devices analyzed: {total_devices}
            </Typography>
            <Typography variant="body1">
              Anomalies detected: {total_anomalies} ({anomalyPercentage}%)
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Chart Sample Size</InputLabel>
              <Select
                value={sampleSize}
                label="Chart Sample Size"
                onChange={(e) => setSampleSize(e.target.value)}
              >
                {SAMPLE_SIZES.map(size => (
                  <MenuItem key={size} value={size}>
                    {size} devices
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Device Anomalies" />
          <Tab label="Location Statistics" />
        </Tabs>

        <Box sx={{ mt: 2 }}>
          {tabValue === 0 ? (
            <>
              <Typography variant="h6" gutterBottom>
                Anomaly Distribution (Showing {sampleSize} out of {total_devices} devices)
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sampleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="device_id"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      interval={Math.floor(sampleData.length / 10)}
                    />
                    <YAxis 
                      domain={[0, 1]} 
                      ticks={[0, 1]}
                      tickFormatter={(value) => value === 1 ? 'Anomaly' : 'Normal'}
                    />
                    <Tooltip 
                      formatter={(value) => value === 1 ? 'Anomaly' : 'Normal'}
                      labelFormatter={(value) => `Device ID: ${value}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="prediction"
                      stroke="#8884d8"
                      dot={{ r: 2 }}
                      name="Anomaly Status"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                Anomalies by Location
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={location_stats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="location_id"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="anomaly_percentage" fill="#8884d8" name="Anomaly %" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </>
          )}
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Detailed Results
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Device ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Lock Status</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {devices
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((device) => (
                  <TableRow key={device.device_id}>
                    <TableCell>{device.device_id}</TableCell>
                    <TableCell>
                      {device.prediction === 1 ? 'Anomaly' : 'Normal'}
                    </TableCell>
                    <TableCell>{device.location_id}</TableCell>
                    <TableCell>{device.lock_status}</TableCell>
                    <TableCell>{device.timestamp}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={devices.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ResultsDisplay;