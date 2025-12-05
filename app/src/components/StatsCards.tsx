// @ts-nocheck
import { Group, Paper, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import {
  IconBolt,
  IconDroplet,
  IconGasStation,
  IconLeaf,
  IconRoad,
  IconRoute,
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react';

function StatCard({ title, value, unit, icon: Icon, color }) {
  return (
    <Paper p="md" radius="md" withBorder>
      <Group justify="apart">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text size="xl" fw={700} mt="xs">
            {value}
            {unit && (
              <Text span size="sm" c="dimmed" fw={400}>
                {' '}
                {unit}
              </Text>
            )}
          </Text>
        </div>
        <ThemeIcon size={44} radius="md" variant="light" color={color}>
          <Icon size={26} stroke={1.5} />
        </ThemeIcon>
      </Group>
    </Paper>
  );
}

function StatsCards({ statistics }) {
  if (!statistics) return null;

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
      <StatCard title="Total Trips" value={statistics.totalTrips} icon={IconRoute} color="blue" />
      <StatCard
        title="Total Distance"
        value={statistics.totalDistance}
        unit="km"
        icon={IconRoad}
        color="cyan"
      />
      <StatCard
        title="Total Consumption"
        value={statistics.totalConsumption}
        unit="kWh"
        icon={IconBolt}
        color="orange"
      />
      <StatCard
        title="Avg Efficiency"
        value={statistics.avgEfficiency}
        unit="kWh/100km"
        icon={IconGasStation}
        color="polestarOrange"
      />
      <StatCard
        title="Best Efficiency"
        value={statistics.bestEfficiency}
        unit="kWh/100km"
        icon={IconTrendingDown}
        color="teal"
      />
      <StatCard
        title="Worst Efficiency"
        value={statistics.worstEfficiency}
        unit="kWh/100km"
        icon={IconTrendingUp}
        color="polestarRed"
      />
      <StatCard
        title="Avg Trip Distance"
        value={statistics.avgTripDistance}
        unit="km"
        icon={IconRoute}
        color="grape"
      />
      <StatCard
        title="Odometer Range"
        value={`${statistics.odometerStart} - ${statistics.odometerEnd}`}
        unit="km"
        icon={IconRoad}
        color="violet"
      />
      <StatCard
        title="CO₂ Saved"
        value={statistics.carbonSaved}
        unit="kg"
        icon={IconLeaf}
        color="polestarOrange"
      />
      <StatCard
        title="Gas Not Used"
        value={statistics.gasSaved}
        unit="L"
        icon={IconDroplet}
        color="orange"
      />
      <StatCard
        title="Trees Equivalent"
        value={statistics.treesEquivalent}
        unit="trees/year"
        icon={IconLeaf}
        color="teal"
      />
    </SimpleGrid>
  );
}

export default StatsCards;
