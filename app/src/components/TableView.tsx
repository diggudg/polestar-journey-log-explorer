import { ActionIcon, Badge, Group, Pagination, Paper, ScrollArea, Select, Stack, Table, Text, TextInput, Tooltip } from '@mantine/core';
import { IconNote, IconSearch, IconTag } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { generateTripId, getTripAnnotation } from '../utils/tripAnnotations';
import TripNotesModal from './TripNotesModal';

function TableView({ data }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState(null);

  // Pagination state
  const [activePage, setActivePage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState('10');

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(trip =>
      trip.startAddress.toLowerCase().includes(search.toLowerCase()) ||
      trip.endAddress.toLowerCase().includes(search.toLowerCase()) ||
      trip.startDate.includes(search)
    );

    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'startDate') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [data, search, sortBy, sortOrder]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    const start = (activePage - 1) * parseInt(itemsPerPage);
    const end = start + parseInt(itemsPerPage);
    return filteredAndSortedData.slice(start, end);
  }, [filteredAndSortedData, activePage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / parseInt(itemsPerPage));

  const getEfficiencyColor = (efficiency) => {
    const eff = parseFloat(efficiency);
    if (eff < 15) return 'green';
    if (eff < 20) return 'yellow';
    if (eff < 25) return 'orange';
    return 'red';
  };

  const handleOpenModal = (trip) => {
    setSelectedTrip(trip);
    setSelectedTripId(generateTripId(trip));
    setModalOpened(true);
  };

  const handleSaveAnnotation = () => {
    // Refresh handled by modal close
  };

  const rows = paginatedData.map((trip) => {
    const tripId = generateTripId(trip);
    const annotation = getTripAnnotation(tripId);
    const hasNotes = annotation.notes?.length > 0;
    const hasTags = annotation.tags?.length > 0;

    return (
      <Table.Tr key={trip.id}>
        <Table.Td style={{ whiteSpace: 'nowrap' }}>{trip.startDate}</Table.Td>
        <Table.Td>{trip.startAddress.substring(0, 30)}...</Table.Td>
        <Table.Td>{trip.endAddress.substring(0, 30)}...</Table.Td>
        <Table.Td>{trip.distanceKm}</Table.Td>
        <Table.Td>{trip.consumptionKwh}</Table.Td>
        <Table.Td>
          <Badge color={getEfficiencyColor(trip.efficiency)} size="sm" variant="light">
            {trip.efficiency}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Badge color="blue" size="sm" variant="outline">
            {trip.socSource}% → {trip.socDestination}%
          </Badge>
        </Table.Td>
        <Table.Td>{trip.socDrop}%</Table.Td>
        <Table.Td>
          <Group gap="xs">
            {hasTags && (
              <Tooltip label={annotation.tags.join(', ')} withArrow>
                <Badge size="sm" variant="dot" color="blue">
                  <IconTag size={12} /> {annotation.tags.length}
                </Badge>
              </Tooltip>
            )}
            {hasNotes && (
              <Tooltip label={annotation.notes.substring(0, 100)} withArrow>
                <Badge size="sm" variant="dot" color="green">
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
              color={hasNotes || hasTags ? 'blue' : 'gray'}
              onClick={() => handleOpenModal(trip)}
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
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <TextInput
            placeholder="Search by address or date..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setActivePage(1); // Reset to first page on search
            }}
            style={{ flex: 1 }}
          />
          <Group>
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
              style={{ width: '150px' }}
            />
            <Select
              placeholder="Order"
              value={sortOrder}
              onChange={setSortOrder}
              data={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
              style={{ width: '130px' }}
            />
          </Group>
        </Group>

        <Text size="sm" c="dimmed">
          Total: {filteredAndSortedData.length} trips
        </Text>

        {/* Top Pagination for better accessibility */}
        <Group justify="flex-end" mb="xs">
          <Pagination
            total={totalPages}
            value={activePage}
            onChange={setActivePage}
            color="orange"
            size="sm"
          />
        </Group>

        <ScrollArea>
          <Table striped highlightOnHover verticalSpacing="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Start Address</Table.Th>
                <Table.Th>End Address</Table.Th>
                <Table.Th>Dist (km)</Table.Th>
                <Table.Th>Cons (kWh)</Table.Th>
                <Table.Th>Eff (kWh/100km)</Table.Th>
                <Table.Th>SOC Change</Table.Th>
                <Table.Th>Drop (%)</Table.Th>
                <Table.Th>Notes</Table.Th>
                <Table.Th>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </ScrollArea>

        <Group justify="space-between" align="center">
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
          <Pagination
            total={totalPages}
            value={activePage}
            onChange={setActivePage}
            color="orange"
          />
        </Group>
      </Stack>

      <TripNotesModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        trip={selectedTrip}
        tripId={selectedTripId}
        onSave={handleSaveAnnotation}
      />
    </Paper >
  );
}

export default TableView;
