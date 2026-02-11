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
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Side {currentPage + 1} av {totalPages || 1} ({totalElements} totalt)
      </div>
      <div className="flex space-x-2">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

