import type { GlobalThemeOverrides } from 'naive-ui';

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#005eeb',
    primaryColorHover: '#196eed',
    primaryColorPressed: '#005eeb',
    primaryColorSuppl: '#196eed',
  },
  Menu: {
    itemHeight: '32px',
  },

  Layout: { color: '#f1f5f9' },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px' },
    },
  },
};

export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#3d8eff',
    primaryColorHover: '#63a4ff',
    primaryColorPressed: '#196eed',
    primaryColorSuppl: '#63a4ff',
  },

  Notification: {
    color: '#333333',
  },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px', color: '#1e1e1e' },
    },
  },

  Menu: {
    itemHeight: '32px',
  },

  Layout: {
    color: '#242633',
    siderColor: '#2f313d',
    siderBorderColor: 'transparent',
  },

  Card: {
    color: '#2f313d',
    borderColor: '#434552',
  },

  Table: {
    tdColor: '#232323',
    thColor: '#353535',
  },

  List: {
    color: '#2f313d',
  },
};
