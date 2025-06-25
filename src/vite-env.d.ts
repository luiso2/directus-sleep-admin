/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DIRECTUS_URL: string
  readonly VITE_DIRECTUS_TOKEN: string
  readonly VITE_APP_TITLE: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
