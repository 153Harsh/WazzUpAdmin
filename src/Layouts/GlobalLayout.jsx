import Sidebar from '../components/Sidebar/Sidebar';
import { Outlet } from 'react-router-dom';
 
export default function GlobalLayout({ children }) {
 
  return (
    <div className="h-[100dvh] bg-[#ece5dd] font-sans">
      <Sidebar/>
      <main className="ml-[4dvw] w-[96dvw]"><Outlet /></main>
    </div>
  );
}