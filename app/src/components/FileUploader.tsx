// @ts-nocheck
import {
  ActionIcon,
  Badge,
  Group,
  Image,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import {
  IconBolt,
  IconCar,
  IconCheck,
  IconFile,
  IconHelp,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';
import { DataValidator } from '../utils/DataValidator';
import { parseCSV, parseXLSX } from '../utils/dataParser';
import AnomalyCorrectionModal from './AnomalyCorrectionModal';
import HelpModal from './HelpModal';

function FileUploader({ onDataLoaded, vehicleStatusData, chargingData }) {
  const [loading, setLoading] = useState(false);
  const [helpOpened, setHelpOpened] = useState(false);
  const [anomalies, setAnomalies] = useState([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const logoSrc = `${import.meta.env.BASE_URL}polestar-telemetry-logo.png`;

  const handleJourneyDrop = async (files) => {
    if (files.length === 0) return;
    const file = files[0];
    const fileName = file.name.toLowerCase();
    setLoading(true);

    try {
      let data: unknown[];
      if (fileName.endsWith('.csv')) {
        data = await parseCSV(file);
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        data = await parseXLSX(file);
      } else {
        throw new Error('Unsupported file format. Please upload a CSV or XLSX file.');
      }

      if (data.length === 0) {
        throw new Error('No valid journey data found in the file.');
      }

      const foundAnomalies = DataValidator.validate(data);
      if (foundAnomalies.length > 0) {
        setAnomalies(foundAnomalies);
        setPendingData(data);
        setModalOpened(true);
        setLoading(false);
        return;
      }

      notifications.show({
        title: 'Success!',
        message: `Loaded ${data.length} journeys from ${file.name}`,
        color: 'polestarOrange',
      });

      onDataLoaded('journey', data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to parse file',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJsonDrop = async (files, type) => {
    if (files.length === 0) return;
    const file = files[0];
    setLoading(true);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      onDataLoaded(type, data);

      notifications.show({
        title: 'Success!',
        message: `Loaded ${type === 'vehicle' ? 'Vehicle Status' : 'Charging Settings'}`,
        color: 'polestarOrange',
      });
    } catch (_error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to parse JSON file',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="xl" mt="xl">
      <div>
        <Image
          src={logoSrc}
          alt="Polestar Telemetry Logo"
          h={120}
          fit="contain"
          style={{ margin: '0 auto' }}
          mb="xl"
        />
        <Group justify="center" gap="xs" mb="sm">
          <Text size="xl" fw={700}>
            Upload Your Data
          </Text>
          <Tooltip label="How to get your data">
            <ActionIcon variant="subtle" size="lg" onClick={() => setHelpOpened(true)}>
              <IconHelp size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Text size="sm" c="dimmed" mb="xl">
          Upload your Polestar journey log and other data files to get started
        </Text>
      </div>

      <Paper shadow="md" p="xl" radius="md" withBorder>
        <Stack gap="lg">
          {/* Main Journey Log Upload */}
          <div>
            <Text fw={600} mb="sm">
              Journey Log (Required)
            </Text>
            <Dropzone
              onDrop={handleJourneyDrop}
              loading={loading}
              accept={[
                'text/csv',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              ]}
              maxFiles={1}
            >
              <Group justify="center" gap="xl" style={{ minHeight: 120, pointerEvents: 'none' }}>
                <Dropzone.Accept>
                  <IconUpload size={50} stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={50} stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconFile size={50} stroke={1.5} />
                </Dropzone.Idle>
                <div>
                  <Text size="xl" inline>
                    Drag Journey Log here
                  </Text>
                  <Text size="sm" c="dimmed" inline mt={7}>
                    Accepts CSV and XLSX files
                  </Text>
                </div>
              </Group>
            </Dropzone>
          </div>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            {/* Vehicle Status Upload */}
            <div>
              <Group justify="space-between" mb="xs">
                <Text fw={600}>Vehicle Status (vts.json)</Text>
                {vehicleStatusData && (
                  <Badge color="polestarOrange" leftSection={<IconCheck size={12} />}>
                    Uploaded
                  </Badge>
                )}
              </Group>
              <Dropzone
                onDrop={(files) => handleJsonDrop(files, 'vehicle')}
                loading={loading}
                accept={['application/json']}
                maxFiles={1}
                style={{
                  borderColor: vehicleStatusData
                    ? 'var(--mantine-color-polestarOrange-5)'
                    : undefined,
                }}
              >
                <Group justify="center" gap="md" style={{ minHeight: 80, pointerEvents: 'none' }}>
                  <IconCar size={30} stroke={1.5} />
                  <div>
                    <Text size="sm" inline>
                      Upload vts.json
                    </Text>
                  </div>
                </Group>
              </Dropzone>
            </div>

            {/* Charging Settings Upload */}
            <div>
              <Group justify="space-between" mb="xs">
                <Text fw={600}>Charging Settings (chronos.json)</Text>
                {chargingData && (
                  <Badge color="polestarOrange" leftSection={<IconCheck size={12} />}>
                    Uploaded
                  </Badge>
                )}
              </Group>
              <Dropzone
                onDrop={(files) => handleJsonDrop(files, 'charging')}
                loading={loading}
                accept={['application/json']}
                maxFiles={1}
                style={{
                  borderColor: chargingData ? 'var(--mantine-color-polestarOrange-5)' : undefined,
                }}
              >
                <Group justify="center" gap="md" style={{ minHeight: 80, pointerEvents: 'none' }}>
                  <IconBolt size={30} stroke={1.5} />
                  <div>
                    <Text size="sm" inline>
                      Upload chronos.json
                    </Text>
                  </div>
                </Group>
              </Dropzone>
            </div>
          </SimpleGrid>
        </Stack>
      </Paper>

      <HelpModal opened={helpOpened} onClose={() => setHelpOpened(false)} />

      <AnomalyCorrectionModal
        opened={modalOpened}
        anomalies={anomalies}
        onClose={() => {
          setModalOpened(false);
          setPendingData(null);
          setAnomalies([]);
        }}
        onApply={(corrections) => {
          if (!pendingData) return;
          const correctionMap = new Map(corrections.map((c) => [c.tripIndex, c]));
          const finalData = pendingData
            .map((trip, index) => {
              const correction = correctionMap.get(index);
              if (!correction) return trip;
              if (correction.action === 'skip') return null;
              if (correction.action === 'correct' && correction.newData) {
                return {
                  ...trip,
                  ...correction.newData,
                  efficiency: (
                    (correction.newData.consumptionKwh / correction.newData.distanceKm) *
                    100
                  ).toFixed(2),
                };
              }
              return trip;
            })
            .filter((trip) => trip !== null);

          onDataLoaded('journey', finalData);
          setModalOpened(false);
          setPendingData(null);
          setAnomalies([]);
          notifications.show({
            title: 'Success!',
            message: `Loaded ${finalData.length} journeys`,
            color: 'polestarOrange',
          });
        }}
      />
    </Stack>
  );
}

export default FileUploader;
