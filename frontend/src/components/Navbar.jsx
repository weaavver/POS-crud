import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingCart, LogOut, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const navLinks = [
  { label: 'SHOP', path: '/' },
  { label: 'NEW RELEASES', path: '/new-releases' },
  { label: 'ABOUT', path: '/about' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });
  const linkRefs = useRef([]);
  const { count } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useLayoutEffect(() => {
    const activeIdx = navLinks.findIndex((l) => l.path === location.pathname);
    const el = linkRefs.current[activeIdx];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
    } else {
      setIndicator((prev) => ({ ...prev, width: 0 }));
    }
  }, [location.pathname]);

  return (
    <nav className={'sticky top-0 z-50 transition-shadow duration-200 bg-[#171a21] ' + (isScrolled ? 'shadow-lg shadow-black/40' : '')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="Vault logo" className="w-8 h-8" />
            <span className="text-2xl font-bold tracking-tight text-white">
              VAULT
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 relative">
            {navLinks.map((link, idx) => (
              <Link
                key={link.path}
                to={link.path}
                ref={(el) => (linkRefs.current[idx] = el)}
                className="text-sm font-medium tracking-wide text-[#c7d5e0] hover:text-white transition-colors py-1"
              >
                {link.label}
              </Link>
            ))}
            <span
              className={
                'absolute -bottom-[1px] h-[2px] bg-[#66c0f4] transition-all duration-300 ease-out ' +
                (indicator.ready ? 'opacity-100' : 'opacity-0')
              }
              style={{ left: indicator.left, width: indicator.width }}
            />
          </div>

          <div className="hidden md:flex items-center gap-5">
            <button className="text-[#c7d5e0] hover:text-white transition-colors">
              <Search size={20} />
            </button>
            <Link to="/orders" className="text-[#c7d5e0] hover:text-white transition-colors">
              <User size={20} />
            </Link>
            <Link to="/cart" className="text-[#c7d5e0] hover:text-white transition-colors relative">
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#66c0f4] text-[#171a21] text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            {user && (
              <button
                onClick={handleLogout}
                title="Sign out"
                aria-label="Sign out"
                className="text-[#c7d5e0] hover:text-white transition-colors"
              >
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
            <Link key={link.path} to={link.path} className="block text-sm font-medium text-[#c7d5e0] hover:text-white">
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-5 pt-3 border-t border-[#2a3f5a]">
            <Search size={20} className="text-[#c7d5e0]" />
            <Link to="/orders">
              <User size={20} className="text-[#c7d5e0]" />
            </Link>
            <Link to="/cart">
              <ShoppingCart size={20} className="text-[#c7d5e0]" />
            </Link>
            {user && (
              <button onClick={handleLogout} aria-label="Sign out">
                <LogOut size={20} className="text-[#c7d5e0]" />
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}