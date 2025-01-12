import { create } from 'zustand';

interface GlobalProgressState {
  loading: boolean;
  progress: number | null;
  setLoading: (loading: boolean) => void;
  setProgress: (progress: number | null) => void;
  reset: () => void;
}

export const useGlobalProgress = create<GlobalProgressState>((set) => ({
  loading: false,
  progress: null,
  setLoading: (loading) => set({ loading }),
  setProgress: (progress) => set({ progress }),
  reset: () => set({ loading: false, progress: null })
})); 