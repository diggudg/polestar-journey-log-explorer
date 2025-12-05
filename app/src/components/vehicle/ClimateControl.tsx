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
import {
  IconArmchair2,
  IconClock,
  IconPower,
  IconSteeringWheel,
  IconWind,
} from '@tabler/icons-react';
import styles from './VehicleStyles.module.css';

interface ClimateControlProps {
  climatization: any;
}

export default function ClimateControl({ climatization }: ClimateControlProps) {
  const { colorScheme } = useMantineColorScheme();

  if (!climatization) {
    return (
      <Paper p="md" withBorder radius="md">
        <Text c="dimmed" ta="center">
          No climate data available
        </Text>
      </Paper>
    );
  }

  const isRunning = climatization.runningStatus === 'RUNNING_STATUS_ON';
  const currentTemp = climatization.currentCompartmentTemperatureCelsius;
  const targetTemp = climatization.requestedCompartmentTemperatureCelsius;

  const isDark = colorScheme === 'dark';
  const iconProps = isDark
    ? { variant: 'filled', color: 'dark' }
    : { variant: 'outline', color: 'dark', style: { borderColor: 'var(--mantine-color-dark-9)' } };
  const runtimeLeft = climatization.runtimeLeftMinutes || 0;
  const ventilation = climatization.ventilation?.replace('VENTILATION_', '') || 'Off';

  // Seat heating levels
  const getHeatingLevel = (intensity: string) => {
    if (!intensity || intensity === 'HEATING_INTENSITY_UNSPECIFIED') return 0;
    if (intensity.includes('LOW')) return 1;
    if (intensity.includes('MEDIUM')) return 2;
    if (intensity.includes('HIGH')) return 3;
    return 0;
  };

  const seats = [
    { position: 'Front Left', level: getHeatingLevel(climatization.requestedFrontLeftSeat) },
    { position: 'Front Right', level: getHeatingLevel(climatization.requestedFrontRightSeat) },
    { position: 'Rear Left', level: getHeatingLevel(climatization.requestedRearLeftSeat) },
    { position: 'Rear Right', level: getHeatingLevel(climatization.requestedRearRightSeat) },
  ];

  const steeringWheel = getHeatingLevel(climatization.requestedSteeringWheelHeating);

  return (
    <Paper p="md" withBorder radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={600} size="lg">
            Climate Control
          </Text>
          <Badge
            size="lg"
            color={isRunning ? 'orange' : 'polestarGrey'}
            variant="light"
            leftSection={<IconPower size={14} />}
          >
            {isRunning ? 'Active' : 'Off'}
          </Badge>
        </Group>

        <Grid gutter="md">
          {/* Temperature Display */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Paper p="md" withBorder radius="sm" h="100%">
              <Stack align="center" gap="sm">
                <RingProgress
                  size={120}
                  thickness={10}
                  roundCaps
                  sections={[
                    { value: currentTemp ? (currentTemp / 30) * 100 : 0, color: 'orange' },
                  ]}
                  label={
                    <Stack align="center" gap={0}>
                      <Text fw={700} size="xl" lh={1}>
                        {currentTemp !== null ? `${currentTemp}°` : '--'}
                      </Text>
                      <Text size="xs" c="dimmed" fw={600}>
                        CABIN
                      </Text>
                    </Stack>
                  }
                />
                {targetTemp && (
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">
                      Target:
                    </Text>
                    <Text size="sm" fw={600}>
                      {targetTemp}°C
                    </Text>
                  </Group>
                )}
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Climate Status */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Paper p="md" withBorder radius="sm" h="100%">
              <Stack gap="md">
                <Group gap="sm">
                  <ThemeIcon size="lg" radius="md" {...iconProps} c="polestarOrange">
                    <IconWind size={20} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed">
                      Ventilation
                    </Text>
                    <Text size="sm" fw={600}>
                      {ventilation}
                    </Text>
                  </div>
                </Group>

                {isRunning && runtimeLeft > 0 && (
                  <Group gap="sm">
                    <ThemeIcon size="lg" radius="md" color="orange" variant="light">
                      <IconClock size={20} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" c="dimmed">
                        Time Remaining
                      </Text>
                      <Text size="sm" fw={600}>
                        {runtimeLeft} min
                      </Text>
                    </div>
                  </Group>
                )}
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Seat Heating Grid */}
        <Text size="sm" fw={600} c="dimmed">
          Seat Heating
        </Text>
        <Grid gutter="xs">
          {seats.map((seat) => (
            <Grid.Col key={seat.position} span={6}>
              <Paper p="sm" withBorder radius="sm">
                <Group justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon
                      size="sm"
                      radius="md"
                      {...iconProps}
                      c={seat.level > 0 ? 'orange' : 'dimmed'}
                    >
                      <IconArmchair2 size={14} />
                    </ThemeIcon>
                    <Text size="xs">{seat.position}</Text>
                  </Group>
                  <Group gap={2}>
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={seat.level >= level ? styles.legendOpen : styles.legendClosed}
                      />
                    ))}
                  </Group>
                </Group>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>

        {/* Steering Wheel Heating */}
        <Paper p="sm" withBorder radius="sm">
          <Group justify="space-between">
            <Group gap="sm">
              <ThemeIcon
                size="sm"
                radius="md"
                {...iconProps}
                c={steeringWheel > 0 ? 'orange' : 'dimmed'}
              >
                <IconSteeringWheel size={14} />
              </ThemeIcon>
              <Text size="sm" fw={500}>
                Steering Wheel Heating
              </Text>
            </Group>
            <Group gap={4}>
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={steeringWheel >= level ? styles.legendOpen : styles.legendClosed}
                />
              ))}
            </Group>
          </Group>
        </Paper>
      </Stack>
    </Paper>
  );
}
