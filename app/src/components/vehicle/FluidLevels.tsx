// @ts-nocheck
import { Badge, Grid, Group, Paper, RingProgress, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconCircleCheck, IconDroplet } from '@tabler/icons-react';

interface FluidLevelsProps {
  health: any;
}

export default function FluidLevels({ health }: FluidLevelsProps) {
  if (!health) {
    return (
      <Paper p="md" withBorder radius="md">
        <Text c="dimmed" ta="center">
          No fluid levels data available
        </Text>
      </Paper>
    );
  }

  const hasWarning = (warning: string) => {
    return warning && !warning.includes('NO_WARNING');
  };

  const fluids = [
    {
      name: 'Brake Fluid',
      warning: health.brakeFluidLevelWarning,
      icon: IconDroplet,
    },
    {
      name: 'Engine Coolant',
      warning: health.engineCoolantLevelWarning,
      icon: IconDroplet,
    },
    {
      name: 'Oil Level',
      warning: health.oilLevelWarning,
      icon: IconDroplet,
    },
    {
      name: 'Washer Fluid',
      warning: health.washerFluidLevelWarning,
      icon: IconDroplet,
    },
  ];

  const warningCount = fluids.filter((f) => hasWarning(f.warning)).length;

  return (
    <Paper p="md" withBorder radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={600} size="lg">
            Fluid Levels
          </Text>
          <Badge
            size="lg"
            color={warningCount === 0 ? 'polestarOrange' : 'polestarRed'}
            variant="light"
            leftSection={
              warningCount === 0 ? <IconCircleCheck size={16} /> : <IconAlertTriangle size={16} />
            }
          >
            {warningCount === 0 ? 'All OK' : `${warningCount} Low`}
          </Badge>
        </Group>

        <Grid gutter="md">
          {fluids.map((fluid) => {
            const isLow = hasWarning(fluid.warning);
            const level = isLow ? 30 : 85; // Simulated level
            const fluidColor = isLow ? 'polestarRed' : 'polestarOrange';

            return (
              <Grid.Col key={fluid.name} span={{ base: 6, sm: 3 }}>
                <Paper p="md" withBorder radius="sm" h="100%">
                  <Stack align="center" gap="xs">
                    <RingProgress
                      size={100}
                      thickness={10}
                      roundCaps
                      sections={[{ value: level, color: fluidColor }]}
                      label={
                        <Stack align="center" gap={0}>
                          <Text fw={700} size="lg" style={{ lineHeight: 1 }} c={fluidColor}>
                            {level}%
                          </Text>
                          <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                            {fluid.name.split(' ')[0]}
                          </Text>
                        </Stack>
                      }
                    />
                    <Text size="xs" c={fluidColor} ta="center">
                      {isLow ? 'Low Level' : 'Normal'}
                    </Text>
                  </Stack>
                </Paper>
              </Grid.Col>
            );
          })}
        </Grid>

        {/* 12V Battery */}
        <Paper p="md" withBorder radius="sm">
          <Group justify="space-between">
            <Group gap="sm">
              <ThemeIcon
                size="lg"
                radius="md"
                variant="light"
                color={
                  hasWarning(health.lowVoltageBatteryWarning) ? 'polestarRed' : 'polestarOrange'
                }
              >
                <IconDroplet size={20} />
              </ThemeIcon>
              <div>
                <Text size="sm" fw={600}>
                  12V Battery
                </Text>
                <Text
                  size="xs"
                  c={hasWarning(health.lowVoltageBatteryWarning) ? 'polestarRed' : 'dimmed'}
                >
                  {hasWarning(health.lowVoltageBatteryWarning) ? 'Low Voltage Warning' : 'Healthy'}
                </Text>
              </div>
            </Group>
            <Badge
              color={hasWarning(health.lowVoltageBatteryWarning) ? 'polestarRed' : 'polestarOrange'}
              variant="dot"
            >
              {hasWarning(health.lowVoltageBatteryWarning) ? 'Warning' : 'OK'}
            </Badge>
          </Group>
        </Paper>
      </Stack>
    </Paper>
  );
}
