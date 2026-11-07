import { Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { generateContentWithFallback, extractJson } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const {
      version, // "v1" | "v2"
      mapel,
      jenjang,
      kelas,
      fase,
      sintaks,
      topik,
      tujuan,
      dimensi,
      kegiatanInti,
      pertemuanKe
    } = await req.json();

    // Basic Input Validations
    if (version === "v1") {
      if (!topik || !tujuan) {
        return NextResponse.json(
          { error: "Topik Pembelajaran dan Tujuan Pembelajaran wajib diisi." },
          { status: 400 }
        );
      }
    } else {
      if (!kegiatanInti) {
        return NextResponse.json(
          { error: "Kegiatan Inti Perencanaan Pembelajaran wajib diisi." },
          { status: 400 }
        );
      }
    }

    const systemInstruction = `
      Anda adalah seorang Guru dan ahli perancang kurikulum pembelajaran profesional.
      Tugas Anda adalah membuat Lembar Kerja Peserta Didik (LKPD) yang lengkap, bermakna, berkesadaran (mindful), aktif, dan menggembirakan sesuai Kurikulum Merdeka.
      
      LKPD harus muncul SECARA UTUH dan lengkap dengan isi materi riil, teks bacaan riil, pertanyaan riil, tugas riil, bukan sekadar template atau kerangka kosong. Gunakan bahasa Indonesia yang komunikatif, sesuai jenjang kelas siswa, dan ramah anak.
      
      Aturan Penting Integrasi & Format:
      1. Sesuai instruksi pengguna, bagian "Sintaks Pembelajaran" dan "Pengalaman Belajar Mendalam" (Memahami, Mengaplikasikan, Merefleksikan) harus diintegrasikan secara terpadu menjadi satu kesatuan alur kegiatan terstruktur dan TIDAK boleh menggunakan format tabel untuk bagian alur kegiatan ini.
      2. Bagian Memahami harus berisi teks materi/bacaan ringkas atau deskripsi ilustrasi konkret diikuti minimal 3 pertanyaan pemahaman yang berbobot.
      3. Bagian Mengaplikasikan harus berisi satu kasus nyata kehidupan sehari-hari siswa diikuti instruksi kerja yang jelas serta panduan ruang jawaban.
      4. Bagian Merefleksikan harus berisi 2-3 pertanyaan refleksi terbuka yang mendalam untuk meninjau proses belajar siswa.
      5. Output harus berupa JSON valid sesuai skema yang disediakan.
    `;

    let userPrompt = "";

    if (version === "v1") {
      userPrompt = `
        Buat LKPD Versi 1 dengan spesifikasi berikut:
        - Mata Pelajaran: ${mapel || "PJOK"}
        - Jenjang & Kelas: ${jenjang || "SD"} - ${kelas || "Kelas 5"} (Fase ${fase || "C"})
        - Topik Pembelajaran: ${topik}
        - Tujuan Pembelajaran: ${tujuan}
        - Sintaks Model & Metode Pembelajaran: ${sintaks || "Problem Based Learning (PBL)"}
        - Dimensi Profil Lulusan / Profil Pelajar Pancasila: ${dimensi || "Gotong Royong, Bernalar Kritis, Mandiri"}

        Susun LKPD dengan isi lengkap:
        - Identitas LKPD
        - Petunjuk Penggunaan (alat yang dibutuhkan, langkah kerja)
        - Integrasi Sintaks & Pengalaman Belajar Mendalam (Memahami, Mengaplikasikan, Merefleksikan) dalam bentuk narasi/langkah mengalir berurutan (bukan tabel).
        - Penutup dengan ucapan penyemangat, catatan guru (ruang kosong), dan checklist evaluasi diri siswa.
      `;
    } else {
      userPrompt = `
        Buat LKPD Versi 2 berdasarkan Kegiatan Inti RPP berikut:
        - Mata Pelajaran: ${mapel || "PJOK"}
        - Kelas: ${kelas || "Kelas 5"}
        - Kegiatan Inti RPP: ${kegiatanInti}
        - Pertemuan Ke: ${pertemuanKe || "1"}

        Susun LKPD dengan isi lengkap:
        - Identitas LKPD
        - Petunjuk Penggunaan (alat yang dibutuhkan, langkah kerja)
        - Integrasi Sintaks & Pengalaman Belajar Mendalam (Memahami dengan teks bacaan penunjang RPP, Mengaplikasikan dengan tugas kehidupan nyata, Merefleksikan dengan pertanyaan evaluasi) dalam langkah narasi mengalir terpadu (bukan tabel).
        - Penutup dengan ucapan penyemangat, catatan guru (ruang kosong), dan checklist evaluasi diri siswa.
      `;
    }

    const fallbackGenerator = () => {
      const topicName = topik || "Kebugaran Jasmani dan Pola Gerak Dasar";
      const kelasText = `${kelas || "Kelas 5"} (${fase ? "Fase " + fase : "Fase C"}) ${jenjang || "SD"}`;
      const mapelName = mapel || "Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)";

      return {
        judulLKPD: `LKPD Eksplorasi Gerak: ${topicName}`,
        metaMataPelajaran: mapelName,
        metaKelasFase: kelasText,
        tujuanPembelajaranRingkas: `Melalui LKPD ini, kalian diajak memahami prinsip dasar gerak ${topicName}, mempraktikkannya bersama rekan sekelas secara sportif, serta merefleksikan manfaatnya bagi kesehatan dan kebugaran tubuh.`,
        petunjuk: [
          "Tuliskan identitas diri dan kelompokmu pada lembar LKPD.",
          "Bacalah rangkuman konsep dan deskripsi gerak dengan cermat.",
          "Praktikkan latihan aktivitas gerak dengan mengutamakan keselamatan dan kerja sama.",
          "Kerjakan soal pemahaman, lembar tugas aplikasi, dan lembar refleksi dengan jujur."
        ],
        alatBahan: [
          "Pakaian dan sepatu olahraga lengkap",
          "Alat tulis",
          `Sarana pendukung materi ${topicName} (kun, bola, atau matras)`,
          "Stopwatch / peluit guru"
        ],
        alurKegiatan: [
          {
            noLangkah: 1,
            namaLangkah: "Langkah 1: Mengamati Permasalahan & Memahami Konsep (Memahami)",
            tipeFokus: "Memahami",
            deskripsiAktivitas: `Amatilah peragaan atau contoh gerak ${topicName} yang didemonstrasikan. Analisis bagian tubuh mana yang menjadi tumpuan utama dan bagaimana menjaga keseimbangan saat bergerak.`,
            kontenMediaBahan: `Aktivitas ${topicName} melatih kelincahan, kekuatan otot, dan koordinasi motorik. Saat melakukan gerak ini, pastikan posisi tubuh rileks, pandangan tertuju ke depan, dan pernapasan tetap teratur.`,
            pertanyaanAtauTugas: [
              `Mengapa koordinasi tubuh sangat penting saat melakukan ${topicName}?`,
              "Apa perbedaan antara gerakan yang dilakukan secara benar dengan gerakan yang berisiko cedera?",
              "Sebutkan 2 otot utama yang bekerja aktif selama latihan ini!"
            ],
            instruksiPengerjaan: "Diskusikan dengan teman kelompokmu dan tuliskan jawaban hasil analisismu pada ruang yang disediakan."
          },
          {
            noLangkah: 2,
            namaLangkah: "Langkah 2: Eksplorasi Gerak & Pemecahan Masalah (Mengaplikasikan)",
            tipeFokus: "Mengaplikasikan",
            deskripsiAktivitas: `Lakukan rangkaian praktik gerak ${topicName} dalam permainan simulasi kecil secara bergantian bersama pasangan/kelompokmu.`,
            kontenMediaBahan: "Tantangan Nyata: Bagaimana kelompokmu mengatur strategi agar setiap anggota dapat menyelesaikan tantangan gerak dengan tepat waktu dan tanpa melakukan pelanggaran aturan?",
            pertanyaanAtauTugas: [
              `Praktikkan 3 variasi kombinasi gerak ${topicName} bersama kelompokmu!`,
              "Catat catatan keberhasilan setiap anggota kelompok dalam tabel pencapaian gerak.",
              "Rancang satu variasi permainan sederhana yang memanfaatkan keterampilan gerak tersebut!"
            ],
            instruksiPengerjaan: "Catat skor dan deskripsikan strategi kelompokmu dalam lembar kerja aplikasi gerak."
          },
          {
            noLangkah: 3,
            namaLangkah: "Langkah 3: Refleksi dan Evaluasi Pembelajaran (Merefleksikan)",
            tipeFokus: "Merefleksikan",
            deskripsiAktivitas: "Lakukan pendinginan bersama, kemudian renungkan apa yang telah kamu pelajari dan rasakan selama pembelajaran olahraga hari ini.",
            kontenMediaBahan: "Refleksi mendalam membantu kita menghargai tubuh yang sehat, menumbuhkan jiwa sportivitas, dan membiasakan pola hidup aktif setiap hari.",
            pertanyaanAtauTugas: [
              "Apa hal paling menyenangkan dan hal yang paling menantang bagimu pada latihan hari ini?",
              "Bagaimana sikap saling menghargai antarteman memengaruhi keberhasilan kelompokmu?",
              "Bagaimana kamu akan menerapkan kebiasaan aktif bergerak ini dalam kegiatan sehari-hari di rumah?"
            ],
            instruksiPengerjaan: "Tuliskan refleksi pribadimu secara jujur dan mendalam."
          }
        ],
        penutup: {
          ucapanSemangat: "Hebat! Kamu telah menunjukkan semangat pantang menyerah, sportivitas tinggi, dan kerja sama tim yang solid!",
          catatanGuruTemplate: "Keterampilan gerak berkembang sangat baik. Tetap disiplin menjaga kebugaran jasmani dan keselamatan.",
          checklistMandiri: [
            "Saya memahami konsep dan teknik dasar gerakan dengan baik.",
            "Saya mampu melakukan gerakan secara mandiri dan percaya diri.",
            "Saya aktif bekerja sama dan saling mendukung dalam kelompok.",
            "Saya selalu mengutamakan sportivitas dan keselamatan dalam berolahraga."
          ]
        }
      };
    };

    const response = await generateContentWithFallback({
      contents: userPrompt,
      fallbackGenerator,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "judulLKPD",
            "metaMataPelajaran",
            "metaKelasFase",
            "petunjuk",
            "alatBahan",
            "tujuanPembelajaranRingkas",
            "alurKegiatan",
            "penutup"
          ],
          properties: {
            judulLKPD: {
              type: Type.STRING,
              description: "Judul LKPD yang menarik dan komunikatif untuk siswa."
            },
            metaMataPelajaran: {
              type: Type.STRING,
              description: "Nama Mata Pelajaran."
            },
            metaKelasFase: {
              type: Type.STRING,
              description: "Jenjang, Kelas, dan Fase."
            },
            tujuanPembelajaranRingkas: {
              type: Type.STRING,
              description: "Tujuan pembelajaran dikemas dalam kalimat ramah siswa."
            },
            petunjuk: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Langkah-langkah petunjuk penggunaan LKPD bagi siswa."
            },
            alatBahan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Daftar alat dan bahan yang diperlukan siswa untuk aktivitas."
            },
            alurKegiatan: {
              type: Type.ARRAY,
              description: "Integrasi terpadu sintaks & pengalaman belajar mendalam (Memahami, Mengaplikasikan, Merefleksikan) dalam bentuk daftar langkah-langkah naratif mengalir (bukan tabel).",
              items: {
                type: Type.OBJECT,
                required: ["noLangkah", "namaLangkah", "tipeFokus", "deskripsiAktivitas", "kontenMediaBahan", "pertanyaanAtauTugas", "instruksiPengerjaan"],
                properties: {
                  noLangkah: {
                    type: Type.INTEGER,
                    description: "Nomor urut langkah."
                  },
                  namaLangkah: {
                    type: Type.STRING,
                    description: "Nama langkah/fase sintaks terpadu (misal: 'Langkah 1: Mengamati Permasalahan (Memahami)')"
                  },
                  tipeFokus: {
                    type: Type.STRING,
                    description: "Fokus bagian: 'Memahami' atau 'Mengaplikasikan' atau 'Merefleksikan' atau 'Sintaks'"
                  },
                  deskripsiAktivitas: {
                    type: Type.STRING,
                    description: "Panduan aktivitas yang harus dilakukan siswa."
                  },
                  kontenMediaBahan: {
                    type: Type.STRING,
                    description: "Teks materi ringkas, ilustrasi tertulis, atau bahan kasus yang dibaca siswa."
                  },
                  pertanyaanAtauTugas: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Daftar pertanyaan pemahaman (min 3 untuk Memahami), atau deskripsi tugas nyata (untuk Mengaplikasikan), atau pertanyaan refleksi (2-3 untuk Merefleksikan)."
                  },
                  instruksiPengerjaan: {
                    type: Type.STRING,
                    description: "Arahan bagaimana siswa harus menuliskan jawaban mereka di kolom pengerjaan."
                  }
                }
              }
            },
            penutup: {
              type: Type.OBJECT,
              required: ["ucapanSemangat", "catatanGuruTemplate", "checklistMandiri"],
              properties: {
                ucapanSemangat: {
                  type: Type.STRING,
                  description: "Kalimat motivasi penutup yang menggembirakan."
                },
                catatanGuruTemplate: {
                  type: Type.STRING,
                  description: "Template arahan umpan balik dari guru (misal: 'Sangat baik dalam kerja sama, tingkatkan keaktifan individu')."
                },
                checklistMandiri: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "3-4 pernyataan evaluasi diri sederhana (misal: 'Saya memahami perbedaan gerak lokomotor dan non-lokomotor')."
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
    console.error("Gemini LKPD Generator Error:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan internal saat merancang LKPD." },
      { status: 500 }
    );
  }
}
