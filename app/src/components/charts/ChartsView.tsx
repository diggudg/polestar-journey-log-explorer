// @ts-nocheck
import { Grid, Paper, Text, Title, useMantineTheme } from "@mantine/core";
import { useMemo } from "react";
import {
  Area, AreaChart, Bar,
  BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import { ChartDataProcessor } from '../../services/charts/ChartDataProcessor';
import type { Trip } from '../../types';

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
    };
  }, [data, chartDataProcessor]);

  const COLORS = [theme.colors.blue[6], theme.colors.teal[6], theme.colors.yellow[6], theme.colors.red[6], theme.colors.grape[6]];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper p="xs" shadow="md" withBorder>
          <Text size="sm" fw={500} mb={4}>{label}</Text>
          {payload.map((entry, index) => (
            <Text key={index} size="xs" c={entry.color}>
              {entry.name}: {entry.value}
            </Text>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Grid gutter="md">
      {/* Daily Distance & Consumption */}
      <Grid.Col span={{ base: 12, lg: 8 }}>
        <Paper p="md" radius="md" withBorder h="100%">
          <Title order={4} mb="lg" size="h5">Daily Distance & Consumption</Title>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="distance" name="Distance (km)" stroke={theme.colors.blue[6]} fillOpacity={1} fill="url(#colorDistance)" />
              <Area yAxisId="right" type="monotone" dataKey="consumption" name="Consumption (kWh)" stroke={theme.colors.yellow[6]} fillOpacity={1} fill="url(#colorConsumption)" />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid.Col>

      {/* Trip Distance Distribution */}
      <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
        <Paper p="md" radius="md" withBorder h="100%">
          <Title order={4} mb="lg" size="h5">Trip Distance Distribution</Title>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.distanceRanges}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.distanceRanges.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid.Col>

      {/* Efficiency Distribution */}
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Paper p="md" radius="md" withBorder>
          <Title order={4} mb="lg" size="h5">Efficiency Distribution</Title>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.efficiencyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Paper p="md" radius="md" withBorder>
          <Title order={4} mb="lg" size="h5">Battery Usage (SOC Drop)</Title>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.socData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.colors.gray[2]} />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Trips" fill={theme.colors.grape[6]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid.Col>
    </Grid>
  );
}

export default ChartsView;
