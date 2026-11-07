import { Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { generateContentWithFallback, extractJson } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  let reqBody: any = {};
  try {
    reqBody = await req.json();
  } catch {
    reqBody = {};
  }

  const grade = reqBody.grade || "IV";
  const material = (reqBody.material || "Permainan Bola Kasti: Melempar dan Menangkap").trim();
  const duration = (reqBody.duration || "2 x 35 Menit (1 Pertemuan)").trim();
  const teachingModel = (reqBody.teachingModel || "Cooperative Learning").trim();

  const faseLabel =
    grade === "I" || grade === "II"
      ? "Fase A (Kelas I-II SD)"
      : grade === "III" || grade === "IV"
      ? "Fase B (Kelas III-IV SD)"
      : "Fase C (Kelas V-VI SD)";

  const buildFallbackModul = () => {
    const modelSyntaxSteps: Record<string, string[]> = {
      "Cooperative Learning": [
        `Fase 1 (Penyampaian Tujuan & Motivasi): Guru mendemonstrasikan teknik dasar ${material} dan menjelaskan tantangan kelompok yang akan diselesaikan bersama.`,
        `Fase 2 (Pembagian Tim Heterogen): Siswa dibagi menjadi kelompok kecil (4-5 anak) secara adil untuk berlatih variasi gerakan ${material} secara bergantian.`,
        `Fase 3 (Bimbingan Kerja Tim): Setiap anggota kelompok saling mengamati dan membantu memperbaiki posisi tubuh teman saat mempraktikkan ${material} dengan supervisi guru.`,
        `Fase 4 (Permainan Kooperatif & Evaluasi): Kelompok mempraktikkan mini-game ${material} dengan aturan modifikasi yang menekankan kerja sama dan sportivitas.`,
        `Fase 5 (Penghargaan Kelompok): Guru memberikan apresiasi bintang sportivitas bagi tim yang paling kompak, disiplin, dan saling mendukung.`
      ],
      "Inquiry / Discovery Learning": [
        `Fase 1 (Stimulasi / Rangsangan Gerak): Guru menampilkan peragaan gerakan ${material} dan mengajukan pertanyaan pemantik: "Bagaimana posisi tubuh agar gerakan lebih stabil dan akurat?"`,
        `Fase 2 (Identifikasi Masalah): Siswa berdiskusi singkat dan mencoba berbagai cara melakukan gerakan ${material} secara mandiri maupun berpasangan.`,
        `Fase 3 (Pengumpulan Pengalaman Gerak): Siswa mengeksplorasi variasi gerak ${material} pada beberapa pos latihan bertahap di lapangan.`,
        `Fase 4 (Pembuktian & Praktik Terbimbing): Siswa membandingkan cara gerak yang paling efektif dan menerapkannya dalam tantangan permainan ${material}.`,
        `Fase 5 (Menarik Kesimpulan): Siswa bersama guru menyimpulkan kunci keberhasilan teknik gerak ${material} yang aman dan benar.`
      ],
      "Direct Instruction": [
        `Fase 1 (Orientasi & Demonstrasi Guru): Guru memperagakan tahapan teknik ${material} (sikap awal, gerakan inti, dan sikap akhir) secara jelas dan perlahan.`,
        `Fase 2 (Praktik Terstruktur): Siswa berbaris rapi dan menirukan gerakan ${material} langkah demi langkah sesuai aba-aba peluit guru.`,
        `Fase 3 (Praktik Terbimbing Berpasangan): Siswa melakukan drill gerakan ${material} secara berpasangan sementara guru berkeliling memberikan koreksi postur secara langsung.`,
        `Fase 4 (Uji Keterampilan Mandiri): Siswa menerapkan gerakan ${material} dalam rintangan atau permainan aplikatif di lapangan.`
      ],
      "Project Based Learning": [
        `Fase 1 (Pertanyaan Mendasar): Guru mengajak siswa mengamati tantangan gerak dalam ${material} dan merancang rangkaian latihan kelompok.`,
        `Fase 2 (Menyusun Rencana Aktivitas): Setiap kelompok menyusun kombinasi gerakan atau strategi permainan ${material} menggunakan alat yang tersedia.`,
        `Fase 3 (Latihan & Uji Coba Lapangan): Kelompok berlatih mempraktikkan rangkaian gerak ${material} sambil mencatat kemajuan setiap anggota.`,
        `Fase 4 (Unjuk Karya Gerak): Setiap kelompok menampilkan demonstrasi rangkaian gerak/permainan ${material} di depan kelas dan menerima umpan balik positif.`
      ],
      "Playful Movement": [
        `Fase 1 (Permainan Pemanasan Tematik): Guru membuka kegiatan dengan permainan kejar-tangkap ceria yang mengaktifkan gerak dasar menuju materi ${material}.`,
        `Fase 2 (Pos Petualangan Gerak): Siswa melewati 3 pos tantangan bermain sambil belajar teknik dasar ${material} secara menyenangkan.`,
        `Fase 3 ( festival Mini-Game ${material}): Siswa bermain dalam pertandingan persahabatan dengan aturan ramah anak yang memastikan semua siswa aktif bergerak.`,
        `Fase 4 (Selebrasi & Apresiasi): Siswa saling melakukan tos sportivitas dan menceritakan bagian permainan yang paling seru.`
      ]
    };

    const intiSteps = modelSyntaxSteps[teachingModel] || modelSyntaxSteps["Cooperative Learning"];

    return {
      judul: `Modul Ajar PJOK: ${material} (Kelas ${grade} SD - ${faseLabel})`,
      alokasiWaktu: duration,
      sarana: [
        "Lapangan sekolah / ruang terbuka yang rata, bersih, dan bebas benda tajam",
        "Peluit guru, stopwatch digital, dan papan klip daftar hadir",
        `Peralatan utama pembelajaran: ${material} (termasuk modifikasi alat ramah anak SD)`,
        "Cone / kerucut penanda batas area gerak (10-12 buah) & kotak P3K standar"
      ],
      tujuanPembelajaran: [
        `Peserta didik (${faseLabel}) mampu menjelaskan prosedur dan tahapan gerak dasar pada materi ${material} dengan bahasa sendiri secara tepat.`,
        `Peserta didik mampu mempraktikkan variasi dan kombinasi keterampilan gerak ${material} secara terkontrol, aman, dan percaya diri.`,
        `Peserta didik mampu menerapkan nilai sportivitas, kejujuran, kerja sama, dan kepedulian terhadap keselamatan teman selama aktivitas pembelajaran ${material}.`
      ],
      kompetensiAwal: `Peserta didik Kelas ${grade} SD telah mengenal gerak dasar lokomotor, non-lokomotor, dan manipulatif sederhana serta memahami aturan dasar keselamatan di lapangan sebelum mempelajari ${material}.`,
      profilPancasila: [
        "Mandiri (Regulasi diri dan percaya diri saat mencoba keterampilan gerak baru)",
        "Gotong Royong (Kolaborasi dan kepedulian dalam aktivitas berpasangan/berkelompok)",
        "Bernalar Kritis (Mengevaluasi posisi tubuh dan cara melakukan gerakan yang efektif)"
      ],
      kegiatan: {
        pendahuluan: [
          "Guru membariskan peserta didik dalam formasi setengah lingkaran, memberi salam, memimpin doa bersama, dan memeriksa kehadiran serta kondisi kesehatan siswa.",
          `Guru melakukan apersepsi dengan mengaitkan materi ${material} dengan aktivitas sehari-hari siswa serta menyampaikan tujuan pembelajaran hari ini.`,
          "Guru memimpin pemanasan statis, dinamis, dilanjutkan permainan pemanasan ceria (fun warm-up game) selama 5-7 menit untuk menaikkan suhu tubuh secara bertahap."
        ],
        inti: intiSteps,
        penutup: [
          "Peserta didik melakukan gerakan pendinginan (cooling down) dan peregangan otot secara berpasangan diiringi pengaturan napas.",
          `Guru dan siswa melakukan sesi refleksi interaktif mengenai pengalaman mempraktikkan ${material}, kesulitan yang dihadapi, dan cara mengatasinya.`,
          "Guru memberikan apresiasi atas usaha seluruh siswa, menyampaikan materi pertemuan berikutnya, merapikan alat bersama-sama, dan menutup pelajaran dengan doa."
        ]
      },
      asesmen: {
        sikap: "Observasi langsung menggunakan jurnal sikap Profil Pelajar Pancasila (keaktifan, disiplin, kerja sama, dan sportivitas selama kegiatan).",
        pengetahuan: `Tanya jawab lisan dan kuis singkat mengenai tahapan gerak yang benar serta aturan keselamatan pada materi ${material}.`,
        keterampilan: `Unjuk kerja / tes praktik gerak ${material} menggunakan rubrik penilaian 3 kriteria: Sikap Awalan (30%), Pelaksanaan Gerak Inti (40%), dan Sikap Akhir / Koordinasi (30%).`
      },
      tipsGuru: `Pastikan seluruh siswa terhidrasi dengan baik sebelum dan sesudah aktivitas. Gunakan alat peraga modifikasi (misalnya bola karet/spons atau jarak yang disesuaikan) bagi siswa Kelas ${grade} yang masih membutuhkan adaptasi motorik.`
    };
  };

  try {
    const prompt = `
      Buatlah Modul Ajar (RPP) Kurikulum Merdeka Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK) tingkat Sekolah Dasar (SD) dengan spesifikasi berikut:
      - Kelas: Kelas ${grade} SD (${faseLabel})
      - Materi Pembelajaran: ${material}
      - Alokasi Waktu: ${duration}
      - Model Pembelajaran: ${teachingModel}
      
      Harap berikan respons dalam format JSON terstruktur Bahasa Indonesia yang ramah guru, inspiratif, mendalam, dan praktis dengan skema yang tepat.
    `;

    const systemInstruction = `
      Anda adalah pakar kurikulum Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK) tingkat Sekolah Dasar.
      Tugas Anda adalah membuat Modul Ajar (RPP) Kurikulum Merdeka yang sangat kreatif, aman (mengutamakan keselamatan siswa), dan menyenangkan (joyful learning).
      Seluruh teks harus dalam Bahasa Indonesia yang formal namun ramah guru.
    `;

    const response = await generateContentWithFallback({
      contents: prompt,
      fallbackGenerator: buildFallbackModul,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "judul",
            "alokasiWaktu",
            "sarana",
            "tujuanPembelajaran",
            "kompetensiAwal",
            "profilPancasila",
            "kegiatan",
            "asesmen",
            "tipsGuru"
          ],
          properties: {
            judul: { type: Type.STRING },
            alokasiWaktu: { type: Type.STRING },
            sarana: { type: Type.ARRAY, items: { type: Type.STRING } },
            tujuanPembelajaran: { type: Type.ARRAY, items: { type: Type.STRING } },
            kompetensiAwal: { type: Type.STRING },
            profilPancasila: { type: Type.ARRAY, items: { type: Type.STRING } },
            kegiatan: {
              type: Type.OBJECT,
              required: ["pendahuluan", "inti", "penutup"],
              properties: {
                pendahuluan: { type: Type.ARRAY, items: { type: Type.STRING } },
                inti: { type: Type.ARRAY, items: { type: Type.STRING } },
                penutup: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            asesmen: {
              type: Type.OBJECT,
              required: ["sikap", "pengetahuan", "keterampilan"],
              properties: {
                sikap: { type: Type.STRING },
                pengetahuan: { type: Type.STRING },
                keterampilan: { type: Type.STRING }
              }
            },
            tipsGuru: { type: Type.STRING }
          }
        }
      }
    });

    const text = response?.text;
    if (!text) {
      return NextResponse.json(buildFallbackModul());
    }

    const parsedData = extractJson(text) || buildFallbackModul();
    return NextResponse.json(parsedData);
  } catch {
    return NextResponse.json(buildFallbackModul());
  }
}
