'use client';

import { useState } from 'react';

interface HeaderProps {
  userName?: string;
  userRole?: string;
  userAvatar?: string;
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
  calendar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  ),
  share: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/>
      <line x1="12" x2="12" y1="2" y2="15"/>
    </svg>
  ),
  download: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" x2="12" y1="15" y2="3"/>
    </svg>
  ),
  chevronDown: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  ),
  sun: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2"/>
      <path d="M12 20v2"/>
      <path d="m4.93 4.93 1.41 1.41"/>
      <path d="m17.66 17.66 1.41 1.41"/>
      <path d="M2 12h2"/>
      <path d="M20 12h2"/>
      <path d="m6.34 17.66-1.41 1.41"/>
      <path d="m19.07 4.93-1.41 1.41"/>
    </svg>
  ),
};

export function Header({
  userName = 'Alex Fox',
  userRole = 'CEO, admin',
  userAvatar,
  onSearch,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

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

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-1">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg, var(--gs-accent-lime) 0%, var(--gs-accent-lime-dark) 100%)',
                color: 'var(--gs-bg-primary)',
              }}
            >
              {userName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="hidden md:block">
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
            {Icons.calendar}
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
            {Icons.share}
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
            {Icons.download}
            Eksporter
          </button>
        )}
      </div>
    </div>
  );
}
