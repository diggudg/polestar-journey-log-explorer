// @ts-nocheck
import { Badge, Grid, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconBulb, IconBulbOff, IconCircleCheck } from '@tabler/icons-react';
import UIColors from '../../theme/uiColors';

interface LightsDashboardProps {
  health: any;
}

export default function LightsDashboard({ health }: LightsDashboardProps) {
  if (!health) {
    return (
      <Paper p="md" withBorder radius="md">
        <Text c="dimmed" ta="center">
          No lights data available
        </Text>
      </Paper>
    );
  }

  const hasWarning = (warning: string) => {
    return warning && !warning.includes('NO_WARNING');
  };

  const lightGroups = [
    {
      category: 'Brake Lights',
      lights: [
        { name: 'Left', status: health.brakeLightLeftWarning },
        { name: 'Center', status: health.brakeLightCenterWarning },
        { name: 'Right', status: health.brakeLightRightWarning },
      ],
    },
    {
      category: 'Headlights',
      lights: [
        { name: 'High Beam L', status: health.highBeamLeftWarning },
        { name: 'High Beam R', status: health.highBeamRightWarning },
        { name: 'Low Beam L', status: health.lowBeamLeftWarning },
        { name: 'Low Beam R', status: health.lowBeamRightWarning },
      ],
    },
    {
      category: 'Daytime Running Lights',
      lights: [
        { name: 'Left DRL', status: health.daytimeRunningLightLeftWarning },
        { name: 'Right DRL', status: health.daytimeRunningLightRightWarning },
      ],
    },
    {
      category: 'Turn Signals',
      lights: [
        { name: 'Front Left', status: health.turnIndicationFrontLeftWarning },
        { name: 'Front Right', status: health.turnIndicationFrontRightWarning },
        { name: 'Rear Left', status: health.turnIndicationRearLeftWarning },
        { name: 'Rear Right', status: health.turnIndicationRearRightWarning },
      ],
    },
    {
      category: 'Fog Lights',
      lights: [
        { name: 'Front', status: health.fogLightFrontWarning },
        { name: 'Rear', status: health.fogLightRearWarning },
      ],
    },
    {
      category: 'Position Lights',
      lights: [
        { name: 'Front Left', status: health.positionLightFrontLeftWarning },
        { name: 'Front Right', status: health.positionLightFrontRightWarning },
        { name: 'Rear Left', status: health.positionLightRearLeftWarning },
        { name: 'Rear Right', status: health.positionLightRearRightWarning },
      ],
    },
    {
      category: 'Other Lights',
      lights: [
        { name: 'License Plate', status: health.registrationPlateLightWarning },
        { name: 'Side Markers', status: health.sideMarkLightsWarning },
      ],
    },
  ];

  const totalLights = lightGroups.reduce((sum, group) => sum + group.lights.length, 0);
  const warningCount = lightGroups.reduce(
    (sum, group) => sum + group.lights.filter((l) => hasWarning(l.status)).length,
    0
  );

  return (
    <Paper p="md" withBorder radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={600} size="lg">
            Exterior Lights Status
          </Text>
          <Badge
            size="lg"
            color={warningCount === 0 ? 'polestarOrange' : 'polestarRed'}
            variant="light"
            leftSection={
              warningCount === 0 ? <IconCircleCheck size={16} /> : <IconAlertTriangle size={16} />
            }
          >
            {warningCount === 0
              ? 'All OK'
              : `${warningCount} Warning${warningCount > 1 ? 's' : ''}`}
          </Badge>
        </Group>

        <Grid gutter="md">
          {lightGroups.map((group) => (
            <Grid.Col key={group.category} span={{ base: 12, sm: 6, md: 4 }}>
              <Paper p="sm" withBorder radius="sm">
                <Stack gap="xs">
                  <Text size="sm" fw={600} c="dimmed">
                    {group.category}
                  </Text>
                  {group.lights.map((light) => (
                    <Group
                      key={`${group.category}-${light.name}`}
                      justify="space-between"
                      wrap="nowrap"
                    >
                      <Group gap="xs">
                        <ThemeIcon
                          size="sm"
                          radius="xl"
                          variant="light"
                          color={hasWarning(light.status) ? 'polestarRed' : UIColors.ACTIVE}
                        >
                          {hasWarning(light.status) ? (
                            <IconBulbOff size={14} />
                          ) : (
                            <IconBulb size={14} />
                          )}
                        </ThemeIcon>
                        <Text size="xs">{light.name}</Text>
                      </Group>
                      <Badge
                        size="xs"
                        color={hasWarning(light.status) ? 'polestarRed' : 'polestarOrange'}
                        variant="dot"
                      >
                        {hasWarning(light.status) ? 'Warning' : 'OK'}
                      </Badge>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>

        {/* Summary */}
        <Paper p="sm" withBorder radius="sm">
          <Group justify="space-between">
            <Text size="sm" fw={500} c="dimmed">
              Total Lights Monitored
            </Text>
            <Text size="sm" fw={700}>
              {totalLights}
            </Text>
          </Group>
        </Paper>
      </Stack>
    </Paper>
  );
}
