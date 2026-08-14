/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the comment API (yule-studio/hompage-comments). */
  readonly VITE_COMMENTS_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
