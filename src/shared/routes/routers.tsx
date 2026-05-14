import RootLayout from '@layouts/root-layout';
import { LoginPage } from '@pages/auth/login-page';
import { SignupCompletePage } from '@pages/auth/signup-complete-page';
import { SignupPage } from '@pages/auth/signup-page';
import { LandingPage } from '@pages/landing/landing-page';
import AiLoading from '@pages/main/ai-loading';
import { TripEditPage } from '@pages/trip/trip-edit';
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'signup-complete', element: <SignupCompletePage /> },
      { path: 'ai-loading', element: <AiLoading /> },
      { path: 'trip/:id', element: <TripEditPage /> },
    ],
  },
]);
