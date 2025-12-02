// @ts-nocheck
import { Modal, Stack, NumberInput, Select, Text, Group, Button, Divider, Paper, SimpleGrid, Loader, TextInput, Combobox, useCombobox, ScrollArea, Slider, RingProgress, ThemeIcon, Center, useMantineColorScheme } from '@mantine/core';
import { useState, useEffect } from 'react';
import { IconCurrencyDollar, IconBolt, IconHome, IconMapPin, IconChargingPile, IconCar } from '@tabler/icons-react';
import type { Statistics } from '../types';

interface CostCalculatorModalProps {
  opened: boolean;
  onClose: () => void;
  statistics: Statistics | null;
}

function CostCalculatorModal({ opened, onClose, statistics }: CostCalculatorModalProps) {
  const combobox = useCombobox();
  const { colorScheme } = useMantineColorScheme();
  const [electricityRate, setElectricityRate] = useState(0.13);
  const [currency, setCurrency] = useState('USD');
  const [homeChargingPercent, setHomeChargingPercent] = useState(80);
  const [citySearch, setCitySearch] = useState('');
  const [cityOptions, setCityOptions] = useState([]);
  const [cityData, setCityData] = useState([]); // Store full city data with country info
  const [loadingCities, setLoadingCities] = useState(false);

  // Global electricity rates by country (USD per kWh, approximate 2025 rates)
  // Global electricity rates by country (USD/EUR/Local per kWh, approximate 2025 rates)
  const electricityRatesByCountry = {
    // North America
    'United States': { rate: 0.16, currency: 'USD' },
    'Canada': { rate: 0.11, currency: 'CAD' },
    'Mexico': { rate: 0.09, currency: 'MXN' },

    // Europe (EU/EEA/UK)
    'United Kingdom': { rate: 0.34, currency: 'GBP' },
    'Germany': { rate: 0.40, currency: 'EUR' },
    'France': { rate: 0.22, currency: 'EUR' },
    'Italy': { rate: 0.30, currency: 'EUR' },
    'Spain': { rate: 0.24, currency: 'EUR' },
    'Netherlands': { rate: 0.35, currency: 'EUR' },
    'Belgium': { rate: 0.32, currency: 'EUR' },
    'Sweden': { rate: 1.50, currency: 'SEK' }, // ~0.13 EUR
    'Norway': { rate: 1.20, currency: 'NOK' }, // ~0.10 EUR
    'Denmark': { rate: 2.80, currency: 'DKK' }, // ~0.38 EUR
    'Finland': { rate: 0.20, currency: 'EUR' },
    'Poland': { rate: 0.85, currency: 'PLN' }, // ~0.20 EUR
    'Switzerland': { rate: 0.25, currency: 'CHF' },
    'Austria': { rate: 0.28, currency: 'EUR' },
    'Portugal': { rate: 0.22, currency: 'EUR' },
    'Ireland': { rate: 0.35, currency: 'EUR' },
    'Czech Republic': { rate: 6.50, currency: 'CZK' },
    'Hungary': { rate: 70.0, currency: 'HUF' },

    // APAC
    'Japan': { rate: 31.0, currency: 'JPY' },
    'South Korea': { rate: 140.0, currency: 'KRW' },
    'China': { rate: 0.60, currency: 'CNY' },
    'India': { rate: 8.0, currency: 'INR' },
    'Australia': { rate: 0.30, currency: 'AUD' },
    'New Zealand': { rate: 0.28, currency: 'NZD' },
    'Singapore': { rate: 0.30, currency: 'SGD' },
    'Malaysia': { rate: 0.50, currency: 'MYR' },
    'Thailand': { rate: 4.50, currency: 'THB' },
    'Indonesia': { rate: 1500.0, currency: 'IDR' },
    'Philippines': { rate: 11.0, currency: 'PHP' },
    'Vietnam': { rate: 2000.0, currency: 'VND' },

    // EMEA / Other
    'Turkey': { rate: 2.50, currency: 'TRY' },
    'United Arab Emirates': { rate: 0.30, currency: 'AED' },
    'Saudi Arabia': { rate: 0.18, currency: 'SAR' },
    'South Africa': { rate: 2.50, currency: 'ZAR' },
    'Israel': { rate: 0.60, currency: 'ILS' },
    'Brazil': { rate: 0.80, currency: 'BRL' },
    'Argentina': { rate: 50.0, currency: 'ARS' },
    'Chile': { rate: 120.0, currency: 'CLP' },
  };

  // Debounced city search
  useEffect(() => {
    if (citySearch.length < 3) {
      setCityOptions([]);
      setCityData([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingCities(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `format=json&q=${encodeURIComponent(citySearch)}&` +
          `addressdetails=1&limit=5`,
          {
            headers: {
              'User-Agent': 'Polestar Journey Log Explorer'
            }
          }
        );
        const data = await response.json();

        // Store city data with country info
        const cityDataWithCountry = data.map(place => ({
          displayName: place.display_name,
          country: place.address?.country,
        }));
        setCityData(cityDataWithCountry);

        // Options for autocomplete (just display names)
        const options = data.map(place => place.display_name);
        setCityOptions(options);
      } catch (error) {
        console.error('Error fetching cities:', error);
        setCityOptions([]);
        setCityData([]);
      } finally {
        setLoadingCities(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [citySearch]);

  const handleCitySelect = (value) => {
    setCitySearch(value);
    const selectedCity = cityData.find(city => city.displayName === value);
    if (selectedCity?.country) {
      const countryRate = electricityRatesByCountry[selectedCity.country];
      if (countryRate) {
        setElectricityRate(countryRate.rate);
        setCurrency(countryRate.currency);
      }
    }
  };

  const currencySymbols = {
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
    SGD: 'S$',
    MYR: 'RM',
    THB: '฿',
    IDR: 'Rp',
    PHP: '₱',
    VND: '₫',
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
  };

  const calculateCosts = () => {
    if (!statistics) return { homeChargingCost: 0, publicChargingCost: 0, totalCost: 0, avgPerTrip: 0, avgPerKm: 0 };

    const totalConsumption = statistics.totalConsumption;
    const homeConsumption = (totalConsumption * homeChargingPercent) / 100;
    const publicConsumption = totalConsumption - homeConsumption;

    // Home charging cost
    const homeChargingCost = homeConsumption * electricityRate;

    // Public charging typically 2.5x home rate
    const publicRate = electricityRate * 2.5;
    const publicChargingCost = publicConsumption * publicRate;

    const totalCost = homeChargingCost + publicChargingCost;
    const avgPerTrip = totalCost / statistics.totalTrips;
    const avgPerKm = totalCost / statistics.totalDistance;

    return {
      homeChargingCost: homeChargingCost.toFixed(2),
      publicChargingCost: publicChargingCost.toFixed(2),
      totalCost: totalCost.toFixed(2),
      avgPerTrip: avgPerTrip.toFixed(2),
      avgPerKm: avgPerKm.toFixed(4),
    };
  };

  const costs = calculateCosts();
  const symbol = currencySymbols[currency] || currency;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700} size="lg">Charging Cost Calculator</Text>}
      size="lg"
      radius="md"
      padding="xl"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <Stack gap="lg">
        <Text size="sm" c="dimmed">
          Estimate your charging costs based on your location and charging habits.
        </Text>

        <Paper p="md" radius="md" bg={colorScheme === 'dark' ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)'}>
          <Stack gap="md">
            <Combobox
              store={combobox}
              onOptionSubmit={(value) => {
                handleCitySelect(value);
                combobox.closeDropdown();
              }}
            >
              <Combobox.Target>
                <TextInput
                  label="Location"
                  description="Auto-fill rates by city"
                  placeholder="Search city..."
                  leftSection={<IconMapPin size={16} />}
                  rightSection={loadingCities ? <Loader size={16} /> : null}
                  value={citySearch}
                  onChange={(event) => {
                    setCitySearch(event.currentTarget.value);
                    combobox.openDropdown();
                  }}
                  onClick={() => combobox.openDropdown()}
                  onFocus={() => combobox.openDropdown()}
                  onBlur={() => combobox.closeDropdown()}
                />
              </Combobox.Target>

              <Combobox.Dropdown>
                <Combobox.Options>
                  <ScrollArea.Autosize mah={200} type="scroll">
                    {cityOptions.length > 0 ? (
                      cityOptions.map((city) => (
                        <Combobox.Option value={city} key={city}>
                          {city}
                        </Combobox.Option>
                      ))
                    ) : (
                      <Combobox.Empty>
                        {citySearch.length >= 3 && !loadingCities ? 'No cities found' : 'Type to search...'}
                      </Combobox.Empty>
                    )}
                  </ScrollArea.Autosize>
                </Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>

            <Group grow>
              <NumberInput
                label="Electricity Rate"
                description="Cost per kWh"
                leftSection={<IconBolt size={16} />}
                value={electricityRate}
                onChange={setElectricityRate}
                min={0}
                step={0.01}
                decimalScale={3}
                suffix={` ${symbol}`}
              />
              <Select
                label="Currency"
                description="Select currency"
                leftSection={<IconCurrencyDollar size={16} />}
                value={currency}
                onChange={setCurrency}
                data={[
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'GBP', label: 'GBP (£)' },
                  { value: 'CAD', label: 'CAD (C$)' },
                  { value: 'AUD', label: 'AUD (A$)' },
                  { value: 'NZD', label: 'NZD (NZ$)' },
                  { value: 'JPY', label: 'JPY (¥)' },
                  { value: 'KRW', label: 'KRW (₩)' },
                  { value: 'CNY', label: 'CNY (¥)' },
                  { value: 'INR', label: 'INR (₹)' },
                  { value: 'SEK', label: 'SEK (kr)' },
                  { value: 'NOK', label: 'NOK (kr)' },
                  { value: 'DKK', label: 'DKK (kr)' },
                  { value: 'CHF', label: 'CHF (Fr)' },
                  { value: 'PLN', label: 'PLN (zł)' },
                  { value: 'SGD', label: 'SGD (S$)' },
                  { value: 'MYR', label: 'MYR (RM)' },
                  { value: 'THB', label: 'THB (฿)' },
                  { value: 'IDR', label: 'IDR (Rp)' },
                  { value: 'PHP', label: 'PHP (₱)' },
                  { value: 'VND', label: 'VND (₫)' },
                  { value: 'TRY', label: 'TRY (₺)' },
                  { value: 'AED', label: 'AED (dh)' },
                  { value: 'SAR', label: 'SAR (SR)' },
                  { value: 'ZAR', label: 'ZAR (R)' },
                  { value: 'ILS', label: 'ILS (₪)' },
                  { value: 'BRL', label: 'BRL (R$)' },
                  { value: 'MXN', label: 'MXN (Mex$)' },
                  { value: 'CZK', label: 'CZK (Kč)' },
                  { value: 'HUF', label: 'HUF (Ft)' },
                ]}
              />
            </Group>

            <Stack gap="xs">
              <Group justify="space-between">
                <Group gap="xs">
                  <IconHome size={16} />
                  <Text size="sm" fw={500}>Home Charging</Text>
                </Group>
                <Text size="sm" fw={700}>{homeChargingPercent}%</Text>
              </Group>
              <Slider
                value={homeChargingPercent}
                onChange={setHomeChargingPercent}
                color="blue"
                size="lg"
                thumbSize={20}
                label={null}
              />
              <Group justify="space-between">
                <Text size="xs" c="dimmed">Public Charging: {100 - homeChargingPercent}%</Text>
              </Group>
            </Stack>
          </Stack>
        </Paper>

        <SimpleGrid cols={2} spacing="md">
          <Paper p="md" radius="md" withBorder>
            <Stack align="center" gap="xs">
              <ThemeIcon size={40} radius="xl" variant="light" color="blue">
                <IconHome size={20} />
              </ThemeIcon>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Home Cost</Text>
              <Text size="xl" fw={700}>{symbol}{costs.homeChargingCost}</Text>
            </Stack>
          </Paper>
          <Paper p="md" radius="md" withBorder>
            <Stack align="center" gap="xs">
              <ThemeIcon size={40} radius="xl" variant="light" color="orange">
                <IconChargingPile size={20} />
              </ThemeIcon>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Public Cost</Text>
              <Text size="xl" fw={700}>{symbol}{costs.publicChargingCost}</Text>
            </Stack>
          </Paper>
        </SimpleGrid>

        <Paper p="lg" radius="md" bg={colorScheme === 'dark' ? 'var(--mantine-color-blue-9)' : 'var(--mantine-color-blue-light)'} withBorder style={{ borderColor: 'var(--mantine-color-blue-3)' }}>
          <Group justify="space-between" align="center">
            <Group gap="md">
              <ThemeIcon size={48} radius="md" variant="filled" color="blue">
                <IconCurrencyDollar size={28} />
              </ThemeIcon>
              <div>
                <Text size="sm" c={colorScheme === 'dark' ? 'blue.1' : 'blue.9'} fw={600} tt="uppercase">Total Estimated Cost</Text>
                <Text size="xs" c={colorScheme === 'dark' ? 'blue.2' : 'blue.7'}>Based on {statistics?.totalDistance} km</Text>
              </div>
            </Group>
            <Text size="3rem" fw={800} c={colorScheme === 'dark' ? 'blue.0' : 'blue.9'} lh={1}>
              {symbol}{costs.totalCost}
            </Text>
          </Group>
        </Paper>

        <SimpleGrid cols={2}>
          <Group gap="xs" justify="center">
            <IconCar size={16} style={{ opacity: 0.5 }} />
            <Text size="sm" c="dimmed">Avg per Trip: <Text span fw={700} c={colorScheme === 'dark' ? 'white' : 'dark'}>{symbol}{costs.avgPerTrip}</Text></Text>
          </Group>
          <Group gap="xs" justify="center">
            <IconBolt size={16} style={{ opacity: 0.5 }} />
            <Text size="sm" c="dimmed">Avg per km: <Text span fw={700} c={colorScheme === 'dark' ? 'white' : 'dark'}>{symbol}{costs.avgPerKm}</Text></Text>
          </Group>
        </SimpleGrid>

        <Button onClick={onClose} size="md" fullWidth>
          Done
        </Button>
      </Stack>
    </Modal>
  );
}

export default CostCalculatorModal;
