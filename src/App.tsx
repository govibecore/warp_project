import { WarpSessionProvider } from './context/WarpSessionContext';
import { AdminApp } from './components/admin/AdminApp';
import { WarpApplication } from './WarpApplication';

const isAdminRoute = window.location.pathname.startsWith('/admin');

export default function App() {
  if (isAdminRoute) {
    return <AdminApp />;
  }

  return <WarpSessionProvider><WarpApplication /></WarpSessionProvider>;
}
