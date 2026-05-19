import { useEffect, useState } from "react";
import {
  githubLanguagesFallback,
  normalizeGithubLanguages,
  type GithubLanguagesPayload,
} from "../data/githubLanguages";

type State = GithubLanguagesPayload & { isLoading: boolean };

export function useGithubLanguages(): State {
  const [payload, setPayload] = useState<GithubLanguagesPayload>(githubLanguagesFallback);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch(`${import.meta.env.BASE_URL}github-languages.json`, { cache: "no-cache" })
      .then((response) => {
        if (!response.ok) throw new Error("GitHub languages unavailable");
        return response.json();
      })
      .then((data: unknown) => {
        if (isMounted) setPayload(normalizeGithubLanguages(data));
      })
      .catch(() => {
        if (isMounted) setPayload(githubLanguagesFallback);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { ...payload, isLoading };
}
