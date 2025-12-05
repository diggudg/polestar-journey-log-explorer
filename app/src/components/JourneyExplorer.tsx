// @ts-nocheck

import { Stack } from '@mantine/core';
import { useEffect, useState } from 'react';
import type { Trip } from '../types';
import FilterBar from './filters/FilterBar';
import MapView from './map/MapView';
import TableView from './table/TableView';

interface JourneyExplorerProps {
  data: Trip[];
}

export default function JourneyExplorer({ data }: JourneyExplorerProps) {
  const [filteredData, setFilteredData] = useState<Trip[]>(data);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  // Sync state with props when data changes
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const handleFilterChange = (filtered: Trip[]) => {
    setFilteredData(filtered);
    // If the currently selected trip is filtered out, deselect it
    if (selectedTripId) {
      const exists = filtered.find(
        (t) => `${t.startDate}-${t.startOdometer}-${t.endOdometer}` === selectedTripId
      );
      if (!exists) {
        setSelectedTripId(null);
      }
    }
  };

  const handleTripSelect = (tripId: string | null) => {
    setSelectedTripId(tripId);
  };

  return (
    <Stack gap="md">
      <FilterBar data={data} onFilterChange={handleFilterChange} />

      <MapView
        data={filteredData}
        selectedTripId={selectedTripId}
        onTripSelect={handleTripSelect}
      />

      <TableView
        data={filteredData}
        selectedTripId={selectedTripId}
        onTripSelect={handleTripSelect}
      />
    </Stack>
  );
}
