// @ts-nocheck
import {
  Badge,
  Button,
  FileButton,
  Grid,
  Group,
  Paper,
  RingProgress,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconBatteryCharging,
  IconBolt,
  IconClock,
  IconLock,
  IconLockOpen,
  IconMapPin,
  IconPlug,
  IconUpload,
} from '@tabler/icons-react';
import UIColors from '../../theme/uiColors';
import AirQualityDisplay from './AirQualityDisplay';
import ChargingStats from './ChargingStats';
import ChargingTimeline from './ChargingTimeline';
import ClimateControl from './ClimateControl';
import FluidLevels from './FluidLevels';
import LightsDashboard from './LightsDashboard';
import OdometerDisplay from './OdometerDisplay';
import ServiceReminder from './ServiceReminder';
import TirePressureMonitor from './TirePressureMonitor';
import VehicleDiagram from './VehicleDiagram';
import VehicleMap from './VehicleMap';

interface VehicleStatusProps {
  telematics: any;
  charging: any;
  activeTab?: string;
  onUpload?: (file: File) => void;
}

export default function VehicleStatus({
  telematics,
  charging,
  activeTab = 'overview',
  onUpload,
}: VehicleStatusProps) {
  // Extract latest data points
  const battery = telematics?.battery?.[0] || {};
  const health = telematics?.health?.[0] || {};
  const exterior = telematics?.exterior?.[0] || {};
  const location = telematics?.location?.[0] || {};
  const odometer = telematics?.odometer?.[0] || {};
  const preCleaning = telematics?.preCleaning?.[0] || {};
  const parkingClimatization = telematics?.parkingClimatization?.[0] || {};

  const batteryLevel = battery.batteryChargeLevelPercentage || 0;
  const rangeKm = battery.estimatedDistanceToEmptyKm || 0;
  const isCharging = battery.chargingStatus === 'CHARGING_STATUS_CHARGING';
  const isConnected = battery.chargerConnectionStatus === 'CHARGER_CONNECTION_STATUS_CONNECTED';

  const serviceDistance = health.distanceToServiceKm || 0;
  // Assuming 30,000 km service interval for calculation
  const serviceProgress = Math.min(100, Math.max(0, ((30000 - serviceDistance) / 30000) * 100));

  const isLocked = exterior.centralLock === 'LOCK_STATUS_LOCKED';

  const lat = location.coordinate?.latitude || 0;
  const lng = location.coordinate?.longitude || 0;

  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const iconProps = isDark
    ? { variant: 'filled', color: 'dark' }
    : { variant: 'outline', color: 'dark', style: { borderColor: 'var(--mantine-color-dark-9)' } };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Grid gutter="md">
            {/* Battery Status */}
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Paper p="md" radius="md" withBorder h="100%">
                <Stack align="center" gap="xs">
                  <RingProgress
                    size={140}
                    thickness={12}
                    roundCaps
                    sections={[
                      { value: batteryLevel, color: isCharging ? UIColors.ACTIVE : 'orange' },
                    ]}
                    label={
                      <Stack align="center" gap={0}>
                        <Text fw={700} size="xl" lh={1}>
                          {batteryLevel}%
                        </Text>
                        <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                          Battery
                        </Text>
                      </Stack>
                    }
                  />
                  {isCharging && (
                    <Badge
                      color="polestarOrange"
                      variant="light"
                      leftSection={<IconBolt size={12} />}
                    >
                      Charging
                    </Badge>
                  )}
                </Stack>
              </Paper>
            </Grid.Col>

            {/* Service Status */}
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Paper p="md" radius="md" withBorder h="100%">
                <Stack align="center" gap="xs">
                  <RingProgress
                    size={140}
                    thickness={12}
                    roundCaps
                    sections={[{ value: serviceProgress, color: 'orange' }]}
                    label={
                      <Stack align="center" gap={0}>
                        <Text fw={700} size="xl" lh={1}>
                          {Math.round(serviceDistance / 1000)}k
                        </Text>
                        <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                          Service
                        </Text>
                      </Stack>
                    }
                  />
                  <Text size="xs" c="dimmed">
                    {health.daysToService} days to service
                  </Text>
                </Stack>
              </Paper>
            </Grid.Col>

            {/* Lock Status */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="xl" radius="md" withBorder h="100%">
                <Group justify="center" align="center" h="100%">
                  <Stack align="center" gap="md">
                    <ThemeIcon
                      size={60}
                      radius="xl"
                      {...iconProps}
                      c={isLocked ? 'polestarOrange' : 'polestarRed'}
                    >
                      {isLocked ? <IconLock size={32} /> : <IconLockOpen size={32} />}
                    </ThemeIcon>
                    <Stack align="center" gap={0}>
                      <Text fw={700} size="xl">
                        {isLocked ? 'Locked' : 'Unlocked'}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Press to {isLocked ? 'unlock' : 'lock'}
                      </Text>
                    </Stack>
                  </Stack>
                </Group>
              </Paper>
            </Grid.Col>

            {/* Map */}
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Paper radius="md" withBorder h={300}>
                <VehicleMap latitude={lat} longitude={lng} />
              </Paper>
              <Group justify="space-between" mt="xs">
                <Group gap="xs">
                  <IconMapPin size={16} opacity={0.5} />
                  <Text size="sm" c="dimmed">
                    Parked Location
                  </Text>
                </Group>
                <Text size="xs" c="dimmed">
                  Last updated: {new Date(location.metaReceivedAt).toLocaleString()}
                </Text>
              </Group>
            </Grid.Col>

            {/* Range Estimate */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper p="lg" radius="md" withBorder h="100%">
                <Stack justify="center" h="100%">
                  <Group>
                    <ThemeIcon size="lg" radius="md" {...iconProps} c="polestarOrange">
                      <IconBatteryCharging size={20} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                        Estimated Range
                      </Text>
                      <Text size="xl" fw={700}>
                        {rangeKm} km
                      </Text>
                    </div>
                  </Group>
                  <Text size="xs" c="dimmed" ta="right">
                    Updated just now
                  </Text>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        );

      case 'health':
        return (
          <Stack gap="md">
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <VehicleDiagram exterior={exterior} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TirePressureMonitor health={health} />
              </Grid.Col>
            </Grid>
            <FluidLevels health={health} />
            <LightsDashboard health={health} />
          </Stack>
        );

      case 'air':
        return <AirQualityDisplay preCleaning={preCleaning} />;

      case 'climate':
        return <ClimateControl climatization={parkingClimatization} />;

      case 'charging':
        return (
          <Stack gap="md">
            <ChargingStats battery={battery} chronos={charging} />
            <ChargingTimeline chargeTimer={charging?.globalChargeTimer} />
          </Stack>
        );

      case 'stats':
        return (
          <Stack gap="md">
            <OdometerDisplay odometer={odometer} battery={battery} />
            <ServiceReminder health={health} />
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <div>
          <Title order={2}>Polestar 2</Title>
          <Text c="dimmed" size="sm">
            VIN: {battery.vin || 'Unknown'}
          </Text>
        </div>
        <Badge size="lg" color={isConnected ? 'polestarOrange' : 'polestarGrey'} variant="light">
          {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
        </Badge>
      </Group>

      {renderContent()}

      {/* Charging Configuration - shown on all tabs */}
      {charging && (
        <>
          <Text fw={600} size="lg" mt="md">
            Charging Configuration
          </Text>
          <Grid gutter="md">
            {/* Target SOC */}
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Paper p="md" radius="md" withBorder>
                <Group>
                  <ThemeIcon size="lg" radius="md" {...iconProps} c="polestarOrange">
                    <IconBatteryCharging size={20} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                      Target Charge
                    </Text>
                    <Text size="xl" fw={700}>
                      {charging.targetSoc?.targetSoc?.batteryChargeTargetLevel || 'N/A'}%
                    </Text>
                  </div>
                </Group>
              </Paper>
            </Grid.Col>

            {/* Amp Limit */}
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Paper p="md" radius="md" withBorder>
                <Group>
                  <ThemeIcon size="lg" radius="md" {...iconProps} c="polestarOrange">
                    <IconPlug size={20} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                      Amperage Limit
                    </Text>
                    <Text size="xl" fw={700}>
                      {charging.ampLimit?.ampLimit?.ampLimit || 'N/A'} A
                    </Text>
                  </div>
                </Group>
              </Paper>
            </Grid.Col>

            {/* Schedule */}
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Paper p="md" radius="md" withBorder>
                <Group>
                  <ThemeIcon size="lg" radius="md" {...iconProps} c="polestarOrange">
                    <IconClock size={20} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                      Schedule
                    </Text>
                    <Text size="xl" fw={700}>
                      {charging.globalChargeTimer?.globalChargeTimer?.start
                        ? `${String(charging.globalChargeTimer.globalChargeTimer.start.hour).padStart(2, '0')}:${String(charging.globalChargeTimer.globalChargeTimer.start.minute).padStart(2, '0')} - ${String(charging.globalChargeTimer.globalChargeTimer.stop.hour).padStart(2, '0')}:${String(charging.globalChargeTimer.globalChargeTimer.stop.minute).padStart(2, '0')}`
                        : 'Off'}
                    </Text>
                  </div>
                </Group>
              </Paper>
            </Grid.Col>
          </Grid>
        </>
      )}

      {!charging && onUpload && (
        <Paper p="md" radius="md" withBorder mt="md">
          <Stack align="center" gap="xs">
            <Text fw={600} size="lg">
              Charging Configuration
            </Text>
            <Text c="dimmed" size="sm">
              Upload chronos.json to see charging settings and schedule
            </Text>
            <FileButton onChange={onUpload} accept="application/json">
              {(props) => (
                <Button
                  {...props}
                  variant="light"
                  color="polestarOrange"
                  leftSection={<IconUpload size={16} />}
                >
                  Upload chronos.json
                </Button>
              )}
            </FileButton>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
