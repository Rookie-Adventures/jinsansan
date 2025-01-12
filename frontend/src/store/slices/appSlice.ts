import { AlertColor } from '@mui/material';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export interface AppState {
  darkMode: boolean;
  loading: boolean;
  toast: ToastState;
}

const initialState: AppState = {
  darkMode: false,
  loading: false,
  toast: {
    open: false,
    message: '',
    severity: 'info',
  },
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    showToast: (state, action: PayloadAction<Omit<ToastState, 'open'>>) => {
      state.toast = {
        ...action.payload,
        open: true,
      };
    },
    hideToast: (state) => {
      state.toast.open = false;
    },
  },
});

export const { toggleDarkMode, setLoading, showToast, hideToast } = appSlice.actions;
export default appSlice.reducer; 