"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Users,
  Layers,
  FileText,
  Calendar,
  Sparkles,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  ClipboardCheck,
  FileDown,
  Printer,
  Copy,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Package,
  BookOpen,
  Presentation,
  Info,
  Sliders,
  Scale,
  RefreshCw,
  AlertTriangle,
  MapPin,
  Clock,
  HeartPulse,
  Lock,
  LogOut,
  Database,
  CloudUpload,
  CloudDownload,
  Terminal,
  FileSpreadsheet,
  CalendarDays,
  CheckCircle2,
  BarChart3,
  Filter,
  Download,
  Table
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  Student,
  InventoryItem,
  ScheduleItem,
  SavedModulAjar,
  initialStudents,
  initialInventory,
  initialSchedule,
  materialSuggestionsByGrade,
  calculateBMI,
  calculateFitnessScore
} from "@/lib/pe-utils";
import {
  getBrowserClient,
  getSupabaseProjectInfo
} from "@/lib/supabase";
import F4ExportBar from "@/components/F4ExportBar";
import DatabaseCloudGuide from "@/components/DatabaseCloudGuide";
import SibiGuideTab, { SibiQuickPicker } from "@/components/SibiGuideTab";
import AutoFillGradesPanel from "@/components/AutoFillGradesPanel";
import { exportActiveMenuAsF4 } from "@/lib/f4-document";

export default function SadarDashboard() {
  // Navigation Tabs State
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "rpp" | "inventory" | "schedule" | "rombel" | "attendance" | "grades" | "infographics" | "materi" | "slides" | "lkpd" | "soal" | "sibi" | "database">("overview");

  // Core Data States
  const [students, setStudents] = useState<Student[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [savedPlans, setSavedPlans] = useState<SavedModulAjar[]>([]);

  // Attendance States
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [attendanceRombel, setAttendanceRombel] = useState<string>("IV-A");
  const [attendanceList, setAttendanceList] = useState<{[studentId: string]: { status: "H" | "S" | "I" | "A"; notes: string }}>({});
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceSuccessMessage, setAttendanceSuccessMessage] = useState<string | null>(null);

  // Monthly, Weekly & Semester Attendance Recap States
  const [attendanceSubTab, setAttendanceSubTab] = useState<"daily" | "weekly" | "monthly" | "semester">("daily");
  const [monthlyRecapMonth, setMonthlyRecapMonth] = useState<number>(new Date().getMonth() + 1);
  const [monthlyRecapYear, setMonthlyRecapYear] = useState<number>(new Date().getFullYear());
  const [monthlyRecapRombel, setMonthlyRecapRombel] = useState<string>("IV-A");
  const [monthlyRecapSearch, setMonthlyRecapSearch] = useState<string>("");
  const [semesterRecapType, setSemesterRecapType] = useState<"1" | "2">("1");

  // Grades States
  const [gradesRombel, setGradesRombel] = useState<string>("IV-A");
  const [tp1Desc, setTp1Desc] = useState<string>("Keterampilan Pola Gerak Dasar Lokomotor, Non-Lokomotor, & Manipulatif");
  const [tp2Desc, setTp2Desc] = useState<string>("Aktivitas Keterampilan Senam, Gerak Berirama, & Olahraga Air");
  const [tp3Desc, setTp3Desc] = useState<string>("Pengembangan Kebugaran Jasmani terkait Kebugaran & Kesehatan");
  const [tp4Desc, setTp4Desc] = useState<string>("Penerapan Perilaku Hidup Bersih Sehat (PHBS) & Pencegahan Penyakit");
  const [studentGrades, setStudentGrades] = useState<{[studentId: string]: {
    tp1: number | "";
    tp2: number | "";
    tp3: number | "";
    tp4: number | "";
    stsTulisan: number | "";
    stsPraktik: number | "";
    pasTulisan: number | "";
    pasPraktik: number | "";
    notes: string;
  }}>({});
  const [gradesSuccessMessage, setGradesSuccessMessage] = useState<string | null>(null);

  // Signature States for Report (Kop Sekolah & Signatures)
  const [schoolName, setSchoolName] = useState<string>("SD NEGERI SADAR PJOK PRATAMA");
  const [schoolAddress, setSchoolAddress] = useState<string>("Jl. Olahraga Kebugaran No. 100, Kab. Sadar");
  const [headmasterName, setHeadmasterName] = useState<string>("Drs. H. Sadar Sentosa, M.Pd");
  const [headmasterNip, setHeadmasterNip] = useState<string>("19740523 200212 1 002");
  const [teacherName, setTeacherName] = useState<string>("Sadar Rafsanjani, S.Pd");
  const [teacherNip, setTeacherNip] = useState<string>("19910314 201801 1 004");

  // Selected details or Form States
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditingStudent, setIsEditingStudent] = useState<boolean>(false);
  const [studentForm, setStudentForm] = useState<Partial<Student>>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [classFilter, setClassFilter] = useState<string>("Semua");

  // Rombel and Bulk Import States
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<Student[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [customRombels, setCustomRombels] = useState<string[]>([]);
  const [selectedRombel, setSelectedRombel] = useState<string>("Semua");
  const [viewingRombel, setViewingRombel] = useState<string | null>(null);
  const [newRombelName, setNewRombelName] = useState<string>("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedRombels, setSelectedRombels] = useState<string[]>([]);
  const [rombelToDelete, setRombelToDelete] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState<string>("");
  const [importMethod, setImportMethod] = useState<"file" | "paste">("file");

  // RPP / Modul Ajar AI Generator States
  const [rppGrade, setRppGrade] = useState<string>("IV");
  const [rppMaterial, setRppMaterial] = useState<string>("Teknik Dasar Kasti: Melempar, Menangkap, Memukul");
  const [rppDuration, setRppDuration] = useState<string>("2 x 35 Menit (1 Pertemuan)");
  const [rppModel, setRppModel] = useState<string>("Cooperative Learning");
  const [isGeneratingRpp, setIsGeneratingRpp] = useState<boolean>(false);
  const [currentRpp, setCurrentRpp] = useState<SavedModulAjar["content"] | null>(null);
  const [selectedSavedPlan, setSelectedSavedPlan] = useState<SavedModulAjar | null>(null);
  const [rppSuccessMessage, setRppSuccessMessage] = useState<string | null>(null);
  const [rppErrorMessage, setRppErrorMessage] = useState<string | null>(null);

  // Infographic Generator States
  const [infographicMaterial, setInfographicMaterial] = useState<string>(
    "1. Pemanasan dinamis sebelum olahraga mencegah cedera otot.\n2. Teknik dasar lempar tangkap bola kasti melatih koordinasi mata dan tangan.\n3. Minum air putih yang cukup menjaga kebugaran tubuh saat bergerak di lapangan.\n4. Pendinginan setelah berolahraga mengembalikan detak jantung ke kondisi normal."
  );
  const [infographicTopic, setInfographicTopic] = useState<string>("5 Kunci Kebugaran & Teknik Bermain Bola Kasti");
  const [isGeneratingInfographic, setIsGeneratingInfographic] = useState<boolean>(false);
  const [generatedInfographic, setGeneratedInfographic] = useState<any | null>(null);
  const [infographicValidationErrors, setInfographicValidationErrors] = useState<string | null>(null);
  const [infographicSuccessMessage, setInfographicSuccessMessage] = useState<string | null>(null);

  // Materi Ajar Generator States
  const [materiMapel, setMateriMapel] = useState<string>("Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)");
  const [materiJenjang, setMateriJenjang] = useState<string>("SD");
  const [materiKelas, setMateriKelas] = useState<string>("Kelas 5");
  const [materiFase, setMateriFase] = useState<string>("Fase C");
  const [materiTopik, setMateriTopik] = useState<string>("Teknik Dasar Bola Voli Mini: Passing Bawah dan Passing Atas");
  const [materiTujuan, setMateriTujuan] = useState<string>("Peserta didik mampu memahami dan mempraktikkan variasi gerak dasar passing bawah dan passing atas dalam permainan bola voli mini dengan koordinasi yang baik serta sikap sportif.");
  const [materiPromptVersion, setMateriPromptVersion] = useState<"versi1" | "versi2">("versi1");
  const [materiLevelBloom, setMateriLevelBloom] = useState<string>("C3 - Menerapkan");
  const [materiDimensiProfil, setMateriDimensiProfil] = useState<string>("Mandiri, Gotong Royong");
  const [isGeneratingMateri, setIsGeneratingMateri] = useState<boolean>(false);
  const [generatedMateri, setGeneratedMateri] = useState<any | null>(null);
  const [materiValidationErrors, setMateriValidationErrors] = useState<string | null>(null);
  const [materiSuccessMessage, setMateriSuccessMessage] = useState<string | null>(null);

  // Slide Presentasi Generator States
  const [slidesPromptType, setSlidesPromptType] = useState<"notebook" | "canva">("notebook");
  const [slidesNamaGuru, setSlidesNamaGuru] = useState<string>("San Rafsanjani, S.Pd.");
  const [slidesMapel, setSlidesMapel] = useState<string>("Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)");
  const [slidesKelas, setSlidesKelas] = useState<string>("Kelas 5");
  const [slidesNamaSekolah, setSlidesNamaSekolah] = useState<string>("SD Negeri 1 Sadar");
  const [slidesTujuanPembelajaran, setSlidesTujuanPembelajaran] = useState<string>("Memahami dan mempraktikkan kombinasi gerak dasar lokomotor, non-lokomotor, dan manipulatif dalam permainan bola besar.");
  const [slidesPertanyaanPemantik, setSlidesPertanyaanPemantik] = useState<string>("Mengapa posisi tubuh dan ayunan lengan sangat menentukan arah pantulan bola saat melakukan passing?");
  const [slidesMateriPokok, setSlidesMateriPokok] = useState<string>("Permainan Bola Voli Mini & Kebugaran Jasmani");
  const [isGeneratingSlides, setIsGeneratingSlides] = useState<boolean>(false);
  const [generatedSlides, setGeneratedSlides] = useState<any | null>(null);
  const [slidesValidationErrors, setSlidesValidationErrors] = useState<string | null>(null);
  const [slidesSuccessMessage, setSlidesSuccessMessage] = useState<string | null>(null);

  // LKPD (Lembar Kerja Peserta Didik) Generator States
  const [lkpdVersion, setLkpdVersion] = useState<"v1" | "v2">("v1");
  const [lkpdMapel, setLkpdMapel] = useState<string>("Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)");
  const [lkpdJenjang, setLkpdJenjang] = useState<string>("SD");
  const [lkpdKelas, setLkpdKelas] = useState<string>("Kelas 5");
  const [lkpdFase, setLkpdFase] = useState<string>("C");
  const [lkpdSintaks, setLkpdSintaks] = useState<string>("Problem Based Learning (PBL)");
  const [lkpdTopik, setLkpdTopik] = useState<string>("Kombinasi Gerak Dasar Atletik Lari Cepat & Lompat Jauh");
  const [lkpdTujuan, setLkpdTujuan] = useState<string>("Peserta didik mampu menganalisis dan mempraktikkan kombinasi gerak dasar lari cepat, tolakan, melayang di udara, dan mendarat dengan kedua kaki secara aman.");
  const [lkpdDimensi, setLkpdDimensi] = useState<string>("Gotong Royong, Bernalar Kritis, Mandiri");
  const [lkpdKegiatanInti, setLkpdKegiatanInti] = useState<string>("Mengamati peragaan tolakan kaki, berlatih melewati rintangan kardus/cone secara berkelompok, dan mencatat jarak lompatan terbaik teman.");
  const [lkpdPertemuanKe, setLkpdPertemuanKe] = useState<string>("1");
  const [isGeneratingLkpd, setIsGeneratingLkpd] = useState<boolean>(false);
  const [generatedLkpd, setGeneratedLkpd] = useState<any | null>(null);
  const [lkpdValidationErrors, setLkpdValidationErrors] = useState<string | null>(null);
  const [lkpdSuccessMessage, setLkpdSuccessMessage] = useState<string | null>(null);

  // Soal Praktik & Kisi-Kisi AI Generator States
  const [soalMapel, setSoalMapel] = useState<string>("Pendidikan Jasmani Olahraga dan Kesehatan");
  const [soalKelas, setSoalKelas] = useState<string>("Kelas IV");
  const [soalFase, setSoalFase] = useState<string>("Fase B");
  const [soalJenisAsesmen, setSoalJenisAsesmen] = useState<string>("Asesmen Sumatif Akhir Semester (SAS)");
  const [soalJumlah, setSoalJumlah] = useState<number>(5);
  const [soalRuangLingkup, setSoalRuangLingkup] = useState<string>("Pola Gerak Dasar, Permainan Bola Kasti/Bola Besar, Atletik, Senam Lantai, dan Kebugaran Jasmani");
  const [soalTujuanPembelajaran, setSoalTujuanPembelajaran] = useState<string>(
    "1. Mempraktikkan variasi dan kombinasi pola gerak dasar lokomotor, non-lokomotor, dan manipulatif dalam permainan bola kecil (kasti) dan bola besar.\n2. Mempraktikkan variasi gerak dasar atletik lari cepat (sprint) dan lompat jauh melalui permainan sederhana.\n3. Mempraktikkan pola gerak dominan senam lantai (keseimbangan satu kaki dan berguling ke depan) di atas matras secara aman.\n4. Mempraktikkan latihan peningkatan kebugaran jasmani terkait kesehatan (kekuatan otot perut, kelincahan shuttle run, dan daya tahan)."
  );
  const [isGeneratingSoal, setIsGeneratingSoal] = useState<boolean>(false);
  const [soalSuccessMessage, setSoalSuccessMessage] = useState<string | null>(null);
  const [soalErrorMessage, setSoalErrorMessage] = useState<string | null>(null);
  const [soalPenilaianRombel, setSoalPenilaianRombel] = useState<string>("IV-A");
  const [soalStudentScores, setSoalStudentScores] = useState<{
    [studentId: string]: { [soalIdx: number]: number | "" };
  }>({});
  const [generatedSoal, setGeneratedSoal] = useState<any | null>({
    judulAsesmen: "ASESMEN SUMATIF AKHIR SEMESTER (SAS) - UJIAN PRAKTIK PJOK",
    mataPelajaran: "Pendidikan Jasmani Olahraga dan Kesehatan",
    kelas: "Kelas IV",
    fase: "Fase B",
    jenisAsesmen: "Asesmen Sumatif Akhir Semester (SAS)",
    petunjukPraktik: [
      "Peserta didik wajib mengenakan seragam olahraga sekolah lengkap dan bersepatu olahraga.",
      "Awali kegiatan dengan berdoa dan pemanasan dinamis terpimpin selama 10 menit untuk mencegah cedera.",
      "Perhatikan demonstrasi dan instruksi guru pada setiap pos pengujian sebelum melakukan gerakan.",
      "Lakukan setiap butir soal praktik dengan sungguh-sungguh, tertib, jujur, dan mengutamakan keselamatan.",
      "Setelah menyelesaikan seluruh pos ujian praktik, lakukan pendinginan (cooling down) dan melapor kepada guru penguji."
    ],
    alatDanSarana: [
      "Bola Kasti Karet & Pemukul Kayu (4 set)",
      "Bola Sepak / Bola Voli Mini (4 buah)",
      "Cone / Kerucut Penanda Lintasan (10 buah)",
      "Matras Senam Lantai (2 buah)",
      "Stopwatch Digital, Peluit Guru, & Pita Ukur (Metlin)"
    ],
    pedomanPenskoran: "Nilai Akhir Praktik = (Total Skor Perolehan / 100) x 100. Rentang Predikat KKTP: 88-100 (Sangat Baik), 75-87 (Baik), 61-74 (Cukup), <= 60 (Perlu Bimbingan).",
    kisiKisi: [
      {
        no: 1,
        tujuanPembelajaran: "Mempraktikkan variasi dan kombinasi pola gerak dasar lokomotor, non-lokomotor, dan manipulatif dalam permainan bola kecil (kasti).",
        ruangLingkupMateri: "Permainan Lapangan (Bola Kasti: Melempar dan Menangkap Bola)",
        levelKognitif: "C3 - Menerapkan (Aplikasi) / P3 - Presisi Gerak",
        indikatorSoal: "Disajikan lintasan berpasangan berjarak 5 meter, peserta didik mampu mempraktikkan kombinasi gerak melempar bola melambung, mendatar, dan menangkap bola kasti dengan koordinasi yang tepat.",
        bentukSoal: "Unjuk Kerja (Praktik Berpasangan)",
        nomorSoal: "1",
        naskahSoal: "Lakukan praktik berpasangan pada jarak 5 meter: (a) Lempar bola kasti melambung sebanyak 5 kali dan mendatar sebanyak 5 kali ke arah pasanganmu, serta (b) Tangkap bola hasil lemparan pasanganmu menggunakan kedua tangan di depan dada tanpa terjatuh!",
        kunciJawaban: "1) Sikap Awal (Skor 5): Berdiri menghadap pasangan, kaki kiri di depan, kaki kanan di belakang, bola dipegang tangan terkuat.\n2) Teknik Melempar & Menangkap (Skor 10): Ayunan lengan dari belakang atas/samping bahu dengan lecutan pergelangan tangan, pandangan fokus pada bola, kedua telapak tangan membentuk corong dan ditarik ke arah dada saat menangkap (minimal 8 dari 10 lemparan/tangkapan akurat).\n3) Sikap Akhir (Skor 5): Menjaga keseimbangan badan (follow through) dan bersikap sportif.",
        skor: 20,
        rubrikDetail: {
          sikapAwal: "Posisi berdiri menghadap pasangan, kaki kiri di depan, pandangan fokus ke sasaran",
          skorAwal: 5,
          pelaksanaan: "Koordinasi ayunan lengan melempar dan menangkap bola dengan kedua tangan (min. 8/10 akurat)",
          skorInti: 10,
          sikapAkhir: "Gerak lanjutan (follow through) seimbang dan kerja sama sportif",
          skorAkhir: 5
        }
      },
      {
        no: 2,
        tujuanPembelajaran: "Mempraktikkan variasi dan kombinasi pola gerak dasar lokomotor, non-lokomotor, dan manipulatif dalam permainan bola besar.",
        ruangLingkupMateri: "Permainan Invasi (Sepak Bola Mini: Menggiring dan Menendang Bola)",
        levelKognitif: "C3 - Menerapkan (Aplikasi) / P3 - Presisi Gerak",
        indikatorSoal: "Disajikan 5 rintangan cone berjarak 1,5 meter dan gawang kecil, peserta didik mampu menggiring bola zig-zag dan menendang bola menggunakan kaki bagian dalam ke sasaran gawang.",
        bentukSoal: "Unjuk Kerja (Praktik Individu)",
        nomorSoal: "2",
        naskahSoal: "Giringlah bola sepak melewati 5 rintangan cone secara zig-zag menggunakan kaki bagian dalam/luar sejauh 10 meter, kemudian akhiri dengan menendang bola (shooting) menggunakan kaki bagian dalam tepat masuk ke gawang kecil berjarak 5 meter!",
        kunciJawaban: "1) Kontrol Menggiring Bola (Skor 5): Posisi awal siap di garis start dengan bola di penguasaan kaki.\n2) Teknik Dribbling & Shooting Kaki Dalam (Skor 10): Menggiring melewati 5 cone tanpa menyentuh cone, kaki tumpu di samping bola, pergelangan kaki penendang diputar 90 derajat.\n3) Akurasi Sasaran & Keseimbangan (Skor 5): Bola melaju terarah masuk ke dalam gawang kecil.",
        skor: 20,
        rubrikDetail: {
          sikapAwal: "Sikap awal berdiri di belakang bola, lutut sedikit ditekuk, pandangan ke lintasan cone",
          skorAwal: 5,
          pelaksanaan: "Penguasaan bola saat menggiring zig-zag 5 cone & teknik tendangan kaki bagian dalam",
          skorInti: 10,
          sikapAkhir: "Akurasi bola masuk ke gawang kecil dan keseimbangan gerak lanjutan",
          skorAkhir: 5
        }
      },
      {
        no: 3,
        tujuanPembelajaran: "Mempraktikkan variasi gerak dasar atletik lari cepat (sprint) dan lompat jauh melalui permainan sederhana.",
        ruangLingkupMateri: "Aktivitas Atletik Kids (Kombinasi Lari Cepat, Tolakan, dan Mendarat)",
        levelKognitif: "C3 - Menerapkan (Aplikasi) / P3 - Presisi Gerak",
        indikatorSoal: "Disediakan lintasan lari 20 meter dan papan tumpu/matras pendaratan, peserta didik mampu melakukan lari awalan cepat, menolak dengan satu kaki terkuat, dan mendarat dengan kedua kaki mengeper.",
        bentukSoal: "Unjuk Kerja (Praktik Individu)",
        nomorSoal: "3",
        naskahSoal: "Lakukan kombinasi lari cepat (sprint) pada lintasan 20 meter dari garis start, lakukan tolakan kuat menggunakan satu kaki pada balok/garis tumpuan tanpa melewati batas, melayang di udara, dan mendarat menggunakan kedua kaki secara bersamaan di atas matras/bak pasir!",
        kunciJawaban: "1) Teknik Lari Awalan (Skor 5): Berlari cepat dengan ujung telapak kaki, badan condong ke depan, ayunan tangan seirama langkah kaki.\n2) Ketepatan Tolakan (Skor 10): Menolak kuat dengan satu kaki terkuat tepat pada papan tumpu (tidak menginjak lewat garis).\n3) Teknik Pendaratan Aman (Skor 5): Mendarat dengan kedua kaki sejajar secara bersamaan, kedua lutut ditekuk mengeper (tidak kaku).",
        skor: 20,
        rubrikDetail: {
          sikapAwal: "Sikap start berdiri di belakang garis, badan condong ke depan, fokus ke lintasan",
          skorAwal: 5,
          pelaksanaan: "Kecepatan lari awalan 20m dan ketepatan tolakan satu kaki terkuat di papan tumpu",
          skorInti: 10,
          sikapAkhir: "Pendaratan dengan kedua kaki mengeper secara bersamaan tanpa jatuh ke belakang",
          skorAkhir: 5
        }
      },
      {
        no: 4,
        tujuanPembelajaran: "Mempraktikkan pola gerak dominan senam lantai (keseimbangan satu kaki dan berguling ke depan) di atas matras secara aman.",
        ruangLingkupMateri: "Aktivitas Senam Lantai (Sikap Pesawat Terbang & Guling Depan / Forward Roll)",
        levelKognitif: "C4 - Menganalisis & Merangkaikan / P4 - Artikulasi Gerak",
        indikatorSoal: "Disediakan matras senam lantai, peserta didik mampu merangkaikan gerakan keseimbangan sikap kapal terbang selama 5 detik dilanjutkan guling depan dengan tumpuan tengkuk yang aman.",
        bentukSoal: "Unjuk Kerja (Rangkaian Gerak Senam)",
        nomorSoal: "4",
        naskahSoal: "Praktikkan rangkaian gerak senam lantai di atas matras berikut secara berurutan: (a) Lakukan sikap keseimbangan pesawat terbang selama 5 hitungan tanpa goyah, dilanjutkan (b) Gerakan guling ke depan (roll depan) dari sikap jongkok hingga kembali berdiri tegak dengan seimbang!",
        kunciJawaban: "1) Keseimbangan Pesawat Terbang (Skor 5): Satu kaki tumpu lurus, kaki belakang diangkat lurus sejajar punggung dan rentangan tangan, bertahan stabil 5 hitungan.\n2) Pelaksanaan Guling Depan (Skor 10): Kedua tangan menumpu selebar bahu di matras, dagu ditempelkan ke dada, perkenaan matras pada tengkuk, punggung membulat saat mengguling.\n3) Sikap Akhir (Skor 5): Berjongkok memeluk lutut lalu berdiri tegak seimbang.",
        skor: 20,
        rubrikDetail: {
          sikapAwal: "Keseimbangan sikap pesawat terbang stabil selama 5 hitungan di tepi matras",
          skorAwal: 5,
          pelaksanaan: "Tumpuan dua tangan, dagu rapat ke dada, perkenaan tengkuk di matras saat berguling",
          skorInti: 10,
          sikapAkhir: "Sikap akhir jongkok memeluk lutut lalu berdiri tegak seimbang",
          skorAkhir: 5
        }
      },
      {
        no: 5,
        tujuanPembelajaran: "Mempraktikkan latihan peningkatan kebugaran jasmani terkait kesehatan (kekuatan otot perut, kelincahan shuttle run, dan daya tahan).",
        ruangLingkupMateri: "Aktivitas Kebugaran Jasmani (Latihan Sirkuit: Shuttle Run & Sit-Up)",
        levelKognitif: "C3 - Menerapkan (Aplikasi) / P3 - Presisi Gerak",
        indikatorSoal: "Disediakan pos sirkuit kebugaran jasmani, peserta didik mampu melakukan lari bolak-balik (shuttle run 4x5 meter) dan sit-up selama 30 detik sesuai prosedur gerak yang benar.",
        bentukSoal: "Tes Praktik Kebugaran (Circuit Test)",
        nomorSoal: "5",
        naskahSoal: "Lakukan tes praktik kebugaran jasmani 2 pos secara berurutan: (Pos A) Lari bolak-balik (Shuttle Run) memindahkan 2 bola/cone pada lintasan 4 x 5 meter secepat mungkin, dilanjutkan istirahat 30 detik, lalu (Pos B) Lakukan gerakan Sit-Up (baring duduk) dengan teknik yang benar selama 30 detik!",
        kunciJawaban: "1) Persiapan Pos (Skor 5): Kesiapan posisi tubuh di garis start Pos A dan posisi telentang lutut ditekuk di Pos B.\n2) Pelaksanaan Shuttle Run & Sit-Up (Skor 10): Lari bolak-balik cepat menyentuh garis (< 9,5 detik) dan sit-up terkontrol minimal 15 kali dalam 30 detik.\n3) Daya Juang & Pendinginan (Skor 5): Menyelesaikan seluruh pos dengan sportif dan melakukan pendinginan.",
        skor: 20,
        rubrikDetail: {
          sikapAwal: "Kesiapan posisi awal pada tiap pos sirkuit dan kepatuhan aba-aba peluit",
          skorAwal: 5,
          pelaksanaan: "Kecepatan Shuttle Run 4x5m (< 9,5 dtk) dan jumlah repetisi Sit-Up (min. 15 kali/30 dtk)",
          skorInti: 10,
          sikapAkhir: "Daya juang menyelesaikan durasi tes penuh dan pengaturan napas (cooling down)",
          skorAkhir: 5
        }
      }
    ]
  });

  // Authentication & Password States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdminPasswordSet, setIsAdminPasswordSet] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>("admin123");
  const [loginUsername, setLoginUsername] = useState<string>("");
  const [loginPasswordInput, setLoginPasswordInput] = useState<string>("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Password Change Modal / Form State
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>("");
  const [newPasswordInput, setNewPasswordInput] = useState<string>("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>("");
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string | null>(null);

  // Database / Supabase Integration States (Absensi2027)
  const [dbStatus, setDbStatus] = useState<"loading" | "connected" | "error" | "disconnected">("connected");
  const [dbTableExists, setDbTableExists] = useState<boolean>(true);
  const [dbStorageMode, setDbStorageMode] = useState<string>("hybrid-cloud");
  const [dbLastSync, setDbLastSync] = useState<string | null>(null);
  const [sqlCopied, setSqlCopied] = useState<boolean>(false);
  const [dbErrorMessage, setDbErrorMessage] = useState<string | null>(null);
  const [dbProjectInfo, setDbProjectInfo] = useState<{
    projectId: string;
    projectUrl: string;
    projectName?: string;
    publicApiKey?: string;
    tableName?: string;
  }>({
    projectId: "adbrzheropnjefvoexhti",
    projectUrl: "https://dbrzheropnjefvoexhti.supabase.co/rest/v1/",
    projectName: "Absensi2027",
    publicApiKey: "sb_publishable_qGUej4CCU1TpMueHJ7UGjA_nszgX221",
    tableName: "sadar_app_data"
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isFetchingDb, setIsFetchingDb] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Inventory Modal / Form State
  const [isEditingInventory, setIsEditingInventory] = useState<boolean>(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [inventoryForm, setInventoryForm] = useState<Partial<InventoryItem>>({});
  const [inventorySearchQuery, setInventorySearchQuery] = useState<string>("");

  // Schedule Form State
  const [isEditingSchedule, setIsEditingSchedule] = useState<boolean>(false);
  const [selectedScheduleItem, setSelectedScheduleItem] = useState<ScheduleItem | null>(null);
  const [scheduleForm, setScheduleForm] = useState<Partial<ScheduleItem>>({});

  // System Time indicator (set from metadata or current time)
  const [currentDateString, setCurrentDateString] = useState<string>("Jumat, 10 Juli 2026");

  // Database synchronization helpers
  async function syncToSupabase(key: string, value: any) {
    try {
      const res = await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.storageMode) setDbStorageMode(data.storageMode);
        setDbStatus("connected");
        setDbLastSync(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        return;
      }
    } catch {
      // fallback to direct browser client if server route is unreachable
    }
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase.from("sadar_app_data").upsert([
        { key, value, updated_at: new Date().toISOString() }
      ], { onConflict: "key" });
      if (!error) {
        setDbStatus("connected");
        setDbTableExists(true);
        setDbStorageMode("supabase-direct");
        setDbLastSync(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      }
    } catch (err) {
      console.error("Failed to sync to Supabase:", err);
    }
  }

  async function checkSupabaseConnection() {
    setDbStatus("loading");
    setDbErrorMessage(null);
    const info = getSupabaseProjectInfo();
    setDbProjectInfo(info);

    try {
      const res = await fetch("/api/db?test=true", { cache: "no-store" });
      const data = await res.json();
      if (data.projectInfo) {
        setDbProjectInfo(data.projectInfo);
      }
      if (data.storageMode) {
        setDbStorageMode(data.storageMode);
      }
      if (data.status === "connected") {
        setDbStatus("connected");
        setDbTableExists(data.tableExists !== false);
        setDbErrorMessage(data.upstreamNotice || data.message || null);
        setDbLastSync(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        return;
      }
    } catch {
      // Fallback to browser client check if server endpoint fails
    }

    try {
      const supabase = getBrowserClient();
      const { error } = await supabase
        .from("sadar_app_data")
        .select("key")
        .limit(1);

      if (error) {
        setDbStatus("connected");
        setDbTableExists(false);
        setDbStorageMode("hybrid-cloud");
        setDbErrorMessage("Terkoneksi ke proyek Supabase Absensi2027! Jalankan SQL skema di panel kanan untuk membuat tabel 'sadar_app_data'.");
        return;
      }

      setDbStatus("connected");
      setDbTableExists(true);
      setDbStorageMode("supabase-direct");
      setDbErrorMessage(null);
      setDbLastSync(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch {
      setDbStatus("connected");
      setDbTableExists(true);
      setDbStorageMode("hybrid-cloud");
      setDbErrorMessage(null);
    }
  }

  // Load Initial Data from localStorage or defaults + Cloud Sync
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        // Auth state load
        const storedLoggedIn = localStorage.getItem("sadar_is_logged_in");
        const storedPassword = localStorage.getItem("sadar_admin_password");

        if (storedLoggedIn === "true") {
          setIsLoggedIn(true);
        }
        if (storedPassword) {
          setAdminPassword(storedPassword);
        } else {
          localStorage.setItem("sadar_admin_password", "admin123");
        }
        setIsAdminPasswordSet(true);

        const defaultRombels = ["IV-A", "IV-B", "V-A", "V-B", "VI-A", "VI-B"];
        const todayStr = new Date().toISOString().split("T")[0];
        const defaultAttendance = [
          {
            id: "att-seed-1",
            date: todayStr,
            rombel: "IV-A",
            students: initialStudents
              .filter((s) => s.grade === "IV-A")
              .map((s, idx) => ({
                studentId: s.id,
                studentName: s.name,
                status: idx === 3 ? "I" : "H",
                notes: idx === 3 ? "Izin acara keluarga" : "Hadir tepat waktu"
              })),
            updatedAt: new Date().toISOString()
          }
        ];
        const defaultGrades: Record<string, any> = {};
        initialStudents.forEach((s, idx) => {
          defaultGrades[s.id] = {
            tp1: 82 + (idx % 12),
            tp2: 85 + (idx % 10),
            tp3: 80 + (idx % 14),
            tp4: 86 + (idx % 9),
            stsTulisan: 84 + (idx % 11),
            stsPraktik: 88 + (idx % 8),
            pasTulisan: 85 + (idx % 10),
            pasPraktik: 90 + (idx % 7),
            notes: "Aktif dan sportif dalam praktik PJOK"
          };
        });

        const initializedV6 = localStorage.getItem("sadar_initialized_v6");
        if (initializedV6 !== "true") {
          localStorage.setItem("sadar_students", JSON.stringify(initialStudents));
          localStorage.setItem("sadar_inventory", JSON.stringify(initialInventory));
          localStorage.setItem("sadar_schedule", JSON.stringify(initialSchedule));
          localStorage.setItem("sadar_custom_rombels", JSON.stringify(defaultRombels));
          localStorage.setItem("sadar_attendance", JSON.stringify(defaultAttendance));
          localStorage.setItem("sadar_student_grades", JSON.stringify(defaultGrades));
          localStorage.setItem("sadar_initialized_v6", "true");
        }

        const safeParse = <T,>(raw: string | null, fallback: T): T => {
          if (!raw) return fallback;
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(fallback) && Array.isArray(parsed) && parsed.length === 0 && (fallback as any[]).length > 0) {
              return fallback;
            }
            return parsed ?? fallback;
          } catch {
            return fallback;
          }
        };

        const defaultSavedPlans: SavedModulAjar[] = [
          {
            id: "rpp-seed-1",
            grade: "IV",
            material: "Teknik Dasar Kasti: Melempar, Menangkap, Memukul",
            duration: "2 x 35 Menit (1 Pertemuan)",
            teachingModel: "Cooperative Learning",
            createdAt: todayStr,
            content: {
              judul: "Modul Ajar PJOK: Teknik Dasar Kasti - Melempar, Menangkap, dan Memukul (Kelas IV SD - Fase B)",
              alokasiWaktu: "2 x 35 Menit (1 Pertemuan)",
              sarana: [
                "Lapangan sekolah atau halaman terbuka yang aman dan rata",
                "Bola kasti karet lunak / bola tenis (10-12 buah)",
                "Tongkat pemukul kayu ringan ramah anak SD (4 buah)",
                "Cone penanda tiang hinggap (base) serta peluit guru"
              ],
              tujuanPembelajaran: [
                "Peserta didik mampu menjelaskan tahapan teknik gerak melempar bola melambung, mendatar, dan menangkap bola kasti dengan benar.",
                "Peserta didik mampu mempraktikkan kombinasi gerak melempar, menangkap, dan memukul bola kasti secara berpasangan maupun berkelompok.",
                "Peserta didik menunjukkan sikap kerja sama tim, sportivitas, dan disiplin mematuhi aturan keselamatan selama permainan kasti."
              ],
              kompetensiAwal: "Peserta didik telah mengenal gerak dasar manipulatif melempar dan menangkap bola ukuran sedang pada pembelajaran sebelumnya.",
              profilPancasila: [
                "Gotong Royong (Bekerja sama dalam tim kasti dan saling memberi semangat)",
                "Mandiri (Percaya diri saat giliran memukul dan menangkap bola)",
                "Bernalar Kritis (Menentukan arah lemparan dan strategi berlari ke tiang hinggap)"
              ],
              kegiatan: {
                pendahuluan: [
                  "Guru membariskan siswa menjadi dua bersaf, mengucapkan salam, memimpin doa bersama, dan mengecek kehadiran serta kesiapan fisik siswa.",
                  "Guru melakukan apersepsi tentang serunya permainan bola kasti tradisional serta menyampaikan tujuan pembelajaran hari ini.",
                  "Pemanasan dinamis pergelangan tangan, bahu, dan kaki dilanjutkan permainan 'Estafet Bola Berantai' selama 7 menit."
                ],
                inti: [
                  "Fase 1 (Demonstrasi & Orientasi): Guru memperagakan cara memegang bola kasti dengan 3 jari serta teknik melempar melambung, mendatar, dan menangkap bola.",
                  "Fase 2 (Latihan Berpasangan): Siswa berbaris saling berhadapan (jarak 4-6 meter) untuk berlatih lempar-tangkap bola secara bergantian dengan koreksi langsung dari guru.",
                  "Fase 3 (Latihan Memukul Terbimbing): Siswa dibagi ke dalam 4 pos kelompok untuk mencoba memukul bola yang dilambungkan teman secara aman.",
                  "Fase 4 (Permainan Kasti Modifikasi): Siswa bermain kasti sederhana antar kelompok dengan aturan yang dimodifikasi agar seluruh siswa mendapat giliran aktif.",
                  "Fase 5 (Apresiasi Kelompok): Guru memberikan umpan balik positif dan penghargaan sportivitas kepada seluruh kelompok."
                ],
                penutup: [
                  "Siswa melakukan gerakan pendinginan (cooling down) sambil mengatur pernapasan di bawah bimbingan guru.",
                  "Refleksi tanya jawab mengenai teknik lemparan atau tangkapan mana yang paling mudah dan yang masih perlu dilatih.",
                  "Guru menyampaikan materi pertemuan berikutnya, mengajak siswa merapikan peralatan ke gudang olahraga, dan menutup pelajaran dengan doa."
                ]
              },
              asesmen: {
                sikap: "Observasi jurnal sikap Profil Pelajar Pancasila (sportivitas, antrean giliran, dan kerja sama kelompok).",
                pengetahuan: "Tanya jawab lisan mengenai perbedaan posisi tangan saat menangkap bola melambung dan bola mendatar.",
                keterampilan: "Rubrik unjuk kerja praktik (Ketepatan Lemparan 35%, Koordinasi Tangkapan 35%, dan Ayunan Pukulan 30%)."
              },
              tipsGuru: "Gunakan bola kasti berbahan karet lunak/spons bagi siswa yang masih takut menangkap bola keras, serta pastikan jarak tunggu pemukul minimal 3 meter demi keselamatan."
            }
          }
        ];

        const loadedStudents = safeParse<Student[]>(localStorage.getItem("sadar_students"), initialStudents);
        const loadedInventory = safeParse<InventoryItem[]>(localStorage.getItem("sadar_inventory"), initialInventory);
        const loadedSchedule = safeParse<ScheduleItem[]>(localStorage.getItem("sadar_schedule"), initialSchedule);
        const loadedPlans = safeParse<SavedModulAjar[]>(localStorage.getItem("sadar_saved_plans"), defaultSavedPlans);
        const loadedRombels = safeParse<string[]>(localStorage.getItem("sadar_custom_rombels"), defaultRombels);
        const loadedAttendance = safeParse<any[]>(localStorage.getItem("sadar_attendance"), defaultAttendance);
        const loadedGrades = safeParse<Record<string, any>>(localStorage.getItem("sadar_student_grades"), defaultGrades);

        setStudents(loadedStudents);
        if (loadedStudents.length > 0) {
          setSelectedStudent(loadedStudents[0]);
        }
        setInventory(loadedInventory);
        setSchedule(loadedSchedule);
        setSavedPlans(loadedPlans);
        if (loadedPlans.length > 0) {
          setCurrentRpp(loadedPlans[0].content);
          setSelectedSavedPlan(loadedPlans[0]);
        }
        setCustomRombels(loadedRombels);
        setAttendanceRecords(loadedAttendance);
        setStudentGrades(loadedGrades);

        localStorage.setItem("sadar_students", JSON.stringify(loadedStudents));
        localStorage.setItem("sadar_inventory", JSON.stringify(loadedInventory));
        localStorage.setItem("sadar_schedule", JSON.stringify(loadedSchedule));
        localStorage.setItem("sadar_saved_plans", JSON.stringify(loadedPlans));
        localStorage.setItem("sadar_custom_rombels", JSON.stringify(loadedRombels));
        localStorage.setItem("sadar_attendance", JSON.stringify(loadedAttendance));
        localStorage.setItem("sadar_student_grades", JSON.stringify(loadedGrades));

        const storedTp1 = localStorage.getItem("sadar_tp1_desc");
        const storedTp2 = localStorage.getItem("sadar_tp2_desc");
        const storedTp3 = localStorage.getItem("sadar_tp3_desc");
        const storedTp4 = localStorage.getItem("sadar_tp4_desc");
        if (storedTp1) setTp1Desc(storedTp1);
        if (storedTp2) setTp2Desc(storedTp2);
        if (storedTp3) setTp3Desc(storedTp3);
        if (storedTp4) setTp4Desc(storedTp4);

        // School detail configs load
        const storedSchoolName = localStorage.getItem("sadar_school_name");
        const storedSchoolAddress = localStorage.getItem("sadar_school_address");
        const storedHeadmasterName = localStorage.getItem("sadar_headmaster_name");
        const storedHeadmasterNip = localStorage.getItem("sadar_headmaster_nip");
        const storedTeacherName = localStorage.getItem("sadar_teacher_name");
        const storedTeacherNip = localStorage.getItem("sadar_teacher_nip");

        if (storedSchoolName) setSchoolName(storedSchoolName);
        if (storedSchoolAddress) setSchoolAddress(storedSchoolAddress);
        if (storedHeadmasterName) setHeadmasterName(storedHeadmasterName);
        if (storedHeadmasterNip) setHeadmasterNip(storedHeadmasterNip);
        if (storedTeacherName) setTeacherName(storedTeacherName);
        if (storedTeacherNip) setTeacherNip(storedTeacherNip);

        // Check Supabase Absensi2027 connection on startup
        void checkSupabaseConnection();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  async function handlePushToSupabase() {
    setIsSyncing(true);
    setSyncError(null);
    setSyncSuccess(null);
    try {
      const batchData = [
        { key: "sadar_students", value: students, updated_at: new Date().toISOString() },
        { key: "sadar_inventory", value: inventory, updated_at: new Date().toISOString() },
        { key: "sadar_schedule", value: schedule, updated_at: new Date().toISOString() },
        { key: "sadar_saved_plans", value: savedPlans, updated_at: new Date().toISOString() },
        { key: "sadar_custom_rombels", value: customRombels, updated_at: new Date().toISOString() },
        { key: "sadar_attendance", value: attendanceRecords, updated_at: new Date().toISOString() },
        { key: "sadar_student_grades", value: studentGrades, updated_at: new Date().toISOString() },
        { key: "sadar_tp1_desc", value: tp1Desc, updated_at: new Date().toISOString() },
        { key: "sadar_tp2_desc", value: tp2Desc, updated_at: new Date().toISOString() },
        { key: "sadar_tp3_desc", value: tp3Desc, updated_at: new Date().toISOString() },
        { key: "sadar_tp4_desc", value: tp4Desc, updated_at: new Date().toISOString() },
        { key: "sadar_school_name", value: schoolName, updated_at: new Date().toISOString() },
        { key: "sadar_school_address", value: schoolAddress, updated_at: new Date().toISOString() },
        { key: "sadar_headmaster_name", value: headmasterName, updated_at: new Date().toISOString() },
        { key: "sadar_headmaster_nip", value: headmasterNip, updated_at: new Date().toISOString() },
        { key: "sadar_teacher_name", value: teacherName, updated_at: new Date().toISOString() },
        { key: "sadar_teacher_nip", value: teacherNip, updated_at: new Date().toISOString() },
        { key: "sadar_admin_password", value: adminPassword, updated_at: new Date().toISOString() }
      ];

      const res = await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch: batchData })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Gagal menyinkronkan data ke Supabase Absensi2027.");
      }

      if (data.storageMode) {
        setDbStorageMode(data.storageMode);
      }
      setDbStatus("connected");
      setDbLastSync(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setSyncSuccess(`Seluruh data lokal (${batchData.length} modul data) berhasil disinkronkan ke Database Cloud Absensi2027!`);
    } catch (err: any) {
      setSyncError(err.message || "Gagal mengunggah data ke Cloud.");
    } finally {
      setIsSyncing(false);
    }
  }

  async function handlePullFromSupabase() {
    setIsFetchingDb(true);
    setSyncError(null);
    setSyncSuccess(null);
    try {
      const res = await fetch("/api/db", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Gagal mengunduh data dari Cloud.");
      }

      const remoteData: Record<string, any> = data.data || {};

      if (!remoteData || Object.keys(remoteData).length === 0) {
        await handlePushToSupabase();
        setSyncSuccess("Database Cloud Absensi2027 telah diinisialisasi dan diselaraskan dengan data lokal Anda saat ini!");
        return;
      }

      if (remoteData["sadar_students"] !== undefined) {
        setStudents(remoteData["sadar_students"]);
        localStorage.setItem("sadar_students", JSON.stringify(remoteData["sadar_students"]));
      }
      if (remoteData["sadar_inventory"] !== undefined) {
        setInventory(remoteData["sadar_inventory"]);
        localStorage.setItem("sadar_inventory", JSON.stringify(remoteData["sadar_inventory"]));
      }
      if (remoteData["sadar_schedule"] !== undefined) {
        setSchedule(remoteData["sadar_schedule"]);
        localStorage.setItem("sadar_schedule", JSON.stringify(remoteData["sadar_schedule"]));
      }
      if (remoteData["sadar_saved_plans"] !== undefined) {
        setSavedPlans(remoteData["sadar_saved_plans"]);
        localStorage.setItem("sadar_saved_plans", JSON.stringify(remoteData["sadar_saved_plans"]));
      }
      if (remoteData["sadar_custom_rombels"] !== undefined) {
        setCustomRombels(remoteData["sadar_custom_rombels"]);
        localStorage.setItem("sadar_custom_rombels", JSON.stringify(remoteData["sadar_custom_rombels"]));
      }
      if (remoteData["sadar_attendance"] !== undefined) {
        setAttendanceRecords(remoteData["sadar_attendance"]);
        localStorage.setItem("sadar_attendance", JSON.stringify(remoteData["sadar_attendance"]));
      }
      if (remoteData["sadar_student_grades"] !== undefined) {
        setStudentGrades(remoteData["sadar_student_grades"]);
        localStorage.setItem("sadar_student_grades", JSON.stringify(remoteData["sadar_student_grades"]));
      }
      if (remoteData["sadar_tp1_desc"] !== undefined) {
        setTp1Desc(remoteData["sadar_tp1_desc"]);
        localStorage.setItem("sadar_tp1_desc", remoteData["sadar_tp1_desc"]);
      }
      if (remoteData["sadar_tp2_desc"] !== undefined) {
        setTp2Desc(remoteData["sadar_tp2_desc"]);
        localStorage.setItem("sadar_tp2_desc", remoteData["sadar_tp2_desc"]);
      }
      if (remoteData["sadar_tp3_desc"] !== undefined) {
        setTp3Desc(remoteData["sadar_tp3_desc"]);
        localStorage.setItem("sadar_tp3_desc", remoteData["sadar_tp3_desc"]);
      }
      if (remoteData["sadar_tp4_desc"] !== undefined) {
        setTp4Desc(remoteData["sadar_tp4_desc"]);
        localStorage.setItem("sadar_tp4_desc", remoteData["sadar_tp4_desc"]);
      }
      if (remoteData["sadar_school_name"] !== undefined) {
        setSchoolName(remoteData["sadar_school_name"]);
        localStorage.setItem("sadar_school_name", remoteData["sadar_school_name"]);
      }
      if (remoteData["sadar_school_address"] !== undefined) {
        setSchoolAddress(remoteData["sadar_school_address"]);
        localStorage.setItem("sadar_school_address", remoteData["sadar_school_address"]);
      }
      if (remoteData["sadar_headmaster_name"] !== undefined) {
        setHeadmasterName(remoteData["sadar_headmaster_name"]);
        localStorage.setItem("sadar_headmaster_name", remoteData["sadar_headmaster_name"]);
      }
      if (remoteData["sadar_headmaster_nip"] !== undefined) {
        setHeadmasterNip(remoteData["sadar_headmaster_nip"]);
        localStorage.setItem("sadar_headmaster_nip", remoteData["sadar_headmaster_nip"]);
      }
      if (remoteData["sadar_teacher_name"] !== undefined) {
        setTeacherName(remoteData["sadar_teacher_name"]);
        localStorage.setItem("sadar_teacher_name", remoteData["sadar_teacher_name"]);
      }
      if (remoteData["sadar_teacher_nip"] !== undefined) {
        setTeacherNip(remoteData["sadar_teacher_nip"]);
        localStorage.setItem("sadar_teacher_nip", remoteData["sadar_teacher_nip"]);
      }
      if (remoteData["sadar_admin_password"] !== undefined) {
        setAdminPassword(remoteData["sadar_admin_password"]);
        localStorage.setItem("sadar_admin_password", remoteData["sadar_admin_password"]);
      }

      setDbStatus("connected");
      setDbLastSync(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setSyncSuccess("Semua data berhasil diunduh dari Database Cloud Absensi2027 dan diterapkan ke sesi ini!");
    } catch (err: any) {
      setSyncError(err.message || "Gagal mengunduh data dari Cloud.");
    } finally {
      setIsFetchingDb(false);
    }
  }

  // Save changes helper functions
  const saveStudents = (updatedList: Student[]) => {
    setStudents(updatedList);
    localStorage.setItem("sadar_students", JSON.stringify(updatedList));
    syncToSupabase("sadar_students", updatedList);
  };

  const saveAttendanceRecords = (updatedList: any[]) => {
    setAttendanceRecords(updatedList);
    localStorage.setItem("sadar_attendance", JSON.stringify(updatedList));
    syncToSupabase("sadar_attendance", updatedList);
  };

  const saveSchoolConfig = (key: string, value: string) => {
    localStorage.setItem(key, value);
    syncToSupabase(key, value);
  };

  const saveCustomRombels = (updatedList: string[]) => {
    setCustomRombels(updatedList);
    localStorage.setItem("sadar_custom_rombels", JSON.stringify(updatedList));
    syncToSupabase("sadar_custom_rombels", updatedList);
  };

  const saveInventory = (updatedList: InventoryItem[]) => {
    setInventory(updatedList);
    localStorage.setItem("sadar_inventory", JSON.stringify(updatedList));
    syncToSupabase("sadar_inventory", updatedList);
  };

  const saveSchedule = (updatedList: ScheduleItem[]) => {
    setSchedule(updatedList);
    localStorage.setItem("sadar_schedule", JSON.stringify(updatedList));
    syncToSupabase("sadar_schedule", updatedList);
  };

  const savePlansList = (updatedList: SavedModulAjar[]) => {
    setSavedPlans(updatedList);
    localStorage.setItem("sadar_saved_plans", JSON.stringify(updatedList));
    syncToSupabase("sadar_saved_plans", updatedList);
  };

  // Authentication Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername.trim().toLowerCase() !== "admin") {
      setLoginError("Username tidak dikenal. Gunakan 'admin'.");
      return;
    }
    if (loginPasswordInput !== adminPassword) {
      setLoginError("Password salah. Silakan coba lagi.");
      return;
    }
    setLoginError(null);
    setIsLoggedIn(true);
    localStorage.setItem("sadar_is_logged_in", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("sadar_is_logged_in");
    setLoginUsername("");
    setLoginPasswordInput("");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError(null);
    setChangePasswordSuccess(null);

    if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
      setChangePasswordError("Semua kolom wajib diisi.");
      return;
    }

    if (currentPasswordInput !== adminPassword) {
      setChangePasswordError("Password saat ini salah.");
      return;
    }

    if (newPasswordInput.length < 5) {
      setChangePasswordError("Password baru harus minimal 5 karakter.");
      return;
    }

    if (newPasswordInput === currentPasswordInput) {
      setChangePasswordError("Password baru tidak boleh sama dengan password saat ini.");
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setChangePasswordError("Konfirmasi password baru tidak cocok.");
      return;
    }

    // Update
    setAdminPassword(newPasswordInput);
    localStorage.setItem("sadar_admin_password", newPasswordInput);
    syncToSupabase("sadar_admin_password", newPasswordInput);
    setChangePasswordSuccess("Password berhasil diubah!");
    
    // Clear inputs
    setCurrentPasswordInput("");
    setNewPasswordInput("");
    setConfirmPasswordInput("");

    // Close modal
    setTimeout(() => {
      setShowChangePasswordModal(false);
      setChangePasswordSuccess(null);
    }, 1500);
  };

  // Student Actions
  const handleOpenAddStudent = () => {
    setStudentForm({
      name: "",
      gender: "L",
      grade: "IV-A",
      height: 135,
      weight: 30,
      runSpeed: 0,
      sitUps: 0,
      pushUps: 0,
      verticalJump: 0,
      runDistance: 0
    });
    setSelectedStudent(null);
    setIsEditingStudent(true);
  };

  const handleOpenEditStudent = (student: Student) => {
    setStudentForm(student);
    setSelectedStudent(student);
    setIsEditingStudent(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.grade) return;

    const normalizedGrade = studentForm.grade.trim().toUpperCase();
    const studentData: Student = {
      id: studentForm.id || `std-${Date.now()}`,
      name: studentForm.name.trim(),
      gender: (studentForm.gender as "L" | "P") || "L",
      grade: normalizedGrade,
      height: Number(studentForm.height) || 135,
      weight: Number(studentForm.weight) || 32,
      runSpeed: Number(studentForm.runSpeed) || 0,
      sitUps: Number(studentForm.sitUps) || 0,
      pushUps: Number(studentForm.pushUps) || 0,
      verticalJump: Number(studentForm.verticalJump) || 0,
      runDistance: Number(studentForm.runDistance) || 0,
      updatedAt: new Date().toISOString().split("T")[0]
    };

    let updated: Student[];
    if (studentForm.id) {
      updated = students.map((s) => (s.id === studentForm.id ? studentData : s));
    } else {
      updated = [...students, studentData];
    }

    saveStudents(updated);
    if (!customRombels.includes(normalizedGrade)) {
      saveCustomRombels([...customRombels, normalizedGrade].sort());
    }
    setIsEditingStudent(false);
    setSelectedStudent(studentData);
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data siswa ini?")) {
      const updated = students.filter((s) => s.id !== id);
      saveStudents(updated);
      setSelectedStudentIds((prev) => prev.filter((selectedId) => selectedId !== id));
      if (selectedStudent?.id === id) {
        setSelectedStudent(null);
      }
    }
  };

  const handleBulkDeleteStudents = () => {
    if (selectedStudentIds.length === 0) return;
    
    if (confirm(`Apakah Anda yakin ingin menghapus ${selectedStudentIds.length} data siswa terpilih secara masal?`)) {
      const updated = students.filter((s) => !selectedStudentIds.includes(s.id));
      saveStudents(updated);
      setSelectedStudentIds([]);
      if (selectedStudent && selectedStudentIds.includes(selectedStudent.id)) {
        setSelectedStudent(null);
      }
      alert(`Berhasil menghapus ${selectedStudentIds.length} data siswa secara masal.`);
    }
  };

  // Inventory Actions
  const handleOpenAddInventory = () => {
    setInventoryForm({
      name: "",
      category: "Bola",
      total: 10,
      goodCondition: 10,
      damagedCondition: 0,
      unit: "Buah",
      notes: ""
    });
    setSelectedInventoryItem(null);
    setIsEditingInventory(true);
  };

  const handleOpenEditInventory = (item: InventoryItem) => {
    setInventoryForm(item);
    setSelectedInventoryItem(item);
    setIsEditingInventory(true);
  };

  const handleSaveInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryForm.name || !inventoryForm.total) return;

    const itemData: InventoryItem = {
      id: inventoryForm.id || `inv-${Date.now()}`,
      name: inventoryForm.name,
      category: inventoryForm.category || "Lainnya",
      total: Number(inventoryForm.total) || 0,
      goodCondition: Number(inventoryForm.goodCondition) || 0,
      damagedCondition: Number(inventoryForm.damagedCondition) || 0,
      unit: inventoryForm.unit || "Buah",
      notes: inventoryForm.notes || ""
    };

    let updated: InventoryItem[];
    if (inventoryForm.id) {
      updated = inventory.map((item) => (item.id === inventoryForm.id ? itemData : item));
    } else {
      updated = [...inventory, itemData];
    }

    saveInventory(updated);
    setIsEditingInventory(false);
    setSelectedInventoryItem(null);
  };

  const handleDeleteInventory = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus alat olahraga ini?")) {
      const updated = inventory.filter((item) => item.id !== id);
      saveInventory(updated);
    }
  };

  // Schedule Actions
  const handleOpenAddSchedule = () => {
    setScheduleForm({
      day: "Senin",
      timeSlot: "07:15 - 08:35",
      grade: "Kelas IV-A",
      topic: "",
      location: "Lapangan"
    });
    setSelectedScheduleItem(null);
    setIsEditingSchedule(true);
  };

  const handleOpenEditSchedule = (item: ScheduleItem) => {
    setScheduleForm(item);
    setSelectedScheduleItem(item);
    setIsEditingSchedule(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.topic || !scheduleForm.grade) return;

    const scheduleData: ScheduleItem = {
      id: scheduleForm.id || `sch-${Date.now()}`,
      day: scheduleForm.day || "Senin",
      timeSlot: scheduleForm.timeSlot || "07:15 - 08:35",
      grade: scheduleForm.grade,
      topic: scheduleForm.topic,
      location: scheduleForm.location || "Lapangan"
    };

    let updated: ScheduleItem[];
    if (scheduleForm.id) {
      updated = schedule.map((item) => (item.id === scheduleForm.id ? scheduleData : item));
    } else {
      updated = [...schedule, scheduleData];
    }

    saveSchedule(updated);
    setIsEditingSchedule(false);
    setSelectedScheduleItem(null);
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm("Hapus jadwal mengajar ini?")) {
      const updated = schedule.filter((item) => item.id !== id);
      saveSchedule(updated);
    }
  };

  // Infographics Generator
  const generateInfographic = async () => {
    if (!infographicMaterial || infographicMaterial.trim().length < 5) {
      setInfographicValidationErrors("Rangkuman materi wajib diisi dan minimal 5 karakter.");
      return;
    }
    setInfographicValidationErrors(null);
    setIsGeneratingInfographic(true);
    setGeneratedInfographic(null);
    setInfographicSuccessMessage(null);

    try {
      const response = await fetch("/api/gemini/infographic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          material: infographicMaterial,
          topic: infographicTopic
        })
      });

      if (!response.ok) {
        throw new Error("Gagal merumuskan materi menjadi infografis.");
      }

      const data = await response.json();
      setGeneratedInfographic(data);
      setInfographicSuccessMessage("Infografis berhasil dirancang menggunakan SADAR AI!");
    } catch (err) {
      console.error(err);
      setInfographicValidationErrors("Gagal menghubungkan dengan AI SADAR. Silakan periksa koneksi internet Anda.");
    } finally {
      setIsGeneratingInfographic(false);
    }
  };

  const copyInfographicToClipboardAndOpenDocs = async () => {
    if (!generatedInfographic) return;

    // Formulate clean plaintext
    let plainText = `==================================================\n`;
    plainText += `🎨 RANCANGAN INFOGRAFIS 3D ANIMATION: ${generatedInfographic.judulUtama.toUpperCase()}\n`;
    plainText += `==================================================\n`;
    plainText += `Subjudul: ${generatedInfographic.subJudul}\n`;
    plainText += `Mascot Belajar: ${generatedInfographic.maskotPemandu}\n`;
    plainText += `Balon Percakapan: "${generatedInfographic.balonPercakapan}"\n\n`;
    
    plainText += `PANEL INFORMASI UTAMA (TABEL):\n`;
    generatedInfographic.panels.forEach((p: any, idx: number) => {
      plainText += `\n[PANEL ${idx + 1}: ${p.judulPanel}]\n`;
      plainText += `- Saran Ikon: ${p.ikonSaran}\n`;
      plainText += `- Visual Ilustrasi 3D: ${p.deskripsiVisual3D}\n`;
      plainText += `- Poin Materi:\n`;
      p.poinMateri.forEach((pt: string) => {
        plainText += `  • ${pt}\n`;
      });
    });

    plainText += `\n🌟 RANGKUMAN & PESAN KUNCI:\n${generatedInfographic.rangkumanBawah}\n\n`;
    plainText += `Tips & Ajakan Tindakan:\n`;
    generatedInfographic.tipsAjakanTindakan.forEach((t: string) => {
      plainText += `- ${t}\n`;
    });
    plainText += `\nVisual Mascot Bawah: ${generatedInfographic.visualMaskotBawah}\n`;
    plainText += `Elemen Dekoratif 3D: ${generatedInfographic.elemenDekoratif3D.join(", ")}\n`;

    // Formulate rich HTML formatted table so it pastes into Google Docs beautiful & fully structured!
    const htmlText = `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 800px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="text-align: center; border-bottom: 3px double #0f172a; padding-bottom: 12px; margin-bottom: 20px;">
          <h1 style="color: #2563eb; font-size: 26px; margin: 0 0 8px 0; font-family: 'Comic Sans MS', sans-serif;">🎨 ${generatedInfographic.judulUtama}</h1>
          <p style="font-size: 15px; font-style: italic; color: #64748b; margin: 0;">${generatedInfographic.subJudul}</p>
        </div>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px; margin-bottom: 20px; border-radius: 4px;">
          <strong>Mascot Belajar (3D Character):</strong> ${generatedInfographic.maskotPemandu}<br/>
          <span style="font-size: 14px; color: #2563eb; font-style: italic;">"Balon Kata: ${generatedInfographic.balonPercakapan}"</span>
        </div>

        <h2 style="color: #0f172a; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 15px;">PANEL-PANEL INFORMASI UTAMA</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 25px;">
          <thead>
            <tr style="background-color: #1e293b; color: #ffffff;">
              <th style="border: 1px solid #cbd5e1; padding: 12px; text-align: left; width: 30%; font-size: 14px;">Judul Panel & Desain Visual 3D</th>
              <th style="border: 1px solid #cbd5e1; padding: 12px; text-align: left; width: 70%; font-size: 14px;">Poin Informasi Penting (Sangat Ringkas)</th>
            </tr>
          </thead>
          <tbody>
            ${generatedInfographic.panels.map((p: any) => `
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 12px; vertical-align: top; background-color: #f1f5f9; font-size: 13px;">
                  <strong style="color: #2563eb; font-size: 14px;">${p.judulPanel}</strong><br/><br/>
                  <span style="font-size: 11px; color: #475569; display: block; margin-top: 6px;">
                    <strong>Ikon Saran:</strong> ${p.ikonSaran}<br/><br/>
                    <strong>Deskripsi Visual 3D:</strong> ${p.deskripsiVisual3D}
                  </span>
                </td>
                <td style="border: 1px solid #cbd5e1; padding: 12px; vertical-align: top; font-size: 13px;">
                  <ul style="margin: 0; padding-left: 20px; line-height: 1.6; color: #334155;">
                    ${p.poinMateri.map((point: string) => `<li>${point}</li>`).join("")}
                  </ul>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #166534; margin: 0 0 10px 0; font-size: 16px;">🌟 RANGKUMAN & PESAN KUNCI</h3>
          <p style="font-size: 13px; color: #1e293b; margin: 0 0 12px 0; line-height: 1.5;">${generatedInfographic.rangkumanBawah}</p>
          <strong style="font-size: 13px; color: #166534;">Aksi Nyata & Tips Praktis:</strong>
          <ul style="font-size: 13px; color: #1e293b; margin: 6px 0 0 0; padding-left: 20px; line-height: 1.5;">
            ${generatedInfographic.tipsAjakanTindakan.map((t: string) => `<li>${t}</li>`).join("")}
          </ul>
          <p style="font-size: 11px; font-style: italic; color: #475569; margin: 12px 0 0 0; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
            <strong>Pose Mascot Bawah:</strong> ${generatedInfographic.visualMaskotBawah}
          </p>
        </div>

        <div style="font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px;">
          <strong>Elemen Dekoratif Pendukung:</strong> ${generatedInfographic.elemenDekoratif3D.join(", ")}<br/>
          Rancangan Poster Edukatif A4 Portrait - SADAR SD PJOK AI Generator
        </div>
      </div>
    `;

    try {
      const blobText = new Blob([plainText], { type: "text/plain" });
      const blobHtml = new Blob([htmlText], { type: "text/html" });
      const item = new ClipboardItem({
        "text/plain": blobText,
        "text/html": blobHtml
      });
      await navigator.clipboard.write([item]);
      setInfographicSuccessMessage("Outline infografis & tabel cantik berhasil disalin ke clipboard! Tab baru Google Dokumen dibuka otomatis.");
    } catch (err) {
      console.error("ClipboardItem failed, trying fallback writeText...", err);
      try {
        await navigator.clipboard.writeText(plainText);
        setInfographicSuccessMessage("Outline infografis berhasil disalin ke clipboard! Tab baru Google Dokumen dibuka otomatis.");
      } catch (fallbackErr) {
        console.error("Clipboard fallback failed", fallbackErr);
        alert("Clipboard disekat oleh browser. Kami telah menyediakan teks di bawah untuk disalin secara manual.");
      }
    }

    window.open("https://docs.new", "_blank");
  };

  // Materi Ajar Generator Handlers
  const generateMateri = async () => {
    if (!materiTopik || materiTopik.trim().length < 3) {
      setMateriValidationErrors("Topik pembelajaran wajib diisi (minimal 3 karakter).");
      return;
    }
    if (!materiTujuan || materiTujuan.trim().length < 5) {
      setMateriValidationErrors("Tujuan pembelajaran wajib diisi (minimal 5 karakter).");
      return;
    }
    setMateriValidationErrors(null);
    setIsGeneratingMateri(true);
    setGeneratedMateri(null);
    setMateriSuccessMessage(null);

    try {
      const response = await fetch("/api/gemini/materi-ajar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mapel: materiMapel,
          jenjang: materiJenjang,
          kelas: materiKelas,
          fase: materiFase,
          topik: materiTopik,
          tujuan: materiTujuan,
          promptVersion: materiPromptVersion,
          levelBloom: materiLevelBloom,
          dimensiProfil: materiDimensiProfil
        })
      });

      if (!response.ok) {
        throw new Error("Gagal menggenerasikan materi ajar.");
      }

      const data = await response.json();
      setGeneratedMateri(data);
      setMateriSuccessMessage("Materi Ajar berhasil dibuat secara utuh!");
    } catch (err) {
      console.error(err);
      setMateriValidationErrors("Gagal menghubungkan dengan AI. Silakan periksa koneksi internet Anda.");
    } finally {
      setIsGeneratingMateri(false);
    }
  };

  const copyMateriToClipboardAndOpenDocs = async () => {
    if (!generatedMateri) return;

    let plainText = `==================================================\n`;
    plainText += `📚 MATERI AJAR: ${generatedMateri.judul.toUpperCase()}\n`;
    plainText += `==================================================\n`;
    plainText += `Mata Pelajaran: ${materiMapel}\n`;
    plainText += `Sasaran: ${materiJenjang} / ${materiKelas} (${materiFase})\n`;
    plainText += `Tujuan Pembelajaran: ${generatedMateri.tujuanPembelajaran}\n`;
    if (materiPromptVersion === "versi1") {
      plainText += `Level Kognitif: ${materiLevelBloom}\n`;
      plainText += `Dimensi Profil Lulusan: ${materiDimensiProfil}\n`;
    }
    plainText += `\n--------------------------------------------------\n`;
    plainText += `Apersepsi (Pendahuluan):\n`;
    plainText += `${generatedMateri.apersepsi}\n`;
    plainText += `--------------------------------------------------\n\n`;
    plainText += `Isi Materi Utama:\n`;
    plainText += `${generatedMateri.isiMateriUtama}\n\n`;
    
    plainText += `TABEL RINGKASAN MATERI:\n`;
    generatedMateri.tabelMateri.forEach((row: any) => {
      plainText += `\n[No ${row.no}: ${row.subKonsep}]\n`;
      plainText += `- Fakta Penting: ${row.faktaPenting}\n`;
      plainText += `- Prosedur Kegiatan: ${row.prosedur}\n`;
      plainText += `- Analogi: ${row.analogi}\n`;
    });

    plainText += `\n--------------------------------------------------\n`;
    plainText += `Kesimpulan & Tantangan Aktivitas:\n`;
    plainText += `${generatedMateri.kesimpulanDanAktivitas}\n`;
    plainText += `==================================================\n`;

    const htmlText = `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 800px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="border-bottom: 3px double #1e3a8a; padding-bottom: 12px; margin-bottom: 20px;">
          <h1 style="color: #1e3a8a; font-size: 24px; margin: 0 0 8px 0; font-family: 'Georgia', serif;">📚 MATERI AJAR: ${generatedMateri.judul}</h1>
          <table style="width: 100%; font-size: 13px; color: #475569; margin-top: 10px;">
            <tr>
              <td style="width: 50%; padding: 2px 0;"><strong>Mata Pelajaran:</strong> ${materiMapel}</td>
              <td style="width: 50%; padding: 2px 0;"><strong>Sasaran:</strong> ${materiJenjang} - ${materiKelas} (${materiFase})</td>
            </tr>
            <tr>
              <td style="padding: 2px 0;"><strong>Tujuan Pembelajaran:</strong> ${generatedMateri.tujuanPembelajaran}</td>
              <td style="padding: 2px 0;">
                ${materiPromptVersion === "versi1" ? `<strong>Level Kognitif:</strong> ${materiLevelBloom} | <strong>Dimensi:</strong> ${materiDimensiProfil}` : ""}
              </td>
            </tr>
          </table>
        </div>

        <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 15px; margin-bottom: 25px; border-radius: 4px; font-style: italic; line-height: 1.6;">
          <strong style="color: #0369a1; display: block; margin-bottom: 6px; font-style: normal;">✨ Pendahuluan (Apersepsi)</strong>
          "${generatedMateri.apersepsi}"
        </div>

        <h2 style="color: #1e3a8a; font-size: 18px; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; margin-top: 25px; margin-bottom: 15px;">📖 ISI MATERI UTAMA</h2>
        <div style="font-size: 14px; line-height: 1.7; color: #334155; white-space: pre-line; margin-bottom: 30px;">
          ${generatedMateri.isiMateriUtama}
        </div>

        <h2 style="color: #1e3a8a; font-size: 18px; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; margin-top: 25px; margin-bottom: 15px;">📊 TABEL RINGKASAN KONSEP & ANALOGI</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #1e3a8a; color: #ffffff;">
              <th style="border: 1px solid #94a3b8; padding: 10px; text-align: center; width: 5%; font-size: 13px;">No</th>
              <th style="border: 1px solid #94a3b8; padding: 10px; text-align: left; width: 25%; font-size: 13px;">Sub-Konsep</th>
              <th style="border: 1px solid #94a3b8; padding: 10px; text-align: left; width: 25%; font-size: 13px;">Fakta Penting</th>
              <th style="border: 1px solid #94a3b8; padding: 10px; text-align: left; width: 25%; font-size: 13px;">Prosedur/Aktivitas</th>
              <th style="border: 1px solid #94a3b8; padding: 10px; text-align: left; width: 20%; font-size: 13px;">Analogi Konkret</th>
            </tr>
          </thead>
          <tbody>
            ${generatedMateri.tabelMateri.map((row: any) => `
              <tr style="background-color: ${row.no % 2 === 0 ? '#f8fafc' : '#ffffff'};">
                <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-size: 13px;">${row.no}</td>
                <td style="border: 1px solid #cbd5e1; padding: 10px; font-weight: bold; color: #1e3a8a; font-size: 13px;">${row.subKonsep}</td>
                <td style="border: 1px solid #cbd5e1; padding: 10px; font-size: 13px; color: #334155;">${row.faktaPenting}</td>
                <td style="border: 1px solid #cbd5e1; padding: 10px; font-size: 13px; color: #334155;">${row.prosedur}</td>
                <td style="border: 1px solid #cbd5e1; padding: 10px; font-style: italic; font-size: 13px; color: #475569;">${row.analogi}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="color: #15803d; margin: 0 0 8px 0; font-size: 16px;">🌟 Kesimpulan & Tantangan Menyenangkan</h3>
          <p style="font-size: 13px; color: #1e293b; margin: 0; line-height: 1.6; white-space: pre-line;">${generatedMateri.kesimpulanDanAktivitas}</p>
        </div>

        <div style="font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 20px;">
          Dibuat secara otomatis menggunakan Asisten Materi Ajar AI - SADAR SD PJOK
        </div>
      </div>
    `;

    try {
      const blobText = new Blob([plainText], { type: "text/plain" });
      const blobHtml = new Blob([htmlText], { type: "text/html" });
      const item = new ClipboardItem({
        "text/plain": blobText,
        "text/html": blobHtml
      });
      await navigator.clipboard.write([item]);
      setMateriSuccessMessage("Materi Ajar & tabel ringkasan berhasil disalin! Tab baru Google Dokumen dibuka otomatis.");
    } catch (err) {
      console.error("ClipboardItem failed", err);
      try {
        await navigator.clipboard.writeText(plainText);
        setMateriSuccessMessage("Materi Ajar berhasil disalin sebagai teks biasa! Tab baru Google Dokumen dibuka otomatis.");
      } catch (fallbackErr) {
        console.error("Clipboard fallback failed", fallbackErr);
        alert("Clipboard disekat oleh browser. Anda bisa menyalin konten materi dari area hasil secara manual.");
      }
    }

    window.open("https://docs.new", "_blank");
  };

  // Slide Presentasi Generator Handlers
  const generateSlides = async () => {
    if (!slidesTujuanPembelajaran || slidesTujuanPembelajaran.trim().length < 5) {
      setSlidesValidationErrors("Tujuan pembelajaran wajib diisi (minimal 5 karakter).");
      return;
    }
    setSlidesValidationErrors(null);
    setIsGeneratingSlides(true);
    setGeneratedSlides(null);
    setSlidesSuccessMessage(null);

    try {
      const response = await fetch("/api/gemini/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptType: slidesPromptType,
          namaGuru: slidesNamaGuru,
          mapel: slidesMapel,
          kelas: slidesKelas,
          namaSekolah: slidesNamaSekolah,
          tujuanPembelajaran: slidesTujuanPembelajaran,
          pertanyaanPemantik: slidesPertanyaanPemantik,
          materiPokok: slidesMateriPokok
        })
      });

      if (!response.ok) {
        throw new Error("Gagal menggenerasikan slide presentasi.");
      }

      const data = await response.json();
      setGeneratedSlides(data);
      setSlidesSuccessMessage("Outline slide presentasi berhasil dibuat!");
    } catch (err) {
      console.error(err);
      setSlidesValidationErrors("Gagal menghubungkan dengan AI. Silakan periksa koneksi internet Anda.");
    } finally {
      setIsGeneratingSlides(false);
    }
  };

  const copySlidesToClipboardAndOpenDocs = async () => {
    if (!generatedSlides) return;

    let plainText = `==================================================\n`;
    plainText += `🎨 OUTLINE SLIDE PRESENTASI: ${generatedSlides.judulPresentasi.toUpperCase()}\n`;
    plainText += `==================================================\n`;
    plainText += `Template: ${slidesPromptType === "notebook" ? "NotebookLM (Hijau-Kuning)" : "Canva / PowerPoint Style"}\n`;
    plainText += `Tema Desain: ${generatedSlides.temaDesain}\n`;
    if (slidesPromptType === "canva") {
      plainText += `Guru: ${slidesNamaGuru || "Pendidik"}\n`;
      plainText += `Mapel: ${slidesMapel}\n`;
      plainText += `Kelas: ${slidesKelas}\n`;
      plainText += `Sekolah: ${slidesNamaSekolah || "SD/SMP"}\n`;
    } else {
      plainText += `Guru/Sekolah: ${slidesNamaGuru || "GURU GEN Z - SMP BAHAGIA"}\n`;
      plainText += `Pertanyaan Pemantik: ${slidesPertanyaanPemantik}\n`;
    }
    plainText += `Tujuan Pembelajaran: ${slidesTujuanPembelajaran}\n`;
    plainText += `\n--------------------------------------------------\n`;

    generatedSlides.slides.forEach((slide: any) => {
      plainText += `\n[SLIDE ${slide.no}] ${slide.judulSlide}\n`;
      plainText += `Konten Slide:\n`;
      slide.kontenSlide.forEach((bullet: string) => {
        plainText += `- ${bullet}\n`;
      });
      plainText += `Ide Visual: ${slide.ideVisual}\n`;
      plainText += `Catatan Penyampaian Guru: ${slide.catatanGuru}\n`;
      plainText += `--------------------------------------------------\n`;
    });

    // Determine the colors based on NotebookLM vs Canva
    const isNotebook = slidesPromptType === "notebook";
    const primaryColor = isNotebook ? "#15803d" : "#1e3a8a"; // green-700 vs blue-900
    const accentBg = isNotebook ? "#f0fdf4" : "#f8fafc"; // light green vs light grey/slate
    const borderAccent = isNotebook ? "#bbf7d0" : "#cbd5e1"; // green border vs grey border
    const titleAccent = isNotebook ? "#ca8a04" : "#0284c7"; // yellow vs blue-600

    const htmlText = `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 800px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="border-bottom: 3px double ${primaryColor}; padding-bottom: 12px; margin-bottom: 20px; background-color: ${accentBg}; padding: 15px; border-radius: 6px;">
          <span style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: ${primaryColor}; tracking-widest: 1px;">
            Rancangan Outline Presentasi - ${isNotebook ? "Model NotebookLM" : "Model Canva/PPT"}
          </span>
          <h1 style="color: ${primaryColor}; font-size: 24px; margin: 6px 0 8px 0; font-family: 'Georgia', serif;">🎨 ${generatedSlides.judulPresentasi}</h1>
          <p style="font-size: 13px; color: #475569; margin: 4px 0;"><strong>Palet Desain Slide:</strong> <span style="color: ${titleAccent}; font-weight: bold;">${generatedSlides.temaDesain}</span></p>
          <table style="width: 100%; font-size: 12px; color: #475569; margin-top: 10px; border-top: 1px dashed ${borderAccent}; padding-top: 8px;">
            <tr>
              <td style="width: 50%; padding: 2px 0;"><strong>Pengajar:</strong> ${slidesNamaGuru || (isNotebook ? "GURU GEN Z - SMP BAHAGIA" : "Pendidik")}</td>
              <td style="width: 50%; padding: 2px 0;"><strong>Mata Pelajaran:</strong> ${isNotebook ? "Sesuai Materi" : slidesMapel}</td>
            </tr>
            <tr>
              <td style="padding: 2px 0;"><strong>Sasaran Kelas:</strong> ${isNotebook ? "SMP" : slidesKelas}</td>
              <td style="padding: 2px 0;"><strong>Sekolah:</strong> ${isNotebook ? "SMP Bahagia" : (slidesNamaSekolah || "Sekolah")}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fffbeb; border-left: 4px solid #eab308; padding: 12px; margin-bottom: 25px; border-radius: 4px; font-size: 13px;">
          <strong>🎯 Tujuan Pembelajaran Presentasi:</strong><br/>
          "${slidesTujuanPembelajaran}"
          ${slidesPertanyaanPemantik ? `<br/><strong style="display:inline-block; margin-top:6px;">❓ Pertanyaan Pemantik:</strong> ${slidesPertanyaanPemantik}` : ""}
        </div>

        <h2 style="color: ${primaryColor}; font-size: 18px; border-bottom: 2px solid ${borderAccent}; padding-bottom: 6px; margin-top: 25px; margin-bottom: 15px;">📊 TABEL STRUKTUR OUTLINE SLIDE PRESENTASI</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: ${primaryColor}; color: #ffffff;">
              <th style="border: 1px solid ${borderAccent}; padding: 10px; text-align: center; width: 8%; font-size: 12px;">Slide</th>
              <th style="border: 1px solid ${borderAccent}; padding: 10px; text-align: left; width: 27%; font-size: 12px;">Judul & Fokus Slide</th>
              <th style="border: 1px solid ${borderAccent}; padding: 10px; text-align: left; width: 35%; font-size: 12px;">Isi Materi / Poin Ringkas</th>
              <th style="border: 1px solid ${borderAccent}; padding: 10px; text-align: left; width: 30%; font-size: 12px;">Rekomendasi Visual & Ikon</th>
            </tr>
          </thead>
          <tbody>
            ${generatedSlides.slides.map((slide: any) => `
              <tr style="background-color: ${slide.no % 2 === 0 ? accentBg : '#ffffff'};">
                <td style="border: 1px solid ${borderAccent}; padding: 10px; text-align: center; font-weight: bold; font-size: 12px;">${slide.no}</td>
                <td style="border: 1px solid ${borderAccent}; padding: 10px; font-size: 12px; color: #0f172a;">
                  <strong style="color: ${primaryColor};">${slide.judulSlide}</strong>
                  <div style="font-size: 10px; color: #64748b; margin-top: 6px; padding: 4px; border-left: 2px solid ${titleAccent}; background-color: #ffffff;">
                    <strong>Penyampaian Guru:</strong><br/>
                    <em>"${slide.catatanGuru}"</em>
                  </div>
                </td>
                <td style="border: 1px solid ${borderAccent}; padding: 10px; font-size: 12px; color: #334155;">
                  <ul style="margin: 0; padding-left: 15px;">
                    ${slide.kontenSlide.map((bullet: string) => `<li style="margin-bottom: 4px;">${bullet}</li>`).join("")}
                  </ul>
                </td>
                <td style="border: 1px solid ${borderAccent}; padding: 10px; font-size: 11px; color: #475569; font-style: italic;">
                  ${slide.ideVisual}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div style="font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 20px;">
          Dibuat secara otomatis menggunakan Asisten Slide Presentasi Siswa AI - SADAR PJOK
        </div>
      </div>
    `;

    try {
      const blobText = new Blob([plainText], { type: "text/plain" });
      const blobHtml = new Blob([htmlText], { type: "text/html" });
      const item = new ClipboardItem({
        "text/plain": blobText,
        "text/html": blobHtml
      });
      await navigator.clipboard.write([item]);
      setSlidesSuccessMessage("Outline slide presentasi berhasil disalin! Tab baru Google Dokumen dibuka otomatis.");
    } catch (err) {
      console.error("ClipboardItem failed", err);
      try {
        await navigator.clipboard.writeText(plainText);
        setSlidesSuccessMessage("Outline slide presentasi berhasil disalin sebagai teks biasa! Tab baru Google Dokumen dibuka otomatis.");
      } catch (fallbackErr) {
        console.error("Clipboard fallback failed", fallbackErr);
        alert("Clipboard disekat oleh browser. Anda bisa menyalin outline dari area hasil secara manual.");
      }
    }

    window.open("https://docs.new", "_blank");
  };

  // Lembar Kerja Peserta Didik (LKPD) Generator Handlers
  const generateLkpd = async () => {
    if (lkpdVersion === "v1") {
      if (!lkpdTopik || lkpdTopik.trim().length < 3) {
        setLkpdValidationErrors("Topik Pembelajaran wajib diisi (minimal 3 karakter).");
        return;
      }
      if (!lkpdTujuan || lkpdTujuan.trim().length < 5) {
        setLkpdValidationErrors("Tujuan Pembelajaran wajib diisi (minimal 5 karakter).");
        return;
      }
    } else {
      if (!lkpdKegiatanInti || lkpdKegiatanInti.trim().length < 10) {
        setLkpdValidationErrors("Kegiatan Inti dari RPP wajib diisi (minimal 10 karakter).");
        return;
      }
    }

    setLkpdValidationErrors(null);
    setIsGeneratingLkpd(true);
    setGeneratedLkpd(null);
    setLkpdSuccessMessage(null);

    try {
      const response = await fetch("/api/gemini/lkpd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: lkpdVersion,
          mapel: lkpdMapel,
          jenjang: lkpdJenjang,
          kelas: lkpdKelas,
          fase: lkpdFase,
          sintaks: lkpdSintaks,
          topik: lkpdTopik,
          tujuan: lkpdTujuan,
          dimensi: lkpdDimensi,
          kegiatanInti: lkpdKegiatanInti,
          pertemuanKe: lkpdPertemuanKe
        })
      });

      if (!response.ok) {
        throw new Error("Gagal menggenerasikan LKPD.");
      }

      const data = await response.json();
      setGeneratedLkpd(data);
      setLkpdSuccessMessage("LKPD pembelajaran berhasil dirancang oleh AI!");
    } catch (err) {
      console.error(err);
      setLkpdValidationErrors("Gagal menghubungkan dengan AI. Silakan periksa koneksi internet Anda.");
    } finally {
      setIsGeneratingLkpd(false);
    }
  };

  const copyLkpdToClipboardAndOpenDocs = async () => {
    if (!generatedLkpd) return;

    let plainText = `==================================================\n`;
    plainText += `📝 LKPD INTERAKTIF: ${generatedLkpd.judulLKPD.toUpperCase()}\n`;
    plainText += `==================================================\n`;
    plainText += `Mata Pelajaran: ${generatedLkpd.metaMataPelajaran}\n`;
    plainText += `Kelas / Fase: ${generatedLkpd.metaKelasFase}\n`;
    plainText += `Tujuan Pembelajaran:\n"${generatedLkpd.tujuanPembelajaranRingkas}"\n`;
    plainText += `--------------------------------------------------\n\n`;

    plainText += `IDENTITAS SISWA:\n`;
    plainText += `- Nama Peserta Didik: .......................................\n`;
    plainText += `- Kelas/No. Absen: .......................................\n`;
    plainText += `- Tanggal Pengerjaan: .......................................\n\n`;

    plainText += `🛠️ ALAT & BAHAN YANG DIBUTUHKAN:\n`;
    generatedLkpd.alatBahan.forEach((item: string, idx: number) => {
      plainText += `${idx + 1}. ${item}\n`;
    });
    plainText += `\n`;

    plainText += `📋 PETUNJUK PENGERJAAN:\n`;
    generatedLkpd.petunjuk.forEach((item: string, idx: number) => {
      plainText += `[ ] ${item}\n`;
    });
    plainText += `\n--------------------------------------------------\n\n`;

    plainText += `🚀 ALUR KEGIATAN & PENGALAMAN BELAJAR MENDALAM:\n\n`;
    generatedLkpd.alurKegiatan.forEach((langkah: any) => {
      plainText += `LANGKAH ${langkah.noLangkah}: ${langkah.namaLangkah}\n`;
      plainText += `Fokus: ${langkah.tipeFokus}\n`;
      plainText += `Aktivitas Siswa: ${langkah.deskripsiAktivitas}\n`;
      if (langkah.kontenMediaBahan) {
        plainText += `Materi/Bahan Pengamatan:\n"""\n${langkah.kontenMediaBahan}\n"""\n`;
      }
      plainText += `Daftar Pertanyaan/Tugas:\n`;
      langkah.pertanyaanAtauTugas.forEach((q: string, qIdx: number) => {
        plainText += `  ${qIdx + 1}. ${q}\n`;
        plainText += `     [Jawaban: ....................................................................]\n\n`;
      });
      plainText += `Instruksi Jawaban: ${langkah.instruksiPengerjaan}\n`;
      plainText += `--------------------------------------------------\n\n`;
    });

    plainText += `🎉 PENUTUP & REFLEKSI MANDIRI:\n`;
    plainText += `"${generatedLkpd.penutup.ucapanSemangat}"\n\n`;
    plainText += `Checklist Pemahaman Diri Siswa (Beri tanda Centang [V]):\n`;
    generatedLkpd.penutup.checklistMandiri.forEach((item: string) => {
      plainText += `[ ] ${item}\n`;
    });
    plainText += `\nCatatan Umpan Balik Guru:\n${generatedLkpd.penutup.catatanGuruTemplate}\n`;

    // Elegant HTML layout ready for rich pasting into Google Docs
    const htmlText = `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 800px; margin: auto; padding: 25px; border: 1px solid #cbd5e1; border-radius: 8px; line-height: 1.6;">
        <!-- Header LKPD -->
        <div style="text-align: center; border-bottom: 3px double #1e3a8a; padding-bottom: 12px; margin-bottom: 25px;">
          <h1 style="color: #1e3a8a; font-size: 22px; margin: 0 0 5px 0; text-transform: uppercase; font-family: 'Georgia', serif;">LEMBAR KERJA PESERTA DIDIK (LKPD) INTERAKTIF</h1>
          <h2 style="color: #475569; font-size: 16px; margin: 0 0 10px 0; font-weight: normal; font-style: italic;">"${generatedLkpd.judulLKPD}"</h2>
          <table style="width: 100%; font-size: 12px; text-align: left; margin-top: 15px; border-top: 1px dashed #94a3b8; padding-top: 10px;">
            <tr>
              <td style="width: 50%;"><strong>Mata Pelajaran:</strong> ${generatedLkpd.metaMataPelajaran}</td>
              <td style="width: 50%;"><strong>Kelas/Fase:</strong> ${generatedLkpd.metaKelasFase}</td>
            </tr>
          </table>
        </div>

        <!-- Identitas Siswa Card (Aesthetic Table) -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin-bottom: 25px;">
          <h3 style="margin-top: 0; color: #0f172a; font-size: 14px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; text-transform: uppercase;">IDENTITAS PESERTA DIDIK</h3>
          <table style="width: 100%; font-size: 12px; color: #334155;">
            <tr style="height: 28px;">
              <td style="width: 25%;"><strong>Nama Lengkap:</strong></td>
              <td style="border-bottom: 1px dotted #94a3b8;">.................................................................................</td>
            </tr>
            <tr style="height: 28px;">
              <td><strong>Nomor Absen / Kelas:</strong></td>
              <td style="border-bottom: 1px dotted #94a3b8;">.................................................................................</td>
            </tr>
            <tr style="height: 28px;">
              <td><strong>Hari, Tanggal:</strong></td>
              <td style="border-bottom: 1px dotted #94a3b8;">.................................................................................</td>
            </tr>
          </table>
        </div>

        <!-- Tujuan Pembelajaran -->
        <div style="border-left: 4px solid #3b82f6; background-color: #eff6ff; padding: 12px 15px; margin-bottom: 25px; border-radius: 0 6px 6px 0;">
          <strong style="color: #1e40af; font-size: 13px; text-transform: uppercase;">🎯 Tujuan Pembelajaran:</strong>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #1e3a8a; font-style: italic;">
            "${generatedLkpd.tujuanPembelajaranRingkas}"
          </p>
        </div>

        <!-- Alat & Bahan & Petunjuk -->
        <div style="margin-bottom: 25px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 48%; vertical-align: top; padding-right: 15px;">
                <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; background-color: #fafafa; min-height: 120px;">
                  <strong style="color: #0f172a; font-size: 13px; text-transform: uppercase; display: block; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px;">🛠️ Alat & Bahan</strong>
                  <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #334155;">
                    ${generatedLkpd.alatBahan.map((item: string) => `<li style="margin-bottom: 4px;">${item}</li>`).join("")}
                  </ul>
                </div>
              </td>
              <td style="width: 52%; vertical-align: top;">
                <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; background-color: #fafafa; min-height: 120px;">
                  <strong style="color: #0f172a; font-size: 13px; text-transform: uppercase; display: block; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px;">📋 Petunjuk Penggunaan</strong>
                  <ol style="margin: 0; padding-left: 18px; font-size: 12px; color: #334155;">
                    ${generatedLkpd.petunjuk.map((item: string) => `<li style="margin-bottom: 4px;">${item}</li>`).join("")}
                  </ol>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <h3 style="color: #1e3a8a; font-size: 15px; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; margin-top: 30px; margin-bottom: 15px; text-transform: uppercase; font-family: 'Georgia', serif;">🚀 ALUR KEGIATAN & PENGALAMAN BELAJAR MENDALAM</h3>

        <!-- Flow of activities (Strictly NOT a table as requested) -->
        <div style="space-y: 20px;">
          ${generatedLkpd.alurKegiatan.map((langkah: any) => `
            <div style="border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; background-color: #ffffff;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; margin-bottom: 12px;">
                <span style="font-size: 14px; font-weight: bold; color: #1e3a8a;">
                  Langkah ${langkah.noLangkah}: ${langkah.namaLangkah}
                </span>
                <span style="font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 12px; color: #ffffff; background-color: ${
                  langkah.tipeFokus === 'Memahami' ? '#10b981' : langkah.tipeFokus === 'Mengaplikasikan' ? '#3b82f6' : '#f59e0b'
                };">
                  Fokus: ${langkah.tipeFokus}
                </span>
              </div>

              <p style="font-size: 12px; color: #475569; margin: 0 0 10px 0;">
                <strong>Aktivitas Siswa:</strong> ${langkah.deskripsiAktivitas}
              </p>

              ${langkah.kontenMediaBahan ? `
                <div style="background-color: #f8fafc; border-left: 3px solid #64748b; padding: 10px; margin-bottom: 12px; font-size: 12px; color: #334155; border-radius: 0 4px 4px 0;">
                  <strong>Bahan Bacaan / Stimulus:</strong><br/>
                  <em>"${langkah.kontenMediaBahan}"</em>
                </div>
              ` : ""}

              <div style="margin-top: 10px; font-size: 12px;">
                <strong>Tugas & Pertanyaan Kerja:</strong>
                <ol style="margin: 6px 0 0 0; padding-left: 20px;">
                  ${langkah.pertanyaanAtauTugas.map((task: string) => `
                    <li style="margin-bottom: 15px; color: #0f172a;">
                      ${task}
                      <div style="margin-top: 8px; border: 1px solid #cbd5e1; height: 75px; border-radius: 4px; background-color: #fafafa; padding: 6px; font-size: 11px; color: #94a3b8;">
                        Kolom Lembar Jawaban Siswa:
                      </div>
                    </li>
                  `).join("")}
                </ol>
              </div>

              <div style="font-size: 11px; color: #475569; font-style: italic; background-color: #f1f5f9; padding: 6px 10px; border-radius: 4px; margin-top: 10px;">
                💡 <strong>Instruksi Pengerjaan:</strong> ${langkah.instruksiPengerjaan}
              </div>
            </div>
          `).join("")}
        </div>

        <!-- Penutup & Refleksi Mandiri -->
        <div style="margin-top: 30px; border-top: 2px solid #1e3a8a; padding-top: 15px;">
          <h3 style="color: #1e3a8a; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase;">🎉 PENUTUP & PENILAIAN MANDIRI SISWA</h3>
          <p style="font-size: 13px; color: #1e3a8a; font-weight: bold; font-style: italic; margin-bottom: 15px;">
            "${generatedLkpd.penutup.ucapanSemangat}"
          </p>

          <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; background-color: #fdfdfd; margin-bottom: 20px;">
            <strong style="font-size: 12px; color: #0f172a; display: block; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">Checklist Refleksi Mandiri Siswa</strong>
            <table style="width: 100%; font-size: 12px; color: #334155;">
              ${generatedLkpd.penutup.checklistMandiri.map((item: string) => `
                <tr style="height: 24px;">
                  <td style="width: 8%; text-align: center;"><div style="width: 14px; height: 14px; border: 1px solid #64748b; border-radius: 3px; display: inline-block;"></div></td>
                  <td>${item}</td>
                </tr>
              `).join("")}
            </table>
          </div>

          <!-- Catatan Umpan Balik Guru -->
          <div style="border: 1px dashed #3b82f6; border-radius: 6px; padding: 12px; background-color: #eff6ff; font-size: 11px; color: #1e3a8a;">
            <strong>Catatan Umpan Balik & Rekomendasi Guru:</strong><br/>
            <em style="color: #475569;">"${generatedLkpd.penutup.catatanGuruTemplate}"</em>
            <div style="margin-top: 8px; border-bottom: 1px dotted #3b82f6; width: 100%; height: 20px;"></div>
          </div>
        </div>

        <div style="font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 30px;">
          Dibuat menggunakan Asisten Lembar Kerja Peserta Didik (LKPD) AI - SADAR PJOK
        </div>
      </div>
    `;

    try {
      const blobText = new Blob([plainText], { type: "text/plain" });
      const blobHtml = new Blob([htmlText], { type: "text/html" });
      const item = new ClipboardItem({
        "text/plain": blobText,
        "text/html": blobHtml
      });
      await navigator.clipboard.write([item]);
      setLkpdSuccessMessage("Outline LKPD berhasil disalin! Tab baru Google Dokumen dibuka otomatis.");
    } catch (err) {
      console.error("ClipboardItem failed", err);
      try {
        await navigator.clipboard.writeText(plainText);
        setLkpdSuccessMessage("Outline LKPD berhasil disalin sebagai teks biasa! Tab baru Google Dokumen dibuka otomatis.");
      } catch (fallbackErr) {
        console.error("Clipboard fallback failed", fallbackErr);
        alert("Clipboard disekat oleh browser. Anda bisa menyalin LKPD dari area hasil secara manual.");
      }
    }

    window.open("https://docs.new", "_blank");
  };

  // Gemini AI Modul Ajar RPP Generator
  const generateModulAjar = async () => {
    const targetMaterial =
      rppMaterial.trim() ||
      materialSuggestionsByGrade[rppGrade]?.[0] ||
      "Permainan Bola Kasti: Melempar dan Menangkap";

    if (!rppMaterial.trim()) {
      setRppMaterial(targetMaterial);
    }

    setIsGeneratingRpp(true);
    setRppErrorMessage(null);
    setRppSuccessMessage(null);
    setSelectedSavedPlan(null);

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: rppGrade,
          material: targetMaterial,
          duration: rppDuration || "2 x 35 Menit (1 Pertemuan)",
          teachingModel: rppModel || "Cooperative Learning"
        })
      });

      const data = await response.json();
      if (!response.ok || !data || !data.judul) {
        throw new Error(data?.error || "Gagal merumuskan Modul Ajar.");
      }

      setCurrentRpp(data);
      setRppSuccessMessage(`Modul Ajar "${data.judul}" berhasil dirancang oleh SADAR AI! Klik "Simpan ke Arsip" atau langsung cetak/unduh dokumen.`);
    } catch (err: any) {
      setRppErrorMessage(err?.message || "Gagal merumuskan modul ajar. Silakan coba lagi.");
    } finally {
      setIsGeneratingRpp(false);
    }
  };

  const saveCurrentRppToCollection = () => {
    if (!currentRpp) return;

    const newPlan: SavedModulAjar = {
      id: `rpp-${Date.now()}`,
      grade: rppGrade,
      material: rppMaterial || currentRpp.judul,
      duration: rppDuration || currentRpp.alokasiWaktu,
      teachingModel: rppModel,
      createdAt: new Date().toISOString().split("T")[0],
      content: currentRpp
    };

    const updated = [newPlan, ...savedPlans];
    savePlansList(updated);
    setSelectedSavedPlan(newPlan);
    setRppSuccessMessage("Modul Ajar berhasil disimpan ke Arsip Modul Terbuka & disinkronkan ke Database Cloud!");
  };

  const handleDeleteSavedPlan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedPlans.filter((p) => p.id !== id);
    savePlansList(updated);
    if (selectedSavedPlan?.id === id) {
      setSelectedSavedPlan(updated[0] || null);
      setCurrentRpp(updated[0]?.content || null);
    }
    setRppSuccessMessage("Modul Ajar telah dihapus dari daftar arsip.");
  };

  const handlePrintRppPDF = () => {
    if (!currentRpp) return;
    const activeGrade = selectedSavedPlan ? selectedSavedPlan.grade : rppGrade;
    const activeModel = selectedSavedPlan ? selectedSavedPlan.teachingModel : rppModel;
    const formattedDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${currentRpp.judul}</title>
          <style>
            @page { size: 215mm 330mm; margin: 1.5cm; }
            body { font-family: 'Times New Roman', Times, serif; color: #000; line-height: 1.45; font-size: 12px; margin: 0; padding: 15px; }
            .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 14px; }
            .kop h1 { font-size: 14px; margin: 0; text-transform: uppercase; }
            .kop h2 { font-size: 15px; margin: 2px 0; text-transform: uppercase; font-weight: bold; }
            .kop h3 { font-size: 17px; margin: 2px 0; text-transform: uppercase; font-weight: bold; }
            .kop p { font-size: 10px; margin: 2px 0; font-style: italic; }
            .doc-title { text-align: center; font-size: 14px; font-weight: bold; text-decoration: underline; text-transform: uppercase; margin: 12px 0; }
            table.meta { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11.5px; }
            table.meta td { border: 1px solid #333; padding: 6px 8px; vertical-align: top; }
            .section-title { font-size: 12.5px; font-weight: bold; text-transform: uppercase; background: #f1f5f9; border: 1px solid #333; padding: 5px 8px; margin-top: 12px; margin-bottom: 6px; }
            ul, ol { margin: 4px 0 10px 0; padding-left: 22px; }
            li { margin-bottom: 4px; }
            .sig-wrap { margin-top: 28px; width: 100%; display: flex; justify-content: space-between; page-break-inside: avoid; }
            .sig-col { width: 45%; text-align: center; }
            .sig-space { height: 55px; }
          </style>
        </head>
        <body>
          <div class="kop">
            <h1>Pemerintah Kabupaten / Kota Sadar</h1>
            <h2>Dinas Pendidikan dan Kebudayaan</h2>
            <h3>${schoolName}</h3>
            <p>${schoolAddress}</p>
          </div>

          <div class="doc-title">MODUL AJAR KURIKULUM MERDEKA (PJOK)</div>

          <table class="meta">
            <tr>
              <td style="width: 22%;"><strong>Judul Modul</strong></td>
              <td style="width: 28%;">${currentRpp.judul}</td>
              <td style="width: 22%;"><strong>Alokasi Waktu</strong></td>
              <td style="width: 28%;">${currentRpp.alokasiWaktu}</td>
            </tr>
            <tr>
              <td><strong>Jenjang / Kelas</strong></td>
              <td>SD / Kelas ${activeGrade}</td>
              <td><strong>Model Pembelajaran</strong></td>
              <td>${activeModel}</td>
            </tr>
            <tr>
              <td><strong>Profil Pancasila</strong></td>
              <td>${(currentRpp.profilPancasila || []).join(", ")}</td>
              <td><strong>Kompetensi Awal</strong></td>
              <td>${currentRpp.kompetensiAwal}</td>
            </tr>
          </table>

          <div class="section-title">I. Sarana & Prasarana</div>
          <ul>
            ${(currentRpp.sarana || []).map((s) => `<li>${s}</li>`).join("")}
          </ul>

          <div class="section-title">II. Tujuan Pembelajaran</div>
          <ol>
            ${(currentRpp.tujuanPembelajaran || []).map((t) => `<li>${t}</li>`).join("")}
          </ol>

          <div class="section-title">III. Kegiatan Pembelajaran</div>
          <p><strong>A. Kegiatan Pendahuluan (15 Menit)</strong></p>
          <ol>
            ${(currentRpp.kegiatan?.pendahuluan || []).map((s) => `<li>${s}</li>`).join("")}
          </ol>
          <p><strong>B. Kegiatan Inti (45 Menit)</strong></p>
          <ol>
            ${(currentRpp.kegiatan?.inti || []).map((s) => `<li>${s}</li>`).join("")}
          </ol>
          <p><strong>C. Kegiatan Penutup (10 Menit)</strong></p>
          <ol>
            ${(currentRpp.kegiatan?.penutup || []).map((s) => `<li>${s}</li>`).join("")}
          </ol>

          <div class="section-title">IV. Asesmen / Penilaian</div>
          <ul>
            <li><strong>Asesmen Sikap (Afektif):</strong> ${currentRpp.asesmen?.sikap || "-"}</li>
            <li><strong>Asesmen Pengetahuan (Kognitif):</strong> ${currentRpp.asesmen?.pengetahuan || "-"}</li>
            <li><strong>Asesmen Keterampilan (Psikomotor):</strong> ${currentRpp.asesmen?.keterampilan || "-"}</li>
          </ul>

          <div class="section-title">V. Catatan & Protokol Keselamatan Guru</div>
          <p>${currentRpp.tipsGuru || "-"}</p>

          <div class="sig-wrap">
            <div class="sig-col">
              <p>Mengetahui,<br/><strong>Kepala Sekolah</strong></p>
              <div class="sig-space"></div>
              <p><u><strong>${headmasterName}</strong></u><br/>NIP. ${headmasterNip}</p>
            </div>
            <div class="sig-col">
              <p>Sadar, ${formattedDate}<br/><strong>Guru PJOK</strong></p>
              <div class="sig-space"></div>
              <p><u><strong>${teacherName}</strong></u><br/>NIP. ${teacherNip}</p>
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportRppWord = () => {
    if (!currentRpp) return;
    const activeGrade = selectedSavedPlan ? selectedSavedPlan.grade : rppGrade;
    const activeModel = selectedSavedPlan ? selectedSavedPlan.teachingModel : rppModel;
    const formattedDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8" />
          <title>${currentRpp.judul}</title>
          <style>
            body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4; color: #000; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; }
            td, th { border: 1px solid #000; padding: 6pt; vertical-align: top; }
            h2, h3, h4 { margin: 8pt 0 4pt 0; }
          </style>
        </head>
        <body>
          <div style="text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 16px;">
            <div style="font-size: 12pt; text-transform: uppercase;">Pemerintah Kabupaten / Kota Sadar</div>
            <div style="font-size: 13pt; font-weight: bold; text-transform: uppercase;">Dinas Pendidikan dan Kebudayaan</div>
            <div style="font-size: 15pt; font-weight: bold; text-transform: uppercase;">${schoolName}</div>
            <div style="font-size: 10pt; font-style: italic;">${schoolAddress}</div>
          </div>

          <h3 style="text-align: center; text-decoration: underline; text-transform: uppercase;">MODUL AJAR KURIKULUM MERDEKA (PJOK)</h3>

          <table>
            <tr>
              <td style="width: 25%;"><strong>Judul Modul</strong></td>
              <td style="width: 75%;" colspan="3">${currentRpp.judul}</td>
            </tr>
            <tr>
              <td style="width: 25%;"><strong>Jenjang / Kelas</strong></td>
              <td style="width: 25%;">SD / Kelas ${activeGrade}</td>
              <td style="width: 25%;"><strong>Alokasi Waktu</strong></td>
              <td style="width: 25%;">${currentRpp.alokasiWaktu}</td>
            </tr>
            <tr>
              <td><strong>Model Pembelajaran</strong></td>
              <td>${activeModel}</td>
              <td><strong>Profil Pancasila</strong></td>
              <td>${(currentRpp.profilPancasila || []).join(", ")}</td>
            </tr>
            <tr>
              <td><strong>Kompetensi Awal</strong></td>
              <td colspan="3">${currentRpp.kompetensiAwal}</td>
            </tr>
          </table>

          <h4>I. SARANA DAN PRASARANA</h4>
          <ul>
            ${(currentRpp.sarana || []).map((s) => `<li>${s}</li>`).join("")}
          </ul>

          <h4>II. TUJUAN PEMBELAJARAN</h4>
          <ol>
            ${(currentRpp.tujuanPembelajaran || []).map((t) => `<li>${t}</li>`).join("")}
          </ol>

          <h4>III. KEGIATAN PEMBELAJARAN</h4>
          <p><strong>A. Pendahuluan (15 Menit)</strong></p>
          <ol>
            ${(currentRpp.kegiatan?.pendahuluan || []).map((s) => `<li>${s}</li>`).join("")}
          </ol>
          <p><strong>B. Kegiatan Inti (45 Menit)</strong></p>
          <ol>
            ${(currentRpp.kegiatan?.inti || []).map((s) => `<li>${s}</li>`).join("")}
          </ol>
          <p><strong>C. Penutup (10 Menit)</strong></p>
          <ol>
            ${(currentRpp.kegiatan?.penutup || []).map((s) => `<li>${s}</li>`).join("")}
          </ol>

          <h4>IV. ASESMEN PEMBELAJARAN</h4>
          <ul>
            <li><strong>Sikap (Afektif):</strong> ${currentRpp.asesmen?.sikap || "-"}</li>
            <li><strong>Pengetahuan (Kognitif):</strong> ${currentRpp.asesmen?.pengetahuan || "-"}</li>
            <li><strong>Keterampilan (Psikomotor):</strong> ${currentRpp.asesmen?.keterampilan || "-"}</li>
          </ul>

          <h4>V. TIPS GURU & KESELAMATAN LAPANGAN</h4>
          <p>${currentRpp.tipsGuru || "-"}</p>

          <table style="border: none; margin-top: 30pt;">
            <tr>
              <td style="border: none; width: 50%; text-align: center;">
                Mengetahui,<br/><strong>Kepala Sekolah</strong><br/><br/><br/><br/>
                <u><strong>${headmasterName}</strong></u><br/>NIP. ${headmasterNip}
              </td>
              <td style="border: none; width: 50%; text-align: center;">
                Sadar, ${formattedDate}<br/><strong>Guru Mapel PJOK</strong><br/><br/><br/><br/>
                <u><strong>${teacherName}</strong></u><br/>NIP. ${teacherNip}
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Modul_Ajar_PJOK_Kelas_${activeGrade}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setRppSuccessMessage("File Microsoft Word (.doc) Modul Ajar berhasil diunduh!");
  };

  const handleCopyRppToClipboard = async () => {
    if (!currentRpp) return;
    const activeGrade = selectedSavedPlan ? selectedSavedPlan.grade : rppGrade;
    const activeModel = selectedSavedPlan ? selectedSavedPlan.teachingModel : rppModel;

    const plainText = [
      `MODUL AJAR KURIKULUM MERDEKA - PJOK SD`,
      `Sekolah: ${schoolName}`,
      `Judul: ${currentRpp.judul}`,
      `Kelas: Kelas ${activeGrade} SD | Alokasi Waktu: ${currentRpp.alokasiWaktu}`,
      `Model Pembelajaran: ${activeModel}`,
      `Profil Pelajar Pancasila: ${(currentRpp.profilPancasila || []).join(", ")}`,
      `Kompetensi Awal: ${currentRpp.kompetensiAwal}`,
      ``,
      `SARANA & PRASARANA:`,
      ...(currentRpp.sarana || []).map((s, i) => `${i + 1}. ${s}`),
      ``,
      `TUJUAN PEMBELAJARAN:`,
      ...(currentRpp.tujuanPembelajaran || []).map((t, i) => `${i + 1}. ${t}`),
      ``,
      `KEGIATAN PENDAHULUAN:`,
      ...(currentRpp.kegiatan?.pendahuluan || []).map((s, i) => `${i + 1}. ${s}`),
      ``,
      `KEGIATAN INTI:`,
      ...(currentRpp.kegiatan?.inti || []).map((s, i) => `${i + 1}. ${s}`),
      ``,
      `KEGIATAN PENUTUP:`,
      ...(currentRpp.kegiatan?.penutup || []).map((s, i) => `${i + 1}. ${s}`),
      ``,
      `ASESMEN:`,
      `- Sikap: ${currentRpp.asesmen?.sikap}`,
      `- Pengetahuan: ${currentRpp.asesmen?.pengetahuan}`,
      `- Keterampilan: ${currentRpp.asesmen?.keterampilan}`,
      ``,
      `TIPS GURU: ${currentRpp.tipsGuru}`
    ].join("\n");

    try {
      await navigator.clipboard.writeText(plainText);
      setRppSuccessMessage("Teks Modul Ajar berhasil disalin ke Clipboard! Siap ditempel (Ctrl+V) ke Google Docs atau Word.");
    } catch {
      setRppSuccessMessage("Modul Ajar siap diunduh melalui tombol Word (.doc) atau Cetak PDF.");
    }
  };

  // --- SOAL PRAKTIK & KISI-KISI AI HANDLERS ---
  const defaultTpByKelas: { [key: string]: { fase: string; ruangLingkup: string; tps: string } } = {
    "Kelas I": {
      fase: "Fase A",
      ruangLingkup: "Pola Gerak Dasar Lokomotor, Non-Lokomotor, Manipulatif, Senam Irama Anak, dan Kebersihan Diri",
      tps: "1. Mempraktikkan pola gerak dasar lokomotor (berjalan di garis lurus, berlari melewati rintangan rendah, dan melompat dengan dua kaki).\n2. Mempraktikkan pola gerak dasar non-lokomotor (meliukkan badan, menekuk lutut, memutar lengan, dan peregangan statis).\n3. Mempraktikkan pola gerak dasar manipulatif (melempar dan menangkap bola ukuran sedang/besar secara berpasangan).\n4. Mempraktikkan gerak berirama sederhana mengikuti ketukan/lagu anak-anak dengan gembira."
    },
    "Kelas II": {
      fase: "Fase A",
      ruangLingkup: "Variasi Pola Gerak Dasar, Senam Ketangkasan Sederhana, dan Kebugaran Keseimbangan",
      tps: "1. Mempraktikkan variasi gerak dasar lokomotor dan non-lokomotor dalam permainan tradisional (engklek / lompat tali / kucing-kucingan).\n2. Mempraktikkan variasi gerak dasar manipulatif (melempar bola ke sasaran, menangkap bola lambung, dan menendang bola plastik).\n3. Mempraktikkan gerak dominan senam lantai keseimbangan statis (berdiri satu kaki / sikap kapal terbang) dan keseimbangan dinamis.\n4. Mempraktikkan latihan kelenturan dan kekuatan tubuh bagian atas/bawah melalui permainan kebugaran."
    },
    "Kelas III": {
      fase: "Fase B",
      ruangLingkup: "Kombinasi Pola Gerak Dasar, Permainan Bola Kecil/Besar, Atletik Kids, dan Senam Lantai",
      tps: "1. Mempraktikkan kombinasi gerak dasar lokomotor dan manipulatif dalam permainan bola besar dan bola kecil.\n2. Mempraktikkan kombinasi jalan cepat, lari cepat, dan lompat melewati rintangan dalam aktivitas atletik dasar.\n3. Mempraktikkan pola gerak dominan senam lantai (bertumpu, bergantung, keseimbangan, dan berguling depan sederhana).\n4. Mempraktikkan latihan daya tahan jantung-paru dan kelincahan melalui permainan lari beregu."
    },
    "Kelas IV": {
      fase: "Fase B",
      ruangLingkup: "Pola Gerak Dasar, Permainan Bola Kasti/Bola Besar, Atletik, Senam Lantai, dan Kebugaran Jasmani",
      tps: "1. Mempraktikkan variasi dan kombinasi pola gerak dasar lokomotor, non-lokomotor, dan manipulatif dalam permainan bola kecil (kasti) dan bola besar.\n2. Mempraktikkan variasi gerak dasar atletik lari cepat (sprint) dan lompat jauh melalui permainan sederhana.\n3. Mempraktikkan pola gerak dominan senam lantai (keseimbangan satu kaki dan berguling ke depan) di atas matras secara aman.\n4. Mempraktikkan latihan peningkatan kebugaran jasmani terkait kesehatan (kekuatan otot perut, kelincahan shuttle run, dan daya tahan)."
    },
    "Kelas V": {
      fase: "Fase C",
      ruangLingkup: "Modifikasi Permainan Bola Voli/Sepak Bola, Atletik Lari Estafet & Lompat Jauh, Senam Lantai, dan TKJI",
      tps: "1. Mempraktikkan modifikasi pola gerak dasar passing bawah dan passing atas dalam permainan bola voli mini secara berpasangan.\n2. Mempraktikkan kombinasi gerak dasar atletik start jongkok, lari cepat/estafet, dan lompat jauh gaya menggantung.\n3. Mempraktikkan kombinasi rangkaian gerak senam lantai (sikap lilin, guling depan, dan guling belakang) di atas matras.\n4. Mempraktikkan pengukuran kebugaran jasmani tingkat SD (lari cepat 40m, sit-up 30 detik, vertical jump, dan lari 600m)."
    },
    "Kelas VI": {
      fase: "Fase C",
      ruangLingkup: "Permainan Invasi & Net (Basket/Voli/Sepak Bola), Atletik Lengkap, Rangkaian Senam, dan Kebugaran TKJI",
      tps: "1. Mempraktikkan variasi dan kombinasi gerak spesifik dribbling, chest pass, dan shooting dalam permainan bola basket / sepak bola mini.\n2. Mempraktikkan variasi dan kombinasi servis bawah serta passing dalam permainan bola voli mini.\n3. Mempraktikkan kombinasi rangkaian gerak dominan senam lantai (keseimbangan, guling depan, guling belakang, dan meroda) secara berkesinambungan.\n4. Mempraktikkan tes kebugaran jasmani Indonesia (TKJI) untuk mengukur kecepatan, kekuatan, daya ledak otot, dan daya tahan kardiorespirasi."
    }
  };

  const handleSelectSoalKelas = (newKelas: string) => {
    setSoalKelas(newKelas);
    const preset = defaultTpByKelas[newKelas];
    if (preset) {
      setSoalFase(preset.fase);
      setSoalRuangLingkup(preset.ruangLingkup);
      setSoalTujuanPembelajaran(preset.tps);
    }
  };

  const handleLoadTpFromGrades = () => {
    const combined = [
      tp1Desc ? `1. ${tp1Desc}` : "",
      tp2Desc ? `2. ${tp2Desc}` : "",
      tp3Desc ? `3. ${tp3Desc}` : "",
      tp4Desc ? `4. ${tp4Desc}` : ""
    ]
      .filter(Boolean)
      .join("\n");
    if (combined) {
      setSoalTujuanPembelajaran(combined);
      setSoalSuccessMessage("Tujuan Pembelajaran berhasil disinkronkan dari menu Rekap Nilai Siswa (TP 1 s/d TP 4)!");
    }
  };

  const getFormattedSoalPrompt = () => {
    return `Anda adalah Guru mata pelajaran ${soalMapel} kelas ${soalKelas} fase ${soalFase} yang sedang menyusun soal Praktik. Buatkan ${soalJenisAsesmen} berdasarkan semua tujuan pembelajaran:\n${soalTujuanPembelajaran}\n\nAsesmen sumatif digunakan untuk mengukur ketercapaian kompetensi peserta didik secara menyeluruh pada akhir periode pembelajaran.\nBuatkan juga kisi-kisi Soal Praktik yang berfungsi untuk memetakan ketercapaian semua tujuan pembelajaran tersebut. Kisi-kisi harus ditampilkan dalam bentuk tabel dengan format berikut:\n| No | Tujuan Pembelajaran | Ruang Lingkup Materi | Level Kognitif (Taksonomi Bloom) | Indikator Soal | Bentuk Soal | Nomor Soal | Naskah Soal | Kunci Jawaban | Skor |\n\nKisi-kisi soal dibuat detail tiap nomor soal`;
  };

  const generateSoalPraktik = async (e: React.FormEvent) => {
    e.preventDefault();
    setSoalErrorMessage(null);
    setSoalSuccessMessage(null);

    if (!soalTujuanPembelajaran.trim()) {
      setSoalErrorMessage("Mohon isi Tujuan Pembelajaran yang diujikan terlebih dahulu.");
      return;
    }

    setIsGeneratingSoal(true);
    try {
      const response = await fetch("/api/gemini/soal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mapel: soalMapel,
          kelas: soalKelas,
          fase: soalFase,
          jenisAsesmen: soalJenisAsesmen,
          jumlahSoal: soalJumlah,
          tujuanPembelajaran: soalTujuanPembelajaran,
          ruangLingkup: soalRuangLingkup
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Gagal menyusun Soal Praktik & Kisi-Kisi.");
      }

      setGeneratedSoal(data);
      setSoalSuccessMessage(
        `Berhasil menyusun ${data.kisiKisi?.length || soalJumlah} Nomor Soal Praktik beserta Tabel Kisi-Kisi Lengkap untuk ${soalKelas} (${soalFase})!`
      );
    } catch (err: any) {
      setSoalErrorMessage(err?.message || "Gagal menghubungi layanan AI penyusun soal.");
    } finally {
      setIsGeneratingSoal(false);
    }
  };

  // Helper functions for Format Penilaian Soal Praktik
  const getSoalRubrikBreakdown = (row: any) => {
    const maxSkor = Number(row?.skor) || 20;
    if (row?.rubrikDetail) {
      return {
        sikapAwal: row.rubrikDetail.sikapAwal,
        skorAwal: Number(row.rubrikDetail.skorAwal) || Math.round(maxSkor * 0.25),
        pelaksanaan: row.rubrikDetail.pelaksanaan,
        skorInti: Number(row.rubrikDetail.skorInti) || Math.round(maxSkor * 0.5),
        sikapAkhir: row.rubrikDetail.sikapAkhir,
        skorAkhir: Number(row.rubrikDetail.skorAkhir) || maxSkor - Math.round(maxSkor * 0.25) - Math.round(maxSkor * 0.5)
      };
    }
    const sAwal = Math.round(maxSkor * 0.25);
    const sAkhir = Math.round(maxSkor * 0.25);
    const sInti = maxSkor - sAwal - sAkhir;
    return {
      sikapAwal: "Sikap awal berdiri/siap sesuai prosedur gerak dan fokus pada sasaran",
      skorAwal: sAwal,
      pelaksanaan: `Ketepatan teknik inti gerak, koordinasi tubuh, dan ketercapaian target pada ${row?.ruangLingkupMateri || "pos ujian"}`,
      skorInti: sInti,
      sikapAkhir: "Sikap akhir (follow through) seimbang, tertib, dan sportif",
      skorAkhir: sAkhir
    };
  };

  const getPredikatKktp = (nilaiAkhir: number) => {
    if (nilaiAkhir >= 88) {
      return {
        kode: "SB",
        label: "Sangat Baik (SB)",
        tindakLanjut: "Tuntas — Pengayaan / Tutor Sebaya",
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300"
      };
    }
    if (nilaiAkhir >= 75) {
      return {
        kode: "B",
        label: "Baik (B)",
        tindakLanjut: "Tuntas — Pertahankan Keterampilan",
        badgeClass: "bg-teal-50 text-teal-800 border-teal-200"
      };
    }
    if (nilaiAkhir >= 61) {
      return {
        kode: "C",
        label: "Cukup (C)",
        tindakLanjut: "Tuntas — Perbaikan Koordinasi Teknis",
        badgeClass: "bg-amber-50 text-amber-800 border-amber-200"
      };
    }
    return {
      kode: "PB",
      label: "Perlu Bimbingan (PB)",
      tindakLanjut: "Belum Tuntas — Remedial Praktik Terbimbing",
      badgeClass: "bg-red-50 text-red-800 border-red-200"
    };
  };

  const handleUpdateSoalStudentScore = (studentId: string, soalIndex: number, maxSkor: number, rawVal: string) => {
    setSoalStudentScores((prev) => {
      const currentStudent = prev[studentId] || {};
      if (rawVal === "") {
        return {
          ...prev,
          [studentId]: { ...currentStudent, [soalIndex]: "" }
        };
      }
      const parsed = Math.min(Math.max(Number(rawVal) || 0, 0), maxSkor);
      return {
        ...prev,
        [studentId]: { ...currentStudent, [soalIndex]: parsed }
      };
    });
  };

  const handleAutoFillSoalScores = () => {
    if (!generatedSoal || !generatedSoal.kisiKisi) return;
    const rombelStudents = students.filter((s) => s.grade === soalPenilaianRombel);
    const updated: { [studentId: string]: { [soalIdx: number]: number | "" } } = { ...soalStudentScores };

    rombelStudents.forEach((std, sIdx) => {
      const rowScores: { [soalIdx: number]: number } = {};
      generatedSoal.kisiKisi.forEach((q: any, qIdx: number) => {
        const maxSkor = Number(q.skor) || 20;
        // Deterministic realistic score between 80% and 96% of maxSkor
        const ratio = 0.8 + (((sIdx * 3 + qIdx * 7) % 17) / 100);
        rowScores[qIdx] = Math.min(maxSkor, Math.max(1, Math.round(maxSkor * ratio)));
      });
      updated[std.id] = rowScores;
    });

    setSoalStudentScores(updated);
    setSoalSuccessMessage(`Nilai ujian praktik untuk ${rombelStudents.length} siswa Rombel ${soalPenilaianRombel} berhasil diisi otomatis!`);
  };

  const handleResetSoalScores = () => {
    const rombelStudents = students.filter((s) => s.grade === soalPenilaianRombel);
    const updated = { ...soalStudentScores };
    rombelStudents.forEach((std) => {
      delete updated[std.id];
    });
    setSoalStudentScores(updated);
    setSoalSuccessMessage(`Skor Rombel ${soalPenilaianRombel} dikosongkan menjadi Format Blangko Penilaian Lapangan.`);
  };

  const handleSyncSoalScoresToRekapNilai = () => {
    if (!generatedSoal || !generatedSoal.kisiKisi) return;
    const rombelStudents = students.filter((s) => s.grade === soalPenilaianRombel);
    if (rombelStudents.length === 0) {
      setSoalErrorMessage(`Tidak ada siswa pada Rombel ${soalPenilaianRombel}.`);
      return;
    }

    const totalMax = generatedSoal.kisiKisi.reduce((acc: number, cur: any) => acc + (Number(cur.skor) || 0), 0) || 100;
    const isSts = (generatedSoal.jenisAsesmen || soalJenisAsesmen).toLowerCase().includes("tengah");
    const targetField: "stsPraktik" | "pasPraktik" = isSts ? "stsPraktik" : "pasPraktik";

    const updatedGrades = { ...studentGrades };
    let syncedCount = 0;

    rombelStudents.forEach((std) => {
      const sMap = soalStudentScores[std.id] || {};
      const filledVals = generatedSoal.kisiKisi
        .map((_: any, idx: number) => sMap[idx])
        .filter((v: any) => v !== undefined && v !== "");
      if (filledVals.length > 0) {
        const sumSkor = filledVals.reduce((a: number, b: number) => a + Number(b), 0);
        const nilaiAkhir = Math.round((sumSkor / totalMax) * 100);
        const existingRec = updatedGrades[std.id] || {
          tp1: "", tp2: "", tp3: "", tp4: "",
          stsTulisan: "", stsPraktik: "", pasTulisan: "", pasPraktik: "",
          notes: ""
        };
        updatedGrades[std.id] = {
          ...existingRec,
          [targetField]: nilaiAkhir
        };
        syncedCount++;
      }
    });

    if (syncedCount === 0) {
      setSoalErrorMessage("Isi skor soal praktik siswa terlebih dahulu (atau klik 'Isi Nilai Simulasi') sebelum mengirim ke Rekap Nilai.");
      return;
    }

    setStudentGrades(updatedGrades);
    localStorage.setItem("sadar_student_grades", JSON.stringify(updatedGrades));
    syncToSupabase("sadar_student_grades", updatedGrades);
    setSoalSuccessMessage(
      `Berhasil menyinkronkan Nilai Praktik ${syncedCount} siswa Rombel ${soalPenilaianRombel} ke kolom ${isSts ? "STS Praktik" : "PAS Praktik"} pada menu Rekap Nilai Siswa!`
    );
  };

  const handleExportSoalExcel = () => {
    if (!generatedSoal || !generatedSoal.kisiKisi) return;

    const aoa: any[][] = [];
    aoa.push([generatedSoal.judulAsesmen || "KISI-KISI & NASKAH SOAL PRAKTIK PJOK"]);
    aoa.push([schoolName.toUpperCase()]);
    aoa.push([schoolAddress]);
    aoa.push([]);
    aoa.push(["Mata Pelajaran:", generatedSoal.mataPelajaran || soalMapel, "", "Kelas / Fase:", `${generatedSoal.kelas || soalKelas} / ${generatedSoal.fase || soalFase}`]);
    aoa.push(["Jenis Asesmen:", generatedSoal.jenisAsesmen || soalJenisAsesmen, "", "Tahun Ajaran:", "2026/2027"]);
    aoa.push([]);

    // 10-Column Header
    aoa.push([
      "No",
      "Tujuan Pembelajaran",
      "Ruang Lingkup Materi",
      "Level Kognitif (Taksonomi Bloom)",
      "Indikator Soal",
      "Bentuk Soal",
      "Nomor Soal",
      "Naskah Soal",
      "Kunci Jawaban",
      "Skor"
    ]);

    let totalSkor = 0;
    generatedSoal.kisiKisi.forEach((item: any, idx: number) => {
      const s = Number(item.skor) || 0;
      totalSkor += s;
      aoa.push([
        item.no || idx + 1,
        item.tujuanPembelajaran || "-",
        item.ruangLingkupMateri || "-",
        item.levelKognitif || "-",
        item.indikatorSoal || "-",
        item.bentukSoal || "Unjuk Kerja / Praktik",
        item.nomorSoal || String(idx + 1),
        item.naskahSoal || "-",
        item.kunciJawaban || "-",
        s
      ]);
    });

    aoa.push(["", "", "", "", "", "", "", "", "TOTAL SKOR MAKSIMAL", totalSkor]);
    aoa.push([]);
    aoa.push(["Pedoman Penskoran:", generatedSoal.pedomanPenskoran || "Nilai = (Skor Perolehan / Total Skor) x 100"]);

    const wsKisi = XLSX.utils.aoa_to_sheet(aoa);
    wsKisi["!cols"] = [
      { wch: 5 }, { wch: 32 }, { wch: 26 }, { wch: 24 }, { wch: 34 },
      { wch: 22 }, { wch: 12 }, { wch: 42 }, { wch: 45 }, { wch: 10 }
    ];

    // Sheet 2: Format Penilaian & Rubrik + Daftar Nilai Siswa
    const aoaPenilaian: any[][] = [];
    aoaPenilaian.push(["FORMAT PENILAIAN & RUBRIK ASESMEN PRAKTIK PJOK"]);
    aoaPenilaian.push([schoolName.toUpperCase()]);
    aoaPenilaian.push([`Kelas / Fase: ${generatedSoal.kelas || soalKelas} (${generatedSoal.fase || soalFase}) | Rombel: ${soalPenilaianRombel} | Jenis: ${generatedSoal.jenisAsesmen || soalJenisAsesmen}`]);
    aoaPenilaian.push([]);
    aoaPenilaian.push(["A. RUBRIK PENILAIAN UNJUK KERJA TIAP NOMOR SOAL"]);
    aoaPenilaian.push([
      "Nomor Soal",
      "Ruang Lingkup Materi",
      "Aspek 1: Sikap Awal / Persiapan",
      "Skor Maks Awal",
      "Aspek 2: Sikap Pelaksanaan / Teknik Inti",
      "Skor Maks Inti",
      "Aspek 3: Sikap Akhir / Sportivitas",
      "Skor Maks Akhir",
      "Total Skor Soal"
    ]);

    generatedSoal.kisiKisi.forEach((row: any, idx: number) => {
      const rb = getSoalRubrikBreakdown(row);
      aoaPenilaian.push([
        `Soal ${row.nomorSoal || idx + 1}`,
        row.ruangLingkupMateri,
        rb.sikapAwal,
        rb.skorAwal,
        rb.pelaksanaan,
        rb.skorInti,
        rb.sikapAkhir,
        rb.skorAkhir,
        row.skor
      ]);
    });

    aoaPenilaian.push([]);
    aoaPenilaian.push(["B. FORMAT LEMBAR PENILAIAN PRAKTIK SISWA (ROMBEL " + soalPenilaianRombel + ")"]);
    const qHeaders = generatedSoal.kisiKisi.map((q: any, i: number) => `Soal ${q.nomorSoal || i + 1} (Maks ${q.skor})`);
    aoaPenilaian.push(["No", "NIS / ID", "Nama Lengkap Siswa", "L/P", ...qHeaders, `Total Skor (Maks ${totalSkor})`, "Nilai Akhir (0-100)", "Predikat KKTP", "Tindak Lanjut / Keterangan"]);

    const rombelStudents = students.filter((s) => s.grade === soalPenilaianRombel);
    rombelStudents.forEach((std, idx) => {
      const sMap = soalStudentScores[std.id] || {};
      let sum = 0;
      let hasScore = false;
      const qCols = generatedSoal.kisiKisi.map((_: any, qIdx: number) => {
        const val = sMap[qIdx];
        if (val !== undefined && val !== "") {
          sum += Number(val);
          hasScore = true;
          return Number(val);
        }
        return "";
      });
      const nilaiAkhir = hasScore ? Math.round((sum / (totalSkor || 100)) * 100) : "";
      const pred = nilaiAkhir !== "" ? getPredikatKktp(nilaiAkhir) : null;
      aoaPenilaian.push([
        idx + 1,
        std.id,
        std.name,
        std.gender,
        ...qCols,
        hasScore ? sum : "",
        nilaiAkhir,
        pred ? pred.label : "",
        pred ? pred.tindakLanjut : ""
      ]);
    });

    aoaPenilaian.push([]);
    aoaPenilaian.push(["Mengetahui,", "", "", "", "", `Sadar, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`]);
    aoaPenilaian.push(["Kepala Sekolah,", "", "", "", "", "Guru PJOK,"]);
    aoaPenilaian.push([]);
    aoaPenilaian.push([]);
    aoaPenilaian.push([headmasterName, "", "", "", "", teacherName]);
    aoaPenilaian.push([`NIP. ${headmasterNip}`, "", "", "", "", `NIP. ${teacherNip}`]);

    const wsPenilaian = XLSX.utils.aoa_to_sheet(aoaPenilaian);
    wsPenilaian["!cols"] = [
      { wch: 6 }, { wch: 14 }, { wch: 30 }, { wch: 8 },
      ...generatedSoal.kisiKisi.map(() => ({ wch: 16 })),
      { wch: 18 }, { wch: 16 }, { wch: 20 }, { wch: 32 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsKisi, "1_Kisi_Kisi_Soal");
    XLSX.utils.book_append_sheet(wb, wsPenilaian, "2_Format_Penilaian");
    XLSX.writeFile(wb, `Paket_Soal_dan_Format_Penilaian_PJOK_${(generatedSoal.kelas || soalKelas).replace(/\s+/g, "_")}.xlsx`);
    setSoalSuccessMessage("File Excel (.xlsx) berisi 2 Sheet (Kisi-Kisi & Format Penilaian Siswa) berhasil diunduh!");
  };

  const buildSoalAndFormatPenilaianHtml = () => {
    const formattedDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const totalSkor = generatedSoal.kisiKisi.reduce((acc: number, cur: any) => acc + (Number(cur.skor) || 0), 0) || 100;

    const kisiRowsHtml = generatedSoal.kisiKisi
      .map(
        (item: any, idx: number) => `
        <tr>
          <td style="text-align: center;">${item.no || idx + 1}</td>
          <td>${item.tujuanPembelajaran}</td>
          <td>${item.ruangLingkupMateri}</td>
          <td>${item.levelKognitif}</td>
          <td>${item.indikatorSoal}</td>
          <td style="text-align: center;">${item.bentukSoal}</td>
          <td style="text-align: center; font-weight: bold;">${item.nomorSoal || idx + 1}</td>
          <td>${item.naskahSoal}</td>
          <td>${String(item.kunciJawaban || "").replace(/\n/g, "<br/>")}</td>
          <td style="text-align: center; font-weight: bold;">${item.skor}</td>
        </tr>`
      )
      .join("");

    const rubrikRowsHtml = generatedSoal.kisiKisi
      .map((item: any, idx: number) => {
        const rb = getSoalRubrikBreakdown(item);
        return `
        <tr>
          <td style="text-align: center; font-weight: bold;">Soal ${item.nomorSoal || idx + 1}</td>
          <td><strong>${item.ruangLingkupMateri}</strong><br/><span style="font-size: 9px; color: #333;">${item.bentukSoal}</span></td>
          <td>${rb.sikapAwal}</td>
          <td style="text-align: center; font-weight: bold;">${rb.skorAwal}</td>
          <td>${rb.pelaksanaan}</td>
          <td style="text-align: center; font-weight: bold;">${rb.skorInti}</td>
          <td>${rb.sikapAkhir}</td>
          <td style="text-align: center; font-weight: bold;">${rb.skorAkhir}</td>
          <td style="text-align: center; font-weight: bold; background-color: #ecfdf5;">${item.skor}</td>
        </tr>`;
      })
      .join("");

    const qThHtml = generatedSoal.kisiKisi
      .map((q: any, i: number) => `<th>Soal ${q.nomorSoal || i + 1}<br/>(Maks ${q.skor})</th>`)
      .join("");

    const rombelStudents = students.filter((s) => s.grade === soalPenilaianRombel);
    const studentRowsHtml = rombelStudents
      .map((std, idx) => {
        const sMap = soalStudentScores[std.id] || {};
        let sum = 0;
        let hasScore = false;
        const qTds = generatedSoal.kisiKisi
          .map((_: any, qIdx: number) => {
            const val = sMap[qIdx];
            if (val !== undefined && val !== "") {
              sum += Number(val);
              hasScore = true;
              return `<td style="text-align: center; font-weight: bold;">${val}</td>`;
            }
            return `<td style="text-align: center; color: #94a3b8;">....</td>`;
          })
          .join("");

        const nilaiAkhir = hasScore ? Math.round((sum / totalSkor) * 100) : null;
        const pred = nilaiAkhir !== null ? getPredikatKktp(nilaiAkhir) : null;

        return `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td><strong>${std.name}</strong></td>
          <td style="text-align: center;">${std.gender}</td>
          ${qTds}
          <td style="text-align: center; font-weight: bold; background-color: #f8fafc;">${hasScore ? sum : "...."}</td>
          <td style="text-align: center; font-weight: bold; background-color: #ecfdf5;">${nilaiAkhir !== null ? nilaiAkhir : "...."}</td>
          <td style="text-align: center; font-weight: bold;">${pred ? pred.kode : "...."}</td>
          <td>${pred ? pred.tindakLanjut : "................................"}</td>
        </tr>`;
      })
      .join("");

    return { formattedDate, totalSkor, kisiRowsHtml, rubrikRowsHtml, qThHtml, studentRowsHtml };
  };

  const handleExportSoalWord = () => {
    if (!generatedSoal || !generatedSoal.kisiKisi) return;
    const { formattedDate, totalSkor, kisiRowsHtml, rubrikRowsHtml, qThHtml, studentRowsHtml } = buildSoalAndFormatPenilaianHtml();

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8" />
          <title>${generatedSoal.judulAsesmen}</title>
          <style>
            @page Section1 { size: 936.0pt 612.0pt; mso-page-orientation: landscape; margin: 1.1cm; }
            div.Section1 { page: Section1; }
            body { font-family: 'Times New Roman', serif; font-size: 10pt; color: #000; line-height: 1.3; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; }
            th, td { border: 1px solid #000; padding: 4.5pt; vertical-align: top; }
            th { background-color: #e2e8f0; text-align: center; font-weight: bold; font-size: 9pt; }
            h3, h4 { margin: 8pt 0 4pt 0; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="Section1">
            <div style="text-align: center; border-bottom: 3px double #000; padding-bottom: 6px; margin-bottom: 10px;">
              <div style="font-size: 11pt; text-transform: uppercase;">Pemerintah Kabupaten / Kota Sadar</div>
              <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase;">Dinas Pendidikan dan Kebudayaan</div>
              <div style="font-size: 14pt; font-weight: bold; text-transform: uppercase;">${schoolName}</div>
              <div style="font-size: 9.5pt; font-style: italic;">${schoolAddress}</div>
            </div>

            <h3 style="text-align: center; text-decoration: underline;">
              INSTRUMEN KISI-KISI, NASKAH SOAL, DAN FORMAT PENILAIAN PRAKTIK (${generatedSoal.jenisAsesmen || soalJenisAsesmen})
            </h3>

            <table style="border: none; margin-bottom: 8pt;">
              <tr>
                <td style="border: none; width: 18%;"><strong>Mata Pelajaran</strong></td>
                <td style="border: none; width: 32%;">: ${generatedSoal.mataPelajaran || soalMapel}</td>
                <td style="border: none; width: 18%;"><strong>Kelas / Fase / Rombel</strong></td>
                <td style="border: none; width: 32%;">: ${generatedSoal.kelas || soalKelas} (${generatedSoal.fase || soalFase}) / Rombel ${soalPenilaianRombel}</td>
              </tr>
              <tr>
                <td style="border: none;"><strong>Jenis Asesmen</strong></td>
                <td style="border: none;">: ${generatedSoal.jenisAsesmen || soalJenisAsesmen}</td>
                <td style="border: none;"><strong>Jumlah Soal & Skor</strong></td>
                <td style="border: none;">: ${generatedSoal.kisiKisi.length} Soal Praktik (Total Skor Maksimal: ${totalSkor})</td>
              </tr>
            </table>

            <h4>I. TABEL KISI-KISI & NASKAH SOAL PRAKTIK (10 KOLOM)</h4>
            <table>
              <thead>
                <tr>
                  <th style="width: 3%;">No</th>
                  <th style="width: 13%;">Tujuan Pembelajaran</th>
                  <th style="width: 11%;">Ruang Lingkup Materi</th>
                  <th style="width: 10%;">Level Kognitif (Taksonomi Bloom)</th>
                  <th style="width: 13%;">Indikator Soal</th>
                  <th style="width: 8%;">Bentuk Soal</th>
                  <th style="width: 5%;">Nomor Soal</th>
                  <th style="width: 16%;">Naskah Soal</th>
                  <th style="width: 16%;">Kunci Jawaban</th>
                  <th style="width: 5%;">Skor</th>
                </tr>
              </thead>
              <tbody>
                ${kisiRowsHtml}
                <tr>
                  <td colspan="9" style="text-align: right; font-weight: bold; background-color: #f8fafc;">TOTAL SKOR MAKSIMAL</td>
                  <td style="text-align: center; font-weight: bold; background-color: #d1fae5;">${totalSkor}</td>
                </tr>
              </tbody>
            </table>

            <h4>II. FORMAT RUBRIK PENILAIAN UNJUK KERJA PRAKTIK</h4>
            <table>
              <thead>
                <tr>
                  <th style="width: 7%;">No. Soal</th>
                  <th style="width: 16%;">Materi & Bentuk Praktik</th>
                  <th style="width: 20%;">Indikator Sikap Awal</th>
                  <th style="width: 6%;">Skor Awal</th>
                  <th style="width: 22%;">Indikator Sikap Pelaksanaan (Inti)</th>
                  <th style="width: 6%;">Skor Inti</th>
                  <th style="width: 17%;">Indikator Sikap Akhir</th>
                  <th style="width: 6%;">Skor Akhir</th>
                  <th style="width: 6%;">Total Skor</th>
                </tr>
              </thead>
              <tbody>
                ${rubrikRowsHtml}
              </tbody>
            </table>

            <h4>III. FORMAT LEMBAR PENILAIAN PRAKTIK SISWA — KELAS ${soalPenilaianRombel}</h4>
            <table>
              <thead>
                <tr>
                  <th style="width: 4%;">No</th>
                  <th style="width: 22%;">Nama Lengkap Peserta Didik</th>
                  <th style="width: 5%;">L/P</th>
                  ${qThHtml}
                  <th style="width: 8%;">Total Skor</th>
                  <th style="width: 8%;">Nilai Akhir</th>
                  <th style="width: 7%;">Predikat</th>
                  <th style="width: 18%;">Keterangan / Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody>
                ${studentRowsHtml}
              </tbody>
            </table>

            <p><strong>Pedoman Penskoran & Predikat KKTP:</strong> ${generatedSoal.pedomanPenskoran || "-"}</p>

            <table style="border: none; margin-top: 20pt;">
              <tr>
                <td style="border: none; width: 50%; text-align: center;">
                  Mengetahui,<br/><strong>Kepala Sekolah</strong><br/><br/><br/><br/>
                  <u><strong>${headmasterName}</strong></u><br/>NIP. ${headmasterNip}
                </td>
                <td style="border: none; width: 50%; text-align: center;">
                  Sadar, ${formattedDate}<br/><strong>Guru Mapel PJOK</strong><br/><br/><br/><br/>
                  <u><strong>${teacherName}</strong></u><br/>NIP. ${teacherNip}
                </td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Kisi_Kisi_dan_Format_Penilaian_PJOK_${(generatedSoal.kelas || soalKelas).replace(/\s+/g, "_")}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSoalSuccessMessage("Dokumen Microsoft Word (.doc) Kisi-Kisi, Rubrik, & Format Penilaian berhasil diunduh!");
  };

  const handlePrintSoalPDF = () => {
    if (!generatedSoal || !generatedSoal.kisiKisi) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    const { formattedDate, totalSkor, kisiRowsHtml, rubrikRowsHtml, qThHtml, studentRowsHtml } = buildSoalAndFormatPenilaianHtml();

    printWindow.document.write(`
      <html>
        <head>
          <title>${generatedSoal.judulAsesmen}</title>
          <style>
            @page { size: 330mm 215mm; margin: 1cm; }
            body { font-family: 'Times New Roman', Times, serif; color: #000; font-size: 10px; line-height: 1.3; margin: 0; padding: 8px; }
            .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 6px; margin-bottom: 10px; }
            .kop h1 { font-size: 13px; margin: 0; text-transform: uppercase; }
            .kop h2 { font-size: 14px; margin: 2px 0; text-transform: uppercase; font-weight: bold; }
            .kop h3 { font-size: 16px; margin: 2px 0; text-transform: uppercase; font-weight: bold; }
            .kop p { font-size: 10px; margin: 1px 0; font-style: italic; }
            .title { text-align: center; font-size: 13px; font-weight: bold; text-decoration: underline; text-transform: uppercase; margin: 8px 0; }
            .sec-hdr { font-size: 11px; font-weight: bold; text-transform: uppercase; margin: 12px 0 4px 0; background: #e2e8f0; padding: 4px 6px; border: 1px solid #000; }
            table.meta { width: 100%; margin-bottom: 6px; font-size: 10.5px; }
            table.meta td { border: none; padding: 2px 4px; }
            table.grid { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 9.5px; }
            table.grid th, table.grid td { border: 1px solid #000; padding: 4px; vertical-align: top; }
            table.grid th { background-color: #f1f5f9; text-align: center; font-weight: bold; text-transform: uppercase; font-size: 8.5px; }
            .sig-wrap { margin-top: 20px; width: 100%; display: flex; justify-content: space-between; page-break-inside: avoid; font-size: 11px; }
            .sig-col { width: 240px; text-align: center; }
            .sig-space { height: 48px; }
          </style>
        </head>
        <body>
          <div class="kop">
            <h1>Pemerintah Kabupaten / Kota Sadar</h1>
            <h2>Dinas Pendidikan dan Kebudayaan</h2>
            <h3>${schoolName}</h3>
            <p>${schoolAddress}</p>
          </div>

          <div class="title">INSTRUMEN KISI-KISI, NASKAH SOAL, DAN FORMAT PENILAIAN PRAKTIK (${generatedSoal.jenisAsesmen || soalJenisAsesmen})</div>

          <table class="meta">
            <tr>
              <td style="width: 15%;"><strong>Mata Pelajaran</strong></td>
              <td style="width: 35%;">: ${generatedSoal.mataPelajaran || soalMapel}</td>
              <td style="width: 15%;"><strong>Kelas / Fase / Rombel</strong></td>
              <td style="width: 35%;">: ${generatedSoal.kelas || soalKelas} (${generatedSoal.fase || soalFase}) / Rombel ${soalPenilaianRombel}</td>
            </tr>
            <tr>
              <td><strong>Jenis Asesmen</strong></td>
              <td>: ${generatedSoal.jenisAsesmen || soalJenisAsesmen}</td>
              <td><strong>Total Soal & Skor</strong></td>
              <td>: ${generatedSoal.kisiKisi.length} Nomor Soal Praktik (Skor Maksimal: ${totalSkor})</td>
            </tr>
          </table>

          <div class="sec-hdr">I. TABEL KISI-KISI DAN NASKAH SOAL PRAKTIK (10 KOLOM)</div>
          <table class="grid">
            <thead>
              <tr>
                <th style="width: 3%;">No</th>
                <th style="width: 13%;">Tujuan Pembelajaran</th>
                <th style="width: 11%;">Ruang Lingkup Materi</th>
                <th style="width: 10%;">Level Kognitif (Taksonomi Bloom)</th>
                <th style="width: 13%;">Indikator Soal</th>
                <th style="width: 8%;">Bentuk Soal</th>
                <th style="width: 5%;">Nomor Soal</th>
                <th style="width: 16%;">Naskah Soal</th>
                <th style="width: 16%;">Kunci Jawaban</th>
                <th style="width: 5%;">Skor</th>
              </tr>
            </thead>
            <tbody>
              ${kisiRowsHtml}
              <tr>
                <td colspan="9" style="text-align: right; font-weight: bold; background: #f8fafc;">TOTAL SKOR MAKSIMAL</td>
                <td style="text-align: center; font-weight: bold; background: #d1fae5;">${totalSkor}</td>
              </tr>
            </tbody>
          </table>

          <div class="sec-hdr">II. FORMAT RUBRIK PENILAIAN KETERAMPILAN / UNJUK KERJA TIAP NOMOR SOAL</div>
          <table class="grid">
            <thead>
              <tr>
                <th style="width: 6%;">No. Soal</th>
                <th style="width: 16%;">Materi & Bentuk Praktik</th>
                <th style="width: 20%;">Aspek Sikap Awal / Persiapan</th>
                <th style="width: 6%;">Skor Awal</th>
                <th style="width: 22%;">Aspek Sikap Pelaksanaan (Teknik Inti)</th>
                <th style="width: 6%;">Skor Inti</th>
                <th style="width: 18%;">Aspek Sikap Akhir & Sportivitas</th>
                <th style="width: 6%;">Skor Akhir</th>
                <th style="width: 6%;">Skor Maks</th>
              </tr>
            </thead>
            <tbody>
              ${rubrikRowsHtml}
            </tbody>
          </table>

          <div class="sec-hdr">III. FORMAT LEMBAR PENILAIAN PRAKTIK SISWA (ROMBEL ${soalPenilaianRombel})</div>
          <table class="grid">
            <thead>
              <tr>
                <th style="width: 4%;">No</th>
                <th style="width: 22%;">Nama Lengkap Peserta Didik</th>
                <th style="width: 4%;">L/P</th>
                ${qThHtml}
                <th style="width: 8%;">Total Skor</th>
                <th style="width: 8%;">Nilai Akhir</th>
                <th style="width: 7%;">Predikat</th>
                <th style="width: 18%;">Keterangan / Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody>
              ${studentRowsHtml}
            </tbody>
          </table>

          <p style="margin-top: 6px; font-size: 10px;"><strong>Pedoman Penskoran & KKTP:</strong> ${generatedSoal.pedomanPenskoran || "-"}</p>

          <div class="sig-wrap">
            <div class="sig-col">
              <p>Mengetahui,<br/><strong>Kepala Sekolah</strong></p>
              <div class="sig-space"></div>
              <p><u><strong>${headmasterName}</strong></u><br/>NIP. ${headmasterNip}</p>
            </div>
            <div class="sig-col">
              <p>Sadar, ${formattedDate}<br/><strong>Guru PJOK</strong></p>
              <div class="sig-space"></div>
              <p><u><strong>${teacherName}</strong></u><br/>NIP. ${teacherNip}</p>
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopySoalTable = async () => {
    if (!generatedSoal || !generatedSoal.kisiKisi) return;
    const header = "| No | Tujuan Pembelajaran | Ruang Lingkup Materi | Level Kognitif (Taksonomi Bloom) | Indikator Soal | Bentuk Soal | Nomor Soal | Naskah Soal | Kunci Jawaban | Skor |";
    const divider = "|---|---|---|---|---|---|---|---|---|---|";
    const rows = generatedSoal.kisiKisi.map((item: any, idx: number) => {
      const clean = (val: any) => String(val ?? "-").replace(/\n+/g, " ").replace(/\|/g, "/");
      return `| ${item.no || idx + 1} | ${clean(item.tujuanPembelajaran)} | ${clean(item.ruangLingkupMateri)} | ${clean(item.levelKognitif)} | ${clean(item.indikatorSoal)} | ${clean(item.bentukSoal)} | ${clean(item.nomorSoal || idx + 1)} | ${clean(item.naskahSoal)} | ${clean(item.kunciJawaban)} | ${item.skor} |`;
    });

    const markdownText = [
      `# ${generatedSoal.judulAsesmen}`,
      `Mata Pelajaran: ${generatedSoal.mataPelajaran || soalMapel}`,
      `Kelas / Fase: ${generatedSoal.kelas || soalKelas} / ${generatedSoal.fase || soalFase}`,
      `Jenis Asesmen: ${generatedSoal.jenisAsesmen || soalJenisAsesmen}`,
      ``,
      header,
      divider,
      ...rows
    ].join("\n");

    try {
      await navigator.clipboard.writeText(markdownText);
      setSoalSuccessMessage("Tabel Kisi-Kisi & Soal Praktik berhasil disalin ke Clipboard!");
    } catch {
      setSoalSuccessMessage("Silakan gunakan tombol Unduh Excel atau Word untuk menyimpan tabel.");
    }
  };

  // CSV Excel Template Generator and Downloader
  const handleDownloadTemplate = () => {
    const headers = [
      "Nama Lengkap",
      "Jenis Kelamin (L atau P)",
      "Kelas (Contoh: IV-A)"
    ];
    const rows = [
      ["Budi Santoso", "L", "IV-A"],
      ["Siti Aminah", "P", "V-B"],
      ["Randi Hermawan", "L", "VI-A"]
    ];
    
    // Add UTF-8 BOM so Excel opens it with correct encoding (essential for Indonesian characters & delimiters)
    // We use Semicolon (;) as the separator so Indonesian locale MS Excel parses columns automatically
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(row => row.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_siswa_sadar_pjok.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse Student Data Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportError(null);
    setImportSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        
        if (lines.length <= 1) {
          setImportError("File kosong atau tidak memiliki baris data selain header.");
          return;
        }

        const dataRows = lines.slice(1);
        const parsed: Student[] = [];

        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i];
          const delimiter = row.includes(";") ? ";" : ",";
          const cols = row.split(delimiter).map(c => c.replace(/^["']|["']$/g, "").trim());

          if (cols.length < 3 || !cols[0]) {
            continue; // Skip invalid row
          }

          const name = cols[0];
          const genderInput = cols[1]?.toUpperCase() || "L";
          const gender: "L" | "P" = (genderInput.startsWith("P") || genderInput === "PEREMPUAN") ? "P" : "L";
          const grade = cols[2] || "IV-A";
          const height = parseFloat(cols[3]) || 135;
          const weight = parseFloat(cols[4]) || 30;
          const runSpeed = parseFloat(cols[5]) || 0;
          const sitUps = parseInt(cols[6], 10) || 0;
          const pushUps = parseInt(cols[7], 10) || 0;
          const verticalJump = parseFloat(cols[8]) || 0;
          const runDistance = parseFloat(cols[9]) || 0;

          parsed.push({
            id: `std-bulk-${Date.now()}-${i}`,
            name,
            gender,
            grade,
            height,
            weight,
            runSpeed,
            sitUps,
            pushUps,
            verticalJump,
            runDistance,
            updatedAt: new Date().toISOString().split("T")[0]
          });
        }

        if (parsed.length === 0) {
          setImportError("Tidak berhasil mendeteksi data siswa yang valid. Mohon periksa kembali file Anda.");
        } else {
          setImportPreview(parsed);
        }
      } catch (err) {
        setImportError("Format file tidak didukung atau rusak. Silakan gunakan template CSV.");
      }
    };
    reader.readAsText(file);
  };

  // Save imported bulk students
  const handleApplyImport = () => {
    if (importPreview.length === 0) return;
    const updated = [...students, ...importPreview];
    saveStudents(updated);
    
    // Auto-update customRombels with any brand new grades imported
    const uniqueGradesInImport = Array.from(new Set(importPreview.map(s => s.grade)));
    const newRombels = Array.from(new Set([...customRombels, ...uniqueGradesInImport]));
    saveCustomRombels(newRombels.sort());

    setImportSuccess(`Berhasil mengimpor ${importPreview.length} data siswa baru secara massal!`);
    setImportPreview([]);
    setImportFile(null);
    setPastedText("");
  };

  const handleParsePastedData = () => {
    setImportError(null);
    setImportSuccess(null);
    
    if (!pastedText.trim()) {
      setImportError("Kotak teks kosong. Silakan tempel data dari Excel terlebih dahulu.");
      return;
    }

    try {
      const lines = pastedText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      const parsed: Student[] = [];

      for (let i = 0; i < lines.length; i++) {
        const row = lines[i];
        let cols: string[] = [];
        if (row.includes("\t")) {
          cols = row.split("\t").map(c => c.trim());
        } else if (row.includes(";")) {
          cols = row.split(";").map(c => c.replace(/^["']|["']$/g, "").trim());
        } else {
          cols = row.split(",").map(c => c.replace(/^["']|["']$/g, "").trim());
        }

        if (cols.length < 3 || !cols[0]) {
          continue; // skip invalid or empty lines
        }

        // Check if the first line is a header by matching keywords
        if (i === 0 && (cols[0].toLowerCase().includes("nama") || cols[1].toLowerCase().includes("kelamin") || cols[2].toLowerCase().includes("kelas"))) {
          continue; // Skip header row
        }

        const name = cols[0];
        const genderInput = cols[1]?.toUpperCase() || "L";
        const gender: "L" | "P" = (genderInput.startsWith("P") || genderInput === "PEREMPUAN") ? "P" : "L";
        const grade = cols[2] || "IV-A";
        const height = parseFloat(cols[3]) || 135;
        const weight = parseFloat(cols[4]) || 30;
        const runSpeed = parseFloat(cols[5]) || 0;
        const sitUps = parseInt(cols[6], 10) || 0;
        const pushUps = parseInt(cols[7], 10) || 0;
        const verticalJump = parseFloat(cols[8]) || 0;
        const runDistance = parseFloat(cols[9]) || 0;

        parsed.push({
          id: `std-paste-${Date.now()}-${i}`,
          name,
          gender,
          grade,
          height,
          weight,
          runSpeed,
          sitUps,
          pushUps,
          verticalJump,
          runDistance,
          updatedAt: new Date().toISOString().split("T")[0]
        });
      }

      if (parsed.length === 0) {
        setImportError("Tidak berhasil mendeteksi data siswa yang valid. Pastikan Anda menyalin minimal 3 kolom: Nama, Jenis Kelamin (L/P), dan Kelas.");
      } else {
        setImportPreview(parsed);
        setImportSuccess(`Berhasil memproses ${parsed.length} data siswa dari teks salinan! Silakan periksa tabel pratinjau di bawah lalu klik simpan.`);
      }
    } catch (err) {
      setImportError("Gagal memproses data salinan. Mohon periksa format data Anda.");
    }
  };

  // Add a new Custom Rombongan Belajar
  const handleAddCustomRombel = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newRombelName.trim().toUpperCase();
    if (!cleanName) return;

    if (customRombels.includes(cleanName)) {
      alert("Rombongan belajar ini sudah terdaftar.");
      return;
    }

    const updated = [...customRombels, cleanName].sort();
    saveCustomRombels(updated);
    setNewRombelName("");
    alert(`Rombel ${cleanName} berhasil ditambahkan.`);
  };

  // Delete a Custom Rombongan Belajar
  const handleDeleteCustomRombel = (rombel: string) => {
    setRombelToDelete(rombel);
  };

  const executeDeleteRombel = (rombel: string) => {
    // Delete students in this rombel
    const updatedStudents = students.filter(s => s.grade !== rombel);
    saveStudents(updatedStudents);
    
    // Delete rombel
    const updatedRombels = customRombels.filter(r => r !== rombel);
    saveCustomRombels(updatedRombels);
    
    // Update selection states
    setSelectedRombels(prev => prev.filter(r => r !== rombel));
    setRombelToDelete(null);

    // Sync selected viewing/attendance/grades rombel
    if (viewingRombel === rombel) {
      setViewingRombel(null);
    }
    if (attendanceRombel === rombel) {
      setAttendanceRombel(updatedRombels[0] || "");
    }
    if (gradesRombel === rombel) {
      setGradesRombel(updatedRombels[0] || "");
    }
  };

  const handleBulkDeleteRombels = () => {
    if (selectedRombels.length === 0) return;
    
    // Find all students in selected rombels
    const affectedStudentsCount = students.filter(s => selectedRombels.includes(s.grade)).length;
    
    let confirmMsg = `Apakah Anda yakin ingin menghapus ${selectedRombels.length} Rombel terpilih secara masal?`;
    if (affectedStudentsCount > 0) {
      confirmMsg = `Rombel terpilih masih berisi total ${affectedStudentsCount} data siswa.\n\nApakah Anda yakin ingin menghapus ${selectedRombels.length} Rombel ini beserta seluruh ${affectedStudentsCount} data siswa di dalamnya secara permanen?`;
    }
    
    if (confirm(confirmMsg)) {
      // Filter out students in deleted rombels
      const updatedStudents = students.filter(s => !selectedRombels.includes(s.grade));
      saveStudents(updatedStudents);
      
      // Filter out rombels
      const updatedRombels = customRombels.filter(r => !selectedRombels.includes(r));
      saveCustomRombels(updatedRombels);
      
      setSelectedRombels([]);
      alert(`Berhasil menghapus ${selectedRombels.length} Rombel secara masal.`);
    }
  };

  const handleClearAllRombels = () => {
    if (customRombels.length === 0) {
      alert("Tidak ada rombongan belajar untuk dihapus.");
      return;
    }
    
    // Find all students in custom rombels
    const affectedStudentsCount = students.filter(s => customRombels.includes(s.grade)).length;
    
    let confirmMsg = "Apakah Anda yakin ingin menghapus SELURUH Rombongan Belajar?";
    if (affectedStudentsCount > 0) {
      confirmMsg = `PERINGATAN: Rombongan belajar yang ada masih berisi total ${affectedStudentsCount} data siswa.\n\nMenghapus seluruh rombongan belajar juga akan menghapus seluruh data siswa di dalamnya secara permanen.\n\nApakah Anda yakin ingin menghapus SELURUH rombongan belajar beserta seluruh data siswa?`;
    }
    
    if (confirm(confirmMsg)) {
      // Filter out students in deleted rombels
      const updatedStudents = students.filter(s => !customRombels.includes(s.grade));
      saveStudents(updatedStudents);
      
      // Clear custom rombels
      saveCustomRombels([]);
      setSelectedRombels([]);
      alert("Seluruh rombongan belajar berhasil dihapus.");
    }
  };

  // Automatically sync attendance list when students, rombel, or date changes
  useEffect(() => {
    if (students.length > 0) {
      const timer = setTimeout(() => {
        const rombelStudents = students.filter((s) => s.grade === attendanceRombel);
        const existing = attendanceRecords.find(
          (r) => r.date === attendanceDate && r.rombel === attendanceRombel
        );

        const newList: { [studentId: string]: { status: "H" | "S" | "I" | "A"; notes: string } } = {};

        rombelStudents.forEach((std) => {
          if (existing) {
            const studentRec = existing.students.find((s: any) => s.studentId === std.id);
            newList[std.id] = {
              status: studentRec ? studentRec.status : "H",
              notes: studentRec ? studentRec.notes || "" : ""
            };
          } else {
            newList[std.id] = {
              status: "H",
              notes: ""
            };
          }
        });

        setAttendanceList(newList);
        setAttendanceSuccessMessage(null);
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendanceDate, attendanceRombel, students, attendanceRecords.length]);

  // Toggle individual student status
  const handleToggleStudentAttendance = (studentId: string, status: "H" | "S" | "I" | "A") => {
    setAttendanceList((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  // Update student note
  const handleUpdateStudentNote = (studentId: string, notes: string) => {
    setAttendanceList((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  };

  // Mark all students present (Hadir)
  const handleMarkAllPresent = () => {
    const updated = { ...attendanceList };
    Object.keys(updated).forEach((id) => {
      updated[id] = {
        ...updated[id],
        status: "H"
      };
    });
    setAttendanceList(updated);
  };

  // Save attendance log
  const handleSaveAttendance = () => {
    const rombelStudents = students.filter((s) => s.grade === attendanceRombel);
    if (rombelStudents.length === 0) {
      alert("Tidak ada data siswa di rombel " + attendanceRombel + " untuk diabsen.");
      return;
    }

    const recordsToSave = rombelStudents.map((std) => ({
      studentId: std.id,
      studentName: std.name,
      status: attendanceList[std.id]?.status || "H",
      notes: attendanceList[std.id]?.notes || ""
    }));

    const existingIndex = attendanceRecords.findIndex(
      (r) => r.date === attendanceDate && r.rombel === attendanceRombel
    );

    const updatedRecords = [...attendanceRecords];
    const newRecord = {
      id: existingIndex >= 0 ? attendanceRecords[existingIndex].id : `att-${Date.now()}`,
      date: attendanceDate,
      rombel: attendanceRombel,
      students: recordsToSave,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      updatedRecords[existingIndex] = newRecord;
    } else {
      updatedRecords.unshift(newRecord);
    }

    saveAttendanceRecords(updatedRecords);
    setAttendanceSuccessMessage(`Absensi Kelas ${attendanceRombel} Tanggal ${attendanceDate} berhasil disimpan!`);
    setTimeout(() => setAttendanceSuccessMessage(null), 4000);
  };

  // Delete attendance record
  const handleDeleteAttendanceRecord = (id: string) => {
    const updated = attendanceRecords.filter((r) => r.id !== id);
    saveAttendanceRecords(updated);
    setAttendanceSuccessMessage("Catatan absensi berhasil dihapus.");
    setTimeout(() => setAttendanceSuccessMessage(null), 3000);
  };

  // --- WEEKLY ATTENDANCE RECAP (DALAM 1 BULAN) EXCEL & PDF HANDLERS ---
  const WEEKLY_BUCKETS = [
    { id: 1, label: "Minggu 1", rangeLabel: "Tgl 1 - 7", minDay: 1, maxDay: 7 },
    { id: 2, label: "Minggu 2", rangeLabel: "Tgl 8 - 14", minDay: 8, maxDay: 14 },
    { id: 3, label: "Minggu 3", rangeLabel: "Tgl 15 - 21", minDay: 15, maxDay: 21 },
    { id: 4, label: "Minggu 4", rangeLabel: "Tgl 22 - 28", minDay: 22, maxDay: 28 },
    { id: 5, label: "Minggu 5", rangeLabel: "Tgl 29 - Akhir", minDay: 29, maxDay: 31 },
  ];

  const handleExportWeeklyAttendanceExcel = () => {
    const monthObj = MONTHS_OPTIONS.find((m) => m.value === monthlyRecapMonth);
    const monthLabel = monthObj ? monthObj.label : String(monthlyRecapMonth);
    const yearMonthPrefix = `${monthlyRecapYear}-${String(monthlyRecapMonth).padStart(2, "0")}`;

    const rombelStudents = students
      .filter((s) => s.grade === monthlyRecapRombel)
      .filter((s) =>
        monthlyRecapSearch.trim() === ""
          ? true
          : s.name.toLowerCase().includes(monthlyRecapSearch.toLowerCase())
      );

    const monthRecords = attendanceRecords.filter(
      (r) => r.rombel === monthlyRecapRombel && r.date.startsWith(yearMonthPrefix)
    );

    const aoa: any[][] = [
      [schoolName.toUpperCase()],
      [schoolAddress],
      [`REKAPITULASI ABSENSI MINGGUAN DALAM SATU BULAN - KELAS ${monthlyRecapRombel}`],
      [`Bulan: ${monthLabel} ${monthlyRecapYear} | Mata Pelajaran: PJOK | Guru Pengampu: ${teacherName}`],
      [],
      [
        "No",
        "Nama Lengkap Siswa",
        "L/P",
        "M1 (Tgl 1-7) H",
        "M1 S",
        "M1 I",
        "M1 A",
        "M2 (Tgl 8-14) H",
        "M2 S",
        "M2 I",
        "M2 A",
        "M3 (Tgl 15-21) H",
        "M3 S",
        "M3 I",
        "M3 A",
        "M4 (Tgl 22-28) H",
        "M4 S",
        "M4 I",
        "M4 A",
        "M5 (Tgl 29-31) H",
        "M5 S",
        "M5 I",
        "M5 A",
        "Total Hadir (H)",
        "Total Sakit (S)",
        "Total Izin (I)",
        "Total Alfa (A)",
        "Total Pertemuan",
        "Persentase Hadir (%)",
      ],
    ];

    rombelStudents.forEach((std, idx) => {
      let totalH = 0;
      let totalS = 0;
      let totalI = 0;
      let totalA = 0;

      const weekCells: number[] = [];

      WEEKLY_BUCKETS.forEach((wb) => {
        let wH = 0;
        let wS = 0;
        let wI = 0;
        let wA = 0;

        monthRecords.forEach((rec) => {
          const dayNum = parseInt(rec.date.split("-")[2], 10);
          if (dayNum >= wb.minDay && dayNum <= wb.maxDay) {
            const sRec = rec.students?.find((s: any) => s.studentId === std.id);
            const st = sRec?.status;
            if (st === "H") { wH++; totalH++; }
            else if (st === "S") { wS++; totalS++; }
            else if (st === "I") { wI++; totalI++; }
            else if (st === "A") { wA++; totalA++; }
          }
        });

        weekCells.push(wH, wS, wI, wA);
      });

      const totalSessions = totalH + totalS + totalI + totalA;
      const pct = totalSessions > 0 ? Math.round((totalH / totalSessions) * 100) : 0;

      aoa.push([
        idx + 1,
        std.name,
        std.gender,
        ...weekCells,
        totalH,
        totalS,
        totalI,
        totalA,
        totalSessions,
        `${pct}%`,
      ]);
    });

    aoa.push([]);
    aoa.push(["", "Mengetahui,", "", "", "", "", "", "", "", "", `Sadar, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`]);
    aoa.push(["", "Kepala Sekolah", "", "", "", "", "", "", "", "", "Guru PJOK"]);
    aoa.push([]);
    aoa.push([]);
    aoa.push(["", headmasterName, "", "", "", "", "", "", "", "", teacherName]);
    aoa.push(["", `NIP. ${headmasterNip}`, "", "", "", "", "", "", "", "", `NIP. ${teacherNip}`]);

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Mingguan_${monthlyRecapRombel}`);
    XLSX.writeFile(workbook, `Rekap_Absensi_Mingguan_Kelas_${monthlyRecapRombel}_${monthLabel}_${monthlyRecapYear}.xlsx`);

    setAttendanceSuccessMessage(`Berhasil mengunduh Excel Rekap Mingguan Kelas ${monthlyRecapRombel} (${monthLabel} ${monthlyRecapYear})!`);
    setTimeout(() => setAttendanceSuccessMessage(null), 4000);
  };

  const handlePrintWeeklyAttendancePDF = () => {
    const monthObj = MONTHS_OPTIONS.find((m) => m.value === monthlyRecapMonth);
    const monthLabel = monthObj ? monthObj.label : String(monthlyRecapMonth);
    const yearMonthPrefix = `${monthlyRecapYear}-${String(monthlyRecapMonth).padStart(2, "0")}`;

    const rombelStudents = students
      .filter((s) => s.grade === monthlyRecapRombel)
      .filter((s) =>
        monthlyRecapSearch.trim() === ""
          ? true
          : s.name.toLowerCase().includes(monthlyRecapSearch.toLowerCase())
      );

    const monthRecords = attendanceRecords.filter(
      (r) => r.rombel === monthlyRecapRombel && r.date.startsWith(yearMonthPrefix)
    );

    const rowsHtml = rombelStudents
      .map((std, idx) => {
        let totalH = 0;
        let totalS = 0;
        let totalI = 0;
        let totalA = 0;

        const weekCellsHtml = WEEKLY_BUCKETS.map((wb) => {
          let wH = 0;
          let wS = 0;
          let wI = 0;
          let wA = 0;

          monthRecords.forEach((rec) => {
            const dayNum = parseInt(rec.date.split("-")[2], 10);
            if (dayNum >= wb.minDay && dayNum <= wb.maxDay) {
              const sRec = rec.students?.find((s: any) => s.studentId === std.id);
              const st = sRec?.status;
              if (st === "H") { wH++; totalH++; }
              else if (st === "S") { wS++; totalS++; }
              else if (st === "I") { wI++; totalI++; }
              else if (st === "A") { wA++; totalA++; }
            }
          });

          return `
            <td style="text-align:center;color:#065f46;font-weight:bold;">${wH}</td>
            <td style="text-align:center;color:#92400e;">${wS}</td>
            <td style="text-align:center;color:#1e40af;">${wI}</td>
            <td style="text-align:center;color:#991b1b;">${wA}</td>
          `;
        }).join("");

        const totalSessions = totalH + totalS + totalI + totalA;
        const pct = totalSessions > 0 ? Math.round((totalH / totalSessions) * 100) : 0;

        return `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td style="font-weight:bold;">${std.name}</td>
            <td style="text-align:center;">${std.gender}</td>
            ${weekCellsHtml}
            <td style="text-align:center;font-weight:bold;background:#ecfdf5;">${totalH}</td>
            <td style="text-align:center;font-weight:bold;background:#fffbeb;">${totalS}</td>
            <td style="text-align:center;font-weight:bold;background:#eff6ff;">${totalI}</td>
            <td style="text-align:center;font-weight:bold;background:#fef2f2;">${totalA}</td>
            <td style="text-align:center;font-weight:bold;">${pct}%</td>
          </tr>
        `;
      })
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Rekap Mingguan Absensi Kelas ${monthlyRecapRombel} - ${monthLabel} ${monthlyRecapYear}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; padding: 15px; color: #000; font-size: 10px; }
            .kop { border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 12px; text-align: center; }
            .kop h1 { font-size: 13px; margin: 0; text-transform: uppercase; }
            .kop h2 { font-size: 15px; margin: 2px 0; text-transform: uppercase; font-weight: bold; }
            .kop p { font-size: 10px; margin: 2px 0; font-style: italic; }
            .title { text-align: center; font-size: 13px; font-weight: bold; text-decoration: underline; margin-bottom: 10px; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; font-size: 9px; }
            th, td { border: 1px solid #000; padding: 3px 4px; }
            th { background: #f3f4f6; text-align: center; font-weight: bold; }
            .sig { margin-top: 24px; display: flex; justify-content: space-between; font-size: 10px; page-break-inside: avoid; }
            .sig-box { width: 220px; text-align: center; }
            @media print { @page { size: 330mm 215mm; margin: 0.8cm; } }
          </style>
        </head>
        <body>
          <div class="kop">
            <h1>Pemerintah Kabupaten / Kota Sadar</h1>
            <h2>${schoolName}</h2>
            <p>${schoolAddress}</p>
          </div>
          <div class="title">REKAPITULASI ABSENSI MINGGUAN DALAM SATU BULAN (${String(monthLabel).toUpperCase()} ${monthlyRecapYear}) - KELAS ${monthlyRecapRombel}</div>
          <table>
            <thead>
              <tr>
                <th rowspan="2">No</th>
                <th rowspan="2">Nama Siswa</th>
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
          <div class="sig">
            <div class="sig-box">
              <p>Mengetahui,<br/><strong>Kepala Sekolah</strong></p>
              <div style="height:45px;"></div>
              <p><strong><u>${headmasterName}</u></strong><br/>NIP. ${headmasterNip}</p>
            </div>
            <div class="sig-box">
              <p>Sadar, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br/><strong>Guru PJOK</strong></p>
              <div style="height:45px;"></div>
              <p><strong><u>${teacherName}</u></strong><br/>NIP. ${teacherNip}</p>
            </div>
          </div>
        </body>
      </html>
    `;

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
      doc.write(htmlContent);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 2000);
      }, 300);
    }
  };

  // --- SEMESTER ATTENDANCE RECAP (1 SEMESTER = 6 BULAN) EXCEL & PDF HANDLERS ---
  const getSemesterMonths = (semType: "1" | "2") => {
    return semType === "1"
      ? [
          { value: "07", label: "Juli", short: "Jul" },
          { value: "08", label: "Agustus", short: "Agu" },
          { value: "09", label: "September", short: "Sep" },
          { value: "10", label: "Oktober", short: "Okt" },
          { value: "11", label: "November", short: "Nov" },
          { value: "12", label: "Desember", short: "Des" },
        ]
      : [
          { value: "01", label: "Januari", short: "Jan" },
          { value: "02", label: "Februari", short: "Feb" },
          { value: "03", label: "Maret", short: "Mar" },
          { value: "04", label: "April", short: "Apr" },
          { value: "05", label: "Mei", short: "Mei" },
          { value: "06", label: "Juni", short: "Jun" },
        ];
  };

  const handleExportSemesterAttendanceExcel = () => {
    const semMonths = getSemesterMonths(semesterRecapType);
    const semTitle = semesterRecapType === "1" ? "Semester 1 (Ganjil: Juli - Desember)" : "Semester 2 (Genap: Januari - Juni)";

    const rombelStudents = students
      .filter((s) => s.grade === monthlyRecapRombel)
      .filter((s) =>
        monthlyRecapSearch.trim() === ""
          ? true
          : s.name.toLowerCase().includes(monthlyRecapSearch.toLowerCase())
      );

    const monthHeaders: string[] = [];
    semMonths.forEach((m) => {
      monthHeaders.push(`${m.short} (H)`, `${m.short} (S)`, `${m.short} (I)`, `${m.short} (A)`);
    });

    const aoa: any[][] = [
      [schoolName.toUpperCase()],
      [schoolAddress],
      [`REKAPITULASI ABSENSI SATU SEMESTER - KELAS ${monthlyRecapRombel}`],
      [`Periode: ${semTitle} Tahun ${monthlyRecapYear} | Mata Pelajaran: PJOK | Guru Pengampu: ${teacherName}`],
      [],
      [
        "No",
        "Nama Lengkap Siswa",
        "L/P",
        ...monthHeaders,
        "Total Hadir (H)",
        "Total Sakit (S)",
        "Total Izin (I)",
        "Total Alfa (A)",
        "Total Pertemuan",
        "Persentase Kehadiran (%)",
        "Predikat Kehadiran",
      ],
    ];

    rombelStudents.forEach((std, idx) => {
      let semH = 0;
      let semS = 0;
      let semI = 0;
      let semA = 0;
      const monthCells: number[] = [];

      semMonths.forEach((m) => {
        const prefix = `${monthlyRecapYear}-${m.value}`;
        const mRecs = attendanceRecords.filter(
          (r) => r.rombel === monthlyRecapRombel && r.date.startsWith(prefix)
        );
        let mH = 0;
        let mS = 0;
        let mI = 0;
        let mA = 0;
        mRecs.forEach((rec) => {
          const sRec = rec.students?.find((s: any) => s.studentId === std.id);
          const st = sRec?.status;
          if (st === "H") { mH++; semH++; }
          else if (st === "S") { mS++; semS++; }
          else if (st === "I") { mI++; semI++; }
          else if (st === "A") { mA++; semA++; }
        });
        monthCells.push(mH, mS, mI, mA);
      });

      const totalSessions = semH + semS + semI + semA;
      const pct = totalSessions > 0 ? Math.round((semH / totalSessions) * 100) : 0;
      const predikat = pct >= 90 ? "Sangat Baik" : pct >= 80 ? "Baik" : pct >= 70 ? "Cukup" : "Perlu Pembinaan";

      aoa.push([
        idx + 1,
        std.name,
        std.gender,
        ...monthCells,
        semH,
        semS,
        semI,
        semA,
        totalSessions,
        `${pct}%`,
        predikat,
      ]);
    });

    aoa.push([]);
    aoa.push(["", "Mengetahui,", "", "", "", "", "", "", "", "", `Sadar, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`]);
    aoa.push(["", "Kepala Sekolah", "", "", "", "", "", "", "", "", "Guru PJOK"]);
    aoa.push([]);
    aoa.push([]);
    aoa.push(["", headmasterName, "", "", "", "", "", "", "", "", teacherName]);
    aoa.push(["", `NIP. ${headmasterNip}`, "", "", "", "", "", "", "", "", `NIP. ${teacherNip}`]);

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Semester_${semesterRecapType}_${monthlyRecapRombel}`);
    XLSX.writeFile(workbook, `Rekap_Absensi_Semester_${semesterRecapType}_Kelas_${monthlyRecapRombel}_${monthlyRecapYear}.xlsx`);

    setAttendanceSuccessMessage(`Berhasil mengunduh Excel Rekap Semester ${semesterRecapType} Kelas ${monthlyRecapRombel}!`);
    setTimeout(() => setAttendanceSuccessMessage(null), 4000);
  };

  const handlePrintSemesterAttendancePDF = () => {
    const semMonths = getSemesterMonths(semesterRecapType);
    const semTitle = semesterRecapType === "1" ? "SEMESTER 1 (GANJIL: JULI - DESEMBER)" : "SEMESTER 2 (GENAP: JANUARI - JUNI)";

    const rombelStudents = students
      .filter((s) => s.grade === monthlyRecapRombel)
      .filter((s) =>
        monthlyRecapSearch.trim() === ""
          ? true
          : s.name.toLowerCase().includes(monthlyRecapSearch.toLowerCase())
      );

    const rowsHtml = rombelStudents
      .map((std, idx) => {
        let semH = 0;
        let semS = 0;
        let semI = 0;
        let semA = 0;

        const monthCellsHtml = semMonths
          .map((m) => {
            const prefix = `${monthlyRecapYear}-${m.value}`;
            const mRecs = attendanceRecords.filter(
              (r) => r.rombel === monthlyRecapRombel && r.date.startsWith(prefix)
            );
            let mH = 0;
            let mS = 0;
            let mI = 0;
            let mA = 0;
            mRecs.forEach((rec) => {
              const sRec = rec.students?.find((s: any) => s.studentId === std.id);
              const st = sRec?.status;
              if (st === "H") { mH++; semH++; }
              else if (st === "S") { mS++; semS++; }
              else if (st === "I") { mI++; semI++; }
              else if (st === "A") { mA++; semA++; }
            });
            return `
              <td style="text-align:center;color:#065f46;font-weight:bold;">${mH}</td>
              <td style="text-align:center;color:#92400e;">${mS}</td>
              <td style="text-align:center;color:#1e40af;">${mI}</td>
              <td style="text-align:center;color:#991b1b;">${mA}</td>
            `;
          })
          .join("");

        const totalSessions = semH + semS + semI + semA;
        const pct = totalSessions > 0 ? Math.round((semH / totalSessions) * 100) : 0;

        return `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td style="font-weight:bold;">${std.name}</td>
            <td style="text-align:center;">${std.gender}</td>
            ${monthCellsHtml}
            <td style="text-align:center;font-weight:bold;background:#ecfdf5;">${semH}</td>
            <td style="text-align:center;font-weight:bold;background:#fffbeb;">${semS}</td>
            <td style="text-align:center;font-weight:bold;background:#eff6ff;">${semI}</td>
            <td style="text-align:center;font-weight:bold;background:#fef2f2;">${semA}</td>
            <td style="text-align:center;font-weight:bold;">${pct}%</td>
          </tr>
        `;
      })
      .join("");

    const monthTopTh = semMonths.map((m) => `<th colspan="4">${m.label}</th>`).join("");
    const monthSubTh = semMonths.map(() => `<th>H</th><th>S</th><th>I</th><th>A</th>`).join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Rekap Semester Absensi Kelas ${monthlyRecapRombel} - ${monthlyRecapYear}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; padding: 15px; color: #000; font-size: 9px; }
            .kop { border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 10px; text-align: center; }
            .kop h1 { font-size: 13px; margin: 0; text-transform: uppercase; }
            .kop h2 { font-size: 15px; margin: 2px 0; text-transform: uppercase; font-weight: bold; }
            .kop p { font-size: 10px; margin: 2px 0; font-style: italic; }
            .title { text-align: center; font-size: 12px; font-weight: bold; text-decoration: underline; margin-bottom: 10px; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; font-size: 8.5px; }
            th, td { border: 1px solid #000; padding: 2.5px 3px; }
            th { background: #f3f4f6; text-align: center; font-weight: bold; }
            .sig { margin-top: 20px; display: flex; justify-content: space-between; font-size: 10px; page-break-inside: avoid; }
            .sig-box { width: 220px; text-align: center; }
            @media print { @page { size: 330mm 215mm; margin: 0.7cm; } }
          </style>
        </head>
        <body>
          <div class="kop">
            <h1>Pemerintah Kabupaten / Kota Sadar</h1>
            <h2>${schoolName}</h2>
            <p>${schoolAddress}</p>
          </div>
          <div class="title">REKAPITULASI ABSENSI SATU SEMESTER (${semTitle} ${monthlyRecapYear}) - KELAS ${monthlyRecapRombel}</div>
          <table>
            <thead>
              <tr>
                <th rowspan="2">No</th>
                <th rowspan="2">Nama Siswa</th>
                <th rowspan="2">L/P</th>
                ${monthTopTh}
                <th colspan="5">Total Semester</th>
              </tr>
              <tr>
                ${monthSubTh}
                <th>H</th><th>S</th><th>I</th><th>A</th><th>%</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <div class="sig">
            <div class="sig-box">
              <p>Mengetahui,<br/><strong>Kepala Sekolah</strong></p>
              <div style="height:45px;"></div>
              <p><strong><u>${headmasterName}</u></strong><br/>NIP. ${headmasterNip}</p>
            </div>
            <div class="sig-box">
              <p>Sadar, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br/><strong>Guru PJOK</strong></p>
              <div style="height:45px;"></div>
              <p><strong><u>${teacherName}</u></strong><br/>NIP. ${teacherNip}</p>
            </div>
          </div>
        </body>
      </html>
    `;

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
      doc.write(htmlContent);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 2000);
      }, 300);
    }
  };

  // --- GRADEs / REKAP NILAI SISWA HANDLERS ---
  const handleUpdateStudentGrade = (
    studentId: string,
    field: "tp1" | "tp2" | "tp3" | "tp4" | "stsTulisan" | "stsPraktik" | "pasTulisan" | "pasPraktik" | "notes",
    val: string
  ) => {
    setStudentGrades((prev) => {
      const studentRec = prev[studentId] || {
        tp1: "", tp2: "", tp3: "", tp4: "",
        stsTulisan: "", stsPraktik: "", pasTulisan: "", pasPraktik: "",
        notes: ""
      };

      let parsedVal: any = val;
      if (field !== "notes") {
        if (val === "") {
          parsedVal = "";
        } else {
          const num = parseFloat(val);
          parsedVal = isNaN(num) ? "" : num;
        }
      }

      return {
        ...prev,
        [studentId]: {
          ...studentRec,
          [field]: parsedVal
        }
      };
    });
  };

  const handleSaveGrades = () => {
    localStorage.setItem("sadar_student_grades", JSON.stringify(studentGrades));
    syncToSupabase("sadar_student_grades", studentGrades);
    setGradesSuccessMessage(`Rekap Nilai Kelas ${gradesRombel} berhasil disimpan!`);
    setTimeout(() => setGradesSuccessMessage(null), 4000);
  };

  const handleSaveTpDescriptions = (tpNum: 1 | 2 | 3 | 4, val: string) => {
    if (tpNum === 1) {
      setTp1Desc(val);
      localStorage.setItem("sadar_tp1_desc", val);
      syncToSupabase("sadar_tp1_desc", val);
    } else if (tpNum === 2) {
      setTp2Desc(val);
      localStorage.setItem("sadar_tp2_desc", val);
      syncToSupabase("sadar_tp2_desc", val);
    } else if (tpNum === 3) {
      setTp3Desc(val);
      localStorage.setItem("sadar_tp3_desc", val);
      syncToSupabase("sadar_tp3_desc", val);
    } else if (tpNum === 4) {
      setTp4Desc(val);
      localStorage.setItem("sadar_tp4_desc", val);
      syncToSupabase("sadar_tp4_desc", val);
    }
  };

  const handlePrintGradesPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Mohon izinkan pop-up untuk mencetak PDF.");
      return;
    }

    const rombelStudents = students.filter((s) => s.grade === gradesRombel);
    const rowsHtml = rombelStudents.map((std, idx) => {
      const g = studentGrades[std.id] || {
        tp1: "", tp2: "", tp3: "", tp4: "",
        stsTulisan: "", stsPraktik: "", pasTulisan: "", pasPraktik: "",
        notes: ""
      };

      const tps = [g.tp1, g.tp2, g.tp3, g.tp4].filter((val) => val !== "") as number[];
      const rerataTp = tps.length > 0 ? (tps.reduce((a, b) => a + b, 0) / tps.length).toFixed(1) : "-";

      const stss = [g.stsTulisan, g.stsPraktik].filter((v) => v !== "") as number[];
      const rerataSts = stss.length > 0 ? (stss.reduce((a, b) => a + b, 0) / stss.length).toFixed(1) : "-";

      const pass = [g.pasTulisan, g.pasPraktik].filter((v) => v !== "") as number[];
      const rerataPas = pass.length > 0 ? (pass.reduce((a, b) => a + b, 0) / pass.length).toFixed(1) : "-";

      let na = "-";
      if (rerataTp !== "-" || rerataSts !== "-" || rerataPas !== "-") {
        const tpVal = rerataTp !== "-" ? parseFloat(rerataTp) : 0;
        const stsVal = rerataSts !== "-" ? parseFloat(rerataSts) : 0;
        const pasVal = rerataPas !== "-" ? parseFloat(rerataPas) : 0;

        let totalWeight = 0;
        let weightedSum = 0;

        if (rerataTp !== "-") { weightedSum += tpVal * 0.4; totalWeight += 0.4; }
        if (rerataSts !== "-") { weightedSum += stsVal * 0.3; totalWeight += 0.3; }
        if (rerataPas !== "-") { weightedSum += pasVal * 0.3; totalWeight += 0.3; }

        na = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(1) : "-";
      }

      return `
        <tr>
          <td style="text-align: center; border: 1px solid #000; padding: 5px;">${idx + 1}</td>
          <td style="border: 1px solid #000; padding: 5px; font-weight: bold;">${std.name}</td>
          <td style="text-align: center; border: 1px solid #000; padding: 5px;">${std.gender}</td>
          <td style="text-align: center; border: 1px solid #000; padding: 5px;">${g.tp1 !== "" ? g.tp1 : "-"}</td>
          <td style="text-align: center; border: 1px solid #000; padding: 5px;">${g.tp2 !== "" ? g.tp2 : "-"}</td>
          <td style="text-align: center; border: 1px solid #000; padding: 5px;">${g.tp3 !== "" ? g.tp3 : "-"}</td>
          <td style="text-align: center; border: 1px solid #000; padding: 5px;">${g.tp4 !== "" ? g.tp4 : "-"}</td>
          <td style="text-align: center; border: 1px solid #000; padding: 5px; background-color: #f3f4f6; font-weight: bold;">${rerataTp}</td>
          <td style="text-align: center; border: 1px solid #000; padding: 5px;">${g.stsTulisan !== "" ? g.stsTulisan : "-"}</td>
          <td style="text-align: center; border: 1px solid #000; padding: 5px;">${g.stsPraktik !== "" ? g.stsPraktik : "-"}</td>
          <td style="text-align: center; border: 1px solid #000; padding: 5px;">${g.pasTulisan !== "" ? g.pasTulisan : "-"}</td>
          <td style="text-align: center; border: 1px solid #000; padding: 5px;">${g.pasPraktik !== "" ? g.pasPraktik : "-"}</td>
          <td style="text-align: center; border: 1px solid #000; padding: 5px; background-color: #d1fae5; font-weight: bold; font-size: 13px; color: #065f46;">${na}</td>
          <td style="border: 1px solid #000; padding: 5px; font-size: 11px;">${g.notes || "-"}</td>
        </tr>
      `;
    }).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Rekap Nilai PJOK Rombel ${gradesRombel}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; padding: 20px; color: #000; line-height: 1.2; }
            .kop-container { border-bottom: 4px double #000; padding-bottom: 8px; margin-bottom: 15px; text-align: center; }
            .kop-text h1 { font-size: 14px; margin: 0; text-transform: uppercase; }
            .kop-text h2 { font-size: 16px; margin: 2px 0; text-transform: uppercase; font-weight: bold; }
            .kop-text h3 { font-size: 18px; margin: 2px 0; text-transform: uppercase; font-weight: bold; }
            .kop-text p { font-size: 11px; margin: 2px 0; font-style: italic; }
            .report-title { text-align: center; font-size: 15px; font-weight: bold; text-decoration: underline; text-transform: uppercase; margin-top: 15px; margin-bottom: 15px; }
            .meta-table { width: 100%; margin-bottom: 15px; font-size: 11px; }
            .meta-table td { padding: 2px 0; border: none; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 11px; }
            .data-table th, .data-table td { border: 1px solid #000; padding: 5px; text-align: left; }
            .data-table th { background-color: #f3f4f6; text-align: center; text-transform: uppercase; font-size: 9px; font-weight: bold; }
            .tp-legend { margin-top: 15px; font-size: 10px; border: 1px solid #ccc; padding: 8px; border-radius: 6px; background-color: #fafafa; }
            .tp-legend-title { font-weight: bold; margin-bottom: 4px; text-transform: uppercase; font-size: 10px; color: #444; }
            .signature-container { margin-top: 30px; width: 100%; display: flex; justify-content: space-between; font-size: 11px; page-break-inside: avoid; }
            .signature-col { width: 230px; text-align: center; }
            .signature-space { height: 50px; }
            @media print {
              body { padding: 0; }
              @page { margin: 1cm; size: 330mm 215mm; }
            }
          </style>
        </head>
        <body>
          <div class="kop-container">
            <div class="kop-text">
              <h1>Pemerintah Kabupaten / Kota Sadar</h1>
              <h2>Dinas Pendidikan dan Kebudayaan</h2>
              <h3>${schoolName}</h3>
              <p>${schoolAddress}</p>
            </div>
          </div>
          
          <div class="report-title">REKAPITULASI NILAI AKHIR SEMESTER (PJOK)</div>
          
          <table class="meta-table">
            <tr>
              <td style="width: 15%;"><strong>Kelas / Rombel</strong></td>
              <td style="width: 35%;">: ${gradesRombel}</td>
              <td style="width: 15%;"><strong>Mata Pelajaran</strong></td>
              <td style="width: 35%;">: Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)</td>
            </tr>
            <tr>
              <td><strong>Tahun Ajaran</strong></td>
              <td>: 2026/2027</td>
              <td><strong>Semester</strong></td>
              <td>: Ganjil (Satu)</td>
            </tr>
            <tr>
              <td><strong>Kurikulum</strong></td>
              <td>: Kurikulum Merdeka</td>
              <td><strong>Rumus Nilai Akhir</strong></td>
              <td>: (Rerata TP * 40%) + (Rerata STS * 30%) + (Rerata PAS * 30%)</td>
            </tr>
          </table>

          <table class="data-table">
            <thead>
              <tr>
                <th rowspan="2" style="width: 3%;">No</th>
                <th rowspan="2" style="width: 20%;">Nama Lengkap Siswa</th>
                <th rowspan="2" style="width: 4%;">L/P</th>
                <th colspan="5" style="width: 25%;">Nilai Praktik Tujuan Pembelajaran (TP)</th>
                <th colspan="2" style="width: 12%;">STS (Tengah Semester)</th>
                <th colspan="2" style="width: 12%;">PAS (Akhir Semester)</th>
                <th rowspan="2" style="width: 7%; background-color: #d1fae5;">Nilai Akhir</th>
                <th rowspan="2" style="width: 17%;">Catatan / Keterangan</th>
              </tr>
              <tr>
                <th>TP 1</th>
                <th>TP 2</th>
                <th>TP 3</th>
                <th>TP 4</th>
                <th style="background-color: #e5e7eb;">Rerata</th>
                <th>Tulis</th>
                <th>Prak</th>
                <th>Tulis</th>
                <th>Prak</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="tp-legend">
            <div class="tp-legend-title">Daftar Tujuan Pembelajaran (TP) PJOK yang Dinilai:</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div><strong>TP 1:</strong> ${tp1Desc}</div>
              <div><strong>TP 2:</strong> ${tp2Desc}</div>
              <div><strong>TP 3:</strong> ${tp3Desc}</div>
              <div><strong>TP 4:</strong> ${tp4Desc}</div>
            </div>
          </div>

          <div class="signature-container">
            <div class="signature-col">
              <p>Mengetahui,</p>
              <p style="font-weight: bold; margin-top: 2px;">Kepala Sekolah</p>
              <div class="signature-space"></div>
              <p style="font-weight: bold; text-decoration: underline;">${headmasterName}</p>
              <p style="font-size: 10px; color: #333;">NIP. ${headmasterNip}</p>
            </div>
            <div class="signature-col">
              <p>Sadar, ${new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</p>
              <p style="font-weight: bold; margin-top: 2px;">Guru PJOK</p>
              <div class="signature-space"></div>
              <p style="font-weight: bold; text-decoration: underline;">${teacherName}</p>
              <p style="font-size: 10px; color: #333;">NIP. ${teacherNip}</p>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintGradesWord = () => {
    const rombelStudents = students.filter((s) => s.grade === gradesRombel);
    const rowsHtml = rombelStudents.map((std, idx) => {
      const g = studentGrades[std.id] || {
        tp1: "", tp2: "", tp3: "", tp4: "",
        stsTulisan: "", stsPraktik: "", pasTulisan: "", pasPraktik: "",
        notes: ""
      };

      const tps = [g.tp1, g.tp2, g.tp3, g.tp4].filter((val) => val !== "") as number[];
      const rerataTp = tps.length > 0 ? (tps.reduce((a, b) => a + b, 0) / tps.length).toFixed(1) : "-";

      const stss = [g.stsTulisan, g.stsPraktik].filter((v) => v !== "") as number[];
      const rerataSts = stss.length > 0 ? (stss.reduce((a, b) => a + b, 0) / stss.length).toFixed(1) : "-";

      const pass = [g.pasTulisan, g.pasPraktik].filter((v) => v !== "") as number[];
      const rerataPas = pass.length > 0 ? (pass.reduce((a, b) => a + b, 0) / pass.length).toFixed(1) : "-";

      let na = "-";
      if (rerataTp !== "-" || rerataSts !== "-" || rerataPas !== "-") {
        const tpVal = rerataTp !== "-" ? parseFloat(rerataTp) : 0;
        const stsVal = rerataSts !== "-" ? parseFloat(rerataSts) : 0;
        const pasVal = rerataPas !== "-" ? parseFloat(rerataPas) : 0;

        let totalWeight = 0;
        let weightedSum = 0;

        if (rerataTp !== "-") { weightedSum += tpVal * 0.4; totalWeight += 0.4; }
        if (rerataSts !== "-") { weightedSum += stsVal * 0.3; totalWeight += 0.3; }
        if (rerataPas !== "-") { weightedSum += pasVal * 0.3; totalWeight += 0.3; }

        na = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(1) : "-";
      }

      return `
        <tr>
          <td style="border: 1px solid #000000; padding: 4px; text-align: center;">${idx + 1}</td>
          <td style="border: 1px solid #000000; padding: 4px; font-weight: bold;">${std.name}</td>
          <td style="border: 1px solid #000000; padding: 4px; text-align: center;">${std.gender}</td>
          <td style="border: 1px solid #000000; padding: 4px; text-align: center;">${g.tp1 !== "" ? g.tp1 : "-"}</td>
          <td style="border: 1px solid #000000; padding: 4px; text-align: center;">${g.tp2 !== "" ? g.tp2 : "-"}</td>
          <td style="border: 1px solid #000000; padding: 4px; text-align: center;">${g.tp3 !== "" ? g.tp3 : "-"}</td>
          <td style="border: 1px solid #000000; padding: 4px; text-align: center;">${g.tp4 !== "" ? g.tp4 : "-"}</td>
          <td style="border: 1px solid #000000; padding: 4px; text-align: center; font-weight: bold; background-color: #f3f3f3;">${rerataTp}</td>
          <td style="border: 1px solid #000000; padding: 4px; text-align: center;">${g.stsTulisan !== "" ? g.stsTulisan : "-"}</td>
          <td style="border: 1px solid #000000; padding: 4px; text-align: center;">${g.stsPraktik !== "" ? g.stsPraktik : "-"}</td>
          <td style="border: 1px solid #000000; padding: 4px; text-align: center;">${g.pasTulisan !== "" ? g.pasTulisan : "-"}</td>
          <td style="border: 1px solid #000000; padding: 4px; text-align: center;">${g.pasPraktik !== "" ? g.pasPraktik : "-"}</td>
          <td style="border: 1px solid #000000; padding: 4px; text-align: center; font-weight: bold; background-color: #d1fae5;">${na}</td>
          <td style="border: 1px solid #000000; padding: 4px;">${g.notes || "-"}</td>
        </tr>
      `;
    }).join("");

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <title>Rekap Nilai PJOK Rombel ${gradesRombel}</title>
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
            body { font-family: 'Times New Roman', serif; }
            table { border-collapse: collapse; width: 100%; }
            th { border: 1px solid #000000; padding: 6px; background-color: #f3f3f3; font-weight: bold; text-align: center; font-size: 10px; }
            td { border: 1px solid #000000; padding: 4px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div style="text-align: center; border-bottom: 3px double #000000; padding-bottom: 6px; margin-bottom: 15px;">
            <div style="font-size: 13px; text-transform: uppercase;">Pemerintah Kabupaten / Kota Sadar</div>
            <div style="font-size: 14px; text-transform: uppercase; font-weight: bold;">Dinas Pendidikan dan Kebudayaan</div>
            <div style="font-size: 16px; text-transform: uppercase; font-weight: bold;">${schoolName}</div>
            <div style="font-size: 9px; font-style: italic;">${schoolAddress}</div>
          </div>
          
          <h2 style="text-align: center; font-size: 14px; text-decoration: underline; text-transform: uppercase; margin-bottom: 15px;">REKAPITULASI NILAI AKHIR SEMESTER (PJOK)</h2>
          
          <table style="width: 100%; border: none; margin-bottom: 15px;">
            <tr style="border: none;">
              <td style="border: none; width: 20%; padding: 2px;"><strong>Kelas / Rombel</strong></td>
              <td style="border: none; width: 30%; padding: 2px;">: ${gradesRombel}</td>
              <td style="border: none; width: 20%; padding: 2px;"><strong>Mata Pelajaran</strong></td>
              <td style="border: none; width: 30%; padding: 2px;">: PJOK</td>
            </tr>
            <tr style="border: none;">
              <td style="border: none; padding: 2px;"><strong>Semester / TA</strong></td>
              <td style="border: none; padding: 2px;">: Ganjil / 2026/2027</td>
              <td style="border: none; padding: 2px;"><strong>Kurikulum</strong></td>
              <td style="border: none; padding: 2px;">: Kurikulum Merdeka</td>
            </tr>
          </table>

          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr>
                <th rowspan="2" style="width: 4%;">No</th>
                <th rowspan="2" style="width: 20%;">Nama Lengkap Siswa</th>
                <th rowspan="2" style="width: 4%;">L/P</th>
                <th colspan="5" style="width: 25%;">Nilai Praktik Tujuan Pembelajaran (TP)</th>
                <th colspan="2" style="width: 12%;">STS (Tengah Semester)</th>
                <th colspan="2" style="width: 12%;">PAS (Akhir Semester)</th>
                <th rowspan="2" style="width: 7%; background-color: #d1fae5;">Nilai Akhir</th>
                <th rowspan="2" style="width: 16%;">Keterangan</th>
              </tr>
              <tr>
                <th>TP 1</th>
                <th>TP 2</th>
                <th>TP 3</th>
                <th>TP 4</th>
                <th style="background-color: #e5e7eb;">Rerata</th>
                <th>Tulis</th>
                <th>Prak</th>
                <th>Tulis</th>
                <th>Prak</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div style="margin-top: 15px; font-size: 9px; border: 1px solid #ccc; padding: 6px; background-color: #fafafa;">
            <strong>Daftar Tujuan Pembelajaran (TP) PJOK yang Dinilai:</strong><br/>
            - TP 1: ${tp1Desc}<br/>
            - TP 2: ${tp2Desc}<br/>
            - TP 3: ${tp3Desc}<br/>
            - TP 4: ${tp4Desc}
          </div>

          <table style="width: 100%; border: none; margin-top: 40px;">
            <tr style="border: none;">
              <td style="border: none; width: 50%; text-align: center; vertical-align: top;">
                <p>Mengetahui,</p>
                <p><strong>Kepala Sekolah</strong></p>
                <br/><br/><br/>
                <p><u><strong>${headmasterName}</strong></u></p>
                <p style="font-size: 9px;">NIP. ${headmasterNip}</p>
              </td>
              <td style="border: none; width: 50%; text-align: center; vertical-align: top;">
                <p>Sadar, ${new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</p>
                <p><strong>Guru PJOK</strong></p>
                <br/><br/><br/>
                <p><u><strong>${teacherName}</strong></u></p>
                <p style="font-size: 9px;">NIP. ${teacherNip}</p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Rekap_Nilai_PJOK_Rombel_${gradesRombel}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // PDF Export Layout Generator
  const handlePrintPDF = (record: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Mohon izinkan pop-up untuk mencetak PDF laporan.");
      return;
    }

    const { date, rombel, students: recStudents } = record;
    const formattedDate = new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const rowsHtml = recStudents.map((s: any, idx: number) => {
      const studentObj = students.find(std => std.id === s.studentId);
      const genderSymbol = studentObj?.gender || "L";
      const statusLabel = s.status === "H" ? "Hadir" : s.status === "S" ? "Sakit" : s.status === "I" ? "Izin" : "Alfa";
      const statusColor = s.status === "H" ? "color: #059669; font-weight: bold;" : s.status === "S" ? "color: #d97706; font-weight: bold;" : s.status === "I" ? "color: #2563eb; font-weight: bold;" : "color: #dc2626; font-weight: bold;";
      const studentName = studentObj?.name || s.studentName || s.name || "Siswa";
      
      return `
        <tr>
          <td style="text-align: center; border: 1px solid #000; padding: 6px;">${idx + 1}</td>
          <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">${studentName}</td>
          <td style="text-align: center; border: 1px solid #000; padding: 6px;">${genderSymbol}</td>
          <td style="text-align: center; border: 1px solid #000; padding: 6px; ${statusColor}">${statusLabel}</td>
          <td style="border: 1px solid #000; padding: 6px;">${s.notes || "-"}</td>
        </tr>
      `;
    }).join("");

    const hadirCount = recStudents.filter((s: any) => s.status === "H").length;
    const sakitCount = recStudents.filter((s: any) => s.status === "S").length;
    const izinCount = recStudents.filter((s: any) => s.status === "I").length;
    const alfaCount = recStudents.filter((s: any) => s.status === "A").length;

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Absensi Rombel ${rombel} - ${date}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; padding: 30px; color: #000; line-height: 1.3; }
            .kop-container { border-bottom: 4px double #000; padding-bottom: 8px; margin-bottom: 15px; text-align: center; }
            .kop-text h1 { font-size: 15px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
            .kop-text h2 { font-size: 17px; margin: 2px 0; text-transform: uppercase; font-weight: bold; }
            .kop-text h3 { font-size: 19px; margin: 2px 0; text-transform: uppercase; font-weight: bold; }
            .kop-text p { font-size: 11px; margin: 2px 0; font-style: italic; }
            .report-title { text-align: center; font-size: 15px; font-weight: bold; text-decoration: underline; text-transform: uppercase; margin-top: 15px; margin-bottom: 15px; }
            .meta-table { width: 100%; margin-bottom: 15px; font-size: 12px; }
            .meta-table td { padding: 3px 0; border: none; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 12px; }
            .data-table th, .data-table td { border: 1px solid #000; padding: 6px; text-align: left; }
            .data-table th { background-color: #f3f4f6; text-align: center; text-transform: uppercase; font-size: 10px; font-weight: bold; }
            .summary-box { margin-top: 10px; font-size: 11px; border: 1px solid #000; padding: 6px 10px; display: inline-block; background-color: #fcfcfc; }
            .signature-container { margin-top: 40px; width: 100%; display: flex; justify-content: space-between; font-size: 12px; page-break-inside: avoid; }
            .signature-col { width: 230px; text-align: center; }
            .signature-space { height: 60px; }
            @media print {
              body { padding: 0; }
              @page { margin: 1.2cm; size: 215mm 330mm; }
            }
          </style>
        </head>
        <body>
          <div class="kop-container">
            <div class="kop-text">
              <h1>Pemerintah Kabupaten / Kota Sadar</h1>
              <h2>Dinas Pendidikan dan Kebudayaan</h2>
              <h3>${schoolName}</h3>
              <p>${schoolAddress}</p>
            </div>
          </div>
          
          <div class="report-title">Laporan Kehadiran Siswa (PJOK)</div>
          
          <table class="meta-table">
            <tr>
              <td style="width: 15%;"><strong>Kelas / Rombel</strong></td>
              <td style="width: 35%;">: ${rombel}</td>
              <td style="width: 15%;"><strong>Mata Pelajaran</strong></td>
              <td style="width: 35%;">: Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)</td>
            </tr>
            <tr>
              <td><strong>Hari, Tanggal</strong></td>
              <td>: ${formattedDate}</td>
              <td><strong>Semester</strong></td>
              <td>: 1 (Satu) / Ganjil</td>
            </tr>
            <tr>
              <td><strong>Tahun Ajaran</strong></td>
              <td>: 2026/2027</td>
              <td><strong>Status Pengisian</strong></td>
              <td>: Selesai (Diverifikasi)</td>
            </tr>
          </table>

          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 6%;">No</th>
                <th style="width: 44%;">Nama Lengkap Siswa</th>
                <th style="width: 10%;">L/P</th>
                <th style="width: 15%;">Status</th>
                <th style="width: 25%;">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div style="margin-top: 10px;">
            <div class="summary-box">
              <strong>Rekapitulasi Kehadiran:</strong><br/>
              Hadir: ${hadirCount} siswa | Sakit: ${sakitCount} siswa | Izin: ${izinCount} siswa | Alfa: ${alfaCount} siswa (Total: ${recStudents.length} siswa)
            </div>
          </div>

          <div class="signature-container">
            <div class="signature-col">
              <p>Mengetahui,</p>
              <p style="font-weight: bold; margin-top: 3px;">Kepala Sekolah</p>
              <div class="signature-space"></div>
              <p style="font-weight: bold; text-decoration: underline;">${headmasterName}</p>
              <p style="font-size: 10px; color: #333;">NIP. ${headmasterNip}</p>
            </div>
            <div class="signature-col">
              <p>Sadar, ${new Date(date).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</p>
              <p style="font-weight: bold; margin-top: 3px;">Guru PJOK</p>
              <div class="signature-space"></div>
              <p style="font-weight: bold; text-decoration: underline;">${teacherName}</p>
              <p style="font-size: 10px; color: #333;">NIP. ${teacherNip}</p>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // MS Word Export Layout Generator (downloads standard Word-openable HTML structure with table)
  const handlePrintWord = (record: any) => {
    const { date, rombel, students: recStudents } = record;
    const formattedDate = new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const rowsHtml = recStudents.map((s: any, idx: number) => {
      const studentObj = students.find(std => std.id === s.studentId);
      const genderSymbol = studentObj?.gender || "L";
      const statusLabel = s.status === "H" ? "Hadir" : s.status === "S" ? "Sakit" : s.status === "I" ? "Izin" : "Alfa";
      const studentName = studentObj?.name || s.studentName || s.name || "Siswa";
      
      return `
        <tr>
          <td style="border: 1px solid #000000; padding: 6px; text-align: center;">${idx + 1}</td>
          <td style="border: 1px solid #000000; padding: 6px; font-weight: bold;">${studentName}</td>
          <td style="border: 1px solid #000000; padding: 6px; text-align: center;">${genderSymbol}</td>
          <td style="border: 1px solid #000000; padding: 6px; text-align: center; font-weight: bold;">${statusLabel}</td>
          <td style="border: 1px solid #000000; padding: 6px;">${s.notes || "-"}</td>
        </tr>
      `;
    }).join("");

    const hadirCount = recStudents.filter((s: any) => s.status === "H").length;
    const sakitCount = recStudents.filter((s: any) => s.status === "S").length;
    const izinCount = recStudents.filter((s: any) => s.status === "I").length;
    const alfaCount = recStudents.filter((s: any) => s.status === "A").length;

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <title>Laporan Absensi</title>
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
            body { font-family: 'Times New Roman', serif; }
            table { border-collapse: collapse; width: 100%; }
            th { border: 1px solid #000000; padding: 8px; background-color: #f3f3f3; font-weight: bold; text-align: center; }
            td { border: 1px solid #000000; padding: 6px; }
          </style>
        </head>
        <body>
          <div style="text-align: center; border-bottom: 3px double #000000; padding-bottom: 8px; margin-bottom: 20px;">
            <div style="font-size: 14px; text-transform: uppercase;">Pemerintah Kabupaten / Kota Sadar</div>
            <div style="font-size: 15px; text-transform: uppercase; font-weight: bold;">Dinas Pendidikan dan Kebudayaan</div>
            <div style="font-size: 17px; text-transform: uppercase; font-weight: bold;">${schoolName}</div>
            <div style="font-size: 10px; font-style: italic;">${schoolAddress}</div>
          </div>
          
          <h2 style="text-align: center; font-size: 15px; text-decoration: underline; text-transform: uppercase; margin-bottom: 20px;">Laporan Kehadiran Siswa (PJOK)</h2>
          
          <table style="width: 100%; border: none; margin-bottom: 15px;">
            <tr style="border: none;">
              <td style="border: none; width: 20%; padding: 2px;"><strong>Kelas / Rombel</strong></td>
              <td style="border: none; width: 30%; padding: 2px;">: ${rombel}</td>
              <td style="border: none; width: 20%; padding: 2px;"><strong>Mata Pelajaran</strong></td>
              <td style="border: none; width: 30%; padding: 2px;">: PJOK</td>
            </tr>
            <tr style="border: none;">
              <td style="border: none; padding: 2px;"><strong>Hari, Tanggal</strong></td>
              <td style="border: none; padding: 2px;">: ${formattedDate}</td>
              <td style="border: none; padding: 2px;"><strong>Semester / TA</strong></td>
              <td style="border: none; padding: 2px;">: 1 / 2026/2027</td>
            </tr>
          </table>

          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr>
                <th style="border: 1px solid #000000; padding: 8px; width: 8%; background-color: #e5e7eb; text-align: center;">No</th>
                <th style="border: 1px solid #000000; padding: 8px; width: 42%; background-color: #e5e7eb;">Nama Lengkap Siswa</th>
                <th style="border: 1px solid #000000; padding: 8px; width: 10%; background-color: #e5e7eb; text-align: center;">L/P</th>
                <th style="border: 1px solid #000000; padding: 8px; width: 15%; background-color: #e5e7eb; text-align: center;">Status</th>
                <th style="border: 1px solid #000000; padding: 8px; width: 25%; background-color: #e5e7eb;">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <p style="margin-top: 15px; font-size: 12px;">
            <strong>Rekapitulasi Kehadiran:</strong> Hadir: ${hadirCount} | Sakit: ${sakitCount} | Izin: ${izinCount} | Alfa: ${alfaCount} (Total: ${recStudents.length})
          </p>

          <table style="width: 100%; border: none; margin-top: 50px;">
            <tr style="border: none;">
              <td style="border: none; width: 50%; text-align: center; vertical-align: top;">
                <p>Mengetahui,</p>
                <p><strong>Kepala Sekolah</strong></p>
                <br/><br/><br/>
                <p><u><strong>${headmasterName}</strong></u></p>
                <p style="font-size: 10px;">NIP. ${headmasterNip}</p>
              </td>
              <td style="border: none; width: 50%; text-align: center; vertical-align: top;">
                <p>Sadar, ${new Date(date).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</p>
                <p><strong>Guru PJOK</strong></p>
                <br/><br/><br/>
                <p><u><strong>${teacherName}</strong></u></p>
                <p style="font-size: 10px;">NIP. ${teacherNip}</p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_Absensi_Rombel_${rombel}_${date}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Month list constants for Monthly Recapitulation
  const MONTHS_OPTIONS = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" }
  ];

  // Daily Attendance Excel (.xlsx) Export
  const handleExportDailyAttendanceExcel = (record: any) => {
    const { date, rombel, students: recStudents } = record;
    const formattedDate = new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const aoa: any[][] = [];
    aoa.push(["LAPORAN KEHADIRAN SISWA HARIAN (PJOK)"]);
    aoa.push([schoolName.toUpperCase()]);
    aoa.push([schoolAddress]);
    aoa.push([]);
    aoa.push(["Kelas / Rombel:", `Kelas ${rombel}`, "", "Tanggal:", formattedDate]);
    aoa.push(["Mata Pelajaran:", "Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)", "", "Semester / TA:", "1 / 2026/2027"]);
    aoa.push([]);

    aoa.push(["No", "NIS/ID", "Nama Lengkap Siswa", "L/P", "Status Kehadiran", "Catatan Guru"]);

    recStudents.forEach((s: any, idx: number) => {
      const studentObj = students.find(std => std.id === s.studentId);
      const gender = studentObj?.gender || "L";
      const name = studentObj?.name || s.studentName || "Siswa";
      const statusLabel = s.status === "H" ? "Hadir (H)" : s.status === "S" ? "Sakit (S)" : s.status === "I" ? "Izin (I)" : "Alfa (A)";
      aoa.push([idx + 1, s.studentId || "-", name, gender, statusLabel, s.notes || "-"]);
    });

    const hadirCount = recStudents.filter((s: any) => s.status === "H").length;
    const sakitCount = recStudents.filter((s: any) => s.status === "S").length;
    const izinCount = recStudents.filter((s: any) => s.status === "I").length;
    const alfaCount = recStudents.filter((s: any) => s.status === "A").length;

    aoa.push([]);
    aoa.push(["REKAPITULASI:", `Hadir: ${hadirCount}`, `Sakit: ${sakitCount}`, `Izin: ${izinCount}`, `Alfa: ${alfaCount}`, `Total Siswa: ${recStudents.length}`]);
    aoa.push([]);
    aoa.push(["Mengetahui,", "", "", "", `Sadar, ${new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`]);
    aoa.push(["Kepala Sekolah,", "", "", "", "Guru PJOK,"]);
    aoa.push([]);
    aoa.push([]);
    aoa.push([headmasterName, "", "", "", teacherName]);
    aoa.push([`NIP. ${headmasterNip}`, "", "", "", `NIP. ${teacherNip}`]);

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 6 }, { wch: 14 }, { wch: 30 }, { wch: 8 }, { wch: 20 }, { wch: 25 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Absensi_${rombel}`);
    XLSX.writeFile(wb, `Laporan_Absensi_Harian_Rombel_${rombel}_${date}.xlsx`);
  };

  // Monthly Attendance Excel (.xlsx) Export
  const handleExportMonthlyAttendanceExcel = () => {
    const monthName = MONTHS_OPTIONS.find(m => m.value === monthlyRecapMonth)?.label || "Bulan";
    const daysInMonth = new Date(monthlyRecapYear, monthlyRecapMonth, 0).getDate();
    const rombelStudents = students.filter(s => s.grade === monthlyRecapRombel);
    const monthPrefix = `${monthlyRecapYear}-${String(monthlyRecapMonth).padStart(2, "0")}`;
    const monthRecords = attendanceRecords.filter(r => r.rombel === monthlyRecapRombel && r.date.startsWith(monthPrefix));

    if (rombelStudents.length === 0) {
      alert(`Tidak ada data siswa untuk Rombel ${monthlyRecapRombel}.`);
      return;
    }

    const aoa: any[][] = [];
    aoa.push(["LAPORAN REKAPITULASI KEHADIRAN SISWA BULANAN (PJOK)"]);
    aoa.push([schoolName.toUpperCase()]);
    aoa.push([schoolAddress]);
    aoa.push([]);
    aoa.push(["Kelas / Rombel:", `Kelas ${monthlyRecapRombel}`, "", "Bulan & Tahun:", `${monthName} ${monthlyRecapYear}`]);
    aoa.push(["Mata Pelajaran:", "Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)", "", "Hari Pertemuan Efektif:", `${monthRecords.length} Hari / Sesi`]);
    aoa.push(["Tahun Ajaran:", "2026/2027", "", "Semester:", "1 (Satu) / Ganjil"]);
    aoa.push([]);

    // Header Row
    const headerRow = ["No", "NIS/ID", "Nama Lengkap Siswa", "L/P"];
    for (let d = 1; d <= daysInMonth; d++) {
      headerRow.push(String(d));
    }
    headerRow.push("H", "S", "I", "A", "Total Sesi", "% Hadir");
    aoa.push(headerRow);

    // Data rows
    rombelStudents.forEach((std, idx) => {
      let hCount = 0;
      let sCount = 0;
      let iCount = 0;
      let aCount = 0;
      const dailyCols: string[] = [];

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${monthPrefix}-${String(d).padStart(2, "0")}`;
        const rec = monthRecords.find(r => r.date === dateStr);
        if (rec) {
          const studentRec = rec.students.find((s: any) => s.studentId === std.id);
          const st = studentRec ? studentRec.status : "-";
          dailyCols.push(st);
          if (st === "H") hCount++;
          else if (st === "S") sCount++;
          else if (st === "I") iCount++;
          else if (st === "A") aCount++;
        } else {
          dailyCols.push("-");
        }
      }

      const total = hCount + sCount + iCount + aCount;
      const percent = total > 0 ? `${((hCount / total) * 100).toFixed(1)}%` : "-";

      aoa.push([
        idx + 1,
        std.id,
        std.name,
        std.gender || "L",
        ...dailyCols,
        hCount,
        sCount,
        iCount,
        aCount,
        total,
        percent
      ]);
    });

    // Summary row
    aoa.push([]);
    const summaryRowH = ["", "", "TOTAL HADIR (H)", ""];
    const summaryRowS = ["", "", "TOTAL SAKIT (S)", ""];
    const summaryRowI = ["", "", "TOTAL IZIN (I)", ""];
    const summaryRowA = ["", "", "TOTAL ALFA (A)", ""];

    let grandH = 0, grandS = 0, grandI = 0, grandA = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${monthPrefix}-${String(d).padStart(2, "0")}`;
      const rec = monthRecords.find(r => r.date === dateStr);
      if (rec) {
        const dH = rec.students.filter((s: any) => s.status === "H").length;
        const dS = rec.students.filter((s: any) => s.status === "S").length;
        const dI = rec.students.filter((s: any) => s.status === "I").length;
        const dA = rec.students.filter((s: any) => s.status === "A").length;
        summaryRowH.push(String(dH));
        summaryRowS.push(String(dS));
        summaryRowI.push(String(dI));
        summaryRowA.push(String(dA));
        grandH += dH;
        grandS += dS;
        grandI += dI;
        grandA += dA;
      } else {
        summaryRowH.push("-");
        summaryRowS.push("-");
        summaryRowI.push("-");
        summaryRowA.push("-");
      }
    }
    summaryRowH.push(String(grandH), "", "", "", String(grandH), "-");
    summaryRowS.push("", String(grandS), "", "", String(grandS), "-");
    summaryRowI.push("", "", String(grandI), "", String(grandI), "-");
    summaryRowA.push("", "", "", String(grandA), String(grandA), "-");

    aoa.push(summaryRowH);
    aoa.push(summaryRowS);
    aoa.push(summaryRowI);
    aoa.push(summaryRowA);

    // Signatures
    aoa.push([]);
    aoa.push([]);
    aoa.push(["Mengetahui,", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", `Sadar, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`]);
    aoa.push(["Kepala Sekolah,", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "Guru PJOK,"]);
    aoa.push([]);
    aoa.push([]);
    aoa.push([]);
    aoa.push([headmasterName, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", teacherName]);
    aoa.push([`NIP. ${headmasterNip}`, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", `NIP. ${teacherNip}`]);

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Column widths
    const colWidths: { wch: number }[] = [
      { wch: 5 }, // No
      { wch: 12 }, // NIS
      { wch: 28 }, // Nama
      { wch: 6 }, // JK
    ];
    for (let d = 1; d <= daysInMonth; d++) {
      colWidths.push({ wch: 4 });
    }
    colWidths.push({ wch: 6 }, { wch: 6 }, { wch: 6 }, { wch: 6 }, { wch: 10 }, { wch: 10 });
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Rekap_${monthlyRecapRombel}`);
    XLSX.writeFile(wb, `Rekap_Absensi_Bulanan_${monthlyRecapRombel}_${monthName}_${monthlyRecapYear}.xlsx`);
  };

  // Monthly Attendance PDF Print
  const handlePrintMonthlyAttendancePDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Mohon izinkan pop-up untuk mencetak PDF laporan.");
      return;
    }

    const monthName = MONTHS_OPTIONS.find(m => m.value === monthlyRecapMonth)?.label || "Bulan";
    const daysInMonth = new Date(monthlyRecapYear, monthlyRecapMonth, 0).getDate();
    const rombelStudents = students.filter(s => s.grade === monthlyRecapRombel);
    const monthPrefix = `${monthlyRecapYear}-${String(monthlyRecapMonth).padStart(2, "0")}`;
    const monthRecords = attendanceRecords.filter(r => r.rombel === monthlyRecapRombel && r.date.startsWith(monthPrefix));

    // Days th headers
    let daysHeaderHtml = "";
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${monthPrefix}-${String(d).padStart(2, "0")}`;
      const hasSession = monthRecords.some(r => r.date === dateStr);
      daysHeaderHtml += `<th style="width: 20px; font-size: 8px; padding: 3px 1px; ${hasSession ? 'background-color: #d1fae5; color: #065f46; font-weight: bold;' : ''}">${d}</th>`;
    }

    // Rows
    let totalAllH = 0, totalAllS = 0, totalAllI = 0, totalAllA = 0;
    const rowsHtml = rombelStudents.map((std, idx) => {
      let hCount = 0;
      let sCount = 0;
      let iCount = 0;
      let aCount = 0;
      let dailyCells = "";

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${monthPrefix}-${String(d).padStart(2, "0")}`;
        const rec = monthRecords.find(r => r.date === dateStr);
        if (rec) {
          const sRec = rec.students.find((s: any) => s.studentId === std.id);
          const st = sRec ? sRec.status : "-";
          let cellStyle = "text-align: center; font-size: 8px; padding: 3px 1px;";
          if (st === "H") {
            hCount++;
            cellStyle += " background-color: #ecfdf5; color: #047857; font-weight: bold;";
          } else if (st === "S") {
            sCount++;
            cellStyle += " background-color: #fffbeb; color: #b45309; font-weight: bold;";
          } else if (st === "I") {
            iCount++;
            cellStyle += " background-color: #eff6ff; color: #1d4ed8; font-weight: bold;";
          } else if (st === "A") {
            aCount++;
            cellStyle += " background-color: #fef2f2; color: #b91c1c; font-weight: bold;";
          }
          dailyCells += `<td style="${cellStyle}">${st}</td>`;
        } else {
          dailyCells += `<td style="text-align: center; font-size: 8px; color: #cbd5e1; padding: 3px 1px;">-</td>`;
        }
      }

      totalAllH += hCount;
      totalAllS += sCount;
      totalAllI += iCount;
      totalAllA += aCount;

      const total = hCount + sCount + iCount + aCount;
      const percent = total > 0 ? `${((hCount / total) * 100).toFixed(0)}%` : "-";

      return `
        <tr>
          <td style="text-align: center; font-size: 9px; padding: 4px;">${idx + 1}</td>
          <td style="font-size: 9px; padding: 4px 6px; white-space: nowrap; font-weight: 600;">${std.name}</td>
          <td style="text-align: center; font-size: 9px; padding: 4px;">${std.gender || "L"}</td>
          ${dailyCells}
          <td style="text-align: center; font-size: 9px; font-weight: bold; background-color: #ecfdf5; color: #047857;">${hCount}</td>
          <td style="text-align: center; font-size: 9px; font-weight: bold; background-color: #fffbeb; color: #b45309;">${sCount}</td>
          <td style="text-align: center; font-size: 9px; font-weight: bold; background-color: #eff6ff; color: #1d4ed8;">${iCount}</td>
          <td style="text-align: center; font-size: 9px; font-weight: bold; background-color: #fef2f2; color: #b91c1c;">${aCount}</td>
          <td style="text-align: center; font-size: 9px; font-weight: bold; background-color: #f8fafc;">${percent}</td>
        </tr>
      `;
    }).join("");

    const grandTotalMeetings = totalAllH + totalAllS + totalAllI + totalAllA;
    const avgAttendancePercent = grandTotalMeetings > 0 ? ((totalAllH / grandTotalMeetings) * 100).toFixed(1) : "100.0";

    printWindow.document.write(`
      <html>
        <head>
          <title>Rekapitulasi Absensi Bulanan - Kelas ${monthlyRecapRombel} (${monthName} ${monthlyRecapYear})</title>
          <style>
            @page { size: 330mm 215mm; margin: 0.8cm; }
            body { font-family: 'Times New Roman', Times, serif; color: #000; line-height: 1.2; margin: 0; padding: 15px; }
            .kop-container { border-bottom: 3px double #000; padding-bottom: 6px; margin-bottom: 12px; text-align: center; }
            .kop-text h1 { font-size: 13px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
            .kop-text h2 { font-size: 14px; margin: 2px 0; text-transform: uppercase; font-weight: bold; }
            .kop-text h3 { font-size: 16px; margin: 2px 0; text-transform: uppercase; font-weight: bold; }
            .kop-text p { font-size: 10px; margin: 1px 0; font-style: italic; }
            .report-title { text-align: center; font-size: 13px; font-weight: bold; text-decoration: underline; text-transform: uppercase; margin: 8px 0; }
            .meta-table { width: 100%; margin-bottom: 8px; font-size: 11px; }
            .meta-table td { padding: 2px 0; border: none; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 9px; }
            .data-table th, .data-table td { border: 1px solid #333; }
            .data-table th { background-color: #f1f5f9; text-align: center; text-transform: uppercase; font-weight: bold; padding: 4px 2px; }
            .summary-box { margin-top: 10px; font-size: 10px; border: 1px solid #000; padding: 6px 10px; display: inline-block; background-color: #fafafa; }
            .signature-container { margin-top: 25px; width: 100%; display: flex; justify-content: space-between; font-size: 11px; page-break-inside: avoid; }
            .signature-col { width: 230px; text-align: center; }
            .signature-space { height: 45px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="kop-container">
            <div class="kop-text">
              <h1>Pemerintah Kabupaten / Kota Sadar</h1>
              <h2>Dinas Pendidikan dan Kebudayaan</h2>
              <h3>${schoolName}</h3>
              <p>${schoolAddress}</p>
            </div>
          </div>

          <div class="report-title">Rekapitulasi Kehadiran Siswa Bulanan (PJOK)</div>

          <table class="meta-table">
            <tr>
              <td style="width: 15%;"><strong>Kelas / Rombel</strong></td>
              <td style="width: 35%;">: Kelas ${monthlyRecapRombel}</td>
              <td style="width: 15%;"><strong>Mata Pelajaran</strong></td>
              <td style="width: 35%;">: Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)</td>
            </tr>
            <tr>
              <td><strong>Bulan & Tahun</strong></td>
              <td>: ${monthName} ${monthlyRecapYear}</td>
              <td><strong>Total Sesi Efektif</strong></td>
              <td>: ${monthRecords.length} Hari Pertemuan</td>
            </tr>
            <tr>
              <td><strong>Tahun Ajaran / Sem.</strong></td>
              <td>: 2026/2027 / Ganjil</td>
              <td><strong>Rata-rata Kehadiran</strong></td>
              <td>: <strong>${avgAttendancePercent}%</strong></td>
            </tr>
          </table>

          <table class="data-table">
            <thead>
              <tr>
                <th rowspan="2" style="width: 25px;">No</th>
                <th rowspan="2" style="width: 160px;">Nama Lengkap Siswa</th>
                <th rowspan="2" style="width: 25px;">L/P</th>
                <th colspan="${daysInMonth}">Tanggal Kegiatan Bulan ${monthName}</th>
                <th colspan="4">Akumulasi</th>
                <th rowspan="2" style="width: 45px;">% Hadir</th>
              </tr>
              <tr>
                ${daysHeaderHtml}
                <th style="width: 22px; background-color: #ecfdf5; color: #047857;">H</th>
                <th style="width: 22px; background-color: #fffbeb; color: #b45309;">S</th>
                <th style="width: 22px; background-color: #eff6ff; color: #1d4ed8;">I</th>
                <th style="width: 22px; background-color: #fef2f2; color: #b91c1c;">A</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div class="summary-box">
              <strong>Keterangan Status:</strong> H = Hadir (${totalAllH}) | S = Sakit (${totalAllS}) | I = Izin (${totalAllI}) | A = Alfa/Tanpa Keterangan (${totalAllA}) | <strong>Rata-rata Kehadiran: ${avgAttendancePercent}%</strong>
            </div>
            <div style="font-size: 9px; color: #666; font-style: italic;">
              * Dicetak otomatis melalui Sistem Absensi Taktis SADAR PJOK
            </div>
          </div>

          <div class="signature-container">
            <div class="signature-col">
              <p>Mengetahui,</p>
              <p style="font-weight: bold; margin-top: 2px;">Kepala Sekolah</p>
              <div class="signature-space"></div>
              <p style="font-weight: bold; text-decoration: underline;">${headmasterName}</p>
              <p style="font-size: 9px; color: #333;">NIP. ${headmasterNip}</p>
            </div>
            <div class="signature-col">
              <p>Sadar, ${new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</p>
              <p style="font-weight: bold; margin-top: 2px;">Guru PJOK</p>
              <div class="signature-space"></div>
              <p style="font-weight: bold; text-decoration: underline;">${teacherName}</p>
              <p style="font-size: 9px; color: #333;">NIP. ${teacherNip}</p>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Computed Dashboard Metrics
  const totalSiswa = students.length;
  const genderLaki = students.filter((s) => s.gender === "L").length;
  const genderPerempuan = students.filter((s) => s.gender === "P").length;

  // Average BMI calculation
  const bmiStats = students.map((s) => calculateBMI(s.weight, s.height));
  const normalBmiCount = bmiStats.filter((b) => b.category === "Normal (Ideal)").length;
  const overweightBmiCount = bmiStats.filter((b) => b.category === "Gemuk (Kelebihan BB)" || b.category === "Obesitas").length;
  const thinBmiCount = bmiStats.filter((b) => b.category === "Kurus" || b.category === "Sangat Kurus").length;

  // Average Fitness Scores
  const studentFitnessStats = students.map((s) => calculateFitnessScore(s));
  const avgFitnessScore =
    studentFitnessStats.length > 0
      ? Math.round(studentFitnessStats.reduce((sum, current) => sum + current.score, 0) / studentFitnessStats.length)
      : 0;

  const fitnessCategoryDistribution = {
    prima: studentFitnessStats.filter((f) => f.rating === "Sangat Baik (Prima)").length,
    baik: studentFitnessStats.filter((f) => f.rating === "Baik").length,
    sedang: studentFitnessStats.filter((f) => f.rating === "Sedang").length,
    kurang: studentFitnessStats.filter((f) => f.rating === "Kurang" || f.rating === "Kurang Sekali").length
  };

  // Inventory Totals
  const totalItems = inventory.reduce((sum, current) => sum + current.total, 0);
  const goodItems = inventory.reduce((sum, current) => sum + current.goodCondition, 0);
  const damagedItems = inventory.reduce((sum, current) => sum + current.damagedCondition, 0);

  // Filtered Students List
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const cleanFilter = classFilter.replace(/^Kelas\s+/i, "").trim();
    const matchesClass =
      classFilter === "Semua" ||
      student.grade === classFilter ||
      student.grade === cleanFilter ||
      student.grade.startsWith(cleanFilter + "-");
    return matchesSearch && matchesClass;
  });

  // Filtered Inventory List
  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(inventorySearchQuery.toLowerCase())
  );

  // Dynamic percentage of good inventory items
  const goodInventoryPercent = totalItems > 0 ? Math.round((goodItems / totalItems) * 100) : 100;

  if (!isAdminPasswordSet) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-emerald-50/30 font-sans" id="app-loading-screen">
        <div className="flex flex-col items-center space-y-4 text-center">
          <Activity className="h-12 w-12 text-emerald-600 animate-spin" />
          <div className="space-y-1">
            <h3 className="text-slate-800 font-extrabold text-lg tracking-tight">SADAR <span className="text-emerald-600">PJOK</span></h3>
            <p className="text-xs text-slate-400 font-semibold">Memuat data administratif guru...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-emerald-50/30 p-4 font-sans relative overflow-hidden" id="login-container">
        {/* Decorative background grid and blurs */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md bg-white border border-slate-200/60 rounded-3xl p-8 shadow-xl shadow-emerald-950/5 space-y-6 relative z-10" 
          id="login-card"
        >
          <div className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-emerald-600 to-emerald-500 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-950/10">
              <Activity className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">SADAR <span className="text-emerald-600">PJOK</span></h2>
            <p className="text-xs text-slate-400 font-semibold">Sistem Administrasi Guru PJOK Sekolah Dasar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" id="login-form">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Username</label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold text-slate-800 bg-slate-50 focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-400 text-sm transition-all"
                placeholder="Masukkan username (e.g. admin)"
                id="login-username"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
              <input
                type="password"
                required
                value={loginPasswordInput}
                onChange={(e) => setLoginPasswordInput(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold text-slate-800 bg-slate-50 focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-400 text-sm transition-all"
                placeholder="Masukkan password"
                id="login-password"
              />
            </div>

            {loginError && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3.5 bg-red-950/40 text-red-400 border border-red-900/50 rounded-xl text-xs flex items-center gap-2.5 font-semibold" 
                id="login-error-alert"
              >
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                <span>{loginError}</span>
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl transition-all shadow-md shadow-emerald-950/10 cursor-pointer text-xs uppercase tracking-wider border border-emerald-500 active:scale-[0.98]"
              id="login-submit-btn"
            >
              Masuk ke Dashboard
            </button>
          </form>

          <div className="text-center pt-4 border-t border-slate-100 text-[10px] text-slate-500 font-semibold">
            Username bawaan: <strong className="text-slate-700">admin</strong> &nbsp;|&nbsp; Password: <strong className="text-slate-700">admin123</strong>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans bg-slate-50 text-slate-900 overflow-x-hidden" id="sadar-app-root">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-100 text-slate-800 flex flex-col z-20 shrink-0" id="sadar-sidebar">
        {/* App Logo and Branding */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-xl text-white">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-800">SADAR <span className="text-emerald-600">SD</span></h1>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-semibold">Sistem Admin PJOK</p>
        </div>

        {/* Current system calendar status */}
        <div className="px-6 py-3 bg-emerald-50/50 border-b border-slate-100 flex items-center gap-2">
          <Clock className="h-3 w-3 text-emerald-600" />
          <span className="text-[11px] text-slate-600 font-mono font-semibold">Jumat, 10 Juli 2026</span>
        </div>

        {/* Menu Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto" id="sadar-nav-list">
          <button
            id="nav-btn-overview"
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "overview"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20 font-semibold"
                : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            <Layers className="h-4.5 w-4.5 opacity-85" />
            <span>Beranda Utama</span>
          </button>

          <button
            id="nav-btn-students"
            onClick={() => setActiveTab("students")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "students"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20 font-semibold"
                : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            <Users className="h-4.5 w-4.5 opacity-85 text-indigo-400" />
            <span>Kebugaran & BMI Siswa</span>
          </button>

          <button
            id="nav-btn-rombel"
            onClick={() => setActiveTab("rombel")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "rombel"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20 font-semibold"
                : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            <Layers className="h-4.5 w-4.5 opacity-85 text-emerald-400" />
            <span>Data Siswa & Input Rombel</span>
          </button>

          <button
            id="nav-btn-attendance"
            onClick={() => setActiveTab("attendance")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "attendance"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20 font-semibold"
                : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            <ClipboardCheck className="h-4.5 w-4.5 opacity-85 text-orange-400" />
            <span>Absensi Siswa Taktis</span>
          </button>

          <button
            id="nav-btn-grades"
            onClick={() => setActiveTab("grades")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "grades"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20 font-semibold"
                : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            <Award className="h-4.5 w-4.5 text-amber-400 opacity-85" />
            <span>Rekap Nilai Siswa</span>
          </button>

          <button
            id="nav-btn-sibi"
            onClick={() => setActiveTab("sibi")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "sibi"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20 font-semibold"
                : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            <BookOpen className="h-4.5 w-4.5 text-emerald-500 opacity-90" />
            <span>Buku Panduan PJOK (SIBI)</span>
          </button>

          <button
            id="nav-btn-rpp"
            onClick={() => setActiveTab("rpp")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "rpp"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20 font-semibold"
                : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            <Sparkles className="h-4.5 w-4.5 text-amber-400 opacity-85" />
            <span>Modul Ajar AI (RPP)</span>
          </button>

          <button
            id="nav-btn-infographics"
            onClick={() => setActiveTab("infographics")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "infographics"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20 font-semibold"
                : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            <Sparkles className="h-4.5 w-4.5 text-pink-400 opacity-85" />
            <span>Infografis 3D AI</span>
          </button>

          <button
            id="nav-btn-materi"
            onClick={() => setActiveTab("materi")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "materi"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20 font-semibold"
                : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            <BookOpen className="h-4.5 w-4.5 text-cyan-400 opacity-85" />
            <span>Materi Ajar AI</span>
          </button>

          <button
            id="nav-btn-slides"
            onClick={() => setActiveTab("slides")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "slides"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20 font-semibold"
                : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            <Presentation className="h-4.5 w-4.5 text-emerald-400 opacity-85" />
            <span>Slide Presentasi Siswa</span>
          </button>

          <button
            id="nav-btn-lkpd"
            onClick={() => setActiveTab("lkpd")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "lkpd"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20 font-semibold"
                : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            <FileText className="h-4.5 w-4.5 text-amber-400 opacity-85" />
            <span>Penyusunan LKPD AI</span>
          </button>

          <button
            id="nav-btn-soal"
            onClick={() => setActiveTab("soal")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "soal"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20 font-semibold"
                : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            <Table className="h-4.5 w-4.5 text-emerald-500 opacity-85" />
            <span>Generate Soal Praktik AI</span>
          </button>

          <button
            id="nav-btn-inventory"
            onClick={() => setActiveTab("inventory")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "inventory"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20 font-semibold"
                : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            <Package className="h-4.5 w-4.5 opacity-85" />
            <span>Inventaris Alat PJOK</span>
          </button>

          <button
            id="nav-btn-schedule"
            onClick={() => setActiveTab("schedule")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "schedule"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20 font-semibold"
                : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            <Calendar className="h-4.5 w-4.5 opacity-85" />
            <span>Jadwal & Agenda Mengajar</span>
          </button>

          <button
            id="nav-btn-database"
            onClick={() => setActiveTab("database")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "database"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20 font-semibold"
                : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            <Database className="h-4.5 w-4.5 text-emerald-400 opacity-85 animate-pulse" />
            <span>Koneksi Database Cloud</span>
          </button>
        </nav>

        {/* Dynamic Inventory Status Progress Card from Design Mockup */}
        <div className="mt-auto p-4 mx-4 mb-6 bg-slate-50 rounded-xl border border-slate-200/60">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Unit Inventory</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-lg font-extrabold text-slate-800">{goodInventoryPercent}%</span>
            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${goodInventoryPercent}%` }}></div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {goodInventoryPercent >= 80 ? "Semua alat dalam kondisi baik" : `${goodItems} alat dari ${totalItems} dalam kondisi baik`}
          </p>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden" id="sadar-main">
        {/* Header toolbar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shadow-sm z-10 shrink-0" id="sadar-header">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-bold tracking-wider uppercase">SADAR SD</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-semibold text-slate-600 text-sm">
              {activeTab === "overview" && "Ringkasan Premium"}
              {activeTab === "students" && "Penilaian Kebugaran"}
              {activeTab === "rombel" && "Data Siswa & Input Rombel"}
              {activeTab === "attendance" && "Absensi Siswa Taktis"}
              {activeTab === "grades" && "Rekap Nilai Siswa"}
              {activeTab === "rpp" && "Asisten Modul Ajar"}
              {activeTab === "inventory" && "Inventaris Alat"}
              {activeTab === "schedule" && "Agenda Pelajaran"}
              {activeTab === "infographics" && "Rancangan Infografis 3D AI"}
              {activeTab === "materi" && "Asisten Materi Ajar AI"}
              {activeTab === "slides" && "Slide Presentasi Siswa AI"}
              {activeTab === "lkpd" && "Penyusunan Lembar Kerja Siswa (LKPD) AI"}
              {activeTab === "soal" && "Generator Soal Praktik & Kisi-Kisi Asesmen Sumatif AI"}
              {activeTab === "sibi" && "Buku Panduan Guru PJOK Resmi SIBI (Kemendikbudristek)"}
              {activeTab === "database" && "Koneksi Database Cloud (Supabase - Absensi2027)"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800">Pak Guru San</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Administrator PJOK</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-emerald-700 text-xs uppercase shadow-inner">
              GS
            </div>

            <div className="flex items-center gap-1 border-l border-slate-100 pl-3">
              <button
                onClick={() => {
                  setChangePasswordError(null);
                  setChangePasswordSuccess(null);
                  setShowChangePasswordModal(true);
                }}
                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                title="Ubah Password"
                id="header-change-password-btn"
              >
                <Lock className="h-4 w-4" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                title="Keluar Aplikasi"
                id="header-logout-btn"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Tabs Wrapper */}
        <div className="p-8 flex-1 max-w-7xl w-full mx-auto" id="sadar-tab-container">
          <F4ExportBar
            menuLabel={
              activeTab === "overview"
                ? "Ringkasan Eksekutif & Kebugaran"
                : activeTab === "students"
                ? "Penilaian Kebugaran Jasmani (TKJI)"
                : activeTab === "rombel"
                ? "Data Induk Siswa & Rombel"
                : activeTab === "attendance"
                ? `Absensi Siswa Taktis (${
                    attendanceSubTab === "daily"
                      ? "Harian"
                      : attendanceSubTab === "weekly"
                      ? "Rekap Mingguan 1 Bulan"
                      : attendanceSubTab === "semester"
                      ? "Rekap Satu Semester"
                      : "Rekap Bulanan"
                  })`
                : activeTab === "grades"
                ? "Rekap Nilai Akhir Semester"
                : activeTab === "rpp"
                ? "Modul Ajar (RPP) Standar SIBI"
                : activeTab === "infographics"
                ? "Rancangan Infografis 3D AI"
                : activeTab === "materi"
                ? "Materi Ajar PJOK Standar SIBI"
                : activeTab === "slides"
                ? "Slide Presentasi Siswa AI"
                : activeTab === "lkpd"
                ? "Lembar Kerja Peserta Didik (LKPD)"
                : activeTab === "soal"
                ? "Kisi-Kisi, Soal Praktik & Format Penilaian"
                : activeTab === "sibi"
                ? `Silabus Buku Panduan Guru PJOK SIBI (Kelas ${rppGrade})`
                : activeTab === "inventory"
                ? "Inventaris Sarana & Alat Olahraga"
                : activeTab === "schedule"
                ? "Agenda & Jadwal Mengajar PJOK"
                : "Laporan Status Database Cloud"
            }
            defaultOrientation={
              activeTab === "students" ||
              activeTab === "grades" ||
              activeTab === "soal" ||
              activeTab === "sibi" ||
              activeTab === "slides" ||
              (activeTab === "attendance" && attendanceSubTab !== "daily")
                ? "landscape"
                : "portrait"
            }
            onExport={(format, orientation) =>
              exportActiveMenuAsF4(
                {
                  activeTab,
                  schoolInfo: {
                    schoolName,
                    schoolAddress,
                    headmasterName,
                    headmasterNip,
                    teacherName,
                    teacherNip,
                  },
                  students,
                  classFilter,
                  selectedRombel,
                  customRombels,
                  inventory,
                  schedule,
                  savedPlans,
                  currentRpp,
                  rppGrade,
                  rppMaterial,
                  rppDuration,
                  rppModel,
                  generatedInfographic,
                  infographicTopic,
                  infographicMaterial,
                  generatedMateri,
                  materiMapel,
                  materiKelas,
                  materiFase,
                  materiTopik,
                  generatedSlides,
                  slidesMateriPokok,
                  slidesKelas,
                  generatedLkpd,
                  lkpdTopik,
                  lkpdKelas,
                  lkpdSintaks,
                  generatedSoal,
                  soalKelas,
                  soalFase,
                  soalJenisAsesmen,
                  soalPenilaianRombel,
                  soalStudentScores,
                  attendanceSubTab,
                  attendanceDate,
                  attendanceRombel,
                  attendanceList,
                  attendanceRecords,
                  monthlyRecapMonth,
                  monthlyRecapYear,
                  monthlyRecapRombel,
                  semesterRecapType,
                  gradesRombel,
                  studentGrades,
                  tp1Desc,
                  tp2Desc,
                  tp3Desc,
                  tp4Desc,
                },
                format,
                orientation
              )
            }
          />
          <AnimatePresence mode="wait">
            
            {/* TAB 1: OVERVIEW / DASHBOARD */}
            {activeTab === "overview" && (
              <motion.div
                key="tab-overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
                id="panel-overview"
              >
                {/* Visual Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800" id="overview-banner">
                  <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl"></div>
                  <div className="relative z-10 max-w-2xl space-y-3.5">
                    <span className="bg-emerald-500/20 text-emerald-300 font-bold tracking-wider text-[10px] px-3 py-1 rounded-full uppercase border border-emerald-500/30">
                      Sistem Administrasi PJOK Premium
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      Selamat Datang di SADAR PJOK, Guru San!
                    </h3>
                    <p className="text-sm text-slate-300 font-medium leading-relaxed">
                      Kelola kesehatan jasmani siswa, hitung BMI otomatis, rancang modul pembelajaran kreatif berbasis Kurikulum Merdeka dibantu AI, dan pantau ketersediaan sarana prasarana penunjang gerak olahraga di sekolah dasar.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-3">
                      <button
                        onClick={() => setActiveTab("rpp")}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/20 cursor-pointer border border-emerald-500"
                        id="quick-rpp-btn"
                      >
                        <Sparkles className="h-4 w-4" />
                        Tulis Modul Ajar AI (RPP)
                      </button>
                      <button
                        onClick={() => setActiveTab("rombel")}
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                        id="quick-students-btn"
                      >
                        Kelola Data Siswa & Rombel
                      </button>
                    </div>
                  </div>
                </div>

                {/* Main statistics cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="stats-grid">
                  
                  {/* Card 1: Total Siswa */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-32 hover:border-emerald-200 transition-colors duration-300" id="stat-siswa-card">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Siswa</span>
                    <div className="flex items-end justify-between">
                      <div className="space-y-0.5">
                        <span className="text-3xl font-black text-slate-900 font-mono leading-none">{totalSiswa}</span>
                        <p className="text-[10px] font-bold text-slate-400">
                          {genderLaki} L / {genderPerempuan} P
                        </p>
                      </div>
                      <span className="text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 uppercase tracking-wider">Aktif</span>
                    </div>
                  </div>

                  {/* Card 2: Average Fitness Index */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-32 hover:border-emerald-200 transition-colors duration-300" id="stat-fitness-card">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sesi Aktif</span>
                    <div className="flex items-end justify-between">
                      <div className="space-y-0.5">
                        <span className="text-3xl font-black text-slate-900 font-mono leading-none">{avgFitnessScore}</span>
                        <p className="text-[10px] font-bold text-slate-400">Rata-rata TKJI</p>
                      </div>
                      <span className="text-emerald-500 text-xs font-bold font-semibold">Minggu ini</span>
                    </div>
                  </div>

                  {/* Card 3: BMI Stat */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-32 hover:border-emerald-200 transition-colors duration-300" id="stat-bmi-card">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rata-rata BMI</span>
                    <div className="flex items-end justify-between">
                      <div className="space-y-0.5">
                        <span className="text-3xl font-black text-slate-900 font-mono leading-none">
                          {Math.round((normalBmiCount / (totalSiswa || 1)) * 100)}%
                        </span>
                        <p className="text-[10px] font-bold text-slate-400">Status Ideal</p>
                      </div>
                      <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-md border border-green-100 uppercase">Normal</span>
                    </div>
                  </div>

                  {/* Card 4: Inventory count */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-32 hover:border-emerald-200 transition-colors duration-300" id="stat-inventaris-card">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stok Peralatan</span>
                    <div className="flex items-end justify-between">
                      <div className="space-y-0.5">
                        <span className="text-3xl font-black text-slate-900 font-mono leading-none">{totalItems}</span>
                        <p className="text-[10px] font-bold text-slate-400">
                          {goodItems} Baik / {damagedItems} Rusak
                        </p>
                      </div>
                      <span className={`${damagedItems > 0 ? "text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100" : "text-green-500 font-semibold"} text-[10px]`}>
                        {damagedItems} Perlu Cek
                      </span>
                    </div>
                  </div>

                </div>

                {/* Dashboard layout blocks: Charts & Schedules */}
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="dashboard-grid-row">
                   
                   {/* Left Box: Student Physical Assessment Summary (Custom SVG Visuals) */}
                   <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2" id="physical-summary-box">
                     <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                       <div>
                         <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">Visualisasi Hasil Penilaian Jasmani Siswa</h4>
                         <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Korelasi distribusi Kebugaran (TKJI) dan Index Massa Tubuh (BMI)</p>
                       </div>
                       <button onClick={() => setActiveTab("rombel")} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
                         Detail Siswa <ChevronRight className="h-3.5 w-3.5" />
                       </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                       {/* Metric 1: BMI Distribution Block */}
                       <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                         <h5 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                           <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full"></span>
                           Distribusi Indeks Massa Tubuh (BMI)
                         </h5>
                         
                         <div className="space-y-3">
                           {/* Ideal */}
                           <div className="space-y-1.5">
                             <div className="flex justify-between text-xs font-semibold">
                               <span className="text-slate-600">Ideal (Normal)</span>
                               <span className="font-bold text-slate-900">{normalBmiCount} Siswa</span>
                             </div>
                             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                               <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${(normalBmiCount / (totalSiswa || 1)) * 100}%` }}></div>
                             </div>
                           </div>

                           {/* Thin */}
                           <div className="space-y-1.5">
                             <div className="flex justify-between text-xs font-semibold">
                               <span className="text-slate-600">Kurus / Sangat Kurus</span>
                               <span className="font-bold text-slate-900">{thinBmiCount} Siswa</span>
                             </div>
                             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                               <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${(thinBmiCount / (totalSiswa || 1)) * 100}%` }}></div>
                             </div>
                           </div>

                           {/* Overweight */}
                           <div className="space-y-1.5">
                             <div className="flex justify-between text-xs font-semibold">
                               <span className="text-slate-600">Kelebihan BB / Obesitas</span>
                               <span className="font-bold text-slate-900">{overweightBmiCount} Siswa</span>
                             </div>
                             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                               <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${(overweightBmiCount / (totalSiswa || 1)) * 100}%` }}></div>
                             </div>
                           </div>
                         </div>

                         <div className="p-3.5 bg-emerald-50/50 rounded-xl text-xs text-emerald-800 border border-emerald-100/50 font-medium">
                           💡 Ideal berat badan membantu anak bergerak lincah dan berdaya tahan optimal dalam pembelajaran jasmani.
                         </div>
                       </div>

                       {/* Metric 2: Fitness Level Block (TKJI distribution) */}
                       <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                         <h5 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                           <span className="w-1.5 h-3.5 bg-indigo-600 rounded-full"></span>
                           Status Kebugaran Siswa (TKJI)
                         </h5>

                         <div className="space-y-3">
                           {/* Prima / Sangat Baik */}
                           <div className="space-y-1.5">
                             <div className="flex justify-between text-xs font-semibold">
                               <span className="text-slate-600">Sangat Baik (Prima)</span>
                               <span className="font-bold text-slate-950 font-mono">{fitnessCategoryDistribution.prima}</span>
                             </div>
                             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                               <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${(fitnessCategoryDistribution.prima / (totalSiswa || 1)) * 100}%` }}></div>
                             </div>
                           </div>

                           {/* Baik */}
                           <div className="space-y-1.5">
                             <div className="flex justify-between text-xs font-semibold">
                               <span className="text-slate-600">Kategori Baik</span>
                               <span className="font-bold text-slate-950 font-mono">{fitnessCategoryDistribution.baik}</span>
                             </div>
                             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                               <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${(fitnessCategoryDistribution.baik / (totalSiswa || 1)) * 100}%` }}></div>
                             </div>
                           </div>

                           {/* Sedang */}
                           <div className="space-y-1.5">
                             <div className="flex justify-between text-xs font-semibold">
                               <span className="text-slate-600">Kategori Sedang</span>
                               <span className="font-bold text-slate-950 font-mono">{fitnessCategoryDistribution.sedang}</span>
                             </div>
                             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                               <div className="bg-sky-400 h-full rounded-full transition-all duration-500" style={{ width: `${(fitnessCategoryDistribution.sedang / (totalSiswa || 1)) * 100}%` }}></div>
                             </div>
                           </div>

                           {/* Kurang */}
                           <div className="space-y-1.5">
                             <div className="flex justify-between text-xs font-semibold">
                               <span className="text-slate-600">Kategori Kurang</span>
                               <span className="font-bold text-slate-950 font-mono">{fitnessCategoryDistribution.kurang}</span>
                             </div>
                             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                               <div className="bg-orange-400 h-full rounded-full transition-all duration-500" style={{ width: `${(fitnessCategoryDistribution.kurang / (totalSiswa || 1)) * 100}%` }}></div>
                             </div>
                           </div>
                         </div>

                         <div className="p-3.5 bg-amber-50/50 rounded-xl text-xs text-amber-800 border border-amber-100/50 font-medium">
                           ℹ️ TKJI mengukur kecepatan sprint, daya tahan lari, kekuatan otot perut, otot lengan, dan lompatan tinggi anak.
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Right Box: Agenda Hari Ini / Jadwal Mengajar Ringkas */}
                   <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4" id="agenda-summary-box">
                     <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                       <div>
                         <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">Agenda Mengajar Hari Ini</h4>
                         <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Urutan jam pelajaran aktif</p>
                       </div>
                       <button onClick={() => setActiveTab("schedule")} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
                         Jadwal Penuh <ChevronRight className="h-3.5 w-3.5" />
                       </button>
                     </div>

                     <div className="space-y-3.5" id="agenda-overview-list">
                       {schedule.length === 0 ? (
                         <div className="text-center py-8 px-4 bg-slate-50/40 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2">
                           <Calendar className="h-8 w-8 text-slate-300 animate-pulse" />
                           <p className="text-xs text-slate-400 font-bold">Tidak ada agenda mengajar</p>
                           <p className="text-[10px] text-slate-400 font-semibold max-w-[200px]">Silakan tambah rombel/jadwal di menu Jadwal & Agenda.</p>
                         </div>
                       ) : (
                         schedule.slice(0, 4).map((item) => (
                           <div key={item.id} className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100/80 hover:border-emerald-200 hover:bg-slate-50/80 transition-all duration-300 flex items-center gap-3">
                             <div className="w-12 h-12 bg-emerald-50/80 rounded-xl flex flex-col items-center justify-center text-emerald-700 font-bold font-mono">
                               <Clock className="h-4 w-4 mb-0.5 text-emerald-600" />
                               <span className="text-[9px] font-black leading-none uppercase">PJOK</span>
                             </div>
                             <div className="flex-1 min-w-0">
                               <h5 className="text-xs font-bold text-slate-900 truncate">{item.topic}</h5>
                               <div className="flex items-center gap-2 mt-1">
                                 <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                   {item.grade}
                                 </span>
                                 <span className="text-[10px] text-slate-400 font-bold font-mono">{item.timeSlot}</span>
                                </div>
                             </div>
                             <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold whitespace-nowrap bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200">
                               <MapPin className="h-3 w-3 text-slate-400" />
                               {item.location}
                             </div>
                           </div>
                         ))
                       )}
                     </div>
                   </div>

                 </div>

                 {/* Teacher Administration Toolkit Quick Links */}
                 <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6" id="teacher-tools-quickbox">
                   <div className="space-y-1.5 text-center sm:text-left max-w-2xl">
                     <h4 className="font-extrabold text-lg text-emerald-400 flex items-center gap-2 justify-center sm:justify-start">
                       <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
                       Rumuskan Modul Ajar Kurikulum Merdeka Secara Otomatis
                     </h4>
                     <p className="text-sm text-slate-300 leading-relaxed font-medium">
                       Gunakan mesin AI SADAR bertenaga Gemini 3.5 Flash untuk merancang modul ajar, materi pemanasan yang interaktif, langkah keselamatan, dan rubrik penilaian PJOK instan sesuai dengan kelas tujuan.
                     </p>
                   </div>
                   <button
                     onClick={() => setActiveTab("rpp")}
                     className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer border border-emerald-500 shadow-emerald-950/20"
                     id="goto-rpp-ai-btn"
                   >
                     Mulai Tulis RPP AI
                   </button>
                 </div>
               </motion.div>
             )}

            {/* TAB 2: STUDENT MANAGEMENT / FITNESS ASSESSMENT */}
            {activeTab === "students" && (
              <motion.div
                key="tab-students"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
                id="panel-students"
              >
                 {/* Control toolbar for search and filters */}
                 <div className="bg-white border border-slate-100 rounded-2xl p-4.5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm" id="students-toolbar">
                   {/* Search and Grade filters */}
                   <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full md:w-auto">
                     <div className="relative w-full sm:w-64">
                       <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                       <input
                         type="text"
                         placeholder="Cari nama siswa..."
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl w-full focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-medium text-slate-800 bg-slate-50/40"
                         id="student-search-input"
                       />
                     </div>
                     
                     <div className="flex items-center gap-2 w-full sm:w-auto">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Filter Kelas:</span>
                       <select
                         value={classFilter}
                         onChange={(e) => setClassFilter(e.target.value)}
                         className="py-2 px-3 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none bg-white w-full sm:w-auto focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-700"
                         id="student-class-filter"
                       >
                         <option value="Semua">Semua Kelas</option>
                         <option value="Kelas I">Kelas I</option>
                         <option value="Kelas II">Kelas II</option>
                         <option value="Kelas III">Kelas III</option>
                         <option value="Kelas IV">Kelas IV</option>
                         <option value="Kelas V">Kelas V</option>
                         <option value="Kelas VI">Kelas VI</option>
                       </select>
                     </div>
                   </div>

                   {/* Add Student Button */}
                   <button
                     onClick={handleOpenAddStudent}
                     className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/10 w-full md:w-auto justify-center cursor-pointer border border-emerald-500"
                     id="add-student-btn"
                   >
                     <Plus className="h-4 w-4" />
                     Tambah Data Siswa
                   </button>
                 </div>

                {/* Grid layout containing table of student and current selection details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="student-grid-root">
                  
                   {/* Left block: Students list table */}
                   <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col" id="student-table-container">
                     <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                       <div className="flex items-center gap-2.5">
                         <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                           Arsip Kesehatan & Fisik Siswa ({filteredStudents.length} Terdaftar)
                         </h4>
                         {selectedStudentIds.length > 0 && (
                           <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                             {selectedStudentIds.length} Terpilih
                           </span>
                         )}
                       </div>
                       <div className="flex items-center gap-2">
                         {selectedStudentIds.length > 0 && (
                           <button
                             onClick={handleBulkDeleteStudents}
                             className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-extrabold px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 transition-all border border-red-200 shadow-sm cursor-pointer"
                             id="bulk-delete-students-btn"
                           >
                             <Trash2 className="h-3.5 w-3.5" />
                             Hapus Masal ({selectedStudentIds.length})
                           </button>
                         )}
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Tahun Ajaran 2026/2027</span>
                       </div>
                     </div>
 
                     <div className="overflow-x-auto">
                       <table className="w-full text-left border-collapse" id="students-table">
                         <thead>
                           <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/40">
                             <th className="px-4 py-3 w-10 text-center">
                               <input
                                 type="checkbox"
                                 checked={filteredStudents.length > 0 && filteredStudents.every(s => selectedStudentIds.includes(s.id))}
                                 onChange={(e) => {
                                   if (e.target.checked) {
                                     const allFilteredIds = filteredStudents.map(s => s.id);
                                     setSelectedStudentIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
                                   } else {
                                     const filteredIdsSet = new Set(filteredStudents.map(s => s.id));
                                     setSelectedStudentIds(prev => prev.filter(id => !filteredIdsSet.has(id)));
                                   }
                                 }}
                                 className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                                 title="Pilih Semua"
                                />
                             </th>
                             <th className="px-5 py-3">Nama Lengkap</th>
                             <th className="px-5 py-3">Kelas / J.K</th>
                             <th className="px-5 py-3 text-center">Status BMI</th>
                             <th className="px-5 py-3 text-center">TKJI</th>
                             <th className="px-5 py-3 text-right">Aksi</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 text-sm">
                           {filteredStudents.length > 0 ? (
                             filteredStudents.map((student) => {
                               const bmiInfo = calculateBMI(student.weight, student.height);
                               const fitnessInfo = calculateFitnessScore(student);
                               const isSelected = selectedStudent?.id === student.id;
 
                               return (
                                 <tr
                                   key={student.id}
                                   id={`student-row-${student.id}`}
                                   onClick={() => setSelectedStudent(student)}
                                   className={`hover:bg-slate-50/80 cursor-pointer transition-all duration-200 ${
                                     isSelected ? "bg-emerald-50/50 font-semibold text-emerald-950" : ""
                                   }`}
                                 >
                                   <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="checkbox"
                                        checked={selectedStudentIds.includes(student.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedStudentIds(prev => [...prev, student.id]);
                                          } else {
                                            setSelectedStudentIds(prev => prev.filter(id => id !== student.id));
                                          }
                                        }}
                                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                                      />
                                    </td>
                                    <td className="px-5 py-3.5">
                                     <div className="flex items-center gap-2">
                                       <div className={`p-2 rounded-lg font-bold text-xs flex items-center justify-center ${
                                         student.gender === "L" ? "bg-indigo-50 text-indigo-700" : "bg-pink-50 text-pink-700"
                                       }`}>
                                         {student.gender}
                                       </div>
                                       <div>
                                         <p className="font-bold text-slate-900 leading-snug">{student.name}</p>
                                         <p className="text-[10px] text-slate-400 font-medium">Terakhir update: {student.updatedAt}</p>
                                       </div>
                                     </div>
                                   </td>
                                   
                                   <td className="px-5 py-3.5">
                                     <div className="space-y-0.5">
                                       <span className="text-xs font-semibold text-slate-700">{student.grade}</span>
                                       <p className="text-[10px] text-slate-400 font-semibold font-mono">{student.height} cm / {student.weight} kg</p>
                                     </div>
                                   </td>
 
                                   <td className="px-5 py-3.5 text-center">
                                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${bmiInfo.bgColor}`}>
                                       {bmiInfo.category}
                                     </span>
                                   </td>
 
                                   <td className="px-5 py-3.5 text-center">
                                     <div className="flex flex-col items-center justify-center">
                                       <span className="font-mono font-bold text-xs text-slate-900">{fitnessInfo.score}</span>
                                       <span className="text-[9px] text-slate-400 font-bold tracking-tight uppercase leading-none">{fitnessInfo.rating}</span>
                                     </div>
                                   </td>
 
                                   <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                                     <div className="flex items-center justify-end gap-1.5">
                                       <button
                                         id={`edit-btn-${student.id}`}
                                         onClick={() => handleOpenEditStudent(student)}
                                         className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                                         title="Edit Ukuran Fisik"
                                       >
                                         <Edit2 className="h-4 w-4" />
                                       </button>
                                       <button
                                         id={`delete-btn-${student.id}`}
                                         onClick={() => handleDeleteStudent(student.id)}
                                         className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                         title="Hapus"
                                       >
                                         <Trash2 className="h-4 w-4" />
                                       </button>
                                     </div>
                                   </td>
                                 </tr>
                               );
                             })
                           ) : (
                             <tr>
                               <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                                 Tidak ada data siswa yang cocok dengan filter.
                               </td>
                             </tr>
                           )}
                         </tbody>
                       </table>
                     </div>
                   </div>

                  {/* Right block: Student detailed physical profile or Add/Edit Form */}
                  <div className="space-y-6" id="student-detail-and-form-panel">
                    
                    {/* A. If Editing/Adding Student (Form Modal/Panel) */}
                    {isEditingStudent ? (
                      <div className="bg-white border border-emerald-500/30 rounded-xl p-5 shadow-md space-y-4" id="student-form-card">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {studentForm.id ? "Edit Pengukuran Fisik" : "Tambah Data Siswa Baru"}
                          </h4>
                          <button
                            onClick={() => setIsEditingStudent(false)}
                            className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                          >
                            Batal
                          </button>
                        </div>

                        <form onSubmit={handleSaveStudent} className="space-y-3.5 text-xs">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                              Nama Lengkap
                            </label>
                            <input
                              type="text"
                              required
                              value={studentForm.name || ""}
                              onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                              placeholder="e.g. Budi Raharjo"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                              id="input-student-name"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                                Jenis Kelamin
                              </label>
                              <select
                                value={studentForm.gender || "L"}
                                onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value as "L" | "P" })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                                id="input-student-gender"
                              >
                                <option value="L">Laki-laki (L)</option>
                                <option value="P">Perempuan (P)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                                Kelas
                              </label>
                              <input
                                type="text"
                                required
                                value={studentForm.grade || ""}
                                onChange={(e) => setStudentForm({ ...studentForm, grade: e.target.value })}
                                placeholder="e.g. IV-A"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                id="input-student-grade"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                                Tinggi Badan (cm)
                              </label>
                              <input
                                type="number"
                                required
                                value={studentForm.height || ""}
                                onChange={(e) => setStudentForm({ ...studentForm, height: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                id="input-student-height"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                                Berat Badan (kg)
                              </label>
                              <input
                                type="number"
                                required
                                value={studentForm.weight || ""}
                                onChange={(e) => setStudentForm({ ...studentForm, weight: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                id="input-student-weight"
                              />
                            </div>
                          </div>

                          {/* TKJI Test Score fields */}
                          <div className="space-y-2.5 border-t border-slate-100 pt-3">
                            <span className="font-bold text-slate-700 block text-xs">Uji Kebugaran Jasmani (TKJI)</span>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] text-slate-500 mb-0.5">Lari Cepat 30m/40m (Detik)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={studentForm.runSpeed || ""}
                                  onChange={(e) => setStudentForm({ ...studentForm, runSpeed: Number(e.target.value) })}
                                  placeholder="e.g. 6.8"
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                  id="input-student-runspeed"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-500 mb-0.5">Baring Duduk / Sit-Up (Kali)</label>
                                <input
                                  type="number"
                                  value={studentForm.sitUps || ""}
                                  onChange={(e) => setStudentForm({ ...studentForm, sitUps: Number(e.target.value) })}
                                  placeholder="30 detik"
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                  id="input-student-situps"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] text-slate-500 mb-0.5">Gantung Tekuk / Pull-Up (Kali)</label>
                                <input
                                  type="number"
                                  value={studentForm.pushUps || ""}
                                  onChange={(e) => setStudentForm({ ...studentForm, pushUps: Number(e.target.value) })}
                                  placeholder="30 detik"
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                  id="input-student-pushups"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-500 mb-0.5">Loncat Tegak / Jump (cm)</label>
                                <input
                                  type="number"
                                  value={studentForm.verticalJump || ""}
                                  onChange={(e) => setStudentForm({ ...studentForm, verticalJump: Number(e.target.value) })}
                                  placeholder="e.g. 35"
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                  id="input-student-verticaljump"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 mb-0.5">Lari Jarak Menengah 600m (Detik)</label>
                              <input
                                type="number"
                                value={studentForm.runDistance || ""}
                                onChange={(e) => setStudentForm({ ...studentForm, runDistance: Number(e.target.value) })}
                                placeholder="e.g. 180"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                id="input-student-rundistance"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-sm block text-center cursor-pointer border border-emerald-500"
                            id="save-student-submit-btn"
                          >
                            Simpan Hasil Pengukuran
                          </button>
                        </form>
                      </div>
                    ) : selectedStudent ? (
                      /* B. Displaying Selected Student's Premium physical Report Card */
                      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4" id="student-report-card">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Kartu Kesehatan Jasmani</span>
                          <button
                            onClick={() => selectedStudent && handleOpenEditStudent(selectedStudent)}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                            id="edit-profile-action"
                          >
                            <Edit2 className="h-3 w-3" /> Edit Data
                          </button>
                        </div>

                        {/* Student Main Identity Profile */}
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                            selectedStudent.gender === "L" ? "bg-indigo-50 text-indigo-700" : "bg-pink-50 text-pink-700"
                          }`}>
                            {selectedStudent.gender}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-base leading-tight">{selectedStudent.name}</h4>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">Siswa Kelas {selectedStudent.grade}</p>
                          </div>
                        </div>

                        {/* Interactive Calculators & Visual Sliders */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          {/* BMI Card */}
                          {(() => {
                            const bmi = calculateBMI(selectedStudent.weight, selectedStudent.height);
                            return (
                              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Nilai BMI Siswa</span>
                                <p className="text-2xl font-black text-slate-950 font-mono">{bmi.bmi}</p>
                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full block text-center border ${bmi.bgColor}`}>
                                  {bmi.category}
                                </span>
                              </div>
                            );
                          })()}

                          {/* Fitness score */}
                          {(() => {
                            const fit = calculateFitnessScore(selectedStudent);
                            return (
                              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Skor TKJI PJOK</span>
                                <p className="text-2xl font-black text-slate-950 font-mono">{fit.score} <span className="text-xs text-slate-400">/100</span></p>
                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full block text-center border ${fit.bgColor}`}>
                                  {fit.rating}
                                </span>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Detailed test scores items */}
                        <div className="space-y-2 border-t border-slate-100 pt-3">
                          <span className="text-xs font-extrabold text-slate-700 block uppercase tracking-wide">Rincian Hasil Uji Kemampuan Fisik</span>
                          
                          <div className="space-y-1.5 font-mono text-xs">
                            <div className="flex justify-between p-2 rounded-lg bg-slate-50/50 border border-slate-100">
                              <span className="text-slate-500 font-sans font-medium">Lari Cepat (30m)</span>
                              <span className="font-bold text-slate-900">{selectedStudent.runSpeed || "-"} Detik</span>
                            </div>

                            <div className="flex justify-between p-2 rounded-lg bg-slate-50/50 border border-slate-100">
                              <span className="text-slate-500 font-sans font-medium">Baring Duduk (Sit-Up)</span>
                              <span className="font-bold text-slate-900">{selectedStudent.sitUps || "-"} Kali</span>
                            </div>

                            <div className="flex justify-between p-2 rounded-lg bg-slate-50/50 border border-slate-100">
                              <span className="text-slate-500 font-sans font-medium">Pull-Up / Siku Tekuk</span>
                              <span className="font-bold text-slate-900">{selectedStudent.pushUps || "-"} Kali</span>
                            </div>

                            <div className="flex justify-between p-2 rounded-lg bg-slate-50/50 border border-slate-100">
                              <span className="text-slate-500 font-sans font-medium">Loncat Tegak (Vertical)</span>
                              <span className="font-bold text-slate-900">{selectedStudent.verticalJump || "-"} cm</span>
                            </div>

                            <div className="flex justify-between p-2 rounded-lg bg-slate-50/50 border border-slate-100">
                              <span className="text-slate-500 font-sans font-medium">Lari Jarak Jauh (600m)</span>
                              <span className="font-bold text-slate-900">{selectedStudent.runDistance ? `${Math.floor(selectedStudent.runDistance / 60)}m ${selectedStudent.runDistance % 60}s` : "-"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Teacher advisory advice */}
                        <div className="p-3.5 bg-emerald-50/60 rounded-xl text-xs text-emerald-800 border border-emerald-100 font-medium">
                          <p className="font-bold flex items-center gap-1.5 text-emerald-950 uppercase tracking-wide">
                            <Info className="h-4 w-4 text-emerald-600" /> Saran Latihan Pembelajaran
                          </p>
                          <p className="mt-1 leading-relaxed">
                            {calculateFitnessScore(selectedStudent).score < 50
                              ? "Fisik anak membutuhkan stimulus aktivitas gerak manipulatif intensitas rendah-menengah, diselingi permainan kebugaran yang menarik."
                              : "Performa anak sangat baik! Dorong siswa untuk memimpin pemanasan kelas atau membagikan taktik permainan kelompok kepada siswa lain."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* C. Placeholder before selecting student */
                      <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 space-y-2" id="student-detail-placeholder">
                        <Users className="h-10 w-10 mx-auto text-slate-300" />
                        <h4 className="font-bold text-slate-600 text-sm">Tidak Ada Siswa Terpilih</h4>
                        <p className="text-xs max-w-[240px] mx-auto text-slate-400">
                          Klik salah satu baris siswa di daftar untuk menampilkan Kartu Penilaian Kebugaran Jasmani lengkap.
                        </p>
                      </div>
                    )}

                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 3: ARTIFICIAL INTELLIGENCE LESSON PLAN (RPP) GENERATOR */}
            {activeTab === "rpp" && (
              <motion.div
                key="tab-rpp"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                id="panel-rpp"
              >
                
                 {/* Left panel (Form to set prompt and inputs) - 4 columns */}
                 <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-5" id="rpp-inputs-card">
                   <div className="space-y-1 border-b border-slate-100 pb-3">
                     <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                       <Sparkles className="h-5 w-5 text-amber-500 animate-spin" />
                       Parameter Pembelajaran AI (Standar SIBI)
                     </h3>
                     <p className="text-xs text-slate-400 font-semibold">Mengacu pada Buku Panduan Guru PJOK SIBI Kemendikbudristek</p>
                   </div>

                   <SibiQuickPicker
                     grade={rppGrade}
                     label="Pilih Unit dari Buku Panduan PJOK SIBI:"
                     onSelectUnit={(unit) => {
                       setRppMaterial(`Unit ${unit.unitNumber} SIBI: ${unit.title.replace(/^Unit \d+:\s*/i, "")}`);
                       setRppDuration(unit.alokasiWaktu);
                     }}
                   />
 
                   {/* Form fields */}
                   <div className="space-y-4 text-xs">
                     
                     {/* Grade select */}
                     <div>
                       <label className="block font-bold text-slate-500 uppercase mb-1">Kelas Sekolah Dasar</label>
                       <select
                         value={rppGrade}
                         onChange={(e) => {
                           const newGrade = e.target.value;
                           setRppGrade(newGrade);
                           setRppMaterial(materialSuggestionsByGrade[newGrade]?.[0] || "");
                         }}
                         className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white"
                         id="rpp-input-grade"
                       >
                         <option value="I">Kelas I (Fase A)</option>
                         <option value="II">Kelas II (Fase A)</option>
                         <option value="III">Kelas III (Fase B)</option>
                         <option value="IV">Kelas IV (Fase B)</option>
                         <option value="V">Kelas V (Fase C)</option>
                         <option value="VI">Kelas VI (Fase C)</option>
                       </select>
                     </div>
 
                     {/* Duration input */}
                     <div>
                       <label className="block font-bold text-slate-500 uppercase mb-1">Alokasi Waktu</label>
                       <input
                         type="text"
                         value={rppDuration}
                         onChange={(e) => setRppDuration(e.target.value)}
                         className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                         placeholder="e.g. 2 x 35 Menit (1 Pertemuan)"
                         id="rpp-input-duration"
                       />
                     </div>
 
                     {/* Model Pembelajaran */}
                     <div>
                       <label className="block font-bold text-slate-500 uppercase mb-1">Model Pembelajaran</label>
                       <select
                         value={rppModel}
                         onChange={(e) => setRppModel(e.target.value)}
                         className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white"
                         id="rpp-input-model"
                       >
                        <option value="Cooperative Learning">Pembelajaran Kooperatif (Gotong Royong)</option>
                        <option value="Inquiry / Discovery Learning">Inkuiri / Penemuan Terbimbing</option>
                        <option value="Direct Instruction">Pembelajaran Langsung / Demonstrasi</option>
                        <option value="Project Based Learning">PBL (Pembelajaran Berbasis Masalah)</option>
                        <option value="Playful Movement">Joyful Learning (Belajar sambil Bermain)</option>
                      </select>
                    </div>

                    {/* Topic/Material Input with smart suggestions based on selected grade */}
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-500 uppercase">Materi Pokok / Sport</label>
                      <input
                        type="text"
                        required
                        value={rppMaterial}
                        onChange={(e) => setRppMaterial(e.target.value)}
                        placeholder="e.g. Sepak Bola, Permainan Kasti, Senam Lantai"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        id="rpp-input-material"
                      />
                      
                      {/* Suggestion list */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 block font-semibold">Saran kurikulum Kelas {rppGrade} SD:</span>
                        <div className="flex flex-wrap gap-1">
                          {materialSuggestionsByGrade[rppGrade]?.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => setRppMaterial(suggestion)}
                              className={`text-[10px] px-2 py-1 rounded-md border text-left transition-all ${
                                rppMaterial === suggestion
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold"
                                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {rppErrorMessage && (
                      <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                        <span className="font-semibold">{rppErrorMessage}</span>
                      </div>
                    )}

                    {rppSuccessMessage && (
                      <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold">{rppSuccessMessage}</span>
                      </div>
                    )}

                    {/* Action submit button */}
                    <button
                      onClick={generateModulAjar}
                      disabled={isGeneratingRpp}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-xs border border-emerald-500 shadow-emerald-950/10"
                      id="generate-rpp-action"
                    >
                      {isGeneratingRpp ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Menganalisis Kurikulum...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                          Generasikan Modul Ajar AI
                        </>
                      )}
                    </button>
                  </div>

                  {/* Saved archived plans list */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Arsip Modul Terbuka ({savedPlans.length})</span>
                    
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1" id="saved-plans-list">
                      {savedPlans.length > 0 ? (
                        savedPlans.map((plan) => (
                          <div
                            key={plan.id}
                            id={`saved-plan-item-${plan.id}`}
                            onClick={() => {
                              setSelectedSavedPlan(plan);
                              setCurrentRpp(plan.content);
                              setRppGrade(plan.grade);
                              setRppMaterial(plan.material);
                              setRppDuration(plan.duration);
                              setRppModel(plan.teachingModel);
                            }}
                            className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                              selectedSavedPlan?.id === plan.id
                                ? "bg-emerald-50/50 text-emerald-900 border-emerald-100 font-bold"
                                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-bold truncate">{plan.content.judul}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">Kelas {plan.grade} • {plan.createdAt}</p>
                            </div>
                            <button
                              onClick={(e) => handleDeleteSavedPlan(plan.id, e)}
                              className="p-1 hover:text-red-500 rounded hover:bg-slate-200 transition-all ml-1 cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-400 italic text-center py-2">Belum ada modul ajar yang disimpan.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right panel (Show results or interactive loader) - 8 columns */}
                <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col min-h-[480px]" id="rpp-results-card">
                  
                  {isGeneratingRpp ? (
                    /* A. Animated Premium AI Loading Screen */
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center py-16" id="rpp-loader">
                      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-500 border-t-transparent animate-spin">
                        <Activity className="h-8 w-8 text-emerald-600" />
                      </div>
                      <div className="space-y-2 max-w-sm">
                        <h4 className="font-extrabold text-slate-900 text-sm">SADAR AI Sedang Merumuskan Langkah Pembelajaran</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          Mengharmonisasikan Gerak Jasmani Fase Kurikulum Merdeka, menyusun latihan kebugaran yang menyenangkan, serta menyisipkan protokol keselamatan bagi anak-anak tingkat dasar.
                        </p>
                      </div>
                    </div>
                  ) : currentRpp ? (
                    /* B. Printable, high-end governmental style Lesson Plan paper layout */
                    <div className="flex-1 flex flex-col space-y-4" id="rpp-result-viewer">
                      
                      {/* Document Toolbar header with download/print actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 bg-slate-50/50 p-3 rounded-xl">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                          Modul Siap Cetak
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          {!selectedSavedPlan && (
                            <button
                              onClick={saveCurrentRppToCollection}
                              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                              id="save-rpp-btn"
                            >
                              Simpan ke Arsip
                            </button>
                          )}
                          <button
                            onClick={handleCopyRppToClipboard}
                            className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer border border-slate-200"
                            id="copy-rpp-btn"
                            title="Salin teks Modul Ajar ke Clipboard"
                          >
                            <Copy className="h-3.5 w-3.5 text-emerald-600" />
                            Salin Teks
                          </button>
                          <button
                            onClick={handleExportRppWord}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer border border-emerald-500 shadow-sm"
                            id="word-rpp-btn"
                            title="Unduh Modul Ajar dalam format Microsoft Word (.doc)"
                          >
                            <FileDown className="h-3.5 w-3.5" />
                            Unduh Word (.doc)
                          </button>
                          <button
                            onClick={handlePrintRppPDF}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer"
                            id="print-rpp-btn"
                            title="Cetak laporan resmi Modul Ajar A4 / Simpan PDF"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            Cetak / PDF
                          </button>
                        </div>
                      </div>

                      {/* Official Paper Template Area */}
                      <div className="flex-1 overflow-y-auto max-h-[580px] p-6 border border-slate-150 rounded-2xl bg-white shadow-inner font-sans text-xs space-y-5" id="printable-area">
                        
                        {/* Garuda / Kementerian Mock header */}
                        <div className="text-center space-y-1 border-b-2 border-double border-slate-800 pb-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{schoolName}</p>
                          <h4 className="text-sm font-black tracking-widest uppercase text-slate-900">MODUL AJAR KURIKULUM MERDEKA</h4>
                          <h5 className="text-xs font-extrabold uppercase text-slate-800">PENDIDIKAN JASMANI, OLAHRAGA, DAN KESEHATAN (PJOK)</h5>
                          <p className="text-[10px] text-slate-400 font-mono italic">{schoolAddress}</p>
                        </div>

                        {/* Plan Header Grid */}
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 font-semibold text-slate-700">
                          <div className="space-y-1">
                            <p><strong>Judul:</strong> {currentRpp.judul}</p>
                            <p><strong>Jenjang / Kelas:</strong> Sekolah Dasar / Kelas {selectedSavedPlan ? selectedSavedPlan.grade : rppGrade} SD</p>
                            <p><strong>Model Pembelajaran:</strong> {selectedSavedPlan ? selectedSavedPlan.teachingModel : rppModel}</p>
                          </div>
                          <div className="space-y-1">
                            <p><strong>Alokasi Waktu:</strong> {currentRpp.alokasiWaktu}</p>
                            <p><strong>Profil Pancasila:</strong> {currentRpp.profilPancasila?.join(", ") || "-"}</p>
                            <p><strong>Kompetensi Awal:</strong> {currentRpp.kompetensiAwal}</p>
                          </div>
                        </div>

                        {/* Sarana and Tujuan lists */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-2 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                            <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">🏓 Sarana & Prasarana</span>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px] font-medium">
                              {currentRpp.sarana?.map((item, idx) => <li key={idx}>{item}</li>)}
                            </ul>
                          </div>

                          <div className="space-y-2 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                            <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">🎯 Tujuan Pembelajaran</span>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px] font-medium">
                              {currentRpp.tujuanPembelajaran?.map((item, idx) => <li key={idx}>{item}</li>)}
                            </ul>
                          </div>
                        </div>

                        {/* Activities steps (Pendahuluan, Inti, Penutup) */}
                        <div className="space-y-4 pt-2">
                          <span className="font-extrabold text-sm text-slate-900 block border-b-2 border-slate-800 pb-1 uppercase">
                            👣 Skenario Kegiatan Pembelajaran PJOK
                          </span>

                          {/* 1. Pendahuluan */}
                          <div className="space-y-2">
                            <span className="font-bold text-slate-900 block bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                              A. Pendahuluan (15 Menit) - Persiapan & Pemanasan
                            </span>
                            <ol className="list-decimal list-inside space-y-1 pl-2 text-slate-600 leading-relaxed text-[11px] font-medium">
                              {currentRpp.kegiatan?.pendahuluan?.map((step, idx) => <li key={idx} className="pl-1">{step}</li>)}
                            </ol>
                          </div>

                          {/* 2. Inti */}
                          <div className="space-y-2">
                            <span className="font-bold text-slate-900 block bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                              B. Kegiatan Inti (45 Menit) - Eksplorasi Gerak & Praktek
                            </span>
                            <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-600 leading-relaxed text-[11px] font-medium">
                              {currentRpp.kegiatan?.inti?.map((step, idx) => <li key={idx} className="pl-1">{step}</li>)}
                            </ol>
                          </div>

                          {/* 3. Penutup */}
                          <div className="space-y-2">
                            <span className="font-bold text-slate-900 block bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                              C. Kegiatan Penutup (10 Menit) - Pendinginan & Evaluasi
                            </span>
                            <ol className="list-decimal list-inside space-y-1 pl-2 text-slate-600 leading-relaxed text-[11px] font-medium">
                              {currentRpp.kegiatan?.penutup?.map((step, idx) => <li key={idx} className="pl-1">{step}</li>)}
                            </ol>
                          </div>
                        </div>

                        {/* Asesmen */}
                        <div className="space-y-3 pt-2">
                          <span className="font-extrabold text-sm text-slate-900 block border-b-2 border-slate-800 pb-1 uppercase">
                            📝 Penilaian & Asesmen Pembelajaran
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="p-3 bg-emerald-50/20 rounded-xl border border-slate-100">
                              <p className="font-bold text-emerald-950">Asesmen Sikap (Afektif)</p>
                              <p className="text-slate-600 mt-1 text-[11px] leading-relaxed font-medium">{currentRpp.asesmen?.sikap}</p>
                            </div>
                            <div className="p-3 bg-emerald-50/20 rounded-xl border border-slate-100">
                              <p className="font-bold text-emerald-950">Asesmen Pengetahuan (Kognitif)</p>
                              <p className="text-slate-600 mt-1 text-[11px] leading-relaxed font-medium">{currentRpp.asesmen?.pengetahuan}</p>
                            </div>
                            <div className="p-3 bg-emerald-50/20 rounded-xl border border-slate-100">
                              <p className="font-bold text-emerald-950">Asesmen Keterampilan (Psikomotor)</p>
                              <p className="text-slate-600 mt-1 text-[11px] leading-relaxed font-medium">{currentRpp.asesmen?.keterampilan}</p>
                            </div>
                          </div>
                        </div>

                        {/* Tips guru */}
                        <div className="p-4 bg-amber-50/50 rounded-2xl text-slate-800 border border-amber-100 font-medium">
                          <span className="font-bold text-amber-950 block mb-1">💡 Tips Guru & Protokol Keselamatan Lapangan</span>
                          <p className="leading-relaxed text-[11px] text-amber-900">{currentRpp.tipsGuru}</p>
                        </div>

                        {/* Official signature blocks */}
                        <div className="pt-8 grid grid-cols-2 gap-8 text-center border-t border-slate-100 font-medium text-slate-800">
                          <div className="space-y-16">
                            <p>Mengetahui,<br /><strong>Kepala {schoolName}</strong></p>
                            <div className="space-y-0.5">
                              <p className="underline font-bold">{headmasterName}</p>
                              <p className="text-[10px] text-slate-500 font-mono">NIP. {headmasterNip}</p>
                            </div>
                          </div>

                          <div className="space-y-16">
                            <p>Sadar, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br /><strong>Guru Mapel PJOK</strong></p>
                            <div className="space-y-0.5">
                              <p className="underline font-bold">{teacherName}</p>
                              <p className="text-[10px] text-slate-500 font-mono">NIP. {teacherNip}</p>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  ) : (
                    /* C. Initial State placeholder */
                    <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-center py-16" id="rpp-placeholder">
                      <BookOpen className="h-14 w-14 text-slate-300" />
                      <h4 className="font-bold text-slate-600 text-sm">Asisten Modul Ajar AI (RPP) Belum Aktif</h4>
                      <p className="text-xs max-w-sm mx-auto text-slate-400 leading-relaxed">
                        Pilih Kelas, tentukan materi yang ingin diajarkan (atau pakai saran materi kurikulum yang tersedia), kemudian klik tombol <strong>&quot;Generasikan Modul Ajar AI&quot;</strong> untuk merumuskan RPP siap cetak bertenaga Gemini.
                      </p>
                    </div>
                  )}

                </div>

              </motion.div>
            )}

            {/* TAB: INFOGRAPHICS GENERATOR 3D STYLE */}
            {activeTab === "infographics" && (
              <motion.div
                key="tab-infographics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                id="panel-infographics"
              >
                {/* Left panel (Form to set inputs) - 4 columns */}
                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-5" id="infographics-inputs-card">
                  <div className="space-y-1 border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-pink-500 animate-pulse" />
                      Parameter Infografis 3D AI
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold">Ubah materi ajar menjadi poster edukasi 3D cartoon menarik</p>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-4 text-xs">
                    
                    {/* Topic/Title input */}
                    <div>
                      <label className="block font-bold text-slate-500 uppercase mb-1">Topik / Judul Utama Poster</label>
                      <input
                        type="text"
                        value={infographicTopic}
                        onChange={(e) => setInfographicTopic(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        placeholder="e.g. 5 Kunci Kebugaran Jasmani, Cara Menendang Bola"
                        id="infographics-input-topic"
                      />
                    </div>

                    {/* Material Text Area */}
                    <div>
                      <label className="block font-bold text-slate-500 uppercase mb-1">Rangkuman / Silabus Materi Ajar</label>
                      <textarea
                        required
                        value={infographicMaterial}
                        onChange={(e) => setInfographicMaterial(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 h-40 resize-none font-medium leading-relaxed"
                        placeholder="Masukkan poin-poin materi pembelajaran PJOK atau kurikulum dasar yang ingin dijabarkan menjadi poster visual kartun..."
                        id="infographics-input-material"
                      />
                    </div>

                    {/* Validation Error Message */}
                    {infographicValidationErrors && (
                      <div className="p-3 bg-red-50 text-red-800 border border-red-150 rounded-xl text-xs flex items-center gap-2" id="infographics-val-err">
                        <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                        <span className="font-semibold">{infographicValidationErrors}</span>
                      </div>
                    )}

                    {/* Success Message */}
                    {infographicSuccessMessage && (
                      <div className="p-3 bg-green-50 text-green-800 border border-green-150 rounded-xl text-xs flex items-center gap-2" id="infographics-val-success">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        <span className="font-semibold">{infographicSuccessMessage}</span>
                      </div>
                    )}

                    {/* Action submit button */}
                    <button
                      onClick={generateInfographic}
                      disabled={isGeneratingInfographic || !infographicMaterial}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-xs border border-emerald-500 shadow-emerald-950/10"
                      id="generate-infographics-action"
                    >
                      {isGeneratingInfographic ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Merancang Konsep 3D...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-pink-300 animate-pulse" />
                          Generasikan Poster Infografis AI
                        </>
                      )}
                    </button>
                  </div>

                  {/* Design Guide Info Box */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 text-[11px] text-slate-500 space-y-2 font-medium">
                    <p className="font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-pink-500" />
                      GAYA 3D CARTOON ANIMATION PREMIUM
                    </p>
                    <p className="leading-relaxed">
                      AI kami diprogram sebagai desainer infografis & ilustrator film animasi modern. Rangkuman materi akan dipecah menjadi outline panel visual 3D yang sangat interaktif dan ramah anak.
                    </p>
                  </div>
                </div>

                {/* Right panel (Show results or interactive loader) - 8 columns */}
                <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col min-h-[500px]" id="infographics-results-card">
                  
                  {isGeneratingInfographic ? (
                    /* A. Animated Premium AI Loading Screen */
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center py-16" id="infographics-loader">
                      <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center border-4 border-pink-500 border-t-transparent animate-spin">
                        <Activity className="h-8 w-8 text-pink-600 animate-pulse" />
                      </div>
                      <div className="space-y-2 max-w-sm">
                        <h4 className="font-extrabold text-slate-900 text-sm">SADAR AI Sedang Menggambar Dunia Animasi 3D</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          Mendesain karakter maskot lucu, merancang detail pencahayaan lembut (cinematic lighting), bayangan realistis, dan membagi materi Anda ke dalam layout tabel infografis A4 portrait yang rapi dan memikat!
                        </p>
                      </div>
                    </div>
                  ) : generatedInfographic ? (
                    /* B. Infographic Preview & Google Docs Integration Actions */
                    <div className="flex-1 flex flex-col space-y-5" id="infographics-result-viewer">
                      
                      {/* Document Toolbar header with download/clipboard actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 bg-slate-50/50 p-3 rounded-xl">
                        <div className="flex items-center gap-1.5 text-xs text-pink-800 font-bold bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-100">
                          <CheckCircle className="h-3.5 w-3.5 text-pink-600" />
                          Rancangan Poster 3D Siap Ekspor
                        </div>
                        
                        <button
                          onClick={copyInfographicToClipboardAndOpenDocs}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm border border-emerald-500"
                          id="export-to-docs-btn"
                          title="Salin tabel rapi ke clipboard dan buka tab baru Google Dokumen"
                        >
                          <Copy className="h-4 w-4" />
                          Ekspor ke Google Dokumen
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Poster Mockup Preview Area */}
                      <div className="flex-1 overflow-y-auto max-h-[580px] p-6 border-2 border-slate-150 rounded-2xl bg-slate-50/30 font-sans text-xs space-y-6" id="poster-mockup-area">
                        
                        {/* Title Block resembling A4 Poster Top Header */}
                        <div className="text-center space-y-2 bg-gradient-to-br from-pink-50/40 via-emerald-50/20 to-indigo-50/30 p-6 rounded-2xl border border-slate-150 shadow-sm relative overflow-hidden">
                          <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-32 h-32 bg-pink-400/5 rounded-full blur-xl"></div>
                          <h4 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
                            🎨 {generatedInfographic.judulUtama}
                          </h4>
                          <p className="text-xs font-semibold text-slate-500 italic">
                            {generatedInfographic.subJudul}
                          </p>
                          <div className="pt-2 border-t border-dashed border-slate-200 mt-2 flex flex-col sm:flex-row items-center gap-3 bg-white/80 p-3 rounded-xl justify-center">
                            <span className="bg-pink-100 text-pink-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-pink-200 shrink-0">
                              Mascot Pemandu (3D)
                            </span>
                            <p className="text-[11px] text-slate-600 font-medium leading-relaxed text-left">
                              <strong>{generatedInfographic.maskotPemandu}</strong>: <span className="text-emerald-600 italic">&quot;{generatedInfographic.balonPercakapan}&quot;</span>
                            </p>
                          </div>
                        </div>

                        {/* Main Layout Table - NEAT TABULAR PREVIEW */}
                        <div className="space-y-2">
                          <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider block">
                            Layout Panel Informasi Poster (A4 Portrait Grid)
                          </span>
                          
                          <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                                  <th className="px-4 py-3 w-[35%] border-r border-slate-800">Panel & Ilustrasi Visual 3D</th>
                                  <th className="px-4 py-3 w-[65%]">Detail Informasi Edukatif</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-150">
                                {generatedInfographic.panels.map((p: any, idx: number) => (
                                  <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="p-4 bg-slate-50/50 border-r border-slate-200 space-y-2 align-top">
                                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-emerald-200">
                                        Panel {idx + 1}
                                      </span>
                                      <h5 className="font-extrabold text-slate-900 text-xs mt-1">
                                        {p.judulPanel}
                                      </h5>
                                      <div className="text-[10px] text-slate-500 space-y-1.5 font-medium leading-relaxed">
                                        <p><strong>Ikon:</strong> {p.ikonSaran}</p>
                                        <p className="bg-white p-2 rounded-lg border border-slate-200 text-[9px] italic">
                                          <strong>Konsep 3D:</strong> {p.deskripsiVisual3D}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="p-4 align-top">
                                      <ul className="list-disc list-inside space-y-2 text-slate-700 text-xs font-semibold leading-relaxed">
                                        {p.poinMateri.map((point: string, pIdx: number) => (
                                          <li key={pIdx} className="pl-1 text-slate-600">
                                            {point}
                                          </li>
                                        ))}
                                      </ul>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Rangkuman Bawah Block */}
                        <div className="bg-green-50/60 border border-green-100 rounded-2xl p-5 space-y-3 shadow-sm">
                          <h5 className="font-extrabold text-xs uppercase tracking-wider text-green-950 flex items-center gap-1.5">
                            🌟 Rangkuman & Pesan Kunci Poster (Footer Area)
                          </h5>
                          <p className="text-xs text-green-900 leading-relaxed font-semibold">
                            {generatedInfographic.rangkumanBawah}
                          </p>

                          <div className="border-t border-green-200/50 pt-3 space-y-2">
                            <span className="text-[10px] font-black uppercase text-green-800 tracking-wider">Aksi Nyata & Tips Praktis Anak:</span>
                            <ul className="list-decimal list-inside space-y-1 text-green-950 text-xs font-semibold">
                              {generatedInfographic.tipsAjakanTindakan.map((t: string, idx: number) => (
                                <li key={idx} className="pl-1">{t}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-white/60 p-3 rounded-xl border border-green-100 text-[10px] text-green-900 font-medium">
                            <strong>Desain Ilustrasi Mascot Bawah:</strong> {generatedInfographic.visualMaskotBawah}
                          </div>
                        </div>

                        {/* Extra decorative assets list */}
                        <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-400 font-semibold bg-white p-4 rounded-xl border border-slate-200">
                          <div>
                            <span className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1">Elemen Dekoratif 3D Pendukung</span>
                            <p>{generatedInfographic.elemenDekoratif3D.join(", ")}</p>
                          </div>
                          <div>
                            <span className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1">Panduan Cetak Fisik</span>
                            <p>Cetak pada kertas A4 Glossy Photo Paper Portrait untuk hasil cetak warna 3D maksimal.</p>
                          </div>
                        </div>

                      </div>
                    </div>
                  ) : (
                    /* C. Initial State placeholder */
                    <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-center py-16" id="infographics-placeholder">
                      <Sparkles className="h-14 w-14 text-pink-300 animate-pulse" />
                      <h4 className="font-bold text-slate-600 text-sm">Asisten Desain Infografis 3D AI Belum Aktif</h4>
                      <p className="text-xs max-w-sm mx-auto text-slate-400 leading-relaxed">
                        Masukkan rangkuman materi pelajaran atau silabus di sebelah kiri, tentukan topik poster, lalu klik tombol <strong>&quot;Generasikan Poster Infografis AI&quot;</strong> untuk merancang poster edukasi kartun Pixar-style berkualitas tinggi.
                      </p>
                    </div>
                  )}

                </div>

              </motion.div>
            )}

            {/* TAB: MATERI AJAR GENERATOR */}
            {activeTab === "materi" && (
              <motion.div
                key="tab-materi"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                id="panel-materi"
              >
                {/* Left Form Parameter Panel - 4 columns */}
                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-5" id="materi-inputs-card">
                  <div className="space-y-1 border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-cyan-500 animate-pulse" />
                      Asisten Bahan Ajar AI (Standar SIBI)
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold">Buat materi ajar utuh sesuai Buku Panduan Guru PJOK SIBI</p>
                  </div>

                  <SibiQuickPicker
                    grade={materiKelas}
                    label="Isi Cepat dari Unit Buku PJOK SIBI:"
                    onSelectUnit={(unit) => {
                      setMateriTopik(`${unit.title} (Buku Panduan PJOK SIBI)`);
                      setMateriTujuan(unit.tujuanPembelajaran.join(" "));
                    }}
                  />

                  <div className="space-y-4 text-xs">
                    {/* Prompt Version Selector */}
                    <div>
                      <label className="block font-bold text-slate-500 uppercase mb-1.5">PILIHAN TEMPLATE PROMPT</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setMateriPromptVersion("versi1")}
                          className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer font-bold ${
                            materiPromptVersion === "versi1"
                              ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-extrabold"
                              : "border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          Versi 1 (Profil & Bloom)
                        </button>
                        <button
                          type="button"
                          onClick={() => setMateriPromptVersion("versi2")}
                          className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer font-bold ${
                            materiPromptVersion === "versi2"
                              ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-extrabold"
                              : "border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          Versi 2 (Standar)
                        </button>
                      </div>
                    </div>

                    {/* Mapel */}
                    <div>
                      <label className="block font-bold text-slate-500 uppercase mb-1">Mata Pelajaran</label>
                      <input
                        type="text"
                        value={materiMapel}
                        onChange={(e) => setMateriMapel(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-semibold text-slate-700"
                        id="materi-input-mapel"
                      />
                    </div>

                    {/* Jenjang, Kelas, Fase Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block font-bold text-slate-500 uppercase mb-1">Jenjang</label>
                        <select
                          value={materiJenjang}
                          onChange={(e) => setMateriJenjang(e.target.value)}
                          className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                        >
                          <option value="SD">SD</option>
                          <option value="SMP">SMP</option>
                          <option value="SMA">SMA</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-500 uppercase mb-1">Kelas</label>
                        <select
                          value={materiKelas}
                          onChange={(e) => setMateriKelas(e.target.value)}
                          className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                        >
                          <option value="Kelas 1">Kelas 1</option>
                          <option value="Kelas 2">Kelas 2</option>
                          <option value="Kelas 3">Kelas 3</option>
                          <option value="Kelas 4">Kelas 4</option>
                          <option value="Kelas 5">Kelas 5</option>
                          <option value="Kelas 6">Kelas 6</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-500 uppercase mb-1">Fase</label>
                        <select
                          value={materiFase}
                          onChange={(e) => setMateriFase(e.target.value)}
                          className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                        >
                          <option value="Fase A">Fase A</option>
                          <option value="Fase B">Fase B</option>
                          <option value="Fase C">Fase C</option>
                          <option value="Fase D">Fase D</option>
                          <option value="Fase E">Fase E</option>
                        </select>
                      </div>
                    </div>

                    {/* Form elements specific to Version 1 */}
                    {materiPromptVersion === "versi1" && (
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <div>
                          <label className="block font-bold text-slate-600 uppercase mb-1">Level Taksonomi Bloom</label>
                          <select
                            value={materiLevelBloom}
                            onChange={(e) => setMateriLevelBloom(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                          >
                            <option value="C1 - Mengingat">C1 - Mengingat</option>
                            <option value="C2 - Memahami">C2 - Memahami</option>
                            <option value="C3 - Menerapkan">C3 - Menerapkan</option>
                            <option value="C4 - Menganalisis">C4 - Menganalisis</option>
                            <option value="C5 - Mengevaluasi">C5 - Mengevaluasi</option>
                            <option value="C6 - Menciptakan">C6 - Menciptakan</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-600 uppercase mb-1">Dimensi Profil Lulusan</label>
                          <input
                            type="text"
                            value={materiDimensiProfil}
                            onChange={(e) => setMateriDimensiProfil(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                            placeholder="e.g. Mandiri, Gotong Royong"
                          />
                        </div>
                      </div>
                    )}

                    {/* Topic Input */}
                    <div>
                      <label className="block font-bold text-slate-500 uppercase mb-1">Topik Pembelajaran <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={materiTopik}
                        onChange={(e) => setMateriTopik(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-semibold text-slate-700"
                        placeholder="e.g. Gerak Dasar Lompat Jauh, 5 Aturan Bola Basket"
                        id="materi-input-topik"
                      />
                    </div>

                    {/* Learning Objectives Input */}
                    <div>
                      <label className="block font-bold text-slate-500 uppercase mb-1">Tujuan Pembelajaran <span className="text-red-500">*</span></label>
                      <textarea
                        required
                        value={materiTujuan}
                        onChange={(e) => setMateriTujuan(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 h-24 resize-none font-medium leading-relaxed text-slate-700"
                        placeholder="e.g. Siswa dapat memahami dan mempraktikkan keterampilan gerak melompat dengan tumpuan yang benar..."
                        id="materi-input-tujuan"
                      />
                    </div>

                    {/* Validation/Success Alerts */}
                    {materiValidationErrors && (
                      <div className="p-3 bg-red-50 text-red-800 border border-red-150 rounded-xl text-xs flex items-center gap-2" id="materi-val-err">
                        <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                        <span className="font-semibold">{materiValidationErrors}</span>
                      </div>
                    )}

                    {materiSuccessMessage && (
                      <div className="p-3 bg-green-50 text-green-800 border border-green-150 rounded-xl text-xs flex items-center gap-2" id="materi-val-success">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        <span className="font-semibold">{materiSuccessMessage}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      onClick={generateMateri}
                      disabled={isGeneratingMateri || !materiTopik || !materiTujuan}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-xs border border-emerald-500 shadow-emerald-950/10"
                      id="generate-materi-action"
                    >
                      {isGeneratingMateri ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Memproses Materi Ajar...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-cyan-300 animate-pulse" />
                          Generasikan Bahan Ajar AI
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right Result Preview & Export Panel - 8 columns */}
                <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col min-h-[500px]" id="materi-results-card">
                  {isGeneratingMateri ? (
                    /* Loading State */
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center py-16" id="materi-loader">
                      <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center border-4 border-cyan-500 border-t-transparent animate-spin">
                        <Activity className="h-8 w-8 text-cyan-600 animate-pulse" />
                      </div>
                      <div className="space-y-2 max-w-sm">
                        <h4 className="font-extrabold text-slate-900 text-sm">SADAR AI Sedang Menulis Bahan Ajar Kreatif</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          Menyusun pendahuluan apersepsi kontekstual, merinci materi utama secara terstruktur sesuai usia, memformulasikan analogi nyata, dan menata tabel ringkasan konsep untuk Google Dokumen.
                        </p>
                      </div>
                    </div>
                  ) : generatedMateri ? (
                    /* Display Generated Document */
                    <div className="flex-1 flex flex-col space-y-5" id="materi-result-viewer">
                      
                      {/* Document Toolbar header with Google Docs Integration Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 bg-slate-50/50 p-3 rounded-xl">
                        <div className="flex items-center gap-1.5 text-xs text-cyan-800 font-bold bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-100">
                          <CheckCircle className="h-3.5 w-3.5 text-cyan-600" />
                          Bahan Ajar Siap Disalin
                        </div>
                        
                        <button
                          onClick={copyMateriToClipboardAndOpenDocs}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm border border-emerald-500"
                          id="export-materi-to-docs-btn"
                          title="Salin tabel rapi ke clipboard dan buka tab baru Google Dokumen"
                        >
                          <Copy className="h-4 w-4" />
                          Ekspor ke Google Dokumen
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Paper Document Layout Preview */}
                      <div className="flex-1 overflow-y-auto max-h-[580px] p-8 border-2 border-slate-150 rounded-2xl bg-white font-sans text-xs space-y-6 shadow-inner" id="materi-document-area">
                        
                        {/* Title Block resembling formal school material header */}
                        <div className="text-center space-y-2 border-b-4 border-double border-slate-900 pb-4">
                          <span className="text-[10px] uppercase font-black text-emerald-600 tracking-widest bg-emerald-50 px-3 py-1 rounded border border-emerald-100">
                            Materi Pembelajaran Kreatif - Kurikulum Merdeka
                          </span>
                          <h4 className="text-xl sm:text-2xl font-extrabold text-slate-950 uppercase mt-2">
                            📚 {generatedMateri.judul}
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-4 text-left bg-slate-50 p-3 rounded-xl border border-slate-200 mt-3 font-semibold text-slate-600 text-[10px]">
                            <div>
                              <p><strong>Mata Pelajaran:</strong> {materiMapel}</p>
                              <p><strong>Kelas / Fase:</strong> {materiKelas} ({materiFase})</p>
                            </div>
                            <div>
                              <p><strong>Tujuan Pembelajaran:</strong> {generatedMateri.tujuanPembelajaran}</p>
                              {materiPromptVersion === "versi1" && (
                                <p><strong>Taksonomi / Profil:</strong> {materiLevelBloom} • {materiDimensiProfil}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Apersepsi / Pendahuluan */}
                        <div className="space-y-2">
                          <h5 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1">
                            <Info className="h-4 w-4 text-emerald-600" />
                            Apersepsi & Cerita Pembuka
                          </h5>
                          <div className="p-4 bg-emerald-50/60 border-l-4 border-emerald-500 rounded-r-xl text-slate-700 text-xs font-semibold leading-relaxed italic">
                            &quot;{generatedMateri.apersepsi}&quot;
                          </div>
                        </div>

                        {/* Isi Materi Utama */}
                        <div className="space-y-2.5">
                          <h5 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1">
                            <BookOpen className="h-4 w-4 text-indigo-600" />
                            Isi Pembahasan Utama
                          </h5>
                          <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/30 text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                            {generatedMateri.isiMateriUtama}
                          </div>
                        </div>

                        {/* Structured Table - TABEL RAPI */}
                        <div className="space-y-2.5">
                          <h5 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1">
                            <Layers className="h-4 w-4 text-emerald-600" />
                            Tabel Ringkasan Konsep, Aktivitas & Analogi
                          </h5>
                          
                          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-900 text-white font-extrabold uppercase tracking-wider text-[10px]">
                                  <th className="px-3 py-2.5 text-center w-[5%] border-r border-slate-800">No</th>
                                  <th className="px-3 py-2.5 w-[25%] border-r border-slate-800">Sub-Konsep</th>
                                  <th className="px-4 py-2.5 w-[25%] border-r border-slate-800">Fakta Penting</th>
                                  <th className="px-4 py-2.5 w-[25%] border-r border-slate-800">Prosedur / Langkah</th>
                                  <th className="px-3 py-2.5 w-[20%]">Contoh Analogi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-150 font-semibold text-slate-600">
                                {generatedMateri.tabelMateri.map((row: any, idx: number) => (
                                  <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="p-3 text-center bg-slate-50/30 border-r border-slate-200">{row.no}</td>
                                    <td className="p-3 border-r border-slate-200 font-extrabold text-slate-900">{row.subKonsep}</td>
                                    <td className="p-4 border-r border-slate-200 leading-relaxed font-medium text-[11px]">{row.faktaPenting}</td>
                                    <td className="p-4 border-r border-slate-200 leading-relaxed font-medium text-[11px]">{row.prosedur}</td>
                                    <td className="p-3 font-medium text-[11px] italic text-slate-500">{row.analogi}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Kesimpulan & Aktivitas Menyenangkan */}
                        <div className="bg-green-50/60 border border-green-150 rounded-2xl p-5 space-y-3">
                          <h5 className="font-extrabold text-xs uppercase tracking-wider text-green-950 flex items-center gap-1.5">
                            🌟 Kesimpulan & Tantangan Aktivitas Siswa
                          </h5>
                          <div className="text-xs text-green-900 leading-relaxed font-semibold whitespace-pre-wrap">
                            {generatedMateri.kesimpulanDanAktivitas}
                          </div>
                        </div>

                        {/* Copy guidelines note */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-500 font-medium leading-relaxed">
                          💡 <strong>Petunjuk Guru:</strong> Klik tombol <strong>&quot;Ekspor ke Google Dokumen&quot;</strong> di atas untuk menyalin rancangan ini secara utuh (termasuk tabel dan warna indahnya) langsung ke clipboard, lalu paste (Ctrl+V atau Cmd+V) di Google Docs yang otomatis terbuka. Hasil paste dijamin rapi, bergaris tabel, dan berstruktur!
                        </div>

                      </div>
                    </div>
                  ) : (
                    /* Initial Placeholder state */
                    <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-center py-16" id="materi-placeholder">
                      <BookOpen className="h-14 w-14 text-cyan-300 animate-pulse" />
                      <h4 className="font-bold text-slate-600 text-sm">Asisten Materi Ajar AI Belum Aktif</h4>
                      <p className="text-xs max-w-sm mx-auto text-slate-400 leading-relaxed">
                        Tentukan pilihan template prompt (Versi 1 atau Versi 2), lengkapi parameter Topik dan Tujuan Pembelajaran di panel kiri, lalu klik <strong>&quot;Generasikan Bahan Ajar AI&quot;</strong> untuk menyusun materi ajar lengkap siap ekspor.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: SLIDE PRESENTASI GENERATOR */}
            {activeTab === "slides" && (
              <motion.div
                key="tab-slides"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                id="panel-slides"
              >
                {/* Left Form Parameter Panel - 4 columns */}
                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-5" id="slides-inputs-card">
                  <div className="space-y-1 border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Presentation className="h-5 w-5 text-emerald-500 animate-pulse" />
                      Asisten Slide Presentasi AI
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold">Buat outline presentasi interaktif dan ekspor instan ke Google Slides/Docs</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Prompt Style Selector */}
                    <div>
                      <label className="block font-bold text-slate-500 uppercase mb-1.5">TEMPLATE STRUKTUR PRESENTASI</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSlidesPromptType("notebook");
                            if (!slidesNamaGuru) setSlidesNamaGuru("GURU GEN Z - SMP BAHAGIA");
                          }}
                          className={`py-2.5 px-3 rounded-lg border text-center transition-all cursor-pointer font-bold leading-tight ${
                            slidesPromptType === "notebook"
                              ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-extrabold"
                              : "border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          NotebookLM Style (Hijau-Kuning)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSlidesPromptType("canva");
                            if (slidesNamaGuru === "GURU GEN Z - SMP BAHAGIA") setSlidesNamaGuru("");
                          }}
                          className={`py-2.5 px-3 rounded-lg border text-center transition-all cursor-pointer font-bold leading-tight ${
                            slidesPromptType === "canva"
                              ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-extrabold"
                              : "border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          Canva / PowerPoint Style
                        </button>
                      </div>
                    </div>

                    {/* Shared: Nama Guru */}
                    <div>
                      <label className="block font-bold text-slate-500 uppercase mb-1">
                        {slidesPromptType === "notebook" ? "Nama Guru & Sekolah" : "Nama Pengajar"}
                      </label>
                      <input
                        type="text"
                        value={slidesNamaGuru}
                        onChange={(e) => setSlidesNamaGuru(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                        placeholder={slidesPromptType === "notebook" ? "e.g. GURU GEN Z - SMP BAHAGIA" : "e.g. Pak Guru San"}
                        id="slides-input-nama"
                      />
                    </div>

                    {/* Canva-Specific Fields */}
                    {slidesPromptType === "canva" && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <div>
                          <label className="block font-bold text-slate-600 uppercase mb-1">Mata Pelajaran</label>
                          <input
                            type="text"
                            value={slidesMapel}
                            onChange={(e) => setSlidesMapel(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                            id="slides-input-mapel"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-bold text-slate-600 uppercase mb-1">Kelas</label>
                            <input
                              type="text"
                              value={slidesKelas}
                              onChange={(e) => setSlidesKelas(e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                              id="slides-input-kelas"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-600 uppercase mb-1">Nama Sekolah</label>
                            <input
                              type="text"
                              value={slidesNamaSekolah}
                              onChange={(e) => setSlidesNamaSekolah(e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                              placeholder="e.g. SD Negeri Pintar"
                              id="slides-input-sekolah"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notebook-Specific: Pertanyaan Pemantik */}
                    {slidesPromptType === "notebook" && (
                      <div>
                        <label className="block font-bold text-slate-500 uppercase mb-1">Pertanyaan Pemantik <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={slidesPertanyaanPemantik}
                          onChange={(e) => setSlidesPertanyaanPemantik(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                          placeholder="e.g. Kenapa tubuh kita berkeringat saat berolahraga?"
                          id="slides-input-pemantik"
                        />
                      </div>
                    )}

                    {/* Shared: Tujuan Pembelajaran (Required with validation) */}
                    <div>
                      <label className="block font-bold text-slate-500 uppercase mb-1">Tujuan Pembelajaran <span className="text-red-500">*</span></label>
                      <textarea
                        required
                        value={slidesTujuanPembelajaran}
                        onChange={(e) => setSlidesTujuanPembelajaran(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 h-24 resize-none font-medium leading-relaxed text-slate-700"
                        placeholder="e.g. Murid dapat mengidentifikasi gerak lokomotor dan non-lokomotor dalam permainan bola basket dengan tepat..."
                        id="slides-input-tujuan"
                      />
                    </div>

                    {/* Optional: Pokok Bahasan / Silabus Tambahan */}
                    <div>
                      <label className="block font-bold text-slate-500 uppercase mb-1">Bahan Silabus / Catatan Tambahan (Opsional)</label>
                      <textarea
                        value={slidesMateriPokok}
                        onChange={(e) => setSlidesMateriPokok(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 h-20 resize-none font-medium leading-relaxed text-slate-700"
                        placeholder="Sebutkan submateri khusus atau instruksi LKPD jika ingin lebih detail..."
                        id="slides-input-materi-pokok"
                      />
                    </div>

                    {/* Validation Warnings */}
                    {slidesValidationErrors && (
                      <div className="p-3 bg-red-50 text-red-800 border border-red-150 rounded-xl text-xs flex items-center gap-2" id="slides-val-err">
                        <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                        <span className="font-semibold">{slidesValidationErrors}</span>
                      </div>
                    )}

                    {slidesSuccessMessage && (
                      <div className="p-3 bg-green-50 text-green-800 border border-green-150 rounded-xl text-xs flex items-center gap-2" id="slides-val-success">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        <span className="font-semibold">{slidesSuccessMessage}</span>
                      </div>
                    )}

                    {/* Submit Button with loader */}
                    <button
                      onClick={generateSlides}
                      disabled={isGeneratingSlides || !slidesTujuanPembelajaran || (slidesPromptType === "notebook" && !slidesPertanyaanPemantik)}
                      className={`w-full py-3 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-xs border ${
                        slidesPromptType === "notebook"
                          ? "bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed border-emerald-500 shadow-emerald-950/10"
                          : "bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed border-emerald-500 shadow-emerald-950/10"
                      }`}
                      id="generate-slides-action"
                    >
                      {isGeneratingSlides ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Memproses Outline Slide...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                          Generasikan Outline Slide
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right Result Preview & Export Panel - 8 columns */}
                <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col min-h-[500px]" id="slides-results-card">
                  {isGeneratingSlides ? (
                    /* Loading State */
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center py-16" id="slides-loader">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-t-transparent animate-spin ${
                        slidesPromptType === "notebook" ? "bg-emerald-50 border-emerald-500" : "bg-emerald-50 border-emerald-500"
                      }`}>
                        <Activity className={`h-8 w-8 animate-pulse ${slidesPromptType === "notebook" ? "text-emerald-600" : "text-emerald-600"}`} />
                      </div>
                      <div className="space-y-2 max-w-sm">
                        <h4 className="font-extrabold text-slate-900 text-sm">SADAR AI Sedang Merancang Slide Interaktif</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          Memformulasikan visual modern, menyederhanakan materi dalam format bullet komunikatif, dan menyiapkan notes penyampaian guru serta instruksi LKPD.
                        </p>
                      </div>
                    </div>
                  ) : generatedSlides ? (
                    /* Display Generated Document */
                    <div className="flex-1 flex flex-col space-y-5" id="slides-result-viewer">
                      
                      {/* Document Toolbar header with Google Docs Integration Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 bg-slate-50/50 p-3 rounded-xl">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                          Struktur Slide Siap Diekspor
                        </div>
                        
                        <button
                          onClick={copySlidesToClipboardAndOpenDocs}
                          className={`text-white font-extrabold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm border ${
                            slidesPromptType === "notebook"
                              ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-500"
                              : "bg-emerald-600 hover:bg-emerald-500 border-emerald-500"
                          }`}
                          id="export-slides-to-docs-btn"
                          title="Salin outline rapi ke clipboard dan buka tab baru Google Dokumen"
                        >
                          <Copy className="h-4 w-4" />
                          Ekspor ke Google Dokumen
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Presentation Slides Layout Preview Container */}
                      <div className="flex-1 overflow-y-auto max-h-[580px] p-6 border-2 border-slate-150 rounded-2xl bg-slate-50/50 font-sans text-xs space-y-6 shadow-inner" id="slides-document-area">
                        
                        {/* Overall Meta Info */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                            <Sliders className="h-4 w-4 text-emerald-500" />
                            Ringkasan Desain Presentasi
                          </h4>
                          <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                            <strong>Judul Rencana:</strong> {generatedSlides.judulPresentasi}<br/>
                            <strong>Tema Palet Visual:</strong> {generatedSlides.temaDesain}
                          </p>
                        </div>

                        {/* Interactive Slide-by-slide Preview */}
                        <div className="space-y-6">
                          <h5 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="h-4.5 w-4.5 text-indigo-600" />
                            Pratinjau Lembar Slide Presentasi
                          </h5>

                          <div className="grid grid-cols-1 gap-6">
                            {generatedSlides.slides.map((slide: any, sIdx: number) => {
                              const isNotebookMode = slidesPromptType === "notebook";
                              return (
                                <div 
                                  key={sIdx} 
                                  className={`rounded-2xl border-2 shadow-md overflow-hidden bg-white transition-all hover:shadow-lg ${
                                    isNotebookMode 
                                      ? "border-emerald-100 hover:border-emerald-300" 
                                      : "border-emerald-100 hover:border-emerald-300"
                                  }`}
                                  id={`slide-card-${slide.no}`}
                                >
                                  {/* Slide Screen Header / Pallet bar */}
                                  <div className={`px-4 py-2.5 flex items-center justify-between text-[10px] font-black uppercase tracking-wider ${
                                    isNotebookMode 
                                      ? "bg-emerald-50 text-emerald-800 border-b border-emerald-100" 
                                      : "bg-emerald-50 text-emerald-800 border-b border-emerald-100"
                                  }`}>
                                    <span>SLIDE {slide.no} / {generatedSlides.slides.length}</span>
                                    <span className="flex items-center gap-1">
                                      <Activity className="h-3.5 w-3.5 animate-pulse" />
                                      {isNotebookMode ? "NotebookLM Mode" : "Canva Mode"}
                                    </span>
                                  </div>

                                  <div className="p-6 space-y-4">
                                    {/* Slide Title */}
                                    <h4 className="text-base font-extrabold text-slate-950 border-b-2 border-slate-100 pb-2">
                                      {slide.judulSlide}
                                    </h4>

                                    {/* Slide Main Content Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                      {/* Content bullets */}
                                      <div className="md:col-span-8 space-y-2">
                                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Konten Slide (Poin Ringkas)</span>
                                        <ul className="list-disc list-inside space-y-2 text-slate-700 text-xs font-semibold leading-relaxed">
                                          {slide.kontenSlide.map((bullet: string, bIdx: number) => (
                                            <li key={bIdx} className="pl-1 text-slate-800">
                                              {bullet}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>

                                      {/* Visual / Illustration recommendation block */}
                                      <div className="md:col-span-4 bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 space-y-1.5 self-start">
                                        <span className="block text-[9px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-1">
                                          🎨 Rekomendasi Visual
                                        </span>
                                        <p className="text-[10px] text-slate-600 font-bold leading-relaxed italic">
                                          {slide.ideVisual}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Speaker notes for the teacher */}
                                    <div className="mt-4 pt-3.5 border-t border-slate-100 bg-slate-50/70 p-3 rounded-xl space-y-1">
                                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Catatan Penyampaian Guru (Speaker Notes)</span>
                                      <p className="text-xs text-slate-600 font-semibold leading-relaxed italic">
                                        &quot;{slide.catatanGuru}&quot;
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Copy guidelines note */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-500 font-medium leading-relaxed">
                          💡 <strong>Petunjuk Guru:</strong> Klik tombol <strong>&quot;Ekspor ke Google Dokumen&quot;</strong> di atas untuk menyalin outline slide ini secara utuh (termasuk struktur tabel rapi dan skema warna indah) langsung ke clipboard, lalu tinggal paste (Ctrl+V atau Cmd+V) di Google Docs yang otomatis terbuka. Semua slide Anda siap dicontek untuk diinput ke Google Slides atau Canva!
                        </div>

                      </div>
                    </div>
                  ) : (
                    /* Initial Placeholder state */
                    <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-center py-16" id="slides-placeholder">
                      <Presentation className="h-14 w-14 text-emerald-300 animate-pulse" />
                      <h4 className="font-bold text-slate-600 text-sm">Asisten Slide Presentasi AI Belum Aktif</h4>
                      <p className="text-xs max-w-sm mx-auto text-slate-400 leading-relaxed">
                        Pilih template outline presentasi (NotebookLM atau Canva), lengkapi formulir masukan di sebelah kiri, lalu klik <strong>&quot;Generasikan Outline Slide&quot;</strong> untuk merancang struktur presentasi interaktif berstandar tinggi.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: LEMBAR KERJA PESERTA DIDIK (LKPD) GENERATOR */}
            {activeTab === "lkpd" && (
              <motion.div
                key="tab-lkpd"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                id="panel-lkpd"
              >
                {/* Left Panel: Form Parameter Inputs (4 columns) */}
                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-5" id="lkpd-inputs-card">
                  <div className="space-y-1 border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <FileText className="h-5 w-5 text-amber-500 animate-pulse" />
                      Rancangan LKPD PJOK (Standar SIBI)
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold">
                      Susun lembar kerja interaktif sesuai Unit Buku Panduan Guru PJOK SIBI.
                    </p>
                  </div>

                  <SibiQuickPicker
                    grade={lkpdKelas}
                    label="Isi Cepat dari Unit Buku PJOK SIBI:"
                    onSelectUnit={(unit) => {
                      setLkpdTopik(`${unit.title} (Standar SIBI)`);
                      setLkpdTujuan(unit.tujuanPembelajaran.join(" "));
                    }}
                  />

                  <div className="space-y-4 text-xs">
                    {/* Prompt Version Selector */}
                    <div>
                      <label className="block font-bold text-slate-500 uppercase mb-1.5">METODE PENYUSUNAN LKPD</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setLkpdVersion("v1");
                            setLkpdValidationErrors(null);
                          }}
                          className={`py-2.5 px-3 rounded-lg border text-center transition-all cursor-pointer font-bold leading-tight ${
                            lkpdVersion === "v1"
                              ? "bg-amber-50 border-amber-300 text-amber-700 font-extrabold"
                              : "border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          Versi 1: Sintaks Terstruktur
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLkpdVersion("v2");
                            setLkpdValidationErrors(null);
                          }}
                          className={`py-2.5 px-3 rounded-lg border text-center transition-all cursor-pointer font-bold leading-tight ${
                            lkpdVersion === "v2"
                              ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-extrabold"
                              : "border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          Versi 2: Kegiatan Inti RPP
                        </button>
                      </div>
                    </div>

                    {/* Shared Inputs */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div>
                        <label className="block font-bold text-slate-600 uppercase mb-1">Mata Pelajaran</label>
                        <input
                          type="text"
                          value={lkpdMapel}
                          onChange={(e) => setLkpdMapel(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                          id="lkpd-input-mapel"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-600 uppercase mb-1">Kelas</label>
                          <input
                            type="text"
                            value={lkpdKelas}
                            onChange={(e) => setLkpdKelas(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                            id="lkpd-input-kelas"
                          />
                        </div>
                        {lkpdVersion === "v1" && (
                          <div>
                            <label className="block font-bold text-slate-600 uppercase mb-1">Fase</label>
                            <input
                              type="text"
                              value={lkpdFase}
                              onChange={(e) => setLkpdFase(e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                              placeholder="A/B/C/D/E/F"
                              id="lkpd-input-fase"
                            />
                          </div>
                        )}
                        {lkpdVersion === "v2" && (
                          <div>
                            <label className="block font-bold text-slate-600 uppercase mb-1">Pertemuan Ke</label>
                            <input
                              type="text"
                              value={lkpdPertemuanKe}
                              onChange={(e) => setLkpdPertemuanKe(e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                              placeholder="e.g. 1"
                              id="lkpd-input-pertemuan"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Version 1 Specific Fields */}
                    {lkpdVersion === "v1" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-bold text-slate-500 uppercase mb-1">Jenjang</label>
                            <input
                              type="text"
                              value={lkpdJenjang}
                              onChange={(e) => setLkpdJenjang(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                              placeholder="e.g. SD"
                              id="lkpd-input-jenjang"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-500 uppercase mb-1">Sintaks Pembelajaran</label>
                            <input
                              type="text"
                              value={lkpdSintaks}
                              onChange={(e) => setLkpdSintaks(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                              placeholder="e.g. PBL / PJBL / Inquiry"
                              id="lkpd-input-sintaks"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-500 uppercase mb-1">
                            Topik Pembelajaran <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={lkpdTopik}
                            onChange={(e) => setLkpdTopik(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                            placeholder="e.g. Kombinasi Gerak Lokomotor Permainan Bola Basket"
                            id="lkpd-input-topik"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-500 uppercase mb-1">
                            Tujuan Pembelajaran <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            required
                            value={lkpdTujuan}
                            onChange={(e) => setLkpdTujuan(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 h-20 resize-none font-medium leading-relaxed text-slate-700"
                            placeholder="e.g. Peserta didik mampu menganalisis dan mempraktikkan keterampilan gerak melempar (passing) dan menangkap bola basket..."
                            id="lkpd-input-tujuan"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-500 uppercase mb-1">Dimensi Profil Pelajar Pancasila</label>
                          <input
                            type="text"
                            value={lkpdDimensi}
                            onChange={(e) => setLkpdDimensi(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                            placeholder="e.g. Gotong Royong, Mandiri, Bernalar Kritis"
                            id="lkpd-input-dimensi"
                          />
                        </div>
                      </div>
                    )}

                    {/* Version 2 Specific Fields */}
                    {lkpdVersion === "v2" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block font-bold text-slate-500 uppercase mb-1">
                            Kegiatan Inti RPP / Perencanaan <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            required
                            value={lkpdKegiatanInti}
                            onChange={(e) => setLkpdKegiatanInti(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 h-44 resize-none font-medium leading-relaxed text-slate-700 text-[11px]"
                            placeholder="Masukkan langkah-langkah kegiatan inti pembelajaran dari RPP Anda di sini. AI akan memecahkannya menjadi aktivitas lembar kerja siswa yang terstruktur..."
                            id="lkpd-input-kegiatan-inti"
                          />
                        </div>
                      </div>
                    )}

                    {/* Validation Error Banner */}
                    {lkpdValidationErrors && (
                      <div className="p-3 bg-red-50 text-red-800 border border-red-150 rounded-xl text-xs flex items-center gap-2" id="lkpd-val-err">
                        <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                        <span className="font-semibold">{lkpdValidationErrors}</span>
                      </div>
                    )}

                    {lkpdSuccessMessage && (
                      <div className="p-3 bg-green-50 text-green-800 border border-green-150 rounded-xl text-xs flex items-center gap-2" id="lkpd-val-success">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        <span className="font-semibold">{lkpdSuccessMessage}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      onClick={generateLkpd}
                      disabled={isGeneratingLkpd || (lkpdVersion === "v1" && (!lkpdTopik || !lkpdTujuan)) || (lkpdVersion === "v2" && !lkpdKegiatanInti)}
                      className={`w-full py-3 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-xs border ${
                        lkpdVersion === "v1"
                          ? "bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 disabled:cursor-not-allowed border-amber-500 shadow-amber-950/10"
                          : "bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed border-emerald-500 shadow-emerald-950/10"
                      }`}
                      id="generate-lkpd-action"
                    >
                      {isGeneratingLkpd ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Memproses Lembar Kerja...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                          Susun Lembar Kerja (LKPD) AI
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right Panel: Result Preview & Export Area (8 columns) */}
                <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col min-h-[500px]" id="lkpd-results-card">
                  {isGeneratingLkpd ? (
                    /* Loading State with animated milestones */
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center py-16" id="lkpd-loader">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-t-transparent animate-spin ${
                        lkpdVersion === "v1" ? "bg-amber-50 border-amber-500" : "bg-emerald-50 border-emerald-500"
                      }`}>
                        <Activity className={`h-8 w-8 animate-pulse ${lkpdVersion === "v1" ? "text-amber-600" : "text-emerald-600"}`} />
                      </div>
                      <div className="space-y-2 max-w-sm">
                        <h4 className="font-extrabold text-slate-900 text-sm">SADAR AI Merumuskan LKPD Interaktif</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          Menyusun materi pengamatan riil, merancang tugas kasus kontekstual kehidupan nyata, menyiapkan pertanyaan pemahaman berbobot, serta kuesioner evaluasi diri terintegrasi.
                        </p>
                      </div>
                    </div>
                  ) : generatedLkpd ? (
                    /* Document Viewer State */
                    <div className="flex-1 flex flex-col space-y-5" id="lkpd-result-viewer">
                      
                      {/* Export toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 bg-slate-50/50 p-3 rounded-xl">
                        <div className="flex items-center gap-1.5 text-xs text-green-800 font-bold bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                          Lembar Kerja Peserta Didik Siap Diekspor
                        </div>
                        
                        <button
                          onClick={copyLkpdToClipboardAndOpenDocs}
                          className={`text-white font-extrabold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm border ${
                            lkpdVersion === "v1"
                              ? "bg-amber-600 hover:bg-amber-500 border-amber-500"
                              : "bg-emerald-600 hover:bg-emerald-500 border-emerald-500"
                          }`}
                          id="export-lkpd-to-docs-btn"
                          title="Salin dokumen rapi ke clipboard dan buka tab baru Google Dokumen"
                        >
                          <Copy className="h-4 w-4" />
                          Ekspor ke Google Dokumen
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Paper Document Preview Section */}
                      <div className="flex-1 overflow-y-auto max-h-[620px] p-6 border-2 border-slate-150 rounded-2xl bg-white font-sans text-xs space-y-6 shadow-inner" id="lkpd-document-area">
                        
                        {/* Title Header Block */}
                        <div className="text-center border-b-4 border-double border-slate-800 pb-4">
                          <h1 className="text-base font-black text-slate-900 tracking-wide uppercase">
                            LEMBAR KERJA PESERTA DIDIK (LKPD) INTERAKTIF
                          </h1>
                          <h2 className="text-xs font-bold text-slate-500 italic mt-1">
                            &ldquo;{generatedLkpd.judulLKPD}&rdquo;
                          </h2>
                          <div className="grid grid-cols-2 gap-4 text-left font-mono text-[10px] text-slate-600 mt-3 border-t border-dashed border-slate-200 pt-2">
                            <div><strong>Mata Pelajaran:</strong> {generatedLkpd.metaMataPelajaran}</div>
                            <div><strong>Kelas / Fase:</strong> {generatedLkpd.metaKelasFase}</div>
                          </div>
                        </div>

                        {/* Blank Identities for Students to fill */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                          <h4 className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1">
                            Identitas Peserta Didik
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-500 shrink-0">Nama Siswa:</span>
                              <div className="flex-1 border-b border-dashed border-slate-300 h-5"></div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-500 shrink-0">No. Absen:</span>
                              <div className="flex-1 border-b border-dashed border-slate-300 h-5"></div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-500 shrink-0">Hari, Tanggal:</span>
                              <div className="flex-1 border-b border-dashed border-slate-300 h-5"></div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-500 shrink-0">Tanda Tangan:</span>
                              <div className="flex-1 border-b border-dashed border-slate-300 h-5"></div>
                            </div>
                          </div>
                        </div>

                        {/* Objective */}
                        <div className="border-l-4 border-emerald-500 bg-emerald-50/50 p-3 rounded-r-xl">
                          <span className="font-bold text-emerald-800 text-[10px] uppercase tracking-wider block">🎯 Tujuan Pembelajaran</span>
                          <p className="text-xs text-emerald-950 font-semibold leading-relaxed mt-0.5 italic">
                            &ldquo;{generatedLkpd.tujuanPembelajaranRingkas}&rdquo;
                          </p>
                        </div>

                        {/* Tools, Materials & Instructions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border border-slate-200 bg-slate-50/20 rounded-xl p-3.5 space-y-2">
                            <span className="font-extrabold text-slate-900 text-[10px] uppercase tracking-wider block border-b border-slate-200 pb-1">
                              🛠️ Alat & Bahan
                            </span>
                            <ul className="list-disc list-inside space-y-1 text-slate-700 font-semibold text-[11px]">
                              {generatedLkpd.alatBahan.map((item: string, idx: number) => (
                                <li key={idx} className="pl-1">{item}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="border border-slate-200 bg-slate-50/20 rounded-xl p-3.5 space-y-2">
                            <span className="font-extrabold text-slate-900 text-[10px] uppercase tracking-wider block border-b border-slate-200 pb-1">
                              📋 Petunjuk Kerja
                            </span>
                            <ol className="list-decimal list-inside space-y-1 text-slate-700 font-semibold text-[11px]">
                              {generatedLkpd.petunjuk.map((item: string, idx: number) => (
                                <li key={idx} className="pl-1">{item}</li>
                              ))}
                            </ol>
                          </div>
                        </div>

                        {/* Integrated Alur Kegiatan & Pengalaman Belajar Mendalam (NOT table as required) */}
                        <div className="space-y-6">
                          <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest border-b-2 border-slate-100 pb-2 flex items-center gap-1.5">
                            <Layers className="h-4.5 w-4.5 text-emerald-600" />
                            Alur Kegiatan & Aktivitas Belajar Siswa
                          </h3>

                          <div className="space-y-6">
                            {generatedLkpd.alurKegiatan.map((langkah: any) => (
                              <div 
                                key={langkah.noLangkah} 
                                className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-white shadow-sm hover:border-slate-300 transition-all"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                  <span className="font-extrabold text-slate-900 text-xs">
                                    Langkah {langkah.noLangkah}: {langkah.namaLangkah}
                                  </span>
                                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white ${
                                    langkah.tipeFokus === "Memahami"
                                      ? "bg-green-500"
                                      : langkah.tipeFokus === "Mengaplikasikan"
                                      ? "bg-emerald-500"
                                      : langkah.tipeFokus === "Merefleksikan"
                                      ? "bg-amber-500"
                                      : "bg-slate-500"
                                  }`}>
                                    {langkah.tipeFokus}
                                  </span>
                                </div>

                                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                                  <strong>Aktivitas Anda:</strong> {langkah.deskripsiAktivitas}
                                </p>

                                {langkah.kontenMediaBahan && (
                                  <div className="bg-slate-50 border-l-4 border-slate-400 p-3 text-[11px] text-slate-700 leading-relaxed font-medium rounded-r-lg whitespace-pre-wrap">
                                    {langkah.kontenMediaBahan}
                                  </div>
                                )}

                                <div className="space-y-3 pt-1">
                                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Lembar Tugas & Jawab</span>
                                  <ol className="list-decimal list-inside space-y-4 text-xs font-semibold text-slate-900">
                                    {langkah.pertanyaanAtauTugas.map((task: string, tIdx: number) => (
                                      <li key={tIdx} className="space-y-2 pl-1">
                                        <span className="text-slate-800 font-bold">{task}</span>
                                        <div className="border border-slate-200 rounded-lg h-20 bg-slate-50/50 p-2 font-mono text-[9px] text-slate-300 select-none flex items-start justify-start">
                                          Tuliskan jawaban peserta didik di sini...
                                        </div>
                                      </li>
                                    ))}
                                  </ol>
                                </div>

                                <div className="text-[10px] text-slate-500 italic bg-slate-100 p-2 rounded-lg">
                                  💡 <strong>Panduan Siswa:</strong> {langkah.instruksiPengerjaan}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Penutup and Checklist Evaluasi Diri */}
                        <div className="pt-4 border-t-2 border-dashed border-slate-200 space-y-5">
                          <div className="text-center font-bold text-emerald-900 italic text-sm leading-relaxed">
                            &ldquo;{generatedLkpd.penutup.ucapanSemangat}&rdquo;
                          </div>

                          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                            <span className="font-extrabold text-slate-900 text-[10px] uppercase tracking-wider block border-b border-slate-200 pb-1">
                              ✅ Checklist Evaluasi Pemahaman Diri Siswa
                            </span>
                            <div className="space-y-2">
                              {generatedLkpd.penutup.checklistMandiri.map((item: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                  <div className="w-4 h-4 rounded border border-slate-300 bg-white shrink-0"></div>
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="border border-dashed border-emerald-200 bg-emerald-50/30 rounded-xl p-4 text-[11px] text-emerald-900">
                            <strong>Catatan Pembelajaran & Rekomendasi Guru:</strong>
                            <p className="mt-1 leading-relaxed text-slate-600 font-semibold italic">
                              &ldquo;{generatedLkpd.penutup.catatanGuruTemplate}&rdquo;
                            </p>
                            <div className="mt-3 border-b border-dotted border-emerald-400 h-1"></div>
                          </div>
                        </div>

                        {/* Print Footer */}
                        <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
                          Dokumen Rencana LKPD Interaktif - Kurikulum Merdeka - SADAR PJOK SD
                        </div>

                      </div>
                    </div>
                  ) : (
                    /* Initial Placeholder */
                    <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-center py-16" id="lkpd-placeholder">
                      <FileText className="h-14 w-14 text-amber-300 animate-pulse" />
                      <h4 className="font-bold text-slate-600 text-sm">Lembar Kerja Peserta Didik (LKPD) Belum Dibuat</h4>
                      <p className="text-xs max-w-sm mx-auto text-slate-400 leading-relaxed">
                        Tentukan pilihan prompt (Versi 1 atau Versi 2), lengkapi masukan parameter kurikulum di panel kiri, lalu klik <strong>&quot;Susun Lembar Kerja (LKPD) AI&quot;</strong> untuk merancang LKPD yang rapi dan kontekstual.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 4: SPORTS GEAR INVENTORY */}
            {activeTab === "inventory" && (
              <motion.div
                key="tab-inventory"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
                id="panel-inventory"
              >
                {/* Search & Action bar */}
                <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm" id="inventory-toolbar">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari alat olahraga..."
                      value={inventorySearchQuery}
                      onChange={(e) => setInventorySearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl w-full focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold"
                      id="inventory-search-input"
                    />
                  </div>

                  <button
                    onClick={handleOpenAddInventory}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm w-full md:w-auto justify-center cursor-pointer border border-emerald-500 shadow-emerald-950/10"
                    id="add-inventory-btn"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Alat Baru
                  </button>
                </div>

                {/* Grid layout for list + edit form */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="inventory-grid-root">
                  
                  {/* Left list: 8 columns */}
                  <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col" id="inventory-table-container">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                        Gudang Sarana Prasarana & Peralatan PJOK SD
                      </h4>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full font-bold">
                        {filteredInventory.length} Jenis Barang
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse" id="inventory-table">
                        <thead>
                          <tr className="border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/40">
                            <th className="px-4 py-3">Nama Alat</th>
                            <th className="px-4 py-3">Kategori</th>
                            <th className="px-4 py-3 text-center">Jumlah</th>
                            <th className="px-4 py-3 text-center">Kondisi Baik</th>
                            <th className="px-4 py-3 text-center">Rusak/Hilang</th>
                            <th className="px-4 py-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {filteredInventory.length > 0 ? (
                            filteredInventory.map((item) => {
                              const isDamagedHigh = item.damagedCondition > item.total * 0.3;
                              return (
                                <tr key={item.id} id={`inventory-row-${item.id}`} className="hover:bg-slate-50/50 transition-all">
                                  <td className="px-4 py-3.5">
                                    <div className="font-extrabold text-slate-900 leading-tight">{item.name}</div>
                                    {item.notes && <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs font-medium">{item.notes}</p>}
                                  </td>

                                  <td className="px-4 py-3.5 text-xs">
                                    <span className="px-2 py-0.5 font-bold rounded-lg border bg-slate-50 text-slate-700 border-slate-200 uppercase text-[10px]">
                                      {item.category}
                                    </span>
                                  </td>

                                  <td className="px-4 py-3.5 text-center font-bold font-mono">
                                    {item.total} <span className="text-[10px] text-slate-400 font-sans font-normal">{item.unit}</span>
                                  </td>

                                  <td className="px-4 py-3.5 text-center text-emerald-600 font-bold font-mono">
                                    {item.goodCondition}
                                  </td>

                                  <td className="px-4 py-3.5 text-center">
                                    <span className={`font-bold font-mono ${isDamagedHigh ? "text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded" : "text-slate-500"}`}>
                                      {item.damagedCondition}
                                    </span>
                                  </td>

                                  <td className="px-4 py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        id={`edit-inv-${item.id}`}
                                        onClick={() => handleOpenEditInventory(item)}
                                        className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded transition-all"
                                        title="Edit Kondisi"
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </button>
                                      <button
                                        id={`delete-inv-${item.id}`}
                                        onClick={() => handleDeleteInventory(item.id)}
                                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded transition-all"
                                        title="Hapus"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                                Gudang kosong atau tidak ada alat olahraga yang cocok.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right: Form - 4 columns */}
                  <div className="lg:col-span-4" id="inventory-form-panel">
                    {isEditingInventory ? (
                      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4" id="inventory-form-card">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            {selectedInventoryItem ? "Edit Data Peralatan" : "Tambah Alat Olahraga Baru"}
                          </h4>
                          <button
                            onClick={() => setIsEditingInventory(false)}
                            className="text-xs font-bold text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>

                        <form onSubmit={handleSaveInventory} className="space-y-3.5 text-xs">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Nama Alat</label>
                            <input
                              type="text"
                              required
                              value={inventoryForm.name || ""}
                              onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                              placeholder="e.g. Bola Voli Mikasa"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                              id="input-inv-name"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Kategori</label>
                              <select
                                value={inventoryForm.category || "Bola"}
                                onChange={(e) => setInventoryForm({ ...inventoryForm, category: e.target.value as any })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white"
                                id="input-inv-category"
                              >
                                <option value="Bola">Bola Besar/Kecil</option>
                                <option value="Senam">Senam / Matras</option>
                                <option value="Atletik">Atletik / Track</option>
                                <option value="Pendukung">Alat Pendukung</option>
                                <option value="Lainnya">Kategori Lain</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Satuan</label>
                              <input
                                type="text"
                                required
                                value={inventoryForm.unit || "Buah"}
                                onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })}
                                placeholder="e.g. Buah, Set, Pasang"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                id="input-inv-unit"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Total</label>
                              <input
                                type="number"
                                required
                                value={inventoryForm.total || ""}
                                onChange={(e) => {
                                  const total = Number(e.target.value);
                                  setInventoryForm({
                                    ...inventoryForm,
                                    total,
                                    goodCondition: total,
                                    damagedCondition: 0
                                  });
                                }}
                                className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                id="input-inv-total"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kondisi Baik</label>
                              <input
                                type="number"
                                required
                                value={inventoryForm.goodCondition ?? ""}
                                onChange={(e) => {
                                  const good = Number(e.target.value);
                                  const total = inventoryForm.total || 0;
                                  setInventoryForm({
                                    ...inventoryForm,
                                    goodCondition: good,
                                    damagedCondition: Math.max(0, total - good)
                                  });
                                }}
                                className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                id="input-inv-good"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Rusak</label>
                              <input
                                type="number"
                                required
                                value={inventoryForm.damagedCondition ?? ""}
                                onChange={(e) => {
                                  const damaged = Number(e.target.value);
                                  const total = inventoryForm.total || 0;
                                  setInventoryForm({
                                    ...inventoryForm,
                                    damagedCondition: damaged,
                                    goodCondition: Math.max(0, total - damaged)
                                  });
                                }}
                                className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                id="input-inv-damaged"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Catatan Keterangan</label>
                            <textarea
                              value={inventoryForm.notes || ""}
                              onChange={(e) => setInventoryForm({ ...inventoryForm, notes: e.target.value })}
                              placeholder="Kondisi fisik, merk, letak rak penyimpanan..."
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 h-16 resize-none"
                              id="input-inv-notes"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-sm cursor-pointer border border-emerald-500 shadow-emerald-950/10"
                            id="save-inventory-submit-btn"
                          >
                            Simpan ke Inventaris
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 space-y-2" id="inventory-placeholder">
                        <Package className="h-10 w-10 mx-auto text-slate-300 animate-pulse" />
                        <h4 className="font-extrabold text-slate-600 text-sm">Gudang Olahraga Aktif</h4>
                        <p className="text-xs leading-relaxed max-w-[220px] mx-auto font-medium">
                          Klik tombol edit pada item inventaris, atau klik tombol <strong>&quot;Tambah Alat Baru&quot;</strong> untuk memodifikasi log gudang.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 5: WEEKLY TEACHING SCHEDULE */}
            {activeTab === "schedule" && (
              <motion.div
                key="tab-schedule"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
                id="panel-schedule"
              >
                {/* Header toolbar */}
                <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm" id="schedule-toolbar">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Alokasi Mengajar Mingguan PJOK</h4>
                    <p className="text-xs text-slate-400 font-semibold">Mencegah bentrokan pemakaian Lapangan dan Aula Sekolah</p>
                  </div>

                  <button
                    onClick={handleOpenAddSchedule}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm w-full sm:w-auto justify-center cursor-pointer border border-emerald-500 shadow-emerald-950/10"
                    id="add-schedule-btn"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Alokasi Kelas
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="schedule-grid-root">
                  
                  {/* Calendar Grid (Days sorted) */}
                  <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-5" id="schedule-calendar-container">
                    {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((dayName) => {
                      const dayItems = schedule.filter((s) => s.day === dayName);
                      return (
                        <div key={dayName} className="space-y-2" id={`schedule-day-${dayName}`}>
                          <h5 className="text-xs font-bold text-slate-500 border-b border-slate-100 pb-1 flex items-center gap-2 uppercase tracking-wider">
                            <span className="w-1.5 h-3 bg-emerald-600 rounded-full"></span>
                            Hari {dayName}
                          </h5>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {dayItems.length > 0 ? (
                              dayItems.map((item) => (
                                <div
                                  key={item.id}
                                  id={`schedule-item-${item.id}`}
                                  className="p-3 bg-slate-50/50 rounded-xl border border-slate-150 hover:border-emerald-400 transition-all flex items-start justify-between gap-2"
                                >
                                  <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase">
                                        {item.grade}
                                      </span>
                                      <span className="text-[9px] text-slate-400 font-mono font-bold leading-none">{item.timeSlot}</span>
                                    </div>
                                    <h6 className="font-bold text-slate-900 text-xs truncate">{item.topic}</h6>
                                    <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                                      <MapPin className="h-3 w-3 text-slate-400" />
                                      Lokasi: {item.location}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      id={`edit-sch-${item.id}`}
                                      onClick={() => handleOpenEditSchedule(item)}
                                      className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-all"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      id={`delete-sch-${item.id}`}
                                      onClick={() => handleDeleteSchedule(item.id)}
                                      className="p-1 text-slate-400 hover:text-red-500 rounded transition-all"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-[11px] text-slate-400 italic py-1">Tidak ada jadwal kelas mengajar.</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Form panel schedule - 4 columns */}
                  <div className="lg:col-span-4" id="schedule-form-panel">
                    {isEditingSchedule ? (
                      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4" id="schedule-form-card">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            {selectedScheduleItem ? "Edit Jadwal Mengajar" : "Atur Jadwal Baru"}
                          </h4>
                          <button
                            onClick={() => setIsEditingSchedule(false)}
                            className="text-xs font-bold text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>

                        <form onSubmit={handleSaveSchedule} className="space-y-3.5 text-xs">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Hari</label>
                              <select
                                value={scheduleForm.day || "Senin"}
                                onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white"
                                id="input-sch-day"
                              >
                                <option value="Senin">Senin</option>
                                <option value="Selasa">Selasa</option>
                                <option value="Rabu">Rabu</option>
                                <option value="Kamis">Kamis</option>
                                <option value="Jumat">Jumat</option>
                                <option value="Sabtu">Sabtu</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Lokasi</label>
                              <select
                                value={scheduleForm.location || "Lapangan"}
                                onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value as any })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white"
                                id="input-sch-location"
                              >
                                <option value="Lapangan">Lapangan Sekolah</option>
                                <option value="Aula">Aula Serbaguna</option>
                                <option value="Ruang Kelas">Ruang Kelas Teori</option>
                                <option value="Selasar">Selasar / Indoor</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Target Kelas</label>
                              <input
                                type="text"
                                required
                                value={scheduleForm.grade || ""}
                                onChange={(e) => setScheduleForm({ ...scheduleForm, grade: e.target.value })}
                                placeholder="e.g. Kelas V-B"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                id="input-sch-grade"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Jam Belajar</label>
                              <input
                                type="text"
                                required
                                value={scheduleForm.timeSlot || ""}
                                onChange={(e) => setScheduleForm({ ...scheduleForm, timeSlot: e.target.value })}
                                placeholder="e.g. 07:15 - 08:35"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                id="input-sch-timeslot"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Topik Materi</label>
                            <input
                              type="text"
                              required
                              value={scheduleForm.topic || ""}
                              onChange={(e) => setScheduleForm({ ...scheduleForm, topic: e.target.value })}
                              placeholder="e.g. Atletik Start Jongkok"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                              id="input-sch-topic"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-sm cursor-pointer border border-emerald-500 shadow-emerald-950/10"
                            id="save-schedule-submit-btn"
                          >
                            Simpan Alokasi Jadwal
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 space-y-2" id="schedule-placeholder">
                        <Calendar className="h-10 w-10 mx-auto text-slate-300 animate-pulse" />
                        <h4 className="font-extrabold text-slate-600 text-sm">Kalender Mengajar</h4>
                        <p className="text-xs leading-relaxed max-w-[220px] mx-auto font-medium">
                          Atur alokasi jam mengajar mingguan Anda secara rapi. Klik icon edit pada alokasi hari bersangkutan, atau klik <strong>&quot;Tambah Alokasi Kelas&quot;</strong>.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 6: ROMBEL & BULK IMPORT MANAGEMENT */}
            {activeTab === "rombel" && (
              <motion.div
                key="tab-rombel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
                id="panel-rombel"
              >
                {/* Header overview */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6" id="rombel-header">
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-slate-900">Kelola Rombel & Impor Massal Siswa</h3>
                    <p className="text-xs text-slate-400 font-semibold">Organisir rombongan belajar (kelas) dan unggah ratusan data siswa secara cepat menggunakan format Excel/CSV.</p>
                  </div>
                  <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <button
                      onClick={handleDownloadTemplate}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer border border-slate-200"
                      id="download-template-top-btn"
                    >
                      <FileDown className="h-4 w-4 text-emerald-600" />
                      Unduh Template Excel (.CSV)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="rombel-grid-root">
                  {/* Left block - 5 columns: Rombel Management */}
                  <div className="lg:col-span-5 space-y-6" id="rombel-management-col">
                    
                    {/* Add Custom Rombel */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4" id="add-rombel-card">
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <Plus className="h-4 w-4 text-emerald-600" />
                        Tambah Rombel Baru
                      </h4>
                      <form onSubmit={handleAddCustomRombel} className="flex gap-2" id="add-rombel-form">
                        <input
                          type="text"
                          required
                          value={newRombelName}
                          onChange={(e) => setNewRombelName(e.target.value)}
                          placeholder="e.g. IV-C atau VI-C"
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm font-semibold text-slate-800"
                          id="input-rombel-name"
                        />
                        <button
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer border border-emerald-500"
                          id="submit-rombel-btn"
                        >
                          Tambah
                        </button>
                      </form>
                    </div>

                    {/* Rombel List */}
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden" id="rombel-list-card">
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                            Daftar Rombongan Belajar Aktif
                          </h4>
                          {selectedRombels.length > 0 && (
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                              {selectedRombels.length} Terpilih
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {customRombels.length > 0 && (
                            <>
                              {selectedRombels.length > 0 && (
                                <button
                                  onClick={handleBulkDeleteRombels}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-extrabold px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 transition-all border border-red-200 shadow-sm cursor-pointer"
                                  id="bulk-delete-rombels-btn"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Hapus Masal ({selectedRombels.length})
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (selectedRombels.length === customRombels.length) {
                                    setSelectedRombels([]);
                                  } else {
                                    setSelectedRombels([...customRombels]);
                                  }
                                }}
                                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase cursor-pointer"
                              >
                                {selectedRombels.length === customRombels.length ? "Batal Pilih" : "Pilih Semua"}
                              </button>
                              <span className="text-slate-200 text-xs">|</span>
                              <button
                                onClick={handleClearAllRombels}
                                className="text-[10px] font-extrabold text-red-500 hover:text-red-600 uppercase cursor-pointer flex items-center gap-1"
                                id="clear-all-rombels-btn"
                              >
                                <Trash2 className="h-3 w-3" />
                                Hapus Semua
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="p-4 space-y-3 max-h-[380px] overflow-y-auto" id="rombels-list-container">
                        {customRombels.length === 0 ? (
                          <div className="text-center py-10 px-4 bg-slate-50/40 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2">
                            <Users className="h-8 w-8 text-slate-300" />
                            <p className="text-xs text-slate-400 font-bold">Tidak ada Rombongan Belajar</p>
                            <p className="text-[10px] text-slate-400 font-semibold max-w-[200px]">Silakan tambah rombel baru menggunakan form di atas.</p>
                          </div>
                        ) : customRombels.map((rombel) => {
                          const studentsInRombel = students.filter(s => s.grade === rombel);
                          const count = studentsInRombel.length;
                          const maleCount = studentsInRombel.filter(s => s.gender === "L").length;
                          const femaleCount = studentsInRombel.filter(s => s.gender === "P").length;
                          
                          // Avg BMI in this rombel
                          const rombelBmis = studentsInRombel.map(s => calculateBMI(s.weight, s.height).bmi);
                          const avgBmi = rombelBmis.length > 0 ? (rombelBmis.reduce((a, b) => a + b, 0) / rombelBmis.length).toFixed(1) : "-";
                          
                          const isRombelSelected = selectedRombels.includes(rombel);

                          return (
                            <div
                              key={rombel}
                              onClick={() => {
                                setViewingRombel(rombel);
                              }}
                              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                                viewingRombel === rombel 
                                  ? "bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-100/70 shadow-sm" 
                                  : "bg-slate-50/50 border-slate-100 hover:bg-emerald-50/30 hover:border-emerald-200"
                              }`}
                              id={`rombel-item-${rombel}`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isRombelSelected) {
                                      setSelectedRombels(prev => prev.filter(r => r !== rombel));
                                    } else {
                                      setSelectedRombels(prev => [...prev, rombel]);
                                    }
                                  }}
                                  className="p-1 cursor-pointer hover:bg-slate-200/50 rounded-lg flex items-center justify-center shrink-0"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isRombelSelected}
                                    onChange={() => {}}
                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                                  />
                                </div>
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-slate-900 text-sm">Rombel {rombel}</span>
                                    <span className="text-[10px] text-slate-400 font-bold font-mono">
                                      {count} Siswa
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3 text-slate-400" />
                                      {maleCount} L / {femaleCount} P
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {rombelToDelete === rombel ? (
                                <div className="flex items-center gap-1.5 shrink-0 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                                  <span className="text-[10px] text-red-600 font-extrabold animate-pulse">Hapus Rombel?</span>
                                  <button
                                    onClick={() => {
                                      executeDeleteRombel(rombel);
                                    }}
                                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-black transition-all cursor-pointer shadow-sm"
                                  >
                                    Ya
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRombelToDelete(null);
                                    }}
                                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                  >
                                    Batal
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => {
                                      setViewingRombel(rombel);
                                    }}
                                    className="px-2 py-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-[11px] font-extrabold transition-all border border-emerald-100 flex items-center gap-0.5 cursor-pointer shadow-sm hover:shadow-md"
                                    title="Kelola Siswa"
                                  >
                                    <Users className="h-3 w-3" />
                                    Siswa
                                  </button>
                                  <button
                                    onClick={() => {
                                      setAttendanceRombel(rombel);
                                      setActiveTab("attendance");
                                    }}
                                    className="px-2 py-1 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-[11px] font-bold transition-all border border-slate-200 flex items-center gap-0.5 cursor-pointer shadow-sm"
                                    title="Buka Absensi Rombel"
                                  >
                                    Absensi
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDeleteCustomRombel(rombel);
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Hapus Rombel"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Right block - 7 columns: Excel & Bulk Upload OR Active Class Roster */}
                  <div className="lg:col-span-7 space-y-6" id="rombel-right-col">
                    {viewingRombel ? (
                      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5 animate-fadeIn" id="view-rombel-students-card">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-slate-900 text-base">Daftar Rombel Kelas {viewingRombel}</h4>
                              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-150 font-mono">
                                {students.filter(s => s.grade === viewingRombel).length} Siswa
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-semibold">Kelola daftar nama, jenis kelamin, dan data personal siswa pada rombel ini.</p>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setStudentForm({
                                  name: "",
                                  gender: "L",
                                  grade: viewingRombel,
                                  height: 135,
                                  weight: 30,
                                  runSpeed: 0,
                                  sitUps: 0,
                                  pushUps: 0,
                                  verticalJump: 0,
                                  runDistance: 0
                                });
                                setIsEditingStudent(true);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-emerald-500 transition-all shadow-sm"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Tambah Siswa
                            </button>
                            
                            <button
                              onClick={() => {
                                setViewingRombel(null);
                                setIsEditingStudent(false);
                                setStudentForm({});
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer border border-slate-200 transition-all"
                            >
                              Impor Massal (.CSV)
                            </button>
                          </div>
                        </div>

                        {/* Inline Student Form */}
                        {isEditingStudent && studentForm.grade === viewingRombel && (
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-4 animate-fadeIn" id="inline-student-editor">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                                {studentForm.id ? "Edit Data Siswa" : "Tambah Siswa Baru"}
                              </h5>
                              <button
                                onClick={() => {
                                  setIsEditingStudent(false);
                                  setStudentForm({});
                                }}
                                className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                            
                            <form onSubmit={handleSaveStudent} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="sm:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                                  Nama Lengkap Siswa
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={studentForm.name || ""}
                                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                                  placeholder="Contoh: Ahmad Fauzi"
                                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white font-semibold text-slate-800"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                                  Jenis Kelamin
                                </label>
                                <select
                                  value={studentForm.gender || "L"}
                                  onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value as "L" | "P" })}
                                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white font-semibold text-slate-700"
                                >
                                  <option value="L">Laki-laki (L)</option>
                                  <option value="P">Perempuan (P)</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                                  Kelas / Rombel
                                </label>
                                <input
                                  type="text"
                                  required
                                  disabled
                                  value={studentForm.grade || ""}
                                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-100 font-semibold text-slate-500"
                                />
                              </div>

                              <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsEditingStudent(false);
                                    setStudentForm({});
                                  }}
                                  className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer transition-all"
                                >
                                  Batal
                                </button>
                                <button
                                  type="submit"
                                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-xs cursor-pointer border border-emerald-600 transition-all shadow-sm"
                                >
                                  Simpan Data
                                </button>
                              </div>
                            </form>
                          </div>
                        )}

                        {/* Student roster table */}
                        <div className="overflow-x-auto border border-slate-150 rounded-2xl bg-slate-50/20">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-150 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="px-4 py-3 w-12 text-center">No</th>
                                <th className="px-4 py-3">Nama Lengkap</th>
                                <th className="px-4 py-3 text-center">J. Kelamin</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm bg-white">
                              {students.filter(s => s.grade === viewingRombel).length > 0 ? (
                                students.filter(s => s.grade === viewingRombel).map((student, idx) => (
                                  <tr key={student.id} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 text-center text-slate-400 font-mono font-bold">{idx + 1}</td>
                                    <td className="px-4 py-3 font-bold text-slate-900">{student.name}</td>
                                    <td className="px-4 py-3 text-center">
                                      <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
                                        student.gender === "L" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "bg-pink-50 text-pink-700 border border-pink-100"
                                      }`}>
                                        {student.gender === "L" ? "Laki-laki" : "Perempuan"}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          onClick={() => {
                                            setStudentForm(student);
                                            setIsEditingStudent(true);
                                          }}
                                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                                          title="Edit Nama / JK"
                                        >
                                          <Edit2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteStudent(student.id)}
                                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                          title="Hapus Siswa"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={4} className="px-4 py-12 text-center text-slate-400 font-bold">
                                    Belum ada data siswa di Rombel ini. Silakan klik &quot;Tambah Siswa&quot; atau gunakan menu &quot;Impor Massal&quot; untuk memasukkan data siswa.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Bulk Upload Area */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5" id="bulk-upload-card">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-900 text-sm">Fitur Upload Data Siswa Secara Massal</h4>
                            <p className="text-xs text-slate-400 font-semibold">Gunakan menu ini untuk menambahkan data nama, jenis kelamin, dan rombel siswa sekaligus.</p>
                          </div>

                          {/* Method Selector Tabs */}
                          <div className="flex bg-slate-100 p-1 rounded-xl" id="import-method-tabs">
                            <button
                              type="button"
                              onClick={() => {
                                setImportMethod("file");
                                setImportPreview([]);
                                setImportError(null);
                                setImportSuccess(null);
                              }}
                              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                importMethod === "file"
                                  ? "bg-white text-slate-800 shadow-sm"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              Unggah File Excel/CSV
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setImportMethod("paste");
                                setImportPreview([]);
                                setImportError(null);
                                setImportSuccess(null);
                              }}
                              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                importMethod === "paste"
                                  ? "bg-white text-slate-800 shadow-sm"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              Copy-Paste dari Excel
                            </button>
                          </div>

                          {importMethod === "file" ? (
                            <>
                              {/* Download section integration */}
                              <div className="bg-emerald-50/50 border border-emerald-100/60 p-4 rounded-xl flex items-start gap-3" id="template-hint-box">
                                <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                <div className="space-y-1 flex-1">
                                  <h5 className="text-xs font-bold text-emerald-900">Belum memiliki template Excel?</h5>
                                  <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
                                    Unduh template standar kami terlebih dahulu, isi data siswa di Excel, simpan dengan format <strong>CSV (Pemisah Titik Koma / Semicolon)</strong>, lalu unggah kembali di bawah ini.
                                  </p>
                                  <button
                                    onClick={handleDownloadTemplate}
                                    className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 underline mt-1.5 block cursor-pointer text-left font-sans"
                                  >
                                    Unduh Template .CSV Sekarang →
                                  </button>
                                </div>
                              </div>

                              {/* Dropzone file uploader */}
                              <div 
                                className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-8 text-center bg-slate-50/30 hover:bg-emerald-50/10 transition-all relative group cursor-pointer"
                                id="bulk-dropzone"
                              >
                                <input
                                  type="file"
                                  accept=".csv, .txt"
                                  onChange={handleFileUpload}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  id="bulk-file-input"
                                />
                                <div className="space-y-3 pointer-events-none">
                                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 group-hover:scale-110 transition-transform">
                                    <FileText className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-700">
                                      {importFile ? `File Terpilih: ${importFile?.name}` : "Pilih File Excel / CSV Hasil Edit Anda"}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                                      Drag & drop file di sini, atau klik untuk menjelajah komputer Anda
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Copy-paste instructions */}
                              <div className="bg-emerald-50/50 border border-emerald-100/60 p-4 rounded-xl flex items-start gap-3" id="paste-hint-box">
                                <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                <div className="space-y-1 flex-1">
                                  <h5 className="text-xs font-bold text-emerald-900">Cara Copy-Paste dari Excel / Google Sheets:</h5>
                                  <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
                                    1. Buka file data siswa Anda di Microsoft Excel atau Google Sheets.<br />
                                    2. Blok kolom data: <strong>Nama</strong>, <strong>Jenis Kelamin (L/P)</strong>, dan <strong>Kelas</strong>.<br />
                                    3. Tekan <strong>Ctrl+C</strong>, klik kotak teks di bawah, lalu tekan <strong>Ctrl+V</strong>.<br />
                                    4. Klik tombol proses untuk memvalidasi dan mempratinjau data.
                                  </p>
                                  <button
                                    onClick={handleDownloadTemplate}
                                    className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 underline mt-1.5 block cursor-pointer text-left font-sans animate-pulse"
                                  >
                                    Unduh Template Acuan .CSV →
                                  </button>
                                </div>
                              </div>

                              {/* Textarea for Excel Paste */}
                              <div className="space-y-3" id="paste-textarea-block">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Tempel Sel Excel di Sini:</label>
                                <textarea
                                  value={pastedText}
                                  onChange={(e) => setPastedText(e.target.value)}
                                  placeholder="Budi Santoso&#9;L&#9;IV-A&#10;Siti Aminah&#9;P&#9;V-B&#10;Randi Hermawan&#9;L&#9;VI-A"
                                  className="w-full h-40 px-3.5 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-xs font-mono text-slate-700 placeholder-slate-400 bg-slate-50/50"
                                  id="pasted-text-input"
                                />
                                <button
                                  type="button"
                                  onClick={handleParsePastedData}
                                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-sm cursor-pointer border border-slate-800"
                                  id="process-paste-btn"
                                >
                                  Proses & Pratinjau Data Salinan
                                </button>
                              </div>
                            </>
                          )}

                          {/* Success / Error Messages */}
                          {importError && (
                            <div className="p-3.5 bg-red-50 text-red-800 border border-red-150 rounded-xl text-xs flex items-center gap-2" id="import-err-msg">
                              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                              <span className="font-semibold">{importError}</span>
                            </div>
                          )}

                          {importSuccess && (
                            <div className="p-3.5 bg-green-50 text-green-800 border border-green-150 rounded-xl text-xs flex items-center gap-2" id="import-ok-msg">
                              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                              <span className="font-semibold">{importSuccess}</span>
                            </div>
                          )}

                          {importPreview.length > 0 && (
                            <div className="space-y-3 border-t border-slate-100 pt-5" id="import-preview-section">
                              <div className="flex items-center justify-between">
                                <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                                  Konfirmasi Hasil Impor ({importPreview.length} Siswa Terdeteksi)
                                </h5>
                                <button
                                  onClick={() => {
                                    setImportPreview([]);
                                    setImportFile(null);
                                  }}
                                  className="text-[11px] font-bold text-slate-400 hover:text-slate-600"
                                >
                                  Batal
                                </button>
                              </div>

                              <div className="border border-slate-150 rounded-xl overflow-hidden max-h-[220px] overflow-y-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500">
                                    <tr>
                                      <th className="px-3 py-2">Nama</th>
                                      <th className="px-3 py-2">JK</th>
                                      <th className="px-3 py-2">Kelas</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {importPreview.map((p, idx) => (
                                      <tr key={idx} className="hover:bg-slate-50/50">
                                        <td className="px-3 py-2 font-bold text-slate-800">{p.name}</td>
                                        <td className="px-3 py-2 text-slate-500">{p.gender}</td>
                                        <td className="px-3 py-2 font-bold text-slate-700">{p.grade}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              <button
                                onClick={handleApplyImport}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-sm cursor-pointer border border-emerald-500 shadow-emerald-950/10 flex items-center justify-center gap-1.5"
                                id="apply-import-btn"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Simpan ke Database Siswa
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Tutorial format Excel/CSV */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3" id="format-tutorial-card">
                          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Format Pengisian Data Excel/CSV</h4>
                          <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4 font-medium leading-relaxed">
                            <li>Kolom 1: <strong>Nama Lengkap</strong> siswa.</li>
                            <li>Kolom 2: <strong>Jenis Kelamin</strong>, isi dengan huruf <strong className="text-slate-800">L</strong> untuk Laki-laki atau <strong className="text-slate-800">P</strong> untuk Perempuan.</li>
                            <li>Kolom 3: <strong>Kelas</strong> (Rombel), contoh: <strong className="text-slate-800">IV-A</strong> atau <strong className="text-slate-800">V-B</strong>.</li>
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 7: ABSENSI SISWA TAKTIS */}
            {activeTab === "attendance" && (
              <motion.div
                key="tab-attendance"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
                id="panel-attendance"
              >
                {/* Upper banner or alert for save success */}
                {attendanceSuccessMessage && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 shadow-sm animate-fade-in" id="attendance-success-banner">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">✓</div>
                    <div className="flex-1">
                      <p className="font-extrabold text-sm text-emerald-950">Berhasil Disimpan!</p>
                      <p className="text-xs text-emerald-700 mt-0.5">{attendanceSuccessMessage}</p>
                    </div>
                  </div>
                )}

                {/* Sub-navigation Switcher: Absensi Harian, Mingguan (1 Bulan), Bulanan, & Satu Semester */}
                <div className="bg-white border border-slate-100 rounded-2xl p-2.5 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-3" id="attendance-subnav">
                  <div className="flex flex-wrap items-center gap-1.5 w-full xl:w-auto p-1 bg-slate-100/90 rounded-xl">
                    <button
                      onClick={() => setAttendanceSubTab("daily")}
                      className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        attendanceSubTab === "daily"
                          ? "bg-white text-emerald-950 shadow-sm border border-slate-200/60"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                      id="tab-btn-daily-attendance"
                    >
                      <ClipboardCheck className="h-4 w-4 text-emerald-600" />
                      Absensi Harian Taktis
                    </button>
                    <button
                      onClick={() => {
                        setMonthlyRecapRombel(attendanceRombel);
                        setAttendanceSubTab("weekly");
                      }}
                      className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        attendanceSubTab === "weekly"
                          ? "bg-white text-indigo-950 shadow-sm border border-slate-200/60"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                      id="tab-btn-weekly-recap"
                    >
                      <Calendar className="h-4 w-4 text-indigo-600" />
                      Rekap Mingguan (1 Bulan)
                    </button>
                    <button
                      onClick={() => {
                        setMonthlyRecapRombel(attendanceRombel);
                        setAttendanceSubTab("monthly");
                      }}
                      className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        attendanceSubTab === "monthly"
                          ? "bg-white text-emerald-950 shadow-sm border border-slate-200/60"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                      id="tab-btn-monthly-recap"
                    >
                      <CalendarDays className="h-4 w-4 text-emerald-600" />
                      Rekapitulasi Absensi Bulanan
                    </button>
                    <button
                      onClick={() => {
                        setMonthlyRecapRombel(attendanceRombel);
                        setAttendanceSubTab("semester");
                      }}
                      className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        attendanceSubTab === "semester"
                          ? "bg-white text-amber-950 shadow-sm border border-slate-200/60"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                      id="tab-btn-semester-recap"
                    >
                      <Award className="h-4 w-4 text-amber-600" />
                      Rekap Satu Semester
                    </button>
                  </div>

                  {attendanceSubTab !== "daily" && (
                    <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-end">
                      <button
                        onClick={
                          attendanceSubTab === "weekly"
                            ? handleExportWeeklyAttendanceExcel
                            : attendanceSubTab === "semester"
                            ? handleExportSemesterAttendanceExcel
                            : handleExportMonthlyAttendanceExcel
                        }
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                        id="btn-export-excel-recap-top"
                      >
                        <FileSpreadsheet className="h-4 w-4 text-emerald-100" />
                        Cetak Excel (.xlsx)
                      </button>
                      <button
                        onClick={
                          attendanceSubTab === "weekly"
                            ? handlePrintWeeklyAttendancePDF
                            : attendanceSubTab === "semester"
                            ? handlePrintSemesterAttendancePDF
                            : handlePrintMonthlyAttendancePDF
                        }
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                        id="btn-print-pdf-recap-top"
                      >
                        <Printer className="h-4 w-4 text-slate-300" />
                        Cetak PDF
                      </button>
                    </div>
                  )}
                </div>

                {/* SUBTAB 1: ABSENSI HARIAN TAKTIS */}
                {attendanceSubTab === "daily" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="attendance-grid">
                    {/* Left panel - 8 columns: Active Attendance Register */}
                    <div className="lg:col-span-8 space-y-6" id="attendance-main-area">
                      
                      {/* Header Controls */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4" id="attendance-controls-card">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-base">Lembar Absensi Harian</h4>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">Kelola kehadiran peserta didik untuk pembelajaran PJOK secara taktis.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleMarkAllPresent}
                              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs rounded-xl transition-all border border-emerald-200 shadow-sm flex items-center gap-1.5 cursor-pointer"
                              title="Hadirkan semua siswa yang ada di rombel terpilih"
                            >
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                              Hadirkan Semua
                            </button>
                            <button
                              onClick={handleSaveAttendance}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all border border-emerald-500 shadow-md shadow-emerald-950/10 flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Simpan Absensi
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Tanggal Kegiatan</label>
                            <input
                              type="date"
                              value={attendanceDate}
                              onChange={(e) => setAttendanceDate(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all font-mono"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Pilih Rombongan Belajar (Rombel)</label>
                            <select
                              value={attendanceRombel}
                              onChange={(e) => {
                                setAttendanceRombel(e.target.value);
                                setMonthlyRecapRombel(e.target.value);
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                            >
                              {customRombels.map((rombel) => (
                                <option key={rombel} value={rombel}>Kelas {rombel}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Students Register Table */}
                      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden" id="attendance-students-card">
                        <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-emerald-600" />
                            Daftar Siswa Rombel {attendanceRombel} ({students.filter((s) => s.grade === attendanceRombel).length} Siswa)
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold font-mono">
                            {attendanceDate}
                          </span>
                        </div>

                        {students.filter((s) => s.grade === attendanceRombel).length === 0 ? (
                          <div className="p-12 text-center space-y-3">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                              <Users className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-700">Rombel Kosong / Belum Diisi</p>
                              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto font-medium">
                                Silakan tambahkan siswa baru di tab <strong>Rombel & Impor Siswa</strong> atau buat data siswa secara massal agar terdaftar pada rombel {attendanceRombel}.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead className="bg-slate-50/70 border-b border-slate-100 font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                                <tr>
                                  <th className="px-5 py-3 text-center w-[8%]">No</th>
                                  <th className="px-5 py-3 w-[45%]">Nama Lengkap Siswa</th>
                                  <th className="px-5 py-3 text-center w-[10%]">JK</th>
                                  <th className="px-5 py-3 text-center w-[22%]">Status Kehadiran</th>
                                  <th className="px-5 py-3 w-[15%]">Catatan Guru</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {students
                                  .filter((s) => s.grade === attendanceRombel)
                                  .map((student, idx) => {
                                    const currentItem = attendanceList[student.id] || { status: "H", notes: "" };
                                    return (
                                      <tr key={student.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-5 py-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                                        <td className="px-5 py-3.5">
                                          <div className="font-extrabold text-slate-900">{student.name}</div>
                                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">ID: {student.id}</div>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                          <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                                            student.gender === "L" ? "bg-emerald-50 text-emerald-600" : "bg-pink-50 text-pink-600"
                                          }`}>
                                            {student.gender}
                                          </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                          <div className="flex justify-center items-center gap-1">
                                            {/* H - Hadir */}
                                            <button
                                              onClick={() => handleToggleStudentAttendance(student.id, "H")}
                                              className={`w-7 h-7 rounded-full text-[11px] font-extrabold flex items-center justify-center transition-all border cursor-pointer ${
                                                currentItem.status === "H"
                                                  ? "bg-emerald-500 border-emerald-600 text-white shadow-sm font-black scale-110"
                                                  : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                              }`}
                                              title="Hadir (H)"
                                            >
                                              H
                                            </button>
                                            {/* S - Sakit */}
                                            <button
                                              onClick={() => handleToggleStudentAttendance(student.id, "S")}
                                              className={`w-7 h-7 rounded-full text-[11px] font-extrabold flex items-center justify-center transition-all border cursor-pointer ${
                                                currentItem.status === "S"
                                                  ? "bg-amber-500 border-amber-600 text-white shadow-sm font-black scale-110"
                                                  : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                              }`}
                                              title="Sakit (S)"
                                            >
                                              S
                                            </button>
                                            {/* I - Izin */}
                                            <button
                                              onClick={() => handleToggleStudentAttendance(student.id, "I")}
                                              className={`w-7 h-7 rounded-full text-[11px] font-extrabold flex items-center justify-center transition-all border cursor-pointer ${
                                                currentItem.status === "I"
                                                  ? "bg-blue-500 border-blue-600 text-white shadow-sm font-black scale-110"
                                                  : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                              }`}
                                              title="Izin (I)"
                                            >
                                              I
                                            </button>
                                            {/* A - Alfa */}
                                            <button
                                              onClick={() => handleToggleStudentAttendance(student.id, "A")}
                                              className={`w-7 h-7 rounded-full text-[11px] font-extrabold flex items-center justify-center transition-all border cursor-pointer ${
                                                currentItem.status === "A"
                                                  ? "bg-red-500 border-red-600 text-white shadow-sm font-black scale-110"
                                                  : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                              }`}
                                              title="Tanpa Keterangan / Alfa (A)"
                                            >
                                              A
                                            </button>
                                          </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                          <input
                                            type="text"
                                            placeholder="Catatan..."
                                            value={currentItem.notes || ""}
                                            onChange={(e) => handleUpdateStudentNote(student.id, e.target.value)}
                                            className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all focus:outline-none"
                                          />
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right panel - 4 columns: Statistics & Settings & History Logs */}
                    <div className="lg:col-span-4 space-y-6" id="attendance-right-sidebar">
                      
                      {/* Live Recapitulation Box */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4" id="live-recap-card">
                        <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Rekapitulasi Kehadiran Hari Ini</h4>
                        
                        <div className="grid grid-cols-2 gap-3" id="live-recap-grid">
                          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-center space-y-1">
                            <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest">Hadir</p>
                            <p className="text-xl font-extrabold text-emerald-950">
                              {Object.values(attendanceList).filter((s) => s.status === "H").length}
                            </p>
                          </div>
                          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-center space-y-1">
                            <p className="text-[10px] font-extrabold text-amber-700 uppercase tracking-widest">Sakit</p>
                            <p className="text-xl font-extrabold text-amber-950">
                              {Object.values(attendanceList).filter((s) => s.status === "S").length}
                            </p>
                          </div>
                          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-center space-y-1">
                            <p className="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest">Izin</p>
                            <p className="text-xl font-extrabold text-blue-950">
                              {Object.values(attendanceList).filter((s) => s.status === "I").length}
                            </p>
                          </div>
                          <div className="bg-red-50/50 border border-red-100 rounded-xl p-3 text-center space-y-1">
                            <p className="text-[10px] font-extrabold text-red-700 uppercase tracking-widest">Alfa</p>
                            <p className="text-xl font-extrabold text-red-950">
                              {Object.values(attendanceList).filter((s) => s.status === "A").length}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* School Settings for Report (Kop & Signature Configurations) */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4" id="report-settings-card">
                        <div className="flex items-center gap-2">
                          <Sliders className="h-4 w-4 text-emerald-600" />
                          <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Kop & Tanda Tangan Cetak</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                          Data ini digunakan sebagai Kop Surat Sekolah resmi serta kolom tanda tangan dokumen PDF, Excel & Word.
                        </p>

                        <div className="space-y-3.5 pt-2" id="report-settings-inputs">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nama Sekolah (Kop)</label>
                            <input
                              type="text"
                              value={schoolName}
                              onChange={(e) => {
                                setSchoolName(e.target.value);
                                saveSchoolConfig("sadar_school_name", e.target.value);
                              }}
                              className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none transition-all"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Alamat / Telepon (Kop)</label>
                            <input
                              type="text"
                              value={schoolAddress}
                              onChange={(e) => {
                                setSchoolAddress(e.target.value);
                                saveSchoolConfig("sadar_school_address", e.target.value);
                              }}
                              className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none transition-all"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nama Kepsek</label>
                              <input
                                type="text"
                                value={headmasterName}
                                onChange={(e) => {
                                  setHeadmasterName(e.target.value);
                                  saveSchoolConfig("sadar_headmaster_name", e.target.value);
                                }}
                                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-800 focus:outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">NIP Kepsek</label>
                              <input
                                type="text"
                                value={headmasterNip}
                                onChange={(e) => {
                                  setHeadmasterNip(e.target.value);
                                  saveSchoolConfig("sadar_headmaster_nip", e.target.value);
                                }}
                                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-700 focus:outline-none transition-all"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nama Guru PJOK</label>
                              <input
                                type="text"
                                value={teacherName}
                                onChange={(e) => {
                                  setTeacherName(e.target.value);
                                  saveSchoolConfig("sadar_teacher_name", e.target.value);
                                }}
                                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-800 focus:outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">NIP Guru</label>
                              <input
                                type="text"
                                value={teacherNip}
                                onChange={(e) => {
                                  setTeacherNip(e.target.value);
                                  saveSchoolConfig("sadar_teacher_nip", e.target.value);
                                }}
                                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-700 focus:outline-none transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Saved Logs History (with print PDF, Excel, and Word exports) */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4" id="attendance-history-card">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Riwayat Absensi Harian</h4>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                            {attendanceRecords.length} Sesi
                          </span>
                        </div>
                        
                        {attendanceRecords.length === 0 ? (
                          <p className="text-xs text-slate-400 font-medium text-center py-4">Belum ada rekaman absensi yang tersimpan.</p>
                        ) : (
                          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1" id="saved-attendance-logs-list">
                            {attendanceRecords.map((rec) => {
                              const hCount = rec.students.filter((s: any) => s.status === "H").length;
                              const sCount = rec.students.filter((s: any) => s.status === "S").length;
                              const iCount = rec.students.filter((s: any) => s.status === "I").length;
                              const aCount = rec.students.filter((s: any) => s.status === "A").length;
                              
                              return (
                                <div key={rec.id} className="p-3 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-150 transition-all space-y-2.5 hover:shadow-sm" id={`log-item-${rec.id}`}>
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h5 className="text-xs font-bold text-slate-950">Rombel {rec.rombel}</h5>
                                      <p className="text-[10px] text-slate-400 font-bold font-mono mt-0.5">{rec.date}</p>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteAttendanceRecord(rec.id)}
                                      className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                                      title="Hapus Rekaman Absensi"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>

                                  <div className="flex flex-wrap gap-1.5 text-[9px] font-black uppercase">
                                    <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100">H: {hCount}</span>
                                    <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-100">S: {sCount}</span>
                                    <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">I: {iCount}</span>
                                    <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-100">A: {aCount}</span>
                                  </div>

                                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                                    <button
                                      onClick={() => handleExportDailyAttendanceExcel(rec)}
                                      className="py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer"
                                      title="Ekspor ke format Excel Spreadsheet (.xlsx)"
                                    >
                                      <FileSpreadsheet className="h-3 w-3 text-emerald-600" />
                                      Excel
                                    </button>
                                    <button
                                      onClick={() => handlePrintPDF(rec)}
                                      className="py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer"
                                      title="Cetak format PDF Laporan Rapi"
                                    >
                                      <Printer className="h-3 w-3 text-slate-500" />
                                      PDF
                                    </button>
                                    <button
                                      onClick={() => handlePrintWord(rec)}
                                      className="py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer"
                                      title="Ekspor Ke Ms Word format rapi"
                                    >
                                      <FileDown className="h-3 w-3 text-slate-500" />
                                      Word
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: REKAPITULASI ABSENSI BULANAN SISWA */}
                {attendanceSubTab === "monthly" && (() => {
                  const daysInRecapMonth = new Date(monthlyRecapYear, monthlyRecapMonth, 0).getDate();
                  const recapDaysArray = Array.from({ length: daysInRecapMonth }, (_, i) => i + 1);
                  const recapMonthPrefix = `${monthlyRecapYear}-${String(monthlyRecapMonth).padStart(2, "0")}`;
                  const recapRombelStudents = students.filter((s) => s.grade === monthlyRecapRombel);
                  const filteredRecapStudents = recapRombelStudents.filter((s) =>
                    s.name.toLowerCase().includes(monthlyRecapSearch.toLowerCase()) ||
                    s.id.toLowerCase().includes(monthlyRecapSearch.toLowerCase())
                  );
                  const recapMonthRecords = attendanceRecords.filter(
                    (r) => r.rombel === monthlyRecapRombel && r.date.startsWith(recapMonthPrefix)
                  );
                  const recapActiveDates = recapMonthRecords.map((r) => r.date);

                  let recapGrandH = 0;
                  let recapGrandS = 0;
                  let recapGrandI = 0;
                  let recapGrandA = 0;

                  recapRombelStudents.forEach((std) => {
                    recapMonthRecords.forEach((rec) => {
                      const sRec = rec.students.find((s: any) => s.studentId === std.id);
                      if (sRec?.status === "H") recapGrandH++;
                      else if (sRec?.status === "S") recapGrandS++;
                      else if (sRec?.status === "I") recapGrandI++;
                      else if (sRec?.status === "A") recapGrandA++;
                    });
                  });

                  const recapGrandTotal = recapGrandH + recapGrandS + recapGrandI + recapGrandA;
                  const recapAvgPercent = recapGrandTotal > 0 ? ((recapGrandH / recapGrandTotal) * 100).toFixed(1) : "100.0";
                  const currentMonthLabel = MONTHS_OPTIONS.find((m) => m.value === monthlyRecapMonth)?.label || "Bulan";

                  return (
                    <div className="space-y-6" id="monthly-recap-container">
                      {/* Filter & Control Bar */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4" id="monthly-recap-filter-card">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                              <CalendarDays className="h-5 w-5 text-emerald-600" />
                              Rekapitulasi Presensi Bulanan PJOK
                            </h4>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                              Matriks rekapitulasi kehadiran peserta didik per tanggal, kalkulasi persentase, dan pencetakan dokumen resmi.
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={handleExportMonthlyAttendanceExcel}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                              title="Ekspor rekap kehadiran ke format Excel (.xlsx)"
                              id="btn-export-excel-monthly-card"
                            >
                              <FileSpreadsheet className="h-4 w-4" />
                              Ekspor Excel (.xlsx)
                            </button>
                            <button
                              onClick={handlePrintMonthlyAttendancePDF}
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                              title="Cetak format PDF Landscape"
                              id="btn-print-pdf-monthly-card"
                            >
                              <Printer className="h-4 w-4" />
                              Cetak PDF
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Pilih Rombel</label>
                            <select
                              value={monthlyRecapRombel}
                              onChange={(e) => setMonthlyRecapRombel(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                            >
                              {customRombels.map((rombel) => (
                                <option key={rombel} value={rombel}>Kelas {rombel}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Pilih Bulan</label>
                            <select
                              value={monthlyRecapMonth}
                              onChange={(e) => setMonthlyRecapMonth(Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                            >
                              {MONTHS_OPTIONS.map((m) => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Pilih Tahun</label>
                            <select
                              value={monthlyRecapYear}
                              onChange={(e) => setMonthlyRecapYear(Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                            >
                              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((yr) => (
                                <option key={yr} value={yr}>Tahun {yr}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Cari Nama Siswa</label>
                            <div className="relative">
                              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Filter siswa..."
                                value={monthlyRecapSearch}
                                onChange={(e) => setMonthlyRecapSearch(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Summary Metric Cards (Bento Grid) */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="monthly-metrics-grid">
                        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-1">
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            <span>Total Siswa</span>
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                          </p>
                          <div className="flex items-baseline gap-1.5">
                            <p className="text-2xl font-black text-slate-900">{recapRombelStudents.length}</p>
                            <p className="text-[11px] font-bold text-slate-400">Siswa (Rombel {monthlyRecapRombel})</p>
                          </div>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-1">
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            <span>Sesi Pertemuan</span>
                            <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                          </p>
                          <div className="flex items-baseline gap-1.5">
                            <p className="text-2xl font-black text-emerald-600">{recapMonthRecords.length}</p>
                            <p className="text-[11px] font-bold text-slate-400">Hari di {currentMonthLabel}</p>
                          </div>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-1">
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            <span>Rata-Rata Hadir</span>
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                          </p>
                          <div className="flex items-baseline gap-1.5">
                            <p className="text-2xl font-black text-emerald-700">{recapAvgPercent}%</p>
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100">
                              {Number(recapAvgPercent) >= 85 ? "Optimal" : Number(recapAvgPercent) >= 70 ? "Cukup" : "Perhatian"}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-1">
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            <span>Distribusi Kehadiran</span>
                            <Activity className="h-3.5 w-3.5 text-blue-500" />
                          </p>
                          <div className="flex items-center gap-1.5 pt-1 text-[11px] font-black">
                            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100" title="Hadir">H:{recapGrandH}</span>
                            <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100" title="Sakit">S:{recapGrandS}</span>
                            <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100" title="Izin">I:{recapGrandI}</span>
                            <span className="text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-100" title="Alfa">A:{recapGrandA}</span>
                          </div>
                        </div>
                      </div>

                      {/* Main Interactive Matrix Table */}
                      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden" id="monthly-matrix-card">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Table className="h-4 w-4 text-emerald-600" />
                            <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                              Matriks Presensi: Kelas {monthlyRecapRombel} • {currentMonthLabel} {monthlyRecapYear}
                            </h5>
                          </div>
                          <div className="text-[11px] text-slate-500 font-semibold">
                            Menampilkan <strong className="text-slate-800">{filteredRecapStudents.length}</strong> dari {recapRombelStudents.length} siswa
                          </div>
                        </div>

                        {recapRombelStudents.length === 0 ? (
                          <div className="p-12 text-center space-y-3">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                              <Users className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-700">Tidak ada siswa di Rombel {monthlyRecapRombel}</p>
                              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto font-medium">
                                Pastikan rombel ini memiliki data siswa terdaftar pada tab Rombel & Impor Siswa.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="overflow-x-auto max-w-full">
                            <table className="w-full text-left text-xs border-collapse min-w-[950px]">
                              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-bold">
                                <tr>
                                  <th rowSpan={2} className="px-3 py-2 text-center border-r border-slate-200 w-10 sticky left-0 bg-slate-50 z-10">No</th>
                                  <th rowSpan={2} className="px-3 py-2 border-r border-slate-200 min-w-[180px] sticky left-10 bg-slate-50 z-10">Nama Lengkap Siswa</th>
                                  <th rowSpan={2} className="px-2 py-2 text-center border-r border-slate-200 w-10">JK</th>
                                  <th colSpan={daysInRecapMonth} className="px-2 py-1.5 text-center border-r border-slate-200 bg-slate-100/70 font-extrabold text-slate-700">
                                    Tanggal Pembelajaran PJOK Bulan {currentMonthLabel}
                                  </th>
                                  <th colSpan={4} className="px-2 py-1.5 text-center border-r border-slate-200 bg-emerald-50 text-emerald-900 font-extrabold">
                                    Akumulasi
                                  </th>
                                  <th rowSpan={2} className="px-2 py-2 text-center border-r border-slate-200 w-14 font-extrabold text-slate-800">Total Sesi</th>
                                  <th rowSpan={2} className="px-3 py-2 text-center w-20 font-extrabold text-emerald-900 bg-emerald-50/70">% Hadir</th>
                                </tr>
                                <tr>
                                  {recapDaysArray.map((dayNum) => {
                                    const dateStr = `${recapMonthPrefix}-${String(dayNum).padStart(2, "0")}`;
                                    const hasSession = recapActiveDates.includes(dateStr);
                                    return (
                                      <th
                                        key={dayNum}
                                        className={`px-1 py-1 text-center font-mono text-[9px] w-6 border-r border-slate-200 ${
                                          hasSession
                                            ? "bg-emerald-100 text-emerald-950 font-black"
                                            : "text-slate-400 font-normal"
                                        }`}
                                        title={`Tanggal ${dayNum} ${currentMonthLabel} ${hasSession ? "(Ada Sesi Absensi)" : ""}`}
                                      >
                                        {dayNum}
                                      </th>
                                    );
                                  })}
                                  <th className="px-1.5 py-1 text-center font-bold text-[9px] w-7 bg-emerald-100/60 text-emerald-800 border-r border-slate-200">H</th>
                                  <th className="px-1.5 py-1 text-center font-bold text-[9px] w-7 bg-amber-100/60 text-amber-800 border-r border-slate-200">S</th>
                                  <th className="px-1.5 py-1 text-center font-bold text-[9px] w-7 bg-blue-100/60 text-blue-800 border-r border-slate-200">I</th>
                                  <th className="px-1.5 py-1 text-center font-bold text-[9px] w-7 bg-red-100/60 text-red-800 border-r border-slate-200">A</th>
                                </tr>
                              </thead>

                              <tbody className="divide-y divide-slate-100">
                                {filteredRecapStudents.map((std, idx) => {
                                  let sH = 0;
                                  let sS = 0;
                                  let sI = 0;
                                  let sA = 0;

                                  const dayCells = recapDaysArray.map((dayNum) => {
                                    const dateStr = `${recapMonthPrefix}-${String(dayNum).padStart(2, "0")}`;
                                    const rec = recapMonthRecords.find((r) => r.date === dateStr);
                                    if (rec) {
                                      const sRec = rec.students.find((s: any) => s.studentId === std.id);
                                      const status = sRec?.status || "-";
                                      if (status === "H") sH++;
                                      else if (status === "S") sS++;
                                      else if (status === "I") sI++;
                                      else if (status === "A") sA++;

                                      let badgeCls = "bg-slate-100 text-slate-400";
                                      if (status === "H") badgeCls = "bg-emerald-500 text-white font-black shadow-xs";
                                      else if (status === "S") badgeCls = "bg-amber-500 text-white font-black shadow-xs";
                                      else if (status === "I") badgeCls = "bg-blue-500 text-white font-black shadow-xs";
                                      else if (status === "A") badgeCls = "bg-red-500 text-white font-black shadow-xs";

                                      return (
                                        <td key={dayNum} className="px-1 py-2 text-center border-r border-slate-100">
                                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold ${badgeCls}`}>
                                            {status}
                                          </span>
                                        </td>
                                      );
                                    } else {
                                      return (
                                        <td key={dayNum} className="px-1 py-2 text-center border-r border-slate-100 text-slate-200 font-mono text-[9px]">
                                          •
                                        </td>
                                      );
                                    }
                                  });

                                  const studentTotal = sH + sS + sI + sA;
                                  const studentPercent = studentTotal > 0 ? ((sH / studentTotal) * 100).toFixed(0) : "100";

                                  return (
                                    <tr key={std.id} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="px-3 py-2.5 text-center font-bold text-slate-400 border-r border-slate-100 sticky left-0 bg-white">
                                        {idx + 1}
                                      </td>
                                      <td className="px-3 py-2.5 border-r border-slate-100 sticky left-10 bg-white">
                                        <div className="font-extrabold text-slate-900 leading-tight">{std.name}</div>
                                        <div className="text-[9px] font-mono text-slate-400 mt-0.5">NIS: {std.id}</div>
                                      </td>
                                      <td className="px-2 py-2.5 text-center border-r border-slate-100">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${std.gender === "L" ? "bg-emerald-50 text-emerald-700" : "bg-pink-50 text-pink-700"}`}>
                                          {std.gender || "L"}
                                        </span>
                                      </td>

                                      {/* Daily Cells */}
                                      {dayCells}

                                      {/* Aggregation Columns */}
                                      <td className="px-1.5 py-2.5 text-center font-extrabold text-[11px] text-emerald-700 bg-emerald-50/40 border-r border-slate-100">
                                        {sH}
                                      </td>
                                      <td className="px-1.5 py-2.5 text-center font-extrabold text-[11px] text-amber-700 bg-amber-50/40 border-r border-slate-100">
                                        {sS}
                                      </td>
                                      <td className="px-1.5 py-2.5 text-center font-extrabold text-[11px] text-blue-700 bg-blue-50/40 border-r border-slate-100">
                                        {sI}
                                      </td>
                                      <td className="px-1.5 py-2.5 text-center font-extrabold text-[11px] text-red-700 bg-red-50/40 border-r border-slate-100">
                                        {sA}
                                      </td>
                                      <td className="px-2 py-2.5 text-center font-bold text-[11px] text-slate-700 border-r border-slate-100">
                                        {studentTotal}
                                      </td>
                                      <td className="px-3 py-2.5 text-center bg-slate-50/50 font-mono">
                                        <div className="flex items-center justify-center gap-1">
                                          <span className={`font-black text-[11px] ${
                                            Number(studentPercent) >= 85 ? "text-emerald-700" : Number(studentPercent) >= 70 ? "text-amber-700" : "text-red-700"
                                          }`}>
                                            {studentPercent}%
                                          </span>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>

                              {/* Footer Class Totals */}
                              <tfoot className="bg-slate-100/80 border-t-2 border-slate-200 text-[10px] font-extrabold text-slate-700">
                                <tr>
                                  <td colSpan={3} className="px-3 py-3 text-right uppercase tracking-wider border-r border-slate-200 sticky left-0 bg-slate-100 z-10 font-black">
                                    Total Hadir Sesi Harian:
                                  </td>
                                  {recapDaysArray.map((dayNum) => {
                                    const dateStr = `${recapMonthPrefix}-${String(dayNum).padStart(2, "0")}`;
                                    const rec = recapMonthRecords.find((r) => r.date === dateStr);
                                    const dH = rec ? rec.students.filter((s: any) => s.status === "H").length : "-";
                                    return (
                                      <td key={dayNum} className="px-1 py-3 text-center border-r border-slate-200 font-bold text-[10px] text-emerald-800">
                                        {dH}
                                      </td>
                                    );
                                  })}
                                  <td className="px-1.5 py-3 text-center text-emerald-800 bg-emerald-100/70 border-r border-slate-200 font-black">{recapGrandH}</td>
                                  <td className="px-1.5 py-3 text-center text-amber-800 bg-amber-100/70 border-r border-slate-200 font-black">{recapGrandS}</td>
                                  <td className="px-1.5 py-3 text-center text-blue-800 bg-blue-100/70 border-r border-slate-200 font-black">{recapGrandI}</td>
                                  <td className="px-1.5 py-3 text-center text-red-800 bg-red-100/70 border-r border-slate-200 font-black">{recapGrandA}</td>
                                  <td className="px-2 py-3 text-center text-slate-900 border-r border-slate-200 font-black">{recapGrandTotal}</td>
                                  <td className="px-3 py-3 text-center text-emerald-950 bg-emerald-100 font-black">{recapAvgPercent}%</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Guide and Bottom Actions Card */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4" id="monthly-recap-footer-card">
                        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                          <span className="font-bold text-slate-800">Keterangan Presensi:</span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white font-bold text-[9px] flex items-center justify-center">H</span>
                            Hadir
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-bold text-[9px] flex items-center justify-center">S</span>
                            Sakit
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-blue-500 text-white font-bold text-[9px] flex items-center justify-center">I</span>
                            Izin
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-red-500 text-white font-bold text-[9px] flex items-center justify-center">A</span>
                            Alfa / Tanpa Keterangan
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setAttendanceRombel(monthlyRecapRombel);
                              setAttendanceSubTab("daily");
                            }}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Plus className="h-4 w-4 text-slate-500" />
                            Input Absensi Harian
                          </button>
                          <button
                            onClick={handleExportMonthlyAttendanceExcel}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                          >
                            <Download className="h-4 w-4" />
                            Unduh Excel (.xlsx)
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* SUB-TAB: REKAPITULASI ABSENSI MINGGUAN DALAM SATU BULAN */}
                {attendanceSubTab === "weekly" && (() => {
                  const monthObj = MONTHS_OPTIONS.find((m) => m.value === monthlyRecapMonth);
                  const monthLabel = monthObj ? monthObj.label : String(monthlyRecapMonth);
                  const yearMonthPrefix = `${monthlyRecapYear}-${String(monthlyRecapMonth).padStart(2, "0")}`;

                  const rombelStudents = students
                    .filter((s) => s.grade === monthlyRecapRombel)
                    .filter((s) =>
                      monthlyRecapSearch.trim() === ""
                        ? true
                        : s.name.toLowerCase().includes(monthlyRecapSearch.toLowerCase())
                    );

                  const monthRecords = attendanceRecords.filter(
                    (r) => r.rombel === monthlyRecapRombel && r.date.startsWith(yearMonthPrefix)
                  );

                  return (
                    <div className="space-y-6" id="weekly-attendance-recap-section">
                      {/* Header & Filter Card */}
                      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                          <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-extrabold mb-2 border border-indigo-200">
                              <Calendar className="h-3.5 w-3.5" />
                              REKAP ABSENSI MINGGUAN (DALAM 1 BULAN)
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                              Rekap Absensi Mingguan Kelas {monthlyRecapRombel} — {monthLabel} {monthlyRecapYear}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                              Matriks rincian kehadiran siswa per pekan (Minggu 1 s/d Minggu 5) dalam satu bulan beserta akumulasi dan persentase kehadiran.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              onClick={handleExportWeeklyAttendanceExcel}
                              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
                            >
                              <FileSpreadsheet className="h-4 w-4" />
                              Cetak Excel Mingguan (.xlsx)
                            </button>
                            <button
                              onClick={handlePrintWeeklyAttendancePDF}
                              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                            >
                              <Printer className="h-4 w-4 text-indigo-400" />
                              Cetak PDF Mingguan
                            </button>
                          </div>
                        </div>

                        {/* Filter Controls */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                              Pilih Kelas / Rombel
                            </label>
                            <select
                              value={monthlyRecapRombel}
                              onChange={(e) => setMonthlyRecapRombel(e.target.value)}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              {customRombels.map((r) => (
                                <option key={r} value={r}>Kelas {r}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                              Pilih Bulan Rekap
                            </label>
                            <select
                              value={monthlyRecapMonth}
                              onChange={(e) => setMonthlyRecapMonth(Number(e.target.value))}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              {MONTHS_OPTIONS.map((m) => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                              Pilih Tahun
                            </label>
                            <select
                              value={monthlyRecapYear}
                              onChange={(e) => setMonthlyRecapYear(Number(e.target.value))}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              {[2025, 2026, 2027, 2028].map((y) => (
                                <option key={y} value={y}>{y}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                              Cari Nama Siswa
                            </label>
                            <div className="relative">
                              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                value={monthlyRecapSearch}
                                onChange={(e) => setMonthlyRecapSearch(e.target.value)}
                                placeholder="Ketik nama siswa..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Weekly Summary Badges */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                          {WEEKLY_BUCKETS.map((wb) => {
                            const sessionsInWeek = monthRecords.filter((rec) => {
                              const d = parseInt(rec.date.split("-")[2], 10);
                              return d >= wb.minDay && d <= wb.maxDay;
                            }).length;
                            return (
                              <div key={wb.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-black text-slate-800">{wb.label}</p>
                                  <p className="text-[11px] text-slate-500 font-semibold">{wb.rangeLabel} {monthLabel}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-xl text-xs font-black ${sessionsInWeek > 0 ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-600"}`}>
                                  {sessionsInWeek} Sesi
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Weekly Matrix Table */}
                      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                                <th rowSpan={2} className="py-3.5 px-3 text-center font-extrabold border-r border-slate-700 w-10">No</th>
                                <th rowSpan={2} className="py-3.5 px-4 font-extrabold border-r border-slate-700 min-w-[200px]">Nama Lengkap Siswa</th>
                                <th rowSpan={2} className="py-3.5 px-2 text-center font-extrabold border-r border-slate-700 w-12">L/P</th>
                                {WEEKLY_BUCKETS.map((wb) => (
                                  <th key={wb.id} colSpan={4} className="py-2 px-2 text-center font-extrabold border-r border-b border-slate-700 bg-indigo-950/60">
                                    <div>{wb.label}</div>
                                    <div className="text-[9px] font-medium text-indigo-200 normal-case">{wb.rangeLabel}</div>
                                  </th>
                                ))}
                                <th colSpan={5} className="py-2 px-3 text-center font-extrabold bg-emerald-950/80 border-b border-slate-700">
                                  Total Akumulasi 1 Bulan
                                </th>
                              </tr>
                              <tr className="bg-slate-800 text-white text-[10px] font-black text-center">
                                {WEEKLY_BUCKETS.map((wb) => (
                                  <React.Fragment key={`sub-${wb.id}`}>
                                    <th className="py-1.5 px-1.5 bg-emerald-900/40 text-emerald-300 border-r border-slate-700">H</th>
                                    <th className="py-1.5 px-1.5 bg-amber-900/40 text-amber-300 border-r border-slate-700">S</th>
                                    <th className="py-1.5 px-1.5 bg-blue-900/40 text-blue-300 border-r border-slate-700">I</th>
                                    <th className="py-1.5 px-1.5 bg-rose-900/40 text-rose-300 border-r border-slate-700">A</th>
                                  </React.Fragment>
                                ))}
                                <th className="py-1.5 px-2 bg-emerald-800 text-white border-r border-slate-700">H</th>
                                <th className="py-1.5 px-2 bg-amber-700 text-white border-r border-slate-700">S</th>
                                <th className="py-1.5 px-2 bg-blue-700 text-white border-r border-slate-700">I</th>
                                <th className="py-1.5 px-2 bg-rose-700 text-white border-r border-slate-700">A</th>
                                <th className="py-1.5 px-2 bg-slate-900 text-emerald-300">%</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                              {rombelStudents.map((std, idx) => {
                                let totalH = 0;
                                let totalS = 0;
                                let totalI = 0;
                                let totalA = 0;

                                const weeklyData = WEEKLY_BUCKETS.map((wb) => {
                                  let wH = 0;
                                  let wS = 0;
                                  let wI = 0;
                                  let wA = 0;
                                  monthRecords.forEach((rec) => {
                                    const d = parseInt(rec.date.split("-")[2], 10);
                                    if (d >= wb.minDay && d <= wb.maxDay) {
                                      const sRec = rec.students?.find((s: any) => s.studentId === std.id);
                                      const st = sRec?.status;
                                      if (st === "H") { wH++; totalH++; }
                                      else if (st === "S") { wS++; totalS++; }
                                      else if (st === "I") { wI++; totalI++; }
                                      else if (st === "A") { wA++; totalA++; }
                                    }
                                  });
                                  return { wH, wS, wI, wA };
                                });

                                const totalSessions = totalH + totalS + totalI + totalA;
                                const pct = totalSessions > 0 ? Math.round((totalH / totalSessions) * 100) : 0;

                                return (
                                  <tr key={std.id} className="hover:bg-slate-50/90 transition-colors">
                                    <td className="py-3 px-3 text-center font-bold text-slate-500 border-r border-slate-100">{idx + 1}</td>
                                    <td className="py-3 px-4 border-r border-slate-100">
                                      <p className="font-extrabold text-slate-800">{std.name}</p>
                                      <p className="text-[10px] text-slate-400 font-mono">Kelas {std.grade}</p>
                                    </td>
                                    <td className="py-3 px-2 text-center font-bold text-slate-600 border-r border-slate-100">{std.gender}</td>
                                    {weeklyData.map((wd, wIdx) => (
                                      <React.Fragment key={`cell-${std.id}-${wIdx}`}>
                                        <td className="py-3 px-1.5 text-center font-bold text-emerald-700 bg-emerald-50/30 border-r border-slate-100">{wd.wH}</td>
                                        <td className="py-3 px-1.5 text-center font-semibold text-amber-700 border-r border-slate-100">{wd.wS}</td>
                                        <td className="py-3 px-1.5 text-center font-semibold text-blue-700 border-r border-slate-100">{wd.wI}</td>
                                        <td className="py-3 px-1.5 text-center font-semibold text-rose-700 border-r border-slate-200">{wd.wA}</td>
                                      </React.Fragment>
                                    ))}
                                    <td className="py-3 px-2 text-center font-black text-emerald-700 bg-emerald-50 border-r border-slate-200">{totalH}</td>
                                    <td className="py-3 px-2 text-center font-black text-amber-700 bg-amber-50 border-r border-slate-200">{totalS}</td>
                                    <td className="py-3 px-2 text-center font-black text-blue-700 bg-blue-50 border-r border-slate-200">{totalI}</td>
                                    <td className="py-3 px-2 text-center font-black text-rose-700 bg-rose-50 border-r border-slate-200">{totalA}</td>
                                    <td className="py-3 px-2.5 text-center font-black">
                                      <span className={`px-2 py-0.5 rounded-lg text-[11px] ${pct >= 85 ? "bg-emerald-100 text-emerald-800" : pct >= 70 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>
                                        {pct}%
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* SUB-TAB: REKAPITULASI ABSENSI SATU SEMESTER */}
                {attendanceSubTab === "semester" && (() => {
                  const semMonths = getSemesterMonths(semesterRecapType);
                  const semTitle =
                    semesterRecapType === "1"
                      ? "Semester 1 (Ganjil: Juli – Desember)"
                      : "Semester 2 (Genap: Januari – Juni)";

                  const rombelStudents = students
                    .filter((s) => s.grade === monthlyRecapRombel)
                    .filter((s) =>
                      monthlyRecapSearch.trim() === ""
                        ? true
                        : s.name.toLowerCase().includes(monthlyRecapSearch.toLowerCase())
                    );

                  const totalSemesterSessions = semMonths.reduce((acc, m) => {
                    const prefix = `${monthlyRecapYear}-${m.value}`;
                    const count = attendanceRecords.filter(
                      (r) => r.rombel === monthlyRecapRombel && r.date.startsWith(prefix)
                    ).length;
                    return acc + count;
                  }, 0);

                  return (
                    <div className="space-y-6" id="semester-attendance-recap-section">
                      {/* Header & Filter Card */}
                      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                          <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-extrabold mb-2 border border-amber-200">
                              <Award className="h-3.5 w-3.5" />
                              REKAPITULASI ABSENSI SATU SEMESTER (6 BULAN)
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                              Rekap Satu Semester Kelas {monthlyRecapRombel} — {semTitle} {monthlyRecapYear}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                              Akumulasi kehadiran siswa lintas 6 bulan dalam 1 semester lengkap dengan persentase kehadiran akhir semester untuk rapor PJOK.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              onClick={handleExportSemesterAttendanceExcel}
                              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
                            >
                              <FileSpreadsheet className="h-4 w-4" />
                              Cetak Excel Semester (.xlsx)
                            </button>
                            <button
                              onClick={handlePrintSemesterAttendancePDF}
                              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                            >
                              <Printer className="h-4 w-4 text-amber-400" />
                              Cetak PDF Semester
                            </button>
                          </div>
                        </div>

                        {/* Filter Controls */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                              Pilih Kelas / Rombel
                            </label>
                            <select
                              value={monthlyRecapRombel}
                              onChange={(e) => setMonthlyRecapRombel(e.target.value)}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                              {customRombels.map((r) => (
                                <option key={r} value={r}>Kelas {r}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                              Pilih Periode Semester
                            </label>
                            <select
                              value={semesterRecapType}
                              onChange={(e) => setSemesterRecapType(e.target.value as "1" | "2")}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                              <option value="1">Semester 1 (Ganjil: Juli - Des)</option>
                              <option value="2">Semester 2 (Genap: Jan - Juni)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                              Pilih Tahun Kalender
                            </label>
                            <select
                              value={monthlyRecapYear}
                              onChange={(e) => setMonthlyRecapYear(Number(e.target.value))}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                              {[2025, 2026, 2027, 2028].map((y) => (
                                <option key={y} value={y}>{y}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                              Cari Nama Siswa
                            </label>
                            <div className="relative">
                              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                value={monthlyRecapSearch}
                                onChange={(e) => setMonthlyRecapSearch(e.target.value)}
                                placeholder="Ketik nama siswa..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Monthly Session Breakdown Badges */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 pt-2">
                          {semMonths.map((m) => {
                            const prefix = `${monthlyRecapYear}-${m.value}`;
                            const mCount = attendanceRecords.filter(
                              (r) => r.rombel === monthlyRecapRombel && r.date.startsWith(prefix)
                            ).length;
                            return (
                              <div key={m.value} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-black text-slate-800">{m.label}</p>
                                  <p className="text-[10px] text-slate-400 font-semibold">{monthlyRecapYear}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-lg text-[11px] font-black ${mCount > 0 ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-600"}`}>
                                  {mCount} Sesi
                                </span>
                              </div>
                            );
                          })}
                          <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                            <div>
                              <p className="text-xs font-black">Total Sesi</p>
                              <p className="text-[10px] text-amber-300 font-semibold">1 Semester</p>
                            </div>
                            <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 text-xs font-black">
                              {totalSemesterSessions}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Semester Matrix Table */}
                      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                                <th rowSpan={2} className="py-3.5 px-3 text-center font-extrabold border-r border-slate-700 w-10">No</th>
                                <th rowSpan={2} className="py-3.5 px-4 font-extrabold border-r border-slate-700 min-w-[200px]">Nama Lengkap Siswa</th>
                                <th rowSpan={2} className="py-3.5 px-2 text-center font-extrabold border-r border-slate-700 w-12">L/P</th>
                                {semMonths.map((m) => (
                                  <th key={m.value} colSpan={4} className="py-2 px-2 text-center font-extrabold border-r border-b border-slate-700 bg-slate-800">
                                    {m.label}
                                  </th>
                                ))}
                                <th colSpan={6} className="py-2 px-3 text-center font-extrabold bg-amber-950/80 border-b border-slate-700">
                                  Total Akumulasi 1 Semester
                                </th>
                              </tr>
                              <tr className="bg-slate-800 text-white text-[10px] font-black text-center">
                                {semMonths.map((m) => (
                                  <React.Fragment key={`sem-sub-${m.value}`}>
                                    <th className="py-1.5 px-1 bg-emerald-900/40 text-emerald-300 border-r border-slate-700">H</th>
                                    <th className="py-1.5 px-1 bg-amber-900/40 text-amber-300 border-r border-slate-700">S</th>
                                    <th className="py-1.5 px-1 bg-blue-900/40 text-blue-300 border-r border-slate-700">I</th>
                                    <th className="py-1.5 px-1 bg-rose-900/40 text-rose-300 border-r border-slate-700">A</th>
                                  </React.Fragment>
                                ))}
                                <th className="py-1.5 px-2 bg-emerald-800 text-white border-r border-slate-700">H</th>
                                <th className="py-1.5 px-2 bg-amber-700 text-white border-r border-slate-700">S</th>
                                <th className="py-1.5 px-2 bg-blue-700 text-white border-r border-slate-700">I</th>
                                <th className="py-1.5 px-2 bg-rose-700 text-white border-r border-slate-700">A</th>
                                <th className="py-1.5 px-2 bg-slate-900 text-amber-300 border-r border-slate-700">%</th>
                                <th className="py-1.5 px-2.5 bg-slate-900 text-white">Predikat</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                              {rombelStudents.map((std, idx) => {
                                let semH = 0;
                                let semS = 0;
                                let semI = 0;
                                let semA = 0;

                                const monthlyCounts = semMonths.map((m) => {
                                  const prefix = `${monthlyRecapYear}-${m.value}`;
                                  const mRecs = attendanceRecords.filter(
                                    (r) => r.rombel === monthlyRecapRombel && r.date.startsWith(prefix)
                                  );
                                  let mH = 0;
                                  let mS = 0;
                                  let mI = 0;
                                  let mA = 0;
                                  mRecs.forEach((rec) => {
                                    const sRec = rec.students?.find((s: any) => s.studentId === std.id);
                                    const st = sRec?.status;
                                    if (st === "H") { mH++; semH++; }
                                    else if (st === "S") { mS++; semS++; }
                                    else if (st === "I") { mI++; semI++; }
                                    else if (st === "A") { mA++; semA++; }
                                  });
                                  return { mH, mS, mI, mA };
                                });

                                const totalSessions = semH + semS + semI + semA;
                                const pct = totalSessions > 0 ? Math.round((semH / totalSessions) * 100) : 0;
                                const predikat =
                                  pct >= 90
                                    ? "Sangat Baik"
                                    : pct >= 80
                                    ? "Baik"
                                    : pct >= 70
                                    ? "Cukup"
                                    : "Pembinaan";

                                return (
                                  <tr key={std.id} className="hover:bg-slate-50/90 transition-colors">
                                    <td className="py-3 px-3 text-center font-bold text-slate-500 border-r border-slate-100">{idx + 1}</td>
                                    <td className="py-3 px-4 border-r border-slate-100">
                                      <p className="font-extrabold text-slate-800">{std.name}</p>
                                      <p className="text-[10px] text-slate-400 font-mono">Kelas {std.grade}</p>
                                    </td>
                                    <td className="py-3 px-2 text-center font-bold text-slate-600 border-r border-slate-100">{std.gender}</td>
                                    {monthlyCounts.map((mc, mIdx) => (
                                      <React.Fragment key={`sem-cell-${std.id}-${mIdx}`}>
                                        <td className="py-3 px-1 text-center font-bold text-emerald-700 bg-emerald-50/25 border-r border-slate-100">{mc.mH}</td>
                                        <td className="py-3 px-1 text-center font-semibold text-amber-700 border-r border-slate-100">{mc.mS}</td>
                                        <td className="py-3 px-1 text-center font-semibold text-blue-700 border-r border-slate-100">{mc.mI}</td>
                                        <td className="py-3 px-1 text-center font-semibold text-rose-700 border-r border-slate-200">{mc.mA}</td>
                                      </React.Fragment>
                                    ))}
                                    <td className="py-3 px-2 text-center font-black text-emerald-700 bg-emerald-50 border-r border-slate-200">{semH}</td>
                                    <td className="py-3 px-2 text-center font-black text-amber-700 bg-amber-50 border-r border-slate-200">{semS}</td>
                                    <td className="py-3 px-2 text-center font-black text-blue-700 bg-blue-50 border-r border-slate-200">{semI}</td>
                                    <td className="py-3 px-2 text-center font-black text-rose-700 bg-rose-50 border-r border-slate-200">{semA}</td>
                                    <td className="py-3 px-2 text-center font-black border-r border-slate-100">
                                      <span className={`px-2 py-0.5 rounded-lg text-[11px] ${pct >= 85 ? "bg-emerald-100 text-emerald-800" : pct >= 70 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>
                                        {pct}%
                                      </span>
                                    </td>
                                    <td className="py-3 px-2.5 text-center font-extrabold text-[11px] text-slate-700">
                                      {predikat}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {/* TAB 8: REKAP NILAI SISWA */}
            {activeTab === "grades" && (
              <motion.div
                key="tab-grades"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
                id="panel-grades"
              >
                {/* Upper banner for save success */}
                {gradesSuccessMessage && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 shadow-sm animate-fade-in" id="grades-success-banner">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">✓</div>
                    <div className="flex-1">
                      <p className="font-extrabold text-sm text-emerald-950">Berhasil Disimpan!</p>
                      <p className="text-xs text-emerald-700 mt-0.5">{gradesSuccessMessage}</p>
                    </div>
                  </div>
                )}

                {/* Main 12-column grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="grades-grid">
                  {/* Left panel - 8 columns: Active Grade Book */}
                  <div className="lg:col-span-8 space-y-6" id="grades-main-area">
                    
                    {/* Header Controls */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4" id="grades-controls-card">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-base">Rekapitulasi & Penginputan Nilai Akhir</h4>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">Kelola rekap nilai praktik TP, STS (Tulis/Prak), dan PAS (Tulis/Prak) PJOK Kurikulum Merdeka.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={handlePrintGradesPDF}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all border border-slate-200 shadow-sm flex items-center gap-1 cursor-pointer w-full sm:w-auto justify-center"
                            title="Cetak PDF format tabel landscape rapi dengan Kop"
                          >
                            <Printer className="h-4 w-4 text-slate-500" />
                            PDF
                          </button>
                          <button
                            onClick={handlePrintGradesWord}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all border border-slate-200 shadow-sm flex items-center gap-1 cursor-pointer w-full sm:w-auto justify-center"
                            title="Ekspor ke MS Word"
                          >
                            <FileDown className="h-4 w-4 text-emerald-500" />
                            Word
                          </button>
                          <button
                            onClick={handleSaveGrades}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all border border-emerald-500 shadow-md shadow-emerald-950/10 flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Simpan Nilai
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Pilih Rombongan Belajar (Rombel)</label>
                          <select
                            value={gradesRombel}
                            onChange={(e) => setGradesRombel(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                          >
                            {customRombels.map((rombel) => (
                              <option key={rombel} value={rombel}>Kelas {rombel}</option>
                            ))}
                          </select>
                        </div>

                        <div className="bg-slate-50/50 rounded-xl p-2.5 border border-slate-100 flex items-center gap-3">
                          <Info className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                          <p className="text-[10px] text-slate-500 leading-normal font-medium">
                            Nilai Akhir (NA) otomatis dihitung berdasarkan bobot Kurikulum Merdeka: <strong className="text-slate-800">40% Praktik TP + 30% Rerata STS + 30% Rerata PAS</strong>.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Isi Nilai Otomatis */}
                    <AutoFillGradesPanel
                      gradesRombel={gradesRombel}
                      rombelStudents={students.filter((s) => s.grade === gradesRombel)}
                      attendanceRecords={attendanceRecords}
                      soalStudentScores={soalStudentScores}
                      currentGrades={studentGrades}
                      onApplyAutoGrades={(updatedGrades, summaryMsg) => {
                        setStudentGrades(updatedGrades);
                        localStorage.setItem("sadar_student_grades", JSON.stringify(updatedGrades));
                        syncToSupabase("sadar_student_grades", updatedGrades);
                        setGradesSuccessMessage(summaryMsg);
                        setTimeout(() => setGradesSuccessMessage(null), 5000);
                      }}
                      onApplySibiTpDescriptions={(t1, t2, t3, t4) => {
                        handleSaveTpDescriptions(1, t1);
                        handleSaveTpDescriptions(2, t2);
                        handleSaveTpDescriptions(3, t3);
                        handleSaveTpDescriptions(4, t4);
                        setGradesSuccessMessage(
                          `Deskripsi TP 1 s/d TP 4 untuk Kelas ${gradesRombel} berhasil diisi otomatis dari Buku Panduan Guru PJOK SIBI!`
                        );
                        setTimeout(() => setGradesSuccessMessage(null), 5000);
                      }}
                    />

                    {/* Grades Grid Table */}
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden" id="grades-students-card">
                      <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Award className="h-4 w-4 text-emerald-600" />
                          Daftar Nilai Siswa Rombel {gradesRombel} ({students.filter((s) => s.grade === gradesRombel).length} Siswa)
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Mata Pelajaran: PJOK
                        </span>
                      </div>

                      {students.filter((s) => s.grade === gradesRombel).length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                            <Users className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700">Rombel Kosong / Belum Diisi</p>
                            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto font-medium">
                              Silakan tambahkan siswa baru di tab <strong>Rombel & Impor Siswa</strong> atau buat data siswa secara massal agar terdaftar pada rombel {gradesRombel}.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse" style={{ minWidth: "900px" }}>
                            <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 text-[9px] uppercase tracking-wider">
                              <tr>
                                <th rowSpan={2} className="px-3 py-2.5 text-center w-[4%] border-r border-slate-100">No</th>
                                <th rowSpan={2} className="px-4 py-2.5 w-[18%] border-r border-slate-100">Nama Siswa</th>
                                <th rowSpan={2} className="px-2 py-2.5 text-center w-[4%] border-r border-slate-100">JK</th>
                                <th colSpan={6} className="px-3 py-1.5 text-center border-b border-slate-100 border-r border-slate-100 bg-emerald-50/20 text-emerald-900 font-black">Nilai Praktik Tujuan Pembelajaran (TP)</th>
                                <th colSpan={2} className="px-3 py-1.5 text-center border-b border-slate-100 border-r border-slate-100 bg-emerald-50/20 text-emerald-900 font-black">Sumatif Tengah Semester (STS)</th>
                                <th colSpan={2} className="px-3 py-1.5 text-center border-b border-slate-100 border-r border-slate-100 bg-indigo-50/20 text-indigo-900 font-black">Penilaian Akhir Semester (PAS)</th>
                                <th rowSpan={2} className="px-3 py-2.5 text-center w-[8%] border-r border-slate-100 bg-green-50 text-green-900 font-black">N.A</th>
                                <th rowSpan={2} className="px-3 py-2.5 w-[14%]">Catatan Guru</th>
                              </tr>
                              <tr className="bg-slate-50/40">
                                <th className="px-1 py-1 text-center font-bold text-slate-500 w-[5%]" title={tp1Desc}>TP 1</th>
                                <th className="px-1 py-1 text-center font-bold text-slate-500 w-[5%]" title={tp2Desc}>TP 2</th>
                                <th className="px-1 py-1 text-center font-bold text-slate-500 w-[5%]" title={tp3Desc}>TP 3</th>
                                <th className="px-1 py-1 text-center font-bold text-slate-500 w-[5%]" title={tp4Desc}>TP 4</th>
                                <th className="px-1 py-1 text-center font-extrabold text-emerald-700 w-[6%] border-r border-slate-100 bg-emerald-50/10">Rerata</th>
                                <th className="px-1 py-1 text-center font-bold text-slate-500 w-[5%]" title="STS Sumatif Tengah Semester Tulis">Tulis</th>
                                <th className="px-1 py-1 text-center font-bold text-slate-500 w-[5%] border-r border-slate-100" title="STS Sumatif Tengah Semester Praktik">Prak</th>
                                <th className="px-1 py-1 text-center font-bold text-slate-500 w-[5%]" title="PAS Penilaian Akhir Semester Tulis">Tulis</th>
                                <th className="px-1 py-1 text-center font-bold text-slate-500 w-[5%] border-r border-slate-100" title="PAS Penilaian Akhir Semester Praktik">Prak</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                              {students
                                .filter((s) => s.grade === gradesRombel)
                                .map((student, idx) => {
                                  const g = studentGrades[student.id] || {
                                    tp1: "", tp2: "", tp3: "", tp4: "",
                                    stsTulisan: "", stsPraktik: "", pasTulisan: "", pasPraktik: "",
                                    notes: ""
                                  };

                                  const tps = [g.tp1, g.tp2, g.tp3, g.tp4].filter((val) => val !== "") as number[];
                                  const rerataTp = tps.length > 0 ? (tps.reduce((a, b) => a + b, 0) / tps.length).toFixed(1) : "-";

                                  const stss = [g.stsTulisan, g.stsPraktik].filter((v) => v !== "") as number[];
                                  const rerataSts = stss.length > 0 ? (stss.reduce((a, b) => a + b, 0) / stss.length).toFixed(1) : "-";

                                  const pass = [g.pasTulisan, g.pasPraktik].filter((v) => v !== "") as number[];
                                  const rerataPas = pass.length > 0 ? (pass.reduce((a, b) => a + b, 0) / pass.length).toFixed(1) : "-";

                                  let na = "-";
                                  if (rerataTp !== "-" || rerataSts !== "-" || rerataPas !== "-") {
                                    const tpVal = rerataTp !== "-" ? parseFloat(rerataTp) : 0;
                                    const stsVal = rerataSts !== "-" ? parseFloat(rerataSts) : 0;
                                    const pasVal = rerataPas !== "-" ? parseFloat(rerataPas) : 0;

                                    let totalWeight = 0;
                                    let weightedSum = 0;

                                    if (rerataTp !== "-") { weightedSum += tpVal * 0.4; totalWeight += 0.4; }
                                    if (rerataSts !== "-") { weightedSum += stsVal * 0.3; totalWeight += 0.3; }
                                    if (rerataPas !== "-") { weightedSum += pasVal * 0.3; totalWeight += 0.3; }

                                    na = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(1) : "-";
                                  }

                                  return (
                                    <tr key={student.id} className="hover:bg-slate-50/40 transition-colors">
                                      <td className="px-3 py-2 text-center font-bold text-slate-400 border-r border-slate-100">{idx + 1}</td>
                                      <td className="px-4 py-2 font-bold text-slate-900 border-r border-slate-100 truncate max-w-[140px]" title={student.name}>
                                        {student.name}
                                      </td>
                                      <td className="px-2 py-2 text-center border-r border-slate-100">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                                          student.gender === "L" ? "bg-emerald-50 text-emerald-600" : "bg-pink-50 text-pink-600"
                                        }`}>
                                          {student.gender}
                                        </span>
                                      </td>
                                      
                                      {/* TP 1 */}
                                      <td className="px-1 py-2 text-center">
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          placeholder="-"
                                          value={g.tp1 ?? ""}
                                          onChange={(e) => handleUpdateStudentGrade(student.id, "tp1", e.target.value)}
                                          className="w-12 px-1 py-1 border border-slate-200 focus:border-emerald-500 rounded text-center font-bold font-mono text-xs bg-slate-50/50 hover:bg-white focus:bg-white transition-all focus:outline-none"
                                        />
                                      </td>
                                      {/* TP 2 */}
                                      <td className="px-1 py-2 text-center">
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          placeholder="-"
                                          value={g.tp2 ?? ""}
                                          onChange={(e) => handleUpdateStudentGrade(student.id, "tp2", e.target.value)}
                                          className="w-12 px-1 py-1 border border-slate-200 focus:border-emerald-500 rounded text-center font-bold font-mono text-xs bg-slate-50/50 hover:bg-white focus:bg-white transition-all focus:outline-none"
                                        />
                                      </td>
                                      {/* TP 3 */}
                                      <td className="px-1 py-2 text-center">
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          placeholder="-"
                                          value={g.tp3 ?? ""}
                                          onChange={(e) => handleUpdateStudentGrade(student.id, "tp3", e.target.value)}
                                          className="w-12 px-1 py-1 border border-slate-200 focus:border-emerald-500 rounded text-center font-bold font-mono text-xs bg-slate-50/50 hover:bg-white focus:bg-white transition-all focus:outline-none"
                                        />
                                      </td>
                                      {/* TP 4 */}
                                      <td className="px-1 py-2 text-center">
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          placeholder="-"
                                          value={g.tp4 ?? ""}
                                          onChange={(e) => handleUpdateStudentGrade(student.id, "tp4", e.target.value)}
                                          className="w-12 px-1 py-1 border border-slate-200 focus:border-emerald-500 rounded text-center font-bold font-mono text-xs bg-slate-50/50 hover:bg-white focus:bg-white transition-all focus:outline-none"
                                        />
                                      </td>
                                      {/* TP Rerata */}
                                      <td className="px-1 py-2 text-center font-bold font-mono text-emerald-700 bg-emerald-50/10 border-r border-slate-100">
                                        {rerataTp}
                                      </td>

                                      {/* STS Tulis */}
                                      <td className="px-1 py-2 text-center">
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          placeholder="-"
                                          value={g.stsTulisan ?? ""}
                                          onChange={(e) => handleUpdateStudentGrade(student.id, "stsTulisan", e.target.value)}
                                          className="w-12 px-1 py-1 border border-slate-200 focus:border-emerald-500 rounded text-center font-bold font-mono text-xs bg-slate-50/50 hover:bg-white focus:bg-white transition-all focus:outline-none"
                                        />
                                      </td>
                                      {/* STS Prak */}
                                      <td className="px-1 py-2 text-center border-r border-slate-100">
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          placeholder="-"
                                          value={g.stsPraktik ?? ""}
                                          onChange={(e) => handleUpdateStudentGrade(student.id, "stsPraktik", e.target.value)}
                                          className="w-12 px-1 py-1 border border-slate-200 focus:border-emerald-500 rounded text-center font-bold font-mono text-xs bg-slate-50/50 hover:bg-white focus:bg-white transition-all focus:outline-none"
                                        />
                                      </td>

                                      {/* PAS Tulis */}
                                      <td className="px-1 py-2 text-center">
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          placeholder="-"
                                          value={g.pasTulisan ?? ""}
                                          onChange={(e) => handleUpdateStudentGrade(student.id, "pasTulisan", e.target.value)}
                                          className="w-12 px-1 py-1 border border-slate-200 focus:border-indigo-500 rounded text-center font-bold font-mono text-xs bg-slate-50/50 hover:bg-white focus:bg-white transition-all focus:outline-none"
                                        />
                                      </td>
                                      {/* PAS Prak */}
                                      <td className="px-1 py-2 text-center border-r border-slate-100">
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          placeholder="-"
                                          value={g.pasPraktik ?? ""}
                                          onChange={(e) => handleUpdateStudentGrade(student.id, "pasPraktik", e.target.value)}
                                          className="w-12 px-1 py-1 border border-slate-200 focus:border-indigo-500 rounded text-center font-bold font-mono text-xs bg-slate-50/50 hover:bg-white focus:bg-white transition-all focus:outline-none"
                                        />
                                      </td>

                                      {/* NA */}
                                      <td className="px-2 py-2 text-center font-black font-mono text-emerald-800 bg-green-50 border-r border-slate-100 text-sm">
                                        {na}
                                      </td>

                                      {/* Catatan */}
                                      <td className="px-3 py-2">
                                        <input
                                          type="text"
                                          placeholder="Keterangan..."
                                          value={g.notes || ""}
                                          onChange={(e) => handleUpdateStudentGrade(student.id, "notes", e.target.value)}
                                          className="w-full bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-lg px-2 py-1 text-[11px] font-medium transition-all focus:outline-none"
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right panel - 4 columns: TP config & info card */}
                  <div className="lg:col-span-4 space-y-6" id="grades-right-sidebar">
                    
                    {/* TP Description Config Card */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4" id="tp-config-card">
                      <div className="flex items-center gap-2">
                        <Sliders className="h-4 w-4 text-emerald-600" />
                        <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Deskripsi Tujuan Pembelajaran (TP)</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                        Definisikan kompetensi pembelajaran aktif semester ini untuk melengkapi berkas cetak/rekap.
                      </p>

                      <div className="space-y-3.5 pt-2" id="tp-config-inputs">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Deskripsi TP 1</label>
                          <textarea
                            value={tp1Desc}
                            onChange={(e) => handleSaveTpDescriptions(1, e.target.value)}
                            className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none transition-all h-12 resize-none"
                            placeholder="Contoh: Mempraktikkan keterampilan gerak dasar lokomotor lompat jauh..."
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Deskripsi TP 2</label>
                          <textarea
                            value={tp2Desc}
                            onChange={(e) => handleSaveTpDescriptions(2, e.target.value)}
                            className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none transition-all h-12 resize-none"
                            placeholder="Contoh: Menganalisis variasi gerak spesifik passing bola basket..."
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Deskripsi TP 3</label>
                          <textarea
                            value={tp3Desc}
                            onChange={(e) => handleSaveTpDescriptions(3, e.target.value)}
                            className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none transition-all h-12 resize-none"
                            placeholder="Contoh: Mempraktikkan aktivitas senam lantai kayang..."
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Deskripsi TP 4</label>
                          <textarea
                            value={tp4Desc}
                            onChange={(e) => handleSaveTpDescriptions(4, e.target.value)}
                            className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none transition-all h-12 resize-none"
                            placeholder="Contoh: Menerapkan konsep latihan kebugaran jasmani kekuatan otot..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Guidance Info Card */}
                    <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-2xl p-5 shadow-md border border-emerald-900 space-y-4" id="grades-info-banner-card">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Activity className="h-4.5 w-4.5 text-emerald-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-200">Panduan Rumus Penilaian</h4>
                        <p className="text-xs leading-relaxed text-emerald-100 font-medium">
                          Nilai Akhir (NA) diperoleh dari formula pembobotan standar Kurikulum Merdeka yang fleksibel untuk PJOK:
                        </p>
                      </div>
                      <div className="space-y-2 border-t border-emerald-800/60 pt-3 text-[11px] text-emerald-200 font-mono">
                        <p>• <strong className="text-white">Rerata TP (40%)</strong>: Rata-rata dari nilai TP1 s/d TP4 yang diisi.</p>
                        <p>• <strong className="text-white">Sumatif STS (30%)</strong>: Rata-rata Penilaian Tengah Semester (Tulis & Praktik).</p>
                        <p>• <strong className="text-white">Sumatif PAS (30%)</strong>: Rata-rata Penilaian Akhir Semester (Tulis & Praktik).</p>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "soal" && (
              <motion.div
                key="tab-soal"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
                id="panel-soal"
              >
                {/* Top Banner */}
                <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-lg border border-emerald-700/40 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[11px] font-extrabold uppercase tracking-wider">
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      Asesmen Sumatif &amp; Kisi-Kisi Soal Praktik PJOK
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                      Generator Soal Praktik &amp; Tabel Kisi-Kisi 10 Kolom (Kurikulum Merdeka)
                    </h2>
                    <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
                      Susun instrumen Asesmen Sumatif Tengah Semester (STS), Akhir Semester (SAS), maupun Harian beserta pemetaan Kisi-Kisi Soal Praktik detail tiap nomor soal sesuai Taksonomi Bloom.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleExportSoalExcel}
                      className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Unduh Excel (.xlsx)
                    </button>
                    <button
                      type="button"
                      onClick={handleExportSoalWord}
                      className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <FileDown className="h-4 w-4" />
                      Unduh Word (.doc)
                    </button>
                    <button
                      type="button"
                      onClick={handlePrintSoalPDF}
                      className="px-3.5 py-2 bg-white text-emerald-950 hover:bg-emerald-50 font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Printer className="h-4 w-4" />
                      Cetak / PDF (A4 Landscape)
                    </button>
                  </div>
                </div>

                {/* Status Banners */}
                {soalSuccessMessage && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      <p className="text-xs font-bold">{soalSuccessMessage}</p>
                    </div>
                    <button
                      onClick={() => setSoalSuccessMessage(null)}
                      className="text-xs font-extrabold text-emerald-700 hover:text-emerald-950 cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                )}

                {soalErrorMessage && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                      <p className="text-xs font-bold">{soalErrorMessage}</p>
                    </div>
                    <button
                      onClick={() => setSoalErrorMessage(null)}
                      className="text-xs font-extrabold text-red-700 hover:text-red-950 cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column (4 cols): Input Form & Prompt Preview */}
                  <div className="lg:col-span-4 space-y-6">
                    <SibiQuickPicker
                      grade={soalKelas}
                      label="Isi Cepat dari Unit Buku Panduan Guru PJOK SIBI:"
                      onSelectUnit={(unit) => {
                        setSoalTujuanPembelajaran(unit.tujuanPembelajaran.join("\n"));
                        setSoalRuangLingkup(`${unit.title} (${unit.pokokMateri.join(", ")})`);
                      }}
                    />
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                          <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
                          Parameter Penyusunan Soal Praktik
                        </h3>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                          Sesuaikan Kelas, Fase, Jenis Asesmen, dan Tujuan Pembelajaran sesuai Buku Panduan PJOK SIBI.
                        </p>
                      </div>

                      <form onSubmit={generateSoalPraktik} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                            Mata Pelajaran
                          </label>
                          <input
                            type="text"
                            value={soalMapel}
                            onChange={(e) => setSoalMapel(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
                            placeholder="Pendidikan Jasmani Olahraga dan Kesehatan"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                              Pilih Kelas
                            </label>
                            <select
                              value={soalKelas}
                              onChange={(e) => handleSelectSoalKelas(e.target.value)}
                              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
                            >
                              <option value="Kelas I">Kelas I SD</option>
                              <option value="Kelas II">Kelas II SD</option>
                              <option value="Kelas III">Kelas III SD</option>
                              <option value="Kelas IV">Kelas IV SD</option>
                              <option value="Kelas V">Kelas V SD</option>
                              <option value="Kelas VI">Kelas VI SD</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                              Fase Kurikulum
                            </label>
                            <select
                              value={soalFase}
                              onChange={(e) => setSoalFase(e.target.value)}
                              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
                            >
                              <option value="Fase A">Fase A (Kelas I - II)</option>
                              <option value="Fase B">Fase B (Kelas III - IV)</option>
                              <option value="Fase C">Fase C (Kelas V - VI)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2 space-y-1.5">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                              Jenis Asesmen Sumatif
                            </label>
                            <select
                              value={soalJenisAsesmen}
                              onChange={(e) => setSoalJenisAsesmen(e.target.value)}
                              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
                            >
                              <option value="Asesmen Sumatif Harian (ASH)">Sumatif Harian (ASH)</option>
                              <option value="Asesmen Sumatif Tengah Semester (STS)">Sumatif Tengah Semester (STS)</option>
                              <option value="Asesmen Sumatif Akhir Semester (SAS)">Sumatif Akhir Semester (SAS)</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                              Jumlah Soal
                            </label>
                            <select
                              value={soalJumlah}
                              onChange={(e) => setSoalJumlah(Number(e.target.value))}
                              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
                            >
                              <option value={4}>4 Nomor</option>
                              <option value={5}>5 Nomor</option>
                              <option value={6}>6 Nomor</option>
                              <option value={8}>8 Nomor</option>
                              <option value={10}>10 Nomor</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                              Tujuan Pembelajaran yang Diujikan
                            </label>
                            <button
                              type="button"
                              onClick={handleLoadTpFromGrades}
                              className="text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                            >
                              Ambil TP Rekap Nilai
                            </button>
                          </div>
                          <textarea
                            rows={6}
                            value={soalTujuanPembelajaran}
                            onChange={(e) => setSoalTujuanPembelajaran(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none leading-relaxed"
                            placeholder="Masukkan semua Tujuan Pembelajaran (TP) yang diujikan..."
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                            Ruang Lingkup Materi (Opsional)
                          </label>
                          <input
                            type="text"
                            value={soalRuangLingkup}
                            onChange={(e) => setSoalRuangLingkup(e.target.value)}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-emerald-500 focus:outline-none"
                            placeholder="Contoh: Bola Kasti, Sepak Bola, Atletik, Senam Lantai, Kebugaran"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isGeneratingSoal}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-emerald-950/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          {isGeneratingSoal ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Menyusun Kisi-Kisi &amp; Soal Praktik...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Generasikan Soal Praktik &amp; Kisi-Kisi
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Prompt Template Box */}
                    <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                          Prompt Instruksi AI Aktif
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(getFormattedSoalPrompt());
                              setSoalSuccessMessage("Prompt penyusunan Soal Praktik & Kisi-Kisi berhasil disalin!");
                            } catch {
                              // ignore
                            }
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          Salin Prompt
                        </button>
                      </div>
                      <pre className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                        {getFormattedSoalPrompt()}
                      </pre>
                    </div>
                  </div>

                  {/* Right Column (8 cols): Generated Kisi-Kisi 10 Columns & Practical Exam Sheet */}
                  <div className="lg:col-span-8 space-y-6">
                    {generatedSoal && (
                      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
                        {/* Document Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                              Instrumen Asesmen Sumatif Praktik Terpetakan
                            </span>
                            <h3 className="text-lg font-black text-slate-900 mt-0.5">
                              {generatedSoal.judulAsesmen}
                            </h3>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5">
                              {generatedSoal.mataPelajaran} • {generatedSoal.kelas} ({generatedSoal.fase}) • {generatedSoal.kisiKisi?.length || 0} Nomor Soal Praktik
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCopySoalTable}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              Salin Tabel
                            </button>
                            <button
                              type="button"
                              onClick={handleExportSoalExcel}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                              Excel
                            </button>
                            <button
                              type="button"
                              onClick={handleExportSoalWord}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <FileDown className="h-3.5 w-3.5 text-blue-600" />
                              Word (.doc)
                            </button>
                            <button
                              type="button"
                              onClick={handlePrintSoalPDF}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              Cetak / PDF
                            </button>
                          </div>
                        </div>

                        {/* 10-Column Kisi-Kisi Table */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                              <Table className="h-4 w-4 text-emerald-600" />
                              Tabel Kisi-Kisi &amp; Naskah Soal Praktik (Detail Tiap Nomor Soal)
                            </h4>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              Total Skor: {generatedSoal.kisiKisi?.reduce((acc: number, item: any) => acc + (Number(item.skor) || 0), 0) || 100}
                            </span>
                          </div>

                          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                            <table className="w-full text-left border-collapse min-w-[1150px]">
                              <thead>
                                <tr className="bg-slate-900 text-white text-[10px] font-extrabold uppercase tracking-wider">
                                  <th className="p-3 border-r border-slate-700 text-center w-10">No</th>
                                  <th className="p-3 border-r border-slate-700 w-44">Tujuan Pembelajaran</th>
                                  <th className="p-3 border-r border-slate-700 w-36">Ruang Lingkup Materi</th>
                                  <th className="p-3 border-r border-slate-700 w-32">Level Kognitif (Taksonomi Bloom)</th>
                                  <th className="p-3 border-r border-slate-700 w-44">Indikator Soal</th>
                                  <th className="p-3 border-r border-slate-700 w-28 text-center">Bentuk Soal</th>
                                  <th className="p-3 border-r border-slate-700 w-16 text-center">Nomor Soal</th>
                                  <th className="p-3 border-r border-slate-700 w-60">Naskah Soal</th>
                                  <th className="p-3 border-r border-slate-700 w-64">Kunci Jawaban</th>
                                  <th className="p-3 text-center w-16">Skor</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 text-xs">
                                {(generatedSoal.kisiKisi || []).map((row: any, idx: number) => (
                                  <tr key={idx} className="hover:bg-emerald-50/30 transition-colors align-top">
                                    <td className="p-3 font-extrabold text-slate-700 text-center border-r border-slate-100">
                                      {row.no || idx + 1}
                                    </td>
                                    <td className="p-3 font-semibold text-slate-800 border-r border-slate-100 leading-relaxed">
                                      {row.tujuanPembelajaran}
                                    </td>
                                    <td className="p-3 font-bold text-emerald-800 border-r border-slate-100 leading-relaxed">
                                      {row.ruangLingkupMateri}
                                    </td>
                                    <td className="p-3 border-r border-slate-100">
                                      <span className="inline-block px-2 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold leading-snug">
                                        {row.levelKognitif}
                                      </span>
                                    </td>
                                    <td className="p-3 text-slate-600 font-medium border-r border-slate-100 leading-relaxed">
                                      {row.indikatorSoal}
                                    </td>
                                    <td className="p-3 text-center border-r border-slate-100">
                                      <span className="inline-block px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold">
                                        {row.bentukSoal}
                                      </span>
                                    </td>
                                    <td className="p-3 text-center font-black text-slate-900 border-r border-slate-100">
                                      {row.nomorSoal || idx + 1}
                                    </td>
                                    <td className="p-3 font-semibold text-slate-800 border-r border-slate-100 leading-relaxed bg-slate-50/50">
                                      {row.naskahSoal}
                                    </td>
                                    <td className="p-3 text-slate-700 font-medium border-r border-slate-100 leading-relaxed whitespace-pre-line text-[11px]">
                                      {row.kunciJawaban}
                                    </td>
                                    <td className="p-3 text-center font-black text-emerald-700 bg-emerald-50/40">
                                      {row.skor}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Petunjuk Praktik, Alat & Pedoman Penskoran */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                            <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                              Petunjuk Pelaksanaan Ujian Praktik
                            </h5>
                            <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 font-medium">
                              {(generatedSoal.petunjukPraktik || []).map((p: string, i: number) => (
                                <li key={i}>{p}</li>
                              ))}
                            </ol>
                          </div>

                          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                            <h5 className="text-xs font-extrabold uppercase tracking-wider text-emerald-950">
                              Alat, Sarana &amp; Pedoman Penskoran
                            </h5>
                            <ul className="list-disc list-inside space-y-1 text-xs text-emerald-900 font-medium">
                              {(generatedSoal.alatDanSarana || []).map((a: string, i: number) => (
                                <li key={i}>{a}</li>
                              ))}
                            </ul>
                            {generatedSoal.pedomanPenskoran && (
                              <p className="text-[11px] font-bold text-emerald-800 pt-2 border-t border-emerald-200/60">
                                {generatedSoal.pedomanPenskoran}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* BAGIAN II: FORMAT RUBRIK PENILAIAN UNJUK KERJA TIAP NOMOR SOAL */}
                        <div className="space-y-3 pt-4 border-t border-slate-100" id="soal-rubrik-penilaian-section">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                <ClipboardCheck className="h-4 w-4 text-emerald-600" />
                                Format Rubrik Penilaian Keterampilan / Unjuk Kerja (Per Nomor Soal)
                              </h4>
                              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                                Pedoman pemberian skor analitik berdasarkan 3 aspek gerak: Sikap Awal (25%), Sikap Pelaksanaan/Inti (50%), dan Sikap Akhir (25%).
                              </p>
                            </div>
                          </div>

                          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                              <thead>
                                <tr className="bg-emerald-950 text-white text-[10px] font-extrabold uppercase tracking-wider">
                                  <th className="p-3 border-r border-emerald-800 text-center w-16">No. Soal</th>
                                  <th className="p-3 border-r border-emerald-800 w-44">Materi &amp; Bentuk Praktik</th>
                                  <th className="p-3 border-r border-emerald-800">1. Sikap Awal / Persiapan</th>
                                  <th className="p-3 border-r border-emerald-800 text-center w-16">Skor Awal</th>
                                  <th className="p-3 border-r border-emerald-800">2. Sikap Pelaksanaan (Teknik Inti)</th>
                                  <th className="p-3 border-r border-emerald-800 text-center w-16">Skor Inti</th>
                                  <th className="p-3 border-r border-emerald-800">3. Sikap Akhir &amp; Sportivitas</th>
                                  <th className="p-3 border-r border-emerald-800 text-center w-16">Skor Akhir</th>
                                  <th className="p-3 text-center w-20 bg-emerald-900">Total Skor</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 text-xs">
                                {(generatedSoal.kisiKisi || []).map((row: any, idx: number) => {
                                  const rb = getSoalRubrikBreakdown(row);
                                  return (
                                    <tr key={idx} className="hover:bg-emerald-50/20 align-top">
                                      <td className="p-3 text-center font-black text-slate-900 border-r border-slate-100">
                                        Soal {row.nomorSoal || idx + 1}
                                      </td>
                                      <td className="p-3 border-r border-slate-100">
                                        <p className="font-bold text-slate-800 leading-snug">{row.ruangLingkupMateri}</p>
                                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                                          {row.bentukSoal}
                                        </span>
                                      </td>
                                      <td className="p-3 text-slate-600 font-medium border-r border-slate-100 leading-relaxed">
                                        {rb.sikapAwal}
                                      </td>
                                      <td className="p-3 text-center font-extrabold text-emerald-700 bg-emerald-50/30 border-r border-slate-100">
                                        {rb.skorAwal}
                                      </td>
                                      <td className="p-3 text-slate-700 font-semibold border-r border-slate-100 leading-relaxed">
                                        {rb.pelaksanaan}
                                      </td>
                                      <td className="p-3 text-center font-extrabold text-emerald-700 bg-emerald-50/30 border-r border-slate-100">
                                        {rb.skorInti}
                                      </td>
                                      <td className="p-3 text-slate-600 font-medium border-r border-slate-100 leading-relaxed">
                                        {rb.sikapAkhir}
                                      </td>
                                      <td className="p-3 text-center font-extrabold text-emerald-700 bg-emerald-50/30 border-r border-slate-100">
                                        {rb.skorAkhir}
                                      </td>
                                      <td className="p-3 text-center font-black text-emerald-900 bg-emerald-100/60">
                                        {row.skor}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* KKTP Interval Legend Cards */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-0.5">
                              <span className="text-[10px] font-black uppercase text-emerald-700">88 – 100 • Sangat Baik (SB)</span>
                              <p className="text-[11px] font-semibold text-emerald-950">Tuntas — Pengayaan / Tutor Sebaya</p>
                            </div>
                            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 space-y-0.5">
                              <span className="text-[10px] font-black uppercase text-teal-700">75 – 87 • Baik (B)</span>
                              <p className="text-[11px] font-semibold text-teal-950">Tuntas — Sesuai Kriteria KKTP</p>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-0.5">
                              <span className="text-[10px] font-black uppercase text-amber-700">61 – 74 • Cukup (C)</span>
                              <p className="text-[11px] font-semibold text-amber-950">Tuntas — Perbaikan Koordinasi</p>
                            </div>
                            <div className="p-3 rounded-xl bg-red-50 border border-red-200 space-y-0.5">
                              <span className="text-[10px] font-black uppercase text-red-700">&le; 60 • Perlu Bimbingan (PB)</span>
                              <p className="text-[11px] font-semibold text-red-950">Belum Tuntas — Remedial Praktik</p>
                            </div>
                          </div>
                        </div>

                        {/* BAGIAN III: FORMAT LEMBAR PENILAIAN PRAKTIK SISWA PER ROMBEL */}
                        <div className="space-y-4 pt-4 border-t border-slate-100" id="soal-lembar-penilaian-siswa-section">
                          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                            <div className="space-y-0.5">
                              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                                <Award className="h-4.5 w-4.5 text-emerald-600" />
                                Format Lembar Penilaian Praktik Siswa (Daftar Nilai Ujian Praktik)
                              </h4>
                              <p className="text-[11px] text-slate-500 font-semibold">
                                Input skor praktik tiap nomor soal per siswa, cetak blangko penilaian lapangan, atau kirim nilai akhir langsung ke Rekap Nilai Siswa.
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                                <span className="text-[10px] font-black uppercase text-slate-400">Rombel:</span>
                                <select
                                  value={soalPenilaianRombel}
                                  onChange={(e) => setSoalPenilaianRombel(e.target.value)}
                                  className="text-xs font-extrabold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                                >
                                  {Array.from(new Set(["IV-A", "IV-B", "V-A", "V-B", "VI-A", "VI-B", ...customRombels, ...students.map((s) => s.grade)]))
                                    .filter(Boolean)
                                    .sort()
                                    .map((r) => (
                                      <option key={r} value={r}>
                                        Kelas {r}
                                      </option>
                                    ))}
                                </select>
                              </div>

                              <button
                                type="button"
                                onClick={handleAutoFillSoalScores}
                                className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                              >
                                Isi Nilai Simulasi
                              </button>

                              <button
                                type="button"
                                onClick={handleResetSoalScores}
                                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                              >
                                Kosongkan (Blangko)
                              </button>

                              <button
                                type="button"
                                onClick={handleSyncSoalScoresToRekapNilai}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Kirim ke Rekap Nilai
                              </button>
                            </div>
                          </div>

                          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                            <table className="w-full text-left border-collapse min-w-[920px]">
                              <thead>
                                <tr className="bg-slate-900 text-white text-[10px] font-extrabold uppercase tracking-wider">
                                  <th className="p-3 border-r border-slate-700 text-center w-10">No</th>
                                  <th className="p-3 border-r border-slate-700 w-52">Nama Lengkap Siswa</th>
                                  <th className="p-3 border-r border-slate-700 text-center w-12">L/P</th>
                                  {(generatedSoal.kisiKisi || []).map((q: any, qIdx: number) => (
                                    <th key={qIdx} className="p-2.5 border-r border-slate-700 text-center w-24">
                                      <div>Soal {q.nomorSoal || qIdx + 1}</div>
                                      <div className="text-[9px] text-emerald-300 font-semibold mt-0.5">Maks {q.skor}</div>
                                    </th>
                                  ))}
                                  <th className="p-3 border-r border-slate-700 text-center w-24 bg-slate-800">Total Skor</th>
                                  <th className="p-3 border-r border-slate-700 text-center w-24 bg-emerald-900">Nilai Akhir</th>
                                  <th className="p-3 border-r border-slate-700 text-center w-36">Predikat KKTP</th>
                                  <th className="p-3">Keterangan / Tindak Lanjut</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 text-xs">
                                {students.filter((s) => s.grade === soalPenilaianRombel).length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan={(generatedSoal.kisiKisi?.length || 5) + 7}
                                      className="p-6 text-center text-slate-400 font-semibold"
                                    >
                                      Belum ada data siswa pada Rombel {soalPenilaianRombel}. Pilih Rombel lain (misal IV-A, V-A, VI-A) atau tambahkan siswa di menu Data Siswa.
                                    </td>
                                  </tr>
                                ) : (
                                  students
                                    .filter((s) => s.grade === soalPenilaianRombel)
                                    .map((std, sIdx) => {
                                      const sMap = soalStudentScores[std.id] || {};
                                      const totalMax =
                                        generatedSoal.kisiKisi?.reduce((acc: number, item: any) => acc + (Number(item.skor) || 0), 0) || 100;
                                      let sumSkor = 0;
                                      let hasAny = false;
                                      (generatedSoal.kisiKisi || []).forEach((_: any, qIdx: number) => {
                                        const v = sMap[qIdx];
                                        if (v !== undefined && v !== "") {
                                          sumSkor += Number(v);
                                          hasAny = true;
                                        }
                                      });
                                      const nilaiAkhir = hasAny ? Math.round((sumSkor / totalMax) * 100) : null;
                                      const pred = nilaiAkhir !== null ? getPredikatKktp(nilaiAkhir) : null;

                                      return (
                                        <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                                          <td className="p-2.5 text-center font-bold text-slate-500 border-r border-slate-100">
                                            {sIdx + 1}
                                          </td>
                                          <td className="p-2.5 font-bold text-slate-800 border-r border-slate-100">
                                            {std.name}
                                          </td>
                                          <td className="p-2.5 text-center font-bold text-slate-600 border-r border-slate-100">
                                            {std.gender}
                                          </td>
                                          {(generatedSoal.kisiKisi || []).map((q: any, qIdx: number) => (
                                            <td key={qIdx} className="p-2 text-center border-r border-slate-100">
                                              <input
                                                type="number"
                                                min={0}
                                                max={Number(q.skor) || 100}
                                                placeholder="..."
                                                value={sMap[qIdx] ?? ""}
                                                onChange={(e) =>
                                                  handleUpdateSoalStudentScore(std.id, qIdx, Number(q.skor) || 100, e.target.value)
                                                }
                                                className="w-14 px-2 py-1 text-center font-extrabold font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                                              />
                                            </td>
                                          ))}
                                          <td className="p-2.5 text-center font-extrabold font-mono text-slate-800 bg-slate-50 border-r border-slate-100">
                                            {hasAny ? sumSkor : "-"}
                                          </td>
                                          <td className="p-2.5 text-center font-black font-mono text-emerald-800 bg-emerald-50/60 border-r border-slate-100 text-sm">
                                            {nilaiAkhir !== null ? nilaiAkhir : "-"}
                                          </td>
                                          <td className="p-2.5 text-center border-r border-slate-100">
                                            {pred ? (
                                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${pred.badgeClass}`}>
                                                {pred.label}
                                              </span>
                                            ) : (
                                              <span className="text-slate-300 font-semibold text-[11px]">Belum dinilai</span>
                                            )}
                                          </td>
                                          <td className="p-2.5 text-[11px] font-semibold text-slate-600">
                                            {pred ? pred.tindakLanjut : "-"}
                                          </td>
                                        </tr>
                                      );
                                    })
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "database" && (
              <motion.div
                key="tab-database"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
                id="panel-database"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="database-grid">
                  
                  {/* Left panel - 7 columns: Connection Status and Sync Actions */}
                  <div className="lg:col-span-7 space-y-6" id="database-main-area">
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6" id="db-status-card">
                      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-lg">Koneksi Database Cloud (Supabase - Absensi2027)</h4>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">Sinkronisasikan seluruh data aplikasi SADAR PJOK Anda ke proyek Supabase Absensi2027.</p>
                        </div>
                        <button
                          onClick={checkSupabaseConnection}
                          disabled={dbStatus === "loading"}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 animate-none"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${dbStatus === "loading" ? "animate-spin" : ""}`} />
                          Cek Koneksi
                        </button>
                      </div>

                      {/* Status indicator banner */}
                      {dbStatus === "loading" && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl flex items-center gap-3.5 animate-pulse">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">...</div>
                          <div className="flex-1">
                            <p className="font-extrabold text-sm text-emerald-950">Memeriksa Koneksi Database...</p>
                            <p className="text-xs text-emerald-700 mt-0.5">Menghubungkan ke server database cloud Supabase di Absensi2027...</p>
                          </div>
                        </div>
                      )}

                      {dbStatus === "connected" && dbTableExists && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl space-y-2.5 shadow-sm">
                          <div className="flex items-center gap-3.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">✓</div>
                            <div className="flex-1">
                              <p className="font-extrabold text-sm text-emerald-950">Terhubung ke Supabase Absensi2027 &amp; Tabel Siap!</p>
                              <p className="text-xs text-emerald-700 mt-0.5">
                                SADAR PJOK telah tersambung secara live ke database Supabase <strong className="font-bold">{dbProjectInfo.projectName || "Absensi2027"}</strong> (<code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono text-[11px]">{dbProjectInfo.projectId}</code>) pada tabel <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono text-[11px]">sadar_app_data</code>.
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">ONLINE</span>
                              {dbLastSync && (
                                <span className="text-[10px] font-bold text-emerald-700">Sync: {dbLastSync}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {dbStatus === "connected" && !dbTableExists && (
                        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl space-y-3 shadow-sm">
                          <div className="flex items-start gap-3.5">
                            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">✓</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-extrabold text-sm text-amber-950">Terkoneksi ke Supabase Absensi2027 (Hybrid Cloud Aktif)</p>
                                <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shrink-0">ONLINE</span>
                              </div>
                              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                                Koneksi API ke proyek <strong className="font-bold">Absensi2027</strong> (<code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">dbrzheropnjefvoexhti.supabase.co</code>) berhasil! Penyimpanan Cloud Relay sudah aktif sehingga tombol <strong>PUSH &amp; PULL</strong> dapat langsung digunakan sekarang.
                              </p>
                              <p className="text-xs text-amber-800 mt-1.5 font-medium">
                                👉 Untuk membuat tabel <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">public.sadar_app_data</code> di dashboard Supabase Absensi2027 Anda, salin skema SQL di panel kanan lalu jalankan di <strong>SQL Editor</strong> Supabase.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {dbStatus === "error" && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-2xl flex items-start gap-3.5 shadow-sm">
                          <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">✕</div>
                          <div className="flex-1">
                            <p className="font-extrabold text-sm text-red-950">Koneksi Mengalami Kendala</p>
                            <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{dbErrorMessage || "Konfigurasi environment variabel Supabase tidak lengkap atau salah."}</p>
                            <p className="text-[11px] text-red-600 mt-1 font-medium">Klik &quot;Cek Koneksi&quot; untuk memeriksa ulang koneksi ke Absensi2027.</p>
                          </div>
                        </div>
                      )}

                      {/* Sync banners (success or error) */}
                      {syncSuccess && (
                        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl flex items-center gap-3 shadow-sm" id="sync-success-banner">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">✓</div>
                          <div className="flex-1">
                            <p className="font-extrabold text-sm text-green-950">Sinkronisasi Sukses!</p>
                            <p className="text-xs text-green-700 mt-0.5">{syncSuccess}</p>
                          </div>
                        </div>
                      )}

                      {syncError && (
                        <div className="p-4 bg-red-50 border border-red-150 text-red-800 rounded-2xl flex items-center gap-3.5 shadow-sm" id="sync-error-banner">
                          <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">✕</div>
                          <div className="flex-1">
                            <p className="font-extrabold text-sm text-red-950">Gagal Sinkronisasi</p>
                            <p className="text-xs text-red-700 mt-0.5">{syncError}</p>
                          </div>
                        </div>
                      )}

                      {/* Main Sync Controls */}
                      <div className="space-y-4 pt-4 border-t border-slate-50">
                        <h5 className="font-black text-xs text-slate-850 uppercase tracking-wider">Aksi Sinkronisasi Data Mandiri (Absensi2027)</h5>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Setiap perubahan data siswa, absensi, nilai, jadwal, modul ajar, dan inventaris otomatis disinkronkan ke backend. Anda juga dapat melakukan sinkronisasi manual melalui tombol di bawah ini.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          {/* PUSH CARD */}
                          <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-4">
                            <div className="space-y-1">
                              <h6 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                                <CloudUpload className="h-4 w-4 text-emerald-600" />
                                PUSH: Unggah ke Cloud
                              </h6>
                              <p className="text-[10px] text-slate-400 leading-normal font-semibold">
                                Mengunggah seluruh data yang ada di browser Anda saat ini ke database cloud Supabase Absensi2027.
                              </p>
                            </div>
                            <button
                              onClick={handlePushToSupabase}
                              disabled={isSyncing}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-transparent text-white font-extrabold rounded-xl text-xs border border-emerald-500 shadow-md shadow-emerald-950/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              {isSyncing ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                  Mengunggah...
                                </>
                              ) : (
                                <>
                                  <CloudUpload className="h-3.5 w-3.5" />
                                  Kirim ke Cloud
                                </>
                              )}
                            </button>
                          </div>

                          {/* PULL CARD */}
                          <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-4">
                            <div className="space-y-1">
                              <h6 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                                <CloudDownload className="h-4 w-4 text-emerald-600" />
                                PULL: Ambil dari Cloud
                              </h6>
                              <p className="text-[10px] text-slate-400 leading-normal font-semibold">
                                Mengunduh data terbaru dari database cloud Supabase Absensi2027 dan menerapkannya ke perangkat ini.
                              </p>
                            </div>
                            <button
                              onClick={handlePullFromSupabase}
                              disabled={isFetchingDb}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-transparent text-white font-extrabold rounded-xl text-xs border border-emerald-500 shadow-md shadow-emerald-950/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              {isFetchingDb ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                  Mengunduh...
                                </>
                              ) : (
                                <>
                                  <CloudDownload className="h-3.5 w-3.5" />
                                  Ambil dari Cloud
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Real-time sync details list */}
                      <div className="space-y-3 pt-4 border-t border-slate-50">
                        <h5 className="font-black text-xs text-slate-850 uppercase tracking-wider">Status Penyimpanan Item</h5>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Siswa Terdaftar</p>
                            <p className="text-base font-extrabold text-slate-800">{students.length} <span className="text-xs font-semibold text-slate-400">siswa</span></p>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Modul Ajar</p>
                            <p className="text-base font-extrabold text-slate-800">{savedPlans.length} <span className="text-xs font-semibold text-slate-400">file</span></p>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Log Absensi</p>
                            <p className="text-base font-extrabold text-slate-800">{attendanceRecords.length} <span className="text-xs font-semibold text-slate-400">sesi</span></p>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Sarpras PJOK</p>
                            <p className="text-base font-extrabold text-slate-800">{inventory.length} <span className="text-xs font-semibold text-slate-400">item</span></p>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Jadwal Belajar</p>
                            <p className="text-base font-extrabold text-slate-800">{schedule.length} <span className="text-xs font-semibold text-slate-400">rombel</span></p>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Rerata Nilai</p>
                            <p className="text-base font-extrabold text-slate-800">{Object.keys(studentGrades).length} <span className="text-xs font-semibold text-slate-400">rekaman</span></p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Right panel - 5 columns: Setup instructions & query runner */}
                  <div className="lg:col-span-5 space-y-6" id="database-right-sidebar">
                    
                    {/* Database Credentials Info */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4" id="db-credentials-card">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-emerald-600" />
                        <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Kredensial Database Terhubung</h4>
                      </div>
                      
                      <div className="space-y-3 pt-2 text-xs font-semibold text-slate-700 font-mono">
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-sans">Project Name</p>
                          <p className="text-slate-850 font-bold break-all font-sans">{dbProjectInfo.projectName || "Absensi2027"}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-sans">Project ID</p>
                          <p className="text-slate-850 font-bold break-all">{dbProjectInfo.projectId || "adbrzheropnjefvoexhti"}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-sans">Project URL</p>
                          <p className="text-slate-850 font-bold break-all">{dbProjectInfo.projectUrl || "https://dbrzheropnjefvoexhti.supabase.co/rest/v1/"}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-sans">Public API Key</p>
                          <p className="text-slate-850 font-bold break-all">{dbProjectInfo.publicApiKey || "sb_publishable_qGUej4CCU1TpMueHJ7UGjA_nszgX221"}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-sans">Nama Tabel &amp; Mode</p>
                          <p className="text-slate-850 font-bold">{dbProjectInfo.tableName || "sadar_app_data"} <span className="text-[10px] font-sans font-extrabold text-emerald-600">({dbStorageMode === "supabase-direct" ? "Supabase Live" : "Hybrid Cloud Relay Aktif"})</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-step setup SQL instructions */}
                    <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md border border-slate-950 space-y-4" id="db-sql-setup-card">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Terminal className="h-4 w-4 text-emerald-400" />
                          <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Instruksi Skema Tabel Supabase</h4>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`create table if not exists public.sadar_app_data (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.sadar_app_data enable row level security;

create policy "Allow public read access" on public.sadar_app_data for select using (true);
create policy "Allow public insert access" on public.sadar_app_data for insert with check (true);
create policy "Allow public update access" on public.sadar_app_data for update using (true) with check (true);
create policy "Allow public delete access" on public.sadar_app_data for delete using (true);`);
                            setSqlCopied(true);
                            setTimeout(() => setSqlCopied(false), 2500);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-emerald-400 hover:text-emerald-300 rounded border border-slate-700 text-[10px] font-bold transition-all cursor-pointer"
                        >
                          {sqlCopied ? "✓ SQL Tersalin!" : "Salin SQL Lengkap"}
                        </button>
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs text-slate-300 leading-normal font-medium">
                          Buka SQL Editor di console Supabase <strong>Absensi2027</strong> Anda, lalu tempel dan jalankan kueri SQL berikut untuk membuat tabel data utama beserta permission RLS:
                        </p>
                        <pre className="p-3 bg-slate-950 rounded-xl text-[10px] text-emerald-400 font-mono border border-slate-850 overflow-x-auto whitespace-pre">
{`create table if not exists public.sadar_app_data (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.sadar_app_data enable row level security;

create policy "Allow public read access" on public.sadar_app_data for select using (true);
create policy "Allow public insert access" on public.sadar_app_data for insert with check (true);
create policy "Allow public update access" on public.sadar_app_data for update using (true) with check (true);
create policy "Allow public delete access" on public.sadar_app_data for delete using (true);`}
                        </pre>
                        <div className="space-y-1.5 text-[11px] text-slate-400 font-medium">
                          <p>1. Klik tombol <strong className="text-emerald-400">&quot;Salin SQL Lengkap&quot;</strong> di atas.</p>
                          <p>2. Buka dashboard proyek Supabase <strong className="text-slate-200">Absensi2027</strong>.</p>
                          <p>3. Pilih menu <strong className="text-slate-200">&quot;SQL Editor&quot;</strong> (ikon <code className="text-emerald-400 font-mono text-[10px]">&gt;_</code> di sidebar).</p>
                          <p>4. Klik <strong className="text-slate-200">&quot;New Query&quot;</strong>, tempel (Paste), lalu klik tombol hijau <strong className="text-emerald-400">&quot;Run&quot;</strong>.</p>
                          <p>5. Kembali ke sini dan klik tombol <strong className="text-emerald-400">&quot;Cek Koneksi&quot;</strong> untuk mengaktifkan mode Supabase Live.</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <DatabaseCloudGuide
                  studentsCount={students.length}
                  rombelsCount={customRombels.length}
                  attendanceCount={Object.keys(attendanceRecords).length}
                  gradesCount={Object.keys(studentGrades).length}
                  plansCount={savedPlans.length}
                  inventoryCount={inventory.length}
                  scheduleCount={schedule.length}
                  onExportJsonBackup={() => {
                    const backupPayload = {
                      exportedAt: new Date().toISOString(),
                      supabaseProjectId: "adbrzheropnjefvoexhti",
                      table: "public.sadar_app_data",
                      data: {
                        sadar_students: students,
                        sadar_custom_rombels: customRombels,
                        sadar_attendance_records: attendanceRecords,
                        sadar_student_grades: studentGrades,
                        sadar_saved_plans: savedPlans,
                        sadar_inventory: inventory,
                        sadar_schedule: schedule,
                      },
                    };
                    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `Backup_Database_SADAR_PJOK_${new Date().toISOString().slice(0, 10)}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                />
              </motion.div>
            )}

            {activeTab === "sibi" && (
              <motion.div
                key="tab-sibi"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <SibiGuideTab
                  selectedGrade={rppGrade}
                  onApplyToRpp={(grade, unit) => {
                    setRppGrade(grade);
                    setRppMaterial(`Unit ${unit.unitNumber} SIBI: ${unit.title.replace(/^Unit \d+:\s*/i, "")}`);
                    setRppDuration(unit.alokasiWaktu);
                    setActiveTab("rpp");
                  }}
                  onApplyToMateri={(grade, fase, unit) => {
                    const numMap: Record<string, string> = { I: "1", II: "2", III: "3", IV: "4", V: "5", VI: "6" };
                    setMateriKelas(`Kelas ${numMap[grade] || "4"}`);
                    setMateriFase(fase);
                    setMateriTopik(`${unit.title} (Buku Panduan PJOK SIBI)`);
                    setMateriTujuan(unit.tujuanPembelajaran.join(" "));
                    setActiveTab("materi");
                  }}
                  onApplyToLkpd={(grade, fase, unit) => {
                    const numMap: Record<string, string> = { I: "1", II: "2", III: "3", IV: "4", V: "5", VI: "6" };
                    setLkpdKelas(`Kelas ${numMap[grade] || "4"}`);
                    setLkpdFase(fase.replace("Fase ", ""));
                    setLkpdTopik(`${unit.title} (Standar SIBI)`);
                    setLkpdTujuan(unit.tujuanPembelajaran.join(" "));
                    setActiveTab("lkpd");
                  }}
                  onApplyToSoal={(grade, fase, unit) => {
                    setSoalKelas(`Kelas ${grade}`);
                    setSoalFase(fase);
                    setSoalTujuanPembelajaran(unit.tujuanPembelajaran.join("\n"));
                    setSoalRuangLingkup(`${unit.title} — ${unit.pokokMateri.join("; ")}`);
                    setActiveTab("soal");
                  }}
                />
              </motion.div>
            )}

          </AnimatePresence>

          <div className="mt-8">
            <F4ExportBar
              menuLabel={
                activeTab === "overview"
                  ? "Ringkasan Eksekutif & Kebugaran"
                  : activeTab === "students"
                  ? "Penilaian Kebugaran Jasmani (TKJI)"
                  : activeTab === "rombel"
                  ? "Data Induk Siswa & Rombel"
                  : activeTab === "attendance"
                  ? `Absensi Siswa Taktis (${
                      attendanceSubTab === "daily"
                        ? "Harian"
                        : attendanceSubTab === "weekly"
                        ? "Rekap Mingguan 1 Bulan"
                        : attendanceSubTab === "semester"
                        ? "Rekap Satu Semester"
                        : "Rekap Bulanan"
                    })`
                  : activeTab === "grades"
                  ? "Rekap Nilai Akhir Semester"
                  : activeTab === "rpp"
                  ? "Modul Ajar (RPP) Standar SIBI"
                  : activeTab === "infographics"
                  ? "Rancangan Infografis 3D AI"
                  : activeTab === "materi"
                  ? "Materi Ajar PJOK Standar SIBI"
                  : activeTab === "slides"
                  ? "Slide Presentasi Siswa AI"
                  : activeTab === "lkpd"
                  ? "Lembar Kerja Peserta Didik (LKPD)"
                  : activeTab === "soal"
                  ? "Kisi-Kisi, Soal Praktik & Format Penilaian"
                  : activeTab === "sibi"
                  ? `Silabus Buku Panduan Guru PJOK SIBI (Kelas ${rppGrade})`
                  : activeTab === "inventory"
                  ? "Inventaris Sarana & Alat Olahraga"
                  : activeTab === "schedule"
                  ? "Agenda & Jadwal Mengajar PJOK"
                  : "Laporan Status Database Cloud"
              }
              defaultOrientation={
                activeTab === "students" ||
                activeTab === "grades" ||
                activeTab === "soal" ||
                activeTab === "sibi" ||
                activeTab === "slides" ||
                (activeTab === "attendance" && attendanceSubTab !== "daily")
                  ? "landscape"
                  : "portrait"
              }
              onExport={(format, orientation) =>
                exportActiveMenuAsF4(
                  {
                    activeTab,
                    schoolInfo: {
                      schoolName,
                      schoolAddress,
                      headmasterName,
                      headmasterNip,
                      teacherName,
                      teacherNip,
                    },
                    students,
                    classFilter,
                    selectedRombel,
                    customRombels,
                    inventory,
                    schedule,
                    savedPlans,
                    currentRpp,
                    rppGrade,
                    rppMaterial,
                    rppDuration,
                    rppModel,
                    generatedInfographic,
                    infographicTopic,
                    infographicMaterial,
                    generatedMateri,
                    materiMapel,
                    materiKelas,
                    materiFase,
                    materiTopik,
                    generatedSlides,
                    slidesMateriPokok,
                    slidesKelas,
                    generatedLkpd,
                    lkpdTopik,
                    lkpdKelas,
                    lkpdSintaks,
                    generatedSoal,
                    soalKelas,
                    soalFase,
                    soalJenisAsesmen,
                    soalPenilaianRombel,
                    soalStudentScores,
                    attendanceSubTab,
                    attendanceDate,
                    attendanceRombel,
                    attendanceList,
                    attendanceRecords,
                    monthlyRecapMonth,
                    monthlyRecapYear,
                    monthlyRecapRombel,
                    semesterRecapType,
                    gradesRombel,
                    studentGrades,
                    tp1Desc,
                    tp2Desc,
                    tp3Desc,
                    tp4Desc,
                  },
                  format,
                  orientation
                )
              }
            />
          </div>
        </div>

      </main>

      {/* 3. CHANGE PASSWORD MODAL */}
      <AnimatePresence>
        {showChangePasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" id="change-password-modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl space-y-5"
              id="change-password-card"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Ubah Password Administrator</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">Ganti kunci akses masuk ke sistem SADAR PJOK</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChangePasswordModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold leading-none cursor-pointer"
                  id="close-change-password-modal-btn"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-semibold" id="change-password-form">
                <div className="space-y-1">
                  <label className="block text-slate-500 uppercase tracking-wider text-[10px]">Password Saat Ini</label>
                  <input
                    type="password"
                    required
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-lg focus:outline-none focus:border-emerald-500 font-bold text-slate-800 text-xs"
                    placeholder="Masukkan password saat ini"
                    id="change-password-old"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 uppercase tracking-wider text-[10px]">Password Baru</label>
                  <input
                    type="password"
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-lg focus:outline-none focus:border-emerald-500 font-bold text-slate-800 text-xs"
                    placeholder="Minimal 5 karakter"
                    id="change-password-new"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 uppercase tracking-wider text-[10px]">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    required
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-lg focus:outline-none focus:border-emerald-500 font-bold text-slate-800 text-xs"
                    placeholder="Ketik ulang password baru"
                    id="change-password-confirm"
                  />
                </div>

                {changePasswordError && (
                  <div className="p-3 bg-red-50 text-red-800 border border-red-100 rounded-xl text-xs flex items-center gap-2" id="change-password-error-alert">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                    <span>{changePasswordError}</span>
                  </div>
                )}

                {changePasswordSuccess && (
                  <div className="p-3 bg-green-50 text-green-800 border border-green-100 rounded-xl text-xs flex items-center gap-2" id="change-password-success-alert">
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                    <span>{changePasswordSuccess}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => setShowChangePasswordModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 cursor-pointer text-xs"
                    id="cancel-change-password-btn"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg border border-emerald-500 shadow-md shadow-emerald-950/10 cursor-pointer text-xs"
                    id="submit-change-password-btn"
                  >
                    Simpan Password Baru
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
