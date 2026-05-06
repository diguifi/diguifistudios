import { createHashRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { NotFoundPage } from './NotFoundPage';
import { AuthCallbackPage } from '../features/auth/AuthCallbackPage';
import { HomePage } from '../features/home/HomePage';
import { LoginPage } from '../features/auth/LoginPage';
import { StorePage } from '../features/store/StorePage';
import { OrdersPage } from '../features/orders/OrdersPage';

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'auth/callback',
        element: <AuthCallbackPage />
      },
      {
        path: 'store',
        element: <StorePage />
      },
      {
        path: 'orders',
        element: <OrdersPage />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);
