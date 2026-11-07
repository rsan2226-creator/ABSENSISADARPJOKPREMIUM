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
      Anda adalah seorang guru profesional dan pengembang kurikulum yang ahli dalam menyusun Bahan Ajar / Materi Ajar yang interaktif, menyenangkan, sistematis, dan mudah dipahami siswa sesuai Kurikulum Merdeka.
      Anda harus menghasilkan dokumen materi ajar utuh dan menyertakan tabel ringkasan konsep/fakta/prosedur yang sangat rapi dan menarik.
      Gaya bahasa harus komunikatif, sesuai dengan jenjang usia peserta didik, serta mendukung pembelajaran aktif, kontekstual, dan menyenangkan.
    `;

    let userPrompt = "";
    if (promptVersion === "versi1") {
      userPrompt = `
        Anda adalah seorang Guru ${mapel || "PJOK"}, ${jenjang || "SD"}, ${kelas || "Kelas 5"}, ${fase || "Fase C"}.
        Buatkan materi ajar lengkap dengan topik "${topik}" dan mengacu pada tujuan pembelajaran "${tujuan}".
        Materi ajar harus sesuai dengan level kognitif "${levelBloom || "C3 - Menerapkan"}" dan mendukung pengembangan dimensi "${dimensiProfil || "Mandiri, Gotong Royong"}".

        Materi ajar harus ditulis secara utuh, mencakup:
        1. Judul dan Tujuan Pembelajaran di bagian awal.
        2. Pendahuluan atau Apersepsi: paragraf pembuka yang menghubungkan materi dengan kehidupan nyata siswa atau pengetahuan sebelumnya.
        3. Isi Materi: jelaskan secara sistematis konsep utama, fakta, prosedur, atau prinsip yang perlu dipahami siswa. Sertakan contoh konkret, ilustrasi, atau analogi.
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
    } else {
      userPrompt = `
        Anda adalah seorang Guru ${mapel || "PJOK"}, ${jenjang || "SD"}, ${kelas || "Kelas 5"}, ${fase || "Fase C"}.
        Buatkan materi ajar lengkap dengan topik "${topik}" dan mengacu pada tujuan pembelajaran "${tujuan}".

        Materi ajar harus ditulis secara utuh, mencakup:
        1. Judul dan Tujuan Pembelajaran di bagian awal.
        2. Pendahuluan atau Apersepsi: paragraf pembuka yang menghubungkan materi dengan kehidupan nyata siswa atau pengetahuan sebelumnya.
        3. Isi Materi: jelaskan secara sistematis konsep utama, fakta, prosedur, atau prinsip yang perlu dipahami siswa. Sertakan contoh konkret, ilustrasi, atau analogi.
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
      judul: `Bahan Ajar Eksploratif: ${topik}`,
      tujuanPembelajaran: tujuan || `Peserta didik dapat memahami konsep dasar dan mempraktikkan keterampilan ${topik} secara mandiri dan percaya diri.`,
      apersepsi: `Pernahkah kalian mengamati bagaimana atlet atau teman bermain bergerak dengan lincah dan bugar? Hari ini kita akan menjelajahi rahasia di balik keterampilan ${topik} yang membuat tubuh kita semakin sehat, kuat, dan berenergi!`,
      isiMateriUtama: `Pendidikan Jasmani dan Olahraga mengajak kita mengembangkan koordinasi motorik, keseimbangan, serta kebiasaan hidup bugar. Pada pembelajaran "${topik}", terdapat tiga pilar penting yang harus kita kuasai: (1) Posisi dan Keseimbangan Tubuh, (2) Koordinasi Pola Gerak Spesifik, dan (3) Kebugaran serta Keselamatan Diri. Ketika melakukan gerakan ini, selalu mulai dari pemanasan yang cukup, perhatikan ritme pernapasan, dan utamakan keselamatan diri serta teman.`,
      tabelMateri: [
        {
          no: 1,
          subKonsep: "Sikap Awalan & Posisi Tubuh",
          faktaPenting: "Tumpuan kaki yang stabil mencegah kehilangan keseimbangan.",
          prosedur: "Berdiri tegak, buka kaki selebar bahu, tekuk sedikit lutut, dan fokuskan pandangan ke depan.",
          analogi: "Seperti pondasi pohon beringin yang kokoh menancap di tanah."
        },
        {
          no: 2,
          subKonsep: "Pelaksanaan Gerak Inti",
          faktaPenting: "Kombinasi ayunan tangan dan langkah kaki meningkatkan kelincahan.",
          prosedur: "Lakukan gerakan secara berirama, jaga kelenturan persendian, dan hembuskan napas teratur.",
          analogi: "Seperti pegas elastis yang memantul dengan presisi dan mulus."
        },
        {
          no: 3,
          subKonsep: "Sikap Akhir & Relaksasi",
          faktaPenting: "Pendinginan membantu pemulihan denyut jantung kembali normal.",
          prosedur: "Hentikan gerakan secara bertahap, lakukan peregangan statis, dan tarik napas dalam-dalam.",
          analogi: "Seperti mobil yang menurunkan kecepatan secara halus hingga berhenti aman di garasi."
        }
      ],
      kesimpulanDanAktivitas: `Kuasai teknik dasar ${topik} dengan disiplin berlatih. Tantangan pekan ini: Praktikkan variasi gerak ini selama 10-15 menit di rumah bersama keluarga atau teman bermainmu!`
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
