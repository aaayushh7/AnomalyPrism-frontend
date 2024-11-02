import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor } from "lucide-react";

const SAMPLE_SIZES = [10, 20, 50, 100, 200, 500];

const ResultsDisplay = ({ results }) => {
  const [sampleSize, setSampleSize] = useState(50);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("anomalies");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  if (!results?.data) {
    return (
      <div className="mt-6">
        <Alert>
          <AlertDescription>No results available</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { devices, total_devices, total_anomalies, location_stats } = results.data;

  if (!devices?.length) {
    return (
      <div className="mt-6">
        <Alert>
          <AlertDescription>No device data available</AlertDescription>
        </Alert>
      </div>
    );
  }

  const sampleData = useMemo(() => {
    if (devices.length <= sampleSize) return devices;
    const step = Math.floor(devices.length / sampleSize);
    return devices
      .filter((_, index) => index % step === 0)
      .slice(0, sampleSize);
  }, [devices, sampleSize]);

  const anomalyPercentage = ((total_anomalies / total_devices) * 100).toFixed(2);

  return (
    <div className="space-y-6 p-4 max-w-[100vw]">
      {isMobile && (
        <Alert className="mb-4">
          <Monitor className="h-4 w-4" />
          <AlertDescription>
            For the best experience, please view on a desktop device.
          </AlertDescription>
        </Alert>
      )}

      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2 space-y-2">
              <CardTitle className="text-lg md:text-xl">Analysis Results</CardTitle>
              <p className="text-sm">Total devices analyzed: {total_devices}</p>
              <p className="text-sm">
                Anomalies detected: {total_anomalies} ({anomalyPercentage}%)
              </p>
            </div>
            <div className="col-span-1">
              <Select
                value={sampleSize.toString()}
                onValueChange={(value) => setSampleSize(Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select sample size" />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_SIZES.map(size => (
                    <SelectItem key={size} value={size.toString()}>
                      {size} devices
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="anomalies">Device Anomalies</TabsTrigger>
              <TabsTrigger value="locations">Location Statistics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="anomalies" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Anomaly Distribution (Showing {sampleSize} out of {total_devices} devices)
                </h3>
                <div className="h-[300px] md:h-[400px] w-full">
                  <ResponsiveContainer>
                    <LineChart data={sampleData} margin={{ right: 10, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="device_id"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        interval={isMobile ? Math.floor(sampleData.length / 5) : Math.floor(sampleData.length / 10)}
                        fontSize={isMobile ? 10 : 12}
                      />
                      <YAxis 
                        domain={[0, 1]} 
                        ticks={[0, 1]}
                        tickFormatter={(value) => value === 1 ? 'Anomaly' : 'Normal'}
                        fontSize={isMobile ? 10 : 12}
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
                </div>
              </div>
            </TabsContent>

            <TabsContent value="locations" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Anomalies by Location</h3>
                <div className="h-[300px] md:h-[400px] w-full">
                  <ResponsiveContainer>
                    <BarChart data={location_stats} margin={{ right: 10, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="location_id"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        fontSize={isMobile ? 10 : 12}
                      />
                      <YAxis fontSize={isMobile ? 10 : 12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="anomaly_percentage" fill="#8884d8" name="Anomaly %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6">
            <div className="min-w-[640px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Lock Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((device, index) => (
                      <TableRow key={`${device.device_id}-${index}`}>
                        <TableCell className="whitespace-nowrap">{device.device_id}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {device.prediction === 1 ? 'Anomaly' : 'Normal'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{device.location_id}</TableCell>
                        <TableCell className="whitespace-nowrap">{device.lock_status}</TableCell>
                        <TableCell className="whitespace-nowrap">{device.timestamp}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 mt-4">
            <Select
              value={rowsPerPage.toString()}
              onValueChange={(value) => {
                setRowsPerPage(Number(value));
                setPage(0);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Rows per page" />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="mx-2">
                Page {page + 1} of {Math.ceil(devices.length / rowsPerPage)}
              </span>
              <button
                onClick={() => setPage(Math.min(Math.ceil(devices.length / rowsPerPage) - 1, page + 1))}
                disabled={page >= Math.ceil(devices.length / rowsPerPage) - 1}
                className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsDisplay;