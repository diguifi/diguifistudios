import { createBrowserRouter } from 'react-router-dom';
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
import { AdminGameNotionPlayersPage } from '../features/admin/AdminGameNotionPlayersPage';
import { AdminGameNotionPlayerFormPage } from '../features/admin/AdminGameNotionPlayerFormPage';
import { AdminNotificationsPage } from '../features/admin/AdminNotificationsPage';
import { AdminNotificationFormPage } from '../features/admin/AdminNotificationFormPage';
import { NotificationsPage } from '../features/notifications/NotificationsPage';
import { PrivacyPage } from '../features/legal/PrivacyPage';
import { GameDetailsPage } from '../features/home/GameDetailsPage';

export const router = createBrowserRouter([
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
        path: 'admin/game-notion-players',
        element: <AdminGameNotionPlayersPage />
      },
      {
        path: 'admin/game-notion-players/new',
        element: <AdminGameNotionPlayerFormPage />
      },
      {
        path: 'admin/game-notion-players/:playerId/edit',
        element: <AdminGameNotionPlayerFormPage />
      },
      {
        path: 'admin/notifications',
        element: <AdminNotificationsPage />
      },
      {
        path: 'admin/notifications/new',
        element: <AdminNotificationFormPage />
      },
      {
        path: 'admin/notifications/:id/edit',
        element: <AdminNotificationFormPage />
      },
      {
        path: 'notifications',
        element: <NotificationsPage />
      },
      {
        path: 'privacy',
        element: <PrivacyPage />
      },
      {
        path: 'games/:slug',
        element: <GameDetailsPage />
      },
      {
        path: 'tools/:slug',
        element: <GameDetailsPage />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);
