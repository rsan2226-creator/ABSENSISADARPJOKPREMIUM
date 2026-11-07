"use client";

import React, { useState } from "react";
import {
  Database,
  Terminal,
  CheckCircle2,
  Copy,
  CloudUpload,
  Server,
  Globe,
  ShieldCheck,
  FileJson,
  Download,
  Layers,
  ExternalLink,
} from "lucide-react";

interface DatabaseCloudGuideProps {
  studentsCount: number;
  rombelsCount: number;
  attendanceCount: number;
  gradesCount: number;
  plansCount: number;
  inventoryCount: number;
  scheduleCount: number;
  onExportJsonBackup: () => void;
}

const FULL_SQL_SCRIPT = `-- ============================================================================
-- SKEMA DATABASE UTAMA & RELASIONAL: SADAR PJOK SD (SUPABASE - ABSENSI2027)
-- Project ID : adbrzheropnjefvoexhti
-- Endpoint   : https://dbrzheropnjefvoexhti.supabase.co
-- ============================================================================

-- 1. TABEL UTAMA PENYIMPANAN SINKRONISASI REAL-TIME (KEY-VALUE JSONB)
create table if not exists public.sadar_app_data (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indeks pencarian cepat pada timestamp pembaruan
create index if not exists idx_sadar_app_data_updated_at
  on public.sadar_app_data (updated_at desc);

-- Aktifkan Row Level Security (RLS)
alter table public.sadar_app_data enable row level security;

-- Hapus policy lama jika sudah ada agar tidak duplikat saat dijalankan ulang
drop policy if exists "Allow public read access" on public.sadar_app_data;
drop policy if exists "Allow public insert access" on public.sadar_app_data;
drop policy if exists "Allow public update access" on public.sadar_app_data;
drop policy if exists "Allow public delete access" on public.sadar_app_data;

-- Buat Policy Akses Publik untuk Aplikasi SADAR PJOK
create policy "Allow public read access"
  on public.sadar_app_data for select using (true);

create policy "Allow public insert access"
  on public.sadar_app_data for insert with check (true);

create policy "Allow public update access"
  on public.sadar_app_data for update using (true) with check (true);

create policy "Allow public delete access"
  on public.sadar_app_data for delete using (true);

-- 2. FUNGSI OTOMATIS UPDATE TIMESTAMP
create or replace function public.handle_sadar_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sadar_app_data_updated_at on public.sadar_app_data;
create trigger trg_sadar_app_data_updated_at
  before update on public.sadar_app_data
  for each row execute function public.handle_sadar_updated_at();

-- 3. SEED KEYS AWAL AGAR TABEL LANGSUNG SIAP DIGUNAKAN
insert into public.sadar_app_data (key, value)
values
  ('sadar_students', '[]'::jsonb),
  ('sadar_custom_rombels', '["IV-A", "IV-B", "V-A", "V-B", "VI-A", "VI-B"]'::jsonb),
  ('sadar_attendance_records', '[]'::jsonb),
  ('sadar_student_grades', '{}'::jsonb),
  ('sadar_saved_plans', '[]'::jsonb),
  ('sadar_inventory', '[]'::jsonb),
  ('sadar_schedule', '[]'::jsonb)
on conflict (key) do nothing;`;

const ENV_TEMPLATE = `# =========================================================
# KONFIGURASI ENVIRONMENT PRODUCTION (.env.local / Vercel / Cloud Run)
# =========================================================

# 1. Kredensial Database Cloud Supabase (Project: Absensi2027)
NEXT_PUBLIC_SUPABASE_PROJECT_NAME="Absensi2027"
NEXT_PUBLIC_SUPABASE_PROJECT_ID="adbrzheropnjefvoexhti"
NEXT_PUBLIC_SUPABASE_URL="https://dbrzheropnjefvoexhti.supabase.co"
NEXT_PUBLIC_SUPABASE_REST_URL="https://dbrzheropnjefvoexhti.supabase.co/rest/v1/"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_qGUej4CCU1TpMueHJ7UGjA_nszgX221"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRicnpoZXJvcG5qZWZ2b2V4aHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5NjU1NDYsImV4cCI6MjEwOTU0MTU0Nn0.rOLbgGsajUDWvTWNVIBntjTZvJLaegDE5g2_2SknTOY"

# 2. Kunci API AI Server-Side (Untuk Modul Ajar, LKPD, Materi, Slide, & Soal Praktik AI)
GEMINI_API_KEY="MASUKKAN_GEMINI_API_KEY_ANDA_DI_SINI"`;

const DOCKER_COMMANDS = `# 1. Clone repositori & masuk ke direktori proyek
git clone <url-repo-anda> sadar-pjok-sd
cd sadar-pjok-sd

# 2. Instal seluruh dependensi paket
npm install

# 3. Buat file .env.local dan isi kredensial Supabase Absensi2027 & GEMINI_API_KEY
cp .env.example .env.local

# 4. Build aplikasi Next.js untuk Production
npm run build

# 5. Jalankan server production pada port 3000
npm run start`;

export default function DatabaseCloudGuide({
  studentsCount,
  rombelsCount,
  attendanceCount,
  gradesCount,
  plansCount,
  inventoryCount,
  scheduleCount,
  onExportJsonBackup,
}: DatabaseCloudGuideProps) {
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);
  const [activeDeployTab, setActiveDeployTab] = useState<
    "cloudrun" | "vercel" | "vps"
  >("vercel");

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBlock(id);
    setTimeout(() => setCopiedBlock(null), 2500);
  };

  const entities = [
    {
      no: 1,
      name: "Data Induk & Kebugaran Siswa (TKJI)",
      key: "sadar_students",
      count: `${studentsCount} Siswa`,
      menu: "Penilaian Kebugaran & Data Rombel",
    },
    {
      no: 2,
      name: "Daftar Rombongan Belajar (Kelas)",
      key: "sadar_custom_rombels",
      count: `${rombelsCount} Rombel`,
      menu: "Data Siswa & Input Rombel",
    },
    {
      no: 3,
      name: "Rekaman Absensi Harian, Mingguan, Bulanan & Semester",
      key: "sadar_attendance_records",
      count: `${attendanceCount} Sesi Pertemuan`,
      menu: "Absensi Siswa Taktis",
    },
    {
      no: 4,
      name: "Rekapitulasi Nilai Akhir Semester (TP, STS, PAS)",
      key: "sadar_student_grades",
      count: `${gradesCount} Rekaman Nilai`,
      menu: "Rekap Nilai Siswa",
    },
    {
      no: 5,
      name: "Koleksi Modul Ajar (RPP) Kurikulum Merdeka",
      key: "sadar_saved_plans",
      count: `${plansCount} Dokumen RPP`,
      menu: "Asisten Modul Ajar",
    },
    {
      no: 6,
      name: "Buku Inventaris Sarana & Alat Olahraga",
      key: "sadar_inventory",
      count: `${inventoryCount} Jenis Alat`,
      menu: "Inventaris Alat",
    },
    {
      no: 7,
      name: "Agenda & Jadwal Mengajar Pelajaran PJOK",
      key: "sadar_schedule",
      count: `${scheduleCount} Jadwal Aktif`,
      menu: "Agenda Pelajaran",
    },
  ];

  return (
    <div className="space-y-8" id="database-complete-guide">
      {/* 1. TABEL RINCIAN ENTITAS DATABASE & BACKUP JSON */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold mb-2 border border-emerald-200">
              <Layers className="h-3.5 w-3.5" />
              STRUKTUR PENYIMPANAN TABEL CLOUD SUPABASE
            </div>
            <h4 className="text-xl font-black text-slate-900">
              Peta Sinkronisasi Entitas Data Aplikasi (`public.sadar_app_data`)
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Seluruh modul aplikasi tersimpan secara terpusat dalam format JSONB
              terindeks di proyek Supabase <strong>Absensi2027</strong> dan
              dapat dicadangkan ke file lokal kapan saja.
            </p>
          </div>

          <button
            type="button"
            onClick={onExportJsonBackup}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
          >
            <FileJson className="h-4 w-4 text-emerald-400" />
            Unduh Backup Database Lengkap (.json)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3 text-center border-r border-slate-700 w-10">
                  No
                </th>
                <th className="py-3 px-4 border-r border-slate-700">
                  Nama Entitas / Modul Data
                </th>
                <th className="py-3 px-4 border-r border-slate-700">
                  Primary Key (`sadar_app_data.key`)
                </th>
                <th className="py-3 px-4 border-r border-slate-700">
                  Menu Terkait
                </th>
                <th className="py-3 px-4 text-center border-r border-slate-700">
                  Volume Data Saat Ini
                </th>
                <th className="py-3 px-4 text-center">Status Replikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entities.map((ent) => (
                <tr key={ent.key} className="hover:bg-slate-50/80">
                  <td className="py-3 px-3 text-center font-bold text-slate-500 border-r border-slate-100">
                    {ent.no}
                  </td>
                  <td className="py-3 px-4 font-extrabold text-slate-800 border-r border-slate-100">
                    {ent.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-emerald-700 font-bold border-r border-slate-100">
                    {ent.key}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-semibold border-r border-slate-100">
                    {ent.menu}
                  </td>
                  <td className="py-3 px-4 text-center font-black text-slate-900 border-r border-slate-100">
                    {ent.count}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold">
                      <CheckCircle2 className="h-3 w-3" /> Auto-Sync Aktif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. SKRIP SQL LENGKAP SUPABASE BESERTA TRIGGER & SEED DATA */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-lg border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-extrabold mb-2 border border-emerald-500/20">
              <Terminal className="h-3.5 w-3.5" />
              SQL EDITOR MIGRATION SCRIPT — SUPABASE ABSENSI2027
            </div>
            <h4 className="text-lg font-black text-white">
              Skrip SQL Lengkap Pembuatan Tabel, Indeks, Trigger &amp; Policy RLS
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Aman dijalankan berulang kali (idempotent menggunakan{" "}
              <code className="text-emerald-300">if not exists</code> dan{" "}
              <code className="text-emerald-300">on conflict do nothing</code>).
            </p>
          </div>

          <button
            type="button"
            onClick={() => copyText("sql-full", FULL_SQL_SCRIPT)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-md"
          >
            <Copy className="h-3.5 w-3.5" />
            {copiedBlock === "sql-full"
              ? "✓ Skrip SQL Berhasil Disalin!"
              : "Salin Skrip SQL Lengkap"}
          </button>
        </div>

        <pre className="p-4 bg-slate-950 rounded-2xl text-[11px] text-emerald-400 font-mono border border-slate-800 overflow-x-auto leading-relaxed max-h-[340px]">
          {FULL_SQL_SCRIPT}
        </pre>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80">
            <span className="text-[10px] font-black uppercase text-emerald-400">
              Langkah 1
            </span>
            <p className="text-xs font-bold text-white mt-1">
              Buka Dashboard Supabase
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Masuk ke proyek <strong>Absensi2027</strong> (ID:{" "}
              <code>adbrzheropnjefvoexhti</code>).
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80">
            <span className="text-[10px] font-black uppercase text-emerald-400">
              Langkah 2
            </span>
            <p className="text-xs font-bold text-white mt-1">
              Buka Menu SQL Editor
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Klik ikon <strong>SQL Editor</strong> di bilah kiri, lalu pilih{" "}
              <strong>+ New Query</strong>.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80">
            <span className="text-[10px] font-black uppercase text-emerald-400">
              Langkah 3
            </span>
            <p className="text-xs font-bold text-white mt-1">
              Tempel &amp; Klik Run
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tempel skrip SQL di atas lalu tekan tombol hijau{" "}
              <strong>Run (Ctrl+Enter)</strong>.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80">
            <span className="text-[10px] font-black uppercase text-emerald-400">
              Langkah 4
            </span>
            <p className="text-xs font-bold text-white mt-1">
              Klik &quot;Cek Koneksi&quot; &amp; PUSH
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Kembali ke halaman ini, klik <strong>Cek Koneksi</strong> lalu{" "}
              <strong>Kirim ke Cloud (PUSH)</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* 3. PANDUAN LENGKAP CARA DEPLOY APLIKASI KE PRODUCTION */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-extrabold mb-2 border border-indigo-200">
              <Globe className="h-3.5 w-3.5" />
              PANDUAN LENGKAP DEPLOYMENT KE PRODUCTION (ONLINE 24 JAM)
            </div>
            <h4 className="text-xl font-black text-slate-900">
              Cara Deploy Aplikasi SADAR PJOK SD beserta Koneksi Supabase
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Pilih metode hosting yang Anda inginkan untuk menayangkan aplikasi
              secara online agar dapat diakses dari laptop maupun smartphone.
            </p>
          </div>

          {/* Pilihan Platform Deploy */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveDeployTab("vercel")}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeDeployTab === "vercel"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Globe className="h-3.5 w-3.5 text-emerald-400" />
              1. Deploy ke Vercel (Rekomendasi)
            </button>
            <button
              type="button"
              onClick={() => setActiveDeployTab("cloudrun")}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeDeployTab === "cloudrun"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CloudUpload className="h-3.5 w-3.5 text-indigo-400" />
              2. Deploy via Google Cloud Run
            </button>
            <button
              type="button"
              onClick={() => setActiveDeployTab("vps")}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeDeployTab === "vps"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Server className="h-3.5 w-3.5 text-amber-400" />
              3. Server Sekolah / VPS / Docker
            </button>
          </div>
        </div>

        {/* Konten Tab Deploy 1: VERCEL */}
        {activeDeployTab === "vercel" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                  01
                </div>
                <h5 className="font-extrabold text-sm text-slate-900">
                  Unggah Kode ke GitHub
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unduh/ekspor kode sumber proyek ini ke akun{" "}
                  <strong>GitHub</strong> Anda sebagai repositori baru (misal:{" "}
                  <code>sadar-pjok-sd</code>).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                  02
                </div>
                <h5 className="font-extrabold text-sm text-slate-900">
                  Import Project di Vercel &amp; Isi Environment Variables
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Buka <strong>vercel.com/new</strong>, pilih repositori{" "}
                  <code>sadar-pjok-sd</code>. Framework Preset otomatis
                  terdeteksi sebagai <strong>Next.js</strong>. Buka bagian{" "}
                  <strong>Environment Variables</strong> lalu tempel variabel di
                  bawah ini.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                  03
                </div>
                <h5 className="font-extrabold text-sm text-slate-900">
                  Klik Deploy &amp; Selesai!
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Klik tombol <strong>Deploy</strong>. Dalam ~1 menit aplikasi
                  Anda akan aktif dengan domain{" "}
                  <code>https://sadar-pjok-sd.vercel.app</code> dan terhubung
                  langsung ke database Supabase <strong>Absensi2027</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Konten Tab Deploy 2: GOOGLE CLOUD RUN */}
        {activeDeployTab === "cloudrun" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  01
                </div>
                <h5 className="font-extrabold text-sm text-slate-900">
                  Klik Tombol Deploy / Publish di Bagian Atas
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pada toolbar kanan atas layar editor ini, klik tombol{" "}
                  <strong>Deploy / Share App</strong> untuk memulai proses
                  deployment otomatis ke Google Cloud Run.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  02
                </div>
                <h5 className="font-extrabold text-sm text-slate-900">
                  Konfigurasi Environment Variables Cloud Run
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pastikan variabel <code>GEMINI_API_KEY</code>,{" "}
                  <code>NEXT_PUBLIC_SUPABASE_URL</code>, dan{" "}
                  <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> sudah terdaftar
                  pada pengaturan Secrets / Environment Variables layanan Cloud
                  Run Anda.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                  03
                </div>
                <h5 className="font-extrabold text-sm text-slate-900">
                  Bagikan Tautan Resmi Sekolah
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Setelah proses build selesai, Anda akan mendapatkan URL publik{" "}
                  <code>.run.app</code> yang aman (HTTPS) dan siap digunakan di
                  sekolah.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Konten Tab Deploy 3: VPS / SERVER SEKOLAH */}
        {activeDeployTab === "vps" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold text-slate-700">
                Perintah Terminal untuk Deploy di Server Sekolah / Ubuntu VPS /
                Node.js 20+:
              </p>
              <button
                type="button"
                onClick={() => copyText("docker-cmd", DOCKER_COMMANDS)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5 text-emerald-400" />
                {copiedBlock === "docker-cmd"
                  ? "✓ Perintah Tersalin!"
                  : "Salin Perintah Terminal"}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-2xl text-[11px] text-emerald-400 font-mono border border-slate-800 overflow-x-auto leading-relaxed">
              {DOCKER_COMMANDS}
            </pre>
          </div>
        )}

        {/* Blok Variabel Environment (.env) Siap Salin */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h5 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Daftar Variabel Environment (`.env.local` / Vercel / Cloud Run)
                Siap Salin
              </h5>
              <p className="text-xs text-slate-500">
                Salin dan tempel daftar variabel berikut ke pengaturan{" "}
                <strong>Environment Variables</strong> saat melakukan deploy:
              </p>
            </div>

            <button
              type="button"
              onClick={() => copyText("env-vars", ENV_TEMPLATE)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Copy className="h-3.5 w-3.5" />
              {copiedBlock === "env-vars"
                ? "✓ Environment Variables Disalin!"
                : "Salin Semua Variabel .env"}
            </button>
          </div>

          <pre className="p-4 bg-slate-900 rounded-2xl text-[11px] text-amber-300 font-mono border border-slate-800 overflow-x-auto leading-relaxed">
            {ENV_TEMPLATE}
          </pre>
        </div>
      </div>
    </div>
  );
}
