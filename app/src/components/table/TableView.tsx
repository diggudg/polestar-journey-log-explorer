import {
  ActionIcon,
  Badge,
  Center,
  Group,
  Pagination,
  Paper,
  rem,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import {
  IconChevronDown,
  IconChevronUp,
  IconNote,
  IconSearch,
  IconSelector,
  IconTag,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { TableDataProcessor, TableRowFormatter } from '../../services/table/TableDataProcessor';
import type { Trip } from '../../types';
import { generateTripId, getTripAnnotation } from '../../utils/tripAnnotations';
import TripNotesModal from '../TripNotesModal';

interface TableViewProps {
  data: Trip[];
  selectedTripId?: string | null;
  onTripSelect?: (tripId: string | null) => void;
}

function TableView({ data, selectedTripId, onTripSelect }: TableViewProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedTripForModal, setSelectedTripForModal] = useState(null);
  const [selectedTripIdForModal, setSelectedTripIdForModal] = useState(null);

  // Pagination state
  const [activePage, setActivePage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState('10');

  // Initialize services (Dependency Injection)
  const dataProcessor = useMemo(() => new TableDataProcessor(), []);
  const rowFormatter = useMemo(() => new TableRowFormatter(), []);

  // Process data using services
  const filteredAndSortedData = useMemo(() => {
    let processed = data;

    // Apply search filter using service
    processed = dataProcessor.filterData(processed, search, [
      'startAddress',
      'endAddress',
      'startDate',
    ]);

    // Apply sorting using service
    processed = dataProcessor.sortData(processed, sortBy, sortOrder);

    return processed;
  }, [data, search, sortBy, sortOrder, dataProcessor]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    const pageSize = parseInt(itemsPerPage, 10);
    const start = (activePage - 1) * pageSize;
    const end = start + pageSize;
    return filteredAndSortedData.slice(start, end);
  }, [filteredAndSortedData, activePage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / parseInt(itemsPerPage, 10));

  const handleOpenModal = (trip, e) => {
    e.stopPropagation(); // Prevent row selection when clicking edit button
    setSelectedTripForModal(trip);
    setSelectedTripIdForModal(generateTripId(trip));
    setModalOpened(true);
  };

  const handleSaveAnnotation = () => {
    // Refresh handled by modal close
  };

  interface ThProps {
    children: React.ReactNode;
    reversed: boolean;
    sorted: boolean;
    onSort(): void;
  }

  function Th({ children, reversed, sorted, onSort }: ThProps) {
    const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
    return (
      <Table.Th>
        <UnstyledButton onClick={onSort} style={{ width: '100%' }}>
          <Group justify="space-between">
            <Text fw={700} size="sm">
              {children}
            </Text>
            <Center>
              <Icon style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
            </Center>
          </Group>
        </UnstyledButton>
      </Table.Th>
    );
  }

  const setSorting = (field: string) => {
    const reversed = field === sortBy ? sortOrder === 'asc' : false;
    setSortBy(field);
    setSortOrder(reversed ? 'desc' : 'asc');
  };

  const rows = paginatedData.map((trip) => {
    const tripId = generateTripId(trip);
    const annotation = getTripAnnotation(tripId);
    const hasNotes = annotation.notes?.length > 0;
    const hasTags = annotation.tags?.length > 0;

    // Use formatter service for consistent formatting
    const efficiency = rowFormatter.formatEfficiency(trip.efficiency);
    const socRange = rowFormatter.formatSOCRange(trip.socSource, trip.socDestination);

    const isSelected = selectedTripId === tripId;

    return (
      <Table.Tr
        key={trip.id}
        onClick={() => onTripSelect?.(isSelected ? null : tripId)}
        style={{
          cursor: 'pointer',
          backgroundColor: isSelected ? 'rgba(25, 113, 194, 0.1)' : undefined,
        }}
      >
        <Table.Td>{trip.startDate}</Table.Td>
        <Table.Td>{rowFormatter.truncateAddress(trip.startAddress, 40)}</Table.Td>
        <Table.Td>{rowFormatter.truncateAddress(trip.endAddress, 40)}</Table.Td>
        <Table.Td>{trip.distanceKm}</Table.Td>
        <Table.Td>{trip.consumptionKwh}</Table.Td>
        <Table.Td>
          <Badge color={efficiency.color} size="sm" variant="outline">
            {efficiency.value}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Badge color={socRange.color} size="sm" variant="outline">
            {socRange.label}
          </Badge>
        </Table.Td>
        <Table.Td>{trip.socDrop}%</Table.Td>
        <Table.Td>
          <Group gap="xs">
            {hasTags && (
              <Tooltip label={annotation.tags.join(', ')} withArrow>
                <Badge size="sm" variant="dot" color="orange">
                  <IconTag size={12} /> {annotation.tags.length}
                </Badge>
              </Tooltip>
            )}
            {hasNotes && (
              <Tooltip label={annotation.notes.substring(0, 100)} withArrow>
                <Badge size="sm" variant="dot" color="polestarOrange">
                  <IconNote size={12} />
                </Badge>
              </Tooltip>
            )}
          </Group>
        </Table.Td>
        <Table.Td>
          <Tooltip label="Add notes/tags" withArrow>
            <ActionIcon
              variant={hasNotes || hasTags ? 'filled' : 'subtle'}
              color={hasNotes || hasTags ? 'orange' : 'polestarGrey'}
              onClick={(e) => handleOpenModal(trip, e)}
              size="sm"
            >
              <IconNote size={16} />
            </ActionIcon>
          </Tooltip>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Paper p={{ base: 'xs', sm: 'md' }} withBorder>
      <Stack gap="md" mb="md">
        <TextInput
          placeholder="Search by address or date..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            setActivePage(1); // Reset to first page on search
          }}
        />
        <Group grow>
          <Select
            placeholder="Sort by"
            value={sortBy}
            onChange={setSortBy}
            data={[
              { value: 'startDate', label: 'Date' },
              { value: 'distanceKm', label: 'Distance' },
              { value: 'consumptionKwh', label: 'Consumption' },
              { value: 'efficiency', label: 'Efficiency' },
              { value: 'socDrop', label: 'SOC Drop' },
            ]}
          />
          <Select
            placeholder="Order"
            value={sortOrder}
            onChange={setSortOrder}
            data={[
              { value: 'asc', label: 'Ascending' },
              { value: 'desc', label: 'Descending' },
            ]}
          />
        </Group>
      </Stack>

      <Group justify="space-between" mb="sm">
        <Text size="sm" c="dimmed">
          Showing {paginatedData.length} of {filteredAndSortedData.length} trips (Total:{' '}
          {data.length})
        </Text>

        {/* Top Pagination for better accessibility */}
        <Pagination
          total={totalPages}
          value={activePage}
          onChange={setActivePage}
          color="orange"
          size="sm"
        />
      </Group>

      <ScrollArea>
        <Table striped highlightOnHover style={{ minWidth: '800px' }}>
          <Table.Thead>
            <Table.Tr>
              <Th
                sorted={sortBy === 'startDate'}
                reversed={sortOrder === 'desc'}
                onSort={() => setSorting('startDate')}
              >
                Date
              </Th>
              <Table.Th>Start Address</Table.Th>
              <Table.Th>End Address</Table.Th>
              <Th
                sorted={sortBy === 'distanceKm'}
                reversed={sortOrder === 'desc'}
                onSort={() => setSorting('distanceKm')}
              >
                Distance (km)
              </Th>
              <Th
                sorted={sortBy === 'consumptionKwh'}
                reversed={sortOrder === 'desc'}
                onSort={() => setSorting('consumptionKwh')}
              >
                Consumption
              </Th>
              <Th
                sorted={sortBy === 'efficiency'}
                reversed={sortOrder === 'desc'}
                onSort={() => setSorting('efficiency')}
              >
                Efficiency
              </Th>
              <Table.Th>SOC Change</Table.Th>
              <Th
                sorted={sortBy === 'socDrop'}
                reversed={sortOrder === 'desc'}
                onSort={() => setSorting('socDrop')}
              >
                SOC Drop (%)
              </Th>
              <Table.Th>Notes/Tags</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </ScrollArea>

      <Group justify="space-between" align="center" mt="md">
        <Select
          label="Rows per page"
          value={itemsPerPage}
          onChange={(val) => {
            setItemsPerPage(val);
            setActivePage(1);
          }}
          data={['10', '25', '50', '100']}
          size="xs"
          style={{ width: 100 }}
        />
        <Pagination total={totalPages} value={activePage} onChange={setActivePage} color="orange" />
      </Group>

      <TripNotesModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        trip={selectedTripForModal}
        tripId={selectedTripIdForModal}
        onSave={handleSaveAnnotation}
      />
    </Paper>
  );
}

export default TableView;
