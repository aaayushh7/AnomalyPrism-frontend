import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, Grid, Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, ScatterChart,
  Scatter, Cell, Rectangle, ComposedChart
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ 
        bgcolor: 'background.paper', 
        p: 2, 
        border: 1, 
        borderColor: 'grey.300',
        borderRadius: 1,
        boxShadow: 1,
        maxWidth: 250 
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{label}</Typography>
        {payload.map((entry, index) => (
          <Typography 
            key={index} 
            variant="body2" 
            sx={{ 
              color: entry.color, 
              mt: 0.5,
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2
            }}
          >
            <span>{entry.name}:</span>
            <span>{typeof entry.value === 'number' ? 
              entry.value < 100 ? 
                entry.value.toFixed(3) : 
                entry.value.toLocaleString(undefined, {maximumFractionDigits: 2}) 
              : entry.value}</span>
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

const TimeSeriesPanel = ({ data }) => {
  const [timeRange, setTimeRange] = useState('all');
  const [smoothingWindow, setSmoothing] = useState(5);
  
  const filteredData = useMemo(() => {
    if (timeRange === 'all') return data.time_series;
    const now = new Date();
    const threshold = new Date();
    
    switch(timeRange) {
      case '24h':
        threshold.setHours(now.getHours() - 24);
        break;
      case '7d':
        threshold.setDate(now.getDate() - 7);
        break;
      case '30d':
        threshold.setDate(now.getDate() - 30);
        break;
      default:
        return data.time_series;
    }
    
    return data.time_series.filter(point => 
      new Date(point.timestamp) >= threshold
    );
  }, [data.time_series, timeRange]);

  const processedData = useMemo(() => {
    return filteredData.map((point, index) => {
      const window = filteredData.slice(
        Math.max(0, index - smoothingWindow),
        Math.min(filteredData.length, index + smoothingWindow + 1)
      );
      const weights = window.map((_, i) => 1 - Math.abs(i - smoothingWindow) / (smoothingWindow + 1));
      const weightSum = weights.reduce((a, b) => a + b, 0);
      const avgAnomalyRate = window.reduce((sum, p, i) => sum + p.anomaly_rate * weights[i], 0) / weightSum;
      
      return {
        ...point,
        smoothed_anomaly_rate: Number(avgAnomalyRate.toFixed(3))
      };
    });
  }, [filteredData, smoothingWindow]);

  const yAxisDomain = useMemo(() => {
    const maxTotal = Math.max(...processedData.map(d => d.total));
    return [0, Math.ceil(maxTotal * 1.1)];
  }, [processedData]);

  return (
    <Card>
      <CardHeader 
        title="Anomaly Detection Time Series"
        action={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small">
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
              </Select>
            </FormControl>
          </Box>
        }
      />
      <CardContent>
        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer>
            <ComposedChart data={processedData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
              <XAxis 
                dataKey="timestamp" 
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
                tickFormatter={(value) => new Date(value).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              />
              <YAxis 
                yAxisId="left"
                domain={yAxisDomain}
                label={{ 
                  value: 'Event Count', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                domain={[0, 100]}
                label={{ 
                  value: 'Anomaly Rate (%)', 
                  angle: 90, 
                  position: 'insideRight',
                  style: { textAnchor: 'middle' }
                }}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <Tooltip 
                content={<CustomTooltip />}
                animationDuration={200}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ paddingTop: '10px' }}
              />
              <Bar
                yAxisId="left"
                dataKey="total"
                fill="#8884d8"
                name="Total Events"
                opacity={0.3}
                radius={[2, 2, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="anomaly_rate"
                stroke="#ff7300"
                name="Anomaly Rate (%)"
                dot={false}
                strokeWidth={1}
                strokeOpacity={0.7}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="smoothed_anomaly_rate"
                stroke="#82ca9d"
                name="Smoothed Anomaly Rate (%)"
                dot={false}
                strokeWidth={2}
                activeDot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

const HeatmapPanel = ({ data }) => {
  const heatmapData = useMemo(() => {
    const timeSeriesData = data.time_series;
    const heatmapMatrix = {};
    
    timeSeriesData.forEach(entry => {
      const date = new Date(entry.timestamp);
      const day = date.getDay();
      const hour = date.getHours();
      
      if (!heatmapMatrix[day]) {
        heatmapMatrix[day] = {};
      }
      if (!heatmapMatrix[day][hour]) {
        heatmapMatrix[day][hour] = {
          count: 0,
          anomalies: 0,
          samples: 0,
          total_rate: 0
        };
      }
      
      heatmapMatrix[day][hour].count += entry.total;
      heatmapMatrix[day][hour].anomalies += (entry.total * entry.anomaly_rate / 100);
      heatmapMatrix[day][hour].samples += 1;
      heatmapMatrix[day][hour].total_rate += entry.anomaly_rate;
    });
    
    // Calculate averages
    Object.values(heatmapMatrix).forEach(dayData => {
      Object.values(dayData).forEach(hourData => {
        if (hourData.samples > 0) {
          hourData.avg_rate = hourData.total_rate / hourData.samples;
        }
      });
    });
    
    return heatmapMatrix;
  }, [data.time_series]);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const cellSize = 28;
  
  const { minValue, maxValue, avgValue } = useMemo(() => {
    let min = Infinity, max = -Infinity, sum = 0, count = 0;
    Object.values(heatmapData).forEach(dayData => {
      Object.values(dayData).forEach(hourData => {
        if (hourData.samples > 0) {
          const value = hourData.avg_rate;
          min = Math.min(min, value);
          max = Math.max(max, value);
          sum += value;
          count++;
        }
      });
    });
    return {
      minValue: min,
      maxValue: max,
      avgValue: sum / count
    };
  }, [heatmapData]);

  const getColor = useCallback((value) => {
    if (value === undefined) return 'rgb(240, 240, 240)';
    // Enhanced color interpolation
    const normalized = Math.pow((value - minValue) / (maxValue - minValue), 0.7);
    const intensity = Math.floor(255 * (1 - normalized));
    return `rgb(${intensity}, ${intensity}, ${Math.min(255, intensity + 50)})`;
  }, [minValue, maxValue]);

  return (
    <Card>
      <CardHeader title="Anomaly Heatmap (Day/Hour)" />
      <CardContent>
        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer>
            <ScatterChart
              margin={{ top: 20, right: 30, bottom: 20, left: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
              <XAxis
                type="number"
                dataKey="hour"
                domain={[0, 23]}
                ticks={Array.from({ length: 12 }, (_, i) => i * 2)}
                label={{ value: 'Hour of Day', position: 'bottom', offset: 10 }}
                tickFormatter={(value) => value.toString().padStart(2, '0')}
              />
              <YAxis
                type="number"
                dataKey="day"
                domain={[0, 6]}
                ticks={[0, 1, 2, 3, 4, 5, 6]}
                tickFormatter={(value) => days[value]}
                label={{ value: 'Day of Week', angle: -90, position: 'insideLeft', offset: 10 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <Box sx={{ 
                        bgcolor: 'background.paper', 
                        p: 1.5, 
                        border: 1,
                        borderRadius: 1,
                        boxShadow: 1
                      }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          {`${days[data.day]} ${String(data.hour).padStart(2, '0')}:00`}
                        </Typography>
                        <Typography variant="body2">
                          {`Anomaly Rate: ${data.value.toFixed(3)}%`}
                        </Typography>
                        <Typography variant="body2">
                          {`Events: ${data.count.toLocaleString()}`}
                        </Typography>
                        <Typography variant="body2">
                          {`Samples: ${data.samples}`}
                        </Typography>
                      </Box>
                    );
                  }
                  return null;
                }}
              />
              {Object.entries(heatmapData).map(([day, hourData]) =>
                Object.entries(hourData).map(([hour, data]) => {
                  if (data.samples === 0) return null;
                  return (
                    <Scatter key={`${day}-${hour}`} data={[{
                      day: parseInt(day),
                      hour: parseInt(hour),
                      value: data.avg_rate,
                      count: data.count,
                      samples: data.samples
                    }]}>
                      <Cell>
                        {({ cx, cy }) => (
                          <Rectangle
                            x={cx - cellSize/2}
                            y={cy - cellSize/2}
                            width={cellSize}
                            height={cellSize}
                            fill={getColor(data.avg_rate)}
                          />
                        )}
                      </Cell>
                    </Scatter>
                  );
                })
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

const DeviceAnalysisPanel = ({ data }) => {
  const [sortBy, setSortBy] = useState('anomaly_rate');
  
  const sortedDevices = useMemo(() => {
    return [...data.device_stats]
      .map(device => ({
        ...device,
        anomaly_rate: (device.anomaly_count / device.total_events) * 100
      }))
      .sort((a, b) => {
        if (sortBy === 'anomaly_rate') {
          return b.anomaly_rate - a.anomaly_rate;
        }
        return b[sortBy] - a[sortBy];
      })
      .slice(0, 20);
  }, [data.device_stats, sortBy]);

  const maxValue = useMemo(() => {
    return Math.max(...sortedDevices.map(d => 
      sortBy === 'anomaly_rate' ? d.anomaly_rate : d[sortBy]
    ));
  }, [sortedDevices, sortBy]);

  return (
    <Card>
      <CardHeader 
        title="Device Analysis"
        action={
          <FormControl size="small">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="anomaly_rate">Anomaly Rate</MenuItem>
              <MenuItem value="total_events">Total Events</MenuItem>
              <MenuItem value="anomaly_count">Anomaly Count</MenuItem>
            </Select>
          </FormControl>
        }
      />
      <CardContent>
        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer>
            <BarChart 
              data={sortedDevices}
              margin={{ top: 20, right: 30, left: 10, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
              <XAxis 
                dataKey="device_id" 
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                domain={[0, sortBy === 'anomaly_rate' ? 100 : dataMax => Math.ceil(dataMax * 1.1)]}
                label={{ 
                  value: sortBy === 'anomaly_rate' ? 'Anomaly Rate (%)' : 
                         sortBy === 'total_events' ? 'Total Events' : 'Anomaly Count',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10
                }}
                tickFormatter={value => 
                  sortBy === 'anomaly_rate' ? 
                    value.toFixed(2) + '%' : 
                    value.toLocaleString()
                }
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(0,0,0,0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar 
                dataKey={sortBy === 'anomaly_rate' ? 'anomaly_rate' : sortBy} 
                fill="#8884d8"
                name={sortBy.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
                radius={[2, 2, 0, 0]}
              >
                {sortedDevices.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={`hsl(${240 - (index / sortedDevices.length) * 120}, 75%, 60%)`}
                    opacity={0.9}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

const LocationAnalysisPanel = ({ data }) => {
  const normalizedData = useMemo(() => {
    const maxEvents = Math.max(...data.location_stats.map(d => d.total_events));
    const maxAnomalies = Math.max(...data.location_stats.map(d => d.anomaly_count));
    
    return data.location_stats.map(location => ({
      ...location,
      normalized_events: location.total_events / maxEvents,
      normalized_anomalies: location.anomaly_count / maxAnomalies,
      anomaly_rate: (location.anomaly_count / location.total_events) * 100
    }));
  }, [data.location_stats]);

  const domains = useMemo(() => {
    const events = normalizedData.map(d => d.total_events);
    const anomalies = normalizedData.map(d => d.anomaly_count);
    return {
      x: [Math.max(1, Math.min(...events) * 0.8), Math.max(...events) * 1.2],
      y: [Math.max(1, Math.min(...anomalies) * 0.8), Math.max(...anomalies) * 1.2]
    };
  }, [normalizedData]);

  return (
    <Card>
      <CardHeader title="Location-based Analysis" />
      <CardContent>
        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer>
            <ScatterChart 
              margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
              <XAxis 
                type="number" 
                dataKey="total_events" 
                name="Total Events"
                scale="log"
                domain={domains.x}
                label={{ 
                  value: 'Total Events (log scale)',
                  position: 'bottom',
                  offset: 40
                }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <YAxis 
                type="number" 
                dataKey="anomaly_count" 
                name="Anomaly Count"
                scale="log"
                domain={domains.y}
                label={{ 
                  value: 'Anomaly Count (log scale)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10
                }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <Box sx={{ 
                        bgcolor: 'background.paper', 
                        p: 2, 
                        border: 1, 
                        borderRadius: 1,
                        boxShadow: 1
                      }}>
                        <Typography variant="body2">
                          {`Total Events: ${data.total_events.toLocaleString()}`}
                        </Typography>
                        <Typography variant="body2">
                          {`Anomaly Count: ${data.anomaly_count.toLocaleString()}`}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                          {`Anomaly Rate: ${data.anomaly_rate.toFixed(3)}%`}
                        </Typography>
                      </Box>
                    );
                  }
                  return null;
                }}
              />
              <Scatter 
                name="Locations" 
                data={normalizedData} 
                fill="#8884d8"
              >
                {normalizedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={`hsl(${240 - (entry.anomaly_rate * 2.4)}, 75%, 60%)`}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

const SummaryStatisticsCard = ({ data }) => {
  const trendIndicator = (current, previous) => {
    const change = ((current - previous) / previous) * 100;
    const color = change > 0 ? '#ff4444' : '#44aa44';
    return (
      <Typography 
        variant="caption" 
        sx={{ 
          color, 
          ml: 1,
          display: 'inline-flex',
          alignItems: 'center',
          fontWeight: 500
        }}
      >
        {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
      </Typography>
    );
  };

  const trends = useMemo(() => {
    if (!data.time_series || data.time_series.length < 2) return {};
    
    const recentPeriod = data.time_series.slice(-24);
    const previousPeriod = data.time_series.slice(-48, -24);
    
    const calculateMetrics = (period) => ({
      anomalies: period.reduce((sum, point) => 
        sum + (point.total * point.anomaly_rate / 100), 0),
      total: period.reduce((sum, point) => sum + point.total, 0),
      rate: period.reduce((sum, point) => sum + point.anomaly_rate, 0) / period.length
    });
    
    const recent = calculateMetrics(recentPeriod);
    const previous = calculateMetrics(previousPeriod);
    
    return { recent, previous };
  }, [data.time_series]);

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Summary Statistics" />
      <CardContent>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 3,
          height: '100%'
        }}>
          <Box>
            <Typography 
              variant="h3" 
              gutterBottom 
              sx={{ 
                fontWeight: 500,
                color: 'text.primary'
              }}
            >
              {data.total_devices?.toLocaleString() || 'N/A'}
            </Typography>
            <Typography color="textSecondary" variant="subtitle1">
              Total Devices
            </Typography>
          </Box>
          
          <Box>
            <Typography 
              variant="h3" 
              gutterBottom 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 500,
                color: 'text.primary'
              }}
            >
              {data.total_anomalies?.toLocaleString() || 'N/A'}
              {trends.recent && trendIndicator(
                trends.recent.anomalies,
                trends.previous.anomalies
              )}
            </Typography>
            <Typography color="textSecondary" variant="subtitle1">
              Total Anomalies
            </Typography>
          </Box>
          
          <Box>
            <Typography 
              variant="h3" 
              gutterBottom 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 500,
                color: 'text.primary'
              }}
            >
              {((data.total_anomalies / data.total_devices) * 100).toFixed(3) || 'N/A'}%
              {trends.recent && trendIndicator(
                trends.recent.rate,
                trends.previous.rate
              )}
            </Typography>
            <Typography color="textSecondary" variant="subtitle1">
              Overall Anomaly Rate
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const MLVisualizationDashboard = ({ data }) => {
  if (!data || !data.time_series || !data.device_stats || !data.location_stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Visualization data is not available or incomplete.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <SummaryStatisticsCard data={data} />
        </Grid>
        
        <Grid item xs={12} md={8}>
          <TimeSeriesPanel data={data} />
        </Grid>

        <Grid item xs={12} md={6}>
          <DeviceAnalysisPanel data={data} />
        </Grid>

        <Grid item xs={12} md={6}>
          <LocationAnalysisPanel data={data} />
        </Grid>

        <Grid item xs={12}>
          <HeatmapPanel data={data} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default MLVisualizationDashboard;