import React from 'react'
import ReactDOM from 'react-dom/client'
import Layout from './pages/Layout.tsx';
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Cond1 from './pages/Cond1.tsx';
import RevokedConsent from './pages/RevokedConsent.tsx';
import StateProvider from './StateProvider.tsx';
import { RedirectToCondition } from './components/RedirectToCondition.tsx';
import Completion from './pages/Completion.tsx';




const router = createBrowserRouter([
  {
    path: "/",
    element: <RedirectToCondition />
  },
  {
    path: "/cond1",
    element: <Layout>
      <Cond1 />
    </Layout>
  },
  {
    path: "/revoked-consent",
    element: <RevokedConsent />
  },
  {
    path: "/completion",
    element: <Completion />
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StateProvider>
    <RouterProvider router={router} />
    </StateProvider>
  </React.StrictMode>,
)
