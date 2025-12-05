// @ts-nocheck
import { Badge, Grid, Group, Paper, Stack, Text } from '@mantine/core';
import { IconBolt, IconCalendarEvent, IconClock } from '@tabler/icons-react';
import styles from './VehicleStyles.module.css';

interface ChargingTimelineProps {
  chargeTimer: any;
}

export default function ChargingTimeline({ chargeTimer }: ChargingTimelineProps) {
  if (!chargeTimer) {
    return (
      <Paper p="md" withBorder radius="md">
        <Text c="dimmed" ta="center">
          No charging schedule available
        </Text>
      </Paper>
    );
  }

  const timer = chargeTimer.globalChargeTimer;
  const startHour = timer?.start?.hour ?? 0;
  const startMinute = timer?.start?.minute ?? 0;
  const stopHour = timer?.stop?.hour ?? 24;
  const stopMinute = timer?.stop?.minute ?? 0;
  const isActivated = timer?.activated ?? false;

  // Calculate timeline percentages
  const startPercent = ((startHour * 60 + startMinute) / (24 * 60)) * 100;
  const stopPercent = ((stopHour * 60 + stopMinute) / (24 * 60)) * 100;
  const duration = stopPercent - startPercent;

  // Get current time position
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentPercent = (currentMinutes / (24 * 60)) * 100;

  // Check if currently in charging window
  const inWindow =
    currentMinutes >= startHour * 60 + startMinute && currentMinutes <= stopHour * 60 + stopMinute;

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  return (
    <Paper p="md" withBorder radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={600} size="lg">
            Charging Schedule
          </Text>
          <Badge
            size="lg"
            color={isActivated ? 'orange' : 'dark'}
            variant="light"
            leftSection={<IconCalendarEvent size={14} />}
          >
            {isActivated ? 'Active' : 'Disabled'}
          </Badge>
        </Group>

        {/* 24-Hour Timeline */}
        <div className={styles.timelineContainer}>
          {/* Background bar */}
          <div className={styles.timelineBar} />

          {/* Charging window */}
          <div
            className={`${styles.chargingWindow} ${isActivated ? styles.chargingWindowActive : styles.chargingWindowInactive}`}
            style={{ left: `${startPercent}%`, width: `${duration}%` }}
          />

          {/* Current time marker */}
          <div className={styles.timeMarker} style={{ left: `${currentPercent}%` }} />

          {/* Time labels */}
          <Text size="xs" c="dimmed" className={`${styles.timeLabel} ${styles.timeLabelStart}`}>
            00:00
          </Text>
          <Text size="xs" c="dimmed" className={`${styles.timeLabel} ${styles.timeLabelMiddle}`}>
            12:00
          </Text>
          <Text size="xs" c="dimmed" className={`${styles.timeLabel} ${styles.timeLabelEnd}`}>
            24:00
          </Text>
        </div>

        {/* Schedule Details */}
        <Grid gutter="md">
          <Grid.Col span={6}>
            <Paper p="sm" withBorder radius="sm">
              <Group gap="xs">
                <IconClock size={16} color="#64748b" />
                <div>
                  <Text size="xs" c="dimmed">
                    Start
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatTime(startHour, startMinute)}
                  </Text>
                </div>
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={6}>
            <Paper p="sm" withBorder radius="sm">
              <Group gap="xs">
                <IconClock size={16} color="#64748b" />
                <div>
                  <Text size="xs" c="dimmed">
                    End
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatTime(stopHour, stopMinute)}
                  </Text>
                </div>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        {inWindow && isActivated && (
          <Badge
            color="orange"
            variant="light"
            size="lg"
            fullWidth
            leftSection={<IconBolt size={14} />}
          >
            Currently in Charging Window
          </Badge>
        )}
      </Stack>
    </Paper>
  );
}
