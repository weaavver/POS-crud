import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#1b2838] text-[#c7d5e0]">
      <Navbar />
      <main key={location.pathname} className="page-transition">
        {children}
      </main>
    </div>
  );
}
