import { Outlet } from 'react-router-dom';
import { useUIStore } from '@stores/ui-store';
import { ToastContainer } from 'react-toastify';
import Sidebar from '@layouts/sidebar';
import { LoginRequiredModal } from '@components/landing/login-required-modal';

const RootLayout = () => {
  const { isSidebarOpen, closeSidebar, isLoginRequiredModalOpen, loginRequiredMessage, closeLoginRequiredModal } = useUIStore();

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

      {/* 사이드바 슬라이드 */}
      <div
        className={`fixed left-0 top-0 z-50 h-full transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      <ToastContainer />

      {isLoginRequiredModalOpen && (
        <LoginRequiredModal onClose={closeLoginRequiredModal} message={loginRequiredMessage} />
      )}
    </div>
  );
};

export default RootLayout;
