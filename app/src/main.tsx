import { createTheme, MantineProvider, rem } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/dates/styles.css';
import './mobile.css';
import { MantineColors } from './theme/colors';

const theme = createTheme({
  primaryColor: 'polestarOrange',
  colors: {
    // Polestar Safety Orange - Primary accent color
    polestarOrange: MantineColors.polestarOrange,
    // Polestar Red - Alerts and errors
    polestarRed: MantineColors.polestarRed,
    // Polestar Grey - Secondary, inactive states
    polestarGrey: MantineColors.polestarGrey,
    // Polestar Green - Success states
    polestarGreen: MantineColors.polestarGreen,
    // Polestar Cyan - Info states
    polestarCyan: MantineColors.polestarCyan,
    // Polestar Yellow - Warning states
    polestarYellow: MantineColors.polestarYellow,
    // Override default 'orange' to use Polestar orange
    orange: MantineColors.polestarOrange,
    // Override 'red' to use Polestar red
    red: MantineColors.polestarRed,
    // Override 'green' to use Polestar green
    green: MantineColors.polestarGreen,
    // Override 'cyan' to use Polestar cyan
    cyan: MantineColors.polestarCyan,
    // Override 'yellow' to use Polestar yellow
    yellow: MantineColors.polestarYellow,
    // Polestar Carbon / Grays for dark mode
    dark: [
      '#C8C9C7', // Grey Nurse
      '#B1B3B3', // Agathe Grey
      '#97999B', // Grey Chateau
      '#75787B', // Storm Grey
      '#53565A', // Iron Grey
      '#3A3C3F',
      '#25262B',
      '#1A1B1E', // Dark background
      '#141517',
      '#101113',
    ],
  },
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
    sizes: {
      h1: { fontSize: rem(36) },
      h2: { fontSize: rem(30) },
      h3: { fontSize: rem(24) },
      h4: { fontSize: rem(20) },
      h5: { fontSize: rem(16) },
      h6: { fontSize: rem(14) },
    },
  },
  defaultRadius: 'md',
  components: {
    Button: {
      defaultProps: {
        fw: 500,
      },
    },
    Card: {
      defaultProps: {
        withBorder: true,
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications />
      <App />
    </MantineProvider>
  </React.StrictMode>
);
