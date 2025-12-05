// @ts-nocheck
import {
  Badge,
  Grid,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconBattery,
  IconCircleCheck,
  IconClock,
  IconRoad,
  IconTool,
} from '@tabler/icons-react';

interface ServiceReminderProps {
  health: any;
}

// Color logic based on Polestar Design System:
// - Critical/Urgent (<=7 days or <=500km): polestarRed (elementalRed)
// - Soon (<=30 days or <=1000km): orange (safetyOrange)
// - OK/Active: polestarOrange (safety orange)
// - Neutral/Inactive: polestarGrey

const getServiceColor = (daysToService: number, distanceToService: number) => {
  if (daysToService <= 7 || distanceToService <= 500) return 'polestarRed';
  if (daysToService <= 30 || distanceToService <= 1000) return 'orange';
  return 'polestarOrange';
};

const getServiceStatus = (daysToService: number, distanceToService: number) => {
  if (daysToService <= 7 || distanceToService <= 500)
    return { label: 'Service Urgent', icon: IconAlertTriangle };
  if (daysToService <= 30 || distanceToService <= 1000)
    return { label: 'Service Soon', icon: IconAlertTriangle };
  return { label: 'All Good', icon: IconCircleCheck };
};

export default function ServiceReminder({ health }: ServiceReminderProps) {
  const { colorScheme } = useMantineColorScheme();

  if (!health) {
    return (
      <Paper p="md" withBorder radius="md">
        <Text c="dimmed" ta="center">
          No service data available
        </Text>
      </Paper>
    );
  }

  const daysToService = health.daysToService || 0;
  const distanceToService = health.distanceToServiceKm || 0;
  const hoursToService = health.engineHoursToService || 0;

  // Assume 30k km / 730 days (2 years) / 1500 hours service interval
  const distanceProgress = Math.min(100, ((30000 - distanceToService) / 30000) * 100);
  const daysProgress = Math.min(100, ((730 - daysToService) / 730) * 100);
  const hoursProgress = Math.min(100, ((1500 - hoursToService) / 1500) * 100);

  const serviceColor = getServiceColor(daysToService, distanceToService);
  const serviceStatus = getServiceStatus(daysToService, distanceToService);
  const StatusIcon = serviceStatus.icon;

  // Individual thresholds for colors
  const daysColor =
    daysToService <= 7 ? 'polestarRed' : daysToService <= 30 ? 'orange' : 'polestarOrange';
  const distanceColor =
    distanceToService <= 500
      ? 'polestarRed'
      : distanceToService <= 1000
        ? 'orange'
        : 'polestarOrange';
  const hoursColor =
    hoursToService <= 7 ? 'polestarRed' : hoursToService <= 30 ? 'orange' : 'polestarOrange';

  // 12V Battery status
  // 12V Battery status
  const lowBatteryWarning = health.lowVoltageBatteryWarning?.includes('WARNING');
  const isDark = colorScheme === 'dark';
  const iconProps = isDark
    ? { variant: 'filled', color: 'dark' }
    : { variant: 'outline', color: 'dark', style: { borderColor: 'var(--mantine-color-dark-9)' } };

  return (
    <Paper p="md" withBorder radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={600} size="lg">
            Service & Maintenance
          </Text>
          <Badge
            size="lg"
            color={serviceColor}
            variant="outline"
            leftSection={<StatusIcon size={14} />}
          >
            {serviceStatus.label}
          </Badge>
        </Group>

        {/* Service Countdowns */}
        <Grid gutter="md">
          {/* Days */}
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Paper p="md" withBorder radius="sm" h="100%">
              <Stack gap="sm">
                <Group justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon size="sm" radius="md" {...iconProps} c={daysColor}>
                      <IconClock size={14} />
                    </ThemeIcon>
                    <Text size="xs" c="dimmed">
                      Days
                    </Text>
                  </Group>
                  <Text size="lg" fw={700} c={daysToService <= 30 ? daysColor : undefined}>
                    {daysToService}
                  </Text>
                </Group>
                <Progress value={daysProgress} color={daysColor} size="sm" radius="xl" />
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Distance */}
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Paper p="md" withBorder radius="sm" h="100%">
              <Stack gap="sm">
                <Group justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon size="sm" radius="md" {...iconProps} c={distanceColor}>
                      <IconRoad size={14} />
                    </ThemeIcon>
                    <Text size="xs" c="dimmed">
                      Distance
                    </Text>
                  </Group>
                  <Text
                    size="lg"
                    fw={700}
                    c={distanceToService <= 1000 ? distanceColor : undefined}
                  >
                    {Math.round(distanceToService / 1000)}k km
                  </Text>
                </Group>
                <Progress value={distanceProgress} color={distanceColor} size="sm" radius="xl" />
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Engine Hours */}
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Paper p="md" withBorder radius="sm" h="100%">
              <Stack gap="sm">
                <Group justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon size="sm" radius="md" {...iconProps} c="dimmed">
                      <IconTool size={14} />
                    </ThemeIcon>
                    <Text size="xs" c="dimmed">
                      Engine Hours
                    </Text>
                  </Group>
                  <Text size="lg" fw={700}>
                    {hoursToService}
                  </Text>
                </Group>
                <Progress value={hoursProgress} color={hoursColor} size="sm" radius="xl" />
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* 12V Battery */}
        <Paper p="sm" withBorder radius="sm">
          <Group justify="space-between">
            <Group gap="sm">
              <ThemeIcon
                size="lg"
                radius="md"
                {...iconProps}
                c={lowBatteryWarning ? 'polestarRed' : 'polestarOrange'}
              >
                <IconBattery size={20} />
              </ThemeIcon>
              <div>
                <Text size="sm" fw={500}>
                  12V Auxiliary Battery
                </Text>
                <Text size="xs" c={lowBatteryWarning ? 'polestarRed' : 'dimmed'}>
                  {lowBatteryWarning ? 'Low voltage warning' : 'Healthy'}
                </Text>
              </div>
            </Group>
            <Badge color={lowBatteryWarning ? 'polestarRed' : 'polestarOrange'} variant="outline">
              {lowBatteryWarning ? 'Check Battery' : 'OK'}
            </Badge>
          </Group>
        </Paper>
      </Stack>
    </Paper>
  );
}
