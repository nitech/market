interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

const Icons = {
  chevronLeft: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  ),
  chevronRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  ),
};

export function Pagination({
  currentPage,
  totalPages,
  totalElements,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: PaginationProps) {
  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 rounded-xl p-3 sm:p-4"
      style={{
        background: 'var(--gs-bg-card)',
        border: '1px solid var(--gs-border-default)',
      }}
    >
      <div className="text-xs sm:text-sm order-2 sm:order-1" style={{ color: 'var(--gs-text-secondary)' }}>
        <span style={{ color: 'var(--gs-text-primary)' }}>Side {currentPage + 1} av {totalPages || 1}</span>
        <span className="mx-2" style={{ color: 'var(--gs-text-tertiary)' }}>•</span>
        <span className="hidden sm:inline" style={{ color: 'var(--gs-text-tertiary)' }}>{totalElements} totalt</span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          style={{
            background: hasPrev ? 'var(--gs-bg-tertiary)' : 'transparent',
            border: '1px solid var(--gs-border-default)',
            color: hasPrev ? 'var(--gs-text-primary)' : 'var(--gs-text-tertiary)',
            cursor: hasPrev ? 'pointer' : 'not-allowed',
            opacity: hasPrev ? 1 : 0.5,
          }}
        >
          {Icons.chevronLeft}
          <span className="hidden sm:inline">Forrige</span>
        </button>

        {/* Page numbers - Hidden on mobile, shown on sm+ */}
        <div className="hidden sm:flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => {
            const pageNum = i;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                className="w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: isActive ? 'var(--gs-accent-lime)' : 'transparent',
                  color: isActive ? 'var(--gs-bg-primary)' : 'var(--gs-text-secondary)',
                  border: isActive ? 'none' : '1px solid var(--gs-border-default)',
                }}
              >
                {pageNum + 1}
              </button>
            );
          })}
          {totalPages > 5 && (
            <>
              <span className="px-1" style={{ color: 'var(--gs-text-tertiary)' }}>...</span>
              <button
                className="w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: 'transparent',
                  color: 'var(--gs-text-secondary)',
                  border: '1px solid var(--gs-border-default)',
                }}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Mobile page indicator */}
        <div className="flex sm:hidden items-center px-3 py-2">
          <span className="text-sm font-medium" style={{ color: 'var(--gs-text-primary)' }}>
            {currentPage + 1} / {totalPages || 1}
          </span>
        </div>

        <button
          onClick={onNext}
          disabled={!hasNext}
          className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          style={{
            background: hasNext ? 'var(--gs-accent-lime)' : 'var(--gs-bg-tertiary)',
            border: hasNext ? 'none' : '1px solid var(--gs-border-default)',
            color: hasNext ? 'var(--gs-bg-primary)' : 'var(--gs-text-tertiary)',
            cursor: hasNext ? 'pointer' : 'not-allowed',
            opacity: hasNext ? 1 : 0.5,
          }}
        >
          <span className="hidden sm:inline">Neste</span>
          {Icons.chevronRight}
        </button>
      </div>
    </div>
  );
}
