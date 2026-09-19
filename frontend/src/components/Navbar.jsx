import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingCart, Menu, X, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { items } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = ['NEW RELEASES', 'GAMES', 'ABOUT'];

  // Logged in -> order history, logged out -> login page
  const userLink = user ? '/orders' : '/login';

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className={'sticky top-0 z-50 transition-shadow duration-200 bg-[#171a21] ' + (isScrolled ? 'shadow-lg shadow-black/40' : '')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-bold tracking-tight text-[#66c0f4]">
              VAULT
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link} href="#" className="text-sm font-medium tracking-wide text-[#c7d5e0] hover:text-white transition-colors">
                {link}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-5">
            <button className="text-[#c7d5e0] hover:text-white transition-colors">
              <Search size={20} />
            </button>
            <Link to={userLink} title={user ? 'My orders' : 'Log in'} className="text-[#c7d5e0] hover:text-white transition-colors">
              <User size={20} />
            </Link>
            <Link to="/cart" className="text-[#c7d5e0] hover:text-white transition-colors relative">
              <ShoppingCart size={20} />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#66c0f4] text-[#171a21] text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
            {user && (
              <button onClick={handleLogout} title="Log out" className="text-[#c7d5e0] hover:text-white transition-colors">
                <LogOut size={20} />
              </button>
            )}
          </div>

          <button className="md:hidden text-[#c7d5e0]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#171a21] border-t border-[#2a3f5a] px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <a key={link} href="#" className="block text-sm font-medium text-[#c7d5e0] hover:text-white">
              {link}
            </a>
          ))}
          <div className="flex items-center gap-5 pt-3 border-t border-[#2a3f5a]">
            <Search size={20} className="text-[#c7d5e0]" />
            <Link to={userLink} onClick={() => setMobileMenuOpen(false)}>
              <User size={20} className="text-[#c7d5e0]" />
            </Link>
            <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>
              <ShoppingCart size={20} className="text-[#c7d5e0]" />
            </Link>
            {user && (
              <button onClick={handleLogout} title="Log out">
                <LogOut size={20} className="text-[#c7d5e0]" />
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
