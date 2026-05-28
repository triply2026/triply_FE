import { useUIStore } from '@stores/ui-store';
import { ToastContainer } from 'react-toastify';
import Sidebar from '@layouts/sidebar';
import { Outlet } from 'react-router-dom';

const RootLayout = () => {
  const { isSidebarOpen, closeSidebar } = useUIStore();

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
      {isSidebarOpen && (
        <div className="absolute top-0 left-0 z-50 h-full">
          <Sidebar />
        </div>
      )}
      <ToastContainer
        position="top-right"
        style={{
          top: 'calc(var(--header-height) + 12px)',
          right: '24px',
        }}
      />
    </div>
  );
};

export default RootLayout;
