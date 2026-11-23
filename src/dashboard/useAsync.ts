import { useCallback, useEffect, useState } from "react";

export type AsyncState<T> = {
  data: T | null;
  error: string;
  loading: boolean;
  reload: () => void;
};

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong. Please try again.";
}

type Result<T> = { key: string; id: string; data: T | null; error: string };

/**
 * Loads data when `key` changes and exposes `reload`.
 * While a reload is in flight the previous data for the same key stays visible.
 */
export function useAsync<T>(
  loader: () => Promise<T>,
  key: string
): AsyncState<T> {
  const [tick, setTick] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);
  const id = `${key}#${tick}`;

  useEffect(() => {
    let active = true;

    loader()
      .then((data) => {
        if (active) setResult({ key, id, data, error: "" });
      })
      .catch((err: unknown) => {
        if (active) setResult({ key, id, data: null, error: errorMessage(err) });
      });

    return () => {
      active = false;
    };
    // `id` identifies the loader's inputs; the loader function itself is recreated every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const reload = useCallback(() => setTick((value) => value + 1), []);

  const sameKey = result?.key === key;
  return {
    data: sameKey ? result.data : null,
    error: result?.id === id ? result.error : "",
    loading: result?.id !== id,
    reload,
  };
}
