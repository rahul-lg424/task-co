import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

// App shell every page renders inside: full-height gray page background and a
// max-width centered content container. Accepts children, or falls back to the
// router <Outlet /> when used as a layout route.
export const Layout = ({ children }: { children?: ReactNode }) => (
  <div className="min-h-screen bg-gray-50">
    <div className="mx-auto max-w-5xl px-4 py-8">{children ?? <Outlet />}</div>
  </div>
);
