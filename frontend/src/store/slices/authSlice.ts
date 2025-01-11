import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { authApi, type LoginResponse } from '@/services/auth';
import type { LoginFormData } from '@/types/auth';

export interface AuthState {
  user: LoginResponse['user'] | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  [key: string]: unknown;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (data: LoginFormData) => {
    const response = await authApi.login(data);
    localStorage.setItem('token', response.token);
    return response;
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async () => {
    return await authApi.getCurrentUser();
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authApi.logout();
    localStorage.removeItem('token');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Get Current User
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 