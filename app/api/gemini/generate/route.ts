import { Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { generateContentWithFallback, extractJson } from "@/lib/gemini";
import { getSibiBookByGrade } from "@/lib/sibi-pjok-data";

export async function POST(req: NextRequest) {
  let reqBody: any = {};
  try {
    reqBody = await req.json();
  } catch {
    reqBody = {};
  }

  const grade = reqBody.grade || "IV";
  const material = (reqBody.material || "Unit 3 SIBI: Variasi & Kombinasi Gerak Dasar Permainan Lapangan (Bola Kasti)").trim();
  const duration = (reqBody.duration || "3 x 35 Menit (1 Pertemuan / 3 JP Standar SIBI)").trim();
  const teachingModel = (reqBody.teachingModel || "Cooperative Learning").trim();

  const sibiBook = getSibiBookByGrade(grade);
  const faseLabel = `${sibiBook.fase} (${sibiBook.kelasLabel})`;

  const buildFallbackModul = () => {
    const modelSyntaxSteps: Record<string, string[]> = {
      "Cooperative Learning": [
        `Aktivitas Pembelajaran 1 - Eksplorasi Gerak Dasar (Standar Buku Panduan PJOK SIBI): Guru mendemonstrasikan fakta, konsep, dan prosedur gerak pada materi ${material}; peserta didik mengamati dan mencoba gerakan dasar secara perorangan/berpasangan.`,
        `Aktivitas Pembelajaran 2 - Variasi & Kombinasi Gerak Berkelompok: Siswa dibagi menjadi kelompok heterogen (4-5 anak) untuk mempraktikkan variasi dan kombinasi keterampilan gerak ${material} secara bergantian sambil saling memberikan umpan balik korektif.`,
        `Aktivitas Pembelajaran 3 - Penerapan dalam Permainan Peraturan Dimodifikasi (SIBI): Kelompok mempraktikkan permainan sederhana/modifikasi ${material} yang menekankan kerja sama, sportivitas (fair play), dan tanggung jawab sosial.`,
        `Pembelajaran Alternatif & Diferensiasi (SIBI): Bagi peserta didik yang membutuhkan adaptasi motorik, jarak dan alat dimodifikasi (bola karet/spons); bagi yang sudah mahir diberikan tantangan kombinasi gerak lanjutan.`
      ],
      "Inquiry / Discovery Learning": [
        `Aktivitas Pembelajaran 1 - Stimulasi & Identifikasi Gerak (Buku Panduan PJOK SIBI): Guru memperagakan gerakan ${material} dan mengajukan pertanyaan pemantik: "Bagaimana posisi tumpuan kaki dan ayunan tubuh agar gerakan lebih stabil, akurat, dan aman?"`,
        `Aktivitas Pembelajaran 2 - Pengumpulan Pengalaman Gerak & Pembuktian: Siswa mengeksplorasi variasi gerak ${material} pada pos latihan bertahap sesuai Buku Siswa PJOK SIBI dan membandingkan teknik yang paling efektif.`,
        `Aktivitas Pembelajaran 3 - Permainan Modifikasi & Kesimpulan (SIBI): Siswa menerapkan teknik gerak terbaik dalam permainan modifikasi ${material} serta menyimpulkan prosedur gerak yang benar bersama guru.`
      ],
      "Direct Instruction": [
        `Aktivitas Pembelajaran 1 - Orientasi & Peragaan Prosedur Gerak (Buku Panduan PJOK SIBI): Guru memperagakan tahapan teknik ${material} (Sikap Awalan, Sikap Pelaksanaan, dan Sikap Akhir) secara bertahap dan jelas.`,
        `Aktivitas Pembelajaran 2 - Praktik Terbimbing Berpasangan: Siswa mempraktikkan variasi dan kombinasi gerakan ${material} sesuai aba-aba peluit sementara guru berkeliling melakukan koreksi postur.`,
        `Aktivitas Pembelajaran 3 - Permainan Aplikatif Modifikasi (SIBI): Siswa menerapkan keterampilan ${material} dalam permainan dengan peraturan yang dimodifikasi sesuai Buku Panduan Guru PJOK SIBI.`
      ],
      "Project Based Learning": [
        `Aktivitas Pembelajaran 1 - Pertanyaan Mendasar & Perencanaan Gerak (SIBI): Siswa mengamati tantangan keterampilan dalam ${material} mengacu pada Buku Panduan PJOK SIBI dan merancang rangkaian latihan kelompok.`,
        `Aktivitas Pembelajaran 2 - Latihan Terstruktur & Uji Coba Lapangan: Setiap kelompok berlatih menyusun kombinasi gerak atau taktik permainan ${material} menggunakan sarana olahraga/modifikasi.`,
        `Aktivitas Pembelajaran 3 - Unjuk Karya Gerak & Evaluasi (SIBI): Kelompok mendemonstrasikan rangkaian gerak/permainan ${material} di lapangan dan melakukan evaluasi proses gerak.`
      ],
      "Playful Movement": [
        `Aktivitas Pembelajaran 1 - Eksplorasi Gerak Ceria (Buku Panduan PJOK SIBI): Siswa mencoba gerakan dasar ${material} melalui aktivitas menirukan dan tantangan berpasangan.`,
        `Aktivitas Pembelajaran 2 - Pos Petualangan Variasi Gerak: Siswa melewati 3 pos latihan variasi dan kombinasi gerak ${material} secara bergembira.`,
        `Aktivitas Pembelajaran 3 - Festival Permainan Modifikasi (SIBI): Siswa bermain dalam pertandingan persahabatan ${material} dengan aturan ramah anak yang memastikan seluruh siswa aktif bergerak.`
      ]
    };

    const intiSteps = modelSyntaxSteps[teachingModel] || modelSyntaxSteps["Cooperative Learning"];

    return {
      judul: `Modul Ajar PJOK (Standar SIBI): ${material} — ${sibiBook.kelasLabel} (${sibiBook.fase})`,
      alokasiWaktu: duration,
      sarana: [
        `Sumber Utama: ${sibiBook.bookTitle} (${sibiBook.authors}, ISBN ${sibiBook.isbn}, ${sibiBook.publisher})`,
        "Lapangan sekolah / ruang terbuka yang rata, bersih, dan aman",
        "Peluit guru, stopwatch digital, dan Lembar Amatan Proses Gerak SIBI",
        `Peralatan utama & modifikasi ramah anak: ${material} (bola karet/spons, cone penanda/botol plastik, matras, dan kotak P3K)`
      ],
      tujuanPembelajaran: [
        `[Elemen Pengetahuan Gerak - SIBI] Peserta didik (${faseLabel}) mampu menjelaskan fakta, konsep, dan prosedur tahapan gerak (sikap awal, pelaksanaan, sikap akhir) pada materi ${material} dengan benar.`,
        `[Elemen Keterampilan Gerak - SIBI] Peserta didik mampu mempraktikkan variasi dan kombinasi pola gerak pada materi ${material} dalam aktivitas latihan maupun permainan dengan peraturan yang dimodifikasi.`,
        `[Elemen Pengembangan Karakter & Nilai Gerak - SIBI] Peserta didik mampu menunjukkan tanggung jawab personal (mandiri, jujur, disiplin) dan tanggung jawab sosial (kerja sama, peduli, sportivitas/fair play) selama pembelajaran.`
      ],
      kompetensiAwal: `Berdasarkan skema ${sibiBook.bookTitle} (SIBI Kemendikbudristek), peserta didik ${sibiBook.kelasLabel} telah mengenal pola gerak dasar fundamental serta memahami aturan keselamatan berolahraga sebelum mempelajari ${material}.`,
      profilPancasila: [
        "Mandiri (Tanggung jawab personal, regulasi diri, dan percaya diri saat mempraktikkan gerak)",
        "Gotong Royong (Tanggung jawab sosial, kolaborasi, dan kepedulian dalam aktivitas berpasangan/berkelompok)",
        "Bernalar Kritis (Menganalisis prosedur gerak yang efektif sesuai Buku Panduan PJOK SIBI)"
      ],
      kegiatan: {
        pendahuluan: [
          "Persiapan & Baris-Berbaris (15 Menit - Standar SIBI): Guru membariskan peserta didik dalam formasi setengah lingkaran/bersaf, memberi salam, memimpin doa, memeriksa kehadiran, dan memastikan seluruh siswa dalam kondisi sehat.",
          `Apersepsi & Pemantik: Guru mengaitkan materi ${material} dengan pengalaman gerak sehari-hari siswa serta menyampaikan Tujuan Pembelajaran dan Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) sesuai Buku Panduan Guru PJOK SIBI.`,
          "Pemanasan Bermain (Warming-Up Game SIBI): Guru memimpin peregangan statis-dinamis dilanjutkan permainan pemanasan ceria yang mengarah pada otot-otot utama materi pembelajaran."
        ],
        inti: intiSteps,
        penutup: [
          "Pendinginan (Cooling Down - 10 Menit Standar SIBI): Peserta didik melakukan gerakan pendinginan dan peregangan otot diiringi pengaturan napas.",
          `Refleksi Guru & Peserta Didik (Format SIBI): Siswa mengisi/menyampaikan refleksi penguasaan materi ${material} (Kategori: Sangat Menguasai / Menguasai / Belum Menguasai) serta menceritakan nilai sportivitas yang dipelajari.`,
          "Tindak Lanjut & Doa: Guru memberikan apresiasi, menginformasikan materi unit berikutnya dari Buku PJOK SIBI, menutup dengan doa, dan mengarahkan siswa merapikan alat secara bergotong royong."
        ]
      },
      asesmen: {
        sikap: "Asesmen Sikap (Format Buku Panduan Guru PJOK SIBI): Observasi perilaku Pengembangan Karakter & Internalisasi Nilai-Nilai Gerak (kemandirian, kejujuran, kerja sama, dan sportivitas/fair play).",
        pengetahuan: `Asesmen Pengetahuan (Format SIBI): Tes tulis/lisan (Pilihan Ganda & Uraian) mengenai konsep dan prosedur tahapan gerak (Sikap Awal, Pelaksanaan, Sikap Akhir) pada materi ${material}.`,
        keterampilan: `Asesmen Keterampilan Proses & Produk Gerak (Format SIBI): Penilaian unjuk kerja praktik ${material} menggunakan rubrik 3 komponen Buku Panduan PJOK SIBI: (1) Sikap Awalan (Skor 1-3), (2) Sikap Pelaksanaan Gerak (Skor 1-4), dan (3) Sikap Akhir/Follow-Through (Skor 1-3), dikonversi ke skala 100.`
      },
      tipsGuru: `Pedoman Pembelajaran Alternatif & Pengayaan/Remedial (Buku Panduan Guru PJOK SIBI ${sibiBook.kelasLabel}): Jika sarana atau cuaca kurang mendukung, modifikasi aturan permainan, perkecil ukuran lapangan, dan gunakan alat modifikasi yang aman. Berikan remedial pendampingan bertahap bagi siswa yang belum mencapai KKTP.`
    };
  };

  try {
    const prompt = `
      Buatlah Modul Ajar (RPP) Kurikulum Merdeka Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK) tingkat Sekolah Dasar (SD/MI) yang SEPENUHNYA MENGACU pada Buku Panduan Guru PJOK resmi dari SIBI (Sistem Informasi Perbukuan Indonesia - Pusat Perbukuan BSKAP Kemendikbudristek):
      - Referensi Buku Utama: ${sibiBook.bookTitle} (Penulis: ${sibiBook.authors}, ISBN: ${sibiBook.isbn}, Penerbit: ${sibiBook.publisher})
      - Kelas & Fase: ${sibiBook.kelasLabel} (${sibiBook.fase})
      - Materi / Unit Pembelajaran: ${material}
      - Alokasi Waktu: ${duration}
      - Model Pembelajaran: ${teachingModel}

      Wajib menyertakan:
      1. Tujuan Pembelajaran yang memetakan Elemen CP PJOK SIBI (Keterampilan Gerak, Pengetahuan Gerak, Pemanfaatan Gerak, dan Pengembangan Karakter/Nilai Gerak).
      2. Sarana & Prasarana yang mencantumkan Buku Panduan Guru PJOK SIBI Kemendikbudristek serta alat modifikasi ramah anak.
      3. Kegiatan Pendahuluan (15 menit dengan pemanasan permainan/warming-up game), Kegiatan Inti (45 menit yang terbagi menjadi Aktivitas Pembelajaran 1, Aktivitas Pembelajaran 2, Aktivitas Pembelajaran 3 Permainan Peraturan Dimodifikasi, serta Pembelajaran Alternatif sesuai standar SIBI), dan Kegiatan Penutup (10 menit dengan pendinginan dan Refleksi kategori Sangat Menguasai/Menguasai/Belum Menguasai).
      4. Asesmen Sikap, Pengetahuan, dan Keterampilan Proses Gerak (Sikap Awalan, Sikap Pelaksanaan, Sikap Akhir) sesuai rubrik Buku Panduan Guru PJOK SIBI.

      Harap berikan respons dalam format JSON terstruktur Bahasa Indonesia yang formal, ramah guru, dan siap cetak.
    `;

    const systemInstruction = `
      Anda adalah tim penyusun Buku Panduan Guru Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK) di Pusat Perbukuan BSKAP Kemendikbudristek (Sistem Informasi Perbukuan Indonesia / SIBI).
      Tugas Anda adalah membuat Modul Ajar (RPP) PJOK Kurikulum Merdeka yang 100% sesuai dengan struktur, terminologi, 4 elemen Capaian Pembelajaran, pentahapan Aktivitas Pembelajaran 1-2-3, Pembelajaran Alternatif, dan Asesmen Proses Gerak pada Buku Panduan Guru PJOK SIBI Kemendikbudristek.
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
