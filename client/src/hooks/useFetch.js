import { useState, useEffect } from "react";

function useFetch(url, token) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function refetch() {
    setRefreshKey((currentKey) => currentKey + 1);
  }

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === "AbortError"
        ) {
          return;
        }

        if (caughtError instanceof Error) {
          setError(caughtError);
        } else {
          setError(new Error("An unexpected error occurred."));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      controller.abort();
    };
  }, [url, token, refreshKey]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

export default useFetch;
