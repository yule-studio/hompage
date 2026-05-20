import { useEffect, useState } from "react";
import { blogFallback, normalizeBlog, type BlogPayload } from "../data/blog";

type State = BlogPayload & { isLoading: boolean };

export function useBlog(): State {
  const [payload, setPayload] = useState<BlogPayload>(blogFallback);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch(`${import.meta.env.BASE_URL}blog.json`, { cache: "no-cache" })
      .then((response) => {
        if (!response.ok) throw new Error("Blog data unavailable");
        return response.json();
      })
      .then((data: unknown) => {
        if (isMounted) setPayload(normalizeBlog(data));
      })
      .catch(() => {
        if (isMounted) setPayload(blogFallback);
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
