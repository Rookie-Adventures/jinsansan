import type { NavigateFunction } from 'react-router-dom';

export interface ReactRouterModule {
  useNavigate: () => NavigateFunction;
  [key: string]: unknown;
} 