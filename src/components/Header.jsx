import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  Home as HomeIcon, Info, Users, MapPin, Sparkles,
  Accessibility as AccessibilityIcon, HelpCircle, Mic, Calendar,
  Compass, Handshake, Camera, Globe,
  Ticket, ChevronDown, Menu, X, Library, User, LogOut, LayoutDashboard, Scale
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { IIMTMark, TEDxIIMTWordmark } from './IIMTSignature';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = typeof user?.role === 'string' && user.role.toLowerCase() === 'admin';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navRef = useRef(null);
  const mobileToggleRef = useRef(null);
  const previousMenuOpenRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keep the mobile drawer predictable for keyboard and touch users.
  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusFirstItem = () => {
      const firstItem = document.querySelector(
        '#mobile-navigation a[href], #mobile-navigation button:not([disabled])'
      );
      firstItem?.focus({ preventScroll: true });
    };

    const handleMenuKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsMenuOpen(false);
        return;
      }

      if (event.key !== 'Tab') return;

      const menu = document.getElementById('mobile-navigation');
      const focusable = menu?.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!menu || !focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const focusIsOutside = !menu.contains(document.activeElement);

      if (event.shiftKey && (document.activeElement === first || focusIsOutside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || focusIsOutside)) {
        event.preventDefault();
        first.focus();
      }
    };

    window.requestAnimationFrame(focusFirstItem);
    window.addEventListener('keydown', handleMenuKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleMenuKeyDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (previousMenuOpenRef.current && !isMenuOpen) {
      mobileToggleRef.current?.focus({ preventScroll: true });
    }
    previousMenuOpenRef.current = isMenuOpen;
  }, [isMenuOpen]);

  const getPortalPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/portal/admin';
      case 'lead': return '/portal/lead';
      case 'volunteer': return '/portal/volunteer';
      case 'speaker': return '/portal/speaker';
      case 'attendee': return '/portal/attendee';
      default: return '/portal/attendee';
    }
  };

  const navigationItems = [
    { label: 'Home', href: '/' },
    {
      label: 'About',
      href: '/about',
      submenu: [
        { label: 'About TEDx', href: '/about', desc: 'Our mission & TED philosophy', Icon: Info },
        { label: 'Organizing Team', href: '/team', desc: 'Meet the curators and team', Icon: Users },
        { label: 'Venue & Directions', href: '/venue', desc: <>Seminar Hall, <IIMTMark /> Meerut</>, Icon: MapPin },
        { label: 'What to Expect', href: '/what-to-expect', desc: 'Attendee guide & experience', Icon: Sparkles },
        { label: 'Accessibility', href: '/accessibility', desc: 'Inclusive accommodations', Icon: AccessibilityIcon },
        { label: 'Code of Conduct', href: '/code-of-conduct', desc: 'Community safety & event rules', Icon: Scale },
        { label: 'FAQ', href: '/faq', desc: 'Frequently asked questions', Icon: HelpCircle },
      ]
    },
    {
      label: 'Event',
      href: '/schedule',
      submenu: [
        ...(isAdmin ? [{ label: 'Schedule / ROS', href: '/schedule', desc: 'Admin agenda & Backstage cues', Icon: Calendar }] : []),
        { label: 'Interactive Activities', href: '/activities', desc: 'Workshops & ideation zones', Icon: Compass },
        { label: 'Sponsors & Partners', href: '/partners', desc: 'Supporters & university partners', Icon: Handshake },
      ]
    },
    { label: 'Speakers', href: '/speakers' },
    { label: 'Archive', href: '/library' },
    { label: 'Team', href: '/team' },
    {
      label: 'Media',
      href: '/gallery',
      submenu: [
        { label: 'Photo Gallery', href: '/gallery', desc: 'High-res event moments', Icon: Camera },
      ]
    },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header data-scrolled={isScrolled ? 'true' : 'false'} className={`ted-site-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/95 backdrop-blur-2xl border-b border-[#EB0028]/20 shadow-[0_12px_36px_rgba(0,0,0,0.34)] py-2.5' : 'bg-black/55 backdrop-blur-lg border-b border-[#651125]/45 py-3.5'
    }`}>
      <div className="mx-auto flex w-[92%] max-w-[1780px] items-center justify-between gap-5">
        
        {/* Logo Lockup */}
        <a href="/" aria-label="TEDxIIMT University home" className="group flex shrink-0 flex-col items-start gap-1 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-[#EB0028]">
          <TEDxIIMTWordmark subline="UNIVERSITY" stacked fontSize="clamp(1.45rem, 2vw, 1.7rem)" style={{ color: "#fff", minHeight: "48px" }} />
        </a>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1" ref={navRef}>
          {navigationItems.map((item, idx) => (
            <div
              key={idx}
              className="relative"
              onMouseEnter={() => item.submenu && setActiveDropdown(idx)}
              onMouseLeave={() => setActiveDropdown(null)}
              onFocus={() => item.submenu && setActiveDropdown(idx)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setActiveDropdown(null);
                }
              }}
            >
              <a
                href={item.href}
                aria-current={window.location.pathname === item.href || (item.href === '/' && window.location.pathname === '/home') ? 'page' : undefined}
                aria-haspopup={item.submenu ? 'true' : undefined}
                aria-expanded={item.submenu ? activeDropdown === idx : undefined}
                className={`ted-nav-link flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                  (activeDropdown === idx || (typeof window !== 'undefined' && window.location.pathname === item.href)) ? 'text-[#EB0028] bg-zinc-900/50' : 'text-zinc-200 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                {item.label}
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-[#EB0028]/20 text-[#EB0028] border border-[#EB0028]/30 rounded">
                    {item.badge}
                  </span>
                )}
                {item.submenu && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
              </a>

              {/* Submenu Dropdown */}
              <AnimatePresence>
                {item.submenu && activeDropdown === idx && (
                  <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 w-72 mt-1 py-2 bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-2xl z-50"
                  >
                    {item.submenu.map((sub, sIdx) => {
                      const SubIcon = sub.Icon;
                      return (
                        <a
                          key={sIdx}
                          href={sub.href}
                          className="flex items-start gap-3 px-4 py-2.5 hover:bg-zinc-900/80 transition-colors group"
                        >
                          <div className="p-2 bg-zinc-900 rounded-lg text-zinc-400 group-hover:text-[#EB0028] group-hover:bg-[#EB0028]/10 transition-colors">
                            <SubIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-zinc-200 group-hover:text-white">{sub.label}</div>
                            <div className="text-xs text-zinc-500 line-clamp-1">{sub.desc}</div>
                          </div>
                        </a>
                      );
                    })}
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Right Action Area */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 px-3.5 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 rounded-full transition-all text-sm font-medium text-white"
              >
                <div className="w-6 h-6 rounded-full bg-[#EB0028] text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <span className="max-w-[120px] truncate">{user.name}</span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded font-semibold">
                  {user.role}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <Motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-zinc-800 text-xs text-zinc-400">
                      Signed in as <span className="font-semibold text-white truncate block">{user.email}</span>
                    </div>
                    <a
                      href={getPortalPath()}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-200 hover:text-white hover:bg-zinc-900 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#EB0028]" />
                      My {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Portal
                    </a>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <a
                href="/login"
                className="px-3.5 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="flex items-center gap-2 rounded-full border border-[#EB0028] bg-transparent px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#EB0028]/10 active:scale-[0.98]"
              >
                <Ticket className="w-4 h-4" />
                Get Tickets
              </a>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <a
            href="/register"
            className="ted-mobile-ticket-link px-3 py-1.5 text-xs font-bold text-white bg-[#EB0028] rounded-md shadow"
          >
            Tickets
          </a>
          <button
            ref={mobileToggleRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="ted-mobile-menu-toggle p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg focus:outline-none"
            type="button"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer backdrop remains behind the panel and closes on an outside tap. */}
      {isMenuOpen && (
        <button
          type="button"
          className="ted-mobile-nav-backdrop lg:hidden"
          aria-label="Close navigation menu"
          tabIndex={-1}
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <Motion.div
            id="mobile-navigation"
            role="navigation"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ted-mobile-nav-panel lg:hidden bg-zinc-950/98 border-b border-zinc-800 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {navigationItems.map((item, idx) => (
                <div key={idx} className="border-b border-zinc-900 pb-2">
                  <a
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-base font-semibold text-zinc-200 hover:text-[#EB0028]"
                  >
                    {item.label}
                  </a>
                  {item.submenu && (
                    <div className="pl-4 mt-2 space-y-2">
                      {item.submenu.map((sub, sIdx) => (
                        <a
                          key={sIdx}
                          href={sub.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="ted-mobile-nav-sublink block text-sm text-zinc-400 hover:text-white"
                        >
                          {sub.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    <a
                      href={getPortalPath()}
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full py-2.5 text-center text-sm font-semibold bg-zinc-900 border border-zinc-700 text-white rounded-lg"
                    >
                      Open {user.role.toUpperCase()} Portal
                    </a>
                    <button
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="block w-full py-2 text-center text-sm font-medium text-red-400 bg-red-950/20 rounded-lg"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full py-2.5 text-center text-sm font-semibold bg-zinc-900 border border-zinc-700 text-white rounded-lg"
                    >
                      Sign In
                    </a>
                    <a
                      href="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full py-2.5 text-center text-sm font-semibold bg-[#EB0028] text-white rounded-lg shadow-md"
                    >
                      Get Tickets
                    </a>
                  </>
                )}
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;