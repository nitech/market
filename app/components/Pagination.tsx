interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

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
    <div className="flex items-center justify-between rounded-lg border border-transparent bg-white p-4 shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Side {currentPage + 1} av {totalPages || 1} ({totalElements} totalt)
      </div>
      <div className="flex space-x-2">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Forrige
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Neste
        </button>
      </div>
    </div>
  );
}

