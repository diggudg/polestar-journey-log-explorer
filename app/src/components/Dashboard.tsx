import { Stack } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import type { Trip } from '../types';
import { calculateStatistics } from '../utils/dataParser';
import CostCalculatorModal from './CostCalculatorModal';
import ChartsView from './charts/ChartsView';
import Filters from './filters/Filters';
import StatsCards from './stats/StatsCards';

interface DashboardProps {
  data: Trip[];
  costCalculatorSignal?: number;
}

function Dashboard({ data, costCalculatorSignal = 0 }: DashboardProps) {
  const [filteredData, setFilteredData] = useState(data);
  const [costModalOpened, setCostModalOpened] = useState(false);

  const statistics = useMemo(() => calculateStatistics(filteredData), [filteredData]);

  useEffect(() => {
    if (costCalculatorSignal > 0) {
      setCostModalOpened(true);
    }
  }, [costCalculatorSignal]);

  const handleFilterChange = (filtered: Trip[]) => {
    setFilteredData(filtered);
  };

  return (
    <Stack gap="lg">
      <Filters data={data} onFilterChange={handleFilterChange} />

      <StatsCards statistics={statistics} />

      <ChartsView data={filteredData} />

      <CostCalculatorModal
        opened={costModalOpened}
        onClose={() => setCostModalOpened(false)}
        statistics={statistics}
      />
    </Stack>
  );
}

export default Dashboard;
