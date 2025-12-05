// @ts-nocheck
import {
  Badge,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  useMantineColorScheme,
} from '@mantine/core';
import { IconBattery, IconGauge, IconRoad, IconTrendingUp } from '@tabler/icons-react';

interface OdometerDisplayProps {
  odometer: any;
  battery: any;
}

export default function OdometerDisplay({ odometer, battery }: OdometerDisplayProps) {
  const { colorScheme } = useMantineColorScheme();

  if (!odometer) {
    return (
      <Paper p="md" withBorder radius="md">
        <Text c="dimmed" ta="center">
          No odometer data available
        </Text>
      </Paper>
    );
  }

  const totalKm = Math.round((odometer.odometerMeters || 0) / 1000);
  const tripManual = odometer.tripMeterManualKm || 0;
  const tripAuto = odometer.tripMeterAutomaticKm || 0;
  const tripSinceCharge = odometer.tripMeterSinceChargeKm || 0;
  const avgSpeedManual = odometer.averageSpeedKmPerHour || 0;
  const avgSpeedAuto = odometer.averageSpeedKmPerHourAutomatic || 0;
  const avgSpeedSinceCharge = odometer.averageSpeedKmPerHourSinceCharge || 0;

  // Check for milestones
  const getMilestone = (km: number) => {
    if (km >= 100000) return '100k+';
    if (km >= 50000) return '50k+';
    if (km >= 25000) return '25k+';
    if (km >= 10000) return '10k+';
    return null;
  };

  const milestone = getMilestone(totalKm);

  const getEfficiencyColor = (kwh: number) => {
    if (!kwh) return 'dimmed';
    if (kwh < 18) return 'green';
    if (kwh < 22) return 'orange';
    return 'red';
  };

  const efficiencyColor = getEfficiencyColor(battery.averageEnergyConsumptionKwhPer100Km);
  const isDark = colorScheme === 'dark';
  const iconProps = isDark
    ? { variant: 'filled', color: 'dark' }
    : { variant: 'outline', color: 'dark', style: { borderColor: 'var(--mantine-color-dark-9)' } };

  return (
    <Paper p="md" withBorder radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={600} size="lg">
            Odometer & Trips
          </Text>
          {milestone && (
            <Badge size="lg" color="orange" variant="light">
              🏆 {milestone} Club
            </Badge>
          )}
        </Group>

        {/* Total Odometer */}
        <Paper p="md" withBorder radius="sm">
          <Group justify="center" gap="lg">
            <ThemeIcon size={60} radius="md" {...iconProps} c="polestarOrange">
              <IconRoad size={32} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Total Distance
              </Text>
              <Text size="xl" fw={700}>
                {totalKm.toLocaleString()} km
              </Text>
              <Text size="xs" c="dimmed">
                {(totalKm * 0.621371).toLocaleString()} miles
              </Text>
            </div>
          </Group>
        </Paper>

        {/* Trip Meters */}
        <Text size="sm" fw={600} c="dimmed">
          Trip Meters
        </Text>
        <Grid gutter="md">
          {/* Manual Trip */}
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Paper p="md" withBorder radius="sm" h="100%">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    Manual Trip
                  </Text>
                  <IconGauge size={16} color="#64748b" />
                </Group>
                <Text size="xl" fw={700}>
                  {tripManual.toFixed(1)} km
                </Text>
                <Text size="xs" c="dimmed">
                  Avg: {avgSpeedManual} km/h
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Automatic Trip */}
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Paper p="md" withBorder radius="sm" h="100%">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    Automatic Trip
                  </Text>
                  <IconGauge size={16} color="#64748b" />
                </Group>
                <Text size="xl" fw={700}>
                  {tripAuto.toFixed(1)} km
                </Text>
                <Text size="xs" c="dimmed">
                  Avg: {avgSpeedAuto} km/h
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Since Charge */}
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Paper p="md" withBorder radius="sm" h="100%">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    Since Charge
                  </Text>
                  <IconBattery size={16} color="#f97316" />
                </Group>
                <Text size="xl" fw={700}>
                  {tripSinceCharge ? tripSinceCharge.toFixed(1) : '--'} km
                </Text>
                <Text size="xs" c="dimmed">
                  Avg: {avgSpeedSinceCharge || '--'} km/h
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Efficiency */}
        {battery && (
          <Paper p="sm" withBorder radius="sm">
            <Group justify="space-between">
              <Group gap="sm">
                <ThemeIcon size="lg" radius="md" {...iconProps} c="polestarOrange">
                  <IconTrendingUp size={20} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed">
                    Average Consumption
                  </Text>
                  <Text size="sm" fw={600} c={efficiencyColor}>
                    {battery.averageEnergyConsumptionKwhPer100Km || '--'} kWh/100km
                  </Text>
                </div>
              </Group>
              <Badge color="dark" variant="dot">
                {battery.averageEnergyConsumptionKwhPer100KmSinceCharge
                  ? `${battery.averageEnergyConsumptionKwhPer100KmSinceCharge} kWh/100km since charge`
                  : 'Since charge: --'}
              </Badge>
            </Group>
          </Paper>
        )}
      </Stack>
    </Paper>
  );
}
