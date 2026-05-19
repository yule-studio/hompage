import { useEffect, useState } from "react";
import {
  githubTopicsFallback,
  normalizeGithubTopics,
  type GithubTopicsPayload,
} from "../data/githubTopics";

type State = GithubTopicsPayload & { isLoading: boolean };

export function useGithubTopics(): State {
  const [payload, setPayload] = useState<GithubTopicsPayload>(githubTopicsFallback);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch(`${import.meta.env.BASE_URL}github-topics.json`, { cache: "no-cache" })
      .then((response) => {
        if (!response.ok) throw new Error("GitHub topics unavailable");
        return response.json();
      })
      .then((data: unknown) => {
        if (isMounted) setPayload(normalizeGithubTopics(data));
      })
      .catch(() => {
        if (isMounted) setPayload(githubTopicsFallback);
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
