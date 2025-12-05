// @ts-nocheck
import { Paper, Text, Title } from '@mantine/core';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import classes from '../Dashboard.module.css';

interface DistributionChartProps {
  title: string;
  data: { name: string; value: number }[];
  colors: string[];
  height?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <Paper p="xs" shadow="md" withBorder>
        <Text size="sm" fw={500} mb={4}>
          {payload[0].name}
        </Text>
        <Text size="xs" c={payload[0].payload.fill}>
          {payload[0].value} trips
        </Text>
      </Paper>
    );
  }
  return null;
};

export function DistributionChart({ title, data, colors, height = 300 }: DistributionChartProps) {
  return (
    <Paper p="md" radius="md" className={classes.glassCard}>
      <Title order={4} mb="lg" size="h5">
        {title}
      </Title>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`distribution-${entry.name}-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
}
