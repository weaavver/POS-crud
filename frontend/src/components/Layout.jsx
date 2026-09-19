import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#1b2838] text-[#c7d5e0]">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}