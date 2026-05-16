import { Outlet } from 'react-router-dom';
import {useUIStore} from '@stores/ui-store';
import Sidebar from '@layouts/sidebar';


const RootLayout = () => {
  const {isSidebarOpen, closeSidebar} = useUIStore();

  return (
    <div className="relative">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
      <Outlet />
      {isSidebarOpen && <div className="absolute top-0 left-0 z-50 h-full">
        <Sidebar />
      </div>}
    </div>
  );
};

export default RootLayout;
