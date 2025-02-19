import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { App } from './App';
import Loading from './components/common/Loading';
import { persistor, store } from './store';
import { SeverityLevel } from './types/severity';
import { errorLogger } from './utils/error/errorLogger';

// 初始化应用
async function initializeApp() {
  // 只在开发环境启动 MSW
  if (process.env.NODE_ENV === 'development') {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
    });
  }

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <Provider store={store}>
        <PersistGate loading={<Loading />} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </StrictMode>
  );
}

// 启动应用
initializeApp().catch(error => {
  errorLogger.log(error, {
    level: SeverityLevel.ERROR,
    context: { phase: 'initialization' }
  });
});
