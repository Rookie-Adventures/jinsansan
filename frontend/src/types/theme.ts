export type ThemeMode = 'light' | 'dark';

export interface ThemeCustomizations {
  primaryColor: string;
}

export interface ThemeState {
  mode: ThemeMode;
  customizations: ThemeCustomizations;
} 