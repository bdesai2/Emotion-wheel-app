// Vite environment types for ImportMeta.env
interface ImportMetaEnv {
  readonly VITE_ANTHROPIC_API_KEY?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_API_TIMEOUT?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_ANTHROPIC_MODEL?: string;
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
