/**
 * Demo clips for project tiles, keyed by repo slug.
 *
 * Kept apart from `projects.json` on purpose — that file is regenerated from
 * the GitHub API by `npm run github:projects`, so anything written into it is
 * lost on the next sync. This is hand-maintained source, and a project without
 * an entry simply keeps the generated poster.
 */
const media = (file: string) => `${import.meta.env.BASE_URL}media/${file}`;

/**
 * One screen of the walkthrough, cut out of the full recording. The tile plays
 * them in order and names each one as it goes, so a card that used to be
 * "a video is running" becomes a tour: this screen, then this one, then this.
 *
 * The clips are cut from `hompage-demo.mp4` with ffmpeg — cropped to the browser
 * viewport (the recording pads it out with dead bands) and re-encoded per
 * section. See `docs/demo-clips.md` for the recipe.
 */
export type DemoSection = {
  /** the section as the site itself names it — printed under the card */
  label: string;
  src: string;
  poster: string;
};

export type ProjectDemo = {
  src: string;
  /** first frame, shown until the clip plays */
  poster: string;
  /** the walkthrough cut by section — the tile cycles through these */
  sections?: DemoSection[];
  /**
   * Playback rate for the section clips. The recording was made at reading
   * speed, which is a little quick once it is a thumbnail — easing off is
   * enough to follow it without the whole thing turning into slow motion.
   */
  rate?: number;
};

const section = (slug: string, key: string, label: string): DemoSection => ({
  label,
  src: media(`demo/${slug}-${key}.mp4`),
  poster: media(`demo/${slug}-${key}.jpg`),
});

export const projectDemos: Record<string, ProjectDemo> = {
  hompage: {
    src: media("hompage-demo.mp4"),
    poster: media("hompage-demo.jpg"),
    rate: 0.85,
    sections: [
      section("hompage", "intro", "Intro"),
      section("hompage", "about", "About"),
      section("hompage", "portfolio", "Portfolio"),
      section("hompage", "contact", "Contact"),
    ],
  },
};
