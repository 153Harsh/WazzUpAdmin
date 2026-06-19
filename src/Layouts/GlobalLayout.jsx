import Sidebar from '../components/Sidebar/Sidebar';
import { Outlet } from 'react-router-dom';
 
export default function GlobalLayout({ children }) {
 
  return (
    <div className="h-dvh flex bg-white font-sans overflow-hidden">
  <Sidebar />

  <main className="flex-1 overflow-hidden ml-[60px]">
    <Outlet />
  </main>
</div>
  );
}