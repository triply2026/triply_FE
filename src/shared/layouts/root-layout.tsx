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
