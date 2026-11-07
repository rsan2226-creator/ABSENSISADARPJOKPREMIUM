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

// Initial teaching schedule dataset
export const initialSchedule: ScheduleItem[] = [
  { id: "sch-1", day: "Senin", timeSlot: "07:15 - 08:35", grade: "Kelas IV-A", topic: "Permainan Kasti: Teknik Melempar", location: "Lapangan" },
  { id: "sch-2", day: "Senin", timeSlot: "08:45 - 10:05", grade: "Kelas IV-B", topic: "Permainan Kasti: Teknik Melempar", location: "Lapangan" },
  { id: "sch-3", day: "Selasa", timeSlot: "07:15 - 08:35", grade: "Kelas V-A", topic: "Sepak Bola: Menendang Kaki Dalam", location: "Lapangan" },
  { id: "sch-4", day: "Selasa", timeSlot: "08:45 - 10:05", grade: "Kelas V-B", topic: "Sepak Bola: Menendang Kaki Dalam", location: "Lapangan" },
  { id: "sch-5", day: "Rabu", timeSlot: "07:15 - 08:35", grade: "Kelas VI-A", topic: "Kebugaran Jasmani: Pengukuran TKJI", location: "Lapangan" },
  { id: "sch-6", day: "Rabu", timeSlot: "08:45 - 10:05", grade: "Kelas VI-B", topic: "Kebugaran Jasmani: Pengukuran TKJI", location: "Lapangan" },
  { id: "sch-7", day: "Kamis", timeSlot: "07:15 - 08:35", grade: "Kelas III-A", topic: "Gerak Lokomotor: Melompat & Berlari", location: "Aula" },
  { id: "sch-8", day: "Jumat", timeSlot: "07:30 - 08:40", grade: "Kelas I-A", topic: "Pengenalan Pola Gerak Dominan", location: "Selasar" }
];

// Suggested topics based on grade level
export const materialSuggestionsByGrade: { [key: string]: string[] } = {
  "I": ["Pola Gerak Dasar Lokomotor (Berjalan, Berlari, Melompat)", "Gerak Non-Lokomotor (Meregang, Menekuk, Berputar)", "Senam Irama Anak Sederhana", "Pengenalan Aktivitas Air / Bermain Air"],
  "II": ["Pola Gerak Manipulatif (Melempar, Menangkap, Menendang Bola Plastik)", "Keseimbangan Statis dan Dinamis (Senam Lantai)", "Pemanasan Kreatif Bernyanyi", "Aktivitas Kebersihan Diri dan Makanan Sehat"],
  "III": ["Kombinasi Gerak Lokomotor dan Non-Lokomotor", "Permainan Tradisional Kucing-Kucingan dan Bentengan", "Senam Ketangkasan Sederhana", "Bahaya Jajanan Sembarangan & Pola Istirahat"],
  "IV": ["Teknik Dasar Kasti: Melempar, Menangkap, Memukul", "Teknik Dasar Sepak Bola: Menggiring dan Menendang Kaki Bagian Dalam", "Pengenalan Kebugaran Jasmani (Kelincahan & Kelenturan)", "Pertolongan Pertama pada Cedera Ringan (P3K) Sekolah"],
  "V": ["Teknik Dasar Bola Voli: Passing Bawah & Passing Atas", "Atletik: Teknik Start Jongkok & Lari Estafet", "Kombinasi Senam Lantai Guling Depan & Belakang", "Bahaya Narkoba, Merokok, dan Minuman Keras sejak Dini"],
  "VI": ["Teknik Dasar Bola Basket: Dribbling & Chest Pass", "Atletik: Lompat Jauh Gaya Menggantung", "Kombinasi Senam Rambu / Senam Kesegaran Jasmani (SKJ)", "Memahami Perkembangan Fisik Masa Pubertas"]
};
