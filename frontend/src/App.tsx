import { RouterProvider } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import ErrorBoundary from '@/components/ErrorBoundary';
import { ErrorNotification } from '@/components/ErrorNotification';
import { router } from '@/router';
import { clearError } from '@/store/slices/error';
import type { RootState } from '@/store';

export const App = () => {
  const error = useSelector((state: RootState) => state.error.current);
  const dispatch = useDispatch();

  const handleErrorClose = () => {
    dispatch(clearError());
  };

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <ErrorNotification error={error} onClose={handleErrorClose} />
    </ErrorBoundary>
  );
};
