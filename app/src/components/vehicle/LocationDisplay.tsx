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
import { IconCar, IconClock, IconCompass, IconMapPin, IconMountain } from '@tabler/icons-react';
import styles from './VehicleStyles.module.css';

interface LocationDisplayProps {
  location: any;
}

export default function LocationDisplay({ location }: LocationDisplayProps) {
  const { colorScheme } = useMantineColorScheme();

  if (!location || !location.coordinate) {
    return (
      <Paper p="md" withBorder radius="md">
        <Text c="dimmed" ta="center">
          No location data available
        </Text>
      </Paper>
    );
  }

  const lat = location.coordinate?.latitude || 0;
  const lng = location.coordinate?.longitude || 0;
  const altitude = location.altitude;
  const heading = location.heading;
  const speed = location.speed;
  const isDark = colorScheme === 'dark';
  const iconProps = isDark
    ? { variant: 'filled', color: 'dark' }
    : { variant: 'outline', color: 'dark', style: { borderColor: 'var(--mantine-color-dark-9)' } };
  const timestamp = location.metaReceivedAt;

  // Convert heading to compass direction
  const getCompassDirection = (degrees: number) => {
    if (degrees === null || degrees === undefined) return 'N/A';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const compassDirection = getCompassDirection(heading);

  return (
    <Paper p="md" withBorder radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={600} size="lg">
            Vehicle Location
          </Text>
          <Badge size="lg" color="dark" variant="light" leftSection={<IconMapPin size={14} />}>
            Parked
          </Badge>
        </Group>

        <Grid gutter="md">
          {/* Coordinates */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Paper p="md" withBorder radius="sm">
              <Group gap="sm">
                <ThemeIcon size="lg" radius="md" color="orange" variant="light">
                  <IconMapPin size={20} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed">
                    GPS Coordinates
                  </Text>
                  <Text size="sm" fw={600}>
                    {lat.toFixed(6)}, {lng.toFixed(6)}
                  </Text>
                </div>
              </Group>
            </Paper>
          </Grid.Col>

          {/* Heading */}
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Paper p="md" withBorder radius="sm" h="100%">
              <Stack gap="xs" align="center">
                <ThemeIcon size="lg" radius="md" {...iconProps} c="polestarOrange">
                  <IconCompass size={20} />
                </ThemeIcon>
                <div className={styles.textCenter}>
                  <Text size="xs" c="dimmed">
                    Heading
                  </Text>
                  <Text size="lg" fw={700}>
                    {compassDirection}
                  </Text>
                  {heading !== null && heading !== undefined && (
                    <Text size="xs" c="dimmed">
                      {heading}°
                    </Text>
                  )}
                </div>
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Altitude */}
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Paper p="md" withBorder radius="sm" h="100%">
              <Stack gap="xs" align="center">
                <ThemeIcon size="lg" radius="md" {...iconProps} c="polestarOrange">
                  <IconMountain size={20} />
                </ThemeIcon>
                <div className={styles.textCenter}>
                  <Text size="xs" c="dimmed">
                    Altitude
                  </Text>
                  <Text size="lg" fw={700}>
                    {altitude || '--'}
                  </Text>
                  <Text size="xs" c="dimmed">
                    meters
                  </Text>
                </div>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Speed (if available) */}
        {speed && speed !== '0' && (
          <Paper p="sm" withBorder radius="sm">
            <Group justify="space-between">
              <Group gap="sm">
                <ThemeIcon size="lg" radius="md" {...iconProps} c="polestarOrange">
                  <IconCar size={20} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed">
                    Current Speed
                  </Text>
                  <Text size="sm" fw={600}>
                    {speed} km/h
                  </Text>
                </div>
              </Group>
            </Group>
          </Paper>
        )}

        {/* Last Updated */}
        <Paper p="sm" withBorder radius="sm">
          <Group justify="space-between">
            <Group gap="xs">
              <IconClock size={16} color="#64748b" />
              <Text size="xs" c="dimmed">
                Last Updated
              </Text>
            </Group>
            <Text size="xs" fw={500}>
              {timestamp ? new Date(timestamp).toLocaleString() : 'Unknown'}
            </Text>
          </Group>
        </Paper>
      </Stack>
    </Paper>
  );
}
