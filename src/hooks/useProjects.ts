import { useEffect, useState } from "react";
import {
  normalizeProjectsPayload,
  projectsPayloadFallback,
  type ProjectsPayload,
} from "../data/projects";

type ProjectsState = ProjectsPayload & {
  isLoading: boolean;
};

export function useProjects(): ProjectsState {
  const [payload, setPayload] = useState<ProjectsPayload>(projectsPayloadFallback);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch(`${import.meta.env.BASE_URL}projects.json`, { cache: "no-cache" })
      .then((response) => {
        if (!response.ok) throw new Error("Projects unavailable");
        return response.json();
      })
      .then((data: unknown) => {
        if (isMounted) setPayload(normalizeProjectsPayload(data));
      })
      .catch(() => {
        if (isMounted) setPayload(projectsPayloadFallback);
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
