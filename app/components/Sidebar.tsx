'use client';

import { useState } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  disabled?: boolean;
  onClick?: () => void;
}

interface SidebarProps {
  activeItem: string;
  onNavigate: (id: string) => void;
  onOpenSettings?: () => void;
}

// SVG Icons matching GeoSales style
const Icons = {
  search: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  franchise: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"/>
      <path d="M5 21V7l8-4 8 4v14"/>
      <path d="M9 21v-9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v9"/>
    </svg>
  ),
  globe: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" x2="22" y1="12" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  network: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/>
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  help: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <path d="M12 17h.01"/>
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  logo: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="2" y="2" width="24" height="24" rx="6" fill="url(#logo-gradient)"/>
      <path d="M9 14L12 17L19 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="logo-gradient" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a3e635"/>
          <stop offset="1" stopColor="#84cc16"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  lock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
};

const navItems: NavItem[] = [
  { id: 'search', label: 'Søk', icon: Icons.search },
  { id: 'franchise', label: 'Franchise', icon: Icons.franchise },
];

// Disabled menu items - not yet implemented
const disabledNavItems: NavItem[] = [
  { id: 'territory', label: 'Territorium', icon: Icons.globe, disabled: true },
  { id: 'network', label: 'Nettverk', icon: Icons.network, disabled: true },
  { id: 'team', label: 'Team', icon: Icons.users, disabled: true },
];

const bottomItems = (onOpenSettings?: () => void): NavItem[] => [
  { id: 'help', label: 'Hjelp', icon: Icons.help, disabled: true },
  { 
    id: 'settings', 
    label: 'Innstillinger', 
    icon: Icons.settings, 
    disabled: false,
    onClick: onOpenSettings,
  },
];

export function Sidebar({ activeItem, onNavigate, onOpenSettings }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const renderNavItem = (item: NavItem, isDisabled: boolean = false) => {
    const isActive = activeItem === item.id && !isDisabled;
    
    if (isDisabled) {
      return (
        <li key={item.id}>
          <button
            disabled
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed opacity-50"
            style={{ color: 'var(--gs-text-muted)' }}
            title="Kommer snart"
          >
            <span className="shrink-0" style={{ color: 'var(--gs-text-muted)' }}>
              {item.icon}
            </span>
            {!collapsed && (
              <span className="truncate">{item.label}</span>
            )}
            {!collapsed && (
              <span
                className="ml-auto"
                style={{ color: 'var(--gs-text-muted)' }}
              >
                {Icons.lock}
              </span>
            )}
          </button>
        </li>
      );
    }

    // Special case for settings with custom onClick
    if (item.onClick) {
      return (
        <li key={item.id}>
          <button
            onClick={item.onClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-gray-400 hover:text-gray-200 hover:bg-white/5"
            style={{ color: 'var(--gs-text-secondary)' }}
          >
            <span className="shrink-0" style={{ color: 'var(--gs-text-secondary)' }}>
              {item.icon}
            </span>
            {!collapsed && (
              <span style={{ color: 'var(--gs-text-secondary)' }}>
                {item.label}
              </span>
            )}
          </button>
        </li>
      );
    }

    return (
      <li key={item.id}>
        <button
          onClick={() => onNavigate(item.id)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            isActive
              ? 'text-white'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
          style={{
            backgroundColor: isActive
              ? 'rgba(163, 230, 53, 0.15)'
              : 'transparent',
            borderLeft: isActive
              ? '2px solid var(--gs-accent-lime)'
              : '2px solid transparent',
            marginLeft: isActive ? '-2px' : '0',
          }}
        >
          <span
            className="shrink-0"
            style={{
              color: isActive
                ? 'var(--gs-accent-lime)'
                : 'var(--gs-text-secondary)',
            }}
          >
            {item.icon}
          </span>
          {!collapsed && (
            <span
              className="truncate"
              style={{
                color: isActive
                  ? 'var(--gs-text-primary)'
                  : 'var(--gs-text-secondary)',
              }}
            >
              {item.label}
            </span>
          )}
          {!collapsed && item.badge && (
            <span
              className="ml-auto px-2 py-0.5 text-xs rounded-full"
              style={{
                background: 'var(--gs-accent-lime)',
                color: 'var(--gs-bg-primary)',
              }}
            >
              {item.badge}
            </span>
          )}
        </button>
      </li>
    );
  };

  return (
    <aside
      className={`flex flex-col h-screen sticky top-0 transition-all duration-300 ease-out ${
        collapsed ? 'w-16' : 'w-[240px]'
      }`}
      style={{
        background: 'var(--gs-bg-secondary)',
        borderRight: '1px solid var(--gs-border-default)',
      }}
    >
      {/* Logo Section */}
      <div
        className="flex items-center gap-3 px-4 h-16 shrink-0"
        style={{ borderBottom: '1px solid var(--gs-border-default)' }}
      >
        <div className="shrink-0">{Icons.logo}</div>
        {!collapsed && (
          <span
            className="font-semibold text-base tracking-tight"
            style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              color: 'var(--gs-text-primary)',
            }}
          >
            7markets
          </span>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {/* Active menu items */}
          {navItems.map((item) => renderNavItem(item, false))}
          
          {/* Divider before disabled items */}
          {!collapsed && disabledNavItems.length > 0 && (
            <li className="py-2">
              <div
                className="h-px mx-3"
                style={{ background: 'var(--gs-border-default)' }}
              />
            </li>
          )}
          {collapsed && disabledNavItems.length > 0 && (
            <li className="py-2 flex justify-center">
              <div
                className="w-4 h-px"
                style={{ background: 'var(--gs-border-default)' }}
              />
            </li>
          )}
          
          {/* Disabled menu items */}
          {disabledNavItems.map((item) => renderNavItem(item, true))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div
        className="py-3 px-2 shrink-0"
        style={{ borderTop: '1px solid var(--gs-border-default)' }}
      >
        <ul className="space-y-1">
          {bottomItems(onOpenSettings).map((item) => renderNavItem(item, item.disabled))}
        </ul>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mt-3 w-full flex items-center justify-center py-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all duration-200"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
          >
            <path d="m11 17-5-5 5-5"/>
            <path d="m18 17-5-5 5-5"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}
