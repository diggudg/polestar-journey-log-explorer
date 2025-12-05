// @ts-nocheck
import { Grid, Paper, Text, Title, useMantineTheme } from '@mantine/core';
import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartDataProcessor } from '../../services/charts/ChartDataProcessor';
import type { Trip } from '../../types';
import classes from '../Dashboard.module.css';
import { DistributionChart } from './DistributionChart';

interface ChartsViewProps {
  data: Trip[];
}

function ChartsView({ data }: ChartsViewProps) {
  const theme = useMantineTheme();
  const chartDataProcessor = useMemo(() => new ChartDataProcessor(), []);

  const chartData = useMemo(() => {
    return {
      timeSeriesData: chartDataProcessor.processTimeSeriesData(data, 30),
      efficiencyData: chartDataProcessor.processEfficiencyDistribution(data, 10, 40, 5),
      distanceRanges: chartDataProcessor.processDistanceDistribution(data),
      socData: chartDataProcessor.processSOCDropDistribution(data, 10),
      speedVsEfficiency: chartDataProcessor.processSpeedVsEfficiency(data),
    };
  }, [data, chartDataProcessor]);

  const COLORS = [
    theme.colors.blue[6],
    theme.colors.teal[6],
    theme.colors.yellow[6],
    theme.colors.red[6],
    theme.colors.grape[6],
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper p="xs" shadow="md" withBorder>
          <Text size="sm" fw={500} mb={4}>
            {label}
          </Text>
          {payload.map((entry, index) => (
            <Text key={`${entry.name}-${index}`} size="xs" c={entry.color}>
              {entry.name}: {entry.value}
            </Text>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const ScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper p="xs" shadow="md" withBorder>
          <Text size="xs">Speed: {payload[0].value} km/h</Text>
          <Text size="xs">Efficiency: {payload[1].value} kWh/100km</Text>
          <Text size="xs" c="dimmed">
            Distance: {payload[0].payload.distance} km
          </Text>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Grid gutter="md">
      {/* Daily Distance & Consumption */}
      <Grid.Col span={{ base: 12, lg: 8 }}>
        <Paper p="md" radius="md" className={classes.glassCard}>
          <Title order={4} mb="lg" size="h5">
            Daily Distance & Consumption
          </Title>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartData.timeSeriesData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.colors.blue[6]} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={theme.colors.blue[6]} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.colors.yellow[6]} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={theme.colors.yellow[6]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.colors.gray[2]} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="distance"
                name="Distance (km)"
                stroke={theme.colors.blue[6]}
                fillOpacity={1}
                fill="url(#colorDistance)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="consumption"
                name="Consumption (kWh)"
                stroke={theme.colors.yellow[6]}
                fillOpacity={1}
                fill="url(#colorConsumption)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid.Col>

      {/* Speed vs Efficiency */}
      <Grid.Col span={{ base: 12, lg: 4 }}>
        <Paper p="md" radius="md" className={classes.glassCard}>
          <Title order={4} mb="lg" size="h5">
            Speed vs Efficiency
          </Title>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="speed"
                name="Speed"
                unit=" km/h"
                label={{
                  value: 'Speed (km/h)',
                  position: 'insideBottom',
                  offset: -10,
                  fontSize: 12,
                  fill: 'var(--mantine-color-dimmed)',
                }}
                tick={{ fontSize: 12, fill: 'var(--mantine-color-dimmed)' }}
              />
              <YAxis
                type="number"
                dataKey="efficiency"
                name="Efficiency"
                unit=" kWh/100km"
                label={{
                  value: 'Efficiency (kWh/100km)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 0,
                  fontSize: 12,
                  fill: 'var(--mantine-color-dimmed)',
                }}
                tick={{ fontSize: 12, fill: 'var(--mantine-color-dimmed)' }}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ScatterTooltip />} />
              <Scatter
                name="Trips"
                data={chartData.speedVsEfficiency}
                fill={theme.colors.polestarOrange[6]}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </Paper>
      </Grid.Col>

      {/* Trip Distance Distribution */}
      <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
        <DistributionChart
          title="Trip Distance Distribution"
          data={chartData.distanceRanges}
          colors={COLORS}
        />
      </Grid.Col>

      {/* Efficiency Distribution */}
      <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
        <Paper p="md" radius="md" className={classes.glassCard}>
          <Title order={4} mb="lg" size="h5">
            Efficiency Distribution
          </Title>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={chartData.efficiencyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.colors.gray[2]} />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Trips" fill={theme.colors.teal[6]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid.Col>

      {/* SOC Usage */}
      <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
        <Paper p="md" radius="md" className={classes.glassCard}>
          <Title order={4} mb="lg" size="h5">
            Battery Usage (SOC Drop)
          </Title>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.socData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.colors.gray[2]} />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                name="Trips"
                fill={theme.colors.grape[6]}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid.Col>
    </Grid>
  );
}

export default ChartsView;
