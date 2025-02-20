import { type FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/auth';

/**
 * 高阶组件：处理认证页面的重定向逻辑
 * @param WrappedComponent 被包装的组件
 * @returns 包装后的组件
 */
export const withAuthRedirect = <P extends object>(WrappedComponent: FC<P>): FC<P> => {
  const WithAuthRedirect: FC<P> = (props: P) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
      if (isAuthenticated) {
        navigate('/');
      }
    }, [isAuthenticated, navigate]);

    return <WrappedComponent {...props} />;
  };

  WithAuthRedirect.displayName = `WithAuthRedirect(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthRedirect;
}; 