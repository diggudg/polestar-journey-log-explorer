// @ts-nocheck
import {
  ActionIcon,
  Group,
  Paper,
  SimpleGrid,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconBolt,
  IconCurrencyDollar,
  IconDroplet,
  IconGasStation,
  IconLeaf,
  IconRoad,
  IconRoute,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import { useState } from "react";
import CostCalculatorModal from "../CostCalculatorModal";
import type { Statistics } from '../../types';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ComponentType<{ size?: number; stroke?: number }>;
  color: string;
}

function StatCard({ title, value, unit, icon: Icon, color }: StatCardProps) {
  return (
    <Paper p={{ base: "xs", sm: "md" }} radius="md" withBorder>
      <Group justify="apart" wrap="nowrap">
        <div style={{ minWidth: 0, flex: 1 }}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text size="xl" fw={700} mt="xs" style={{ wordBreak: "break-word" }}>
            {value}
            {unit && (
              <Text span size="sm" c="dimmed" fw={400}>
                {" "}
                {unit}
              </Text>
            )}
          </Text>
        </div>
        <ThemeIcon size={40} radius="md" variant="light" color={color}>
          <Icon size={23} stroke={1.5} />
        </ThemeIcon>
      </Group>
    </Paper>
  );
}

interface StatsCardsProps {
  statistics: Statistics | null;
  hideCostButton?: boolean;
}

function StatsCards({ statistics, hideCostButton }: StatsCardsProps) {
  const [costModalOpened, setCostModalOpened] = useState(false);

  if (!statistics) return null;

  return (
    <>
      {!hideCostButton && (
        <Group justify="flex-end" mb="md">
          <Tooltip label="Calculate charging costs" withArrow>
            <ActionIcon
              size="lg"
              variant="filled"
              color="green"
              onClick={() => setCostModalOpened(true)}
            >
              <IconCurrencyDollar size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
      )}

      <SimpleGrid
        cols={{ base: 1, xs: 2, sm: 2, md: 3, lg: 4 }}
        spacing={{ base: "xs", sm: "md" }}
      >
        <StatCard
          title="Total Trips"
          value={statistics.totalTrips}
          icon={IconRoute}
          color="blue"
        />
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
          color="yellow"
        />
        <StatCard
          title="Avg Efficiency"
          value={statistics.avgEfficiency}
          unit="kWh/100km"
          icon={IconGasStation}
          color="green"
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
          color="red"
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
          color="green"
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

      <CostCalculatorModal
        opened={costModalOpened}
        onClose={() => setCostModalOpened(false)}
        statistics={statistics}
      />
    </>
  );
}

export default StatsCards;
