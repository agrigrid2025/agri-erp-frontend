// src/components/RedirectOldPaths.jsx
import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';

const RedirectOldPaths = () => {
  const location = useLocation();

  // Redirect old root "/" (if someone lands there without /app) to the app entry
  if (location.pathname === '/' && location.search === '') {
    return <Navigate to="/app" replace />;
  }

  // Redirect old direct login links: /login/costawalkamin → /app/login/costawalkamin
  if (location.pathname.startsWith('/login/')) {
    return <Navigate to={`/app${location.pathname}${location.search}`} replace />;
  }

  // Redirect old direct dashboard links: /dashboard/costawalkamin → /app/dashboard/costawalkamin
  if (location.pathname.startsWith('/dashboard/')) {
    return <Navigate to={`/app${location.pathname}${location.search}`} replace />;
  }

  // No redirect needed
  return null;
};

export default RedirectOldPaths;