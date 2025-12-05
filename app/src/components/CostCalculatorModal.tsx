import {
  Badge,
  Box,
  Button,
  Center,
  Combobox,
  Divider,
  Grid,
  Group,
  Loader,
  Modal,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Slider,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  useCombobox,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconArrowRight,
  IconBatteryCharging,
  IconBolt,
  IconChargingPile,
  IconClock,
  IconCurrencyDollar,
  IconHome,
  IconMapPin,
} from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import type { Statistics } from '../types';

interface CostCalculatorModalProps {
  opened: boolean;
  onClose: () => void;
  statistics: Statistics | null;
}

function CostCalculatorModal({ opened, onClose, statistics }: CostCalculatorModalProps) {
  const { colorScheme } = useMantineColorScheme();

  // --- Global Settings ---
  const [currency, setCurrency] = useState('USD');
  const [homeRate, setHomeRate] = useState(0.16);
  const [publicRate, setPublicRate] = useState(0.45);

  // --- Historical Analysis State ---
  const [homeChargingPercent, setHomeChargingPercent] = useState(80);

  // --- Trip Planner State ---
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
  const [endCoords, setEndCoords] = useState<[number, number] | null>(null);
  const [tripDistanceKm, setTripDistanceKm] = useState<number | null>(null);
  const [tripDuration, setTripDuration] = useState<string | null>(null);
  const [tripChargingType, setTripChargingType] = useState('home'); // 'home' | 'public'
  const [currentBatteryPercent, setCurrentBatteryPercent] = useState<number | ''>(80);
  const [locationOptions, setLocationOptions] = useState<
    { label: string; value: string; lat: string; lon: string }[]
  >([]);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const startCombobox = useCombobox();
  const endCombobox = useCombobox();

  // Polestar 2 Specs (Approx.)
  const BATTERY_CAPACITY_KWH = 78;
  const publicChargingPercent = 100 - homeChargingPercent;

  const clampPercent = (value: number) => Math.min(100, Math.max(0, value));
  const handleHomePercentChange = (value: number | '') => {
    if (value === '') {
      setHomeChargingPercent(0);
      return;
    }
    setHomeChargingPercent(clampPercent(value));
  };

  const handlePublicPercentChange = (value: number | '') => {
    if (value === '') {
      setHomeChargingPercent(100);
      return;
    }
    setHomeChargingPercent(100 - clampPercent(value));
  };

  // --- Constants ---
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
    NZD: 'NZ$',
    JPY: '¥',
    KRW: '₩',
    CNY: '¥',
    INR: '₹',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    CHF: 'Fr',
    PLN: 'zł',
    CZK: 'Kč',
    HUF: 'Ft',
    TRY: '₺',
    AED: 'dh',
    SAR: 'SR',
    ZAR: 'R',
    ILS: '₪',
    BRL: 'R$',
    MXN: 'Mex$',
    ARS: '$',
    CLP: '$',
    SGD: 'S$',
    MYR: 'RM',
    THB: '฿',
    IDR: 'Rp',
    PHP: '₱',
    VND: '₫',
  };
  const symbol = currencySymbols[currency] || currency;

  // --- Trip Planner Logic ---
  const fetchLocations = async (query: string) => {
    if (query.length < 3) return [];
    try {
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
      const response = await fetch(searchUrl, { headers: { 'User-Agent': 'Polestar Telemetry' } });
      const data = await response.json();
      return data.map((place: any) => ({
        label: place.display_name,
        value: place.display_name,
        lat: place.lat,
        lon: place.lon,
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const updateLocationOptions = async (query: string) => {
    const options = await fetchLocations(query);
    setLocationOptions(options);
  };

  const calculateRoute = useCallback(async () => {
    if (!startCoords || !endCoords) return;
    setLoadingRoute(true);
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=false`
      );
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setTripDistanceKm(route.distance / 1000); // meters to km

        const hours = Math.floor(route.duration / 3600);
        const minutes = Math.floor((route.duration % 3600) / 60);
        setTripDuration(`${hours}h ${minutes}m`);
      }
    } catch (e) {
      console.error('Routing error:', e);
    } finally {
      setLoadingRoute(false);
    }
  }, [startCoords, endCoords]);

  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  // --- Calculations ---

  const toNumber = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return 0;
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const calculateHistoricalCosts = () => {
    if (!statistics) return { homeCost: 0, publicCost: 0, totalCost: 0, avgPer100: 0 };
    const totalConsumption = toNumber(statistics.totalConsumption);
    const totalDistance = toNumber(statistics.totalDistance) || 1;
    const homeConsumption = (totalConsumption * homeChargingPercent) / 100;
    const publicConsumption = totalConsumption - homeConsumption;

    const homeCost = homeConsumption * homeRate;
    const publicCost = publicConsumption * publicRate;
    const totalCost = homeCost + publicCost;
    const avgPer100 = (totalCost / totalDistance) * 100;

    return {
      homeCost: homeCost.toFixed(2),
      publicCost: publicCost.toFixed(2),
      totalCost: totalCost.toFixed(2),
      avgPer100: avgPer100.toFixed(2),
    };
  };

  const calculateTripStats = () => {
    if (!tripDistanceKm) return null;
    const avgEfficiency = statistics
      ? (toNumber(statistics.totalConsumption) / (toNumber(statistics.totalDistance) || 1)) * 100
      : 19; // kWh/100km
    const tripConsumptionKwh = (tripDistanceKm * avgEfficiency) / 100;

    const rate = tripChargingType === 'home' ? homeRate : publicRate;
    const cost = tripConsumptionKwh * rate;

    // Range Calc
    const currentSoc = typeof currentBatteryPercent === 'number' ? currentBatteryPercent : 0;
    const startEnergyKwh = (currentSoc / 100) * BATTERY_CAPACITY_KWH;
    const endEnergyKwh = startEnergyKwh - tripConsumptionKwh;
    const endSoc = (endEnergyKwh / BATTERY_CAPACITY_KWH) * 100;
    const remainingRangeKm = (endEnergyKwh / avgEfficiency) * 100;

    return {
      cost: cost.toFixed(2),
      consumption: tripConsumptionKwh.toFixed(1),
      endSoc: Math.max(0, endSoc).toFixed(0),
      rangeLeft: Math.max(0, remainingRangeKm).toFixed(0),
      efficiency: avgEfficiency.toFixed(1),
    };
  };

  const histCosts = calculateHistoricalCosts();
  const tripStats = calculateTripStats();

  const glassStyle = {
    backgroundColor: colorScheme === 'dark' ? 'rgba(36, 36, 36, 0.7)' : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: `1px solid ${colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text
          fw={900}
          size="xl"
          variant="gradient"
          gradient={{ from: 'polestarOrange', to: 'orange', deg: 45 }}
        >
          Charging Cost Calculator
        </Text>
      }
      size="xl" // Wider modal for 2-column layout
      radius="lg"
      padding="lg"
      overlayProps={{ backgroundOpacity: 0.55, blur: 5 }}
      styles={{ title: { paddingLeft: '8px' } }} // Fix header padding
    >
      <Stack gap="xl">
        {/* --- Global Settings Bar --- */}
        <Paper p="md" radius="md" style={glassStyle}>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <Select
              label="Currency"
              description="Display currency"
              leftSection={<IconCurrencyDollar size={16} />}
              value={currency}
              onChange={(v) => setCurrency(v || 'USD')}
              data={Object.keys(currencySymbols).map((c) => ({
                value: c,
                label: `${c} (${currencySymbols[c]})`,
              }))}
              searchable
            />
            <NumberInput
              label="Home Rate"
              description="Cost per kWh"
              leftSection={<IconHome size={16} />}
              value={homeRate}
              onChange={(v) => setHomeRate(Number(v))}
              min={0}
              step={0.01}
              decimalScale={3}
              suffix={` ${symbol}`}
            />
            <NumberInput
              label="Public Rate"
              description="Cost per kWh"
              leftSection={<IconChargingPile size={16} />}
              value={publicRate}
              onChange={(v) => setPublicRate(Number(v))}
              min={0}
              step={0.01}
              decimalScale={3}
              suffix={` ${symbol}`}
            />
          </SimpleGrid>
        </Paper>

        <Grid gutter="xl">
          {/* --- Left Column: Historical Analysis --- */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap="md" h="100%">
              <Group gap="xs">
                <ThemeIcon variant="light" color="gray" size="sm" radius="xl">
                  <IconClock size={14} />
                </ThemeIcon>
                <Text size="sm" fw={700} tt="uppercase" c="dimmed">
                  Historical Analysis
                </Text>
              </Group>

              <Paper p="md" radius="md" withBorder style={glassStyle}>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="xs" fw={700}>
                      CHARGING MIX
                    </Text>
                    <Text size="xs" fw={700} c="polestarOrange">
                      {homeChargingPercent}% Home
                    </Text>
                  </Group>
                  <Group justify="space-between" px="xs">
                    <Text size="xs" c="dimmed">
                      0%
                    </Text>
                    <Text size="xs" c="dimmed">
                      50%
                    </Text>
                    <Text size="xs" c="dimmed">
                      100%
                    </Text>
                  </Group>
                  <Slider
                    mt={-8}
                    mb="xs"
                    value={homeChargingPercent}
                    onChange={handleHomePercentChange}
                    color="polestarOrange"
                    size="lg"
                    label={null}
                    thumbSize={18}
                    marks={[{ value: 0 }, { value: 50 }, { value: 100 }]}
                  />
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed" fw={600}>
                      Home Charging
                    </Text>
                    <Text size="xs" c="dimmed" fw={600}>
                      Public Charging
                    </Text>
                  </Group>
                  <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
                    <NumberInput
                      label="Home %"
                      value={homeChargingPercent}
                      onChange={handleHomePercentChange}
                      min={0}
                      max={100}
                      suffix="%"
                    />
                    <NumberInput
                      label="Public %"
                      value={publicChargingPercent}
                      onChange={handlePublicPercentChange}
                      min={0}
                      max={100}
                      suffix="%"
                    />
                  </SimpleGrid>
                </Stack>
              </Paper>

              <SimpleGrid cols={2}>
                <Paper p="sm" radius="md" withBorder style={glassStyle}>
                  <Text size="xs" c="dimmed" tt="uppercase">
                    Home Cost
                  </Text>
                  <Text fw={700} size="lg">
                    {symbol}
                    {histCosts.homeCost}
                  </Text>
                </Paper>
                <Paper p="sm" radius="md" withBorder style={glassStyle}>
                  <Text size="xs" c="dimmed" tt="uppercase">
                    Public Cost
                  </Text>
                  <Text fw={700} size="lg">
                    {symbol}
                    {histCosts.publicCost}
                  </Text>
                </Paper>
              </SimpleGrid>

              <Paper
                p="lg"
                radius="md"
                bg={colorScheme === 'dark' ? 'orange.9' : 'orange.0'}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Stack gap={4} align="center">
                  <Text
                    size="xs"
                    fw={700}
                    tt="uppercase"
                    c={colorScheme === 'dark' ? 'orange.1' : 'orange.9'}
                  >
                    Total Historical Cost
                  </Text>
                  <Text
                    size="3rem"
                    fw={800}
                    lh={1}
                    c={colorScheme === 'dark' ? 'white' : 'orange.9'}
                  >
                    {symbol}
                    {histCosts.totalCost}
                  </Text>
                  <Text size="sm" c={colorScheme === 'dark' ? 'orange.1' : 'orange.8'}>
                    {symbol}
                    {histCosts.avgPer100} / 100km
                  </Text>
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>

          {/* --- Right Column: Trip Estimator --- */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="md">
              <Group gap="xs">
                <ThemeIcon variant="light" color="blue" size="sm" radius="xl">
                  <IconMapPin size={14} />
                </ThemeIcon>
                <Text size="sm" fw={700} tt="uppercase" c="dimmed">
                  Trip Planner
                </Text>
              </Group>

              <Paper p="md" radius="md" style={glassStyle} withBorder>
                <Stack gap="sm">
                  <Combobox
                    store={startCombobox}
                    onOptionSubmit={(val) => {
                      setStartLocation(val);
                      const opt = locationOptions.find((o) => o.value === val);
                      if (opt) setStartCoords([parseFloat(opt.lat), parseFloat(opt.lon)]);
                      startCombobox.closeDropdown();
                    }}
                  >
                    <Combobox.Target>
                      <TextInput
                        leftSection={<IconMapPin size={16} />}
                        placeholder="Start Location"
                        value={startLocation}
                        onChange={(e) => {
                          setStartLocation(e.currentTarget.value);
                          updateLocationOptions(e.currentTarget.value);
                          startCombobox.openDropdown();
                        }}
                      />
                    </Combobox.Target>
                    <Combobox.Dropdown>
                      <Combobox.Options>
                        {locationOptions.map((opt) => (
                          <Combobox.Option value={opt.value} key={opt.value}>
                            {opt.label}
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    </Combobox.Dropdown>
                  </Combobox>

                  <Combobox
                    store={endCombobox}
                    onOptionSubmit={(val) => {
                      setEndLocation(val);
                      const opt = locationOptions.find((o) => o.value === val);
                      if (opt) setEndCoords([parseFloat(opt.lat), parseFloat(opt.lon)]);
                      endCombobox.closeDropdown();
                    }}
                  >
                    <Combobox.Target>
                      <TextInput
                        leftSection={<IconMapPin size={16} color="var(--mantine-color-blue-5)" />}
                        placeholder="Destination"
                        value={endLocation}
                        onChange={(e) => {
                          setEndLocation(e.currentTarget.value);
                          updateLocationOptions(e.currentTarget.value);
                          endCombobox.openDropdown();
                        }}
                      />
                    </Combobox.Target>
                    <Combobox.Dropdown>
                      <Combobox.Options>
                        {locationOptions.map((opt) => (
                          <Combobox.Option value={opt.value} key={opt.value}>
                            {opt.label}
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    </Combobox.Dropdown>
                  </Combobox>

                  <Group wrap="nowrap" gap="sm" align="flex-end">
                    <NumberInput
                      maw={140}
                      leftSection={<IconBatteryCharging size={16} />}
                      placeholder="Current Battery %"
                      min={0}
                      max={100}
                      value={currentBatteryPercent}
                      onChange={(value) => {
                        const num = typeof value === 'string' ? Number(value) : value;
                        setCurrentBatteryPercent(Number.isNaN(num) ? '' : num);
                      }}
                      suffix="%"
                    />
                    <Select
                      flex={1}
                      leftSection={<IconBolt size={16} />}
                      data={[
                        { value: 'home', label: `Home Rate (${symbol}${homeRate})` },
                        { value: 'public', label: `Public Rate (${symbol}${publicRate})` },
                      ]}
                      value={tripChargingType}
                      onChange={(v) => setTripChargingType(v || 'home')}
                      allowDeselect={false}
                    />
                  </Group>
                </Stack>
              </Paper>

              {/* --- Trip Results --- */}
              {loadingRoute ? (
                <Paper p="xl" withBorder h={200}>
                  <Center h="100%">
                    <Loader type="dots" />
                  </Center>
                </Paper>
              ) : tripDistanceKm && tripStats ? (
                <Paper p={0} radius="md" withBorder>
                  <Box p="md" bg={colorScheme === 'dark' ? 'blue.9' : 'blue.0'}>
                    <Group justify="space-between" align="flex-start">
                      <div>
                        <Text
                          size="xs"
                          fw={700}
                          tt="uppercase"
                          c={colorScheme === 'dark' ? 'blue.1' : 'blue.8'}
                        >
                          Est. Trip Cost
                        </Text>
                        <Text
                          size="3rem"
                          fw={800}
                          lh={1}
                          c={colorScheme === 'dark' ? 'white' : 'blue.9'}
                        >
                          {symbol}
                          {tripStats.cost}
                        </Text>
                      </div>
                      <Stack gap={4} align="flex-end">
                        <Badge
                          size="lg"
                          variant="light"
                          color="blue"
                          leftSection={<IconArrowRight size={14} />}
                        >
                          {tripDistanceKm.toFixed(1)} km
                        </Badge>
                        <Badge
                          size="lg"
                          variant="light"
                          color="gray"
                          leftSection={<IconClock size={14} />}
                        >
                          {tripDuration}
                        </Badge>
                      </Stack>
                    </Group>
                  </Box>
                  <SimpleGrid p="md" cols={2} spacing="xs">
                    <Stack gap={2}>
                      <Text size="xs" c="dimmed">
                        Consumption
                      </Text>
                      <Text fw={600} size="sm">
                        {tripStats.consumption} kWh
                      </Text>
                    </Stack>
                    <Stack gap={2}>
                      <Text size="xs" c="dimmed">
                        Est. Arrival SOC
                      </Text>
                      <Text
                        fw={600}
                        size="sm"
                        c={Number(tripStats.endSoc) < 10 ? 'red' : 'inherit'}
                      >
                        {tripStats.endSoc}%
                      </Text>
                    </Stack>
                  </SimpleGrid>
                  <Divider />
                  <Group
                    p="md"
                    gap="xs"
                    justify="center"
                    bg={colorScheme === 'dark' ? 'rgba(0,0,0,0.1)' : 'gray.0'}
                  >
                    <IconBatteryCharging
                      size={18}
                      color={
                        Number(tripStats.endSoc) < 10
                          ? 'var(--mantine-color-red-5)'
                          : 'var(--mantine-color-green-5)'
                      }
                    />
                    <Text size="sm">
                      Only <b>{tripStats.rangeLeft} km</b> range will be left upon arrival.
                    </Text>
                  </Group>
                </Paper>
              ) : (
                <Paper
                  p="xl"
                  withBorder
                  h={200}
                  display="flex"
                  style={{ alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text size="sm" c="dimmed">
                    Enter trip details to see estimate and range.
                  </Text>
                </Paper>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
      <Group justify="flex-end" mt="xl">
        <Button variant="subtle" color="gray" onClick={onClose}>
          Close
        </Button>
      </Group>
    </Modal>
  );
}

export default CostCalculatorModal;
