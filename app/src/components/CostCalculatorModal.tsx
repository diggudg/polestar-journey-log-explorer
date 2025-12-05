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
} from '@tabler/icons-react';
import { useState } from 'react';
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

  const histCosts = calculateHistoricalCosts();
  // const tripStats = calculateTripStats(); // Removed

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
      size="md"
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
          {/* --- Global Settings Bar (moved from top for compact layout) or kept separate? --- */}
          {/* Actually, let's keep it simple. We only have one column now. */}

          <Grid.Col span={12}>
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
