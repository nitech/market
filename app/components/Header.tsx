'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/app/hooks/useAuth';
import { auth } from '@/app/lib/firebaseClient';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

const Icons = {
  search: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6m0 6v6m4.22-10.22 4.24-4.24M6.34 6.34 2.1 2.1m18.8 4.24-4.24 4.24M6.34 17.66l-4.24 4.24M22 12h-6m-6 0H2m16.22 4.22 4.24 4.24M6.34 6.34 2.1 2.1"/>
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

export function Header({ onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(3);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
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

  return (
    <header
      className="sticky top-0 z-40 h-16"
      style={{
        background: 'var(--gs-bg-secondary)',
        borderBottom: '1px solid var(--gs-border-default)',
      }}
    >
      <div className="h-full flex items-center justify-between px-6">
        {/* Left Section - Title & Breadcrumb */}
        <div className="flex items-center gap-4">
          <h2
            className="text-lg font-semibold"
            style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              color: 'var(--gs-text-primary)',
            }}
          >
            7markets plattform
          </h2>
          <span style={{ color: 'var(--gs-text-tertiary)' }}>/</span>
          <nav className="flex items-center gap-4 text-sm">
            <button
              className="font-medium transition-colors hover:text-white"
              style={{ color: 'var(--gs-text-secondary)' }}
            >
              Oversikt
            </button>
            <button
              className="font-medium transition-colors hover:text-white"
              style={{ color: 'var(--gs-text-tertiary)' }}
            >
              Overvåking
            </button>
            <button
              className="font-medium transition-colors hover:text-white"
              style={{ color: 'var(--gs-text-tertiary)' }}
            >
              Prediktiv AI
            </button>
          </nav>
        </div>

        {/* Center - Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
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
        <div className="flex items-center gap-3">
          {/* Action Buttons */}
          <div className="flex items-center gap-2 pr-3" style={{ borderRight: '1px solid var(--gs-border-default)' }}>
            <button
              className="p-2 rounded-lg transition-all duration-200 hover:bg-white/5"
              style={{ color: 'var(--gs-text-secondary)' }}
            >
              {Icons.settings}
            </button>
            <button
              className="p-2 rounded-lg transition-all duration-200 hover:bg-white/5 relative"
              style={{ color: 'var(--gs-text-secondary)' }}
            >
              {Icons.bell}
              {notifications > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ background: 'var(--gs-accent-red)' }}
                />
              )}
            </button>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {loading ? (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'var(--gs-bg-tertiary)' }}
              >
                <span style={{ color: 'var(--gs-text-tertiary)' }}>{Icons.loader}</span>
              </div>
            ) : (
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg transition-all duration-200 hover:bg-white/5"
              >
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={userName}
                    className="w-9 h-9 rounded-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, var(--gs-accent-lime) 0%, var(--gs-accent-lime-dark) 100%)',
                      color: 'var(--gs-bg-primary)',
                    }}
                  >
                    {initials}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p
                    className="text-sm font-medium"
                    style={{ color: 'var(--gs-text-primary)' }}
                  >
                    {userName}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--gs-text-tertiary)' }}
                  >
                    {userRole}
                  </p>
                </div>
                <span 
                  className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
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
                {/* User Info Header */}
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

                {/* Menu Items */}
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
    </header>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  date?: string;
  onShare?: () => void;
  onExport?: () => void;
}

export function PageHeader({ title, subtitle, date, onShare, onExport }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
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

      <div className="flex items-center gap-2">
        {date && (
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5"
            style={{
              background: 'var(--gs-bg-tertiary)',
              border: '1px solid var(--gs-border-default)',
              color: 'var(--gs-text-secondary)',
            }}
          >
            {date}
          </button>
        )}
        {onShare && (
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5"
            style={{
              background: 'var(--gs-bg-tertiary)',
              border: '1px solid var(--gs-border-default)',
              color: 'var(--gs-text-secondary)',
            }}
          >
            Del rapport
          </button>
        )}
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5"
            style={{
              background: 'var(--gs-bg-tertiary)',
              border: '1px solid var(--gs-border-default)',
              color: 'var(--gs-text-secondary)',
            }}
          >
            Eksporter
          </button>
        )}
      </div>
    </div>
  );
}
