import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, Grid } from '@mui/material';

const DataVisualization = ({ data }) => {
  // Transform hourly activity data for recharts
  const hourlyData = data?.hourly_activity?.labels?.map((hour, index) => ({
    hour: `${hour}:00`,
    normal: data.hourly_activity.normal[index] || 0,
    anomaly: data.hourly_activity.anomaly[index] || 0,
  })) || [];

  // Transform weekly pattern data
  const weeklyData = data?.weekly_pattern?.labels?.map((day, index) => ({
    day,
    normal: data.weekly_pattern.normal[index] || 0,
    anomaly: data.weekly_pattern.anomaly[index] || 0,
  })) || [];

  // Transform device status data
  const deviceData = data?.device_status?.labels?.map((status, index) => ({
    status,
    normal: data.device_status.normal[index] || 0,
    anomaly: data.device_status.anomaly[index] || 0,
  })) || [];

  // Transform time periods data
  const timePeriodsData = data?.time_periods?.labels?.map((period, index) => ({
    period,
    count: data.time_periods.data[index] || 0,
  })) || [];

  return (
    <Grid container spacing={3}>
      {/* Hourly Activity Chart */}
      <Grid item xs={12} md={6}>
        <Card className="h-96">
          <CardHeader title="Hourly Activity Distribution" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="normal" fill="#2196f3" name="Normal Activity" />
                <Bar dataKey="anomaly" fill="#f44336" name="Anomalous Activity" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Weekly Pattern Chart */}
      <Grid item xs={12} md={6}>
        <Card className="h-96">
          <CardHeader title="Weekly Activity Pattern" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="normal" fill="#2196f3" name="Normal Activity" />
                <Bar dataKey="anomaly" fill="#f44336" name="Anomalous Activity" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Device Status Chart */}
      <Grid item xs={12} md={6}>
        <Card className="h-96">
          <CardHeader title="Device Status Distribution" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deviceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="normal" fill="#2196f3" name="Normal Activity" />
                <Bar dataKey="anomaly" fill="#f44336" name="Anomalous Activity" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Time Periods Chart */}
      <Grid item xs={12} md={6}>
        <Card className="h-96">
          <CardHeader title="Time Period Distribution" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timePeriodsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4caf50" name="Activity Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default DataVisualization;