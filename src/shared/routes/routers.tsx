import RootLayout from '@layouts/root-layout';
import { LoginPage } from '@pages/auth/login-page';
import { SignupCompletePage } from '@pages/auth/signup-complete-page';
import { SignupPage } from '@pages/auth/signup-page';
import { LandingPage } from '@pages/landing/landing-page';
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'signup-complete', element: <SignupCompletePage /> },
    ],
  },
]);
