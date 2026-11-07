export interface Student {
  id: string;
  name: string;
  gender: "L" | "P"; // Laki-laki, Perempuan
  grade: string;     // e.g. "IV-A", "V-B"
  height: number;    // cm
  weight: number;    // kg
  // Physical tests (TKJI - Tes Kebugaran Jasmani Indonesia simplified for SD)
  runSpeed: number;  // 30m / 40m sprint (seconds)
  sitUps: number;    // sit-ups in 30 seconds (count)
  pushUps: number;   // push-ups / pull-ups in 30 seconds (count)
  verticalJump: number; // cm
  runDistance: number;  // 600m run (seconds)
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "Bola" | "Senam" | "Atletik" | "Pendukung" | "Lainnya";
  total: number;
  goodCondition: number;
  damagedCondition: number;
  unit: string; // e.g. "Buah", "Set", "Lembar"
  notes?: string;
}

export interface ScheduleItem {
  id: string;
  day: string; // "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
  timeSlot: string; // e.g. "07:00 - 08:10"
  grade: string;    // e.g. "Kelas VI-A"
  topic: string;    // e.g. "Atletik: Lompat Jauh"
  location: "Lapangan" | "Aula" | "Ruang Kelas" | "Selasar";
}

export interface SavedModulAjar {
  id: string;
  grade: string;
  material: string;
  duration: string;
  teachingModel: string;
  createdAt: string;
  content: {
    judul: string;
    alokasiWaktu: string;
    sarana: string[];
    tujuanPembelajaran: string[];
    kompetensiAwal: string;
    profilPancasila: string[];
    kegiatan: {
      pendahuluan: string[];
      inti: string[];
      penutup: string[];
    };
    asesmen: {
      sikap: string;
      pengetahuan: string;
      keterampilan: string;
    };
    tipsGuru: string;
  };
}

// BMI Calculation & Indonesian Standard Category
export function calculateBMI(weightKg: number, heightCm: number) {
  const heightM = heightCm / 100;
  if (heightM <= 0) return { bmi: 0, category: "N/A", color: "text-slate-500", bgColor: "bg-slate-100" };
  
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
  
  let category = "Normal (Ideal)";
  let color = "text-emerald-600 dark:text-emerald-400";
  let bgColor = "bg-emerald-50 text-emerald-700 border-emerald-200";

  if (bmi < 17.0) {
    category = "Sangat Kurus";
    color = "text-amber-600 dark:text-amber-400";
    bgColor = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (bmi >= 17.0 && bmi < 18.5) {
    category = "Kurus";
    color = "text-amber-500 dark:text-amber-400";
    bgColor = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (bmi >= 18.5 && bmi <= 25.0) {
    category = "Normal (Ideal)";
    color = "text-emerald-600 dark:text-emerald-400";
    bgColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (bmi > 25.0 && bmi <= 27.0) {
    category = "Gemuk (Kelebihan BB)";
    color = "text-orange-500 dark:text-orange-400";
    bgColor = "bg-orange-50 text-orange-700 border-orange-200";
  } else {
    category = "Obesitas";
    color = "text-red-600 dark:text-red-400";
    bgColor = "bg-red-50 text-red-700 border-red-200";
  }

  return { bmi, category, color, bgColor };
}

// Calculate PE Fitness Level based on simplified SD physical criteria
// Score from 0 to 100
export function calculateFitnessScore(student: Omit<Student, "id" | "name" | "gender" | "grade" | "updatedAt">) {
  let score = 0;
  
  // Speed (Sprint 30m): Good speed in SD is 5.5s - 7.5s
  if (student.runSpeed > 0) {
    if (student.runSpeed <= 6.0) score += 20;
    else if (student.runSpeed <= 7.0) score += 16;
    else if (student.runSpeed <= 8.2) score += 12;
    else if (student.runSpeed <= 9.5) score += 8;
    else score += 4;
  }

  // Sit Ups (30 seconds): Good sit ups for kids is 15 - 25 times
  if (student.sitUps > 0) {
    if (student.sitUps >= 22) score += 20;
    else if (student.sitUps >= 17) score += 16;
    else if (student.sitUps >= 12) score += 12;
    else if (student.sitUps >= 7) score += 8;
    else score += 4;
  }

  // Push ups / Pull Ups (30 seconds): Good is 12 - 20 times
  if (student.pushUps > 0) {
    if (student.pushUps >= 18) score += 20;
    else if (student.pushUps >= 13) score += 16;
    else if (student.pushUps >= 8) score += 12;
    else if (student.pushUps >= 4) score += 8;
    else score += 4;
  }

  // Vertical Jump: Good is 38cm - 50cm
  if (student.verticalJump > 0) {
    if (student.verticalJump >= 46) score += 20;
    else if (student.verticalJump >= 38) score += 16;
    else if (student.verticalJump >= 30) score += 12;
    else if (student.verticalJump >= 22) score += 8;
    else score += 4;
  }

  // Endurance Run (600m): Good is 2 mins 30s to 3 mins 30s (150s - 210s)
  if (student.runDistance > 0) {
    if (student.runDistance <= 160) score += 20;
    else if (student.runDistance <= 190) score += 16;
    else if (student.runDistance <= 230) score += 12;
    else if (student.runDistance <= 280) score += 8;
    else score += 4;
  }

  let rating = "Sedang";
  let color = "text-amber-600 dark:text-amber-400";
  let bgColor = "bg-amber-50 text-amber-700 border-amber-200";

  if (score >= 86) {
    rating = "Sangat Baik (Prima)";
    color = "text-emerald-700 dark:text-emerald-400";
    bgColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
  } else if (score >= 66 && score < 86) {
    rating = "Baik";
    color = "text-emerald-600 dark:text-emerald-400";
    bgColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (score >= 46 && score < 66) {
    rating = "Sedang";
    color = "text-sky-600 dark:text-sky-400";
    bgColor = "bg-sky-50 text-sky-700 border-sky-200";
  } else if (score >= 26 && score < 46) {
    rating = "Kurang";
    color = "text-orange-500 dark:text-orange-400";
    bgColor = "bg-orange-50 text-orange-700 border-orange-200";
  } else {
    rating = "Kurang Sekali";
    color = "text-red-600 dark:text-red-400";
    bgColor = "bg-red-50 text-red-700 border-red-200";
  }

  return { score, rating, color, bgColor };
}

// Initial students dataset
export const initialStudents: Student[] = [
  { id: "STD-1001", name: "Ahmad Rizky Pratama", gender: "L", grade: "IV-A", height: 138, weight: 35, runSpeed: 6.2, sitUps: 20, pushUps: 15, verticalJump: 40, runDistance: 165, updatedAt: "2026-10-15" },
  { id: "STD-1002", name: "Siti Aisyah Putri", gender: "P", grade: "IV-A", height: 136, weight: 34, runSpeed: 6.8, sitUps: 18, pushUps: 13, verticalJump: 38, runDistance: 180, updatedAt: "2026-10-15" },
  { id: "STD-1003", name: "Budi Santoso", gender: "L", grade: "IV-A", height: 140, weight: 37, runSpeed: 5.9, sitUps: 23, pushUps: 18, verticalJump: 46, runDistance: 155, updatedAt: "2026-10-15" },
  { id: "STD-1004", name: "Nabila Zahra", gender: "P", grade: "IV-A", height: 135, weight: 32, runSpeed: 7.1, sitUps: 17, pushUps: 12, verticalJump: 35, runDistance: 188, updatedAt: "2026-10-15" },
  { id: "STD-1005", name: "Dimas Aditya", gender: "L", grade: "IV-B", height: 139, weight: 36, runSpeed: 6.4, sitUps: 19, pushUps: 14, verticalJump: 41, runDistance: 172, updatedAt: "2026-10-15" },
  { id: "STD-1006", name: "Putri Maharani", gender: "P", grade: "IV-B", height: 137, weight: 34, runSpeed: 6.9, sitUps: 18, pushUps: 13, verticalJump: 37, runDistance: 182, updatedAt: "2026-10-15" },
  { id: "STD-1007", name: "Fajar Ramadhan", gender: "L", grade: "V-A", height: 144, weight: 40, runSpeed: 5.8, sitUps: 24, pushUps: 19, verticalJump: 47, runDistance: 152, updatedAt: "2026-10-15" },
  { id: "STD-1008", name: "Kirana Dewi Lestari", gender: "P", grade: "V-A", height: 142, weight: 38, runSpeed: 6.5, sitUps: 20, pushUps: 14, verticalJump: 40, runDistance: 170, updatedAt: "2026-10-15" },
  { id: "STD-1009", name: "Reza Mahendra", gender: "L", grade: "V-B", height: 145, weight: 41, runSpeed: 6.1, sitUps: 21, pushUps: 16, verticalJump: 43, runDistance: 162, updatedAt: "2026-10-15" },
  { id: "STD-1010", name: "Intan Permatasari", gender: "P", grade: "V-B", height: 141, weight: 37, runSpeed: 6.7, sitUps: 19, pushUps: 13, verticalJump: 39, runDistance: 176, updatedAt: "2026-10-15" },
  { id: "STD-1011", name: "Bagas Kara Wijaya", gender: "L", grade: "VI-A", height: 150, weight: 45, runSpeed: 5.7, sitUps: 25, pushUps: 20, verticalJump: 49, runDistance: 148, updatedAt: "2026-10-15" },
  { id: "STD-1012", name: "Alya Nurhaliza", gender: "P", grade: "VI-A", height: 148, weight: 43, runSpeed: 6.3, sitUps: 22, pushUps: 16, verticalJump: 42, runDistance: 164, updatedAt: "2026-10-15" },
  { id: "STD-1013", name: "Galih Prakoso", gender: "L", grade: "VI-B", height: 149, weight: 44, runSpeed: 6.0, sitUps: 22, pushUps: 17, verticalJump: 45, runDistance: 158, updatedAt: "2026-10-15" },
  { id: "STD-1014", name: "Nadia Safitri", gender: "P", grade: "VI-B", height: 147, weight: 42, runSpeed: 6.6, sitUps: 20, pushUps: 15, verticalJump: 41, runDistance: 168, updatedAt: "2026-10-15" }
];

// Initial PE equipment inventory dataset
export const initialInventory: InventoryItem[] = [
  { id: "inv-1", name: "Bola Sepak Size 4 (SD)", category: "Bola", total: 15, goodCondition: 12, damagedCondition: 3, unit: "Buah", notes: "Merk Proteam, standard latihan kelas IV-VI" },
  { id: "inv-2", name: "Bola Voli Spons (Aman)", category: "Bola", total: 10, goodCondition: 8, damagedCondition: 2, unit: "Buah", notes: "Bola Voli lunak agar anak tidak sakit tangannya" },
  { id: "inv-3", name: "Matras Olahraga Senam Lantai", category: "Senam", total: 6, goodCondition: 5, damagedCondition: 1, unit: "Buah", notes: "Ketebalan 10cm, busa padat anti selip" },
  { id: "inv-4", name: "Pemukul Kasti Kayu", category: "Lainnya", total: 8, goodCondition: 8, damagedCondition: 0, unit: "Buah", notes: "Dilengkapi tali pengaman pergelangan" },
  { id: "inv-5", name: "Bola Kasti Karet", category: "Lainnya", total: 30, goodCondition: 26, damagedCondition: 4, unit: "Buah", notes: "Bola tenis/kasti standard latihan lempar tangkap" },
  { id: "inv-6", name: "Cone Kerucut Penanda (Cones)", category: "Pendukung", total: 40, goodCondition: 38, damagedCondition: 2, unit: "Buah", notes: "Tinggi 23cm, warna oranye menyala" },
  { id: "inv-7", name: "Stopwatch Digital", category: "Pendukung", total: 4, goodCondition: 3, damagedCondition: 1, unit: "Buah", notes: "Digunakan untuk tes lari dan kelincahan" },
  { id: "inv-8", name: "Pita Pengukur / Metlin (50m)", category: "Pendukung", total: 2, goodCondition: 2, damagedCondition: 0, unit: "Buah", notes: "Untuk mengukur lompat jauh dan lempar bola" },
  { id: "inv-9", name: "Peluit Guru", category: "Pendukung", total: 3, goodCondition: 3, damagedCondition: 0, unit: "Buah", notes: "Merk Fox 40, suara nyaring" }
];

// Initial teaching schedule dataset (Sesuai Unit Buku Panduan Guru PJOK SIBI Kemendikbudristek)
export const initialSchedule: ScheduleItem[] = [
  { id: "sch-1", day: "Senin", timeSlot: "07:15 - 08:35", grade: "Kelas IV-A", topic: "Unit 3 SIBI: Permainan Lapangan (Kasti - Melempar & Menangkap)", location: "Lapangan" },
  { id: "sch-2", day: "Senin", timeSlot: "08:45 - 10:05", grade: "Kelas IV-B", topic: "Unit 1 SIBI: Permainan Invasi (Sepak Bola & Bola Tangan Modifikasi)", location: "Lapangan" },
  { id: "sch-3", day: "Selasa", timeSlot: "07:15 - 08:35", grade: "Kelas V-A", topic: "Unit 2 SIBI: Permainan Net (Passing Bawah & Atas Bola Voli Mini)", location: "Lapangan" },
  { id: "sch-4", day: "Selasa", timeSlot: "08:45 - 10:05", grade: "Kelas V-B", topic: "Unit 5 SIBI: Aktivitas Atletik (Start Jongkok & Lari Estafet)", location: "Lapangan" },
  { id: "sch-5", day: "Rabu", timeSlot: "07:15 - 08:35", grade: "Kelas VI-A", topic: "Unit 8 SIBI: Pengukuran Kebugaran Jasmani (TKJI) & P3K (RICE)", location: "Lapangan" },
  { id: "sch-6", day: "Rabu", timeSlot: "08:45 - 10:05", grade: "Kelas VI-B", topic: "Unit 6 SIBI: Rangkaian Senam Lantai (Guling Depan & Belakang)", location: "Aula" },
  { id: "sch-7", day: "Kamis", timeSlot: "07:15 - 08:35", grade: "Kelas III-A", topic: "Unit 1 SIBI: Kombinasi Pola Gerak Dasar Lokomotor", location: "Aula" },
  { id: "sch-8", day: "Jumat", timeSlot: "07:30 - 08:40", grade: "Kelas I-A", topic: "Unit 1 SIBI: Aktivitas Pola Gerak Dasar Lokomotor", location: "Selasar" }
];

// Suggested topics based on grade level (Bersumber dari Unit 1-8 Buku Panduan Guru PJOK SIBI Kemendikbudristek)
export const materialSuggestionsByGrade: { [key: string]: string[] } = {
  "I": [
    "Unit 1 SIBI: Aktivitas Pola Gerak Dasar Lokomotor (Berjalan, Berlari, Melompat)",
    "Unit 2 SIBI: Aktivitas Pola Gerak Dasar Nonlokomotor (Memutar, Mengayun, Membungkuk, Meliuk)",
    "Unit 3 SIBI: Aktivitas Pola Gerak Dasar Manipulatif (Melempar dan Menangkap Bola)",
    "Unit 4 SIBI: Aktivitas Senam (Gerak Dominan Keseimbangan Statis & Dinamis)",
    "Unit 5 SIBI: Aktivitas Gerak Berirama (Langkah Kaki & Ayunan Lengan)",
    "Unit 6 SIBI: Aktivitas Pengenalan Air & Keselamatan di Kolam",
    "Unit 7 SIBI: Aktivitas Kebugaran Jasmani (Sikap Tubuh Diam dan Bergerak)",
    "Unit 8 SIBI: Mengenal Bagian-Bagian Tubuh & Kebersihan Diri"
  ],
  "II": [
    "Unit 1 SIBI: Aktivitas Variasi Pola Gerak Dasar Lokomotor",
    "Unit 2 SIBI: Aktivitas Variasi Pola Gerak Dasar Nonlokomotor (Menarik & Mendorong)",
    "Unit 3 SIBI: Aktivitas Variasi Pola Gerak Dasar Manipulatif (Lempar-Tangkap & Tendang-Tahan)",
    "Unit 4 SIBI: Aktivitas Senam (Bertumpu, Berguling, dan Mendarat)",
    "Unit 5 SIBI: Aktivitas Gerak Berirama (Variasi Langkah & Ayunan Mengikuti Ketukan)",
    "Unit 6 SIBI: Aktivitas Pengenalan Air (Mengapung & Meluncur Dasar)",
    "Unit 7 SIBI: Aktivitas Kebugaran Jasmani (Latihan Kekuatan Otot Lengan, Bahu, Perut)",
    "Unit 8 SIBI: Cara Menjaga Kebersihan Lingkungan Kamar, Rumah, dan Sekolah"
  ],
  "III": [
    "Unit 1 SIBI: Aktivitas Kombinasi Pola Gerak Dasar Lokomotor (Jalan, Lari, Lompat)",
    "Unit 2 SIBI: Aktivitas Kombinasi Pola Gerak Dasar Nonlokomotor",
    "Unit 3 SIBI: Aktivitas Kombinasi Pola Gerak Dasar Manipulatif",
    "Unit 4 SIBI: Aktivitas Gerak Dominan Senam Lantai",
    "Unit 5 SIBI: Aktivitas Gerak Berirama (Kombinasi Langkah & Ayunan Lengan)",
    "Unit 6 SIBI: Aktivitas Permainan dan Olahraga di Air (Dasar Renang Gaya Dada)",
    "Unit 7 SIBI: Aktivitas Kebugaran Jasmani (Daya Tahan, Kekuatan, dan Kelenturan)",
    "Unit 8 SIBI: Aktivitas Fisik, Istirahat, dan Memilih Makanan Bergizi Seimbang (Isi Piringku)"
  ],
  "IV": [
    "Unit 1 SIBI: Variasi & Kombinasi Gerak Dasar Permainan Invasi (Sepak Bola & Bola Tangan Mini)",
    "Unit 2 SIBI: Variasi & Kombinasi Gerak Dasar Permainan Net (Bola Voli Mini)",
    "Unit 3 SIBI: Variasi & Kombinasi Gerak Dasar Permainan Lapangan (Bola Kasti)",
    "Unit 4 SIBI: Aktivitas Bela Diri Pencak Silat (Kuda-Kuda, Langkah, Pukulan, Tangkisan)",
    "Unit 5 SIBI: Aktivitas Gerak Dasar Atletik (Jalan Cepat, Lari Cepat, Lompat Jauh, Lempar Turbo)",
    "Unit 6 SIBI: Aktivitas Pola Gerak Dominan Senam Lantai (Sikap Lilin & Guling Depan)",
    "Unit 7 SIBI: Aktivitas Gerak Berirama & Renang Gaya Dada Dasar",
    "Unit 8 SIBI: Aktivitas Kebugaran Jasmani & Pemeliharaan Kebersihan Alat Reproduksi"
  ],
  "V": [
    "Unit 1 SIBI: Aktivitas Permainan Invasi (Modifikasi Gerak Passing, Dribbling, Shooting)",
    "Unit 2 SIBI: Aktivitas Permainan Net (Passing Bawah, Passing Atas, Servis Bola Voli)",
    "Unit 3 SIBI: Aktivitas Permainan Lapangan (Melempar, Menangkap, Memukul Bola Kasti)",
    "Unit 4 SIBI: Aktivitas Bela Diri Pencak Silat (Kombinasi Serangan & Belaan)",
    "Unit 5 SIBI: Aktivitas Gerak Dasar Atletik (Start Jongkok, Lari Estafet, Lompat Jauh)",
    "Unit 6 SIBI: Aktivitas Senam Lantai (Guling Depan, Guling Belakang, Lompat Kangkang)",
    "Unit 7 SIBI: Aktivitas Gerak Berirama & Keselamatan di Air",
    "Unit 8 SIBI: Aktivitas Kebugaran Jasmani (Daya Tahan Jantung-Paru) & Bahaya Merokok/NAPZA"
  ],
  "VI": [
    "Unit 1 SIBI: Modifikasi Pola Gerak Dasar Permainan Invasi (Bola Basket & Sepak Bola)",
    "Unit 2 SIBI: Modifikasi Pola Gerak Dasar Permainan Net (Bola Voli & Bulu Tangkis)",
    "Unit 3 SIBI: Modifikasi Pola Gerak Dasar Permainan Lapangan (Kasti / Rounders)",
    "Unit 4 SIBI: Aktivitas Bela Diri Pencak Silat (Rangkaian Jurus Serang-Bela)",
    "Unit 5 SIBI: Aktivitas Atletik (Lompat Jauh Gaya Menggantung & Tolak Peluru Anak)",
    "Unit 6 SIBI: Aktivitas Senam Lantai (Rangkaian Guling Depan, Belakang & Meroda)",
    "Unit 7 SIBI: Aktivitas Gerak Berirama (SKJ) & Penyelamatan di Air (Water Safety)",
    "Unit 8 SIBI: Pengukuran Kebugaran Jasmani (TKJI) & Pertolongan Pertama Cedera (P3K/RICE)"
  ]
};

