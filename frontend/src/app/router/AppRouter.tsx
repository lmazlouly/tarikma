import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '../layouts/RootLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { GuestRoute } from './GuestRoute'
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
          const Page = m.LoginPage
          return {
            Component: () => (
              <GuestRoute>
                <Page />
              </GuestRoute>
            ),
          }
        },
      },
      {
        path: 'register',
        lazy: async () => {
          const m = await import('../../pages/auth/RegisterPage')
          const Page = m.RegisterPage
          return {
            Component: () => (
              <GuestRoute>
                <Page />
              </GuestRoute>
            ),
          }
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
