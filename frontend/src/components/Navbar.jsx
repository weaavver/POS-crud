import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
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

  const navLinks = [
    { label: 'SHOP', to: '/' },
    { label: 'NEW RELEASES', to: '/new-releases' },
    { label: 'ABOUT', to: '/about' },
  ];

  const navLinkClass = ({ isActive }) =>
    'text-sm font-medium tracking-wide pb-1 border-b-2 transition-colors ' +
    (isActive
      ? 'text-white border-[#66c0f4]'
      : 'text-[#c7d5e0] border-transparent hover:text-white');

  // Logged in -> order history, logged out -> login page
  const userLink = user ? '/orders' : '/login';

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className={'sticky top-0 z-50 transition-shadow duration-300 ease-out bg-[#171a21] ' + (isScrolled ? 'shadow-lg shadow-black/40' : '')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-bold tracking-tight text-[#66c0f4]">
              VAULT
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === '/'} className={navLinkClass}>
                {link.label}
              </NavLink>
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
                <span
                  key={items.length}
                  className="absolute -top-2 -right-2 bg-[#66c0f4] text-[#171a21] text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center pop-once"
                >
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

          <button
            className="md:hidden text-[#c7d5e0] transition-transform active:scale-90"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className={'inline-block transition-transform duration-200 ' + (mobileMenuOpen ? 'rotate-90' : 'rotate-0')}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#171a21] border-t border-[#2a3f5a] px-4 py-4 space-y-3 slide-down">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                'block text-sm font-medium transition-colors ' +
                (isActive ? 'text-[#66c0f4]' : 'text-[#c7d5e0] hover:text-white')
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="flex items-center gap-5 pt-3 border-t border-[#2a3f5a]">
            <Search size={20} className="text-[#c7d5e0] transition-colors hover:text-white" />
            <Link to={userLink} onClick={() => setMobileMenuOpen(false)} className="transition-transform active:scale-90">
              <User size={20} className="text-[#c7d5e0] hover:text-white transition-colors" />
            </Link>
            <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="transition-transform active:scale-90">
              <ShoppingCart size={20} className="text-[#c7d5e0] hover:text-white transition-colors" />
            </Link>
            {user && (
              <button onClick={handleLogout} title="Log out" className="transition-transform active:scale-90">
                <LogOut size={20} className="text-[#c7d5e0] hover:text-white transition-colors" />
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}