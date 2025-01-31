import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { HttpError } from '@/utils/http/error/types';

interface ErrorState {
  current: HttpError | null;
}

const initialState: ErrorState = {
  current: null,
};

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    setError: (state, action: PayloadAction<HttpError>) => {
      state.current = action.payload;
    },
    clearError: state => {
      state.current = null;
    },
  },
});

export const { setError, clearError } = errorSlice.actions;
export default errorSlice.reducer;
