import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { createAppRouter } from './app/router.tsx';

export function App() {
  const [router] = useState(createAppRouter);
  return <RouterProvider router={router} />;
}
