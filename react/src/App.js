import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ListingDetails from './pages/ListingDetails';
import Profile from './pages/Profile';
import AddListing from './pages/AddListing';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Auth from './pages/Auth';

const EXPOSED_ROUTES = ['/', '/catalog', '/listing/:id', '/profile', '/add', '/login', '*'];

if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
  window.handleRoutes(EXPOSED_ROUTES);
}

const RootLayout = () => {
  return (
    <div data-easytag="id1-react/src/App.js" className="min-h-screen flex flex-col">
      <Header />
      <main data-easytag="id2-react/src/App.js" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'catalog', element: <Catalog /> },
      { path: 'listing/:id', element: <ListingDetails /> },
      { path: 'profile', element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ) },
      { path: 'add', element: (
          <ProtectedRoute>
            <AddListing />
          </ProtectedRoute>
        ) },
      { path: 'login', element: <Auth /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

function App() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      window.handleRoutes(EXPOSED_ROUTES);
    }
  }, []);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
