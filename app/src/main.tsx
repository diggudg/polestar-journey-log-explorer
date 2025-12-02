import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, createTheme, rem } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import App from './App';
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/dates/styles.css';
import './mobile.css';

const theme = createTheme({
  primaryColor: 'orange',
  colors: {
    // Polestar Safety Orange
    orange: [
      '#FFF0E6',
      '#FFD6C2',
      '#FFB899',
      '#FF9970',
      '#FF7A47',
      '#FF5C1F',
      '#F43F00', // Primary shade
      '#CC3500',
      '#A32A00',
      '#7A2000',
    ],
    // Polestar Carbon / Grays
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
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
