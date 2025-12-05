// @ts-nocheck

import {
  Box,
  Button,
  Group,
  MultiSelect,
  NumberInput,
  Paper,
  Popover,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconSettings, IconTag, IconX } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import {
  FilterMetadataService,
  FilterService,
  FilterStateManager,
} from '../../services/filters/FilterService';
import type { Trip } from '../../types';
import { generateTripId, getAllTags, getTripAnnotation } from '../../utils/tripAnnotations';

interface FilterBarProps {
  data: Trip[];
  onFilterChange: (filtered: Trip[]) => void;
}

export default function FilterBar({ data, onFilterChange }: FilterBarProps) {
  // Initialize services
  const filterService = useMemo(() => new FilterService(), []);
  const filterStateManager = useMemo(() => new FilterStateManager(), []);
  const metadataService = useMemo(() => new FilterMetadataService(), []);

  const [filters, setFiltersState] = useState(filterStateManager.getFilters());

  // Calculate metadata
  const metadata = useMemo(() => metadataService.getAllMetadata(data), [data, metadataService]);

  const { categories, ranges: stats } = metadata;

  const categoryOptions = useMemo(
    () => categories.map((cat) => ({ value: cat, label: cat })),
    [categories]
  );

  const handleFilterChange = (field: string, value: any) => {
    filterStateManager.updateFilter(field, value);
    const newFilters = filterStateManager.getFilters();
    setFiltersState(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (currentFilters: any) => {
    let filtered = filterService.applyFilters(data, currentFilters);

    // Apply tags filter
    if (currentFilters.tags && currentFilters.tags.length > 0) {
      filtered = filtered.filter((trip) => {
        const tripId = generateTripId(trip);
        const annotation = getTripAnnotation(tripId);
        const tripTags = annotation.tags || [];
        return currentFilters.tags.some((tag: string) => tripTags.includes(tag));
      });
    }

    onFilterChange(filtered);
  };

  const handleReset = () => {
    filterStateManager.clearFilters();
    const resetFilters = filterStateManager.getFilters();
    setFiltersState(resetFilters);
    onFilterChange(data);
  };

  const activeFilterCount = filterStateManager.countActiveFilters();
  const hasActiveFilters = filterStateManager.hasActiveFilters();

  return (
    <Paper p="sm" withBorder>
      <Group justify="space-between">
        <Group gap="sm">
          <Popover width={300} position="bottom-start" withArrow shadow="md">
            <Popover.Target>
              <Button variant="light" leftSection={<IconCalendar size={16} />} size="sm">
                Date Range {filters.dateFrom || filters.dateTo ? '(Active)' : ''}
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack gap="xs">
                <DatePickerInput
                  label="From Date"
                  placeholder="Select start date"
                  value={filters.dateFrom}
                  onChange={(value) => handleFilterChange('dateFrom', value)}
                  clearable
                  maxDate={filters.dateTo || undefined}
                />
                <DatePickerInput
                  label="To Date"
                  placeholder="Select end date"
                  value={filters.dateTo}
                  onChange={(value) => handleFilterChange('dateTo', value)}
                  clearable
                  minDate={filters.dateFrom || undefined}
                />
              </Stack>
            </Popover.Dropdown>
          </Popover>

          <Popover width={300} position="bottom-start" withArrow shadow="md">
            <Popover.Target>
              <Button variant="light" leftSection={<IconSettings size={16} />} size="sm">
                Metrics{' '}
                {filters.distanceMin ||
                filters.distanceMax ||
                filters.efficiencyMin ||
                filters.efficiencyMax
                  ? '(Active)'
                  : ''}
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack gap="md">
                <Box>
                  <Text size="sm" fw={500} c="dimmed" mb="xs">
                    Distance (km)
                  </Text>
                  <Group grow>
                    <NumberInput
                      placeholder={`Min: ${stats.minDistance || 0}`}
                      value={filters.distanceMin}
                      onChange={(value) => handleFilterChange('distanceMin', value)}
                      min={stats.minDistance}
                      max={stats.maxDistance}
                      allowNegative={false}
                    />
                    <NumberInput
                      placeholder={`Max: ${stats.maxDistance || 0}`}
                      value={filters.distanceMax}
                      onChange={(value) => handleFilterChange('distanceMax', value)}
                      min={stats.minDistance}
                      max={stats.maxDistance}
                      allowNegative={false}
                    />
                  </Group>
                </Box>
                <Box>
                  <Text size="sm" fw={500} c="dimmed" mb="xs">
                    Efficiency (kWh/100km)
                  </Text>
                  <Group grow>
                    <NumberInput
                      placeholder={`Min: ${stats.minEfficiency || 0}`}
                      value={filters.efficiencyMin}
                      onChange={(value) => handleFilterChange('efficiencyMin', value)}
                      min={0}
                      max={100}
                      allowNegative={false}
                      decimalScale={2}
                    />
                    <NumberInput
                      placeholder={`Max: ${stats.maxEfficiency || 0}`}
                      value={filters.efficiencyMax}
                      onChange={(value) => handleFilterChange('efficiencyMax', value)}
                      min={0}
                      max={100}
                      allowNegative={false}
                      decimalScale={2}
                    />
                  </Group>
                </Box>
              </Stack>
            </Popover.Dropdown>
          </Popover>

          {categories.length > 0 && (
            <Select
              placeholder="Category"
              data={categoryOptions}
              value={filters.category}
              onChange={(value) => handleFilterChange('category', value)}
              clearable
              style={{ width: 150 }}
              size="sm"
            />
          )}

          <MultiSelect
            placeholder="Tags"
            leftSection={<IconTag size={16} />}
            data={getAllTags()}
            value={filters.tags}
            onChange={(value) => handleFilterChange('tags', value)}
            searchable
            clearable
            style={{ width: 200 }}
            size="sm"
          />
        </Group>

        {hasActiveFilters && (
          <Button
            variant="subtle"
            color="red"
            leftSection={<IconX size={16} />}
            onClick={handleReset}
            size="sm"
          >
            Clear Filters ({activeFilterCount})
          </Button>
        )}
      </Group>
    </Paper>
  );
}
