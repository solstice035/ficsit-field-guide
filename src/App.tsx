import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { createAppRouter } from './app/router.tsx';
import { startCrossWindowSync } from './state/sync.ts';

export function App() {
  const [router] = useState(createAppRouter);
  useEffect(() => startCrossWindowSync(), []);
  return <RouterProvider router={router} />;
}
