/**
 * Demo clips for project tiles, keyed by repo slug.
 *
 * Kept apart from `projects.json` on purpose — that file is regenerated from
 * the GitHub API by `npm run github:projects`, so anything written into it is
 * lost on the next sync. This is hand-maintained source, and a project without
 * an entry simply keeps the generated poster.
 */
export type ProjectDemo = {
  src: string;
  /** first frame, shown until the clip plays */
  poster: string;
};

export const projectDemos: Record<string, ProjectDemo> = {
  hompage: {
    src: `${import.meta.env.BASE_URL}media/hompage-demo.mp4`,
    poster: `${import.meta.env.BASE_URL}media/hompage-demo.jpg`,
  },
};
