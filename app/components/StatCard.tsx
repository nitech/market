'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  icon: ReactNode;
  color?: 'lime' | 'blue' | 'orange' | 'red' | 'green';
  onClick?: () => void;
}

const colorMap = {
  lime: {
    bg: 'rgba(163, 230, 53, 0.1)',
    border: 'rgba(163, 230, 53, 0.3)',
    text: '#a3e635',
  },
  blue: {
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.3)',
    text: '#3b82f6',
  },
  orange: {
    bg: 'rgba(249, 115, 22, 0.1)',
    border: 'rgba(249, 115, 22, 0.3)',
    text: '#f97316',
  },
  red: {
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.3)',
    text: '#ef4444',
  },
  green: {
    bg: 'rgba(34, 197, 94, 0.1)',
    border: 'rgba(34, 197, 94, 0.3)',
    text: '#22c55e',
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'lime',
  onClick,
}: StatCardProps) {
  const theme = colorMap[color];

  return (
    <button
      onClick={onClick}
      className="w-full h-full text-left p-3 rounded-xl transition-all duration-200 hover:scale-[1.02]"
      style={{
        background: 'var(--gs-bg-card)',
        border: `1px solid ${theme.border}`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div
          className="p-1.5 rounded-lg"
          style={{ background: theme.bg }}
        >
          <span style={{ color: theme.text }}>{icon}</span>
        </div>
        <svg
          width="12"
          height="12"
          className="hidden sm:block"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--gs-text-tertiary)' }}
        >
          <path d="M7 7h10v10"/>
          <path d="M7 17 17 7"/>
        </svg>
      </div>

      {/* Content */}
      <div>
        <p
          className="text-xs font-medium mb-0.5"
          style={{ color: 'var(--gs-text-secondary)' }}
        >
          {title}
        </p>
        <p
          className="text-base font-bold tracking-tight truncate"
          style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            color: 'var(--gs-text-primary)',
          }}
        >
          {value}
        </p>

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-2 mt-2">
            <span
              className="flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded"
              style={{
                background: trend.isPositive
                  ? 'rgba(34, 197, 94, 0.15)'
                  : 'rgba(239, 68, 68, 0.15)',
                color: trend.isPositive ? '#22c55e' : '#ef4444',
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {trend.isPositive ? (
                  <path d="m18 15-6-6-6 6"/>
                ) : (
                  <path d="m6 9 6 6 6-6"/>
                )}
              </svg>
              {Math.abs(trend.value)}%
            </span>
            <span
              className="text-xs"
              style={{ color: 'var(--gs-text-tertiary)' }}
            >
              {trend.label}
            </span>
          </div>
        )}

        {subtitle && !trend && (
          <p
            className="text-xs mt-2"
            style={{ color: 'var(--gs-text-tertiary)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </button>
  );
}

// Mini stat for smaller displays
interface MiniStatProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
}

export function MiniStat({ label, value, trend, trendUp }: MiniStatProps) {
  return (
    <div className="flex flex-col">
      <span
        className="text-xs mb-1"
        style={{ color: 'var(--gs-text-tertiary)' }}
      >
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span
          className="text-sm font-semibold"
          style={{ color: 'var(--gs-text-primary)' }}
        >
          {value}
        </span>
        {trend && (
          <span
            className="text-xs"
            style={{ color: trendUp ? '#22c55e' : '#ef4444' }}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
