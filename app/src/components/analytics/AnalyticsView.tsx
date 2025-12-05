import {
  ActionIcon,
  Badge,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { IconBolt, IconChargingPile, IconRoute, IconSearch } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { ChartDataProcessor } from '../../services/charts/ChartDataProcessor';
import type { Trip } from '../../types';

interface AnalyticsViewProps {
  data: Trip[];
}

function AnalyticsView({ data }: AnalyticsViewProps) {
  const processor = useMemo(() => new ChartDataProcessor(), []);
  const [chargerNames, setChargerNames] = useState({});
  const [loadingNames, setLoadingNames] = useState({});
  const getLocationKey = (lat?: number, lng?: number) => `${lat ?? 0}-${lng ?? 0}`;

  const chargingStats = useMemo(() => processor.processChargingSessions(data), [data, processor]);
  const routeStats = useMemo(() => processor.processRouteAnalysis(data), [data, processor]);

  const fetchChargerName = async (lat, lng) => {
    if (lat == null || lng == null) return;
    const locationKey = getLocationKey(lat, lng);
    setLoadingNames((prev) => ({ ...prev, [locationKey]: true }));
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Polestar Telemetry',
          },
        }
      );
      const data = await response.json();
      const name =
        data.name ||
        data.address?.amenity ||
        data.address?.shop ||
        data.address?.building ||
        'Unknown Location';
      setChargerNames((prev) => ({ ...prev, [locationKey]: name }));
    } catch (error) {
      console.error('Failed to fetch charger name', error);
    } finally {
      setLoadingNames((prev) => ({ ...prev, [locationKey]: false }));
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <Paper p="md" radius="md" withBorder>
      <Group justify="space-between">
        <div>
          <Text c="dimmed" tt="uppercase" fw={700} size="xs">
            {title}
          </Text>
          <Text fw={700} size="xl">
            {value}
          </Text>
          {subtitle && (
            <Text c="dimmed" size="xs" mt="xs">
              {subtitle}
            </Text>
          )}
        </div>
        <ThemeIcon color={color} variant="light" size={38} radius="md">
          <Icon size={24} stroke={1.5} />
        </ThemeIcon>
      </Group>
    </Paper>
  );

  const ChargingLocationTable = ({ locations }) => (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Location</Table.Th>
          <Table.Th>Sessions</Table.Th>
          <Table.Th>Total Charged</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {locations.map((loc) => {
          const locationKey = getLocationKey(loc.lat, loc.lng);
          const rowKey = `${locationKey}-${loc.location}`;
          return (
            <Table.Tr key={rowKey}>
              <Table.Td>
                <Group gap="xs">
                  <div>
                    <Text size="sm">{loc.location.split(',')[0]}</Text>
                    {chargerNames[locationKey] && (
                      <Text size="xs" c="blue" fw={500}>
                        {chargerNames[locationKey]}
                      </Text>
                    )}
                  </div>
                  {!chargerNames[locationKey] && (
                    <Tooltip label="Identify Charger (via OpenStreetMap)">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="blue"
                        loading={loadingNames[locationKey]}
                        onClick={() => fetchChargerName(loc.lat, loc.lng)}
                      >
                        <IconSearch size={14} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              </Table.Td>
              <Table.Td>{loc.count}</Table.Td>
              <Table.Td>{loc.totalKwh.toFixed(1)} kWh</Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );

  const RouteTable = ({ routes, type = 'repeated' }) => (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Route (Start → End)</Table.Th>
          <Table.Th>Trips</Table.Th>
          <Table.Th>Avg Dist</Table.Th>
          <Table.Th>Efficiency</Table.Th>
          {type === 'inefficient' && <Table.Th>Detour Factor</Table.Th>}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {routes.map((route) => {
          const routeKey = route.id || `${route.startAddress}-${route.endAddress}-${route.count}`;
          return (
            <Table.Tr key={routeKey}>
              <Table.Td style={{ maxWidth: 300 }}>
                <Text size="xs" fw={500}>
                  {route.startAddress.split(',')[0]}
                </Text>
                <Text size="xs" c="dimmed">
                  ↓
                </Text>
                <Text size="xs" fw={500}>
                  {route.endAddress.split(',')[0]}
                </Text>
              </Table.Td>
              <Table.Td>{route.count}</Table.Td>
              <Table.Td>{route.avgDistance.toFixed(1)} km</Table.Td>
              <Table.Td>
                <Badge
                  color={
                    route.avgEfficiency < 18
                      ? 'polestarOrange'
                      : route.avgEfficiency < 22
                        ? 'orange'
                        : 'polestarRed'
                  }
                  variant="light"
                >
                  {route.avgEfficiency.toFixed(1)} kWh/100km
                </Badge>
              </Table.Td>
              {type === 'inefficient' && (
                <Table.Td>
                  <Badge color="orange" variant="outline">
                    {route.detourFactor.toFixed(1)}x
                  </Badge>
                </Table.Td>
              )}
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );

  return (
    <Stack gap="lg">
      {/* Charging Analysis Section */}
      <Stack gap="md">
        <Group align="center" gap="xs">
          <IconChargingPile size={24} color="var(--mantine-color-blue-6)" />
          <Text size="lg" fw={700}>
            Charging Pattern Analysis
          </Text>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <StatCard
            title="Total Charged"
            value={`${chargingStats.totalChargedKwh.toFixed(0)} kWh`}
            subtitle="Estimated from SOC increase"
            icon={IconBolt}
            color="orange"
          />
          <StatCard
            title="Charging Sessions"
            value={chargingStats.totalSessions}
            subtitle="Detected sessions"
            icon={IconChargingPile}
            color="blue"
          />
          <StatCard
            title="Avg Charge / Session"
            value={`${chargingStats.avgChargeKwh.toFixed(1)} kWh`}
            subtitle="Average energy added"
            icon={IconBolt}
            color="polestarOrange"
          />
        </SimpleGrid>

        <Paper p="md" withBorder radius="md">
          <Text fw={600} mb="md">
            Top Charging Locations
          </Text>
          {chargingStats.topLocations.length > 0 ? (
            <ChargingLocationTable locations={chargingStats.topLocations} />
          ) : (
            <Text c="dimmed" fs="italic">
              No charging sessions detected (requires sequential trip data with SOC)
            </Text>
          )}
        </Paper>
      </Stack>

      {/* Route Analysis Section */}
      <Stack gap="md" mt="xl">
        <Group align="center" gap="xs">
          <IconRoute size={24} color="var(--mantine-color-orange-6)" />
          <Text size="lg" fw={700}>
            Route Optimization & Analysis
          </Text>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Paper p="md" withBorder radius="md">
            <Group justify="space-between" mb="md">
              <Text fw={600}>Top Repeated Routes</Text>
              <Badge color="blue">Most Frequent</Badge>
            </Group>
            {routeStats.repeatedRoutes.length > 0 ? (
              <RouteTable routes={routeStats.repeatedRoutes} type="repeated" />
            ) : (
              <Text c="dimmed" fs="italic">
                No repeated routes found yet.
              </Text>
            )}
          </Paper>

          <Paper p="md" withBorder radius="md">
            <Group justify="space-between" mb="md">
              <Text fw={600}>Inefficient Routes</Text>
              <Badge color="orange">High Detour Factor</Badge>
            </Group>
            {routeStats.inefficientRoutes.length > 0 ? (
              <RouteTable routes={routeStats.inefficientRoutes} type="inefficient" />
            ) : (
              <Text c="dimmed" fs="italic">
                No significantly inefficient routes detected.
              </Text>
            )}
          </Paper>
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}

export default AnalyticsView;
