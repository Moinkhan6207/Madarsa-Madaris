import { QueryOptions, PaginatedResult, SortOptions } from '../types';

// =============================================================================
// Default Pagination Constants
// =============================================================================

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

// =============================================================================
// Parse Pagination Options from Query Parameters
// =============================================================================

export const parsePaginationOptions = (query: {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
}): QueryOptions => {
  const page = Math.max(1, parseInt(String(query.page || DEFAULT_PAGE), 10) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(String(query.limit || DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
  );

  let sort: SortOptions | undefined;
  if (query.sortBy) {
    sort = {
      field: query.sortBy,
      order: query.sortOrder === 'desc' ? 'desc' : 'asc',
    };
  }

  return {
    page,
    limit,
    sort,
    search: query.search,
  };
};

// =============================================================================
// Calculate Pagination Metadata
// =============================================================================

export const calculatePagination = (
  total: number,
  page: number,
  limit: number
): {
  skip: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} => {
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    skip,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
};

// =============================================================================
// Build Prisma Query with Pagination
// =============================================================================

export const buildPrismaQuery = (options: QueryOptions): {
  skip: number;
  take: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
} => {
  const { skip, totalPages: _totalPages, hasNextPage: _hasNextPage, hasPrevPage: _hasPrevPage } = calculatePagination(
    0, // Total not needed for query building
    options.page || DEFAULT_PAGE,
    options.limit || DEFAULT_LIMIT
  );

  const take = options.limit || DEFAULT_LIMIT;

  let orderBy: Record<string, 'asc' | 'desc'> | undefined;
  if (options.sort) {
    orderBy = {
      [options.sort.field]: options.sort.order,
    };
  }

  return {
    skip,
    take,
    orderBy,
  };
};

// =============================================================================
// Create Paginated Response
// =============================================================================

export const createPaginationResult = <T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> => {
  const { totalPages, hasNextPage, hasPrevPage } = calculatePagination(total, page, limit);

  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  };
};

// =============================================================================
// Cursor-based Pagination (for large datasets)
// =============================================================================

export interface CursorPaginationOptions {
  cursor?: string;
  limit?: number;
  direction?: 'forward' | 'backward';
}

export interface CursorPaginatedResult<T> {
  data: T[];
  pagination: {
    nextCursor?: string;
    prevCursor?: string;
    hasMore: boolean;
  };
}

export const buildCursorQuery = (options: CursorPaginationOptions): {
  cursor?: { id: string };
  take: number;
  skip?: number;
} => {
  const limit = Math.min(MAX_LIMIT, options.limit || DEFAULT_LIMIT);
  const direction = options.direction || 'forward';

  if (options.cursor) {
    return {
      cursor: { id: options.cursor },
      take: direction === 'forward' ? limit : -limit,
      skip: 1, // Skip the cursor itself
    };
  }

  return {
    take: limit,
  };
};
