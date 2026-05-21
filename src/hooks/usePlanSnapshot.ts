import { useEffect, useState } from "react";
import {
  planSnapshotFallback,
  normalizePlanSnapshot,
  type PlanSnapshot,
} from "../data/planSnapshot";

type State = PlanSnapshot & {
  isLoading: boolean;
  isAvailable: boolean;
};

/**
 * agent 가 `public/plan-snapshot.json` 으로 push 해 둔 오늘 플랜을 읽음.
 * 파일이 없으면 (404) fallback + isAvailable=false 로 graceful.
 */
export function usePlanSnapshot(): State {
  const [payload, setPayload] = useState<PlanSnapshot>(planSnapshotFallback);
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetch(`${import.meta.env.BASE_URL}plan-snapshot.json`, { cache: "no-cache" })
      .then((response) => {
        if (!response.ok) throw new Error("plan snapshot unavailable");
        return response.json();
      })
      .then((data: unknown) => {
        if (!isMounted) return;
        setPayload(normalizePlanSnapshot(data));
        setIsAvailable(true);
      })
      .catch(() => {
        if (!isMounted) return;
        setPayload(planSnapshotFallback);
        setIsAvailable(false);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { ...payload, isLoading, isAvailable };
}
