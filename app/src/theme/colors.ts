/**
 * Polestar Design System Color Constants
 * Based on official Polestar brand guidelines
 *
 * Use these throughout the application for consistent theming
 */

// Core Polestar Colors
export const PolestarColors = {
  // Base
  black: '#000000',
  white: '#FFFFFF',
  transparent: 'rgba(0, 0, 0, 0)',

  // Primary Accent - Safety Orange (main action color)
  safetyOrange: '#FF7500',
  accessibleSafetyOrange: '#F06E00', // For small text/icons on white

  // Alert/Accent Colors
  parisDaisy: '#F7EA48', // Yellow - warnings, highlights
  aquamarine: '#59F3FD', // Cyan - info accents
  elementalBlue: '#4C94FE', // Blue - info, links
  elementalRed: '#D80F21', // Red - alerts, errors, critical

  // Gold tones
  darkGold: '#866D4B',
  lightGold: '#D3BC8D',

  // System Status Colors
  error: '#DE2D21', // System error red
  info: '#1EBBE5', // Info blue
  success: '#00E676', // Success green

  // Grey Scale (dark to light)
  ironGrey: '#53565A',
  stormGrey: '#75787B',
  greyChateau: '#97999B',
  agatheGrey: '#B1B3B3',
  greyNurse: '#C8C9C7',
  greyWhite: '#D9D9D6',
  signalWhite: '#ECECE7',
  lightGrey: '#F0F0F0',
} as const;

// Semantic Color Mapping for UI Components
export const SemanticColors = {
  // Primary Actions
  active: PolestarColors.safetyOrange,
  activeAccessible: PolestarColors.accessibleSafetyOrange,

  // Status Colors
  alert: PolestarColors.elementalRed,
  error: PolestarColors.error,
  warning: PolestarColors.parisDaisy,
  success: PolestarColors.success,
  info: PolestarColors.info,

  // Service Status
  serviceUrgent: PolestarColors.elementalRed,
  serviceSoon: PolestarColors.safetyOrange,
  serviceOk: PolestarColors.success,

  // Battery Status
  batteryLow: PolestarColors.elementalRed,
  batteryMedium: PolestarColors.safetyOrange,
  batteryGood: PolestarColors.success,

  // General States
  disabled: PolestarColors.greyChateau,
  inactive: PolestarColors.stormGrey,

  // Text (Light Mode)
  textPrimaryLight: PolestarColors.black,
  textSecondaryLight: PolestarColors.ironGrey,
  textDisabledLight: PolestarColors.greyChateau,

  // Text (Dark Mode)
  textPrimaryDark: PolestarColors.white,
  textSecondaryDark: PolestarColors.greyNurse,
  textDisabledDark: PolestarColors.stormGrey,

  // Backgrounds
  backgroundLight: PolestarColors.white,
  surfaceLight: PolestarColors.signalWhite,
  backgroundDark: PolestarColors.black,
  surfaceDark: PolestarColors.ironGrey,
} as const;

// Mantine color palette mapping
// These are the 10-shade color arrays Mantine expects
export const MantineColors = {
  // Polestar Safety Orange (Primary)
  polestarOrange: [
    '#FFF3E6', // 0 - lightest
    '#FFE0C2', // 1
    '#FFCC99', // 2
    '#FFB366', // 3
    '#FF9933', // 4
    '#FF7500', // 5 - Safety Orange (main)
    '#F06E00', // 6 - Accessible Safety Orange
    '#CC5C00', // 7
    '#994500', // 8
    '#662E00', // 9 - darkest
  ],

  // Polestar Red (Alerts)
  polestarRed: [
    '#FFE6E8', // 0
    '#FFBFC4', // 1
    '#FF9199', // 2
    '#FF636F', // 3
    '#FF3545', // 4
    '#D80F21', // 5 - Elemental Red (main)
    '#DE2D21', // 6 - System Error
    '#B80D1B', // 7
    '#8A0A14', // 8
    '#5C070E', // 9
  ],

  // Polestar Grey (Secondary)
  polestarGrey: [
    '#F0F0F0', // 0 - Light Grey
    '#ECECE7', // 1 - Signal White
    '#D9D9D6', // 2 - Grey White
    '#C8C9C7', // 3 - Grey Nurse
    '#B1B3B3', // 4 - Agathe Grey
    '#97999B', // 5 - Grey Chateau
    '#75787B', // 6 - Storm Grey
    '#53565A', // 7 - Iron Grey
    '#3A3C3F', // 8
    '#1A1B1E', // 9
  ],

  // Success Green
  polestarGreen: [
    '#E6FFF0',
    '#B3FFD6',
    '#80FFBB',
    '#4DFFA1',
    '#1AFF86',
    '#00E676', // 5 - Success Green (main)
    '#00CC69',
    '#00B35C',
    '#00994F',
    '#008042',
  ],

  // Info/Aqua
  polestarCyan: [
    '#E6FEFF',
    '#B3FCFF',
    '#80FAFF',
    '#59F3FD', // 3 - Aquamarine
    '#33F0FF',
    '#1EBBE5', // 5 - Info Blue (main)
    '#17A2CC',
    '#1189B3',
    '#0B7099',
    '#055780',
  ],

  // Paris Daisy / Warning Yellow
  polestarYellow: [
    '#FFFDE6',
    '#FFFAB3',
    '#FFF780',
    '#FFF34D',
    '#FFEF1A',
    '#F7EA48', // 5 - Paris Daisy (main)
    '#DED140',
    '#C5B838',
    '#AC9F30',
    '#938628',
  ],
} as const;

export type PolestarColorKey = keyof typeof PolestarColors;
export type SemanticColorKey = keyof typeof SemanticColors;
