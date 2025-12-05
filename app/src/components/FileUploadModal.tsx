import { Group, Modal, rem, Stack, Text } from '@mantine/core';
import { Dropzone, type FileWithPath, MIME_TYPES } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { IconBolt, IconFileCode, IconFileSpreadsheet, IconUpload } from '@tabler/icons-react';
import { parseCSV, parseXLSX } from '../utils/dataParser';

interface FileUploadModalProps {
  opened: boolean;
  onClose: () => void;
  onDataLoaded: (type: string, data: any) => void;
}

const FileUploadModal = ({ opened, onClose, onDataLoaded }: FileUploadModalProps) => {
  const handleFileDrop = async (
    files: FileWithPath[],
    type: 'journey' | 'vehicle' | 'charging'
  ) => {
    const file = files[0];
    if (!file) return;

    if (type === 'journey') {
      try {
        let data: unknown;
        const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

        if (isExcel) {
          data = await parseXLSX(file);
        } else {
          data = await parseCSV(file);
        }

        if (data) {
          onDataLoaded('journey', data);
          notifications.show({
            title: 'Success',
            message: 'Journey data uploaded',
            color: 'polestarOrange',
          });
          onClose();
        }
      } catch (error) {
        console.error(error);
        notifications.show({
          title: 'Error',
          message: 'Failed to parse journey data',
          color: 'red',
        });
      }
    } else {
      // JSON files
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const json = JSON.parse(content);
          const dataType = type === 'vehicle' ? 'vts' : 'chronos';
          onDataLoaded(dataType, json);
          notifications.show({
            title: 'Success',
            message: `${type === 'vehicle' ? 'Vehicle' : 'Charging'} data uploaded`,
            color: 'polestarOrange',
          });
          onClose();
        } catch (_error) {
          notifications.show({ title: 'Error', message: 'Invalid file format', color: 'red' });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Upload Data" size="lg">
      <Stack gap="xl">
        {/* Journey Data */}
        <Stack gap="xs">
          <Text fw={500}>Journey Log (CSV/XLSX)</Text>
          <Dropzone
            onDrop={(files) => handleFileDrop(files, 'journey')}
            onReject={() =>
              notifications.show({ title: 'Error', message: 'File rejected', color: 'red' })
            }
            maxSize={5 * 1024 ** 2}
            accept={[MIME_TYPES.csv, MIME_TYPES.xls, MIME_TYPES.xlsx]}
            maxFiles={1}
          >
            <Group justify="center" gap="xl" style={{ minHeight: rem(80), pointerEvents: 'none' }}>
              <Dropzone.Accept>
                <IconUpload
                  style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-blue-6)' }}
                  stroke={1.5}
                />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconUpload
                  style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }}
                  stroke={1.5}
                />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconFileSpreadsheet
                  style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }}
                  stroke={1.5}
                />
              </Dropzone.Idle>

              <div>
                <Text size="xl" inline>
                  Drag journey log here or click to select
                </Text>
                <Text size="sm" c="dimmed" inline mt={7}>
                  Supports .csv and .xlsx files exported from Polestar
                </Text>
              </div>
            </Group>
          </Dropzone>
        </Stack>

        {/* Vehicle Status */}
        <Stack gap="xs">
          <Text fw={500}>Vehicle Status (vts.json)</Text>
          <Dropzone
            onDrop={(files) => handleFileDrop(files, 'vehicle')}
            onReject={() =>
              notifications.show({ title: 'Error', message: 'File rejected', color: 'red' })
            }
            maxSize={5 * 1024 ** 2}
            accept={['application/json']}
            maxFiles={1}
          >
            <Group justify="center" gap="xl" style={{ minHeight: rem(60), pointerEvents: 'none' }}>
              <IconFileCode
                style={{ width: rem(40), height: rem(40), color: 'var(--mantine-color-dimmed)' }}
              />
              <Text size="sm" c="dimmed">
                Drag vts.json here
              </Text>
            </Group>
          </Dropzone>
        </Stack>

        {/* Charging Data */}
        <Stack gap="xs">
          <Text fw={500}>Charging Data (chronos.json)</Text>
          <Dropzone
            onDrop={(files) => handleFileDrop(files, 'charging')}
            onReject={() =>
              notifications.show({ title: 'Error', message: 'File rejected', color: 'red' })
            }
            maxSize={5 * 1024 ** 2}
            accept={['application/json']}
            maxFiles={1}
          >
            <Group justify="center" gap="xl" style={{ minHeight: rem(60), pointerEvents: 'none' }}>
              <IconBolt
                style={{ width: rem(40), height: rem(40), color: 'var(--mantine-color-dimmed)' }}
              />
              <Text size="sm" c="dimmed">
                Drag chronos.json here
              </Text>
            </Group>
          </Dropzone>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default FileUploadModal;
