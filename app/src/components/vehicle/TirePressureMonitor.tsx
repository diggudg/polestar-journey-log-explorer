// @ts-nocheck
import { Grid, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import UIColors from '../../theme/uiColors';

interface TirePressureMonitorProps {
  health: any;
}

export default function TirePressureMonitor({ health }: TirePressureMonitorProps) {
  if (!health) {
    return (
      <Paper p="md" withBorder radius="md">
        <Text c="dimmed" ta="center">
          No tire pressure data available
        </Text>
      </Paper>
    );
  }

  const tires = [
    {
      position: 'Front Left',
      pressure: health.frontLeftTyrePressureKpa,
      warning: health.frontLeftTyrePressureWarning,
      x: 80,
      y: 60,
    },
    {
      position: 'Front Right',
      pressure: health.frontRightTyrePressureKpa,
      warning: health.frontRightTyrePressureWarning,
      x: 220,
      y: 60,
    },
    {
      position: 'Rear Left',
      pressure: health.rearLeftTyrePressureKpa,
      warning: health.rearLeftTyrePressureWarning,
      x: 80,
      y: 180,
    },
    {
      position: 'Rear Right',
      pressure: health.rearRightTyrePressureKpa,
      warning: health.rearRightTyrePressureWarning,
      x: 220,
      y: 180,
    },
  ];

  const hasWarning = (warning: string) => {
    return warning && !warning.includes('NO_WARNING');
  };

  const recommendedPressure = 250; // kPa - typical for EVs

  return (
    <Paper p="md" withBorder radius="md">
      <Stack gap="md">
        <Text fw={600} size="lg">
          Tire Pressure Monitor
        </Text>

        {/* Visual Tire Layout */}
        <svg
          viewBox="0 0 300 240"
          style={{ maxWidth: '300px', margin: '0 auto' }}
          role="img"
          aria-label="Tire pressure overview"
        >
          <title>Tire pressure overview</title>
          {/* Car outline */}
          <rect
            x="90"
            y="80"
            width="120"
            height="80"
            rx="8"
            fill="none"
            stroke="#475569"
            strokeWidth="2"
            strokeDasharray="4,4"
          />

          {tires.map((tire) => (
            <g key={tire.position}>
              {/* Tire */}
              <circle
                cx={tire.x}
                cy={tire.y}
                r="30"
                fill={hasWarning(tire.warning) ? '#451a03' : '#1e293b'}
                stroke={hasWarning(tire.warning) ? '#f97316' : '#64748b'}
                strokeWidth="3"
              />
              {/* Pressure Text */}
              <text
                x={tire.x}
                y={tire.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
                fontWeight="bold"
                fill={hasWarning(tire.warning) ? '#f97316' : '#94a3b8'}
              >
                {tire.pressure ? `${tire.pressure}` : 'N/A'}
              </text>
              <text x={tire.x} y={tire.y + 12} textAnchor="middle" fontSize="10" fill="#64748b">
                kPa
              </text>
            </g>
          ))}
        </svg>

        {/* Tire Details Grid */}
        <Grid gutter="xs">
          {tires.map((tire) => (
            <Grid.Col key={tire.position} span={6}>
              <Paper p="sm" withBorder radius="sm">
                <Group justify="space-between" wrap="nowrap">
                  <div>
                    <Text size="xs" fw={600}>
                      {tire.position}
                    </Text>
                    <Text
                      size="lg"
                      fw={700}
                      c={hasWarning(tire.warning) ? 'polestarRed' : 'dimmed'}
                    >
                      {tire.pressure ? `${tire.pressure} kPa` : 'N/A'}
                    </Text>
                  </div>
                  <ThemeIcon
                    size="lg"
                    radius="xl"
                    variant="light"
                    color={hasWarning(tire.warning) ? 'polestarRed' : UIColors.ACTIVE}
                  >
                    {hasWarning(tire.warning) ? (
                      <IconAlertTriangle size={20} />
                    ) : (
                      <IconCircleCheck size={20} />
                    )}
                  </ThemeIcon>
                </Group>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>

        {/* Recommended Pressure */}
        <Paper p="sm" withBorder radius="sm">
          <Group justify="space-between">
            <Text size="sm" fw={500} c="dimmed">
              Recommended Pressure
            </Text>
            <Text size="sm" fw={700}>
              {recommendedPressure} kPa
            </Text>
          </Group>
        </Paper>
      </Stack>
    </Paper>
  );
}
