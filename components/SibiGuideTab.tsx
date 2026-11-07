"use client";

import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Layers,
  Award,
  FileText,
  ClipboardList,
  Compass,
  ShieldCheck,
  ArrowRight,
  BookmarkCheck,
} from "lucide-react";
import {
  SIBI_PJOK_BOOKS,
  SIBI_ELEMEN_CP_PJOK,
  SIBI_KERANGKA_PEMBELAJARAN,
  SibiUnit,
  getSibiBookByGrade,
} from "@/lib/sibi-pjok-data";

interface SibiGuideTabProps {
  selectedGrade?: string;
  onApplyToRpp: (grade: string, unit: SibiUnit) => void;
  onApplyToMateri: (grade: string, fase: string, unit: SibiUnit) => void;
  onApplyToLkpd: (grade: string, fase: string, unit: SibiUnit) => void;
  onApplyToSoal: (grade: string, fase: string, unit: SibiUnit) => void;
}

export default function SibiGuideTab({
  selectedGrade = "IV",
  onApplyToRpp,
  onApplyToMateri,
  onApplyToLkpd,
  onApplyToSoal,
}: SibiGuideTabProps) {
  const [activeGrade, setActiveGrade] = useState<"I" | "II" | "III" | "IV" | "V" | "VI">(
    (["I", "II", "III", "IV", "V", "VI"].includes(selectedGrade)
      ? selectedGrade
      : "IV") as "I" | "II" | "III" | "IV" | "V" | "VI"
  );
  const [expandedUnit, setExpandedUnit] = useState<number>(1);

  const currentBook = SIBI_PJOK_BOOKS[activeGrade] || SIBI_PJOK_BOOKS["IV"];

  return (
    <div className="space-y-8" id="sibi-guide-tab">
      {/* Header Banner Resmi SIBI Kemendikbudristek */}
      <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <BookmarkCheck className="w-4 h-4 text-emerald-400" />
              Referensi Kurikulum Resmi — SIBI Kemendikbudristek
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Buku Panduan Guru PJOK SD/MI (SIBI Pusat Perbukuan)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Seluruh perangkat ajar pada aplikasi ini (Modul Ajar/RPP, Bahan Ajar, Slide Presentasi, LKPD, Kisi-Kisi & Soal Praktik, hingga Rubrik Penilaian Proses Gerak) diselaraskan dengan{" "}
              <span className="text-emerald-400 font-bold">
                Buku Panduan Guru Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)
              </span>{" "}
              yang diterbitkan oleh{" "}
              <span className="text-white font-semibold">
                Sistem Informasi Perbukuan Indonesia (SIBI) — Pusat Perbukuan BSKAP Kemendikbudristek
              </span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={currentBook.sibiCatalogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20"
            >
              <BookOpen className="w-4 h-4" />
              Buka Katalog Resmi SIBI
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Pemilih Kelas I - VI */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Pilih Jenjang Buku Panduan Guru PJOK SIBI:
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(["I", "II", "III", "IV", "V", "VI"] as const).map((g) => {
              const book = SIBI_PJOK_BOOKS[g];
              const isSelected = activeGrade === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setActiveGrade(g);
                    setExpandedUnit(1);
                  }}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold border transition-all flex flex-col items-center ${
                    isSelected
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20"
                      : "bg-slate-950/90 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span>Kelas {g}</span>
                  <span
                    className={`text-[10px] font-semibold ${
                      isSelected ? "text-slate-900" : "text-slate-500"
                    }`}
                  >
                    {book.fase}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kartu Identitas Buku Resmi SIBI & 4 Elemen CP PJOK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Identitas Buku */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                Identitas Buku Teks Utama SIBI
              </span>
              <h3 className="text-base font-black text-white">
                {currentBook.kelasLabel} ({currentBook.fase})
              </h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800/80 space-y-2.5 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Judul Resmi SIBI:</span>
              <span className="text-slate-100 font-bold">{currentBook.bookTitle}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Penulis:</span>
                <span className="text-slate-200 font-semibold">{currentBook.authors}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">ISBN Resmi:</span>
                <span className="text-emerald-400 font-mono font-bold">{currentBook.isbn}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Penerbit Resmi:</span>
              <span className="text-slate-300">{currentBook.publisher}</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/60">
            {currentBook.elemenRingkasan}
          </p>
        </div>

        {/* 4 Elemen Capaian Pembelajaran PJOK (BSKAP & SIBI) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">
                  Struktur Kurikulum Merdeka PJOK
                </span>
                <h3 className="text-base font-black text-white">
                  4 Elemen Capaian Pembelajaran (CP) Buku Panduan PJOK SIBI
                </h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SIBI_ELEMEN_CP_PJOK.map((el) => (
              <div
                key={el.kode}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {el.kode}
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-white">{el.nama}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{el.deskripsi}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daftar Lengkap Unit 1 s.d. Unit 8 Buku Panduan Guru PJOK SIBI */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Silabus & Unit Pembelajaran Resmi SIBI (Unit 1 s.d. Unit 8)
            </span>
            <h3 className="text-xl font-black text-white mt-0.5">
              Rincian Unit Pembelajaran {currentBook.kelasLabel} ({currentBook.fase})
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Klik salah satu Unit di bawah ini untuk melihat detail Tujuan Pembelajaran, Aktivitas 1–3, KKTP, dan menerapkannya langsung ke Modul Ajar, Materi Ajar, LKPD, atau Soal Praktik.
            </p>
          </div>
          <span className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 shrink-0">
            Total: {currentBook.units.length} Unit Pembelajaran
          </span>
        </div>

        {/* Unit Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {currentBook.units.map((u) => {
            const active = expandedUnit === u.unitNumber;
            return (
              <button
                key={u.unitNumber}
                type="button"
                onClick={() => setExpandedUnit(u.unitNumber)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  active
                    ? "bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                    : "bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      active ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    Unit {u.unitNumber}
                  </span>
                </div>
                <p className="text-[11px] font-bold line-clamp-2 leading-snug">
                  {u.title.replace(/^Unit \d+:\s*/i, "")}
                </p>
              </button>
            );
          })}
        </div>

        {/* Detail Unit Terpilih */}
        {currentBook.units
          .filter((u) => u.unitNumber === expandedUnit)
          .map((unit) => (
            <div
              key={unit.unitNumber}
              className="p-6 rounded-3xl bg-slate-950/90 border border-emerald-500/30 space-y-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                      {unit.elemen}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-semibold">
                      Alokasi: {unit.alokasiWaktu}
                    </span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-white">{unit.title}</h4>
                </div>

                {/* Tombol Integrasi 1-Klik ke Menu AI */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onApplyToRpp(activeGrade, unit)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Buat Modul Ajar (RPP)
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyToMateri(activeGrade, currentBook.fase, unit)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 font-bold text-xs transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Buat Materi Ajar
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyToLkpd(activeGrade, currentBook.fase, unit)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    Buat LKPD
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyToSoal(activeGrade, currentBook.fase, unit)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-bold text-xs transition-all"
                  >
                    <Award className="w-3.5 h-3.5" />
                    Buat Soal Praktik & Rubrik
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Kolom Kiri: CP, TP, Pokok Materi */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                      Capaian Pembelajaran Unit (Standar SIBI)
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {unit.capaianPembelajaran}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-400 block">
                      Tujuan Pembelajaran (TP) Buku Panduan Guru SIBI
                    </span>
                    <ul className="space-y-2">
                      {unit.tujuanPembelajaran.map((tp, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{tp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 block">
                      Pokok Materi & Kata Kunci
                    </span>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                      {unit.pokokMateri.map((pm, idx) => (
                        <li key={idx}>{pm}</li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {unit.kataKunci.map((kw, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-semibold text-slate-300"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Alur Aktivitas 1, 2, 3, Pembelajaran Alternatif, dan KKTP */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                      Pentahapan Kegiatan Inti Buku Panduan PJOK SIBI
                    </span>
                    <div className="space-y-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                        <strong className="text-emerald-300 block mb-0.5">
                          Aktivitas Pembelajaran 1 (Eksplorasi Teknik Dasar):
                        </strong>
                        <span className="text-slate-300">{unit.aktivitasPembelajaran.aktivitas1}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                        <strong className="text-sky-300 block mb-0.5">
                          Aktivitas Pembelajaran 2 (Variasi & Kombinasi Gerak):
                        </strong>
                        <span className="text-slate-300">{unit.aktivitasPembelajaran.aktivitas2}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                        <strong className="text-amber-300 block mb-0.5">
                          Aktivitas Pembelajaran 3 (Permainan Peraturan Dimodifikasi):
                        </strong>
                        <span className="text-slate-300">
                          {unit.aktivitasPembelajaran.aktivitas3Permainan}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-400 block">
                      Pembelajaran Alternatif & Modifikasi Sarana (SIBI)
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {unit.pembelajaranAlternatif}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                      Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)
                    </span>
                    <p className="text-xs text-emerald-100/90 leading-relaxed">{unit.kktp}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Kerangka Baku Pelaksanaan Pembelajaran Buku Panduan Guru PJOK SIBI */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Standar Operasional Pembelajaran PJOK
            </span>
            <h3 className="text-base font-black text-white">
              5 Tahap Kerangka Panduan Pembelajaran Buku Guru PJOK SIBI
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {SIBI_KERANGKA_PEMBELAJARAN.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between space-y-2"
            >
              <div className="space-y-1.5">
                <span className="text-xs font-black text-emerald-400 block">{item.tahap}</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.rincian}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SibiQuickPickerProps {
  grade: string;
  onSelectUnit: (unit: SibiUnit, bookTitle: string) => void;
  label?: string;
}

export function SibiQuickPicker({
  grade,
  onSelectUnit,
  label = "Pilih Unit Resmi Buku Panduan Guru PJOK SIBI (Kemendikbudristek):",
}: SibiQuickPickerProps) {
  const book = getSibiBookByGrade(grade);

  return (
    <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[11px] font-extrabold text-emerald-300">{label}</span>
        </div>
        <span className="text-[10px] font-semibold text-slate-400">
          {book.bookTitle} (ISBN {book.isbn})
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {book.units.map((u) => (
          <button
            key={u.unitNumber}
            type="button"
            onClick={() => onSelectUnit(u, book.bookTitle)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 border border-slate-700/80 hover:border-emerald-400 text-[11px] font-bold transition-all"
            title={u.title}
          >
            <span className="text-emerald-400 group-hover:text-slate-950 font-black">
              Unit {u.unitNumber}:
            </span>
            <span className="truncate max-w-[210px]">
              {u.title.replace(/^Unit \d+:\s*/i, "")}
            </span>
            <ArrowRight className="w-3 h-3 opacity-70" />
          </button>
        ))}
      </div>
    </div>
  );
}
