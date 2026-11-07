import {
  Student,
  InventoryItem,
  ScheduleItem,
  SavedModulAjar,
  calculateBMI,
  calculateFitnessScore,
} from "@/lib/pe-utils";
import {
  SIBI_ELEMEN_CP_PJOK,
  getSibiBookByGrade,
} from "@/lib/sibi-pjok-data";

export interface F4SchoolInfo {
  schoolName: string;
  schoolAddress: string;
  headmasterName: string;
  headmasterNip: string;
  teacherName: string;
  teacherNip: string;
}

export interface F4DocumentOptions {
  title: string;
  subtitle?: string;
  metaRows?: Array<[string, string, string, string]>;
  bodyHtml: string;
  orientation?: "portrait" | "landscape";
  format: "pdf" | "word" | "doc";
  filenameBase: string;
  schoolInfo: F4SchoolInfo;
}

/**
 * Generates an official F4 (215mm x 330mm / 21.5cm x 33cm) HTML document
 * with neat, print-ready tables, Kop Sekolah, and official signature blocks,
 * then outputs it as PDF (print dialog), Word (.docx), or Word 97-2003 (.doc).
 */
export function exportF4Document(options: F4DocumentOptions): void {
  const {
    title,
    subtitle,
    metaRows = [],
    bodyHtml,
    orientation = "portrait",
    format,
    filenameBase,
    schoolInfo,
  } = options;

  const isLandscape = orientation === "landscape";
  // F4 dimensions: 215mm x 330mm (8.5in x 13in = 612pt x 936pt)
  const pageSizeCss = isLandscape ? "330mm 215mm" : "215mm 330mm";
  const wordPageSizePt = isLandscape ? "936.0pt 612.0pt" : "612.0pt 936.0pt";
  const wordOrientation = isLandscape ? "landscape" : "portrait";
  const pageMargin = isLandscape ? "10mm 12mm" : "14mm 16mm";

  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const metaTableHtml =
    metaRows.length > 0
      ? `
      <table class="meta-table">
        <tbody>
          ${metaRows
            .map(
              (r) => `
            <tr>
              <td class="meta-label">${r[0]}</td>
              <td class="meta-val">: ${r[1]}</td>
              <td class="meta-label">${r[2]}</td>
              <td class="meta-val">: ${r[3]}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `
      : "";

  const fullHtml = `
    <!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            size: ${pageSizeCss};
            margin: ${pageMargin};
          }
          @page SectionF4 {
            size: ${wordPageSizePt};
            mso-page-orientation: ${wordOrientation};
            margin: 1.2cm 1.4cm 1.2cm 1.4cm;
            mso-header-margin: 0.8cm;
            mso-footer-margin: 0.8cm;
          }
          div.SectionF4 {
            page: SectionF4;
          }
          body {
            font-family: "Times New Roman", Times, serif;
            font-size: 10.5pt;
            color: #000000;
            line-height: 1.35;
            margin: 0;
            padding: 0;
            background: #ffffff;
          }
          .kop-sekolah {
            width: 100%;
            border-bottom: 3.5pt double #000000;
            padding-bottom: 6pt;
            margin-bottom: 10pt;
            text-align: center;
          }
          .kop-sekolah h1 {
            font-size: 11.5pt;
            font-weight: bold;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.4pt;
          }
          .kop-sekolah h2 {
            font-size: 12.5pt;
            font-weight: bold;
            margin: 1.5pt 0;
            text-transform: uppercase;
          }
          .kop-sekolah h3 {
            font-size: 14.5pt;
            font-weight: bold;
            margin: 1.5pt 0;
            text-transform: uppercase;
          }
          .kop-sekolah p {
            font-size: 9.5pt;
            margin: 1.5pt 0 0 0;
            font-style: italic;
          }
          .doc-title-wrap {
            text-align: center;
            margin-bottom: 10pt;
          }
          .doc-title {
            font-size: 12.5pt;
            font-weight: bold;
            text-transform: uppercase;
            text-decoration: underline;
            margin: 0;
          }
          .doc-subtitle {
            font-size: 10pt;
            font-weight: bold;
            color: #222222;
            margin: 2.5pt 0 0 0;
          }
          .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8pt;
            font-size: 9.5pt;
          }
          .meta-table td {
            border: none !important;
            padding: 2pt 4pt;
            vertical-align: top;
          }
          .meta-label {
            width: 18%;
            font-weight: bold;
          }
          .meta-val {
            width: 32%;
          }
          table.f4-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5pt;
            margin-bottom: 10pt;
            font-size: ${isLandscape ? "8.5pt" : "9.5pt"};
            table-layout: auto;
          }
          table.f4-table thead {
            display: table-header-group;
          }
          table.f4-table tr {
            page-break-inside: avoid;
          }
          table.f4-table th,
          table.f4-table td {
            border: 1pt solid #000000;
            padding: ${isLandscape ? "3.5pt 4pt" : "4.5pt 5.5pt"};
            vertical-align: middle;
            word-wrap: break-word;
          }
          table.f4-table th {
            background-color: #e2e8f0;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            font-size: ${isLandscape ? "8pt" : "9pt"};
          }
          .section-heading {
            font-size: 10.5pt;
            font-weight: bold;
            text-transform: uppercase;
            background-color: #f1f5f9;
            border: 1pt solid #000000;
            padding: 4pt 7pt;
            margin-top: 9pt;
            margin-bottom: 5pt;
          }
          .sig-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 18pt;
            page-break-inside: avoid;
          }
          .sig-table td {
            border: none !important;
            width: 50%;
            text-align: center;
            vertical-align: top;
            font-size: 10pt;
            padding: 4pt;
          }
          .sig-space {
            height: 48pt;
          }
          .f4-badge {
            font-size: 7.5pt;
            color: #475569;
            text-align: right;
            margin-bottom: 3pt;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="SectionF4">
          <div class="f4-badge">Format Dokumen Resmi Kertas F4 / Folio (${isLandscape ? "33,0 cm × 21,5 cm Landscape" : "21,5 cm × 33,0 cm Portrait"})</div>
          <div class="kop-sekolah">
            <h1>PEMERINTAH KABUPATEN / KOTA SADAR</h1>
            <h2>DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
            <h3>${schoolInfo.schoolName}</h3>
            <p>${schoolInfo.schoolAddress}</p>
          </div>

          <div class="doc-title-wrap">
            <p class="doc-title">${title}</p>
            ${subtitle ? `<p class="doc-subtitle">${subtitle}</p>` : ""}
          </div>

          ${metaTableHtml}

          <div class="doc-content">
            ${bodyHtml}
          </div>

          <table class="sig-table">
            <tr>
              <td>
                Mengetahui,<br/>
                <strong>Kepala Sekolah</strong>
                <div class="sig-space"></div>
                <strong><u>${schoolInfo.headmasterName}</u></strong><br/>
                NIP. ${schoolInfo.headmasterNip}
              </td>
              <td>
                Sadar, ${todayFormatted}<br/>
                <strong>Guru Mata Pelajaran PJOK</strong>
                <div class="sig-space"></div>
                <strong><u>${schoolInfo.teacherName}</u></strong><br/>
                NIP. ${schoolInfo.teacherNip}
              </td>
            </tr>
          </table>
        </div>
      </body>
    </html>
  `;

  const cleanFileName = filenameBase.replace(/[^a-zA-Z0-9_-]/g, "_");

  if (format === "pdf") {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(fullHtml);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 2500);
      }, 350);
    }
    return;
  }

  const extension = format === "word" ? "docx" : "doc";
  const mimeType =
    format === "word"
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8"
      : "application/msword;charset=utf-8";

  const blob = new Blob(["\ufeff", fullHtml], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cleanFileName}_F4.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface BuildMenuF4Context {
  activeTab: string;
  schoolInfo: F4SchoolInfo;
  students: Student[];
  classFilter: string;
  selectedRombel: string;
  customRombels: string[];
  inventory: InventoryItem[];
  schedule: ScheduleItem[];
  savedPlans: SavedModulAjar[];
  currentRpp: SavedModulAjar["content"] | null;
  rppGrade: string;
  rppMaterial: string;
  rppDuration: string;
  rppModel: string;
  generatedInfographic: any;
  infographicTopic: string;
  infographicMaterial: string;
  generatedMateri: any;
  materiMapel: string;
  materiKelas: string;
  materiFase: string;
  materiTopik: string;
  generatedSlides: any;
  slidesMateriPokok: string;
  slidesKelas: string;
  generatedLkpd: any;
  lkpdTopik: string;
  lkpdKelas: string;
  lkpdSintaks: string;
  generatedSoal: any;
  soalKelas: string;
  soalFase: string;
  soalJenisAsesmen: string;
  soalPenilaianRombel: string;
  soalStudentScores: { [studentId: string]: { [soalIdx: number]: number | "" } };
  attendanceSubTab: "daily" | "weekly" | "monthly" | "semester";
  attendanceDate: string;
  attendanceRombel: string;
  attendanceList: { [studentId: string]: { status: "H" | "S" | "I" | "A"; notes: string } };
  attendanceRecords: any[];
  monthlyRecapMonth: number;
  monthlyRecapYear: number;
  monthlyRecapRombel: string;
  semesterRecapType: "1" | "2";
  gradesRombel: string;
  studentGrades: {
    [studentId: string]: {
      tp1: number | "";
      tp2: number | "";
      tp3: number | "";
      tp4: number | "";
      stsTulisan: number | "";
      stsPraktik: number | "";
      pasTulisan: number | "";
      pasPraktik: number | "";
      notes: string;
    };
  };
  tp1Desc: string;
  tp2Desc: string;
  tp3Desc: string;
  tp4Desc: string;
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function exportActiveMenuAsF4(
  ctx: BuildMenuF4Context,
  format: "pdf" | "word" | "doc",
  overrideOrientation?: "portrait" | "landscape"
): void {
  const { activeTab, schoolInfo } = ctx;

  // 1. OVERVIEW
  if (activeTab === "overview") {
    const totalStudents = ctx.students.length;
    const avgScore =
      totalStudents > 0
        ? (
            ctx.students.reduce((acc, s) => acc + calculateFitnessScore(s).score, 0) /
            totalStudents
          ).toFixed(1)
        : "0.0";
    const totalTools = ctx.inventory.reduce((acc, i) => acc + i.total, 0);
    const goodTools = ctx.inventory.reduce((acc, i) => acc + i.goodCondition, 0);

    const rombelSummaryRows = ctx.customRombels
      .map((rombel, idx) => {
        const rStudents = ctx.students.filter((s) => s.grade === rombel);
        const lCount = rStudents.filter((s) => s.gender === "L").length;
        const pCount = rStudents.filter((s) => s.gender === "P").length;
        const rAvg =
          rStudents.length > 0
            ? (
                rStudents.reduce((acc, s) => acc + calculateFitnessScore(s).score, 0) /
                rStudents.length
              ).toFixed(1)
            : "-";
        return `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td style="font-weight:bold;text-align:center;">Kelas ${rombel}</td>
            <td style="text-align:center;">${lCount} Siswa</td>
            <td style="text-align:center;">${pCount} Siswi</td>
            <td style="text-align:center;font-weight:bold;">${rStudents.length} Peserta Didik</td>
            <td style="text-align:center;font-weight:bold;">${rAvg}</td>
          </tr>
        `;
      })
      .join("");

    const bodyHtml = `
      <div class="section-heading">I. RINGKASAN EKSEKUTIF DATA ADMINISTRASI & KEBUGARAN PJOK</div>
      <table class="f4-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Indikator Utama Administrasi PJOK</th>
            <th>Capaian / Jumlah</th>
            <th>Keterangan Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align:center;">1</td>
            <td><strong>Total Peserta Didik Terdaftar</strong></td>
            <td style="text-align:center;font-weight:bold;">${totalStudents} Siswa</td>
            <td>Tersebar pada ${ctx.customRombels.length} Rombongan Belajar</td>
          </tr>
          <tr>
            <td style="text-align:center;">2</td>
            <td><strong>Rata-Rata Skor Kebugaran Jasmani (TKJI)</strong></td>
            <td style="text-align:center;font-weight:bold;">${avgScore} / 100</td>
            <td>Pengukuran Lari Cepat, Sit-Up, Push-Up, Loncat Tegak, & Lari 600m</td>
          </tr>
          <tr>
            <td style="text-align:center;">3</td>
            <td><strong>Total Sarana & Prasarana Alat PJOK</strong></td>
            <td style="text-align:center;font-weight:bold;">${totalTools} Unit (${goodTools} Kondisi Baik)</td>
            <td>Terdata dalam ${ctx.inventory.length} jenis peralatan olahraga</td>
          </tr>
          <tr>
            <td style="text-align:center;">4</td>
            <td><strong>Agenda & Jadwal Mengajar Aktif</strong></td>
            <td style="text-align:center;font-weight:bold;">${ctx.schedule.length} Sesi / Minggu</td>
            <td>Kurikulum Merdeka Tahun Ajaran 2026/2027</td>
          </tr>
        </tbody>
      </table>

      <div class="section-heading">II. REKAPITULASI PESERTA DIDIK & RATA-RATA KEBUGARAN PER ROMBEL</div>
      <table class="f4-table">
        <thead>
          <tr>
            <th style="width:6%;">No</th>
            <th style="width:18%;">Kelas / Rombel</th>
            <th style="width:18%;">Laki-Laki (L)</th>
            <th style="width:18%;">Perempuan (P)</th>
            <th style="width:20%;">Jumlah Siswa</th>
            <th style="width:20%;">Rerata Skor TKJI</th>
          </tr>
        </thead>
        <tbody>
          ${rombelSummaryRows}
        </tbody>
      </table>
    `;

    exportF4Document({
      title: "LAPORAN RINGKASAN EKSEKUTIF ADMINISTRASI & KEBUGARAN PJOK",
      subtitle: "Tahun Ajaran 2026/2027 — Kurikulum Merdeka",
      metaRows: [
        ["Satuan Pendidikan", schoolInfo.schoolName, "Mata Pelajaran", "PJOK"],
        ["Guru Pengampu", schoolInfo.teacherName, "Total Rombel", `${ctx.customRombels.length} Rombel`],
      ],
      bodyHtml,
      orientation: overrideOrientation || "portrait",
      format,
      filenameBase: "Laporan_Ringkasan_Eksekutif_PJOK",
      schoolInfo,
    });
    return;
  }

  // 2. STUDENTS (PENILAIAN KEBUGARAN JASMANI / TKJI)
  if (activeTab === "students") {
    const filtered = ctx.students.filter((s) =>
      ctx.classFilter === "Semua" ? true : s.grade === ctx.classFilter
    );

    const rowsHtml = filtered
      .map((s, idx) => {
        const bmiInfo = calculateBMI(s.weight, s.height);
        const fitInfo = calculateFitnessScore(s);
        return `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td style="font-weight:bold;">${s.name}</td>
            <td style="text-align:center;">${s.gender}</td>
            <td style="text-align:center;">${s.grade}</td>
            <td style="text-align:center;">${s.height} cm / ${s.weight} kg</td>
            <td style="text-align:center;">${bmiInfo.bmi} (${bmiInfo.category})</td>
            <td style="text-align:center;">${s.runSpeed} dtk</td>
            <td style="text-align:center;">${s.sitUps}x</td>
            <td style="text-align:center;">${s.pushUps}x</td>
            <td style="text-align:center;">${s.verticalJump} cm</td>
            <td style="text-align:center;">${s.runDistance} dtk</td>
            <td style="text-align:center;font-weight:bold;">${fitInfo.score}</td>
            <td style="text-align:center;font-weight:bold;">${fitInfo.rating}</td>
          </tr>
        `;
      })
      .join("");

    const bodyHtml = `
      <table class="f4-table">
        <thead>
          <tr>
            <th style="width:4%;">No</th>
            <th style="width:18%;">Nama Lengkap Siswa</th>
            <th style="width:4%;">L/P</th>
            <th style="width:6%;">Kelas</th>
            <th style="width:10%;">TB / BB</th>
            <th style="width:12%;">IMT & Status Gizi</th>
            <th style="width:7%;">Sprint</th>
            <th style="width:6%;">Sit-Up</th>
            <th style="width:6%;">Push-Up</th>
            <th style="width:7%;">Loncat</th>
            <th style="width:7%;">Lari 600m</th>
            <th style="width:5%;">Skor</th>
            <th style="width:8%;">Predikat</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;

    exportF4Document({
      title: "DAFTAR PENILAIAN KEBUGARAN JASMANI INDONESIA (TKJI) PESERTA DIDIK",
      subtitle: `Filter Kelas: ${ctx.classFilter === "Semua" ? "Seluruh Rombel" : `Kelas ${ctx.classFilter}`}`,
      metaRows: [
        ["Mata Pelajaran", "PJOK", "Filter Kelas", ctx.classFilter],
        ["Jumlah Siswa", `${filtered.length} Peserta Didik`, "Tahun Ajaran", "2026/2027"],
      ],
      bodyHtml,
      orientation: overrideOrientation || "landscape",
      format,
      filenameBase: `Laporan_Penilaian_Kebugaran_TKJI_${ctx.classFilter}`,
      schoolInfo,
    });
    return;
  }

  // 3. ROMBEL (DATA INDUK SISWA & ROMBONGAN BELAJAR)
  if (activeTab === "rombel") {
    const targetStudents =
      ctx.selectedRombel === "Semua"
        ? ctx.students
        : ctx.students.filter((s) => s.grade === ctx.selectedRombel);

    const rowsHtml = targetStudents
      .map((s, idx) => {
        const bmiInfo = calculateBMI(s.weight, s.height);
        const fitInfo = calculateFitnessScore(s);
        return `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td style="text-align:center;">${s.id}</td>
            <td style="font-weight:bold;">${s.name}</td>
            <td style="text-align:center;">${s.gender}</td>
            <td style="text-align:center;font-weight:bold;">${s.grade}</td>
            <td style="text-align:center;">${s.height} cm</td>
            <td style="text-align:center;">${s.weight} kg</td>
            <td style="text-align:center;">${bmiInfo.bmi} (${bmiInfo.category})</td>
            <td style="text-align:center;font-weight:bold;">${fitInfo.score} (${fitInfo.rating})</td>
          </tr>
        `;
      })
      .join("");

    const bodyHtml = `
      <table class="f4-table">
        <thead>
          <tr>
            <th style="width:5%;">No</th>
            <th style="width:12%;">ID Siswa</th>
            <th style="width:25%;">Nama Lengkap Peserta Didik</th>
            <th style="width:6%;">L/P</th>
            <th style="width:10%;">Rombel</th>
            <th style="width:9%;">Tinggi</th>
            <th style="width:9%;">Berat</th>
            <th style="width:12%;">IMT</th>
            <th style="width:12%;">Kebugaran</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;

    exportF4Document({
      title: "BUKU INDUK DATA PESERTA DIDIK & ROMBONGAN BELAJAR PJOK",
      subtitle: `Rombongan Belajar: ${ctx.selectedRombel === "Semua" ? "Seluruh Rombel" : `Kelas ${ctx.selectedRombel}`}`,
      metaRows: [
        ["Rombel Terpilih", ctx.selectedRombel, "Jumlah Siswa", `${targetStudents.length} Siswa`],
        ["Total Rombel Sekolah", `${ctx.customRombels.length} Kelas`, "Tahun Ajaran", "2026/2027"],
      ],
      bodyHtml,
      orientation: overrideOrientation || "portrait",
      format,
      filenameBase: `Data_Induk_Rombel_${ctx.selectedRombel}`,
      schoolInfo,
    });
    return;
  }

  // 4. ATTENDANCE (ABSENSI SISWA TAKTIS: HARIAN, MINGGUAN, BULANAN, SEMESTER)
  if (activeTab === "attendance") {
    if (ctx.attendanceSubTab === "daily") {
      const rombelStudents = ctx.students.filter((s) => s.grade === ctx.attendanceRombel);
      let h = 0, sCount = 0, i = 0, a = 0;
      const rowsHtml = rombelStudents
        .map((std, idx) => {
          const entry = ctx.attendanceList[std.id] || { status: "H", notes: "" };
          if (entry.status === "H") h++;
          else if (entry.status === "S") sCount++;
          else if (entry.status === "I") i++;
          else if (entry.status === "A") a++;
          const stText =
            entry.status === "H"
              ? "Hadir (H)"
              : entry.status === "S"
              ? "Sakit (S)"
              : entry.status === "I"
              ? "Izin (I)"
              : "Alfa (A)";
          return `
            <tr>
              <td style="text-align:center;">${idx + 1}</td>
              <td style="font-weight:bold;">${std.name}</td>
              <td style="text-align:center;">${std.gender}</td>
              <td style="text-align:center;font-weight:bold;">${stText}</td>
              <td>${entry.notes || "-"}</td>
            </tr>
          `;
        })
        .join("");

      const bodyHtml = `
        <table class="f4-table">
          <thead>
            <tr>
              <th style="width:6%;">No</th>
              <th style="width:42%;">Nama Lengkap Peserta Didik</th>
              <th style="width:8%;">L/P</th>
              <th style="width:18%;">Status Kehadiran</th>
              <th style="width:26%;">Keterangan / Catatan</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <p><strong>Rekapitulasi Harian:</strong> Hadir (H): ${h} | Sakit (S): ${sCount} | Izin (I): ${i} | Alfa (A): ${a} (Total: ${rombelStudents.length} Siswa)</p>
      `;

      exportF4Document({
        title: `LEMBAR ABSENSI HARIAN PESERTA DIDIK — KELAS ${ctx.attendanceRombel}`,
        subtitle: `Tanggal Pertemuan: ${ctx.attendanceDate}`,
        metaRows: [
          ["Kelas / Rombel", ctx.attendanceRombel, "Tanggal", ctx.attendanceDate],
          ["Mata Pelajaran", "PJOK", "Jumlah Siswa", `${rombelStudents.length} Siswa`],
        ],
        bodyHtml,
        orientation: overrideOrientation || "portrait",
        format,
        filenameBase: `Absensi_Harian_Kelas_${ctx.attendanceRombel}_${ctx.attendanceDate}`,
        schoolInfo,
      });
      return;
    }

    if (ctx.attendanceSubTab === "weekly") {
      const monthLabel = MONTH_NAMES[ctx.monthlyRecapMonth - 1] || String(ctx.monthlyRecapMonth);
      const prefix = `${ctx.monthlyRecapYear}-${String(ctx.monthlyRecapMonth).padStart(2, "0")}`;
      const rombelStudents = ctx.students.filter((s) => s.grade === ctx.monthlyRecapRombel);
      const monthRecords = ctx.attendanceRecords.filter(
        (r) => r.rombel === ctx.monthlyRecapRombel && r.date.startsWith(prefix)
      );
      const buckets = [
        { id: 1, label: "Minggu 1 (1-7)", min: 1, max: 7 },
        { id: 2, label: "Minggu 2 (8-14)", min: 8, max: 14 },
        { id: 3, label: "Minggu 3 (15-21)", min: 15, max: 21 },
        { id: 4, label: "Minggu 4 (22-28)", min: 22, max: 28 },
        { id: 5, label: "Minggu 5 (29-31)", min: 29, max: 31 },
      ];

      const rowsHtml = rombelStudents
        .map((std, idx) => {
          let tH = 0, tS = 0, tI = 0, tA = 0;
          const wHtml = buckets
            .map((wb) => {
              let wH = 0, wS = 0, wI = 0, wA = 0;
              monthRecords.forEach((rec) => {
                const d = parseInt(rec.date.split("-")[2], 10);
                if (d >= wb.min && d <= wb.max) {
                  const st = rec.students?.find((s: any) => s.studentId === std.id)?.status;
                  if (st === "H") { wH++; tH++; }
                  else if (st === "S") { wS++; tS++; }
                  else if (st === "I") { wI++; tI++; }
                  else if (st === "A") { wA++; tA++; }
                }
              });
              return `
                <td style="text-align:center;font-weight:bold;">${wH}</td>
                <td style="text-align:center;">${wS}</td>
                <td style="text-align:center;">${wI}</td>
                <td style="text-align:center;">${wA}</td>
              `;
            })
            .join("");
          const tot = tH + tS + tI + tA;
          const pct = tot > 0 ? Math.round((tH / tot) * 100) : 0;
          return `
            <tr>
              <td style="text-align:center;">${idx + 1}</td>
              <td style="font-weight:bold;">${std.name}</td>
              <td style="text-align:center;">${std.gender}</td>
              ${wHtml}
              <td style="text-align:center;font-weight:bold;background:#ecfdf5;">${tH}</td>
              <td style="text-align:center;font-weight:bold;background:#fffbeb;">${tS}</td>
              <td style="text-align:center;font-weight:bold;background:#eff6ff;">${tI}</td>
              <td style="text-align:center;font-weight:bold;background:#fef2f2;">${tA}</td>
              <td style="text-align:center;font-weight:bold;">${pct}%</td>
            </tr>
          `;
        })
        .join("");

      const bodyHtml = `
        <table class="f4-table">
          <thead>
            <tr>
              <th rowspan="2">No</th>
              <th rowspan="2">Nama Lengkap Siswa</th>
              <th rowspan="2">L/P</th>
              <th colspan="4">Minggu 1 (1-7)</th>
              <th colspan="4">Minggu 2 (8-14)</th>
              <th colspan="4">Minggu 3 (15-21)</th>
              <th colspan="4">Minggu 4 (22-28)</th>
              <th colspan="4">Minggu 5 (29-31)</th>
              <th colspan="5">Total Bulanan</th>
            </tr>
            <tr>
              <th>H</th><th>S</th><th>I</th><th>A</th>
              <th>H</th><th>S</th><th>I</th><th>A</th>
              <th>H</th><th>S</th><th>I</th><th>A</th>
              <th>H</th><th>S</th><th>I</th><th>A</th>
              <th>H</th><th>S</th><th>I</th><th>A</th>
              <th>H</th><th>S</th><th>I</th><th>A</th><th>%</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      `;

      exportF4Document({
        title: `REKAPITULASI ABSENSI MINGGUAN DALAM SATU BULAN — KELAS ${ctx.monthlyRecapRombel}`,
        subtitle: `Periode Bulan: ${monthLabel} ${ctx.monthlyRecapYear}`,
        metaRows: [
          ["Kelas / Rombel", ctx.monthlyRecapRombel, "Bulan & Tahun", `${monthLabel} ${ctx.monthlyRecapYear}`],
          ["Mata Pelajaran", "PJOK", "Sesi Tercatat", `${monthRecords.length} Pertemuan`],
        ],
        bodyHtml,
        orientation: overrideOrientation || "landscape",
        format,
        filenameBase: `Rekap_Mingguan_Kelas_${ctx.monthlyRecapRombel}_${monthLabel}_${ctx.monthlyRecapYear}`,
        schoolInfo,
      });
      return;
    }

    if (ctx.attendanceSubTab === "semester") {
      const semMonths =
        ctx.semesterRecapType === "1"
          ? [
              { value: "07", label: "Juli" },
              { value: "08", label: "Agustus" },
              { value: "09", label: "September" },
              { value: "10", label: "Oktober" },
              { value: "11", label: "November" },
              { value: "12", label: "Desember" },
            ]
          : [
              { value: "01", label: "Januari" },
              { value: "02", label: "Februari" },
              { value: "03", label: "Maret" },
              { value: "04", label: "April" },
              { value: "05", label: "Mei" },
              { value: "06", label: "Juni" },
            ];
      const semTitle =
        ctx.semesterRecapType === "1"
          ? "Semester 1 (Ganjil: Juli - Desember)"
          : "Semester 2 (Genap: Januari - Juni)";
      const rombelStudents = ctx.students.filter((s) => s.grade === ctx.monthlyRecapRombel);

      const rowsHtml = rombelStudents
        .map((std, idx) => {
          let semH = 0, semS = 0, semI = 0, semA = 0;
          const mHtml = semMonths
            .map((m) => {
              const prefix = `${ctx.monthlyRecapYear}-${m.value}`;
              const mRecs = ctx.attendanceRecords.filter(
                (r) => r.rombel === ctx.monthlyRecapRombel && r.date.startsWith(prefix)
              );
              let mH = 0, mS = 0, mI = 0, mA = 0;
              mRecs.forEach((rec) => {
                const st = rec.students?.find((s: any) => s.studentId === std.id)?.status;
                if (st === "H") { mH++; semH++; }
                else if (st === "S") { mS++; semS++; }
                else if (st === "I") { mI++; semI++; }
                else if (st === "A") { mA++; semA++; }
              });
              return `
                <td style="text-align:center;font-weight:bold;">${mH}</td>
                <td style="text-align:center;">${mS}</td>
                <td style="text-align:center;">${mI}</td>
                <td style="text-align:center;">${mA}</td>
              `;
            })
            .join("");
          const tot = semH + semS + semI + semA;
          const pct = tot > 0 ? Math.round((semH / tot) * 100) : 0;
          return `
            <tr>
              <td style="text-align:center;">${idx + 1}</td>
              <td style="font-weight:bold;">${std.name}</td>
              <td style="text-align:center;">${std.gender}</td>
              ${mHtml}
              <td style="text-align:center;font-weight:bold;background:#ecfdf5;">${semH}</td>
              <td style="text-align:center;font-weight:bold;background:#fffbeb;">${semS}</td>
              <td style="text-align:center;font-weight:bold;background:#eff6ff;">${semI}</td>
              <td style="text-align:center;font-weight:bold;background:#fef2f2;">${semA}</td>
              <td style="text-align:center;font-weight:bold;">${pct}%</td>
            </tr>
          `;
        })
        .join("");

      const bodyHtml = `
        <table class="f4-table">
          <thead>
            <tr>
              <th rowspan="2">No</th>
              <th rowspan="2">Nama Lengkap Siswa</th>
              <th rowspan="2">L/P</th>
              ${semMonths.map((m) => `<th colspan="4">${m.label}</th>`).join("")}
              <th colspan="5">Total 1 Semester</th>
            </tr>
            <tr>
              ${semMonths.map(() => `<th>H</th><th>S</th><th>I</th><th>A</th>`).join("")}
              <th>H</th><th>S</th><th>I</th><th>A</th><th>%</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      `;

      exportF4Document({
        title: `REKAPITULASI ABSENSI SATU SEMESTER — KELAS ${ctx.monthlyRecapRombel}`,
        subtitle: `${semTitle} Tahun ${ctx.monthlyRecapYear}`,
        metaRows: [
          ["Kelas / Rombel", ctx.monthlyRecapRombel, "Periode", semTitle],
          ["Mata Pelajaran", "PJOK", "Tahun Kalender", String(ctx.monthlyRecapYear)],
        ],
        bodyHtml,
        orientation: overrideOrientation || "landscape",
        format,
        filenameBase: `Rekap_Semester_${ctx.semesterRecapType}_Kelas_${ctx.monthlyRecapRombel}_${ctx.monthlyRecapYear}`,
        schoolInfo,
      });
      return;
    }

    // Default Monthly Recap
    const monthLabel = MONTH_NAMES[ctx.monthlyRecapMonth - 1] || String(ctx.monthlyRecapMonth);
    const daysInMonth = new Date(ctx.monthlyRecapYear, ctx.monthlyRecapMonth, 0).getDate();
    const prefix = `${ctx.monthlyRecapYear}-${String(ctx.monthlyRecapMonth).padStart(2, "0")}`;
    const rombelStudents = ctx.students.filter((s) => s.grade === ctx.monthlyRecapRombel);
    const monthRecords = ctx.attendanceRecords.filter(
      (r) => r.rombel === ctx.monthlyRecapRombel && r.date.startsWith(prefix)
    );

    let dayHeaders = "";
    for (let d = 1; d <= daysInMonth; d++) {
      dayHeaders += `<th style="font-size:7pt;padding:2pt 1pt;">${d}</th>`;
    }

    const rowsHtml = rombelStudents
      .map((std, idx) => {
        let h = 0, sCount = 0, i = 0, a = 0;
        let dCells = "";
        for (let d = 1; d <= daysInMonth; d++) {
          const dateStr = `${prefix}-${String(d).padStart(2, "0")}`;
          const rec = monthRecords.find((r) => r.date === dateStr);
          const st = rec?.students?.find((s: any) => s.studentId === std.id)?.status || "-";
          if (st === "H") h++;
          else if (st === "S") sCount++;
          else if (st === "I") i++;
          else if (st === "A") a++;
          dCells += `<td style="text-align:center;font-size:7pt;padding:2pt 1pt;">${st}</td>`;
        }
        const tot = h + sCount + i + a;
        const pct = tot > 0 ? `${Math.round((h / tot) * 100)}%` : "-";
        return `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td style="font-weight:bold;white-space:nowrap;">${std.name}</td>
            <td style="text-align:center;">${std.gender}</td>
            ${dCells}
            <td style="text-align:center;font-weight:bold;">${h}</td>
            <td style="text-align:center;font-weight:bold;">${sCount}</td>
            <td style="text-align:center;font-weight:bold;">${i}</td>
            <td style="text-align:center;font-weight:bold;">${a}</td>
            <td style="text-align:center;font-weight:bold;">${pct}</td>
          </tr>
        `;
      })
      .join("");

    const bodyHtml = `
      <table class="f4-table">
        <thead>
          <tr>
            <th rowspan="2">No</th>
            <th rowspan="2">Nama Siswa</th>
            <th rowspan="2">L/P</th>
            <th colspan="${daysInMonth}">Tanggal Pertemuan Bulan ${monthLabel} ${ctx.monthlyRecapYear}</th>
            <th colspan="5">Rekap</th>
          </tr>
          <tr>
            ${dayHeaders}
            <th>H</th><th>S</th><th>I</th><th>A</th><th>%</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;

    exportF4Document({
      title: `REKAPITULASI ABSENSI BULANAN SISWA — KELAS ${ctx.monthlyRecapRombel}`,
      subtitle: `Bulan ${monthLabel} Tahun ${ctx.monthlyRecapYear}`,
      metaRows: [
        ["Kelas / Rombel", ctx.monthlyRecapRombel, "Bulan & Tahun", `${monthLabel} ${ctx.monthlyRecapYear}`],
        ["Mata Pelajaran", "PJOK", "Hari Efektif Tercatat", `${monthRecords.length} Hari`],
      ],
      bodyHtml,
      orientation: overrideOrientation || "landscape",
      format,
      filenameBase: `Rekap_Bulanan_Kelas_${ctx.monthlyRecapRombel}_${monthLabel}_${ctx.monthlyRecapYear}`,
      schoolInfo,
    });
    return;
  }

  // 5. GRADES (REKAP NILAI SISWA)
  if (activeTab === "grades") {
    const rombelStudents = ctx.students.filter((s) => s.grade === ctx.gradesRombel);
    const rowsHtml = rombelStudents
      .map((std, idx) => {
        const g = ctx.studentGrades[std.id] || {
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
        const tps = [g.tp1, g.tp2, g.tp3, g.tp4].filter((v) => v !== "") as number[];
        const rerataTp = tps.length > 0 ? (tps.reduce((a, b) => a + b, 0) / tps.length).toFixed(1) : "-";
        const stss = [g.stsTulisan, g.stsPraktik].filter((v) => v !== "") as number[];
        const rerataSts = stss.length > 0 ? (stss.reduce((a, b) => a + b, 0) / stss.length).toFixed(1) : "-";
        const pass = [g.pasTulisan, g.pasPraktik].filter((v) => v !== "") as number[];
        const rerataPas = pass.length > 0 ? (pass.reduce((a, b) => a + b, 0) / pass.length).toFixed(1) : "-";

        let na = "-";
        if (rerataTp !== "-" || rerataSts !== "-" || rerataPas !== "-") {
          let wSum = 0, wTot = 0;
          if (rerataTp !== "-") { wSum += parseFloat(rerataTp) * 0.4; wTot += 0.4; }
          if (rerataSts !== "-") { wSum += parseFloat(rerataSts) * 0.3; wTot += 0.3; }
          if (rerataPas !== "-") { wSum += parseFloat(rerataPas) * 0.3; wTot += 0.3; }
          na = wTot > 0 ? (wSum / wTot).toFixed(1) : "-";
        }

        return `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td style="font-weight:bold;">${std.name}</td>
            <td style="text-align:center;">${std.gender}</td>
            <td style="text-align:center;">${g.tp1 !== "" ? g.tp1 : "-"}</td>
            <td style="text-align:center;">${g.tp2 !== "" ? g.tp2 : "-"}</td>
            <td style="text-align:center;">${g.tp3 !== "" ? g.tp3 : "-"}</td>
            <td style="text-align:center;">${g.tp4 !== "" ? g.tp4 : "-"}</td>
            <td style="text-align:center;font-weight:bold;background:#f1f5f9;">${rerataTp}</td>
            <td style="text-align:center;">${g.stsTulisan !== "" ? g.stsTulisan : "-"}</td>
            <td style="text-align:center;">${g.stsPraktik !== "" ? g.stsPraktik : "-"}</td>
            <td style="text-align:center;">${g.pasTulisan !== "" ? g.pasTulisan : "-"}</td>
            <td style="text-align:center;">${g.pasPraktik !== "" ? g.pasPraktik : "-"}</td>
            <td style="text-align:center;font-weight:bold;background:#d1fae5;">${na}</td>
            <td>${g.notes || "-"}</td>
          </tr>
        `;
      })
      .join("");

    const bodyHtml = `
      <table class="f4-table">
        <thead>
          <tr>
            <th rowspan="2" style="width:4%;">No</th>
            <th rowspan="2" style="width:22%;">Nama Lengkap Peserta Didik</th>
            <th rowspan="2" style="width:4%;">L/P</th>
            <th colspan="5">Nilai Tujuan Pembelajaran (TP)</th>
            <th colspan="2">STS</th>
            <th colspan="2">PAS</th>
            <th rowspan="2" style="width:8%;">Nilai Akhir</th>
            <th rowspan="2" style="width:16%;">Catatan Guru</th>
          </tr>
          <tr>
            <th>TP 1</th><th>TP 2</th><th>TP 3</th><th>TP 4</th><th>Rerata</th>
            <th>Tulis</th><th>Praktik</th>
            <th>Tulis</th><th>Praktik</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div class="section-heading">KETERANGAN TUJUAN PEMBELAJARAN (TP)</div>
      <table class="f4-table">
        <tbody>
          <tr><td style="width:12%;font-weight:bold;">TP 1</td><td>${ctx.tp1Desc}</td></tr>
          <tr><td style="font-weight:bold;">TP 2</td><td>${ctx.tp2Desc}</td></tr>
          <tr><td style="font-weight:bold;">TP 3</td><td>${ctx.tp3Desc}</td></tr>
          <tr><td style="font-weight:bold;">TP 4</td><td>${ctx.tp4Desc}</td></tr>
        </tbody>
      </table>
    `;

    exportF4Document({
      title: `REKAPITULASI NILAI AKHIR SEMESTER PJOK — KELAS ${ctx.gradesRombel}`,
      subtitle: "Bobot Penilaian: Rerata TP (40%) + STS (30%) + PAS (30%)",
      metaRows: [
        ["Kelas / Rombel", ctx.gradesRombel, "Mata Pelajaran", "PJOK"],
        ["Jumlah Siswa", `${rombelStudents.length} Siswa`, "Tahun Ajaran", "2026/2027"],
      ],
      bodyHtml,
      orientation: overrideOrientation || "landscape",
      format,
      filenameBase: `Rekap_Nilai_PJOK_Kelas_${ctx.gradesRombel}`,
      schoolInfo,
    });
    return;
  }

  // 6. RPP / MODUL AJAR AI
  if (activeTab === "rpp") {
    const plan = ctx.currentRpp || ctx.savedPlans[0]?.content;
    const bodyHtml = plan
      ? `
        <div class="section-heading">I. KOMPONEN INTI & TUJUAN PEMBELAJARAN</div>
        <table class="f4-table">
          <tbody>
            <tr>
              <td style="width:25%;font-weight:bold;">Judul Modul Ajar</td>
              <td><strong>${plan.judul}</strong></td>
            </tr>
            <tr>
              <td style="font-weight:bold;">Alokasi Waktu</td>
              <td>${plan.alokasiWaktu || ctx.rppDuration}</td>
            </tr>
            <tr>
              <td style="font-weight:bold;">Kompetensi Awal</td>
              <td>${plan.kompetensiAwal || "-"}</td>
            </tr>
            <tr>
              <td style="font-weight:bold;">Profil Pelajar Pancasila</td>
              <td>${(plan.profilPancasila || []).join(", ")}</td>
            </tr>
            <tr>
              <td style="font-weight:bold;">Sarana & Prasarana</td>
              <td><ul style="margin:0;padding-left:16pt;">${(plan.sarana || []).map((s) => `<li>${s}</li>`).join("")}</ul></td>
            </tr>
            <tr>
              <td style="font-weight:bold;">Tujuan Pembelajaran</td>
              <td><ol style="margin:0;padding-left:16pt;">${(plan.tujuanPembelajaran || []).map((t) => `<li>${t}</li>`).join("")}</ol></td>
            </tr>
          </tbody>
        </table>

        <div class="section-heading">II. LANGKAH-LANGKAH KEGIATAN PEMBELAJARAN</div>
        <table class="f4-table">
          <thead>
            <tr>
              <th style="width:22%;">Tahap Kegiatan</th>
              <th style="width:78%;">Deskripsi Rincian Aktivitas Pembelajaran</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-weight:bold;text-align:center;">1. Kegiatan Pendahuluan</td>
              <td><ol style="margin:0;padding-left:16pt;">${(plan.kegiatan?.pendahuluan || []).map((p) => `<li>${p}</li>`).join("")}</ol></td>
            </tr>
            <tr>
              <td style="font-weight:bold;text-align:center;">2. Kegiatan Inti</td>
              <td><ol style="margin:0;padding-left:16pt;">${(plan.kegiatan?.inti || []).map((p) => `<li>${p}</li>`).join("")}</ol></td>
            </tr>
            <tr>
              <td style="font-weight:bold;text-align:center;">3. Kegiatan Penutup</td>
              <td><ol style="margin:0;padding-left:16pt;">${(plan.kegiatan?.penutup || []).map((p) => `<li>${p}</li>`).join("")}</ol></td>
            </tr>
          </tbody>
        </table>

        <div class="section-heading">III. RENCANA ASESMEN / PENILAIAN</div>
        <table class="f4-table">
          <thead>
            <tr>
              <th style="width:33%;">Asesmen Sikap (Afektif)</th>
              <th style="width:33%;">Asesmen Pengetahuan (Kognitif)</th>
              <th style="width:34%;">Asesmen Keterampilan (Psikomotor)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${plan.asesmen?.sikap || "-"}</td>
              <td>${plan.asesmen?.pengetahuan || "-"}</td>
              <td>${plan.asesmen?.keterampilan || "-"}</td>
            </tr>
          </tbody>
        </table>
      `
      : `<p>Belum ada Modul Ajar yang dipilih.</p>`;

    exportF4Document({
      title: "MODUL AJAR (RPP) KURIKULUM MERDEKA — PJOK SD",
      subtitle: plan?.judul || ctx.rppMaterial,
      metaRows: [
        ["Kelas / Fase", `Kelas ${ctx.rppGrade}`, "Model Pembelajaran", ctx.rppModel],
        ["Alokasi Waktu", ctx.rppDuration, "Mata Pelajaran", "PJOK"],
      ],
      bodyHtml,
      orientation: overrideOrientation || "portrait",
      format,
      filenameBase: `Modul_Ajar_PJOK_Kelas_${ctx.rppGrade}`,
      schoolInfo,
    });
    return;
  }

  // 7. INFOGRAPHICS (RANCANGAN INFOGRAFIS 3D AI)
  if (activeTab === "infographics") {
    const info = ctx.generatedInfographic;
    const sections = info?.sections || info?.poinUtama || [];
    const rowsHtml =
      Array.isArray(sections) && sections.length > 0
        ? sections
            .map(
              (sec: any, idx: number) => `
            <tr>
              <td style="text-align:center;">${idx + 1}</td>
              <td style="font-weight:bold;">${sec.title || sec.judul || `Panel ${idx + 1}`}</td>
              <td>${sec.content || sec.ringkasan || sec.deskripsi || "-"}</td>
              <td>${sec.visualCue || sec.ilustrasi3D || sec.visual || "-"}</td>
            </tr>
          `
            )
            .join("")
        : `
          <tr>
            <td style="text-align:center;">1</td>
            <td style="font-weight:bold;">${ctx.infographicTopic}</td>
            <td>${ctx.infographicMaterial.replace(/\n/g, "<br/>")}</td>
            <td>Ilustrasi 3D Edukatif Anak SD Berolahraga di Lapangan</td>
          </tr>
        `;

    const bodyHtml = `
      <table class="f4-table">
        <thead>
          <tr>
            <th style="width:6%;">No</th>
            <th style="width:24%;">Bagian / Sub-Topik Infografis</th>
            <th style="width:40%;">Konten Edukasi & Pesan Kunci</th>
            <th style="width:30%;">Arahan Visual 3D & Tata Letak</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      ${
        info?.imageGenPrompt
          ? `<div class="section-heading">PROMPT GENERATOR ILUSTRASI 3D</div><div class="section-box">${info.imageGenPrompt}</div>`
          : ""
      }
    `;

    exportF4Document({
      title: "DOKUMEN RANCANGAN INFOGRAFIS 3D PEMBELAJARAN PJOK",
      subtitle: info?.title || ctx.infographicTopic,
      metaRows: [
        ["Topik Infografis", ctx.infographicTopic, "Mata Pelajaran", "PJOK"],
        ["Format Visual", "Poster Edukasi 3D F4", "Tahun Ajaran", "2026/2027"],
      ],
      bodyHtml,
      orientation: overrideOrientation || "portrait",
      format,
      filenameBase: `Rancangan_Infografis_3D_PJOK`,
      schoolInfo,
    });
    return;
  }

  // 8. MATERI (ASISTEN MATERI AJAR AI)
  if (activeTab === "materi") {
    const m = ctx.generatedMateri;
    const subRows =
      Array.isArray(m?.uraianMateri) && m.uraianMateri.length > 0
        ? m.uraianMateri
            .map(
              (u: any, i: number) => `
            <tr>
              <td style="text-align:center;">${i + 1}</td>
              <td style="font-weight:bold;">${u.subJudul || u.judul || `Sub-Materi ${i + 1}`}</td>
              <td>${u.penjelasan || u.isi || "-"}</td>
              <td>${u.contohKonkret || u.contohPraktik || "-"}</td>
            </tr>
          `
            )
            .join("")
        : `
          <tr>
            <td style="text-align:center;">1</td>
            <td style="font-weight:bold;">${ctx.materiTopik}</td>
            <td>${m?.ringkasanEksekutif || m?.pendahuluan || "Uraian konsep gerak dasar dan teknik pelaksanaan di lapangan secara bertahap."}</td>
            <td>Praktik berpasangan dan berkelompok dengan pengawasan guru.</td>
          </tr>
        `;

    const bodyHtml = `
      <div class="section-heading">I. URAIAN MATERI AJAR TERSTRUKTUR</div>
      <table class="f4-table">
        <thead>
          <tr>
            <th style="width:6%;">No</th>
            <th style="width:24%;">Sub-Pokok Materi</th>
            <th style="width:45%;">Penjelasan Konsep & Teknik Gerak</th>
            <th style="width:25%;">Contoh Penerapan / Praktik</th>
          </tr>
        </thead>
        <tbody>${subRows}</tbody>
      </table>
    `;

    exportF4Document({
      title: "BAHAN & MATERI AJAR PESERTA DIDIK — PJOK",
      subtitle: m?.judulMateri || ctx.materiTopik,
      metaRows: [
        ["Mata Pelajaran", ctx.materiMapel, "Kelas / Fase", `${ctx.materiKelas} (${ctx.materiFase})`],
        ["Topik Bahasan", ctx.materiTopik, "Kurikulum", "Kurikulum Merdeka"],
      ],
      bodyHtml,
      orientation: overrideOrientation || "portrait",
      format,
      filenameBase: `Materi_Ajar_PJOK_${ctx.materiKelas}`,
      schoolInfo,
    });
    return;
  }

  // 9. SLIDES (SLIDE PRESENTASI SISWA AI)
  if (activeTab === "slides") {
    const slideArr = ctx.generatedSlides?.slides || [];
    const rowsHtml =
      Array.isArray(slideArr) && slideArr.length > 0
        ? slideArr
            .map(
              (sl: any, i: number) => `
            <tr>
              <td style="text-align:center;font-weight:bold;">Slide ${sl.slideNumber || i + 1}</td>
              <td style="font-weight:bold;">${sl.title || sl.judul || "-"}</td>
              <td><ul style="margin:0;padding-left:14pt;">${(Array.isArray(sl.bulletPoints) ? sl.bulletPoints : [sl.content || "-"]).map((bp: string) => `<li>${bp}</li>`).join("")}</ul></td>
              <td>${sl.visualSuggestion || sl.visual || "-"}</td>
              <td>${sl.speakerNotes || sl.catatanGuru || "-"}</td>
            </tr>
          `
            )
            .join("")
        : `
          <tr>
            <td style="text-align:center;font-weight:bold;">Slide 1</td>
            <td style="font-weight:bold;">${ctx.slidesMateriPokok}</td>
            <td>Pengantar materi, tujuan pembelajaran, dan pertanyaan pemantik diskusi siswa.</td>
            <td>Ilustrasi gerakan olahraga PJOK</td>
            <td>Apersepsi awal pembelajaran</td>
          </tr>
        `;

    const bodyHtml = `
      <table class="f4-table">
        <thead>
          <tr>
            <th style="width:9%;">No Slide</th>
            <th style="width:20%;">Judul Slide</th>
            <th style="width:33%;">Poin Materi Utama</th>
            <th style="width:19%;">Visual / Ilustrasi</th>
            <th style="width:19%;">Catatan Presentasi Guru</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;

    exportF4Document({
      title: "KERANGKA SLIDE PRESENTASI PEMBELAJARAN PJOK",
      subtitle: ctx.slidesMateriPokok,
      metaRows: [
        ["Materi Pokok", ctx.slidesMateriPokok, "Kelas Sasaran", ctx.slidesKelas],
        ["Guru Penyusun", schoolInfo.teacherName, "Mata Pelajaran", "PJOK"],
      ],
      bodyHtml,
      orientation: overrideOrientation || "landscape",
      format,
      filenameBase: `Slide_Presentasi_PJOK_${ctx.slidesKelas}`,
      schoolInfo,
    });
    return;
  }

  // 10. LKPD (LEMBAR KERJA PESERTA DIDIK AI)
  if (activeTab === "lkpd") {
    const lkpd = ctx.generatedLkpd;
    const aktivitasList = lkpd?.langkahKegiatan || lkpd?.aktivitas || [];
    const rowsHtml =
      Array.isArray(aktivitasList) && aktivitasList.length > 0
        ? aktivitasList
            .map(
              (act: any, idx: number) => `
            <tr>
              <td style="text-align:center;">${idx + 1}</td>
              <td style="font-weight:bold;">${act.tahap || act.judul || `Tahap ${idx + 1}`}</td>
              <td>${act.instruksi || act.deskripsi || act}</td>
              <td></td>
            </tr>
          `
            )
            .join("")
        : `
          <tr>
            <td style="text-align:center;">1</td>
            <td style="font-weight:bold;">Observasi & Pemanasan</td>
            <td>Mengamati peragaan gerakan dasar dan melakukan pemanasan berpasangan.</td>
            <td></td>
          </tr>
          <tr>
            <td style="text-align:center;">2</td>
            <td style="font-weight:bold;"> Eksplorasi Praktik Kelompok</td>
            <td>Mempraktikkan variasi gerakan pada pos latihan dan mencatat hasil pengamatan teman.</td>
            <td></td>
          </tr>
        `;

    const bodyHtml = `
      <div class="section-heading">I. IDENTITAS KELOMPOK / PESERTA DIDIK</div>
      <table class="f4-table">
        <tbody>
          <tr>
            <td style="width:25%;font-weight:bold;">Nama Peserta Didik / Kelompok</td>
            <td style="width:25%;">....................................................</td>
            <td style="width:20%;font-weight:bold;">Kelas / Rombel</td>
            <td style="width:30%;">${ctx.lkpdKelas}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;">Topik Praktik LKPD</td>
            <td>${ctx.lkpdTopik}</td>
            <td style="font-weight:bold;">Model Sintaks</td>
            <td>${ctx.lkpdSintaks}</td>
          </tr>
        </tbody>
      </table>

      <div class="section-heading">II. TABEL LANGKAH KERJA & HASIL PENGAMATAN PRAKTIK SISWA</div>
      <table class="f4-table">
        <thead>
          <tr>
            <th style="width:6%;">No</th>
            <th style="width:22%;">Tahapan Sintaks / Aktivitas</th>
            <th style="width:44%;">Instruksi Kerja Praktik Lapangan</th>
            <th style="width:28%;">Hasil Pengamatan / Catatan Siswa</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;

    exportF4Document({
      title: "LEMBAR KERJA PESERTA DIDIK (LKPD) — PJOK",
      subtitle: lkpd?.judulLkpd || ctx.lkpdTopik,
      metaRows: [
        ["Mata Pelajaran", "PJOK", "Kelas", ctx.lkpdKelas],
        ["Model Pembelajaran", ctx.lkpdSintaks, "Topik", ctx.lkpdTopik],
      ],
      bodyHtml,
      orientation: overrideOrientation || "portrait",
      format,
      filenameBase: `LKPD_PJOK_${ctx.lkpdKelas}`,
      schoolInfo,
    });
    return;
  }

  // 11. SOAL (GENERATOR SOAL PRAKTIK, KISI-KISI & FORMAT PENILAIAN)
  if (activeTab === "soal") {
    const kisiList = ctx.generatedSoal?.kisiKisi || [];
    const totalSkor = kisiList.reduce((acc: number, item: any) => acc + (Number(item.skor) || 0), 0);

    const kisiRowsHtml = kisiList
      .map(
        (item: any, idx: number) => `
        <tr>
          <td style="text-align:center;font-weight:bold;">${item.no || idx + 1}</td>
          <td>${item.tujuanPembelajaran || "-"}</td>
          <td><strong>${item.ruangLingkupMateri || "-"}</strong></td>
          <td style="text-align:center;">${item.levelKognitif || "-"}</td>
          <td>${item.indikatorSoal || "-"}</td>
          <td style="text-align:center;">${item.bentukSoal || "Unjuk Kerja"}</td>
          <td style="text-align:center;font-weight:bold;">${item.nomorSoal || idx + 1}</td>
          <td>${(item.naskahSoal || "-").replace(/\n/g, "<br/>")}</td>
          <td>${(item.kunciJawaban || "-").replace(/\n/g, "<br/>")}</td>
          <td style="text-align:center;font-weight:bold;">${item.skor || 20}</td>
        </tr>
      `
      )
      .join("");

    const rombelStudents = ctx.students.filter((s) => s.grade === ctx.soalPenilaianRombel);
    const qHeaders = kisiList
      .map(
        (item: any, idx: number) =>
          `<th>Soal ${item.nomorSoal || idx + 1}<br/>(Maks ${item.skor || 20})</th>`
      )
      .join("");

    const studentRowsHtml = rombelStudents
      .map((std, sIdx) => {
        const scMap = ctx.soalStudentScores[std.id] || {};
        let rawTotal = 0;
        let hasFilled = false;
        const cells = kisiList
          .map((_: any, qIdx: number) => {
            const v = scMap[qIdx];
            if (v !== undefined && v !== "") {
              rawTotal += Number(v);
              hasFilled = true;
              return `<td style="text-align:center;font-weight:bold;">${v}</td>`;
            }
            return `<td style="text-align:center;color:#94a3b8;">........</td>`;
          })
          .join("");
        const na = hasFilled && totalSkor > 0 ? Math.round((rawTotal / totalSkor) * 100) : "";
        const predikat =
          na === "" ? "" : na >= 88 ? "A (Sangat Baik)" : na >= 75 ? "B (Baik)" : na >= 61 ? "C (Cukup)" : "D (Perlu Bimbingan)";
        return `
          <tr>
            <td style="text-align:center;">${sIdx + 1}</td>
            <td style="font-weight:bold;">${std.name}</td>
            <td style="text-align:center;">${std.gender}</td>
            ${cells}
            <td style="text-align:center;font-weight:bold;">${hasFilled ? rawTotal : ""}</td>
            <td style="text-align:center;font-weight:bold;">${na !== "" ? na : ""}</td>
            <td style="text-align:center;font-weight:bold;">${predikat}</td>
          </tr>
        `;
      })
      .join("");

    const bodyHtml = `
      <div class="section-heading">I. TABEL KISI-KISI & NASKAH SOAL PRAKTIK PJOK (10 KOLOM)</div>
      <table class="f4-table">
        <thead>
          <tr>
            <th style="width:3%;">No</th>
            <th style="width:13%;">Tujuan Pembelajaran</th>
            <th style="width:10%;">Ruang Lingkup Materi</th>
            <th style="width:9%;">Level Kognitif</th>
            <th style="width:13%;">Indikator Soal</th>
            <th style="width:8%;">Bentuk Soal</th>
            <th style="width:5%;">No Soal</th>
            <th style="width:17%;">Naskah Soal Praktik</th>
            <th style="width:17%;">Kunci Jawaban / Kriteria Gerak</th>
            <th style="width:5%;">Skor</th>
          </tr>
        </thead>
        <tbody>
          ${kisiRowsHtml}
          <tr>
            <td colspan="9" style="text-align:right;font-weight:bold;background:#f1f5f9;">TOTAL SKOR MAKSIMAL</td>
            <td style="text-align:center;font-weight:bold;background:#d1fae5;">${totalSkor}</td>
          </tr>
        </tbody>
      </table>

      <div class="section-heading">II. FORMAT LEMBAR PENILAIAN UJIAN PRAKTIK SISWA — KELAS ${ctx.soalPenilaianRombel}</div>
      <table class="f4-table">
        <thead>
          <tr>
            <th style="width:4%;">No</th>
            <th style="width:24%;">Nama Lengkap Peserta Didik</th>
            <th style="width:5%;">L/P</th>
            ${qHeaders}
            <th style="width:8%;">Total Skor</th>
            <th style="width:8%;">Nilai Akhir</th>
            <th style="width:14%;">Predikat KKTP</th>
          </tr>
        </thead>
        <tbody>${studentRowsHtml}</tbody>
      </table>
    `;

    exportF4Document({
      title: `INSTRUMEN KISI-KISI, SOAL PRAKTIK, & FORMAT PENILAIAN — ${ctx.soalJenisAsesmen}`,
      subtitle: `${ctx.soalKelas} (${ctx.soalFase}) — Rombel Penilaian: Kelas ${ctx.soalPenilaianRombel}`,
      metaRows: [
        ["Mata Pelajaran", "PJOK", "Kelas / Fase", `${ctx.soalKelas} (${ctx.soalFase})`],
        ["Jenis Asesmen", ctx.soalJenisAsesmen, "Rombel Dinilai", `Kelas ${ctx.soalPenilaianRombel}`],
      ],
      bodyHtml,
      orientation: overrideOrientation || "landscape",
      format,
      filenameBase: `Kisi_Kisi_Soal_Praktik_F4_${ctx.soalPenilaianRombel}`,
      schoolInfo,
    });
    return;
  }

  // 12. INVENTORY (INVENTARIS ALAT OLAHRAGA PJOK)
  if (activeTab === "inventory") {
    const totalAll = ctx.inventory.reduce((acc, i) => acc + i.total, 0);
    const totalGood = ctx.inventory.reduce((acc, i) => acc + i.goodCondition, 0);
    const totalDamaged = ctx.inventory.reduce((acc, i) => acc + i.damagedCondition, 0);

    const rowsHtml = ctx.inventory
      .map(
        (item, idx) => `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td style="font-weight:bold;">${item.name}</td>
          <td style="text-align:center;">${item.category}</td>
          <td style="text-align:center;font-weight:bold;">${item.total} ${item.unit}</td>
          <td style="text-align:center;color:#065f46;font-weight:bold;">${item.goodCondition} ${item.unit}</td>
          <td style="text-align:center;color:#991b1b;font-weight:bold;">${item.damagedCondition} ${item.unit}</td>
          <td>${item.notes || "Tersimpan di Gudang Alat PJOK"}</td>
        </tr>
      `
      )
      .join("");

    const bodyHtml = `
      <table class="f4-table">
        <thead>
          <tr>
            <th style="width:6%;">No</th>
            <th style="width:26%;">Nama Sarana / Alat Olahraga</th>
            <th style="width:14%;">Kategori</th>
            <th style="width:12%;">Jumlah Total</th>
            <th style="width:12%;">Kondisi Baik</th>
            <th style="width:12%;">Kondisi Rusak</th>
            <th style="width:18%;">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <tr>
            <td colspan="3" style="text-align:right;font-weight:bold;background:#f1f5f9;">TOTAL KESELURUHAN ALAT</td>
            <td style="text-align:center;font-weight:bold;background:#f1f5f9;">${totalAll} Unit</td>
            <td style="text-align:center;font-weight:bold;background:#ecfdf5;">${totalGood} Unit</td>
            <td style="text-align:center;font-weight:bold;background:#fef2f2;">${totalDamaged} Unit</td>
            <td style="background:#f1f5f9;">Diverifikasi</td>
          </tr>
        </tbody>
      </table>
    `;

    exportF4Document({
      title: "LAPORAN INVENTARIS SARANA DAN PRASARANA ALAT OLAHRAGA PJOK",
      subtitle: "Pemeriksaan Berkala Kondisi Peralatan Praktik PJOK",
      metaRows: [
        ["Satuan Pendidikan", schoolInfo.schoolName, "Total Jenis Alat", `${ctx.inventory.length} Jenis`],
        ["Penanggung Jawab", schoolInfo.teacherName, "Total Unit Fisik", `${totalAll} Unit`],
      ],
      bodyHtml,
      orientation: overrideOrientation || "portrait",
      format,
      filenameBase: "Laporan_Inventaris_Alat_PJOK",
      schoolInfo,
    });
    return;
  }

  // 13. SCHEDULE (AGENDA & JADWAL PELAJARAN PJOK)
  if (activeTab === "schedule") {
    const rowsHtml = ctx.schedule
      .map(
        (item, idx) => `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td style="text-align:center;font-weight:bold;">${item.day}</td>
          <td style="text-align:center;">${item.timeSlot}</td>
          <td style="text-align:center;font-weight:bold;">${item.grade}</td>
          <td><strong>${item.topic}</strong></td>
          <td style="text-align:center;">${item.location}</td>
        </tr>
      `
      )
      .join("");

    const bodyHtml = `
      <table class="f4-table">
        <thead>
          <tr>
            <th style="width:6%;">No</th>
            <th style="width:14%;">Hari</th>
            <th style="width:16%;">Jam Pelajaran</th>
            <th style="width:14%;">Kelas / Rombel</th>
            <th style="width:34%;">Materi Pokok / Topik Pembelajaran</th>
            <th style="width:16%;">Lokasi Praktik</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;

    exportF4Document({
      title: "JADWAL & AGENDA MENGAJAR MATA PELAJARAN PJOK",
      subtitle: "Tahun Ajaran 2026/2027 — Kurikulum Merdeka",
      metaRows: [
        ["Guru Mata Pelajaran", schoolInfo.teacherName, "Total Sesi Mengajar", `${ctx.schedule.length} Sesi / Minggu`],
        ["Satuan Pendidikan", schoolInfo.schoolName, "Semester", "Ganjil / Genap"],
      ],
      bodyHtml,
      orientation: overrideOrientation || "portrait",
      format,
      filenameBase: "Jadwal_Mengajar_PJOK",
      schoolInfo,
    });
    return;
  }

  // 14. DATABASE (DOKUMENTASI & STATUS DATABASE CLOUD SUPABASE + PANDUAN DEPLOY)
  const bodyHtml = `
    <div class="section-heading">I. PETA SINKRONISASI ENTITAS DATA APLIKASI (PUBLIC.SADAR_APP_DATA)</div>
    <table class="f4-table">
      <thead>
        <tr>
          <th style="width:6%;">No</th>
          <th style="width:30%;">Nama Koleksi / Entitas Data</th>
          <th style="width:22%;">Primary Key (JSONB)</th>
          <th style="width:16%;">Jumlah Rekaman</th>
          <th style="width:26%;">Status Sinkronisasi Cloud</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align:center;">1</td>
          <td><strong>Data Induk & Kebugaran Siswa (TKJI)</strong></td>
          <td style="font-family:monospace;">sadar_students</td>
          <td style="text-align:center;font-weight:bold;">${ctx.students.length} Siswa</td>
          <td>Tersinkronisasi (Supabase Absensi2027)</td>
        </tr>
        <tr>
          <td style="text-align:center;">2</td>
          <td><strong>Data Rombongan Belajar (Kelas)</strong></td>
          <td style="font-family:monospace;">sadar_custom_rombels</td>
          <td style="text-align:center;font-weight:bold;">${ctx.customRombels.length} Rombel</td>
          <td>Tersinkronisasi (Supabase Absensi2027)</td>
        </tr>
        <tr>
          <td style="text-align:center;">3</td>
          <td><strong>Rekaman Absensi Harian, Mingguan, Bulanan & Semester</strong></td>
          <td style="font-family:monospace;">sadar_attendance_records</td>
          <td style="text-align:center;font-weight:bold;">${ctx.attendanceRecords.length} Sesi</td>
          <td>Tersinkronisasi (Supabase Absensi2027)</td>
        </tr>
        <tr>
          <td style="text-align:center;">4</td>
          <td><strong>Rekapitulasi Nilai Akhir Semester (TP, STS, PAS)</strong></td>
          <td style="font-family:monospace;">sadar_student_grades</td>
          <td style="text-align:center;font-weight:bold;">${Object.keys(ctx.studentGrades).length} Rekaman</td>
          <td>Tersinkronisasi (Supabase Absensi2027)</td>
        </tr>
        <tr>
          <td style="text-align:center;">5</td>
          <td><strong>Koleksi Modul Ajar (RPP) Kurikulum Merdeka</strong></td>
          <td style="font-family:monospace;">sadar_saved_plans</td>
          <td style="text-align:center;font-weight:bold;">${ctx.savedPlans.length} Dokumen</td>
          <td>Tersinkronisasi (Supabase Absensi2027)</td>
        </tr>
        <tr>
          <td style="text-align:center;">6</td>
          <td><strong>Inventaris Sarana & Alat Olahraga</strong></td>
          <td style="font-family:monospace;">sadar_inventory</td>
          <td style="text-align:center;font-weight:bold;">${ctx.inventory.length} Jenis Alat</td>
          <td>Tersinkronisasi (Supabase Absensi2027)</td>
        </tr>
        <tr>
          <td style="text-align:center;">7</td>
          <td><strong>Agenda & Jadwal Mengajar PJOK</strong></td>
          <td style="font-family:monospace;">sadar_schedule</td>
          <td style="text-align:center;font-weight:bold;">${ctx.schedule.length} Jadwal</td>
          <td>Tersinkronisasi (Supabase Absensi2027)</td>
        </tr>
      </tbody>
    </table>

    <div class="section-heading">II. KONFIGURASI VARIABEL ENVIRONMENT PRODUCTION (.ENV)</div>
    <table class="f4-table">
      <thead>
        <tr>
          <th style="width:6%;">No</th>
          <th style="width:36%;">Nama Variabel Environment</th>
          <th style="width:58%;">Nilai / Konfigurasi Production</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align:center;">1</td>
          <td style="font-family:monospace;font-weight:bold;">NEXT_PUBLIC_SUPABASE_PROJECT_NAME</td>
          <td>Absensi2027</td>
        </tr>
        <tr>
          <td style="text-align:center;">2</td>
          <td style="font-family:monospace;font-weight:bold;">NEXT_PUBLIC_SUPABASE_PROJECT_ID</td>
          <td>adbrzheropnjefvoexhti</td>
        </tr>
        <tr>
          <td style="text-align:center;">3</td>
          <td style="font-family:monospace;font-weight:bold;">NEXT_PUBLIC_SUPABASE_URL</td>
          <td>https://dbrzheropnjefvoexhti.supabase.co</td>
        </tr>
        <tr>
          <td style="text-align:center;">4</td>
          <td style="font-family:monospace;font-weight:bold;">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</td>
          <td>sb_publishable_qGUej4CCU1TpMueHJ7UGjA_nszgX221</td>
        </tr>
        <tr>
          <td style="text-align:center;">5</td>
          <td style="font-family:monospace;font-weight:bold;">GEMINI_API_KEY</td>
          <td>Kunci API Server-Side untuk Generator Modul Ajar, LKPD, Materi, Slide & Soal Praktik AI</td>
        </tr>
      </tbody>
    </table>

    <div class="section-heading">III. PROSEDUR STANDAR DEPLOYMENT APLIKASI KE PRODUCTION</div>
    <table class="f4-table">
      <thead>
        <tr>
          <th style="width:6%;">No</th>
          <th style="width:24%;">Platform Hosting</th>
          <th style="width:70%;">Langkah-Langkah Deployment & Konfigurasi</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align:center;">1</td>
          <td><strong>Vercel (GitHub + Next.js)</strong></td>
          <td>1) Unggah kode ke repositori GitHub. 2) Buka vercel.com/new dan import repositori. 3) Masukkan variabel environment Supabase Absensi2027 & GEMINI_API_KEY. 4) Klik Deploy hingga domain .vercel.app aktif.</td>
        </tr>
        <tr>
          <td style="text-align:center;">2</td>
          <td><strong>Google Cloud Run</strong></td>
          <td>1) Klik tombol Deploy / Share App pada editor. 2) Pastikan variabel environment terdaftar pada layanan Cloud Run. 3) Salin tautan publik .run.app untuk digunakan oleh guru di sekolah.</td>
        </tr>
        <tr>
          <td style="text-align:center;">3</td>
          <td><strong>Server Sekolah / VPS</strong></td>
          <td>1) Jalankan git clone & npm install. 2) Salin variabel environment ke berkas .env.local. 3) Jalankan npm run build dilanjutkan npm run start pada port 3000.</td>
        </tr>
      </tbody>
    </table>
  `;

  // 13b. BUKU PANDUAN GURU PJOK SIBI (KEMENDIKBUDRISTEK)
  if (activeTab === "sibi") {
    const book = getSibiBookByGrade(ctx.rppGrade || "IV");
    const elemenRows = SIBI_ELEMEN_CP_PJOK.map(
      (el, idx) => `
      <tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td><strong>${el.kode}: ${el.nama}</strong></td>
        <td>${el.deskripsi}</td>
      </tr>
    `
    ).join("");

    const unitRows = book.units
      .map(
        (u) => `
      <tr>
        <td style="text-align:center;font-weight:bold;">Unit ${u.unitNumber}</td>
        <td>
          <strong>${u.title}</strong><br/>
          <span style="font-size:8.5pt;color:#475569;">Elemen: ${u.elemen} | Alokasi: ${u.alokasiWaktu}</span>
        </td>
        <td>
          <ul style="margin:0;padding-left:14pt;">
            ${u.tujuanPembelajaran.map((tp) => `<li>${tp}</li>`).join("")}
          </ul>
        </td>
        <td>
          <strong>Aktivitas 1:</strong> ${u.aktivitasPembelajaran.aktivitas1}<br/>
          <strong>Aktivitas 2:</strong> ${u.aktivitasPembelajaran.aktivitas2}<br/>
          <strong>Aktivitas 3 (Permainan):</strong> ${u.aktivitasPembelajaran.aktivitas3Permainan}
        </td>
        <td>${u.kktp}</td>
      </tr>
    `
      )
      .join("");

    const bodyHtml = `
      <div class="section-heading">I. IDENTITAS BUKU PANDUAN GURU PJOK RESMI SIBI KEMENDIKBUDRISTEK</div>
      <table class="f4-table">
        <tbody>
          <tr>
            <td style="width:24%;font-weight:bold;">Judul Buku Resmi SIBI</td>
            <td><strong>${book.bookTitle}</strong></td>
          </tr>
          <tr>
            <td style="font-weight:bold;">Penulis & ISBN</td>
            <td>${book.authors} — ISBN: <strong>${book.isbn}</strong></td>
          </tr>
          <tr>
            <td style="font-weight:bold;">Penerbit Resmi</td>
            <td>${book.publisher} (${book.sibiCatalogUrl})</td>
          </tr>
          <tr>
            <td style="font-weight:bold;">Fokus Fase</td>
            <td>${book.elemenRingkasan}</td>
          </tr>
        </tbody>
      </table>

      <div class="section-heading">II. EMPAT ELEMEN CAPAIAN PEMBELAJARAN (CP) PJOK KURIKULUM MERDEKA</div>
      <table class="f4-table">
        <thead>
          <tr>
            <th style="width:6%;">No</th>
            <th style="width:28%;">Elemen Capaian Pembelajaran</th>
            <th style="width:66%;">Deskripsi Kompetensi (BSKAP & Buku Panduan PJOK SIBI)</th>
          </tr>
        </thead>
        <tbody>
          ${elemenRows}
        </tbody>
      </table>

      <div class="section-heading">III. PEMETAAN SILABUS UNIT 1 S.D. UNIT 8 (${book.kelasLabel.toUpperCase()} - ${book.fase.toUpperCase()})</div>
      <table class="f4-table">
        <thead>
          <tr>
            <th style="width:7%;">Unit</th>
            <th style="width:21%;">Judul Unit & Alokasi</th>
            <th style="width:26%;">Tujuan Pembelajaran (TP)</th>
            <th style="width:28%;">Alur Aktivitas Pembelajaran 1, 2, & 3</th>
            <th style="width:18%;">KKTP</th>
          </tr>
        </thead>
        <tbody>
          ${unitRows}
        </tbody>
      </table>
    `;

    exportF4Document({
      title: `SILABUS & PEMETAAN BUKU PANDUAN GURU PJOK (SIBI KEMENDIKBUDRISTEK) — ${book.kelasLabel.toUpperCase()}`,
      subtitle: `${book.bookTitle} (${book.authors} | ISBN ${book.isbn})`,
      metaRows: [
        ["Sumber Resmi", "SIBI Pusat Perbukuan Kemendikbudristek", "Kelas / Fase", `${book.kelasLabel} (${book.fase})`],
        ["Penulis Buku", book.authors, "ISBN Resmi", book.isbn],
      ],
      bodyHtml,
      orientation: overrideOrientation || "landscape",
      format,
      filenameBase: `Silabus_Buku_Panduan_PJOK_SIBI_Kelas_${book.grade}`,
      schoolInfo,
    });
    return;
  }

  exportF4Document({
    title: "DOKUMENTASI KONEKSI DATABASE CLOUD SUPABASE (ABSENSI2027) & PANDUAN DEPLOY",
    subtitle: "Standar Operasional Prosedur (SOP) Sinkronisasi Data & Penayangan Aplikasi PJOK",
    metaRows: [
      ["Nama Proyek Cloud", "Absensi2027", "ID Proyek", "adbrzheropnjefvoexhti"],
      ["Tabel Utama", "public.sadar_app_data", "Status Koneksi", "Aktif & Terhubung"],
    ],
    bodyHtml,
    orientation: overrideOrientation || "portrait",
    format,
    filenameBase: "Dokumentasi_Database_dan_Panduan_Deploy_Supabase",
    schoolInfo,
  });
}
