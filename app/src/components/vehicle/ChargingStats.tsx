// @ts-nocheck
import {
  Badge,
  Grid,
  Group,
  Paper,
  RingProgress,
  Stack,
  Text,
  ThemeIcon,
  useMantineColorScheme,
} from '@mantine/core';
import { IconBolt, IconClock, IconGauge, IconPlug } from '@tabler/icons-react';
import styles from './VehicleStyles.module.css';

interface ChargingStatsProps {
  battery: any;
  chronos: any;
}

export default function ChargingStats({ battery, chronos }: ChargingStatsProps) {
  const { colorScheme } = useMantineColorScheme();

  if (!battery) {
    return (
      <Paper p="md" withBorder radius="md">
        <Text c="dimmed" ta="center">
          No charging data available
        </Text>
      </Paper>
    );
  }

  const currentSOC = battery.batteryChargeLevelPercentage || 0;
  const targetSOC = chronos?.targetSoc?.targetSoc?.batteryChargeTargetLevel || 80;
  const ampLimit = chronos?.ampLimit?.ampLimit?.ampLimit || 16;
  const timeToFull = battery.estimatedChargingTimeToFullMinutes;
  const chargingPower = battery.chargingPowerWatts;
  const chargingCurrent = battery.chargingCurrentAmps;
  const chargingVoltage = battery.chargingVoltageVolts;
  const isCharging = battery.chargingStatus?.includes('CHARGING');
  const chargerConnected = battery.chargerConnectionStatus?.includes('CONNECTED');

  const isDark = colorScheme === 'dark';
  const iconProps = isDark
    ? { variant: 'filled', color: 'dark' }
    : { variant: 'outline', color: 'dark', style: { borderColor: 'var(--mantine-color-dark-9)' } };

  // Calculate estimated time to target
  const socDiff = targetSOC - currentSOC;
  const batteryCapacity = 79; // kWh for Polestar 2
  const chargingSpeed = (ampLimit * 230) / 1000; // kW (assuming 230V)
  const estimatedHoursToTarget =
    socDiff > 0 ? ((socDiff / 100) * batteryCapacity) / chargingSpeed : 0;
  const estimatedMinutesToTarget = Math.round(estimatedHoursToTarget * 60);

  return (
    <Paper p="md" withBorder radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={600} size="lg">
            Charging Stats
          </Text>
          <Badge
            size="lg"
            color={
              isCharging ? 'polestarOrange' : chargerConnected ? 'polestarOrange' : 'polestarGrey'
            }
            variant="light"
            leftSection={<IconPlug size={14} />}
          >
            {isCharging ? 'Charging' : chargerConnected ? 'Connected' : 'Unplugged'}
          </Badge>
        </Group>

        <Grid gutter="md">
          {/* Progress to Target */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Paper p="md" withBorder radius="sm" h="100%">
              <Stack align="center" gap="sm">
                <RingProgress
                  size={100}
                  thickness={10}
                  roundCaps
                  sections={[
                    { value: currentSOC, color: 'orange' },
                    { value: targetSOC - currentSOC, color: 'orange' },
                  ]}
                  label={
                    <Stack align="center" gap={0}>
                      <Text fw={700} size="lg" lh={1}>
                        {currentSOC}%
                      </Text>
                      <Text size="xs" c="dimmed">
                        of {targetSOC}%
                      </Text>
                    </Stack>
                  }
                />
                <Text size="xs" c="dimmed">
                  Progress to Target
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Charging Speed */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Paper p="md" withBorder radius="sm" h="100%">
              <Stack gap="md">
                <Group gap="sm">
                  <ThemeIcon size="lg" radius="md" color="orange" variant="light">
                    <IconGauge size={20} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed">
                      Max Charging Speed
                    </Text>
                    <Text size="lg" fw={700}>
                      {chargingSpeed.toFixed(1)} kW
                    </Text>
                  </div>
                </Group>

                <Group gap="sm">
                  <ThemeIcon size="lg" radius="md" {...iconProps} c="polestarOrange">
                    <IconBolt size={20} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed">
                      Amp Limit
                    </Text>
                    <Text size="lg" fw={700}>
                      {ampLimit} A
                    </Text>
                  </div>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Time Estimates */}
        <Grid gutter="md">
          <Grid.Col span={6}>
            <Paper p="sm" withBorder radius="sm">
              <Group gap="xs">
                <IconClock size={16} color="#f97316" />
                <div>
                  <Text size="xs" c="dimmed">
                    To Target ({targetSOC}%)
                  </Text>
                  <Text size="sm" fw={600}>
                    {socDiff > 0
                      ? `~${Math.floor(estimatedMinutesToTarget / 60)}h ${estimatedMinutesToTarget % 60}m`
                      : 'Complete'}
                  </Text>
                </div>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={6}>
            <Paper p="sm" withBorder radius="sm">
              <Group gap="xs">
                <IconClock size={16} color="#64748b" />
                <div>
                  <Text size="xs" c="dimmed">
                    To Full (100%)
                  </Text>
                  <Text size="sm" fw={600}>
                    {timeToFull
                      ? `${Math.floor(timeToFull / 60)}h ${timeToFull % 60}m`
                      : '~' +
                        Math.floor((((100 - currentSOC) / 100) * batteryCapacity) / chargingSpeed) +
                        'h'}
                  </Text>
                </div>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Live Charging Stats (if charging) */}
        {isCharging && chargingPower && (
          <Paper p="sm" withBorder radius="sm">
            <Group justify="space-around">
              <div className={styles.textCenter}>
                <Text size="xs" c="dimmed">
                  Power
                </Text>
                <Text size="sm" fw={700}>
                  {(chargingPower / 1000).toFixed(1)} kW
                </Text>
              </div>
              <div className={styles.textCenter}>
                <Text size="xs" c="dimmed">
                  Current
                </Text>
                <Text size="sm" fw={700}>
                  {chargingCurrent} A
                </Text>
              </div>
              <div className={styles.textCenter}>
                <Text size="xs" c="dimmed">
                  Voltage
                </Text>
                <Text size="sm" fw={700}>
                  {chargingVoltage} V
                </Text>
              </div>
            </Group>
          </Paper>
        )}
      </Stack>
    </Paper>
  );
}
