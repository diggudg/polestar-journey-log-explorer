import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Modal,
  Pagination,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconCheck, IconEdit, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export default function AnomalyCorrectionModal({ opened, anomalies, onClose, onApply }) {
  const [items, setItems] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    // Initialize state with anomalies when they change
    setItems(
      anomalies.map((a) => ({
        ...a,
        action: 'keep', // default action
        editedDistance: a.trip.distanceKm,
        editedConsumption: a.trip.consumptionKwh,
      }))
    );
  }, [anomalies]);

  const handleActionChange = (index, action) => {
    const newItems = [...items];
    newItems[index].action = action;
    setItems(newItems);
  };

  const handleEditChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    // Auto-switch to 'correct' action if user edits
    newItems[index].action = 'correct';
    setItems(newItems);
  };

  const handleApply = () => {
    // Process the decisions
    const corrections = items.map((item) => ({
      tripIndex: item.tripIndex,
      action: item.action,
      newData:
        item.action === 'correct'
          ? {
              distanceKm: parseFloat(item.editedDistance),
              consumptionKwh: parseFloat(item.editedConsumption),
            }
          : null,
    }));
    onApply(corrections);
  };

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

  const rows = paginatedItems.map((item, index) => {
    // Adjust index for global tracking if needed, but here we use item.tripIndex
    const actualIndex = (activePage - 1) * itemsPerPage + index;
    return (
      <Table.Tr
        key={actualIndex}
        bg={
          item.action === 'skip'
            ? 'var(--mantine-color-red-light)'
            : item.action === 'correct'
              ? 'var(--mantine-color-blue-light)'
              : undefined
        }
      >
        <Table.Td>
          <Text size="sm" fw={500}>
            Row {item.tripIndex + 1}
          </Text>
          <Text size="xs" c="dimmed">
            {item.trip.startDate}
          </Text>
        </Table.Td>
        <Table.Td>
          <Stack gap={4}>
            {item.issues.map((issue, i) => (
              <Badge
                key={`${item.tripIndex}-${i}-${issue}`}
                color="polestarRed"
                variant="light"
                size="sm"
              >
                {issue}
              </Badge>
            ))}
          </Stack>
        </Table.Td>
        <Table.Td>
          <Group gap="xs">
            <TextInput
              size="xs"
              w={80}
              label="Dist (km)"
              value={item.editedDistance}
              onChange={(e) =>
                handleEditChange(
                  (activePage - 1) * itemsPerPage + index,
                  'editedDistance',
                  e.target.value
                )
              }
            />
            <TextInput
              size="xs"
              w={80}
              label="Cons (kWh)"
              value={item.editedConsumption}
              onChange={(e) =>
                handleEditChange(
                  (activePage - 1) * itemsPerPage + index,
                  'editedConsumption',
                  e.target.value
                )
              }
            />
          </Group>
        </Table.Td>
        <Table.Td>
          <Group gap={4}>
            <Tooltip label="Keep Original">
              <ActionIcon
                variant={item.action === 'keep' ? 'filled' : 'light'}
                color="polestarGrey"
                onClick={() => handleActionChange((activePage - 1) * itemsPerPage + index, 'keep')}
              >
                <IconCheck size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Skip/Delete">
              <ActionIcon
                variant={item.action === 'skip' ? 'filled' : 'light'}
                color="polestarRed"
                onClick={() => handleActionChange((activePage - 1) * itemsPerPage + index, 'skip')}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Use Corrected">
              <ActionIcon
                variant={item.action === 'correct' ? 'filled' : 'light'}
                color="orange"
                onClick={() =>
                  handleActionChange((activePage - 1) * itemsPerPage + index, 'correct')
                }
              >
                <IconEdit size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Data Anomalies Detected" size="xl">
      <Text size="sm" mb="md">
        We found some unusual data in your file. Please review the flagged items below. You can
        choose to keep them as is, skip (remove) them, or manually correct the values.
      </Text>

      <ScrollArea h={400}>
        {items.length > itemsPerPage && (
          <Group justify="center" mb="xs">
            <Pagination total={totalPages} value={activePage} onChange={setActivePage} size="sm" />
          </Group>
        )}
        <Table stickyHeader>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Record</Table.Th>
              <Table.Th>Issues</Table.Th>
              <Table.Th>Values</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </ScrollArea>

      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleApply}>Apply Corrections</Button>
      </Group>
    </Modal>
  );
}
