import { useState, useEffect, useRef, useCallback } from 'react';
import axios, { AxiosError } from 'axios';

// Types for the hook
interface Tenant {
  id: string;
  name: string;
}

interface SearchResult {
  data: Tenant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta?: {
    searchMode: string;
    query: string;
  };
}

interface SearchCache {
  [key: string]: {
    data: SearchResult;
    timestamp: number;
  };
}

interface SearchMetrics {
  requestTime: number;
  renderTime: number;
  cacheHits: number;
  cacheMisses: number;
  retries: number;
}

interface SearchOptions {
  initialSearch?: string;
  mode?: 'auto' | 'exact' | 'prefix' | 'fulltext' | 'fuzzy' | 'contains';
  debounceMin?: number;
  debounceMax?: number;
  cacheTime?: number; // in milliseconds
  maxRetries?: number;
  apiUrl?: string;
  limit?: number;
}

interface SearchState {
  search: string;
  results: Tenant[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  selectedTenant: Tenant | null;
  metrics: SearchMetrics;
}

/**
 * A custom hook for optimized tenant search with intelligent debouncing,
 * request cancellation, caching, and performance metrics.
 */
const useOptimizedTenantSearch = (options: SearchOptions = {}) => {
  // Default options
  const {
    initialSearch = '',
    mode = 'auto',
    debounceMin = 150, // Faster debounce for short queries
    debounceMax = 500, // Slower debounce for longer queries
    cacheTime = 5 * 60 * 1000, // 5 minutes cache
    maxRetries = 2,
    apiUrl = 'http://localhost:4000/tenants',
    limit = 10,
  } = options;

  // State management
  const [state, setState] = useState<SearchState>({
    search: initialSearch,
    results: [],
    loading: false,
    error: null,
    hasMore: false,
    page: 1,
    selectedTenant: null,
    metrics: {
      requestTime: 0,
      renderTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      retries: 0,
    },
  });

  // Refs to avoid dependencies in useEffect
  const cache = useRef<SearchCache>({});
  const abortControllerRef = useRef<AbortController | null>(null);
  // Browser-agnostic timer reference (avoids Node typings requirement)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchStartTimeRef = useRef<number>(0);
  const retryCountRef = useRef<number>(0);

  // Calculate dynamic debounce time based on query length
  const getDebounceTime = useCallback((query: string): number => {
    const length = query.trim().length;
    
    // No debounce for empty queries
    if (length === 0) return 0;
    
    // Short debounce for prefix searches (1-2 chars)
    if (length <= 2) return debounceMin;
    
    // Linear interpolation between min and max debounce based on length
    const factor = Math.min(1, (length - 2) / 8); // Normalize between 0 and 1
    return debounceMin + factor * (debounceMax - debounceMin);
  }, [debounceMin, debounceMax]);

  // Determine optimal search mode based on query pattern
  const detectSearchMode = useCallback((query: string): string => {
    if (mode !== 'auto') return mode;
    
    const term = query.trim();
    
    // If empty search, use contains
    if (!term) return 'contains';
    
    // If quoted exact phrase, use exact match
    if (term.startsWith('"') && term.endsWith('"')) {
      return 'exact';
    }
    
    // If short term (1-2 chars), use prefix search for better autocomplete
    if (term.length <= 2) {
      return 'prefix';
    }
    
    // If term contains spaces, likely a phrase search, use fulltext
    if (term.includes(' ')) {
      return 'fulltext';
    }
    
    // If term is 3-5 chars, likely typing for autocomplete, use prefix
    if (term.length <= 5) {
      return 'prefix';
    }
    
    // For longer terms, use fuzzy search to handle potential typos
    return 'fuzzy';
  }, [mode]);

  // Generate cache key based on search parameters
  const getCacheKey = useCallback((query: string, searchMode: string, page: number): string => {
    return `${query}:${searchMode}:${page}:${limit}`;
  }, [limit]);

  // Check if a cached result is still valid
  const isCacheValid = useCallback((timestamp: number): boolean => {
    return Date.now() - timestamp < cacheTime;
  }, [cacheTime]);

  // Perform the actual search request
  const performSearch = useCallback(async (query: string, page: number = 1, retry: boolean = false) => {
    // Skip empty searches
    if (!query.trim()) {
      setState(prev => ({
        ...prev,
        results: [],
        loading: false,
        error: null,
        hasMore: false,
      }));
      return;
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    // Determine search mode
    const searchMode = detectSearchMode(query);
    
    // Check cache first
    const cacheKey = getCacheKey(query, searchMode, page);
    const cachedResult = cache.current[cacheKey];
    
    if (cachedResult && isCacheValid(cachedResult.timestamp)) {
      // Use cached result
      setState(prev => ({
        ...prev,
        results: cachedResult.data.data,
        loading: false,
        error: null,
        hasMore: page < cachedResult.data.pagination.totalPages,
        metrics: {
          ...prev.metrics,
          cacheHits: prev.metrics.cacheHits + 1,
        },
      }));
      return;
    }

    // Mark cache miss
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      metrics: {
        ...prev.metrics,
        cacheMisses: prev.metrics.cacheMisses + 1,
      },
    }));

    // Record start time for metrics
    const requestStartTime = performance.now();
    searchStartTimeRef.current = requestStartTime;

    try {
      // Make the API request
      const response = await axios.get<SearchResult>(apiUrl, {
        params: {
          search: query,
          mode: searchMode,
          page,
          limit,
        },
        signal: abortControllerRef.current.signal,
        headers: {
          'X-Client-Timestamp': Date.now().toString(),
        },
      });

      // Calculate request time
      const requestTime = performance.now() - requestStartTime;

      // Cache the result
      cache.current[cacheKey] = {
        data: response.data,
        timestamp: Date.now(),
      };

      // Reset retry counter on success
      retryCountRef.current = 0;

      // Update state with results
      setState(prev => ({
        ...prev,
        results: response.data.data,
        loading: false,
        error: null,
        hasMore: page < response.data.pagination.totalPages,
        page,
        metrics: {
          ...prev.metrics,
          requestTime,
        },
      }));

      // Auto-select exact match if there's only one result
      if (response.data.data.length === 1 && 
          response.data.data[0].name.toLowerCase() === query.toLowerCase()) {
        setState(prev => ({
          ...prev,
          selectedTenant: response.data.data[0],
        }));
      }
    } catch (err: unknown) {
      // Skip handling aborted requests
      if (axios.isCancel(err)) {
        return;
      }

      // Handle errors
      const axiosError = err as AxiosError;
      const errorMessage =
        (axiosError.response as any)?.data?.error ??
        axiosError.message ??
        'Search failed';

      // Implement retry logic for network errors
      if (
        !retry && 
        retryCountRef.current < maxRetries && 
        ((axiosError as any).code === 'ECONNABORTED' || (axiosError as any).code === 'ERR_NETWORK')
      ) {
        retryCountRef.current++;
        
        setState(prev => ({
          ...prev,
          metrics: {
            ...prev.metrics,
            retries: prev.metrics.retries + 1,
          },
        }));

        // Exponential backoff for retries (300ms, 900ms, 2700ms, etc.)
        const backoffTime = 300 * Math.pow(3, retryCountRef.current - 1);
        setTimeout(() => {
          performSearch(query, page, true);
        }, backoffTime);
        return;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [apiUrl, detectSearchMode, getCacheKey, isCacheValid, limit, maxRetries]);

  // Debounced search handler
  const handleSearch = useCallback((query: string) => {
    setState(prev => ({ ...prev, search: query }));
    
    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Calculate appropriate debounce time
    const debounceTime = getDebounceTime(query);
    
    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, page: 1 })); // Reset to first page
      performSearch(query);
    }, debounceTime);
  }, [getDebounceTime, performSearch]);

  // Load more results (pagination)
  const loadMore = useCallback(() => {
    if (state.loading || !state.hasMore) return;
    
    const nextPage = state.page + 1;
    setState(prev => ({ ...prev, page: nextPage }));
    performSearch(state.search, nextPage);
  }, [state.loading, state.hasMore, state.page, state.search, performSearch]);

  // Select a specific tenant
  const selectTenant = useCallback((tenant: Tenant | null) => {
    setState(prev => ({ ...prev, selectedTenant: tenant }));
  }, []);

  // Clear search and results
  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      search: '',
      results: [],
      selectedTenant: null,
      page: 1,
      hasMore: false,
    }));
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    cache.current = {};
    setState(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        cacheHits: 0,
        cacheMisses: 0,
      },
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Perform initial search if provided
  useEffect(() => {
    if (initialSearch) {
      handleSearch(initialSearch);
    }
  }, [initialSearch, handleSearch]);

  // Track render time for metrics
  useEffect(() => {
    if (searchStartTimeRef.current > 0) {
      const renderTime = performance.now() - searchStartTimeRef.current;
      setState(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          renderTime,
        },
      }));
      searchStartTimeRef.current = 0;
    }
  }, [state.results]);

  // Return the hook interface
  return {
    // State
    search: state.search,
    results: state.results,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    selectedTenant: state.selectedTenant,
    metrics: state.metrics,
    
    // Actions
    handleSearch,
    loadMore,
    selectTenant,
    clearSearch,
    clearCache,
  };
};

export default useOptimizedTenantSearch;
