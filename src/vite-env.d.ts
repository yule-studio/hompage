/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the comment API (yule-studio/hompage-comments). */
  readonly VITE_COMMENTS_API?: string;
  /** Base URL of the résumé API — same repo, masks the PDF per download. */
  readonly VITE_RESUME_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
