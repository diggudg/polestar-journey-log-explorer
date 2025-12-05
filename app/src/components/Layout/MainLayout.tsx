import {
  ActionIcon,
  AppShell,
  Box,
  Burger,
  Button,
  Group,
  Image,
  rem,
  ScrollArea,
  Text,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconBolt,
  IconCar,
  IconCurrencyDollar,
  IconDeviceAnalytics,
  IconLayoutDashboard,
  IconMap,
  IconMoon,
  IconShieldCheck,
  IconSun,
  IconUpload,
} from '@tabler/icons-react';
import { useState } from 'react';
import classes from './MainLayout.module.css';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onUploadClick: () => void;
  onCostCalculatorClick: () => void;
}

const MainLayout = ({
  children,
  activeTab,
  onTabChange,
  onUploadClick,
  onCostCalculatorClick,
}: MainLayoutProps) => {
  const [mobileOpened, setMobileOpened] = useState(false);
  const [desktopOpened, setDesktopOpened] = useState(true);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const mainLinks = [
    { icon: IconLayoutDashboard, label: 'Dashboard', value: 'overview' },
    { icon: IconMap, label: 'Journey Explorer', value: 'explorer' },
    { icon: IconDeviceAnalytics, label: 'Analytics', value: 'analytics' },
  ];

  const vehicleLinks = [
    { icon: IconCar, label: 'Vehicle Status', value: 'vehicle' },
    { icon: IconBolt, label: 'Charging', value: 'charging' },
    { icon: IconShieldCheck, label: 'Health', value: 'health' },
  ];

  const links = mainLinks.map((link) => (
    <UnstyledButton
      key={link.label}
      className={classes.control}
      data-active={activeTab === link.value || undefined}
      onClick={() => {
        onTabChange(link.value);
        setMobileOpened(false);
      }}
    >
      <Group gap={0}>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: rem(40),
            height: rem(40),
          }}
        >
          <link.icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
        </Box>
        <span style={{ flex: 1 }}>{link.label}</span>
      </Group>
    </UnstyledButton>
  ));

  const vehicleSection = vehicleLinks.map((link) => (
    <UnstyledButton
      key={link.label}
      className={classes.control}
      data-active={activeTab === link.value || undefined}
      onClick={() => {
        onTabChange(link.value);
        setMobileOpened(false);
      }}
    >
      <Group gap={0}>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: rem(40),
            height: rem(40),
          }}
        >
          <link.icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
        </Box>
        <span style={{ flex: 1 }}>{link.label}</span>
      </Group>
    </UnstyledButton>
  ));

  const toolsLinks = [
    { icon: IconCurrencyDollar, label: 'Cost/Range calculator', onClick: onCostCalculatorClick },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
      className={classes.mainWrapper}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={mobileOpened}
              onClick={() => setMobileOpened(!mobileOpened)}
              hiddenFrom="sm"
              size="sm"
            />
            <Burger
              opened={desktopOpened}
              onClick={() => setDesktopOpened(!desktopOpened)}
              visibleFrom="sm"
              size="sm"
            />
            <Group gap="xs">
              <Image
                src="/polestar-telemetry-logo.png"
                alt="Polestar Telemetry Logo"
                h={30}
                fit="contain"
              />
              <Text fw={700} size="lg" visibleFrom="xs">
                Polestar Telemetry
              </Text>
            </Group>
          </Group>

          <Group>
            <Button
              leftSection={<IconUpload size={16} />}
              variant="light"
              color="polestarOrange"
              onClick={onUploadClick}
            >
              Upload Data
            </Button>
            <ActionIcon
              onClick={() => toggleColorScheme()}
              variant="default"
              size="lg"
              aria-label="Toggle color scheme"
            >
              {colorScheme === 'dark' ? (
                <IconSun size={18} stroke={1.5} />
              ) : (
                <IconMoon size={18} stroke={1.5} />
              )}
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow component={ScrollArea}>
          <Text size="xs" fw={500} c="dimmed" mb="xs" pl="xs">
            GENERAL
          </Text>
          {links}

          <Text size="xs" fw={500} c="dimmed" mt="md" mb="xs" pl="xs">
            VEHICLE
          </Text>
          {vehicleSection}

          <Text size="xs" fw={500} c="dimmed" mt="md" mb="xs" pl="xs">
            TOOLS
          </Text>
          {toolsLinks.map((link) => (
            <UnstyledButton
              key={link.label}
              className={classes.control}
              onClick={() => {
                link.onClick();
                setMobileOpened(false);
                if (!desktopOpened) setDesktopOpened(true);
              }}
            >
              <Group gap={0}>
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: rem(40),
                    height: rem(40),
                  }}
                >
                  <link.icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
                </Box>
                <span style={{ flex: 1 }}>{link.label}</span>
              </Group>
            </UnstyledButton>
          ))}
        </AppShell.Section>

        <AppShell.Section>
          <Box
            style={{
              paddingTop: 'var(--mantine-spacing-sm)',
              borderTop: '1px solid var(--mantine-color-default-border)',
            }}
          >
            <Group justify="space-between" px="xs">
              <Text size="xs" c="dimmed">
                v1.0.0
              </Text>
              <Text size="xs" c="dimmed">
                © 2025
              </Text>
            </Group>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default MainLayout;
