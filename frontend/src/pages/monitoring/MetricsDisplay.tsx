import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { type FC, useState, useEffect } from 'react';

import type { PerformanceMetric, MetricData } from '@/infrastructure/monitoring/types';

import { PerformanceMonitor } from '@/infrastructure/monitoring/PerformanceMonitor';
import { MetricType } from '@/infrastructure/monitoring/types';

export const MetricsDisplay: FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const performanceMonitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    // 将 updateMetrics 移到 useEffect 内部，避免依赖问题
    const updateMetrics = () => {
      const currentMetrics = performanceMonitor.getMetrics();
      setMetrics(currentMetrics);
    };

    // 初始加载
    updateMetrics();

    // 设置定时器
    const intervalId = setInterval(updateMetrics, 5000);

    // 清理函数
    return () => clearInterval(intervalId);
  }, [performanceMonitor]);

  const getMetricValue = (data: MetricData): string => {
    if ('value' in data) {
      return `${data.value}`;
    }
    if ('duration' in data) {
      return `${data.duration}ms`;
    }
    if ('domComplete' in data) {
      return `${data.domComplete}ms`;
    }
    return 'N/A';
  };

  const getMetricName = (type: MetricType, data: MetricData): string => {
    if ('url' in data && data.url) {
      return data.url;
    }
    if ('name' in data && data.name) {
      return data.name;
    }
    switch (type) {
      case MetricType.PAGE_LOAD:
        return 'Page Load Time';
      case MetricType.LONG_TASK:
        return 'Long Task Duration';
      case MetricType.CPU_USAGE:
        return 'CPU Usage';
      default:
        return type;
    }
  };

  const getMetricColor = (data: MetricData): string => {
    if ('duration' in data && typeof data.duration === 'number' && data.duration > 1000) {
      return '#f44336'; // Red for slow performance
    }
    if ('value' in data && typeof data.value === 'number' && data.value > 80) {
      return '#f44336'; // Red for high values
    }
    return '#4caf50'; // Green for good performance
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Performance Metrics
      </Typography>
      <Grid container spacing={3}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {getMetricName(metric.type, metric.data)}
                </Typography>
                <Typography variant="h5" sx={{ color: getMetricColor(metric.data) }}>
                  {getMetricValue(metric.data)}
                </Typography>
                <Typography color="textSecondary" sx={{ fontSize: 12 }}>
                  Last updated: {new Date(metric.timestamp).toLocaleTimeString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
