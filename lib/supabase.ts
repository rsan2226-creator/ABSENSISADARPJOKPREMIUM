import { createClient, SupabaseClient } from "@supabase/supabase-js";

let serverSupabaseClient: SupabaseClient | null = null;
let browserSupabaseClient: SupabaseClient | null = null;

export const DEFAULT_PROJECT_NAME = "Absensi2027";
export const DEFAULT_PROJECT_ID = "adbrzheropnjefvoexhti";
export const DEFAULT_SUPABASE_REF = "dbrzheropnjefvoexhti";
export const DEFAULT_SUPABASE_URL = "https://dbrzheropnjefvoexhti.supabase.co";
export const DEFAULT_SUPABASE_REST_URL = "https://dbrzheropnjefvoexhti.supabase.co/rest/v1/";
export const DEFAULT_PUBLIC_API_KEY = "sb_publishable_qGUej4CCU1TpMueHJ7UGjA_nszgX221";
export const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRicnpoZXJvcG5qZWZ2b2V4aHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5NjU1NDYsImV4cCI6MjEwOTU0MTU0Nn0.rOLbgGsajUDWvTWNVIBntjTZvJLaegDE5g2_2SknTOY";
export const DEFAULT_TABLE_NAME = "sadar_app_data";

export function getCleanSupabaseUrl(rawUrl?: string): string {
  const url = (
    rawUrl ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL
  ).trim();
  // Strip any /rest/v1 or trailing slashes so @supabase/supabase-js receives the base project URL
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

export function getSupabaseProjectInfo(customUrl?: string) {
  const cleanUrl = getCleanSupabaseUrl(customUrl);

  return {
    projectId: DEFAULT_PROJECT_ID,
    projectRef: DEFAULT_SUPABASE_REF,
    projectUrl: `${cleanUrl}/rest/v1/`,
    baseUrl: cleanUrl,
    projectName: DEFAULT_PROJECT_NAME,
    publicApiKey: DEFAULT_PUBLIC_API_KEY,
    tableName: DEFAULT_TABLE_NAME,
  };
}

export function sanitizeSupabaseErrorMessage(error: any): string {
  if (!error) return "Terjadi kesalahan tidak diketahui.";
  const rawMsg =
    typeof error === "string"
      ? error
      : String(error.message || error.details || "");

  if (
    rawMsg.includes("521") ||
    rawMsg.includes("Web server is down") ||
    rawMsg.includes("<!DOCTYPE html>") ||
    rawMsg.includes("<html") ||
    rawMsg.includes("cloudflare")
  ) {
    return "Instance Supabase sedang dalam mode jeda (Cloudflare 521). Sistem otomatis mengaktifkan Cloud Storage Relay Server sehingga sinkronisasi tetap berjalan normal.";
  }

  if (
    rawMsg.toLowerCase().includes("fetch failed") ||
    rawMsg.toLowerCase().includes("network")
  ) {
    return "Jaringan ke server eksternal tertunda. Sistem menggunakan Cloud Storage Relay Server.";
  }

  return rawMsg.slice(0, 280);
}

export function isSupabaseServerDownOrPaused(error: any): boolean {
  if (!error) return false;
  const rawMsg = typeof error === "string" ? error : String(error.message || "");
  const status = Number(error.status || error.code || 0);
  return (
    status === 521 ||
    status === 522 ||
    status === 523 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    rawMsg.includes("521") ||
    rawMsg.includes("Web server is down") ||
    rawMsg.includes("<!DOCTYPE html>") ||
    rawMsg.includes("<html") ||
    rawMsg.toLowerCase().includes("fetch failed") ||
    rawMsg.toLowerCase().includes("abort")
  );
}

export function createSupabaseInstance(url: string, key: string): SupabaseClient {
  const cleanUrl = getCleanSupabaseUrl(url);
  return createClient(cleanUrl, key.trim(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: async (input, init) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        try {
          return await fetch(input, {
            ...init,
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }
      },
    },
  });
}

export function getSupabaseClient() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;
  const supabaseKey = (
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY
  ).trim();

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  if (!serverSupabaseClient) {
    serverSupabaseClient = createSupabaseInstance(supabaseUrl, supabaseKey);
  }

  return serverSupabaseClient;
}

export function getBrowserClient(
  customUrl?: string,
  customKey?: string
): SupabaseClient {
  const url = customUrl || DEFAULT_SUPABASE_URL;
  const key = customKey || DEFAULT_SUPABASE_ANON_KEY;

  if (customUrl || customKey) {
    return createSupabaseInstance(url, key);
  }

  if (!browserSupabaseClient) {
    browserSupabaseClient = createSupabaseInstance(url, key);
  }
  return browserSupabaseClient;
}
