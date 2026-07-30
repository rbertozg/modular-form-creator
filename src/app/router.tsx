import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import {
  LazyBasicInfoPage,
  LazyNotFoundPage,
  LazyProjectDetailsPage,
  LazyResourceDetailsPage,
  LazyResourceOverviewPage,
  LazyResourcesPage,
} from './LazyResourcePages'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/resources" replace /> },
      { path: 'resources', element: <LazyResourcesPage /> },
      {
        path: 'resources/:resourceId',
        element: <LazyResourceOverviewPage />,
      },
      {
        path: 'resources/:resourceId/details',
        element: <LazyResourceDetailsPage />,
      },
      {
        path: 'resources/:resourceId/basic-info',
        element: <LazyBasicInfoPage />,
      },
      {
        path: 'resources/:resourceId/project-details',
        element: <LazyProjectDetailsPage />,
      },
      { path: '*', element: <LazyNotFoundPage /> },
    ],
  },
])
