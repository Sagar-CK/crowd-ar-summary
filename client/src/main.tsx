import React from 'react'
import ReactDOM from 'react-dom/client'
import Layout from './pages/Layout.tsx';
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Cond1 from './pages/Cond1.tsx';
import Cond2 from './pages/Cond2.tsx';
import Cond3 from './pages/Cond3.tsx';
import RevokedConsent from './pages/RevokedConsent.tsx';
import { RedirectToCondition } from './components/RedirectToCondition.tsx';
import Completion from './pages/Completion.tsx';
import { QueryClient, QueryClientProvider} from '@tanstack/react-query';
import InvalidParticipant from './pages/InvalidParticipant.tsx';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <RedirectToCondition />
  },
  {
    path: "/cond1",
    element: <Layout condition={1}>
      <Cond1 />
    </Layout>
  },
  {
    path: "/cond2",
    element: <Layout condition={2}>
      <Cond2 />
    </Layout>
  },
  {
    path: "/cond3",
    element: <Layout condition={3}>
      <Cond3 />
    </Layout>
  },
  {
    path: "/revoked-consent",
    element: <RevokedConsent />
  },
  {
    path: "/invalid-participant",
    element: <InvalidParticipant />
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
