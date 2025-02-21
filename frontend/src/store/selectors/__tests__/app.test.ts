import type { RootState } from '../../types';
import type { AlertColor } from '@mui/material';

import {
  selectApp,
  selectDarkMode,
  selectAppLoading,
  selectToast,
  selectIsToastVisible,
  selectToastMessage,
} from '../app';

describe('App Selectors', () => {
  const mockToast = {
    open: true,
    message: 'Test message',
    severity: 'success' as AlertColor,
  };

  const mockState: RootState = {
    app: {
      darkMode: true,
      loading: true,
      toast: mockToast,
    },
    auth: {
      user: null,
      token: null,
      loading: false,
      error: null,
    },
  };

  describe('selectApp', () => {
    it('should select the app state', () => {
      expect(selectApp(mockState)).toBe(mockState.app);
    });
  });

  describe('selectDarkMode', () => {
    it('should select darkMode value', () => {
      expect(selectDarkMode(mockState)).toBe(true);
    });

    it('should select darkMode as false when not set', () => {
      const state = {
        ...mockState,
        app: { ...mockState.app, darkMode: false },
      };
      expect(selectDarkMode(state)).toBe(false);
    });
  });

  describe('selectAppLoading', () => {
    it('should select loading value', () => {
      expect(selectAppLoading(mockState)).toBe(true);
    });

    it('should select loading as false when not set', () => {
      const state = {
        ...mockState,
        app: { ...mockState.app, loading: false },
      };
      expect(selectAppLoading(state)).toBe(false);
    });
  });

  describe('selectToast', () => {
    it('should select the entire toast state', () => {
      expect(selectToast(mockState)).toEqual(mockToast);
    });

    it('should handle empty toast state', () => {
      const emptyToast = {
        open: false,
        message: '',
        severity: 'info' as AlertColor,
      };
      const state = {
        ...mockState,
        app: { ...mockState.app, toast: emptyToast },
      };
      expect(selectToast(state)).toEqual(emptyToast);
    });
  });

  describe('selectIsToastVisible', () => {
    it('should select toast visibility when visible', () => {
      expect(selectIsToastVisible(mockState)).toBe(true);
    });

    it('should select toast visibility when hidden', () => {
      const state = {
        ...mockState,
        app: {
          ...mockState.app,
          toast: { ...mockToast, open: false },
        },
      };
      expect(selectIsToastVisible(state)).toBe(false);
    });
  });

  describe('selectToastMessage', () => {
    it('should select toast message and severity', () => {
      expect(selectToastMessage(mockState)).toEqual({
        message: 'Test message',
        severity: 'success',
      });
    });

    it('should handle empty toast message', () => {
      const state = {
        ...mockState,
        app: {
          ...mockState.app,
          toast: {
            open: false,
            message: '',
            severity: 'info' as AlertColor,
          },
        },
      };
      expect(selectToastMessage(state)).toEqual({
        message: '',
        severity: 'info',
      });
    });

    it('should handle different toast severities', () => {
      const severities: AlertColor[] = ['success', 'error', 'warning', 'info'];
      severities.forEach(severity => {
        const state = {
          ...mockState,
          app: {
            ...mockState.app,
            toast: {
              ...mockToast,
              severity,
            },
          },
        };
        expect(selectToastMessage(state)).toEqual({
          message: 'Test message',
          severity,
        });
      });
    });
  });
}); 