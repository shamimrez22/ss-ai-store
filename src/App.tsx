/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { AdminPanel } from './components/AdminPanel';
import { Storefront } from './components/Storefront';
import { ToastContainer } from './components/Toast';

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      setIsAdminRoute(hash.startsWith('#/admin'));
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // initial check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <AppProvider>
      <div className={`min-h-screen font-sans antialiased selection:bg-red-500 selection:text-white ${isAdminRoute ? 'bg-zinc-50 text-zinc-900' : 'bg-black text-white'}`}>
        {isAdminRoute ? <AdminPanel /> : <Storefront />}
        <ToastContainer />
      </div>
    </AppProvider>
  );
}

