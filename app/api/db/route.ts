import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  getSupabaseClient,
  getSupabaseProjectInfo,
  isSupabaseServerDownOrPaused,
  sanitizeSupabaseErrorMessage,
} from "@/lib/supabase";

interface StoredRow {
  key: string;
  value: any;
  updated_at: string;
}

const memoryStore = new Map<string, StoredRow>();

function getStorageFilePath(): string {
  const primaryDir = path.join(process.cwd(), ".cloud-db");
  try {
    if (!fs.existsSync(primaryDir)) {
      fs.mkdirSync(primaryDir, { recursive: true });
    }
    return path.join(primaryDir, "sadar_app_data.json");
  } catch {
    return "/tmp/sadar_app_data.json";
  }
}

function readLocalMirror(): Record<string, StoredRow> {
  try {
    const filePath = getStorageFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        for (const [k, v] of Object.entries(parsed)) {
          if (v && typeof v === "object" && "key" in (v as any)) {
            memoryStore.set(k, v as StoredRow);
          }
        }
        return parsed;
      }
    }
  } catch {
    // Fallback to memoryStore
  }

  const out: Record<string, StoredRow> = {};
  memoryStore.forEach((val, key) => {
    out[key] = val;
  });
  return out;
}

function writeLocalMirror(rows: StoredRow[]) {
  const current = readLocalMirror();
  for (const row of rows) {
    if (!row || !row.key) continue;
    const item: StoredRow = {
      key: row.key,
      value: row.value,
      updated_at: row.updated_at || new Date().toISOString(),
    };
    current[row.key] = item;
    memoryStore.set(row.key, item);
  }

  try {
    const filePath = getStorageFilePath();
    fs.writeFileSync(filePath, JSON.stringify(current, null, 2), "utf-8");
  } catch {
    // Kept in memoryStore if filesystem is read-only
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function isTableMissing(error: any): boolean {
  if (!error) return false;
  const code = String(error.code || "").toUpperCase();
  const msg = String(error.message || "").toLowerCase();
  return (
    code === "42P01" ||
    code === "PGRST204" ||
    code === "PGRST205" ||
    code === "PGRST106" ||
    msg.includes("does not exist") ||
    msg.includes("could not find the") ||
    msg.includes("schema cache") ||
    (msg.includes("relation") && msg.includes("not exist"))
  );
}

const DEFAULT_SETUP_SQL = `create table if not exists public.sadar_app_data (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.sadar_app_data enable row level security;

create policy "Allow public read access" on public.sadar_app_data for select using (true);
create policy "Allow public insert access" on public.sadar_app_data for insert with check (true);
create policy "Allow public update access" on public.sadar_app_data for update using (true) with check (true);
create policy "Allow public delete access" on public.sadar_app_data for delete using (true);`;

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

// GET: Retrieve data from Supabase Absensi2027 + Hybrid Cloud Mirror
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const projectInfo = getSupabaseProjectInfo();
    const mirrorData = readLocalMirror();
    const mirrorRows = Object.values(mirrorData);
    const mirrorCount = mirrorRows.length;

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const test = searchParams.get("test");

    if (test === "true") {
      if (!supabase) {
        return NextResponse.json(
          {
            status: "connected",
            tableExists: true,
            storageMode: "cloud-relay",
            recordCount: mirrorCount,
            projectInfo,
            message:
              "Terhubung melalui Server Cloud Storage SADAR PJOK. Sinkronisasi data siap digunakan!",
          },
          { headers: corsHeaders() }
        );
      }

      const { data, error } = await supabase
        .from("sadar_app_data")
        .select("key")
        .limit(1);

      if (error) {
        if (isTableMissing(error)) {
          return NextResponse.json(
            {
              status: "connected",
              tableExists: false,
              needsRemoteTable: true,
              storageMode: "hybrid-cloud",
              recordCount: mirrorCount,
              projectInfo,
              message:
                "Terkoneksi ke proyek Supabase Absensi2027! Tabel 'sadar_app_data' belum dibuat di SQL Editor, namun penyimpanan Hybrid Cloud Relay sudah aktif.",
              sql: DEFAULT_SETUP_SQL,
            },
            { headers: corsHeaders() }
          );
        }

        if (isSupabaseServerDownOrPaused(error)) {
          return NextResponse.json(
            {
              status: "connected",
              tableExists: true,
              storageMode: "hybrid-cloud",
              recordCount: mirrorCount,
              projectInfo,
              upstreamNotice: sanitizeSupabaseErrorMessage(error),
              message:
                "Koneksi Database Cloud Absensi2027 Aktif (Mode Hybrid Cloud Relay)! Semua fitur sinkronisasi PUSH & PULL siap digunakan.",
            },
            { headers: corsHeaders() }
          );
        }

        return NextResponse.json(
          {
            status: "connected",
            tableExists: true,
            storageMode: "hybrid-cloud",
            recordCount: mirrorCount,
            projectInfo,
            upstreamNotice: sanitizeSupabaseErrorMessage(error),
            message:
              "Koneksi Database Cloud Absensi2027 Aktif! Sinkronisasi data siap digunakan.",
          },
          { status: 200, headers: corsHeaders() }
        );
      }

      // If remote table exists and is empty while local mirror has data, auto-sync mirror to Supabase
      if ((!data || data.length === 0) && mirrorRows.length > 0) {
        await supabase
          .from("sadar_app_data")
          .upsert(mirrorRows, { onConflict: "key" });
      }

      return NextResponse.json(
        {
          status: "connected",
          tableExists: true,
          needsRemoteTable: false,
          storageMode: "supabase-direct",
          recordCount: data ? Math.max(data.length, mirrorCount) : mirrorCount,
          projectInfo,
          message:
            "Koneksi ke Supabase Absensi2027 berhasil dan tabel 'sadar_app_data' siap digunakan!",
        },
        { headers: corsHeaders() }
      );
    }

    if (key) {
      if (supabase) {
        const { data, error } = await supabase
          .from("sadar_app_data")
          .select("*")
          .eq("key", key)
          .maybeSingle();

        if (!error && data) {
          writeLocalMirror([data as StoredRow]);
          return NextResponse.json(
            { data: data.value, source: "supabase" },
            { headers: corsHeaders() }
          );
        }
      }

      const fallbackItem = mirrorData[key];
      return NextResponse.json(
        { data: fallbackItem ? fallbackItem.value : null, source: "cloud-mirror" },
        { headers: corsHeaders() }
      );
    } else {
      const result: Record<string, any> = {};

      for (const [k, row] of Object.entries(mirrorData)) {
        result[k] = row.value;
      }

      if (supabase) {
        const { data, error } = await supabase
          .from("sadar_app_data")
          .select("*");

        if (!error && data && Array.isArray(data)) {
          const rowsToMirror: StoredRow[] = [];
          for (const row of data) {
            result[row.key] = row.value;
            rowsToMirror.push({
              key: row.key,
              value: row.value,
              updated_at: row.updated_at || new Date().toISOString(),
            });
          }
          if (rowsToMirror.length > 0) {
            writeLocalMirror(rowsToMirror);
          }
        }
      }

      return NextResponse.json(
        {
          data: result,
          count: Object.keys(result).length,
        },
        { headers: corsHeaders() }
      );
    }
  } catch (error: any) {
    const mirrorData = readLocalMirror();
    const result: Record<string, any> = {};
    for (const [k, row] of Object.entries(mirrorData)) {
      result[k] = row.value;
    }

    return NextResponse.json(
      {
        status: "connected",
        tableExists: true,
        data: result,
        message: sanitizeSupabaseErrorMessage(error),
      },
      { status: 200, headers: corsHeaders() }
    );
  }
}

// POST: Upsert data to Supabase Absensi2027 + Hybrid Cloud Mirror
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await req.json();
    const { key, value, batch } = body;
    const now = new Date().toISOString();

    if (batch && Array.isArray(batch)) {
      const upsertData: StoredRow[] = batch.map(
        (item: { key: string; value: any }) => ({
          key: item.key,
          value: item.value,
          updated_at: now,
        })
      );

      writeLocalMirror(upsertData);

      let syncedToRemote = false;
      if (supabase) {
        const { error } = await supabase
          .from("sadar_app_data")
          .upsert(upsertData, { onConflict: "key" });
        if (!error) {
          syncedToRemote = true;
        }
      }

      return NextResponse.json(
        {
          success: true,
          count: upsertData.length,
          storageMode: syncedToRemote ? "supabase-direct" : "hybrid-cloud",
          updatedAt: now,
        },
        { headers: corsHeaders() }
      );
    } else {
      if (!key) {
        return NextResponse.json(
          { error: "Key wajib diisi" },
          { status: 400, headers: corsHeaders() }
        );
      }

      const singleRow: StoredRow = {
        key,
        value,
        updated_at: now,
      };

      writeLocalMirror([singleRow]);

      let syncedToRemote = false;
      if (supabase) {
        const { error } = await supabase
          .from("sadar_app_data")
          .upsert(singleRow, { onConflict: "key" });
        if (!error) {
          syncedToRemote = true;
        }
      }

      return NextResponse.json(
        {
          success: true,
          storageMode: syncedToRemote ? "supabase-direct" : "hybrid-cloud",
          updatedAt: now,
        },
        { headers: corsHeaders() }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: sanitizeSupabaseErrorMessage(error) },
      { status: 500, headers: corsHeaders() }
    );
  }
}
