"use client";

import React, { useState } from "react";
import { FileDown, FileText, Printer, CheckCircle2 } from "lucide-react";

interface F4ExportBarProps {
  menuLabel: string;
  defaultOrientation?: "portrait" | "landscape";
  onExport: (
    format: "word" | "doc" | "pdf",
    orientation: "portrait" | "landscape"
  ) => void;
}

export default function F4ExportBar({
  menuLabel,
  defaultOrientation = "portrait",
  onExport,
}: F4ExportBarProps) {
  const [customOrientation, setCustomOrientation] = useState<{
    menu: string;
    value: "portrait" | "landscape";
  } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const orientation =
    customOrientation && customOrientation.menu === menuLabel
      ? customOrientation.value
      : defaultOrientation;

  const setOrientation = (value: "portrait" | "landscape") => {
    setCustomOrientation({ menu: menuLabel, value });
  };

  const triggerExport = (format: "word" | "doc" | "pdf") => {
    onExport(format, orientation);
    const labelFormat =
      format === "word"
        ? "Word (.docx) F4"
        : format === "doc"
        ? "Word 97-2003 (.doc) F4"
        : "PDF Cetak Kertas F4";
    setToastMsg(
      `Menyiapkan dokumen ${labelFormat} (${
        orientation === "landscape"
          ? "Landscape 33×21,5 cm"
          : "Portrait 21,5×33 cm"
      }) untuk menu ${menuLabel}...`
    );
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div
      className="mb-6 bg-white border border-emerald-200/80 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3.5"
      id="universal-f4-export-bar"
    >
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-black text-xs shadow-sm">
          F4
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-xs sm:text-sm font-black text-slate-900">
              Pusat Unduh & Cetak Dokumen Resmi F4 — {menuLabel}
            </h4>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold uppercase">
              Folio 21,5 × 33 cm • Tabel Rapi Siap Cetak
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Dilengkapi Kop Sekolah, Tabel Berbingkai Presisi Anti-Terpotong, dan
            Kolom Pengesahan Kepala Sekolah & Guru PJOK.
          </p>
          {toastMsg && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              {toastMsg}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Pilihan Orientasi Kertas F4 */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setOrientation("portrait")}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
              orientation === "portrait"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Ukuran F4 Tegak (21,5 cm x 33,0 cm)"
          >
            F4 Tegak (Portrait)
          </button>
          <button
            type="button"
            onClick={() => setOrientation("landscape")}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
              orientation === "landscape"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Ukuran F4 Mendatar (33,0 cm x 21,5 cm) cocok untuk tabel lebar"
          >
            F4 Mendatar (Tabel Lebar)
          </button>
        </div>

        {/* Unduh Word (.docx) F4 */}
        <button
          type="button"
          onClick={() => triggerExport("word")}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          id="btn-f4-export-word"
        >
          <FileText className="h-3.5 w-3.5" />
          Unduh Word (.docx) F4
        </button>

        {/* Unduh DOC (.doc) F4 */}
        <button
          type="button"
          onClick={() => triggerExport("doc")}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          id="btn-f4-export-doc"
        >
          <FileDown className="h-3.5 w-3.5" />
          Unduh DOC (.doc) F4
        </button>

        {/* Cetak / Simpan PDF F4 */}
        <button
          type="button"
          onClick={() => triggerExport("pdf")}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          id="btn-f4-export-pdf"
        >
          <Printer className="h-3.5 w-3.5 text-emerald-400" />
          Cetak PDF (F4)
        </button>
      </div>
    </div>
  );
}
