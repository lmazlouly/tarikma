import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '../layouts/RootLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { DashboardPage } from '../../pages/dashboard/DashboardPage'
import { AdminPage } from '../../pages/admin/AdminPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        lazy: async () => {
          const m = await import('../../pages/home/HomePage')
          return { Component: m.HomePage }
        },
      },
      {
        path: 'login',
        lazy: async () => {
          const m = await import('../../pages/auth/LoginPage')
          return { Component: m.LoginPage }
        },
      },
      {
        path: 'register',
        lazy: async () => {
          const m = await import('../../pages/auth/RegisterPage')
          return { Component: m.RegisterPage }
        },
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute requireRole="ADMIN">
            <AdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        lazy: async () => {
          const m = await import('../../pages/not-found/NotFoundPage')
          return { Component: m.NotFoundPage }
        },
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
