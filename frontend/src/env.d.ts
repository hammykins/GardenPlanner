/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_ENABLE_WEATHER: string
  readonly VITE_ENABLE_SATELLITE: string
  readonly VITE_MAP_TILE_URL: string
  readonly VITE_MAP_DEFAULT_ZOOM: string
  readonly VITE_MAP_MAX_ZOOM: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
