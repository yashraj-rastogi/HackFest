import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { I18nProvider } from '../i18n';

export const App: React.FC = () => {
  return (
    <I18nProvider>
      <RouterProvider router={router} />
    </I18nProvider>
  );
};
