import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '../layouts/RootLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { GuestRoute } from './GuestRoute'

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
        lazy: async () => {
          const m = await import('../../pages/dashboard/DashboardPage')
          return {
            Component: () => (
              <ProtectedRoute>
                <m.DashboardPage />
              </ProtectedRoute>
            ),
          }
        },
      },
      {
        path: 'plan',
        lazy: async () => {
          const m = await import('../../pages/plan/PlanningPage')
          return { Component: m.PlanningPage }
        },
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
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireRole="ADMIN">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        lazy: async () => {
          const m = await import('../../pages/admin/AdminOverviewPage')
          return { Component: m.AdminOverviewPage }
        },
      },
      {
        path: 'users',
        lazy: async () => {
          const m = await import('../../pages/admin/AdminUsersPage')
          return { Component: m.AdminUsersPage }
        },
      },
      {
        path: 'companies',
        lazy: async () => {
          const m = await import('../../pages/admin/AdminCompaniesPage')
          return { Component: m.AdminCompaniesPage }
        },
      },
      {
        path: 'company-members',
        lazy: async () => {
          const m = await import('../../pages/admin/AdminCompanyMembersPage')
          return { Component: m.AdminCompanyMembersPage }
        },
      },
      {
        path: 'guides',
        lazy: async () => {
          const m = await import('../../pages/admin/AdminGuidesPage')
          return { Component: m.AdminGuidesPage }
        },
      },
      {
        path: 'roles',
        lazy: async () => {
          const m = await import('../../pages/admin/AdminRolesPage')
          return { Component: m.AdminRolesPage }
        },
      },
      {
        path: 'cities',
        lazy: async () => {
          const m = await import('../../pages/admin/AdminCitiesPage')
          return { Component: m.AdminCitiesPage }
        },
      },
      {
        path: 'places',
        lazy: async () => {
          const m = await import('../../pages/admin/AdminPlacesPage')
          return { Component: m.AdminPlacesPage }
        },
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
