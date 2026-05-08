import { createHashRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { NotFoundPage } from './NotFoundPage';
import { AuthCallbackPage } from '../features/auth/AuthCallbackPage';
import { HomePage } from '../features/home/HomePage';
import { LoginPage } from '../features/auth/LoginPage';
import { StorePage } from '../features/store/StorePage';
import { OrdersPage } from '../features/orders/OrdersPage';
import { AdminProductsPage } from '../features/admin/AdminProductsPage';
import { AdminProductFormPage } from '../features/admin/AdminProductFormPage';
import { AdminBundlesPage } from '../features/admin/AdminBundlesPage';
import { AdminBundleFormPage } from '../features/admin/AdminBundleFormPage';

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
        path: 'admin/products',
        element: <AdminProductsPage />
      },
      {
        path: 'admin/products/new',
        element: <AdminProductFormPage />
      },
      {
        path: 'admin/products/:id/edit',
        element: <AdminProductFormPage />
      },
      {
        path: 'admin/bundles',
        element: <AdminBundlesPage />
      },
      {
        path: 'admin/bundles/new',
        element: <AdminBundleFormPage />
      },
      {
        path: 'admin/bundles/:productId/edit',
        element: <AdminBundleFormPage />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);
