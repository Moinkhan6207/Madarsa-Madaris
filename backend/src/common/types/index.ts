export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  requestId?: string;
  responseTime?: string;
  timestamp?: string;
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

export interface FilterOptions {
  [key: string]: string | number | boolean | Date | undefined;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: SortOptions;
  filters?: FilterOptions;
  search?: string;
}
