import { Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { generateContentWithFallback, extractJson } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const {
      mapel = "Pendidikan Jasmani, Olahraga, dan Kesehatan",
      kelas = "Kelas IV",
      fase = "Fase B",
      jenisAsesmen = "Asesmen Sumatif Akhir Semester (SAS)",
      jumlahSoal = 5,
      tujuanPembelajaran = "",
      ruangLingkup = ""
    } = await req.json();

    if (!tujuanPembelajaran || !String(tujuanPembelajaran).trim()) {
      return NextResponse.json(
        { error: "Tujuan Pembelajaran yang diujikan wajib diisi." },
        { status: 400 }
      );
    }

    const numQuestions = Math.min(Math.max(Number(jumlahSoal) || 5, 2), 15);

    const exactUserPrompt = `Anda adalah Guru mata pelajaran ${mapel} kelas ${kelas} fase ${fase} yang sedang menyusun soal Praktik. Buatkan ${jenisAsesmen} berdasarkan semua tujuan pembelajaran:
${tujuanPembelajaran}

Asesmen sumatif digunakan untuk mengukur ketercapaian kompetensi peserta didik secara menyeluruh pada akhir periode pembelajaran.
Buatkan juga kisi-kisi Soal Praktik yang berfungsi untuk memetakan ketercapaian semua tujuan pembelajaran tersebut. Kisi-kisi harus ditampilkan dalam bentuk tabel dengan format berikut:
| No | Tujuan Pembelajaran | Ruang Lingkup Materi | Level Kognitif (Taksonomi Bloom) | Indikator Soal | Bentuk Soal | Nomor Soal | Naskah Soal | Kunci Jawaban | Skor |

Kisi-kisi soal dibuat detail tiap nomor soal (buatkan sebanyak ${numQuestions} nomor soal praktik dengan total keseluruhan Skor = 100), dilengkapi dengan Format Penilaian & Rubrik Unjuk Kerja Praktik.${ruangLingkup ? `\nRuang Lingkup Materi Tambahan: ${ruangLingkup}` : ""}`;

    const systemInstruction = `
      Anda adalah Guru Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK) profesional ahli penyusunan instrumen Asesmen Sumatif Praktik Kurikulum Merdeka.
      Tugas Anda adalah menyusun:
      1) Tabel Kisi-Kisi & Naskah Soal Praktik secara detail untuk setiap nomor soal (10 kolom: No, Tujuan Pembelajaran, Ruang Lingkup Materi, Level Kognitif (Taksonomi Bloom), Indikator Soal, Bentuk Soal, Nomor Soal, Naskah Soal, Kunci Jawaban, Skor).
      2) Format Penilaian & Rubrik Unjuk Kerja tiap nomor soal yang merinci bobot skor Sikap Awal/Persiapan, Sikap Pelaksanaan/Teknik Inti, dan Sikap Akhir/Follow-Through sehingga jumlahnya sesuai dengan Skor maksimal soal tersebut.
      Output wajib berupa JSON valid sesuai skema.
    `;

    const fallbackGenerator = () => {
      const rawTpLines = String(tujuanPembelajaran)
        .split(/\n+/)
        .map((line) => line.replace(/^[\d\-\*\.\)\s]+/, "").trim())
        .filter(Boolean);

      const defaultTps =
        rawTpLines.length > 0
          ? rawTpLines
          : [
              "Mempraktikkan variasi dan kombinasi pola gerak dasar lokomotor, non-lokomotor, dan manipulatif dalam permainan bola kecil dan bola besar.",
              "Mempraktikkan variasi gerak dasar atletik jalan cepat, lari, lompat, dan lempar melalui permainan sederhana dan tradisional.",
              "Mempraktikkan pola gerak dominan senam lantai (keseimbangan, tumpuan, putaran, dan pendaratan) secara aman.",
              "Mempraktikkan latihan aktivitas kebugaran jasmani terkait kesehatan dan keterampilan (kekuatan, daya tahan, kelincahan, dan kelenturan)."
            ];

      const baseScore = Math.floor(100 / numQuestions);
      const remainder = 100 - baseScore * numQuestions;

      const templateBank = [
        {
          materi: "Permainan Invasi / Bola Besar & Bola Kecil (Gerak Manipulatif & Lokomotor)",
          level: "C3 - Menerapkan (Aplikasi) & P3 - Presisi Gerak",
          bentuk: "Unjuk Kerja (Praktik Berpasangan)",
          indikatorPrefix: "Disajikan lintasan berjarak 4-5 meter di lapangan, peserta didik mampu mempraktikkan kombinasi gerak",
          naskahTemplate: (tp: string) =>
            `Lakukan praktik kombinasi gerak dasar sesuai kompetensi "${tp}" secara berpasangan pada jarak 5 meter selama 60 detik! Lakukan minimal 10 kali pengulangan lempar-tangkap / operan bola dengan kontrol yang akurat tanpa menjatuhkan bola.`,
          kunciJawaban:
            "1) Sikap Awal (25%): Berdiri menghadap pasangan, kedua kaki dibuka selebar bahu, lutut sedikit ditekuk, pandangan fokus ke arah sasaran/bola.\n2) Pelaksanaan Gerak (50%): Mengayunkan lengan/kaki dengan koordinasi mata-tangan/kaki yang tepat, tenaga terukur, bola mengarah tepat ke pasangan minimal 8-10 kali sukses.\n3) Sikap Akhir (25%): Menjaga keseimbangan tubuh (follow through) dan kembali ke posisi siap secara sportif.",
          sikapAwalDesc: "Posisi berdiri menghadap pasangan, kaki tumpu mantap, pandangan fokus pada arah bola",
          pelaksanaanDesc: "Koordinasi ayunan lengan/kaki dan akurasi lemparan/tangkapan/operan (min. 8 dari 10 berhasil)",
          sikapAkhirDesc: "Gerak lanjutan (follow through) seimbang dan sikap kerja sama/sportif"
        },
        {
          materi: "Aktivitas Gerak Dasar Atletik (Lari Cepat, Tolakan, & Kombinasi Lompat)",
          level: "C3 - Menerapkan (Aplikasi) & P3 - Presisi Gerak",
          bentuk: "Unjuk Kerja (Praktik Individu)",
          indikatorPrefix: "Disediakan lintasan lari sepanjang 20-30 meter dengan rintangan cone, peserta didik mampu mendemonstrasikan",
          naskahTemplate: (tp: string) =>
            `Praktikkan rangkaian gerak atletik lari cepat (sprint) menempuh jarak 25 meter melewati 4 rintangan cone zig-zag yang dilanjutkan dengan tolakan satu kaki terkuat dan mendarat menggunakan kedua kaki di area matras/bak pasir seimbang!`,
          kunciJawaban:
            "1) Sikap Start & Awalan (25%): Posisi badan condong ke depan, kaki tumpu berada di belakang garis start, pandangan lurus ke lintasan.\n2) Teknik Lari & Tolakan (50%): Ayunan lengan seirama langkah kaki, berlari pada ujung telapak kaki secara lincah melewati cone tanpa menyentuh rintangan, menolak kuat dengan satu kaki.\n3) Pendaratan (25%): Mendarat menggunakan kedua kaki secara bersamaan dengan kedua lutut mengeper (ditekuk) dan tangan ke depan menjaga keseimbangan.",
          sikapAwalDesc: "Sikap start berdiri/jongkok di belakang garis, badan condong ke depan, konsentrasi penuh",
          pelaksanaanDesc: "Kecepatan lari zig-zag melewati cone dan ketepatan tolakan satu kaki terkuat pada papan tumpu",
          sikapAkhirDesc: "Pendaratan menggunakan kedua kaki bersamaan dengan lutut mengeper tanpa jatuh ke belakang"
        },
        {
          materi: "Aktivitas Senam Lantai (Keseimbangan, Tumpuan, dan Berguling)",
          level: "C4 - Menganalisis & P4 - Artikulasi (Rangkaian Gerak)",
          bentuk: "Unjuk Kerja (Rangkaian Gerak di Matras)",
          indikatorPrefix: "Disajikan matras senam lantai, peserta didik mampu merangkaikan kombinasi gerak keseimbangan dan gerak dominan",
          naskahTemplate: (tp: string) =>
            `Lakukan rangkaian 3 gerak dominan senam lantai di atas matras secara berkesinambungan: (1) Sikap keseimbangan pesawat terbang selama 5 detik, (2) Gerak berguling ke depan (forward roll) dengan tumpuan tengkuk yang aman, dan (3) Sikap berdiri tegak dengan rentangan kedua tangan!`,
          kunciJawaban:
            "1) Keseimbangan Statis (25%): Mengangkat satu kaki lurus ke belakang, badan dan rentangan tangan sejajar lantai bertahan stabil 5 detik tanpa goyah.\n2) Teknik Guling Depan (50%): Kedua tangan menumpu selebar bahu di matras, dagu dirapatkan ke dada, perkenaan matras pada tengkuk (bukan ubun-ubun kepala), punggung membulat saat mengguling.\n3) Sikap Akhir & Keselamatan (25%): Mendarat dengan kedua kaki rapat, bangkit berdiri tanpa bantuan tangan di samping matras, dan menghormat kepada penguji.",
          sikapAwalDesc: "Sikap berdiri tegak di tepi matras dan keseimbangan pesawat terbang stabil 5 hitungan",
          pelaksanaanDesc: "Tumpuan kedua tangan selebar bahu, dagu rapat ke dada, tengkuk menyentuh matras dan berguling bulat",
          sikapAkhirDesc: "Berjongkok memeluk lutut lalu berdiri tegak seimbang tanpa bertumpu tangan di lantai"
        },
        {
          materi: "Aktivitas Kebugaran Jasmani (Kekuatan, Daya Tahan, & Kelincahan)",
          level: "C3 - Menerapkan (Aplikasi) & P3 - Presisi Gerak",
          bentuk: "Tes Praktik Sirkuit (Circuit Training)",
          indikatorPrefix: "Disediakan pos kebugaran jasmani di lapangan, peserta didik mampu mempraktikkan latihan fisik",
          naskahTemplate: (tp: string) =>
            `Lakukan tes praktik kebugaran jasmani sistem sirkuit 2 pos secara berurutan dengan durasi masing-masing pos 30 detik: Pos 1 (Shuttle Run / Lari Bolak-Balik 4x5 meter) dan Pos 2 (Sit-Up / Baring Duduk) dengan teknik gerak yang benar!`,
          kunciJawaban:
            "1) Persiapan & Pemanasan Pos (25%): Mengambil posisi siap di garis start Pos 1 dan posisi baring lutut ditekuk di Pos 2.\n2) Pelaksanaan Pos 1 & Pos 2 (50%): Berlari bolak-balik cepat menyentuh garis batas (< 9,5 detik) dan melakukan sit-up terkontrol minimal 15 repetisi dalam 30 detik.\n3) Daya Juang & Sikap Akhir (25%): Menyelesaikan seluruh pos hingga peluit akhir, mengatur napas, dan menjaga keselamatan.",
          sikapAwalDesc: "Kesiapan posisi tubuh pada tiap pos sirkuit dan kepatuhan pada aba-aba peluit",
          pelaksanaanDesc: "Kecepatan lari bolak-balik (Shuttle Run) dan jumlah repetisi Sit-Up yang sah dalam 30 detik",
          sikapAkhirDesc: "Ketahanan fisik menyelesaikan durasi penuh, sportivitas, dan pengaturan napas (cooling down)"
        },
        {
          materi: "Aktivitas Gerak Berirama & Budaya Hidup Sehat / P3K",
          level: "C4 - Menganalisis & P4 - Artikulasi Gerak",
          bentuk: "Unjuk Kerja & Simulasi Praktik",
          indikatorPrefix: "Disajikan irama hitungan 2x8 atau skenario kesehatan olahraga, peserta didik mampu mempraktikkan",
          naskahTemplate: (tp: string) =>
            `Praktikkan kombinasi langkah kaki (langkah biasa, langkah rapat, dan langkah keseimbangan) yang dipadukan dengan ayunan satu dan dua lengan mengikuti ketukan irama 2x8 hitungan secara serasi, dilanjutkan simulasi pendinginan (cooling down) yang benar!`,
          kunciJawaban:
            "1) Sikap Awal & Ketepatan Irama (25%): Berdiri tegak rileks, gerakan langkah kaki dan ayunan lengan selaras dengan ketukan hitungan 1 sampai 8.\n2) Keluwesan & Koordinasi Gerak (50%): Transisi antar pola langkah berjalan luwes, lutut mengeper rileks, koordinasi lengan dan kaki harmonis.\n3) Prosedur Pendinginan (25%): Melakukan peregangan statis dan pengaturan napas secara sistematis.",
          sikapAwalDesc: "Sikap awal berdiri tegak rileks dan ketepatan memulai gerakan sesuai ketukan pertama",
          pelaksanaanDesc: "Koordinasi langkah kaki dan ayunan lengan sesuai irama 2x8 hitungan secara luwes",
          sikapAkhirDesc: "Ketepatan gerakan penutup/pendinginan dan ekspresi percaya diri"
        }
      ];

      const kisiKisi = Array.from({ length: numQuestions }, (_, index) => {
        const tpItem = defaultTps[index % defaultTps.length];
        const tpl = templateBank[index % templateBank.length];
        const skorSoal = index === numQuestions - 1 ? baseScore + remainder : baseScore;

        const skorAwal = Math.round(skorSoal * 0.25);
        const skorAkhir = Math.round(skorSoal * 0.25);
        const skorInti = skorSoal - skorAwal - skorAkhir;

        return {
          no: index + 1,
          tujuanPembelajaran: tpItem,
          ruangLingkupMateri: ruangLingkup
            ? `${ruangLingkup} - Pos ${index + 1}`
            : tpl.materi,
          levelKognitif: tpl.level,
          indikatorSoal: `${tpl.indikatorPrefix} sesuai tujuan pembelajaran "${tpItem}" secara tepat, terkoordinasi, dan sportif.`,
          bentukSoal: tpl.bentuk,
          nomorSoal: String(index + 1),
          naskahSoal: tpl.naskahTemplate(tpItem),
          kunciJawaban: tpl.kunciJawaban,
          skor: skorSoal,
          rubrikDetail: {
            sikapAwal: tpl.sikapAwalDesc,
            skorAwal,
            pelaksanaan: tpl.pelaksanaanDesc,
            skorInti,
            sikapAkhir: tpl.sikapAkhirDesc,
            skorAkhir
          }
        };
      });

      return {
        judulAsesmen: `${jenisAsesmen.toUpperCase()} - UJIAN PRAKTIK PJOK`,
        mataPelajaran: mapel,
        kelas,
        fase,
        jenisAsesmen,
        petunjukPraktik: [
          "Peserta didik wajib mengenakan pakaian olahraga sekolah lengkap dan sepatu olahraga yang aman.",
          "Awali kegiatan asesmen praktik dengan berdoa dan melakukan pemanasan dinamis bersama yang dipimpin oleh guru.",
          "Simak instruksi tiap nomor soal praktik dan peragaan singkat dari guru sebelum giliran ujian dimulai.",
          "Lakukan setiap gerakan pada pos ujian dengan sungguh-sungguh, jujur, sportif, dan mengutamakan keselamatan diri serta teman.",
          "Setelah menyelesaikan seluruh pos ujian praktik, lakukan gerakan pendinginan (cooling down) dan melapor kepada guru penguji."
        ],
        alatDanSarana: [
          "Peluit Guru & Stopwatch Digital",
          "Cone / Kerucut Penanda Lintasan (10 buah)",
          "Bola Kasti / Bola Voli Mini / Bola Sepak sesuai pos materi",
          "Matras Senam Lantai (2 buah)",
          "Pita Ukur (Metlin) & Formulir Daftar Nilai Praktik"
        ],
        kisiKisi,
        pedomanPenskoran: "Nilai Akhir Praktik = (Total Skor Perolehan Siswa / Total Skor Maksimal) x 100. Kriteria Ketercapaian Tujuan Pembelajaran (KKTP): 88-100 = Sangat Baik (SB), 75-87 = Baik (B), 61-74 = Cukup (C), <= 60 = Perlu Bimbingan (PB).",
        promptYangDigunakan: exactUserPrompt
      };
    };

    const response = await generateContentWithFallback({
      contents: exactUserPrompt,
      fallbackGenerator,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "judulAsesmen",
            "mataPelajaran",
            "kelas",
            "fase",
            "jenisAsesmen",
            "petunjukPraktik",
            "alatDanSarana",
            "kisiKisi",
            "pedomanPenskoran"
          ],
          properties: {
            judulAsesmen: {
              type: Type.STRING,
              description: "Judul lengkap asesmen sumatif praktik PJOK."
            },
            mataPelajaran: {
              type: Type.STRING,
              description: "Nama mata pelajaran."
            },
            kelas: {
              type: Type.STRING,
              description: "Kelas peserta didik."
            },
            fase: {
              type: Type.STRING,
              description: "Fase Kurikulum Merdeka (Fase A / B / C)."
            },
            jenisAsesmen: {
              type: Type.STRING,
              description: "Jenis asesmen sumatif (Harian / Tengah Semester / Akhir Semester)."
            },
            petunjukPraktik: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Langkah-langkah petunjuk pelaksanaan asesmen praktik di lapangan."
            },
            alatDanSarana: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Daftar alat dan sarana olahraga yang dibutuhkan saat ujian praktik."
            },
            kisiKisi: {
              type: Type.ARRAY,
              description: "Tabel kisi-kisi soal praktik detail untuk tiap nomor soal.",
              items: {
                type: Type.OBJECT,
                required: [
                  "no",
                  "tujuanPembelajaran",
                  "ruangLingkupMateri",
                  "levelKognitif",
                  "indikatorSoal",
                  "bentukSoal",
                  "nomorSoal",
                  "naskahSoal",
                  "kunciJawaban",
                  "skor"
                ],
                properties: {
                  no: { type: Type.INTEGER, description: "Nomor urut baris kisi-kisi." },
                  tujuanPembelajaran: { type: Type.STRING, description: "Tujuan Pembelajaran yang diukur." },
                  ruangLingkupMateri: { type: Type.STRING, description: "Ruang Lingkup Materi PJOK." },
                  levelKognitif: { type: Type.STRING, description: "Level Kognitif (Taksonomi Bloom) & Psikomotorik." },
                  indikatorSoal: { type: Type.STRING, description: "Indikator soal praktik." },
                  bentukSoal: { type: Type.STRING, description: "Bentuk soal (misal: Praktik Unjuk Kerja)." },
                  nomorSoal: { type: Type.STRING, description: "Nomor soal praktik." },
                  naskahSoal: { type: Type.STRING, description: "Naskah instruksi soal praktik yang lengkap." },
                  kunciJawaban: { type: Type.STRING, description: "Kunci jawaban / rubrik kriteria gerak benar secara detail." },
                  skor: { type: Type.INTEGER, description: "Skor maksimal untuk nomor soal ini." },
                  rubrikDetail: {
                    type: Type.OBJECT,
                    required: ["sikapAwal", "skorAwal", "pelaksanaan", "skorInti", "sikapAkhir", "skorAkhir"],
                    properties: {
                      sikapAwal: { type: Type.STRING, description: "Indikator penilaian sikap awal/persiapan gerak." },
                      skorAwal: { type: Type.INTEGER, description: "Skor maksimal aspek sikap awal." },
                      pelaksanaan: { type: Type.STRING, description: "Indikator penilaian teknik pelaksanaan gerak inti." },
                      skorInti: { type: Type.INTEGER, description: "Skor maksimal aspek pelaksanaan gerak." },
                      sikapAkhir: { type: Type.STRING, description: "Indikator penilaian sikap akhir/follow-through & sportivitas." },
                      skorAkhir: { type: Type.INTEGER, description: "Skor maksimal aspek sikap akhir." }
                    }
                  }
                }
              }
            },
            pedomanPenskoran: {
              type: Type.STRING,
              description: "Rumus perhitungan nilai akhir dan rentang predikat ketercapaian."
            }
          }
        }
      }
    });

    const text = response.text;
    const parsedData = (text ? extractJson(text) : null) || fallbackGenerator();
    return NextResponse.json({
      ...parsedData,
      promptYangDigunakan: exactUserPrompt
    });
  } catch (error: any) {
    console.error("Gemini Soal Praktik Generator Error:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat menyusun Soal Praktik & Kisi-Kisi." },
      { status: 500 }
    );
  }
}
