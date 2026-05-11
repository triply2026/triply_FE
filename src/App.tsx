import { QueryClientProvider } from '@tanstack/react-query';
import {RouterProvider} from 'react-router-dom';
import { router } from '@routes/routers';
import queryClient from "@libs/query-client";

function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}/>
      </QueryClientProvider>
  );
}

export default App;
