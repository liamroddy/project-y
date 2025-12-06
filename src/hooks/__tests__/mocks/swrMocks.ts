import { jest } from '@jest/globals';
import type {
  SWRInfiniteFetcher,
  SWRInfiniteKeyLoader,
  SWRInfiniteResponse,
} from 'swr/infinite';

export interface MockSWRInfiniteConfig<Data, Err = Error> {
  data?: Data[] | null;
  error?: Err | null;
  isLoading?: boolean;
  isValidating?: boolean;
  setSize?: jest.Mock;
  mutate?: jest.Mock;
  size?: number;
}

export function createMockUseSWRInfinite<Data, Key extends readonly unknown[], Err = Error>() {
  type KeyLoader = SWRInfiniteKeyLoader<Data, Key>;
  type Fetcher = SWRInfiniteFetcher<Data, KeyLoader>;
  type Response = SWRInfiniteResponse<Data, Err>;
  type MockableUseSWRInfinite = (getKey: KeyLoader, fetcher: Fetcher) => Response;

  const mockUseSWRInfinite = jest.fn<MockableUseSWRInfinite>();

  function setupSWR(overrides: MockSWRInfiniteConfig<Data, Err> = {}) {
    const setSize = (overrides.setSize ?? jest.fn()) as jest.MockedFunction<Response['setSize']>;
    const mutate = (overrides.mutate ?? jest.fn()) as jest.MockedFunction<Response['mutate']>;

    const response: Response = {
      data: overrides.data ?? undefined,
      error: overrides.error ?? undefined,
      isLoading: overrides.isLoading ?? false,
      isValidating: overrides.isValidating ?? false,
      setSize,
      mutate,
      size: overrides.size ?? 0,
    };

    let latestGetKey: KeyLoader | undefined;
    let latestFetcher: Fetcher | undefined;

    mockUseSWRInfinite.mockImplementation((getKey, fetcher) => {
      latestGetKey = getKey;
      latestFetcher = fetcher;
      return response;
    });

    const missingFetcher = (() => {
      throw new Error('fetcher not initialized');
    }) as unknown as Fetcher;

    return {
      response,
      getKey: () => latestGetKey ?? ((() => null) as unknown as KeyLoader),
      fetcher: () => latestFetcher ?? missingFetcher,
    };
  }

  return { mockUseSWRInfinite, setupSWR };
}
