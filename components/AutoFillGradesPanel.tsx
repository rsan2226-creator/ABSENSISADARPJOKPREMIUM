"use client";

import React, { useState } from "react";
import {
  Wand2,
  Sparkles,
  Sliders,
  CheckCircle2,
  RotateCcw,
  Activity,
  BookOpen,
  Layers,
} from "lucide-react";
import { Student, calculateFitnessScore } from "@/lib/pe-utils";
import { getSibiBookByGrade } from "@/lib/sibi-pjok-data";

export interface StudentGradeEntry {
  tp1: number | "";
  tp2: number | "";
  tp3: number | "";
  tp4: number | "";
  stsTulisan: number | "";
  stsPraktik: number | "";
  pasTulisan: number | "";
  pasPraktik: number | "";
  notes: string;
}

interface AutoFillGradesPanelProps {
  gradesRombel: string;
  rombelStudents: Student[];
  attendanceRecords: any[];
  soalStudentScores: { [studentId: string]: { [soalIdx: number]: number | "" } };
  currentGrades: { [studentId: string]: StudentGradeEntry };
  onApplyAutoGrades: (
    updatedGradesForRombel: { [studentId: string]: StudentGradeEntry },
    summaryMessage: string
  ) => void;
  onApplySibiTpDescriptions: (tp1: string, tp2: string, tp3: string, tp4: string) => void;
}

export default function AutoFillGradesPanel({
  gradesRombel,
  rombelStudents,
  attendanceRecords,
  soalStudentScores,
  currentGrades,
  onApplyAutoGrades,
  onApplySibiTpDescriptions,
}: AutoFillGradesPanelProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [mode, setMode] = useState<"smart" | "range" | "uniform">("smart");
  const [targetScope, setTargetScope] = useState<
    "all" | "tp_only" | "sts_only" | "pas_only" | "notes_only"
  >("all");
  const [minScore, setMinScore] = useState<number>(78);
  const [maxScore, setMaxScore] = useState<number>(94);
  const [uniformScore, setUniformScore] = useState<number>(85);
  const [onlyEmptyFields, setOnlyEmptyFields] = useState<boolean>(false);
  const [autoGenerateNotes, setAutoGenerateNotes] = useState<boolean>(true);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  // Deterministic pseudo-random offset per student + field so scores look natural and realistic
  const getDeterministicOffset = (seedStr: string, min: number, max: number): number => {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash * 31 + seedStr.charCodeAt(i)) % 10007;
    }
    const span = Math.max(1, max - min + 1);
    return min + (hash % span);
  };

  const clampScore = (val: number, low = 70, high = 98): number => {
    return Math.min(high, Math.max(low, Math.round(val)));
  };

  const buildNoteByFinalScore = (na: number, studentName: string): string => {
    if (na >= 90) {
      return `Sangat Baik (SB). ${studentName} sangat menguasai keterampilan gerak, aktif, dan sportif sesuai standar Buku Panduan PJOK SIBI.`;
    }
    if (na >= 82) {
      return `Baik (B). Menguasai variasi dan kombinasi pola gerak dasar serta menunjukkan kerja sama dan kebugaran yang baik.`;
    }
    if (na >= 75) {
      return `Cukup Baik (B). Mampu mempraktikkan gerak dasar dengan baik, perlu meningkatkan ketahanan fisik dan ketepatan teknik.`;
    }
    return `Perlu Bimbingan (PB). Perlu latihan pendampingan penguasaan gerak dasar secara bertahap.`;
  };

  const handleExecuteAutoFill = () => {
    if (rombelStudents.length === 0) return;

    const lowBound = Math.min(minScore, maxScore);
    const highBound = Math.max(minScore, maxScore);
    const rombelAttendance = attendanceRecords.filter((r) => r.rombel === gradesRombel);

    const nextGrades: { [studentId: string]: StudentGradeEntry } = { ...currentGrades };

    rombelStudents.forEach((student, idx) => {
      const existing: StudentGradeEntry = currentGrades[student.id] || {
        tp1: "",
        tp2: "",
        tp3: "",
        tp4: "",
        stsTulisan: "",
        stsPraktik: "",
        pasTulisan: "",
        pasPraktik: "",
        notes: "",
      };

      // Calculate student's base performance from TKJI + Attendance + Soal Praktik
      const fitScore = calculateFitnessScore(student).score; // 20 - 100

      // Attendance rate (default 92% if no records yet)
      let hadirCount = 0;
      let totalDays = 0;
      rombelAttendance.forEach((rec) => {
        const entry = rec.students?.find((s: any) => s.studentId === student.id);
        if (entry) {
          totalDays++;
          if (entry.status === "H") hadirCount++;
        }
      });
      const attendanceRate = totalDays > 0 ? Math.round((hadirCount / totalDays) * 100) : 92;

      // Soal Praktik score if available
      const soalMap = soalStudentScores[student.id];
      let soalTotal = 0;
      let hasSoalScore = false;
      if (soalMap) {
        const vals = Object.values(soalMap).filter((v) => v !== "") as number[];
        if (vals.length > 0) {
          hasSoalScore = true;
          soalTotal = vals.reduce((a, b) => a + Number(b), 0);
        }
      }

      // Smart base score mapped neatly into [lowBound, highBound]
      const rawComposite = hasSoalScore
        ? fitScore * 0.45 + attendanceRate * 0.25 + soalTotal * 0.3
        : fitScore * 0.65 + attendanceRate * 0.35;

      const normalizedRatio = Math.min(1, Math.max(0, (rawComposite - 45) / 50));
      const smartCenter = Math.round(lowBound + normalizedRatio * (highBound - lowBound));

      const computeFieldScore = (fieldKey: string, deltaMin: number, deltaMax: number): number => {
        if (mode === "uniform") {
          return clampScore(uniformScore, 0, 100);
        }
        if (mode === "range") {
          return clampScore(
            getDeterministicOffset(`${student.id}-${fieldKey}-${idx}`, lowBound, highBound),
            lowBound,
            highBound
          );
        }
        // mode === "smart"
        const offset = getDeterministicOffset(
          `${student.id}-${fieldKey}`,
          deltaMin,
          deltaMax
        );
        return clampScore(smartCenter + offset, lowBound, highBound);
      };

      const shouldFill = (currentVal: number | "" | string) => {
        if (!onlyEmptyFields) return true;
        return currentVal === "" || currentVal === undefined || currentVal === null;
      };

      const updated: StudentGradeEntry = { ...existing };

      if (targetScope === "all" || targetScope === "tp_only") {
        if (shouldFill(existing.tp1)) updated.tp1 = computeFieldScore("tp1", -2, 3);
        if (shouldFill(existing.tp2)) updated.tp2 = computeFieldScore("tp2", -1, 4);
        if (shouldFill(existing.tp3)) updated.tp3 = computeFieldScore("tp3", -3, 2);
        if (shouldFill(existing.tp4)) updated.tp4 = computeFieldScore("tp4", 0, 4);
      }

      if (targetScope === "all" || targetScope === "sts_only") {
        if (shouldFill(existing.stsTulisan)) {
          updated.stsTulisan = computeFieldScore("stsTulisan", -3, 2);
        }
        if (shouldFill(existing.stsPraktik)) {
          updated.stsPraktik = computeFieldScore("stsPraktik", -1, 4);
        }
      }

      if (targetScope === "all" || targetScope === "pas_only") {
        if (shouldFill(existing.pasTulisan)) {
          updated.pasTulisan = computeFieldScore("pasTulisan", -2, 3);
        }
        if (shouldFill(existing.pasPraktik)) {
          updated.pasPraktik = hasSoalScore && mode === "smart"
            ? clampScore(soalTotal, lowBound, highBound)
            : computeFieldScore("pasPraktik", 0, 4);
        }
      }

      // Compute resulting final score to build automatic teacher notes
      const tps = [updated.tp1, updated.tp2, updated.tp3, updated.tp4].filter(
        (v) => v !== ""
      ) as number[];
      const avgTp = tps.length > 0 ? tps.reduce((a, b) => a + b, 0) / tps.length : 84;
      const stss = [updated.stsTulisan, updated.stsPraktik].filter((v) => v !== "") as number[];
      const avgSts = stss.length > 0 ? stss.reduce((a, b) => a + b, 0) / stss.length : avgTp;
      const pass = [updated.pasTulisan, updated.pasPraktik].filter((v) => v !== "") as number[];
      const avgPas = pass.length > 0 ? pass.reduce((a, b) => a + b, 0) / pass.length : avgTp;
      const finalNa = avgTp * 0.4 + avgSts * 0.3 + avgPas * 0.3;

      if (
        targetScope === "notes_only" ||
        (autoGenerateNotes && (targetScope === "all" || shouldFill(existing.notes)))
      ) {
        if (!onlyEmptyFields || !existing.notes) {
          updated.notes = buildNoteByFinalScore(finalNa, student.name);
        }
      }

      nextGrades[student.id] = updated;
    });

    const modeLabel =
      mode === "smart"
        ? `Otomatis Cerdas (Integrasi TKJI + Absensi + Praktik, Rentang ${lowBound}–${highBound})`
        : mode === "range"
        ? `Rentang Nilai Proporsional (${lowBound}–${highBound})`
        : `Nilai Seragam (${uniformScore})`;

    onApplyAutoGrades(
      nextGrades,
      `Nilai ${rombelStudents.length} siswa Kelas ${gradesRombel} berhasil diisi otomatis menggunakan mode ${modeLabel} dan langsung tersimpan!`
    );
  };

  const handleFillSibiTp = () => {
    const book = getSibiBookByGrade(gradesRombel);
    const u1 = book.units[0];
    const u2 = book.units[1];
    const u5 = book.units[4] || book.units[2];
    const u8 = book.units[7] || book.units[3];

    onApplySibiTpDescriptions(
      u1?.tujuanPembelajaran[0] || `Mempraktikkan variasi dan kombinasi gerak dasar (${u1?.title || "Unit 1 SIBI"})`,
      u2?.tujuanPembelajaran[0] || `Mempraktikkan variasi dan kombinasi gerak dasar (${u2?.title || "Unit 2 SIBI"})`,
      u5?.tujuanPembelajaran[0] || `Mempraktikkan keterampilan gerak atletik & senam (${u5?.title || "Unit 5 SIBI"})`,
      u8?.tujuanPembelajaran[0] || `Mempraktikkan latihan kebugaran jasmani & pola hidup sehat (${u8?.title || "Unit 8 SIBI"})`
    );
  };

  const handleClearRombelGrades = () => {
    const nextGrades = { ...currentGrades };
    rombelStudents.forEach((s) => {
      nextGrades[s.id] = {
        tp1: "",
        tp2: "",
        tp3: "",
        tp4: "",
        stsTulisan: "",
        stsPraktik: "",
        pasTulisan: "",
        pasPraktik: "",
        notes: "",
      };
    });
    setConfirmReset(false);
    onApplyAutoGrades(
      nextGrades,
      `Data nilai untuk Kelas ${gradesRombel} berhasil dikosongkan.`
    );
  };

  return (
    <div
      className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-5 shadow-lg text-white space-y-4"
      id="auto-fill-grades-panel"
    >
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                Fitur Cepat Guru
              </span>
              <span className="text-[11px] font-bold text-emerald-300">
                Kelas {gradesRombel} ({rombelStudents.length} Siswa)
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-black text-white mt-0.5">
              Menu Isi Nilai Otomatis & Generator Deskripsi TP (Standar SIBI)
            </h4>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleFillSibiTp}
            className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 text-sky-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Isi otomatis Deskripsi TP 1 s/d TP 4 sesuai Buku Panduan Guru PJOK SIBI untuk kelas ini"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-300" />
            Isi TP 1–4 dari Buku SIBI
          </button>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            {isOpen ? "Sembunyikan Panel" : "Buka Menu Isi Otomatis"}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="pt-3 border-t border-slate-800/90 space-y-4">
          {/* 3 Mode Pilihan Isi Nilai Otomatis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setMode("smart")}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                mode === "smart"
                  ? "bg-emerald-500/20 border-emerald-400 text-white shadow-md"
                  : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  1. Otomatis Cerdas (TKJI + Absensi)
                </span>
                {mode === "smart" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Menghitung nilai TP 1–4, STS, dan PAS otomatis berdasarkan skor kebugaran TKJI, kehadiran absensi, & nilai praktik siswa.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode("range")}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                mode === "range"
                  ? "bg-emerald-500/20 border-emerald-400 text-white shadow-md"
                  : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  2. Rentang Nilai Variatif (KKTP–Maks)
                </span>
                {mode === "range" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Mengisi nilai bervariasi secara proporsional di antara batas nilai minimum (KKTP) dan nilai maksimum pilihan guru.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode("uniform")}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                mode === "uniform"
                  ? "bg-emerald-500/20 border-emerald-400 text-white shadow-md"
                  : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-sky-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  3. Nilai Seragam / Standar Kelas
                </span>
                {mode === "uniform" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Mengisi angka nilai yang sama (misal: 85) ke seluruh siswa pada kolom yang dipilih dengan cepat.
              </p>
            </button>
          </div>

          {/* Parameter Pengaturan Rentang Nilai & Target Kolom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
            {/* Target Kolom */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Kolom yang Diisi Otomatis
              </label>
              <select
                value={targetScope}
                onChange={(e) => setTargetScope(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="all">Semua Kolom (TP 1–4, STS, PAS & Catatan)</option>
                <option value="tp_only">Hanya Nilai TP 1 s/d TP 4</option>
                <option value="sts_only">Hanya Nilai STS (Tulis & Praktik)</option>
                <option value="pas_only">Hanya Nilai PAS (Tulis & Praktik)</option>
                <option value="notes_only">Hanya Catatan Deskripsi Guru</option>
              </select>
            </div>

            {mode === "uniform" ? (
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Nilai Seragam (0 - 100)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={uniformScore}
                    onChange={(e) => setUniformScore(Number(e.target.value) || 80)}
                    className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-black text-emerald-300 text-center"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[78, 80, 85, 88, 90, 92].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setUniformScore(preset)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          uniformScore === preset
                            ? "bg-emerald-500 text-slate-950 border-emerald-400"
                            : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Batas Nilai Minimum (KKTP)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={98}
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value) || 75)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-black text-emerald-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Batas Nilai Maksimum
                  </label>
                  <input
                    type="number"
                    min={60}
                    max={100}
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value) || 95)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-black text-emerald-300"
                  />
                </div>
              </>
            )}

            {/* Opsi Tambahan */}
            <div className="space-y-2 flex flex-col justify-center">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyEmptyFields}
                  onChange={(e) => setOnlyEmptyFields(e.target.checked)}
                  className="rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Hanya isi kolom yang masih kosong</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoGenerateNotes}
                  onChange={(e) => setAutoGenerateNotes(e.target.checked)}
                  className="rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Buat Catatan Guru otomatis</span>
              </label>
            </div>
          </div>

          {/* Tombol Eksekusi Isi Nilai Otomatis */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExecuteAutoFill}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                id="btn-execute-autofill-grades"
              >
                <Sparkles className="w-4 h-4" />
                Isi Nilai Otomatis Sekarang ({rombelStudents.length} Siswa Kelas {gradesRombel})
              </button>
            </div>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-red-950/60 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Kosongkan Nilai Rombel
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-red-300 font-bold">
                  Yakin kosongkan nilai Kelas {gradesRombel}?
                </span>
                <button
                  type="button"
                  onClick={handleClearRombelGrades}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold cursor-pointer"
                >
                  Ya, Kosongkan
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
