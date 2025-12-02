import { useMemo, useState } from "react";
import {
  Button,
  Stack,
  Group,
  ActionIcon,
  Tooltip,
  Text,
  Paper,
  Box,
  NavLink,
  Title,
  Divider,
  rem,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconChartBar,
  IconMap,
  IconList,
  IconDownload,
  IconHelp,
  IconBook,
  IconCurrencyDollar,
  IconSettings,
  IconDeviceAnalytics,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import StatsCards from "./stats/StatsCards";
import ChartsView from "./charts/ChartsView";
import MapView from "./map/MapView";
import TableView from "./table/TableView";
import AnalyticsView from "./analytics/AnalyticsView";
import DataGuide from "./DataGuide";
import Filters from "./filters/Filters";
import { calculateStatistics } from "../utils/dataParser";
import { TableExporter } from "../services/table/TableDataProcessor";
import HelpModal from "./HelpModal";
import CostCalculatorModal from "./CostCalculatorModal";

import type { Trip } from '../types';

// Columns to be used for CSV export and potentially other components.
const COLUMNS = [
  { key: "startDate", label: "Start Date" },
  { key: "endDate", label: "End Date" },
  { key: "startAddress", label: "Start Address" },
  { key: "endAddress", label: "End Address" },
  { key: "distanceKm", label: "Distance (km)" },
  { key: "consumptionKwh", label: "Consumption (kWh)" },
  { key: "efficiency", label: "Efficiency (kWh/100km)" },
  { key: "category", label: "Category" },
  { key: "socSource", label: "SOC Start" },
  { key: "socDestination", label: "SOC End" },
  { key: "socDrop", label: "SOC Drop" },
  { key: "startOdometer", label: "Start Odometer" },
  { key: "endOdometer", label: "End Odometer" },
];

// Initialize the stateless TableExporter once outside the component
const tableExporter = new TableExporter();

interface DashboardProps {
  data: Trip[];
  onReset: () => void;
}

function Dashboard({ data, onReset }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [filteredData, setFilteredData] = useState(data);
  const [helpOpened, setHelpOpened] = useState(false);
  const [costModalOpened, setCostModalOpened] = useState(false);

  const statistics = useMemo(
    () => calculateStatistics(filteredData),
    [filteredData]
  );

  const handleFilterChange = (filtered: Trip[]) => {
    setFilteredData(filtered);
  };

  const exportToCSV = () => {
    const csvContent = tableExporter.exportToCSV(filteredData, COLUMNS);
    const filename = `polestar-journey-export-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    tableExporter.downloadFile(csvContent, filename, "text/csv;charset=utf-8;");

    notifications.show({
      title: "Export successful",
      message: `Exported ${filteredData.length} trips to CSV`,
      color: "green",
    });
  };

  const navItems = [
    { value: "overview", label: "Dashboard", icon: IconChartBar },
    { value: "analytics", label: "Analytics", icon: IconDeviceAnalytics },
    { value: "map", label: "Map View", icon: IconMap },
    { value: "table", label: "Data Table", icon: IconList },
    { value: "guide", label: "User Guide", icon: IconBook },
  ];

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
      {/* Left Sidebar */}
      <Paper
        p="md"
        radius="md"
        withBorder
        style={{
          width: 280,
          minWidth: 280,
          position: "sticky",
          top: 80, // Adjust based on header height
          height: "calc(100vh - 100px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack gap="md" style={{ flex: 1 }}>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            variant="light"
            color="gray"
            onClick={onReset}
            fullWidth
          >
            Upload New File
          </Button>

          <Divider />

          <Stack gap={4}>
            <Text size="xs" fw={500} c="dimmed" mb={4}>
              ANALYTICS
            </Text>
            {navItems.map((item) => (
              <NavLink
                key={item.value}
                active={activeTab === item.value}
                label={item.label}
                leftSection={<item.icon size={18} stroke={1.5} />}
                onClick={() => setActiveTab(item.value)}
                variant="light"
                color="orange"
                style={{ borderRadius: "var(--mantine-radius-sm)" }}
              />
            ))}
          </Stack>

          <Divider />

          <Stack gap={4}>
            <Text size="xs" fw={500} c="dimmed" mb={4}>
              TOOLS
            </Text>
            <NavLink
              label="Cost Calculator"
              leftSection={<IconCurrencyDollar size={18} stroke={1.5} />}
              onClick={() => setCostModalOpened(true)}
              variant="subtle"
              style={{ borderRadius: "var(--mantine-radius-sm)" }}
            />
            <NavLink
              label="Export CSV"
              leftSection={<IconDownload size={18} stroke={1.5} />}
              onClick={exportToCSV}
              variant="subtle"
              style={{ borderRadius: "var(--mantine-radius-sm)" }}
            />
          </Stack>

          <div style={{ marginTop: "auto" }}>
            <Filters data={data} onFilterChange={handleFilterChange} />
          </div>
        </Stack>
      </Paper>

      {/* Main Content */}
      <Stack gap="lg" style={{ flex: 1, minWidth: 0 }}>
        <StatsCards statistics={statistics} hideCostButton />

        <Box style={{ position: "relative" }}>
          {activeTab === "overview" && <ChartsView data={filteredData} />}
          {activeTab === "analytics" && <AnalyticsView data={filteredData} />}
          {activeTab === "map" && <MapView data={filteredData} />}
          {activeTab === "table" && <TableView data={filteredData} />}
          {activeTab === "guide" && <DataGuide />}
        </Box>
      </Stack>

      <HelpModal opened={helpOpened} onClose={() => setHelpOpened(false)} />
      <CostCalculatorModal
        opened={costModalOpened}
        onClose={() => setCostModalOpened(false)}
        statistics={statistics}
      />
    </div>
  );
}

export default Dashboard;
