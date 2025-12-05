// @ts-nocheck
import { Badge, Group, Paper, Stack, Text } from '@mantine/core';

interface VehicleDiagramProps {
  exterior: any;
}

export default function VehicleDiagram({ exterior }: VehicleDiagramProps) {
  if (!exterior) {
    return (
      <Paper p="md" withBorder radius="md">
        <Text c="dimmed" ta="center">
          No exterior data available
        </Text>
      </Paper>
    );
  }

  const getStatusColor = (status: string) => {
    if (status?.includes('CLOSED')) return '#64748b'; // slate gray for closed
    if (status?.includes('OPEN')) return '#f97316'; // orange for open (warning)
    return '#475569'; // darker gray
  };

  const getStatusText = (status: string) => {
    if (status?.includes('CLOSED')) return 'Closed';
    if (status?.includes('OPEN')) return 'Open';
    return 'Unknown';
  };

  const elements = [
    { label: 'Front Left Door', status: exterior.frontLeftDoor, x: 80, y: 60 },
    { label: 'Front Right Door', status: exterior.frontRightDoor, x: 220, y: 60 },
    { label: 'Rear Left Door', status: exterior.rearLeftDoor, x: 80, y: 140 },
    { label: 'Rear Right Door', status: exterior.rearRightDoor, x: 220, y: 140 },
    { label: 'Front Left Window', status: exterior.frontLeftWindow, x: 100, y: 80 },
    { label: 'Front Right Window', status: exterior.frontRightWindow, x: 200, y: 80 },
    { label: 'Rear Left Window', status: exterior.rearLeftWindow, x: 100, y: 120 },
    { label: 'Rear Right Window', status: exterior.rearRightWindow, x: 200, y: 120 },
    { label: 'Hood', status: exterior.hood, x: 150, y: 30 },
    { label: 'Tailgate', status: exterior.tailgate, x: 150, y: 170 },
  ];

  return (
    <Paper p="md" withBorder radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={600} size="lg">
            Vehicle Status
          </Text>
          <Badge
            color={exterior.centralLock?.includes('LOCKED') ? 'dark' : 'orange'}
            variant="light"
          >
            {exterior.centralLock?.includes('LOCKED') ? 'Locked' : 'Unlocked'}
          </Badge>
        </Group>

        {/* SVG Car Diagram */}
        <svg
          viewBox="0 0 300 200"
          style={{ maxWidth: '400px', margin: '0 auto' }}
          role="img"
          aria-label="Vehicle exterior status"
        >
          <title>Vehicle exterior status</title>
          {/* Car Body */}
          <rect
            x="70"
            y="50"
            width="160"
            height="100"
            rx="10"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="2"
          />

          {/* Hood */}
          <rect
            x="130"
            y="20"
            width="40"
            height="35"
            rx="5"
            fill={getStatusColor(exterior.hood)}
            stroke="#475569"
            strokeWidth="2"
          />

          {/* Tailgate */}
          <rect
            x="130"
            y="145"
            width="40"
            height="35"
            rx="5"
            fill={getStatusColor(exterior.tailgate)}
            stroke="#475569"
            strokeWidth="2"
          />

          {/* Doors */}
          <rect
            x="60"
            y="55"
            width="25"
            height="35"
            rx="3"
            fill={getStatusColor(exterior.frontLeftDoor)}
            stroke="#475569"
            strokeWidth="1.5"
          />
          <rect
            x="215"
            y="55"
            width="25"
            height="35"
            rx="3"
            fill={getStatusColor(exterior.frontRightDoor)}
            stroke="#475569"
            strokeWidth="1.5"
          />
          <rect
            x="60"
            y="110"
            width="25"
            height="35"
            rx="3"
            fill={getStatusColor(exterior.rearLeftDoor)}
            stroke="#475569"
            strokeWidth="1.5"
          />
          <rect
            x="215"
            y="110"
            width="25"
            height="35"
            rx="3"
            fill={getStatusColor(exterior.rearRightDoor)}
            stroke="#475569"
            strokeWidth="1.5"
          />

          {/* Windows */}
          <rect
            x="90"
            y="65"
            width="30"
            height="20"
            rx="2"
            fill={getStatusColor(exterior.frontLeftWindow)}
            stroke="#475569"
            strokeWidth="1"
            opacity="0.8"
          />
          <rect
            x="180"
            y="65"
            width="30"
            height="20"
            rx="2"
            fill={getStatusColor(exterior.frontRightWindow)}
            stroke="#475569"
            strokeWidth="1"
            opacity="0.8"
          />
          <rect
            x="90"
            y="115"
            width="30"
            height="20"
            rx="2"
            fill={getStatusColor(exterior.rearLeftWindow)}
            stroke="#475569"
            strokeWidth="1"
            opacity="0.8"
          />
          <rect
            x="180"
            y="115"
            width="30"
            height="20"
            rx="2"
            fill={getStatusColor(exterior.rearRightWindow)}
            stroke="#475569"
            strokeWidth="1"
            opacity="0.8"
          />

          {/* Windshield */}
          <rect
            x="125"
            y="60"
            width="50"
            height="25"
            rx="3"
            fill="#334155"
            stroke="#475569"
            strokeWidth="1"
            opacity="0.5"
          />

          {/* Rear Window */}
          <rect
            x="125"
            y="115"
            width="50"
            height="25"
            rx="3"
            fill="#334155"
            stroke="#475569"
            strokeWidth="1"
            opacity="0.5"
          />

          {/* Sunroof (if available) */}
          {exterior.sunroof && (
            <rect
              x="135"
              y="90"
              width="30"
              height="20"
              rx="2"
              fill={getStatusColor(exterior.sunroof)}
              stroke="#475569"
              strokeWidth="1"
              opacity="0.6"
            />
          )}
        </svg>

        {/* Legend */}
        <Group justify="center" gap="md">
          <Group gap="xs">
            <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#64748b' }} />
            <Text size="xs" c="dimmed">
              Closed
            </Text>
          </Group>
          <Group gap="xs">
            <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#f97316' }} />
            <Text size="xs" c="dimmed">
              Open
            </Text>
          </Group>
        </Group>

        {/* Status List */}
        <Stack gap="xs">
          {elements
            .filter((e) => e.status)
            .map((element) => (
              <Group key={element.label} justify="space-between">
                <Text size="sm">{element.label}</Text>
                <Badge
                  size="sm"
                  color={getStatusColor(element.status).includes('64748b') ? 'dark' : 'orange'}
                  variant="dot"
                >
                  {getStatusText(element.status)}
                </Badge>
              </Group>
            ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
