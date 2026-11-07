import { Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { generateContentWithFallback, extractJson } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const {
      promptType, // "notebook" | "canva"
      namaGuru,
      mapel,
      kelas,
      namaSekolah,
      tujuanPembelajaran,
      pertanyaanPemantik,
      materiPokok
    } = await req.json();

    if (!tujuanPembelajaran) {
      return NextResponse.json(
        { error: "Tujuan pembelajaran wajib diisi." },
        { status: 400 }
      );
    }

    const systemInstruction = `
      Anda adalah seorang ahli desain presentasi profesional, spesialis slide pembelajaran interaktif, dan pendidik kreatif.
      Tugas Anda adalah merancang outline slide presentasi edukatif yang sangat menarik, sistematis, mudah dipahami siswa, dan siap pakai.
      
      Ketentuan Gaya & Struktur Slide:
      1. Rancang slide yang clean, modern, komunikatif, dan terstruktur rapi.
      2. Setiap slide harus memiliki: No Slide, Judul Slide, Isi Materi Slide (ringkas, poin-poin/bullet, tidak boleh paragraf panjang), Ide Visual Pendukung (saran ikon, ilustrasi, warna, diagram, gambar), dan Catatan Penyampaian Guru.
      3. Format output berupa JSON terstruktur dalam Bahasa Indonesia yang indah.
    `;

    let userPrompt = "";

    if (promptType === "notebook") {
      userPrompt = `
        Gunakan gaya desain NotebookLM (Warna slide dominan hijau muda kombinasi kuning cerah, segar, modern, edukatif).
        Informasi Guru: ${namaGuru || "GURU GEN Z - SMP BAHAGIA"}
        Tujuan Pembelajaran: ${tujuanPembelajaran}
        Pertanyaan Pemantik: ${pertanyaanPemantik || "Bagaimana hal ini terjadi di sekitar kita?"}
        Materi Tambahan / Silabus: ${materiPokok || "Sesuai kurikulum merdeka"}

        Buatkan struktur slide berikut:
        1. Slide Pembuka (Judul materi, nama Guru, Nama Sekolah)
        2. Tujuan Pembelajaran (tujuan di atas dikemas komunikatif)
        3. Apersepsi / Pengantar (Pertanyaan pemantik interaktif)
        4. Peta Konsep Materi
        5. Penjelasan Inti (Bagi menjadi 3-5 slide konsep yang terstruktur berdasarkan tujuan pembelajaran)
        6. Latihan / Aktivitas Interaktif (Instruksi menyimak di LKPD atau kuis mini)
        7. Refleksi / Kesimpulan (Tanyakan 2-3 pertanyaan kritis penilaian diri)
        8. Penutup (Pesan motivasi penutup)

        Kembalikan dalam struktur JSON yang sesuai skema.
      `;
    } else {
      userPrompt = `
        Gunakan gaya desain Canva / PowerPoint (Modern, Clean, Infografis, Profesional, Warna dinamis sesuai materi).
        Nama Guru: ${namaGuru || "Pendidik Kreatif"}
        Mata Pelajaran: ${mapel || "PJOK / Umum"}
        Kelas: ${kelas || "Kelas 5"}
        Nama Sekolah: ${namaSekolah || "SD Negeri Pintar"}
        Tujuan Pembelajaran: ${tujuanPembelajaran}
        Materi Tambahan / Silabus: ${materiPokok || "Sesuai kurikulum merdeka"}

        Buatkan PowerPoint pembelajaran interaktif yang terdiri dari slide dengan struktur berikut:
        1. Slide Judul: Judul materi, nama guru, sekolah, mata pelajaran.
        2. Slide Pemantik: Pertanyaan/situasi sehari-hari yang memancing rasa ingin tahu siswa.
        3. Slide Tujuan Pembelajaran: Poin-poin komunikatif.
        4. Slide Materi Lengkap: Penjelasan konsep inti terbagi menjadi 4-6 slide materi yang padat, komunikatif, disertai ide ilustrasi visual/grafik.
        5. Slide Refleksi: 2-3 pertanyaan refleksi terbuka untuk murid (misal: "Apa hal baru?", "Bagaimana menerapkan?").
        6. Slide Kesimpulan: Rangkuman ringkas poin penting dalam bullet points.
        7. Slide Penutup: Pesan motivasi, ucapan terima kasih, dan ajakan belajar.

        Kembalikan dalam struktur JSON yang sesuai skema.
      `;
    }

    const fallbackGenerator = () => ({
      judulPresentasi: `Presentasi Interaktif: ${materiPokok || mapel || "Pembelajaran Aktif"}`,
      temaDesain: promptType === "notebook"
        ? "Gaya NotebookLM: Palet Hijau Muda Mint & Aksen Kuning Cerah, Font Sans-Serif Bersih, Kartun Edukatif 3D."
        : "Gaya Canva/Modern Minimalist: Palet Biru Laut & Oranye Enerjik, Tata Letak Infografis Rapi & Elegan.",
      slides: [
        {
          no: 1,
          judulSlide: "Selamat Datang di Kelas Berpikir & Bergerak Aktif!",
          kontenSlide: [
            `Mata Pelajaran: ${mapel || "Pendidikan Jasmani & Olahraga"}`,
            `Kelas: ${kelas || "Kelas 5 / Fase C"}`,
            `Pengajar: ${namaGuru || "Bapak/Ibu Guru"}`,
            `Sekolah: ${namaSekolah || "Sekolah Dasar Unggulan"}`
          ],
          ideVisual: "Latar belakang gradasi lembut dengan ilustrasi karakter guru dan murid 3D ceria melambaikan tangan di ruang kelas modern.",
          catatanGuru: "Sambut siswa dengan senyum hangat dan ajak mereka duduk siap belajar dengan penuh semangat."
        },
        {
          no: 2,
          judulSlide: "Tujuan Pembelajaran Kita Hari Ini",
          kontenSlide: [
            tujuanPembelajaran,
            "Mempraktikkan gerak dan keterampilan secara sportif dan percaya diri.",
            "Mengembangkan sikap gotong royong dan bernalar kritis bersama teman sekelas."
          ],
          ideVisual: "Ikon target panahan 3D dan checklist emas di samping kotak teks berbingkai lembut.",
          catatanGuru: "Jelaskan manfaat praktis materi ini dalam kehidupan sehari-hari agar siswa termotivasi."
        },
        {
          no: 3,
          judulSlide: "Mari Berpikir: Pertanyaan Pemantik",
          kontenSlide: [
            pertanyaanPemantik || "Mengapa kita perlu melakukan pemanasan sebelum beraktivitas fisik?",
            "Apa yang dirasakan tubuh kita saat bergerak aktif dibandingkan saat duduk diam?",
            "Bagaimana kerja sama tim dapat menentukan kemenangan sebuah kelompok?"
          ],
          ideVisual: "Ilustrasi 3D lampu ide menyala terang dengan tanda tanya interaktif di sekelilingnya.",
          catatanGuru: "Beri kesempatan 2-3 siswa untuk menyampaikan pendapat awal mereka secara spontan."
        },
        {
          no: 4,
          judulSlide: "Konsep Inti: Langkah & Prinsip Gerak",
          kontenSlide: [
            "Tahap Awalan: Posisi seimbang dan rileks dengan tumpuan kaki kuat.",
            "Tahap Pelaksanaan: Koordinasi anggota gerak dengan ritme pernapasan teratur.",
            "Tahap Akhir: Menjaga stabilitas tubuh dan melakukan pendinginan bertahap."
          ],
          ideVisual: "Diagram alur 3 langkah berurutan dengan nomor 1-2-3 dalam lingkaran berwarna kontras.",
          catatanGuru: "Demonstrasikan masing-masing tahap atau tunjukkan video peragaan singkat kepada siswa."
        },
        {
          no: 5,
          judulSlide: "Aktivitas Praktik & Kolaborasi",
          kontenSlide: [
            "Bentuk kelompok kecil beranggotakan 4-5 siswa.",
            "Buka LKPD pada bagian tantangan aplikasi gerak.",
            "Lakukan simulasi dan catat hasil observasi bersama teman kelompok."
          ],
          ideVisual: "Ikon kerja sama tim, stopwatch digital, dan karakter 3D sedang berdiskusi seru.",
          catatanGuru: "Kelilingi kelompok untuk membimbing, memberikan umpan balik, dan memastikan keamanan latihan."
        },
        {
          no: 6,
          judulSlide: "Refleksi Diri & Kesimpulan",
          kontenSlide: [
            "Apa pemahaman baru paling berharga yang kalian dapatkan hari ini?",
            "Keterampilan apa yang perlu terus kita latih di rumah?",
            "Kesimpulan: Kebiasaan bergerak aktif menjaga raga tetap bugar dan pikiran selalu tajam!"
          ],
          ideVisual: "Ilustrasi cermin refleksi dengan mahkota bintang prestasi dan hati bertuliskan 'Tubuh Sehat'.",
          catatanGuru: "Ajak siswa mengambil napas dalam-dalam saat pendinginan dan mengapresiasi usaha seluruh kelas."
        }
      ]
    });

    const response = await generateContentWithFallback({
      contents: userPrompt,
      fallbackGenerator,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["judulPresentasi", "temaDesain", "slides"],
          properties: {
            judulPresentasi: {
              type: Type.STRING,
              description: "Judul utama presentasi pembelajaran."
            },
            temaDesain: {
              type: Type.STRING,
              description: "Rangkuman palet warna (misal: hijau muda & kuning untuk NotebookLM) dan mood visual."
            },
            slides: {
              type: Type.ARRAY,
              description: "Daftar slide presentasi yang tersusun secara teratur dan kronologis.",
              items: {
                type: Type.OBJECT,
                required: ["no", "judulSlide", "kontenSlide", "ideVisual", "catatanGuru"],
                properties: {
                  no: {
                    type: Type.INTEGER,
                    description: "Nomor urut slide."
                  },
                  judulSlide: {
                    type: Type.STRING,
                    description: "Judul slide yang menarik dan ringkas."
                  },
                  kontenSlide: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Poin-poin isi materi slide (pendek, padat, berupa bullet points)."
                  },
                  ideVisual: {
                    type: Type.STRING,
                    description: "Saran visual seperti tata letak, warna background, ilustrasi 3D, diagram, gambar, atau ikon yang direkomendasikan."
                  },
                  catatanGuru: {
                    type: Type.STRING,
                    description: "Panduan atau skrip narasi penyampaian guru di kelas saat menampilkan slide ini."
                  }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      return NextResponse.json(fallbackGenerator());
    }

    const parsedData = extractJson(text) || fallbackGenerator();
    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Gemini Presentation Slides Generator Error:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan internal saat merancang slide presentasi." },
      { status: 500 }
    );
  }
}

