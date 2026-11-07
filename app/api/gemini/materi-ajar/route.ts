import { Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { generateContentWithFallback, extractJson } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const {
      mapel,
      jenjang,
      kelas,
      fase,
      topik,
      tujuan,
      promptVersion,
      levelBloom,
      dimensiProfil
    } = await req.json();

    if (!topik || !tujuan) {
      return NextResponse.json(
        { error: "Topik dan Tujuan Pembelajaran wajib diisi." },
        { status: 400 }
      );
    }

    const systemInstruction = `
      Anda adalah seorang guru PJOK profesional dan penyusun Buku Panduan Guru & Buku Siswa PJOK di Sistem Informasi Perbukuan Indonesia (SIBI) Pusat Perbukuan BSKAP Kemendikbudristek.
      Tugas Anda adalah menyusun Bahan Ajar / Materi Ajar PJOK yang mengacu penuh pada Buku Panduan Guru PJOK SIBI (4 Elemen CP: Keterampilan Gerak, Pengetahuan Gerak, Pemanfaatan Gerak, Pengembangan Karakter/Nilai Gerak; serta tahapan Sikap Awalan, Sikap Pelaksanaan, Sikap Akhir, dan Permainan Peraturan Dimodifikasi).
      Anda harus menghasilkan dokumen materi ajar utuh dan menyertakan tabel ringkasan konsep/fakta/prosedur gerak yang sangat rapi dan menarik.
    `;

    let userPrompt = "";
    if (promptVersion === "versi1") {
      userPrompt = `
        Anda adalah seorang Guru ${mapel || "PJOK"}, ${jenjang || "SD"}, ${kelas || "Kelas 5"}, ${fase || "Fase C"} yang menggunakan acuan resmi Buku Panduan Guru PJOK dari SIBI (Sistem Informasi Perbukuan Indonesia - Kemendikbudristek).
        Buatkan materi ajar lengkap dengan topik "${topik}" dan mengacu pada tujuan pembelajaran "${tujuan}".
        Materi ajar harus sesuai dengan level kognitif "${levelBloom || "C3 - Menerapkan"}" dan mendukung pengembangan dimensi "${dimensiProfil || "Mandiri, Gotong Royong"}".

        Materi ajar harus ditulis secara utuh sesuai standar Buku PJOK SIBI, mencakup:
        1. Judul dan Tujuan Pembelajaran di bagian awal.
        2. Pendahuluan atau Apersepsi: paragraf pembuka yang menghubungkan materi dengan kehidupan nyata siswa serta pemanasan permainan (warming-up game).
        3. Isi Materi: jelaskan secara sistematis Fakta, Konsep, dan Prosedur Gerak (Sikap Awal, Sikap Pelaksanaan, Sikap Akhir) serta Aktivitas Pembelajaran 1, 2, dan 3 (Permainan Dimodifikasi) sesuai Buku Panduan PJOK SIBI.
        4. Tabel Ringkasan Materi: Buat tabel terstruktur yang memetakan No, Sub-Konsep, Fakta Penting, Prosedur/Langkah Kegiatan (Sikap Awal - Pelaksanaan - Akhir), dan Contoh Analogi Konkret.

        Format respon wajib berupa JSON dengan struktur berikut:
        {
          "judul": "Judul Materi Ajar yang menarik anak",
          "tujuanPembelajaran": "Deskripsi tujuan pembelajaran",
          "apersepsi": "Paragraf apersepsi atau cerita pembuka",
          "isiMateriUtama": "Teks penjelasan materi secara utuh, sistematis, komunikatif, dan terstruktur",
          "tabelMateri": [
            {
              "no": 1,
              "subKonsep": "Nama sub-konsep/bagian materi",
              "faktaPenting": "Fakta/prinsip penting",
              "prosedur": "Langkah atau cara melatih/melakukannya",
              "analogi": "Analogi konkret sehari-hari"
            }
          ],
          "kesimpulanDanAktivitas": "Rangkuman singkat serta tantangan aktivitas menyenangkan di rumah/sekolah"
        }
      `;
    } else {
      userPrompt = `
        Anda adalah seorang Guru ${mapel || "PJOK"}, ${jenjang || "SD"}, ${kelas || "Kelas 5"}, ${fase || "Fase C"} yang menggunakan acuan resmi Buku Panduan Guru PJOK dari SIBI (Sistem Informasi Perbukuan Indonesia - Kemendikbudristek).
        Buatkan materi ajar lengkap dengan topik "${topik}" dan mengacu pada tujuan pembelajaran "${tujuan}".

        Materi ajar harus ditulis secara utuh sesuai standar Buku PJOK SIBI, mencakup:
        1. Judul dan Tujuan Pembelajaran di bagian awal.
        2. Pendahuluan atau Apersepsi: paragraf pembuka yang menghubungkan materi dengan kehidupan nyata siswa.
        3. Isi Materi: jelaskan secara sistematis Fakta, Konsep, dan Prosedur Gerak (Sikap Awalan, Sikap Pelaksanaan, Sikap Akhir) serta Aktivitas Pembelajaran 1-3 sesuai Buku Panduan PJOK SIBI.
        4. Tabel Ringkasan Materi: Buat tabel terstruktur yang memetakan No, Sub-Konsep, Fakta Penting, Prosedur/Langkah Kegiatan, dan Contoh Analogi Konkret.

        Format respon wajib berupa JSON dengan struktur berikut:
        {
          "judul": "Judul Materi Ajar yang menarik anak",
          "tujuanPembelajaran": "Deskripsi tujuan pembelajaran",
          "apersepsi": "Paragraf apersepsi atau cerita pembuka",
          "isiMateriUtama": "Teks penjelasan materi secara utuh, sistematis, komunikatif, dan terstruktur",
          "tabelMateri": [
            {
              "no": 1,
              "subKonsep": "Nama sub-konsep/bagian materi",
              "faktaPenting": "Fakta/prinsip penting",
              "prosedur": "Langkah atau cara melatih/melakukannya",
              "analogi": "Analogi konkret sehari-hari"
            }
          ],
          "kesimpulanDanAktivitas": "Rangkuman singkat serta tantangan aktivitas menyenangkan di rumah/sekolah"
        }
      `;
    }

    const fallbackGenerator = () => ({
      judul: `Bahan Ajar PJOK (Standar Buku SIBI Kemendikbudristek): ${topik}`,
      tujuanPembelajaran: tujuan || `Peserta didik mampu memahami fakta, konsep, dan prosedur serta mempraktikkan keterampilan gerak ${topik} secara mandiri, sportif, dan bekerja sama sesuai Buku Panduan PJOK SIBI.`,
      apersepsi: `Berdasarkan Buku Panduan PJOK SIBI Kemendikbudristek, aktivitas jasmani pada materi "${topik}" membantu kita mengembangkan keterampilan gerak, kebugaran jasmani, dan karakter sportivitas (fair play). Sebelum memulai Aktivitas Pembelajaran 1, mari kita lakukan pemanasan dalam bentuk permainan ceria!`,
      isiMateriUtama: `Mengacu pada Buku Panduan Guru PJOK (SIBI - Pusat Perbukuan BSKAP Kemendikbudristek), pembelajaran "${topik}" mengintegrasikan 4 Elemen Capaian Pembelajaran: (1) Pengetahuan Gerak, yaitu memahami prosedur Sikap Awalan, Sikap Pelaksanaan, dan Sikap Akhir; (2) Keterampilan Gerak, yaitu mempraktikkan gerak secara perorangan/berpasangan (Aktivitas 1), kombinasi gerak (Aktivitas 2), dan bermain dengan peraturan yang dimodifikasi (Aktivitas 3); (3) Pemanfaatan Gerak untuk kesehatan dan kebugaran; serta (4) Pengembangan Karakter Mandiri dan Gotong Royong.`,
      tabelMateri: [
        {
          no: 1,
          subKonsep: "Sikap Awalan (Persiapan Gerak - Standar SIBI)",
          faktaPenting: "Tumpuan kaki yang stabil dan pandangan terfokus menjadi kunci keberhasilan gerak awal.",
          prosedur: "Berdiri tegak menghadap arah gerakan, buka kaki selebar bahu, tekuk sedikit kedua lutut, dan rilekskan bahu.",
          analogi: "Seperti kuda-kuda kokoh yang siap melangkah dengan seimbang."
        },
        {
          no: 2,
          subKonsep: "Sikap Pelaksanaan (Aktivitas Pembelajaran 1 & 2 SIBI)",
          faktaPenting: "Koordinasi ayunan lengan, langkah kaki, dan pemindahan berat badan meningkatkan akurasi gerak.",
          prosedur: "Lakukan gerakan inti secara berirama dari latihan individual, berpasangan, hingga kombinasi gerak melewati rintangan cone.",
          analogi: "Seperti pegas elastis yang bergerak selaras dan terarah ke sasaran."
        },
        {
          no: 3,
          subKonsep: "Sikap Akhir & Permainan Modifikasi (Aktivitas 3 SIBI)",
          faktaPenting: "Gerak lanjutan (follow-through) menjaga keseimbangan tubuh dan mencegah cedera.",
          prosedur: "Jaga keseimbangan setelah melakukan gerakan, terapkan dalam permainan peraturan dimodifikasi secara sportif, dan akhiri dengan pendinginan.",
          analogi: "Seperti pesawat yang mendarat mulus dan seimbang di landasan."
        }
      ],
      kesimpulanDanAktivitas: `Referensi Resmi: Buku Panduan Guru PJOK SD/MI (SIBI Kemendikbudristek). Kuasai tahapan Sikap Awal, Pelaksanaan, dan Sikap Akhir pada materi ${topik}, lalu isilah lembar refleksi penguasaan gerak (Sangat Menguasai / Menguasai / Belum Menguasai)!`
    });

    const response = await generateContentWithFallback({
      contents: userPrompt,
      fallbackGenerator,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["judul", "tujuanPembelajaran", "apersepsi", "isiMateriUtama", "tabelMateri", "kesimpulanDanAktivitas"],
          properties: {
            judul: { type: Type.STRING },
            tujuanPembelajaran: { type: Type.STRING },
            apersepsi: { type: Type.STRING },
            isiMateriUtama: { type: Type.STRING },
            tabelMateri: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["no", "subKonsep", "faktaPenting", "prosedur", "analogi"],
                properties: {
                  no: { type: Type.INTEGER },
                  subKonsep: { type: Type.STRING },
                  faktaPenting: { type: Type.STRING },
                  prosedur: { type: Type.STRING },
                  analogi: { type: Type.STRING }
                }
              }
            },
            kesimpulanDanAktivitas: { type: Type.STRING }
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
    console.error("Gemini Materi Ajar Generator Error:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan internal saat merancang materi ajar." },
      { status: 500 }
    );
  }
}
