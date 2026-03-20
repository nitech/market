'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/app/hooks/useAuth';
import { auth } from '@/app/lib/firebaseClient';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onMenuClick?: () => void;
  activeNavItem?: string;
}

const Icons = {
  search: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6m0 6v6m4.22-10.22 4.24-4.24M6.34 6.34 2.1 2.1m18.8 4.24-4.24 4.24M6.34 17.66l-4.24 4.24M22 12h-6m-6 0H2m16.22 4.22 4.24 4.24M6.34 6.34 2.1 2.1"/>
    </svg>
  ),
  bell: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </svg>
  ),
  logOut: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" x2="9" y1="12" y2="12"/>
    </svg>
  ),
  user: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  loader: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  ),
  chevronDown: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  ),
  menu: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" x2="21" y1="12" y2="12"/>
      <line x1="3" x2="21" y1="6" y2="6"/>
      <line x1="3" x2="21" y1="18" y2="18"/>
    </svg>
  ),
  close: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/>
      <path d="m6 6 12 12"/>
    </svg>
  ),
};

// Helper to get initials from name or email
function getInitials(name: string): string {
  if (!name) return '?';
  if (name.includes('@')) {
    return name.split('@')[0].slice(0, 2).toUpperCase();
  }
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

// Helper to get display name from user
function getDisplayName(user: any): { name: string; role: string } {
  if (!user) {
    return { name: 'Ikke innlogget', role: 'Logg inn for å fortsette' };
  }

  if (user.displayName) {
    return { name: user.displayName, role: 'Bruker' };
  }

  if (user.email) {
    return { name: user.email, role: 'Bruker' };
  }

  return { name: 'Bruker', role: 'Logget inn' };
}

export function Header({ onSearch, onMenuClick, activeNavItem }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(3);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
    setSearchOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setDropdownOpen(false);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const { name: userName, role: userRole } = getDisplayName(user);
  const initials = getInitials(userName);
  const photoURL = user?.photoURL;

  // Get page title based on active nav item
  const getPageTitle = () => {
    switch (activeNavItem) {
      case 'search': return 'Bedriftssøk';
      case 'franchise': return 'Franchise';
      case 'territory': return 'Territorium';
      case 'network': return 'Nettverk';
      case 'team': return 'Team';
      default: return '7markets';
    }
  };

  return (
    <>
      <header
        className="sticky top-0 z-40 h-14 sm:h-16"
        style={{
          background: 'var(--gs-bg-secondary)',
          borderBottom: '1px solid var(--gs-border-default)',
        }}
      >
        <div className="h-full flex items-center justify-between px-4 sm:px-6">
          {/* Left - Menu + Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-2 rounded-lg transition-all duration-200 active:scale-95"
              style={{ color: 'var(--gs-text-secondary)' }}
              aria-label="Åpne meny"
            >
              {Icons.menu}
            </button>
            <h2
              className="text-base sm:text-lg font-semibold"
              style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                color: 'var(--gs-text-primary)',
              }}
            >
              <span className="hidden sm:inline">7markets plattform</span>
              <span className="sm:hidden">{getPageTitle()}</span>
            </h2>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden lg:flex items-center gap-4 text-sm ml-6">
            <button
              className="font-medium transition-colors hover:text-white"
              style={{ color: activeNavItem === 'search' ? 'var(--gs-text-primary)' : 'var(--gs-text-tertiary)' }}
            >
              Søk
            </button>
            <button
              className="font-medium transition-colors hover:text-white"
              style={{ color: activeNavItem === 'franchise' ? 'var(--gs-text-primary)' : 'var(--gs-text-tertiary)' }}
            >
              Franchise
            </button>
          </nav>

          {/* Center - Search (Desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--gs-text-tertiary)' }}
              >
                {Icons.search}
              </span>
              <input
                type="text"
                placeholder="Søk bedrifter, ordrer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm transition-all duration-200 focus:outline-none"
                style={{
                  background: 'var(--gs-bg-tertiary)',
                  border: '1px solid var(--gs-border-default)',
                  color: 'var(--gs-text-primary)',
                }}
              />
            </div>
          </form>

          {/* Right Section - Actions & User */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-lg transition-all duration-200 active:scale-95"
              style={{ color: searchOpen ? 'var(--gs-accent-lime)' : 'var(--gs-text-secondary)' }}
              aria-label="Søk"
            >
              {Icons.search}
            </button>

            {/* Settings */}
            <button
              className="hidden sm:flex p-2 rounded-lg transition-all duration-200 hover:bg-white/5 active:scale-95"
              style={{ color: 'var(--gs-text-secondary)' }}
              aria-label="Innstillinger"
            >
              {Icons.settings}
            </button>

            {/* Notifications */}
            <button
              className="p-2 rounded-lg transition-all duration-200 hover:bg-white/5 relative active:scale-95"
              style={{ color: 'var(--gs-text-secondary)' }}
              aria-label="Varslinger"
            >
              {Icons.bell}
              {notifications > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ background: 'var(--gs-accent-red)' }}
                />
              )}
            </button>

            {/* User Profile */}
            <div className="relative" ref={dropdownRef}>
              {loading ? (
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--gs-bg-tertiary)' }}
                >
                  <span style={{ color: 'var(--gs-text-tertiary)' }}>{Icons.loader}</span>
                </div>
              ) : (
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-0.5 sm:pl-1 pr-1 sm:pr-2 py-0.5 sm:py-1 rounded-lg transition-all duration-200 hover:bg-white/5 active:scale-95"
                >
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt={userName}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold"
                      style={{
                        background: 'linear-gradient(135deg, var(--gs-accent-lime) 0%, var(--gs-accent-lime-dark) 100%)',
                        color: 'var(--gs-bg-primary)',
                      }}
                    >
                      {initials}
                    </div>
                  )}
                  <span 
                    className={`hidden sm:block transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--gs-text-tertiary)' }}
                  >
                    {Icons.chevronDown}
                  </span>
                </button>
              )}

              {/* Dropdown Menu */}
              {dropdownOpen && user && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden shadow-lg"
                  style={{
                    background: 'var(--gs-bg-elevated)',
                    border: '1px solid var(--gs-border-default)',
                  }}
                >
                  <div 
                    className="px-4 py-3"
                    style={{ borderBottom: '1px solid var(--gs-border-default)' }}
                  >
                    <p className="text-sm font-medium" style={{ color: 'var(--gs-text-primary)' }}>
                      {userName}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--gs-text-tertiary)' }}>
                      {user.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-200 hover:bg-white/5"
                      style={{ color: 'var(--gs-text-secondary)' }}
                    >
                      <span style={{ color: 'var(--gs-accent-red)' }}>{Icons.logOut}</span>
                      <span>Logg ut</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (Expandable) */}
        {searchOpen && (
          <div 
            ref={searchRef}
            className="absolute left-0 right-0 top-full px-4 py-3 md:hidden"
            style={{
              background: 'var(--gs-bg-secondary)',
              borderBottom: '1px solid var(--gs-border-default)',
            }}
          >
            <form onSubmit={handleSearch} className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--gs-text-tertiary)' }}
              >
                {Icons.search}
              </span>
              <input
                type="text"
                placeholder="Søk bedrifter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none"
                style={{
                  background: 'var(--gs-bg-tertiary)',
                  border: '1px solid var(--gs-border-default)',
                  color: 'var(--gs-text-primary)',
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded"
                style={{ color: 'var(--gs-text-tertiary)' }}
              >
                {Icons.close}
              </button>
            </form>
          </div>
        )}
      </header>
    </>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="hidden sm:block mb-6">
      <h1
        className="text-2xl font-bold"
        style={{
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          color: 'var(--gs-text-primary)',
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className="mt-1 text-sm"
          style={{ color: 'var(--gs-text-tertiary)' }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
