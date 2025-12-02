/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_AUTH_PASSWORD: string
    readonly VITE_USE_LOCAL_STORAGE?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}