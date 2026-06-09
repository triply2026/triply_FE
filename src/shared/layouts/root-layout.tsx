import { useUIStore } from '@stores/ui-store';
import { ToastContainer } from 'react-toastify';
import Sidebar from '@layouts/sidebar';
import { Outlet } from 'react-router-dom';

const RootLayout = () => {
  const { isSidebarOpen, closeSidebar } = useUIStore();

  return (
    <div className="relative">
      {/* 딤 오버레이 */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ${
          isSidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <Outlet />
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!isSidebarOpen}
      >
        <Sidebar />
      </div>
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
