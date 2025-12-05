// @ts-nocheck
import { Badge, Grid, Group, Paper, RingProgress, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconLeaf, IconWind } from '@tabler/icons-react';

interface AirQualityDisplayProps {
  preCleaning: any;
}

export default function AirQualityDisplay({ preCleaning }: AirQualityDisplayProps) {
  if (!preCleaning) {
    return (
      <Paper p="md" withBorder radius="md">
        <Text c="dimmed" ta="center">
          No air quality data available
        </Text>
      </Paper>
    );
  }

  const aqi = preCleaning.measuredAirQualityIndex || 0;
  const pm25 = preCleaning.measuredParticulateMatter25 || 0;

  // AQI Rating (simplified scale)
  const getAQIRating = (value: number) => {
    if (value <= 50)
      return { label: 'Good', color: 'orange', description: 'Air quality is satisfactory' };
    if (value <= 100)
      return { label: 'Moderate', color: 'orange', description: 'Acceptable air quality' };
    if (value <= 150)
      return {
        label: 'Unhealthy for Sensitive',
        color: 'orange',
        description: 'Sensitive groups may experience effects',
      };
    if (value <= 200)
      return {
        label: 'Unhealthy',
        color: 'orange',
        description: 'Everyone may experience effects',
      };
    return { label: 'Very Unhealthy', color: 'orange', description: 'Health alert' };
  };

  const aqiRating = getAQIRating(aqi);
  const aqiPercentage = Math.min(100, (aqi / 200) * 100);

  return (
    <Paper p="md" withBorder radius="md">
      <Stack gap="md">
        <Text fw={600} size="lg">
          Cabin Air Quality
        </Text>

        <Grid gutter="md">
          {/* AQI Gauge */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Paper p="md" withBorder radius="sm">
              <Stack align="center" gap="md">
                <RingProgress
                  size={160}
                  thickness={16}
                  roundCaps
                  sections={[{ value: aqiPercentage, color: aqiRating.color }]}
                  label={
                    <Stack align="center" gap={0}>
                      <Text fw={700} size="xl" style={{ lineHeight: 1 }}>
                        {aqi}
                      </Text>
                      <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                        AQI
                      </Text>
                    </Stack>
                  }
                />
                <Stack align="center" gap={4}>
                  <Badge size="lg" color={aqiRating.color} variant="light">
                    {aqiRating.label}
                  </Badge>
                  <Text size="xs" c="dimmed" ta="center">
                    {aqiRating.description}
                  </Text>
                </Stack>
              </Stack>
            </Paper>
          </Grid.Col>

          {/* PM2.5 */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Paper p="md" withBorder radius="sm">
              <Stack gap="md">
                <Group>
                  <ThemeIcon size="xl" radius="md" color="dark" variant="light">
                    <IconWind size={28} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                      PM2.5 Level
                    </Text>
                    <Text size="xl" fw={700}>
                      {pm25} μg/m³
                    </Text>
                  </div>
                </Group>

                <Text size="xs" c="dimmed">
                  Particulate matter 2.5 micrometers or smaller
                </Text>

                {pm25 > 35 && (
                  <Badge
                    color="orange"
                    variant="light"
                    leftSection={<IconAlertTriangle size={14} />}
                  >
                    Elevated PM2.5
                  </Badge>
                )}
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Pre-Cleaning Status */}
        <Paper p="md" withBorder radius="sm">
          <Group justify="space-between">
            <Group gap="sm">
              <ThemeIcon size="lg" radius="md" color="dark" variant="light">
                <IconLeaf size={20} />
              </ThemeIcon>
              <div>
                <Text size="sm" fw={600}>
                  Pre-Cleaning System
                </Text>
                <Text size="xs" c="dimmed">
                  {preCleaning.runningStatus === 'RUNNING_STATUS_OFF' ? 'Idle' : 'Active'}
                </Text>
              </div>
            </Group>
            <Badge color="dark" variant="dot">
              {preCleaning.lastCycleValid ? 'Last Cycle OK' : 'Ready'}
            </Badge>
          </Group>
        </Paper>

        {/* Info */}
        <Text size="xs" c="dimmed" ta="center">
          Air quality data from cabin air filter system
        </Text>
      </Stack>
    </Paper>
  );
}
