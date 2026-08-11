import { useEffect, useMemo, useRef, useState } from "react"
import { useIsMounted } from "usehooks-ts"
import { BridgeApiError } from "@usebridge/api"
import { retryLoop, RetryLoopCancelledError } from "../lib/retry-loop.js"
import { usePayerSearch } from "./use-payer-search.js"
import { omit } from "lodash-es"
import type { Payer } from "@usebridge/sdk-core"

// We'll store these locally, they won't change within a user session
const resultCache = new Map<string, Payer[]>()

function toError(err: unknown): Error {
  if (err instanceof Error) return err
  return new Error(String(err))
}

/**
 * Whether a payer-search failure is worth retrying
 * Retries transient failures; fails on irrecoverable client errors
 */
function isRetryablePayerSearchError(err: unknown): boolean {
  if (err instanceof BridgeApiError && err.statusCode != null) {
    // Rate-limited: keep trying
    if (err.statusCode === 429) return true
    // Other 4xx (bad request, forbidden, etc.): won't recover by retrying
    if (err.statusCode >= 400 && err.statusCode < 500) return false
  }
  // Network, timeout, 5xx, unknown: keep looping
  return true
}

/**
 * Providers autocomplete functionality for the Payer search
 * @param query the query to search for, may be an empty string
 * @param limit the maximum number of results to return, defaults to 10
 */
export function usePayerAutocomplete(
  query: string,
  {
    limit = 10,
  }: {
    /**
     * The maximum number of results to return, defaults to 10
     */
    limit?: number
  } = {},
): {
  /**
   * Whether the autocomplete is currently loading
   */
  isLoading: boolean
  /**
   * The results to display currently
   */
  results: Payer[]
  /**
   * Irrecoverable error from the latest search, if any
   */
  error?: Error
} {
  // We expect a 'BridgeSdk' to be available in the context
  const payerSearch = usePayerSearch()

  // TODO Hardcode the empty query results

  // Track the state
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<Payer[]>([])
  const [error, setError] = useState<Error | undefined>()

  // We don't need to run again if it's just whitespace
  const normalizedQuery = query.trim().toLowerCase()

  // Track the latest request, to ignore stale responses
  const reqId = useRef(0)

  // If the query changes, drive another search
  const isMounted = useIsMounted()
  useEffect(() => {
    // Tick the request ID up, so we ignore everything before this
    const thisId = ++reqId.current

    // If the query is in the cache, use it immediately
    const cachedResults = resultCache.get(normalizedQuery)
    if (cachedResults) {
      setIsLoading(false)
      setResults(cachedResults)
      setError(undefined)
      return
    }

    // Async runs inside a function here, explicitly launched with 'void'
    async function run() {
      // Move into the loading state, we're going to be waiting
      setIsLoading(true)
      setError(undefined)

      try {
        // Run the search on a loop, until it resolves, fails irrecoverably, or we unmount/move on
        const response = await retryLoop(
          () => payerSearch({ query: normalizedQuery, limit }),
          (err) => {
            if (!isMounted() || thisId !== reqId.current) return "cancel"
            if (!isRetryablePayerSearchError(err)) return "fail"
            return "retry"
          },
        )

        // If we've unmounted, do nothing
        if (!isMounted()) return

        // Write these into the cache
        resultCache.set(normalizedQuery, response.items)

        // If this is not the latest request, ignore it
        if (thisId !== reqId.current) return

        // Use these results
        setIsLoading(false)
        setResults(response.items)
        setError(undefined)
      } catch (err) {
        // If the retry loop was canceled, we don't need to worry about this
        if (err instanceof RetryLoopCancelledError) return
        if (!isMounted() || thisId !== reqId.current) return

        setIsLoading(false)
        setError(toError(err))
      }
    }

    void run()
  }, [payerSearch, normalizedQuery, limit])

  // Memoize what we return here
  return useMemo(
    () => ({ isLoading, results: results.map((r) => omit(r, "code")), error }),
    [isLoading, results, error],
  )
}
