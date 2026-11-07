import { Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { generateContentWithFallback, extractJson } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { material, topic } = await req.json();

    if (!material) {
      return NextResponse.json(
        { error: "Materi ajar wajib diisi." },
        { status: 400 }
      );
    }

    const systemInstruction = `
      Anda adalah seorang desainer infografis pendidikan profesional dan ilustrator 3D animation yang ahli dalam mengubah materi pembelajaran menjadi poster edukatif visual yang menarik, informatif, dan sangat disukai peserta didik.
      Tugas Anda adalah mengubah materi yang diberikan menjadi sebuah outline rancangan infografis edukatif ukuran A4 (21 cm × 29,7 cm) orientasi portrait dengan gaya 3D cartoon animation berkualitas tinggi seperti ilustrasi film animasi anak modern (Pixar-style).
      Seluruh karakter, objek, lingkungan, ikon, dan elemen visual harus dirancang dalam bentuk 3D render yang halus, lucu, berwarna cerah, memiliki pencahayaan lembut, bayangan realistis, detail tinggi, dan tampilan premium.
      Desain harus terasa seperti perpaduan antara poster pendidikan dan dunia animasi 3D yang hidup, ceria, serta mampu menarik perhatian peserta didik sejak pandangan pertama.
      
      Struktur yang wajib Anda rancang:
      1. Judul utama berukuran besar di bagian atas dengan tipografi kartun yang tebal, berwarna cerah, dan mudah dibaca. Tambahkan subjudul yang menarik serta karakter anak 3D yang berdiri di dekat judul sebagai pemandu belajar (dengan balon percakapan interaktif berisi kalimat pendek).
      2. Bagian utama infografis dibagi menjadi beberapa panel/kotak informasi yang tersusun rapi dengan sudut membulat. Setiap panel memuat satu konsep penting dari materi dan wajib divisualisasikan menggunakan ilustrasi lingkungan 3D yang detail dan kontekstual. Setiap panel harus memiliki judul jelas, ilustrasi utama, ikon pendukung, dan poin-poin informasi yang singkat (hindari paragraf panjang).
      3. Berbagai elemen dekoratif 3D (seperti awan, pohon, bunga, bintang, dedaunan, buku, lampu ide, bentuk geometris, ornamen edukatif) tersebar harmonis.
      4. Di bagian bawah poster, buat area khusus rangkuman, pesan penting, solusi, tips, atau ajakan tindakan yang relevan. Sajikan menggunakan ilustrasi karakter 3D sedang melakukan aktivitas positif sesuai tema.
      
      Hasil keluaran harus rapi, terstruktur, memiliki tabel yang mengaitkan visual 3D, judul panel, ikon, dan poin-poin singkat secara presisi.
    `;

    const prompt = `
      Ubah materi pelajaran berikut menjadi infografis pendidikan 3D Animation Style A4 Portrait yang sangat rapi dan menakjubkan.
      
      Topik/Judul Utama yang diinginkan: ${topic || "Materi Pembelajaran Kreatif"}
      
      Materi Pelajaran:
      ${material}
      
      Harap kembalikan respon dalam format JSON terstruktur Bahasa Indonesia yang ramah anak, rapi, dan mudah dibaca oleh guru maupun desainer.
    `;

    const fallbackGenerator = () => ({
      judulUtama: `INFOGRAFIS SERU: ${topic || "OLAHRAGA DAN KEBUGARAN JASMANI"}`,
      subJudul: "Petualangan Gerak Aktif, Tubuh Sehat, & Pikiran Cerdas!",
      maskotPemandu: "Karakter animasi 3D anak laki-laki dan perempuan berbusana olahraga cerah (biru muda & oranye) tersenyum ceria mengacungkan jempol.",
      balonPercakapan: "Hai teman-teman! Yuk, kita pelajari langkah-langkah gerak sehat dan bugar hari ini!",
      panels: [
        {
          judulPanel: "1. Pemanasan & Koordinasi Tubuh",
          deskripsiVisual3D: "Ilustrasi 3D miniatur lapangan rumput hijau dengan karakter anak sedang melakukan peregangan dinamis dan melompat di atas matras berwarna cerah.",
          ikonSaran: "Lampu Ide & Sepatu Olahraga 3D",
          poinMateri: [
            "Pemanasan 5-10 menit meningkatkan suhu otot tubuh.",
            "Melancarkan aliran darah dan mencegah risiko kram atau cedera.",
            "Menyiapkan konsentrasi dan fokus pikiran sebelum bergerak."
          ]
        },
        {
          judulPanel: "2. Penguasaan Teknik & Pola Gerak",
          deskripsiVisual3D: "Visualisasi 3D garis lintasan gerak interaktif dengan panah bercahaya lembut yang menunjukkan arah pandangan dan posisi langkah kaki.",
          ikonSaran: "Kun Penanda & Medali Emas 3D",
          poinMateri: [
            "Jaga keseimbangan tubuh dengan membuka kaki selebar bahu.",
            "Lakukan gerakan secara berirama dan rileks tanpa terburu-buru.",
            "Fokuskan pandangan pada target atau arah gerakan."
          ]
        },
        {
          judulPanel: "3. Sportivitas & Kerja Sama Tim",
          deskripsiVisual3D: "Dua karakter 3D saling bertos tangan (high-five) dengan latar belakang podium mini bertabur pita konfeti warna-warni.",
          ikonSaran: "Piala & Bintang Emas 3D",
          poinMateri: [
            "Hargai teman dan selalu patuhi aturan main yang adil.",
            "Bekerja sama menyusun strategi dan saling memberi semangat.",
            "Menerima hasil permainan dengan lapang dada dan gembira."
          ]
        }
      ],
      elemenDekoratif3D: [
        "Awan putih lembut 3D melayang di sudut atas",
        "Bintang-bintang berkilau 3D berwarna kuning pastel",
        "Gelembung air dan tetesan embun segar penanda hidrasi",
        "Ikon peluit perak dan stopwatch mini di sela-sela panel"
      ],
      rangkumanBawah: "Tubuh yang sehat dan bugar lahir dari olahraga teratur, asupan air putih yang cukup, serta istirahat yang berkualitas setiap hari.",
      tipsAjakanTindakan: [
        "Minum air putih minimal 8 gelas per hari.",
        "Lakukan aktivitas fisik ringan minimal 30 menit setiap hari.",
        "Tidur cukup 8 jam setiap malam agar energi pulih maksimal."
      ],
      visualMaskotBawah: "Karakter anak 3D sedang memegang botol minum olahraga sambil tersenyum bangga di samping medali kebugaran."
    });

    const response = await generateContentWithFallback({
      contents: prompt,
      fallbackGenerator,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "judulUtama",
            "subJudul",
            "maskotPemandu",
            "balonPercakapan",
            "panels",
            "elemenDekoratif3D",
            "rangkumanBawah",
            "tipsAjakanTindakan",
            "visualMaskotBawah"
          ],
          properties: {
            judulUtama: {
              type: Type.STRING,
              description: "Judul besar tebal bergaya kartun berwarna cerah di bagian atas."
            },
            subJudul: {
              type: Type.STRING,
              description: "Subjudul menarik yang memancing rasa ingin tahu peserta didik."
            },
            maskotPemandu: {
              type: Type.STRING,
              description: "Deskripsi karakter anak 3D ceria yang berdiri di dekat judul (misal: pakaian, pose, ekspresi wajah)."
            },
            balonPercakapan: {
              type: Type.STRING,
              description: "Kalimat ajakan yang komunikatif, pendek, dan interaktif di dalam balon kata maskot."
            },
            panels: {
              type: Type.ARRAY,
              description: "Kotak-kotak informasi utama yang tersusun rapi. Buat setidaknya 3-4 panel berdasarkan materi.",
              items: {
                type: Type.OBJECT,
                required: ["judulPanel", "deskripsiVisual3D", "ikonSaran", "poinMateri"],
                properties: {
                  judulPanel: {
                    type: Type.STRING,
                    description: "Judul panel informasi yang jelas dan singkat."
                  },
                  deskripsiVisual3D: {
                    type: Type.STRING,
                    description: "Deskripsi detail ilustrasi dunia 3D miniatur, objek, pencahayaan, dan lingkungan kontekstual pada panel ini."
                  },
                  ikonSaran: {
                    type: Type.STRING,
                    description: "Saran ikon edukatif penunjang (misal: 'Buku', 'Lampu', 'Atom', 'Bola')."
                  },
                  poinMateri: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Daftar poin informasi yang singkat, padat, mudah dipahami, tanpa paragraf panjang."
                  }
                }
              }
            },
            elemenDekoratif3D: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Daftar ornamen/dekorasi 3D penunjang yang tersebar harmonis di latar belakang (misal: awan lembut, dedaunan melayang, bintang berkilau)."
            },
            rangkumanBawah: {
              type: Type.STRING,
              description: "Pesan penting, rangkuman kunci, atau kesimpulan singkat di bagian bawah poster."
            },
            tipsAjakanTindakan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Daftar tips praktis, solusi, atau ajakan tindakan nyata untuk peserta didik."
            },
            visualMaskotBawah: {
              type: Type.STRING,
              description: "Deskripsi karakter 3D di bagian bawah yang sedang beraktivitas positif sesuai tema (misal: sedang menanam pohon, memegang buku sambil melompat gembira)."
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
    console.error("Gemini Infographic Generator Error:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan internal saat merancang infografis." },
      { status: 500 }
    );
  }
}

