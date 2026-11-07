export interface SibiUnit {
  unitNumber: number;
  title: string;
  elemen:
    | "Keterampilan & Pengetahuan Gerak"
    | "Pemanfaatan Gerak"
    | "Pengembangan Karakter & Nilai Gerak";
  alokasiWaktu: string;
  capaianPembelajaran: string;
  tujuanPembelajaran: string[];
  pokokMateri: string[];
  aktivitasPembelajaran: {
    aktivitas1: string;
    aktivitas2: string;
    aktivitas3Permainan: string;
  };
  pembelajaranAlternatif: string;
  kktp: string;
  kataKunci: string[];
}

export interface SibiBookGrade {
  grade: "I" | "II" | "III" | "IV" | "V" | "VI";
  kelasLabel: string;
  fase: "Fase A" | "Fase B" | "Fase C";
  bookTitle: string;
  authors: string;
  publisher: string;
  isbn: string;
  editionYear: string;
  sibiCatalogUrl: string;
  elemenRingkasan: string;
  units: SibiUnit[];
}

export const SIBI_ELEMEN_CP_PJOK = [
  {
    kode: "Elemen 1",
    nama: "Keterampilan Gerak",
    deskripsi:
      "Peserta didik menunjukkan kemampuan dalam menirukan, mempraktikkan, dan memodifikasi variasi serta kombinasi pola gerak dasar (lokomotor, nonlokomotor, manipulatif), permainan dan olahraga, aktivitas senam, aktivitas gerak berirama, serta aktivitas permainan dan olahraga air."
  },
  {
    kode: "Elemen 2",
    nama: "Pengetahuan Gerak",
    deskripsi:
      "Peserta didik memahami fakta, konsep, dan prosedur dalam melakukan berbagai keterampilan gerak dasar/spesifik berupa permainan dan olahraga, aktivitas senam, aktivitas gerak berirama, dan aktivitas permainan serta olahraga air."
  },
  {
    kode: "Elemen 3",
    nama: "Pemanfaatan Gerak",
    deskripsi:
      "Peserta didik memahami prosedur dan mampu mempraktikkan latihan pengembangan kebugaran jasmani terkait kesehatan dan keterampilan, pengukuran kebugaran jasmani, serta menunjukkan perilaku hidup sehat (kebersihan diri, gizi seimbang, pencegahan cedera/P3K, dan bahaya NAPZA)."
  },
  {
    kode: "Elemen 4",
    nama: "Pengembangan Karakter dan Internalisasi Nilai-Nilai Gerak",
    deskripsi:
      "Peserta didik mengembangkan tanggung jawab personal (jujur, disiplin, patuh aturan, mandiri) dan tanggung jawab sosial (kerja sama, toleransi, peduli, empati, sportivitas/fair play) melalui aktivitas jasmani."
  }
];

export const SIBI_KERANGKA_PEMBELAJARAN = [
  {
    tahap: "1. Persiapan Mengajar (Standar SIBI)",
    rincian:
      "Guru membaca kembali Buku Panduan Guru PJOK SIBI, menyiapkan alat pembelajaran (termasuk modifikasi alat ramah anak seperti bola karet/spons, cone botol plastik), menata lapangan yang aman, dan menyiapkan lembar asesmen proses gerak."
  },
  {
    tahap: "2. Kegiatan Pendahuluan (15 Menit)",
    rincian:
      "Berbaris formasi setengah lingkaran, berdoa, presensi & memastikan tidak ada siswa yang sakit, apersepsi mengaitkan materi dengan pengalaman nyata, menyampaikan Tujuan Pembelajaran, serta pemanasan dalam bentuk permainan ceria (warming-up game)."
  },
  {
    tahap: "3. Kegiatan Inti (45 Menit - Alur Aktivitas 1, 2, 3)",
    rincian:
      "Mengikuti pentahapan Buku Panduan Guru PJOK SIBI: (a) Aktivitas Pembelajaran 1: Eksplorasi teknik dasar gerak secara individu/berpasangan; (b) Aktivitas Pembelajaran 2: Variasi dan kombinasi pola gerak; (c) Aktivitas Pembelajaran 3: Penerapan keterampilan gerak dalam permainan sederhana/modifikasi peraturan yang menekankan nilai sportivitas."
  },
  {
    tahap: "4. Kegiatan Penutup (10 Menit) & Refleksi",
    rincian:
      "Pendinginan (cooling down) dan peregangan statis, pengisian lembar refleksi peserta didik (Sangat Menguasai / Menguasai / Belum Menguasai), penguatan karakter Profil Pelajar Pancasila, doa penutup, dan mengembalikan peralatan secara bergotong royong."
  },
  {
    tahap: "5. Asesmen Autentik SIBI (Sikap, Pengetahuan, Keterampilan)",
    rincian:
      "Menggunakan instrumen resmi Buku Panduan Guru PJOK SIBI: Jurnal Observasi Sikap, Tes Pengetahuan (PG & Uraian), serta Lembar Penilaian Keterampilan Proses Gerak (Sikap Awalan, Sikap Pelaksanaan, Sikap Akhir) dan Penilaian Produk/Unjuk Kerja."
  }
];

export const SIBI_PJOK_BOOKS: Record<string, SibiBookGrade> = {
  I: {
    grade: "I",
    kelasLabel: "Kelas I SD/MI",
    fase: "Fase A",
    bookTitle: "Buku Panduan Guru Pendidikan Jasmani, Olahraga, dan Kesehatan untuk SD/MI Kelas I",
    authors: "Muhajir & Zaenal Rafli",
    publisher: "Pusat Perbukuan, BSKAP Kemendikbudristek (SIBI)",
    isbn: "978-602-244-877-8",
    editionYear: "Cetakan Kurikulum Merdeka (SIBI)",
    sibiCatalogUrl: "https://buku.kemdikbud.go.id/katalog?search=Pendidikan+Jasmani+Kelas+I",
    elemenRingkasan:
      "Fase A memfokuskan pada peniruan dan penguasaan pola gerak dasar lokomotor, nonlokomotor, manipulatif, gerak dominan senam, gerak berirama sederhana, pengenalan air, serta pengenalan bagian tubuh dan kebersihan diri.",
    units: [
      {
        unitNumber: 1,
        title: "Unit 1: Aktivitas Pola Gerak Dasar Lokomotor",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 - 4 Pertemuan (9 - 12 JP)",
        capaianPembelajaran:
          "Peserta didik menunjukkan kemampuan dalam menirukan aktivitas pola gerak dasar lokomotor (jalan, lari, dan lompat) serta memahami prosedur melakukannya secara benar.",
        tujuanPembelajaran: [
          "Menjelaskan dan mempraktikkan gerakan berjalan lurus, berjalan langkah pendek-panjang, dan berjalan mengikuti garis sesuai Buku Panduan PJOK SIBI.",
          "Menjelaskan dan mempraktikkan gerakan berlari ke berbagai arah (lari pelan, lari cepat, dan lari melewati rintangan rendah).",
          "Menjelaskan dan mempraktikkan gerakan melompat dan meloncat (lompat tanpa awalan, lompat melewati bilah, dan permainan lompat katak)."
        ],
        pokokMateri: [
          "Gerak dasar berjalan ke depan, belakang, dan samping",
          "Gerak dasar berlari mengubah arah dan melewati rintangan",
          "Gerak dasar melompat satu kaki dan meloncat dua kaki"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Menirukan gerak berjalan dan berlari seperti hewan (berjalan bebek, gajah, dan berlari kuda) secara perorangan.",
          aktivitas2: "Berjalan di atas garis lurus, berlari berbelok-belok melewati cone, dan melompati simpai di lantai.",
          aktivitas3Permainan: "Permainan 'Menjala Ikan' dan 'Lompat Kelinci' dengan peraturan yang dimodifikasi untuk melatih kerja sama dan kejujuran."
        },
        pembelajaranAlternatif:
          "Jika hujan atau lapangan becek, kegiatan dilakukan di selasar/ruang kelas menggunakan garis ubin lantai dan rintangan tali rafia.",
        kktp: "Peserta didik mampu melakukan minimal 75% indikator sikap awal, pelaksanaan langkah/tolakan, dan pendaratan seimbang.",
        kataKunci: ["Gerak Lokomotor", "Berjalan", "Berlari", "Melompat", "Meloncat"]
      },
      {
        unitNumber: 2,
        title: "Unit 2: Aktivitas Pola Gerak Dasar Nonlokomotor",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik menunjukkan kemampuan dalam menirukan aktivitas pola gerak dasar nonlokomotor (memutar, mengayun, membungkuk, menekuk, dan meliuk).",
        tujuanPembelajaran: [
          "Menjelaskan dan mempraktikkan gerak memutar badan dan mengayun lengan di tempat.",
          "Menjelaskan dan mempraktikkan gerak membungkuk, menekuk lutut, dan meliukkan badan ke samping.",
          "Menerapkan sikap disiplin dan percaya diri selama aktivitas gerak nonlokomotor."
        ],
        pokokMateri: [
          "Gerak memutar kepala, pinggang, dan lengan",
          "Gerak mengayun kedua lengan ke depan-belakang dan samping",
          "Gerak membungkuk, menekuk lutut, dan meliukkan badan"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Menirukan pohon tertiup angin sepoi-sepoi dan angin kencang (meliukkan badan ke kiri, kanan, depan).",
          aktivitas2: "Gerak memutar lengan seperti baling-baling helikopter dan menekuk lutut berpasangan.",
          aktivitas3Permainan: "Permainan 'Kepala Pundak Lutut Kaki' dan 'Estafet Bola Lewat Atas Kepala & Sela Kaki' tanpa berpindah tempat."
        },
        pembelajaranAlternatif:
          "Dapat dilaksanakan di dalam ruang kelas di samping meja masing-masing dengan iringan lagu anak-anak.",
        kktp: "Kelenturan sendi dan keseimbangan tubuh terjaga tanpa berpindah tempat.",
        kataKunci: ["Nonlokomotor", "Memutar", "Mengayun", "Membungkuk", "Meliuk"]
      },
      {
        unitNumber: 3,
        title: "Unit 3: Aktivitas Pola Gerak Dasar Manipulatif",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 - 4 Pertemuan (9 - 12 JP)",
        capaianPembelajaran:
          "Peserta didik menunjukkan kemampuan dalam menirukan aktivitas pola gerak dasar manipulatif (melempar dan menangkap bola).",
        tujuanPembelajaran: [
          "Menjelaskan dan mempraktikkan gerak melempar bola melambung, mendatar, dan menggelinding.",
          "Menjelaskan dan mempraktikkan gerak menangkap bola dengan dua tangan secara tepat.",
          "Menunjukkan sikap kerja sama dan sportivitas dalam permainan lempar tangkap."
        ],
        pokokMateri: [
          "Melempar bola kecil/besar ke sasaran diam",
          "Menangkap bola lambung, datar, dan menyusur tanah",
          "Kombinasi lempar tangkap berpasangan"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Melempar bola karet/kertas ke dalam keranjang sampah dari jarak 2-3 meter.",
          aktivitas2: "Melempar dan menangkap bola plastik secara berpasangan di tempat.",
          aktivitas3Permainan: "Permainan 'Lempar Sasaran Kaleng/Botol Plastik' (Boy-boyan modifikasi ramah anak)."
        },
        pembelajaranAlternatif:
          "Gunakan gulungan kertas koran yang dilapisi lakban jika bola kasti/bola plastik jumlahnya terbatas.",
        kktp: "Ketepatan koordinasi mata dan tangan saat melempar ke sasaran dan menangkap bola.",
        kataKunci: ["Manipulatif", "Melempar Bola", "Menangkap Bola", "Koordinasi Mata-Tangan"]
      },
      {
        unitNumber: 4,
        title: "Unit 4: Aktivitas Senam (Gerak Dominan Keseimbangan)",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu mempraktikkan pola gerak dominan senam lantai berupa keseimbangan statis dan keseimbangan dinamis.",
        tujuanPembelajaran: [
          "Mempraktikkan gerak keseimbangan statis (berdiri satu kaki, sikap kapal terbang, duduk mengangkat kedua kaki).",
          "Mempraktikkan gerak keseimbangan dinamis (berjalan di atas garis lurus dan balok titian rendah)."
        ],
        pokokMateri: [
          "Keseimbangan statis berdiri satu kaki dan sikap pesawat terbang",
          "Keseimbangan dinamis berjalan di atas balok titian/garis"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Latihan berdiri satu kaki seperti burung bangau dan sikap pesawat terbang selama 5-8 hitungan.",
          aktivitas2: "Berjalan di atas garis lurus atau balok titian rendah sambil merentangkan kedua tangan.",
          aktivitas3Permainan: "Permainan 'Patung Keseimbangan' (berhenti dalam posisi seimbang saat peluit berbunyi)."
        },
        pembelajaranAlternatif: "Menggunakan lakban berwarna yang ditempel di lantai sebagai pengganti balok titian.",
        kktp: "Mampu mempertahankan posisi seimbang selama 5 hitungan tanpa terjatuh.",
        kataKunci: ["Senam Lantai", "Keseimbangan Statis", "Keseimbangan Dinamis", "Balok Titian"]
      },
      {
        unitNumber: 5,
        title: "Unit 5: Aktivitas Gerak Berirama",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu menirukan pola gerak langkah kaki dan ayunan lengan mengikuti irama (ketukan/tepuk tangan/nyanyian).",
        tujuanPembelajaran: [
          "Mempraktikkan gerak langkah kaki ke depan, belakang, dan samping sesuai ketukan.",
          "Mempraktikkan kombinasi gerak langkah kaki dan ayunan lengan mengikuti irama lagu anak."
        ],
        pokokMateri: ["Gerak berirama bebas", "Langkah kaki dan ayunan lengan sesuai ketukan/lagu"],
        aktivitasPembelajaran: {
          aktivitas1: "Melangkah di tempat dan maju-mundur mengikuti tepukan tangan guru (hitungan 1-8).",
          aktivitas2: "Mengayunkan kedua lengan ke samping dan ke atas mengikuti irama lagu daerah/anak.",
          aktivitas3Permainan: "Senam Ceria Bersama dalam lingkaran sambil bernyanyi gembira."
        },
        pembelajaranAlternatif: "Menggunakan ketukan tepuk tangan atau peluit jika pengeras suara tidak tersedia.",
        kktp: "Kesesuaian gerak langkah dan ayunan dengan ketukan irama serta ekspresi ceria.",
        kataKunci: ["Gerak Berirama", "Ketukan", "Langkah Kaki", "Ayunan Lengan"]
      },
      {
        unitNumber: 6,
        title: "Unit 6: Aktivitas Pengenalan Air",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "2 Pertemuan (6 JP)",
        capaianPembelajaran:
          "Peserta didik mengenal aktivitas bermain di air dan memahami aturan keselamatan di kolam renang.",
        tujuanPembelajaran: [
          "Menjelaskan aturan keselamatan sebelum dan saat berada di kolam air.",
          "Mempraktikkan gerak berjalan di air dangkal, duduk di air, dan membasuh wajah."
        ],
        pokokMateri: ["Keselamatan di kolam renang", "Bermain di air dangkal dan latihan gelembung napas"],
        aktivitasPembelajaran: {
          aktivitas1: "Duduk di tepi kolam dan menggerakkan kedua kaki di permukaan air.",
          aktivitas2: "Berjalan berpegangan tangan di kolam dangkal dan latihan meniup permukaan air.",
          aktivitas3Permainan: "Permainan 'Lingkaran Air Gembira' di kolam dangkal dengan pengawasan ketat guru."
        },
        pembelajaranAlternatif:
          "Simulasi gerak pengenalan air dan keselamatan air di lapangan sekolah serta praktik meniup air di dalam baskom bersih.",
        kktp: "Keberanian masuk ke air dangkal dan kepatuhan penuh pada aturan keselamatan kolam.",
        kataKunci: ["Pengenalan Air", "Keselamatan Air", "Kolam Dangkal"]
      },
      {
        unitNumber: 7,
        title: "Unit 7: Aktivitas Kebugaran Jasmani Berkaitan dengan Kesehatan",
        elemen: "Pemanfaatan Gerak",
        alokasiWaktu: "2 Pertemuan (6 JP)",
        capaianPembelajaran:
          "Peserta didik memahami dan mempraktikkan sikap tubuh yang benar dalam keadaan diam (duduk, berdiri) dan bergerak (berjalan).",
        tujuanPembelajaran: [
          "Mempraktikkan sikap duduk membaca/menulis yang tegak dan benar.",
          "Mempraktikkan sikap berdiri tegak, sikap istirahat, dan berjalan dengan postur tubuh yang baik."
        ],
        pokokMateri: ["Sikap tubuh dalam keadaan diam (duduk & berdiri)", "Sikap tubuh dalam keadaan bergerak"],
        aktivitasPembelajaran: {
          aktivitas1: "Praktik posisi duduk yang benar di kursi kelas agar tulang punggung tumbuh sehat.",
          aktivitas2: "Latihan baris-berbaris sederhana (sikap sempurna dan istirahat di tempat).",
          aktivitas3Permainan: "Lomba 'Berjalan Membawa Buku di Atas Kepala' untuk melatih postur tegak."
        },
        pembelajaranAlternatif: "Praktik langsung menggunakan kursi dan meja belajar di ruang kelas.",
        kktp: "Postur punggung tegak saat duduk, berdiri, dan berjalan.",
        kataKunci: ["Kebugaran Jasmani", "Postur Tubuh", "Sikap Duduk", "Sikap Berdiri"]
      },
      {
        unitNumber: 8,
        title: "Unit 8: Mengenal Bagian-Bagian Tubuh & Kebersihan Diri",
        elemen: "Pemanfaatan Gerak",
        alokasiWaktu: "2 Pertemuan (6 JP)",
        capaianPembelajaran:
          "Peserta didik mengenal bagian-bagian tubuh, bagian tubuh yang boleh dan tidak boleh disentuh orang lain, serta cara menjaga kebersihannya.",
        tujuanPembelajaran: [
          "Mengidentifikasi bagian-bagian tubuh dan kegunaannya.",
          "Menjelaskan bagian tubuh pribadi yang tidak boleh disentuh orang lain (mulut, dada, kemaluan, bokong) serta cara menjaga kebersihan badan dan pakaian."
        ],
        pokokMateri: [
          "Kegunaan bagian-bagian tubuh",
          "Bagian tubuh yang boleh dan tidak boleh disentuh orang lain (Sentuhan Aman vs Tidak Aman)",
          "Cara menjaga kebersihan tubuh, kuku, rambut, dan pakaian"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Menyanyikan lagu 'Dua Mata Saya' dan 'Sentuhan Boleh Sentuhan Tidak Boleh' sambil menunjuk bagian tubuh.",
          aktivitas2: "Simulasi 6 langkah mencuci tangan pakai sabun (CTPS) dengan air mengalir.",
          aktivitas3Permainan: "Kuis interaktif 'Tebak Fungsi & Cara Merawat Tubuhku'."
        },
        pembelajaranAlternatif: "Menggunakan poster anatomi anak 3D/gambar kartu di ruang kelas.",
        kktp: "Mampu menyebutkan bagian tubuh yang harus dilindungi dan mempraktikkan cara mencuci tangan yang benar.",
        kataKunci: ["Bagian Tubuh", "Kebersihan Diri", "Sentuhan Aman", "Cuci Tangan"]
      }
    ]
  },
  II: {
    grade: "II",
    kelasLabel: "Kelas II SD/MI",
    fase: "Fase A",
    bookTitle: "Buku Panduan Guru Pendidikan Jasmani, Olahraga, dan Kesehatan untuk SD/MI Kelas II",
    authors: "Muhajir & Agus Gunawan",
    publisher: "Pusat Perbukuan, BSKAP Kemendikbudristek (SIBI)",
    isbn: "978-602-244-878-5",
    editionYear: "Cetakan Kurikulum Merdeka (SIBI)",
    sibiCatalogUrl: "https://buku.kemdikbud.go.id/katalog?search=Pendidikan+Jasmani+Kelas+II",
    elemenRingkasan:
      "Fase A Kelas II memperkaya variasi pola gerak dasar lokomotor, nonlokomotor, manipulatif, gerak dominan senam lantai, gerak berirama, pengenalan air, latihan kekuatan otot sederhana, serta kebersihan lingkungan.",
    units: [
      {
        unitNumber: 1,
        title: "Unit 1: Aktivitas Variasi Pola Gerak Dasar Lokomotor",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran: "Peserta didik mampu mempraktikkan variasi pola gerak dasar berjalan, berlari, bergeser, melompat, dan meloncat.",
        tujuanPembelajaran: [
          "Mempraktikkan variasi gerak berjalan dan berlari mengubah arah serta kecepatan.",
          "Mempraktikkan variasi gerak melompat dan meloncat melewati rintangan secara aman."
        ],
        pokokMateri: ["Variasi gerak berjalan dan berlari", "Variasi gerak melompat dan meloncat"],
        aktivitasPembelajaran: {
          aktivitas1: "Variasi jalan jinjit, jalan mundur, dan lari zig-zag melewati 5 cone.",
          aktivitas2: "Melompat ke dalam lingkaran simpai (hula hoop) secara beruntun.",
          aktivitas3Permainan: "Permainan Tradisional 'Engklek / Sunda Manda' dan 'Bentengan Sederhana'."
        },
        pembelajaranAlternatif: "Menggambar kotak engklek dengan kapur tulis di teras sekolah.",
        kktp: "Kelincahan berpindah tempat dan keseimbangan saat mendarat.",
        kataKunci: ["Variasi Lokomotor", "Lari Zig-Zag", "Melompat", "Engklek"]
      },
      {
        unitNumber: 2,
        title: "Unit 2: Aktivitas Variasi Pola Gerak Dasar Nonlokomotor",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran: "Peserta didik mampu mempraktikkan variasi gerak memutar, mengayun, menekuk, menarik, dan mendorong di tempat.",
        tujuanPembelajaran: [
          "Mempraktikkan variasi gerak memutar dan mengayun lengan dengan alat (simpai/tali).",
          "Mempraktikkan variasi gerak menarik dan mendorong secara berpasangan dengan seimbang."
        ],
        pokokMateri: ["Variasi memutar dan mengayun", "Variasi menekuk, menarik, dan mendorong"],
        aktivitasPembelajaran: {
          aktivitas1: "Mengayun dan memutar simpai menggunakan satu dan dua lengan di tempat.",
          aktivitas2: "Gerak saling menarik dan mendorong telapak tangan berpasangan tanpa berpindah kaki.",
          aktivitas3Permainan: "Permainan 'Tarik Tambang Duduk/Berpasangan' dan 'Gerobak Dorong di Tempat'."
        },
        pembelajaranAlternatif: "Menggunakan kain selendang atau tali pramuka untuk latihan tarik-menarik berpasangan.",
        kktp: "Ketepatan tumpuan kaki saat menarik dan mendorong tanpa kehilangan keseimbangan.",
        kataKunci: ["Variasi Nonlokomotor", "Menarik", "Mendorong", "Mengayun"]
      },
      {
        unitNumber: 3,
        title: "Unit 3: Aktivitas Variasi Pola Gerak Dasar Manipulatif",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran: "Peserta didik mampu mempraktikkan variasi gerak melempar, menangkap, menendang, dan menahan bola.",
        tujuanPembelajaran: [
          "Mempraktikkan variasi melempar dan menangkap bola kecil serta bola besar.",
          "Mempraktikkan variasi menendang dan menghentikan bola menggunakan kaki bagian dalam."
        ],
        pokokMateri: ["Variasi lempar tangkap bola", "Variasi menendang dan menahan bola"],
        aktivitasPembelajaran: {
          aktivitas1: "Melempar dan menangkap bola melambung sambil bertepuk tangan.",
          aktivitas2: "Menendang dan menahan bola plastik/karet berpasangan pada jarak 4 meter.",
          aktivitas3Permainan: "Permainan 'Kucing-Kucingan Bola' dalam lingkaran."
        },
        pembelajaranAlternatif: "Menggunakan bola plastik/spons agar aman bagi kaki anak.",
        kktp: "Akurasi arah lemparan dan tendangan bola ke pasangan.",
        kataKunci: ["Variasi Manipulatif", "Menendang Bola", "Menahan Bola", "Lempar Tangkap"]
      },
      {
        unitNumber: 4,
        title: "Unit 4: Aktivitas Senam (Pola Gerak Dominan)",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran: "Peserta didik mampu mempraktikkan gerak bertumpu, bergantung, keseimbangan, tolakan, putaran, melayang, dan mendarat.",
        tujuanPembelajaran: [
          "Mempraktikkan gerak bertumpu dengan kedua tangan dan keseimbangan statis.",
          "Mempraktikkan gerak berguling ke samping (log roll) dan guling depan sederhana di atas matras."
        ],
        pokokMateri: ["Gerak bertumpu dan keseimbangan", "Gerak berguling di atas matras"],
        aktivitasPembelajaran: {
          aktivitas1: "Gerak bertumpu telapak tangan dan kaki (jalan kepiting dan sikap meja).",
          aktivitas2: "Berguling ke samping seperti batang kayu (log roll) di atas matras.",
          aktivitas3Permainan: "Rangkaian pos ketangkasan senam anak di atas matras."
        },
        pembelajaranAlternatif: "Menggunakan rumput taman yang rata dan empuk bila jumlah matras terbatas.",
        kktp: "Posisi tumpuan tangan kuat dan pendaratan dua kaki mengeper.",
        kataKunci: ["Gerak Dominan Senam", "Bertumpu", "Berguling", "Mendarat"]
      },
      {
        unitNumber: 5,
        title: "Unit 5: Aktivitas Gerak Berirama",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran: "Peserta didik mampu mempraktikkan variasi gerak langkah kaki dan ayunan lengan mengikuti ketukan/musik.",
        tujuanPembelajaran: [
          "Mempraktikkan variasi langkah biasa, langkah rapat, dan langkah samping sesuai irama.",
          "Mempraktikkan variasi ayunan satu lengan dan dua lengan mengikuti musik."
        ],
        pokokMateri: ["Variasi langkah kaki berirama", "Variasi ayunan lengan berirama"],
        aktivitasPembelajaran: {
          aktivitas1: "Latihan langkah tunggal dan langkah ganda ke samping kiri-kanan.",
          aktivitas2: "Memadukan langkah kaki dengan ayunan lengan memompa dan merentang.",
          aktivitas3Permainan: "Senam Irama Anak Gembira berkelompok."
        },
        pembelajaranAlternatif: "Irama menggunakan ketukan peluit atau lagu daerah setempat.",
        kktp: "Kekompakan gerak dengan ketukan 2x8 hitungan.",
        kataKunci: ["Senam Irama", "Langkah Rapat", "Ayunan Lengan"]
      },
      {
        unitNumber: 6,
        title: "Unit 6: Aktivitas Pengenalan Air",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "2 Pertemuan (6 JP)",
        capaianPembelajaran: "Peserta didik mampu mempraktikkan gerak dasar mengapung, meluncur sederhana, dan bernapas di air.",
        tujuanPembelajaran: [
          "Mempraktikkan latihan pernapasan di air dan mengapung berpegangan di dinding kolam.",
          "Mempraktikkan gerak meluncur sederhana dengan bantuan papan pelampung."
        ],
        pokokMateri: ["Mengapung di air", "Meluncur dan gerakan kaki di air"],
        aktivitasPembelajaran: {
          aktivitas1: "Berpegangan di tepi kolam sambil menggerakkan kedua kaki naik turun.",
          aktivitas2: "Belajar mengapung telungkup berpasangan dengan bantuan guru.",
          aktivitas3Permainan: "Permainan 'Mencari Koin/Benda Berwarna di Kolam Dangkal'."
        },
        pembelajaranAlternatif: "Simulasi gerak kaki renang dan posisi streamline di atas matras.",
        kktp: "Berani memasukkan wajah ke air sambil menghembuskan napas dari mulut/hidung.",
        kataKunci: ["Mengapung", "Meluncur", "Pernapasan Air"]
      },
      {
        unitNumber: 7,
        title: "Unit 7: Aktivitas Kebugaran Jasmani untuk Kesehatan",
        elemen: "Pemanfaatan Gerak",
        alokasiWaktu: "2 Pertemuan (6 JP)",
        capaianPembelajaran: "Peserta didik mampu mempraktikkan latihan kekuatan otot lengan, bahu, dada, perut, dan punggung secara sederhana.",
        tujuanPembelajaran: [
          "Mempraktikkan latihan kekuatan otot lengan dan bahu melalui permainan gerobak dorong dan saling mendorong.",
          "Mempraktikkan latihan kekuatan otot perut dan punggung melalui permainan baring duduk bola."
        ],
        pokokMateri: ["Latihan kekuatan otot lengan & bahu", "Latihan kekuatan otot perut & punggung"],
        aktivitasPembelajaran: {
          aktivitas1: "Sikap menahan tubuh bertumpu tangan (plank anak 10 detik) dan jalan kepiting.",
          aktivitas2: "Baring duduk sambil mengoper bola ke teman di depan kaki.",
          aktivitas3Permainan: "Lomba 'Estafet Gerobak Dorong Berpasangan' jarak 5 meter."
        },
        pembelajaranAlternatif: "Dilakukan di atas matras atau lantai bersih di dalam aula.",
        kktp: "Ketahanan melakukan latihan kekuatan sesuai porsi usia anak.",
        kataKunci: ["Kekuatan Otot", "Otot Lengan", "Otot Perut", "Kebugaran"]
      },
      {
        unitNumber: 8,
        title: "Unit 8: Cara Menjaga Kebersihan Lingkungan",
        elemen: "Pemanfaatan Gerak",
        alokasiWaktu: "2 Pertemuan (6 JP)",
        capaianPembelajaran: "Peserta didik memahami cara menjaga kebersihan kamar tidur, rumah, kelas, dan lingkungan sekolah.",
        tujuanPembelajaran: [
          "Menjelaskan cara menjaga kebersihan tempat tidur dan lingkungan rumah.",
          "Mempraktikkan kebiasaan menjaga kebersihan ruang kelas dan halaman sekolah (memilah sampah organik & anorganik)."
        ],
        pokokMateri: ["Kebersihan kamar dan rumah", "Kebersihan kelas dan halaman sekolah"],
        aktivitasPembelajaran: {
          aktivitas1: "Mengamati gambar lingkungan sehat vs lingkungan kotor dan mendiskusikan dampaknya.",
          aktivitas2: "Simulasi merapikan perlengkapan belajar dan memilah sampah.",
          aktivitas3Permainan: "Aksi 'Operasi Semut Ceria' membersihkan area lapangan sekolah selama 10 menit."
        },
        pembelajaranAlternatif: "Membuat poster mini jadwal piket kebersihan kelas.",
        kktp: "Mampu menyebutkan minimal 3 cara menjaga kebersihan rumah dan sekolah.",
        kataKunci: ["Kebersihan Lingkungan", "Lingkungan Sehat", "Piket Kelas"]
      }
    ]
  },
  III: {
    grade: "III",
    kelasLabel: "Kelas III SD/MI",
    fase: "Fase B",
    bookTitle: "Buku Panduan Guru Pendidikan Jasmani, Olahraga, dan Kesehatan untuk SD/MI Kelas III",
    authors: "Muhajir & Agus Gunawan",
    publisher: "Pusat Perbukuan, BSKAP Kemendikbudristek (SIBI)",
    isbn: "978-602-244-881-5",
    editionYear: "Cetakan Kurikulum Merdeka (SIBI)",
    sibiCatalogUrl: "https://buku.kemdikbud.go.id/katalog?search=Pendidikan+Jasmani+Kelas+III",
    elemenRingkasan:
      "Fase B Kelas III mengembangkan kombinasi pola gerak dasar lokomotor, nonlokomotor, dan manipulatif, senam ketangkasan, gerak berirama, aktivitas air, kebugaran jasmani, serta pola istirahat dan memilih makanan bergizi seimbang.",
    units: [
      {
        unitNumber: 1,
        title: "Unit 1: Aktivitas Kombinasi Pola Gerak Dasar Lokomotor",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran: "Peserta didik menghaluskan keterampilan gerak fundamental dan mempraktikkan kombinasi gerak berjalan, berlari, dan melompat.",
        tujuanPembelajaran: [
          "Mempraktikkan kombinasi gerak berjalan dan berlari melewati rintangan.",
          "Mempraktikkan kombinasi gerak berlari dan melompat sejauh-jauhnya."
        ],
        pokokMateri: ["Kombinasi jalan dan lari", "Kombinasi lari dan lompat"],
        aktivitasPembelajaran: {
          aktivitas1: "Kombinasi jalan cepat dilanjutkan lari sprint 15 meter.",
          aktivitas2: "Lari awalan 5 langkah dilanjutkan melompat melewati gawang rendah/kardus.",
          aktivitas3Permainan: "Permainan Tradisional 'Gobak Sodor / Hadang' dan 'Lompat Tali Beregu'."
        },
        pembelajaranAlternatif: "Menggunakan kardus bekas sepatu sebagai rintangan lompat.",
        kktp: "Kelancaran transisi dari gerak berjalan ke berlari dan menolak saat melompat.",
        kataKunci: ["Kombinasi Lokomotor", "Lari dan Lompat", "Gobak Sodor"]
      },
      {
        unitNumber: 2,
        title: "Unit 2: Aktivitas Kombinasi Pola Gerak Dasar Nonlokomotor",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran: "Peserta didik mampu mempraktikkan kombinasi gerak memutar, mengayun, membungkuk, menekuk, dan meliuk.",
        tujuanPembelajaran: [
          "Mempraktikkan kombinasi gerak mengayun lengan dan membungkukkan badan.",
          "Mempraktikkan kombinasi gerak menekuk lutut dan meliukkan tubuh dengan koordinasi yang baik."
        ],
        pokokMateri: ["Kombinasi mengayun dan membungkuk", "Kombinasi menekuk dan meliuk"],
        aktivitasPembelajaran: {
          aktivitas1: "Kombinasi memutar kedua lengan, membungkuk menyentuh ujung kaki, dan meliuk ke belakang.",
          aktivitas2: "Kombinasi menarik dan mendorong tongkat secara berpasangan.",
          aktivitas3Permainan: "Permainan 'Terowongan Bola Berantai' dalam barisan kelompok."
        },
        pembelajaranAlternatif: "Menggunakan tongkat pramuka atau botol air mineral sebagai media kombinasi.",
        kktp: "Koordinasi gerak berkesinambungan tanpa kehilangan keseimbangan.",
        kataKunci: ["Kombinasi Nonlokomotor", "Kelenturan", "Koordinasi"]
      },
      {
        unitNumber: 3,
        title: "Unit 3: Aktivitas Kombinasi Pola Gerak Dasar Manipulatif",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran: "Peserta didik mampu mempraktikkan kombinasi gerak melempar-menangkap, menendang-menahan, dan memantul-mantulkan bola.",
        tujuanPembelajaran: [
          "Mempraktikkan kombinasi gerak melambungkan, memukul, dan menangkap bola kecil.",
          "Mempraktikkan kombinasi gerak menggiring, menendang, dan menghentikan bola."
        ],
        pokokMateri: ["Kombinasi lempar-tangkap-pukul bola kecil", "Kombinasi giring-tendang-tahan bola besar"],
        aktivitasPembelajaran: {
          aktivitas1: "Melambungkan bola kasti, memukul dengan telapak tangan/pemukul kayu, lalu berlari ke tiang hinggap.",
          aktivitas2: "Menggiring bola melewati 4 cone lalu menendang ke gawang kecil.",
          aktivitas3Permainan: "Permainan 'Kasti Mini 2 Tiang Hinggap' dan 'Sepak Bola Gawang Cone'."
        },
        pembelajaranAlternatif: "Menggunakan bola voli spons atau bola plastik berlapis untuk latihan lapangan sempit.",
        kktp: "Keberhasilan merangkaikan 2-3 gerak manipulatif secara berurutan.",
        kataKunci: ["Kombinasi Manipulatif", "Menggiring Bola", "Memukul Bola"]
      },
      {
        unitNumber: 4,
        title: "Unit 4: Aktivitas Gerak Dominan Senam Lantai",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran: "Peserta didik mampu mempraktikkan kombinasi pola gerak dominan senam lantai tanpa dan dengan alat.",
        tujuanPembelajaran: [
          "Mempraktikkan kombinasi keseimbangan bertumpu satu kaki dan sikap lilin sederhana.",
          "Mempraktikkan kombinasi tolakan dua kaki, melayang, dan mendarat mengeper."
        ],
        pokokMateri: ["Kombinasi bertumpu dan keseimbangan", "Kombinasi tolakan, melayang, dan mendarat"],
        aktivitasPembelajaran: {
          aktivitas1: "Sikap pesawat terbang dilanjutkan berguling ke depan di atas matras.",
          aktivitas2: "Meloncat dari bangku pendek/box rendah dan mendarat dua kaki mengeper di matras.",
          aktivitas3Permainan: "Sirkuit Ketangkasan Senam 3 Pos."
        },
        pembelajaranAlternatif: "Tumpukan 2 matras sebagai pengganti peti lompat rendah.",
        kktp: "Teknik tumpuan tengkuk saat guling depan dan pendaratan dua kaki aman.",
        kataKunci: ["Senam Ketangkasan", "Guling Depan", "Pendaratan Mengeper"]
      },
      {
        unitNumber: 5,
        title: "Unit 5: Aktivitas Gerak Berirama",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran: "Peserta didik mampu mempraktikkan kombinasi gerak langkah kaki dan ayunan lengan mengikuti irama.",
        tujuanPembelajaran: [
          "Mempraktikkan kombinasi langkah biasa dan langkah keseimbangan dengan ayunan satu lengan.",
          "Mempraktikkan rangkaian gerak berirama beregu dengan kompak."
        ],
        pokokMateri: ["Kombinasi langkah kaki dan ayunan lengan", "Rangkaian senam irama beregu"],
        aktivitasPembelajaran: {
          aktivitas1: "Latihan pola langkah segitiga dan langkah rapat mengikuti ketukan 2x8.",
          aktivitas2: "Merangkaikan 3 variasi gerakan langkah dan ayunan lengan bersama kelompok.",
          aktivitas3Permainan: "Unjuk karya rangkaian Senam Irama Anak Nusantara."
        },
        pembelajaranAlternatif: "Menggunakan iringan musik instrumen lagu wajib nasional bertempo riang.",
        kktp: "Keluwesan gerak, ketepatan irama, dan kekompakan kelompok.",
        kataKunci: ["Kombinasi Gerak Berirama", "Langkah Keseimbangan", "Kekompakan"]
      },
      {
        unitNumber: 6,
        title: "Unit 6: Aktivitas Permainan dan Olahraga di Air",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "2 Pertemuan (6 JP)",
        capaianPembelajaran: "Peserta didik mampu mempraktikkan gerak dasar meluncur, gerakan tungkai, dan gerakan lengan renang gaya dada.",
        tujuanPembelajaran: [
          "Mempraktikkan gerak meluncur dari dinding kolam dilanjutkan gerakan kaki katak (renang gaya dada).",
          "Mempraktikkan gerakan lengan renang gaya dada di air dangkal."
        ],
        pokokMateri: ["Gerak meluncur dan tungkai gaya dada", "Gerak lengan dan pengambilan napas gaya dada"],
        aktivitasPembelajaran: {
          aktivitas1: "Latihan gerakan kaki gaya dada berpegangan pada pelampung/tepi kolam.",
          aktivitas2: "Meluncur sejauh 5 meter dilanjutkan gerakan tungkai gaya dada.",
          aktivitas3Permainan: "Lomba 'Meluncur Terjauh (Torpedo Air)' di kolam dangkal."
        },
        pembelajaranAlternatif: "Praktik kering (dryland drill) koordinasi kaki dan tangan gaya dada di atas bangku/matras.",
        kktp: "Posisi tubuh telungkup sejajar permukaan air (streamline) saat meluncur.",
        kataKunci: ["Renang Gaya Dada", "Meluncur", "Gerakan Tungkai"]
      },
      {
        unitNumber: 7,
        title: "Unit 7: Aktivitas Kebugaran Jasmani untuk Kesehatan",
        elemen: "Pemanfaatan Gerak",
        alokasiWaktu: "2 Pertemuan (6 JP)",
        capaianPembelajaran: "Peserta didik memahami dan mempraktikkan latihan daya tahan, kekuatan, dan kelenturan untuk kebugaran jasmani.",
        tujuanPembelajaran: [
          "Mempraktikkan latihan kekuatan otot dan kelenturan persendian melalui permainan.",
          "Mempraktikkan latihan daya tahan jantung-paru melalui lari pelan (jogging) dan lompat tali."
        ],
        pokokMateri: ["Latihan kekuatan dan kelenturan", "Latihan daya tahan jantung dan paru-paru"],
        aktivitasPembelajaran: {
          aktivitas1: "Peregangan dinamis, sit-up berpasangan, dan push-up bertumpu lutut.",
          aktivitas2: "Lompat tali (skipping) perorangan dan beregu selama 2 menit.",
          aktivitas3Permainan: "Sirkuit Kebugaran Ceria 4 Pos (Lari Bolak-Balik, Lompat Tali, Sit-up, Keseimbangan)."
        },
        pembelajaranAlternatif: "Menggunakan karet gelang yang dirangkai panjang sebagai tali lompat.",
        kktp: "Menyelesaikan seluruh pos sirkuit kebugaran dengan semangat dan teknik benar.",
        kataKunci: ["Daya Tahan", "Kelenturan", "Lompat Tali", "Sirkuit Kebugaran"]
      },
      {
        unitNumber: 8,
        title: "Unit 8: Aktivitas Fisik, Istirahat, dan Memilih Makanan Bergizi Seimbang",
        elemen: "Pemanfaatan Gerak",
        alokasiWaktu: "2 Pertemuan (6 JP)",
        capaianPembelajaran: "Peserta didik memahami manfaat aktivitas fisik, istirahat/tidur cukup, pengisian waktu luang, dan memilih makanan bergizi seimbang.",
        tujuanPembelajaran: [
          "Menjelaskan manfaat istirahat/tidur yang cukup dan cara mengisi waktu luang yang sehat.",
          "Mengidentifikasi komposisi makanan bergizi seimbang ('Isi Piringku': karbohidrat, protein, sayur, buah) dan bahaya jajanan tidak sehat."
        ],
        pokokMateri: ["Manfaat istirahat dan tidur teratur", "Pedoman Gizi Seimbang (Isi Piringku) dan jajanan sehat"],
        aktivitasPembelajaran: {
          aktivitas1: "Mengelompokkan kartu gambar makanan ke dalam kelompok 'Isi Piringku'.",
          aktivitas2: "Menyusun jadwal harian sehat (waktu belajar, olahraga, bermain aktif, dan tidur malam 8-9 jam).",
          aktivitas3Permainan: "Permainan 'Belanja Gizi Seimbang' melalui lari estafet kartu makanan."
        },
        pembelajaranAlternatif: "Mengamati bekal makanan sehat yang dibawa peserta didik dari rumah.",
        kktp: "Mampu menyusun contoh menu 'Isi Piringku' dan jadwal istirahat sehat.",
        kataKunci: ["Gizi Seimbang", "Isi Piringku", "Istirahat Cukup", "Jajanan Sehat"]
      }
    ]
  },
  IV: {
    grade: "IV",
    kelasLabel: "Kelas IV SD/MI",
    fase: "Fase B",
    bookTitle: "Buku Panduan Guru Pendidikan Jasmani, Olahraga, dan Kesehatan untuk SD/MI Kelas IV",
    authors: "Muhajir & Agus Gunawan",
    publisher: "Pusat Perbukuan, BSKAP Kemendikbudristek (SIBI)",
    isbn: "978-602-244-879-2",
    editionYear: "Cetakan Kurikulum Merdeka (SIBI)",
    sibiCatalogUrl: "https://buku.kemdikbud.go.id/katalog?search=Pendidikan+Jasmani+Kelas+IV",
    elemenRingkasan:
      "Fase B Kelas IV sesuai Buku Panduan Guru PJOK SIBI mencakup 8 Unit utama: Permainan Invasi, Permainan Net, Permainan Lapangan (Kasti), Bela Diri Pencak Silat, Atletik, Senam Lantai, Gerak Berirama & Air, serta Kebugaran Jasmani & Kesehatan Alat Reproduksi.",
    units: [
      {
        unitNumber: 1,
        title: "Unit 1: Aktivitas Variasi dan Kombinasi Pola Gerak Dasar dalam Permainan Invasi",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik menghaluskan keterampilan gerak fundamental dan menerapkan variasi serta kombinasi gerak lokomotor, nonlokomotor, dan manipulatif dalam permainan invasi (bola tangan/sepak bola modifikasi).",
        tujuanPembelajaran: [
          "Menjelaskan dan mempraktikkan variasi dan kombinasi gerak melempar dan menangkap bola dalam permainan bola tangan modifikasi.",
          "Menjelaskan dan mempraktikkan variasi dan kombinasi gerak menendang, menahan, dan menggiring bola dengan kaki bagian dalam dan luar dalam permainan sepak bola mini.",
          "Menunjukkan sikap sportivitas, kerja sama, dan disiplin sesuai Profil Pelajar Pancasila."
        ],
        pokokMateri: [
          "Variasi dan kombinasi melempar-menangkap bola sambil bergerak (Permainan Bola Tangan Mini)",
          "Variasi dan kombinasi menendang, menahan, dan menggiring bola (Permainan Sepak Bola Modifikasi)"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Berlatih operan bola (passing) dan menahan bola secara berpasangan di tempat dan sambil bergerak menyamping.",
          aktivitas2: "Menggiring bola melewati lintasan cone zig-zag dilanjutkan mengoper ke teman dan menembak ke gawang kecil.",
          aktivitas3Permainan: "Bermain Sepak Bola / Bola Tangan 4 lawan 4 di lapangan diperkecil dengan gawang cone (aturan semua anggota wajib menyentuh bola sebelum mencetak gol)."
        },
        pembelajaranAlternatif: "Menggunakan bola karet/bola ukuran 4 pada halaman sekolah jika lapangan sepak bola penuh.",
        kktp: "Mampu melakukan kombinasi passing, kontrol, dan dribbling bola secara terkontrol serta bekerja sama dalam tim.",
        kataKunci: ["Permainan Invasi", "Sepak Bola Mini", "Bola Tangan", "Menggiring", "Mengoper"]
      },
      {
        unitNumber: 2,
        title: "Unit 2: Aktivitas Variasi dan Kombinasi Pola Gerak Dasar dalam Permainan Net",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu mempraktikkan variasi dan kombinasi pola gerak dasar lokomotor, nonlokomotor, dan manipulatif dalam permainan net (bola voli mini / bulu tangkis modifikasi).",
        tujuanPembelajaran: [
          "Menjelaskan dan mempraktikkan variasi gerak passing bawah dan passing atas menggunakan bola voli ringan/spons.",
          "Mempraktikkan kombinasi gerak melangkah, mengayun lengan, dan memukul bola/kok melewati net/tali rentang."
        ],
        pokokMateri: [
          "Variasi dan kombinasi passing bawah dan passing atas bola voli mini",
          "Permainan net modifikasi menggunakan tali rafia/net rendah"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Melambungkan bola dan melakukan passing bawah perorangan di tempat serta berpasangan.",
          aktivitas2: "Melakukan passing bawah dan passing atas melewati tali yang direntangkan setinggi 1,5 meter.",
          aktivitas3Permainan: "Permainan Bola Voli Tangkap-Pantul-Passing 3 lawan 3 melewati net modifikasi."
        },
        pembelajaranAlternatif: "Menggunakan bola voli spons atau bola pantai dan tali rafia berbendera sebagai pengganti net.",
        kktp: "Perkenaan bola tepat pada kedua lengan bawah yang rapat dan lurus saat passing bawah.",
        kataKunci: ["Permainan Net", "Bola Voli Mini", "Passing Bawah", "Passing Atas"]
      },
      {
        unitNumber: 3,
        title: "Unit 3: Aktivitas Variasi dan Kombinasi Pola Gerak Dasar dalam Permainan Lapangan (Kasti)",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu mempraktikkan variasi dan kombinasi gerak melempar, menangkap, memukul bola, dan berlari ke tiang hinggap dalam permainan lapangan (kasti/rounders).",
        tujuanPembelajaran: [
          "Menjelaskan dan mempraktikkan variasi dan kombinasi melempar dan menangkap bola lambung, mendatar, dan menyusur tanah.",
          "Menjelaskan dan mempraktikkan kombinasi memukul bola kasti dan berlari cepat menuju tiang hinggap."
        ],
        pokokMateri: [
          "Variasi lempar-tangkap bola kasti (lambung, datar, menggelinding)",
          "Teknik memukul bola kasti dan berlari ke tiang hinggap"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Latihan lempar-tangkap bola kasti berpasangan pada jarak 5-7 meter (lambung, datar, menyusur tanah).",
          aktivitas2: "Latihan memukul bola yang dilambungkan teman lalu berlari menuju tiang hinggap I.",
          aktivitas3Permainan: "Pertandingan Permainan Kasti dengan peraturan yang dimodifikasi (mengutamakan keselamatan dan giliran memukul bagi seluruh siswa)."
        },
        pembelajaranAlternatif: "Menggunakan bola tenis/bola kasti karet lunak dan pemukul kayu datar yang ringan.",
        kktp: "Ketepatan lempar-tangkap minimal 80% dan kemampuan memukul bola serta berlari ke tiang hinggap.",
        kataKunci: ["Permainan Lapangan", "Kasti", "Melempar", "Menangkap", "Memukul Bola"]
      },
      {
        unitNumber: 4,
        title: "Unit 4: Aktivitas Bela Diri Pencak Silat",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu mempraktikkan variasi dan kombinasi gerak dasar lokomotor dan nonlokomotor dalam seni bela diri pencak silat.",
        tujuanPembelajaran: [
          "Menjelaskan dan mempraktikkan sikap berdiri tegak, sikap hormat, sikap kuda-kuda (depan, tengah, samping), dan sikap pasang.",
          "Mempraktikkan kombinasi pola langkah, pukulan lurus, tendangan depan, dan tangkisan dasar pencak silat."
        ],
        pokokMateri: [
          "Sikap kuda-kuda dan sikap pasang pencak silat",
          "Pola langkah, pukulan depan, tendangan lurus, dan tangkisan luar/dalam"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Latihan pembentukan kuda-kuda tengah, kuda-kuda depan, dan kuda-kuda samping mengikuti aba-aba guru.",
          aktivitas2: "Kombinasi kuda-kuda tengah dengan pukulan lurus dan tangkisan atas/luar secara berirama.",
          aktivitas3Permainan: "Peragaan Rangkaian Jurus Dasar Pencak Silat Anak secara berkelompok dengan kompak."
        },
        pembelajaranAlternatif: "Dilaksanakan di aula atau halaman rumput tanpa kontak fisik (fokus pada jurus dan ketepatan kuda-kuda).",
        kktp: "Kekokohan sikap kuda-kuda dan ketepatan lintasan pukulan serta tangkisan.",
        kataKunci: ["Pencak Silat", "Kuda-Kuda", "Sikap Pasang", "Pukulan", "Tangkisan"]
      },
      {
        unitNumber: 5,
        title: "Unit 5: Aktivitas Gerak Dasar Atletik (Jalan, Lari, Lompat, dan Lempar)",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu mempraktikkan variasi dan kombinasi gerak dasar jalan cepat, lari cepat (sprint), lompat jauh, dan lempar roket/bola.",
        tujuanPembelajaran: [
          "Mempraktikkan kombinasi jalan cepat dan lari cepat (sprint 30-40 meter) dengan teknik ayunan lengan dan langkah kaki yang benar.",
          "Mempraktikkan rangkaian gerak lompat jauh (awalan, tolakan satu kaki, melayang, dan mendarat dua kaki) serta lempar turbo/roket."
        ],
        pokokMateri: [
          "Kombinasi jalan cepat dan lari cepat (sprint)",
          "Kombinasi lompat jauh (lompat katak & lompat bak pasir) dan lempar turbo"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Latihan reaksi start berdiri dilanjutkan lari cepat 30 meter.",
          aktivitas2: "Melompat melewati deretan kardus rendah dilanjutkan lompat jauh mendarat di matras/bak pasir.",
          aktivitas3Permainan: "Festival 'Kids Athletics' Beregu (Pos Lari Gawang Rendah, Pos Lompat Katak, dan Pos Lempar Roket Sasaran)."
        },
        pembelajaranAlternatif: "Membuat roket/turbo dari gulungan karton atau botol plastik berisi sedikit pasir.",
        kktp: "Ketepatan menolak dengan satu kaki terkuat dan mendarat mengeper dengan dua kaki.",
        kataKunci: ["Atletik", "Kids Athletics", "Lari Cepat", "Lompat Jauh", "Lempar Turbo"]
      },
      {
        unitNumber: 6,
        title: "Unit 6: Aktivitas Pola Gerak Dominan Senam Lantai",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu mempraktikkan kombinasi pola gerak dominan senam lantai (keseimbangan, sikap lilin, guling depan, dan guling belakang).",
        tujuanPembelajaran: [
          "Mempraktikkan gerak keseimbangan sikap pesawat terbang dan sikap lilin di atas matras.",
          "Mempraktikkan rangkaian gerak guling ke depan (forward roll) dengan tumpuan tengkuk secara aman."
        ],
        pokokMateri: [
          "Sikap keseimbangan pesawat terbang dan sikap lilin",
          "Teknik guling depan (awalan jongkok/berdiri) dan guling belakang dasar"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Latihan keseimbangan pesawat terbang (5 detik) dan sikap lilin dibantu teman memegang pergelangan kaki.",
          aktivitas2: "Latihan guling ke depan di atas matras dengan pengawasan dan bantuan guru (dagu menempel dada, tengkuk menyentuh matras).",
          aktivitas3Permainan: "Merangkaikan 3 gerakan senam lantai: Sikap Pesawat Terbang -> Guling Depan -> Berdiri Tegak Hormat."
        },
        pembelajaranAlternatif: "Menggunakan matras miring (diganjal bantal/matras lipat) untuk memudahkan siswa berguling.",
        kktp: "Keselamatan tumpuan tengkuk saat guling depan dan kemandirian berdiri di akhir gerakan.",
        kataKunci: ["Senam Lantai", "Sikap Lilin", "Guling Depan", "Pesawat Terbang"]
      },
      {
        unitNumber: 7,
        title: "Unit 7: Aktivitas Gerak Berirama & Aktivitas Air",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu mempraktikkan variasi dan kombinasi langkah kaki dan ayunan lengan berirama serta keterampilan dasar renang gaya dada.",
        tujuanPembelajaran: [
          "Mempraktikkan kombinasi langkah biasa, langkah rapat, dan langkah keseimbangan dengan ayunan satu/dua lengan.",
          "Mempraktikkan koordinasi gerakan tungkai, lengan, dan pernapasan renang gaya dada serta aturan keselamatan di air."
        ],
        pokokMateri: [
          "Rangkaian gerak langkah kaki dan ayunan lengan berirama (2x8 hitungan)",
          "Renang gaya dada dasar dan keselamatan di kolam renang"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Latihan kombinasi langkah kaki dan ayunan lengan dalam formasi barisan mengikuti musik SKJ/Senam Pelajar Pancasila.",
          aktivitas2: "Latihan koordinasi gerakan kaki dan lengan renang gaya dada dengan papan pelampung.",
          aktivitas3Permainan: "Lomba kreasi senam irama kelompok (6-8 siswa) dengan durasi 2 menit."
        },
        pembelajaranAlternatif: "Simulasi gerakan koordinasi renang gaya dada secara berpasangan di ruang olahraga bila sekolah jauh dari kolam renang.",
        kktp: "Keselarasan ritme langkah dan ayunan lengan dengan ketukan musik.",
        kataKunci: ["Gerak Berirama", "SKJ", "Renang Gaya Dada", "Koordinasi"]
      },
      {
        unitNumber: 8,
        title: "Unit 8: Aktivitas Kebugaran Jasmani & Pemeliharaan Kebersihan Alat Reproduksi",
        elemen: "Pemanfaatan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu mempraktikkan latihan kebugaran jasmani (kekuatan, daya tahan, kelincahan) serta memahami cara menjaga kebersihan alat reproduksi dan pencegahan penyakit menular/tidak menular.",
        tujuanPembelajaran: [
          "Mempraktikkan latihan kekuatan otot, daya tahan jantung-paru, dan kelincahan melalui sirkuit kebugaran.",
          "Menjelaskan cara memelihara kebersihan dan kesehatan alat reproduksi serta pencegahan penyakit menular (flu, demam berdarah, diare) dan tidak menular."
        ],
        pokokMateri: [
          "Latihan kekuatan (push-up/sit-up), daya tahan (lari jogging/lompat tali), dan kelincahan (shuttle run)",
          "Pemeliharaan kebersihan alat reproduksi serta pencegahan penyakit menular dan tidak menular"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Praktik Sirkuit Kebugaran Jasmani 4 Pos (Pos 1: Sit-up, Pos 2: Shuttle Run 4x5m, Pos 3: Lompat Tali, Pos 4: Squat Thrust).",
          aktivitas2: "Diskusi kelompok mengenai cara menjaga kebersihan pakaian dalam, toilet bersih, dan kebiasaan cuci tangan.",
          aktivitas3Permainan: "Kuis Kelompok 'Duta Kesehatan Sekolah' dan penyusunan poster mini hidup sehat."
        },
        pembelajaranAlternatif: "Menggunakan lembar kerja bergambar edukatif resmi Kemendikbudristek untuk materi kesehatan.",
        kktp: "Ketercapaian kebugaran jasmani pada tiap pos dan pemahaman langkah menjaga kebersihan diri.",
        kataKunci: ["Kebugaran Jasmani", "Shuttle Run", "Kesehatan Reproduksi", "Pencegahan Penyakit"]
      }
    ]
  },
  V: {
    grade: "V",
    kelasLabel: "Kelas V SD/MI",
    fase: "Fase C",
    bookTitle: "Buku Panduan Guru Pendidikan Jasmani, Olahraga, dan Kesehatan untuk SD/MI Kelas V",
    authors: "Muhajir & Agus Gunawan",
    publisher: "Pusat Perbukuan, BSKAP Kemendikbudristek (SIBI)",
    isbn: "978-602-244-880-8",
    editionYear: "Cetakan Kurikulum Merdeka (SIBI)",
    sibiCatalogUrl: "https://buku.kemdikbud.go.id/katalog?search=Pendidikan+Jasmani+Kelas+V",
    elemenRingkasan:
      "Fase C Kelas V sesuai Buku Panduan Guru PJOK SIBI memfokuskan pada modifikasi pola gerak dasar dan keterampilan gerak dalam Permainan Invasi, Permainan Net, Permainan Lapangan, Bela Diri Pencak Silat, Atletik, Senam Lantai, Gerak Berirama & Air, serta Kebugaran Jasmani dan Bahaya Merokok, Miras, & NAPZA.",
    units: [
      {
        unitNumber: 1,
        title: "Unit 1: Aktivitas Permainan Invasi (Sepak Bola & Bola Tangan/Basket Modifikasi)",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik menyesuaikan dan memodifikasi keterampilan gerak melintasi berbagai situasi gerak dalam permainan invasi.",
        tujuanPembelajaran: [
          "Mempraktikkan modifikasi pola gerak dasar menendang/mengumpan, menghentikan, dan menggiring bola dalam permainan sepak bola.",
          "Mempraktikkan modifikasi pola gerak dasar melempar (chest pass, bounce pass, overhead pass), menangkap, dan menggiring bola dalam bola tangan/basket mini."
        ],
        pokokMateri: [
          "Modifikasi gerak dasar passing, kontrol, dan dribbling sepak bola",
          "Modifikasi gerak dasar passing dan dribbling bola tangan / bola basket mini"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Latihan segitiga passing dan bergerak mencari ruang kosong (passing and move).",
          aktivitas2: "Kombinasi menggiring bola melewati bek pasif lalu melakukan operan dinding (wall pass) dan tembakan ke gawang/ring.",
          aktivitas3Permainan: "Permainan Invasi Modifikasi 5 lawan 5 (Zona Target / Gawang Ganda) yang melatih taktik kerja sama tim."
        },
        pembelajaranAlternatif: "Menggunakan keranjang plastik yang diikat pada tiang sebagai pengganti ring basket.",
        kktp: "Ketepatan teknik operan, penguasaan bola saat bergerak, dan pengambilan keputusan mengoper ke teman yang bebas.",
        kataKunci: ["Modifikasi Permainan Invasi", "Passing", "Dribbling", "Chest Pass", "Kerja Sama Tim"]
      },
      {
        unitNumber: 2,
        title: "Unit 2: Aktivitas Permainan Net (Bola Voli Mini & Bulu Tangkis)",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu mempraktikkan modifikasi pola gerak dasar dalam permainan net (bola voli dan bulu tangkis).",
        tujuanPembelajaran: [
          "Mempraktikkan modifikasi pola gerak dasar passing bawah, passing atas, dan servis bawah dalam permainan bola voli mini.",
          "Mempraktikkan kombinasi gerak langkah kaki (footwork) dan pukulan servis/lob dalam permainan bulu tangkis modifikasi."
        ],
        pokokMateri: [
          "Passing bawah, passing atas, dan servis bawah bola voli mini",
          "Pukulan forehand, backhand, dan servis bulu tangkis"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Latihan passing bawah dan passing atas berpasangan serta berkelompok dalam formasi lingkaran.",
          aktivitas2: "Latihan servis bawah melewati net dari jarak bertahap (4m, 5m, 6m).",
          aktivitas3Permainan: "Permainan Bola Voli Mini 4 lawan 4 dengan aturan minimal 2 kali sentuhan sebelum bola diseberangkan."
        },
        pembelajaranAlternatif: "Menggunakan bola voli ukuran 4 atau bola karet ringan agar lengan siswa tidak sakit.",
        kktp: "Keberhasilan servis bawah melewati net dan kontrol arah bola saat passing.",
        kataKunci: ["Permainan Net", "Servis Bawah", "Passing Atas", "Passing Bawah", "Bola Voli Mini"]
      },
      {
        unitNumber: 3,
        title: "Unit 3: Aktivitas Permainan Lapangan (Bola Kasti / Rounders)",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu mempraktikkan modifikasi pola gerak dasar melempar, menangkap, memukul bola, dan berlari dalam permainan lapangan.",
        tujuanPembelajaran: [
          "Mempraktikkan kombinasi melempar dan menangkap bola kasti dalam berbagai ketinggian dan arah secara cepat.",
          "Mempraktikkan teknik memukul bola arah mendatar/melambung dan strategi berlari antar tiang hinggap."
        ],
        pokokMateri: [
          "Kombinasi lempar-tangkap bola cepat untuk mematikan lawan",
          "Variasi pukulan bola kasti dan taktik lari tiang hinggap"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Drill lempar-tangkap segitiga cepat dan latihan mematikan pelari dengan menyentuhkan/melempar bola lunak.",
          aktivitas2: "Latihan memukul bola ke arah ruang kosong yang ditentukan (sektor kiri, tengah, kanan).",
          aktivitas3Permainan: "Pertandingan Kasti Regu Penjaga vs Regu Pemukul dengan penerapan strategi kerja sama."
        },
        pembelajaranAlternatif: "Memukul bola yang diletakkan di atas cone tinggi (tee-ball) bagi siswa yang masih kesulitan memukul bola lambung.",
        kktp: "Koordinasi memukul bola dan kecepatan pengambilan keputusan saat berlari ke tiang hinggap.",
        kataKunci: ["Permainan Kasti", "Rounders", "Tiang Hinggap", "Memukul Bola"]
      },
      {
        unitNumber: 4,
        title: "Unit 4: Aktivitas Bela Diri Pencak Silat",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu mempraktikkan variasi dan kombinasi gerak dasar kuda-kuda, pola langkah, pukulan, tendangan, tangkisan, dan elakan dalam pencak silat.",
        tujuanPembelajaran: [
          "Mempraktikkan variasi dan kombinasi pola langkah dengan pukulan dan tangkisan pencak silat.",
          "Mempraktikkan kombinasi tendangan (depan/sabit) dengan elakan secara terkontrol dan sportif."
        ],
        pokokMateri: [
          "Kombinasi pola langkah, pukulan, dan tangkisan",
          "Kombinasi tendangan dan elakan pencak silat"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Latihan pola langkah segiempat dan langkah huruf U dikombinasikan dengan pukulan lurus dan bandul.",
          aktivitas2: "Latihan berpasangan tanpa kontak: Siswa A melakukan pukulan lurus, Siswa B melakukan tangkisan luar/elakan samping secara bergantian.",
          aktivitas3Permainan: "Peragaan Jurus Tunggal Dasar IPSI (Tangan Kosong) secara serempak."
        },
        pembelajaranAlternatif: "Menggunakan target bantalan tangan (hand pad dari kardus berlapis busa) untuk latihan akurasi tendangan.",
        kktp: "Ketepatan koordinasi langkah, serangan, dan belaan serta pengendalian diri.",
        kataKunci: ["Pencak Silat", "Pola Langkah", "Elakan", "Tendangan", "Tangkisan"]
      },
      {
        unitNumber: 5,
        title: "Unit 5: Aktivitas Gerak Dasar Atletik (Start, Lari Estafet, dan Lompat Jauh)",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu mempraktikkan modifikasi pola gerak dasar start, lari jarak pendek, lari sambung/estafet, dan lompat jauh.",
        tujuanPembelajaran: [
          "Mempraktikkan teknik start jongkok (aba-aba Bersedia, Siap, Ya), lari jarak pendek, dan pergantian tongkat estafet (visual & non-visual).",
          "Mempraktikkan tahapan lompat jauh gaya menggantung/jongkok (awalan, tolakan, melayang, dan mendarat)."
        ],
        pokokMateri: [
          "Start jongkok, lari cepat, dan lari sambung/estafet",
          "Lompat jauh (awalan, tolakan, melayang, mendarat)"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Latihan start jongkok dan akselerasi lari 20 meter dilanjutkan latihan memberi dan menerima tongkat estafet.",
          aktivitas2: "Latihan lari awalan 7-9 langkah, menolak pada papan tumpu, dan mendarat dua kaki di bak pasir/matras.",
          aktivitas3Permainan: "Lomba Lari Estafet Beregu 4 x 25 meter dan Kompetisi Lompat Jauh Beregu."
        },
        pembelajaranAlternatif: "Menggunakan gulungan koran atau pipa paralon pendek sebagai tongkat estafet.",
        kktp: "Ketepatan pergantian tongkat di zona wessel dan teknik tolakan serta pendaratan lompat jauh.",
        kataKunci: ["Start Jongkok", "Lari Estafet", "Tongkat Estafet", "Lompat Jauh"]
      },
      {
        unitNumber: 6,
        title: "Unit 6: Aktivitas Senam Lantai (Guling Depan, Guling Belakang, & Lompat Kangkang)",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu mempraktikkan kombinasi pola gerak dominan senam lantai tanpa alat dan dengan alat (peti lompat).",
        tujuanPembelajaran: [
          "Mempraktikkan kombinasi gerak guling depan (forward roll) dan guling belakang (backward roll) di atas matras.",
          "Mempraktikkan gerak tolakan dua kaki dan lompat kangkang melewati rintangan/peti lompat rendah secara aman."
        ],
        pokokMateri: [
          "Kombinasi guling depan dan guling belakang",
          "Lompat kangkang di atas peti lompat / punggung teman membungkuk aman"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Latihan guling depan dilanjutkan langsung dengan sikap keseimbangan dan guling belakang di atas matras.",
          aktivitas2: "Latihan awalan lari pendek, menolak dengan dua kaki, bertumpu kedua tangan pada peti lompat rendah, dan membuka kaki (lompat kangkang).",
          aktivitas3Permainan: "Unjuk Kerja Rangkaian Senam Lantai 3 Gerakan Berkesinambungan."
        },
        pembelajaranAlternatif: "Menggunakan tumpukan matras tebal sebagai pengganti peti lompat demi keamanan siswa.",
        kktp: "Kelancaran putaran badan saat berguling dan pendaratan dua kaki mengeper.",
        kataKunci: ["Guling Depan", "Guling Belakang", "Lompat Kangkang", "Peti Lompat"]
      },
      {
        unitNumber: 7,
        title: "Unit 7: Aktivitas Gerak Berirama & Aktivitas Air",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu mempraktikkan kombinasi rangkaian langkah kaki dan ayunan lengan berirama serta renang gaya dada dan keselamatan di air.",
        tujuanPembelajaran: [
          "Mempraktikkan rangkaian variasi dan kombinasi gerak langkah kaki dan ayunan lengan mengikuti irama musik (pemanasan, inti, pendinginan).",
          "Mempraktikkan koordinasi renang gaya dada jarak 10-15 meter dan dasar penyelamatan diri di air."
        ],
        pokokMateri: [
          "Rangkaian gerak berirama (pemanasan, inti, pendinginan)",
          "Koordinasi renang gaya dada dan dasar keselamatan di air"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Menyusun dan mempraktikkan koreografi senam irama 4x8 hitungan yang memadukan langkah biasa, langkah rapat, langkah silang, dan ayunan lengan.",
          aktivitas2: "Latihan koordinasi 1 kali tarikan lengan, 1 kali ambil napas, dan 1 kali tendangan kaki katak pada renang gaya dada.",
          aktivitas3Permainan: "Pentas Kreasi Senam Irama Beregu Antar-Kelompok."
        },
        pembelajaranAlternatif: "Praktik penyelamatan menggunakan tali/ban pelampung dari tepi kolam (reach and throw).",
        kktp: "Keserasian gerak dengan irama musik dan pemahaman prosedur keselamatan air.",
        kataKunci: ["Koreografi Senam Irama", "Langkah Silang", "Renang Gaya Dada", "Keselamatan Air"]
      },
      {
        unitNumber: 8,
        title: "Unit 8: Aktivitas Kebugaran Jasmani & Bahaya Merokok, Miras, dan NAPZA",
        elemen: "Pemanfaatan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu mempraktikkan latihan kebugaran jasmani terkait kesehatan (daya tahan jantung-paru, kekuatan, kelenturan, komposisi tubuh) dan memahami bahaya merokok, minuman keras, serta NAPZA.",
        tujuanPembelajaran: [
          "Mempraktikkan latihan daya tahan jantung dan paru-paru (cardiorespiratory endurance) serta menghitung denyut nadi latihan.",
          "Menjelaskan bahaya merokok (termasuk rokok elektrik/vape), minuman keras, dan NAPZA bagi kesehatan tubuh serta cara menolak ajakan negatif."
        ],
        pokokMateri: [
          "Latihan daya tahan jantung-paru (interval training ringan, lompat tali, lari keliling) dan penghitungan denyut nadi",
          "Bahaya rokok, minuman keras, dan NAPZA serta cara menghindarinya"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Menghitung denyut nadi istirahat di pergelangan tangan/leher selama 60 detik, melakukan sirkuit latihan daya tahan, lalu menghitung denyut nadi latihan.",
          aktivitas2: "Analisis studi kasus dan diskusi kelompok tentang kandungan berbahaya dalam rokok dan NAPZA sesuai Buku Panduan PJOK SIBI.",
          aktivitas3Permainan: "Kampanye Poster & Deklarasi 'Pelajar Sehat Tanpa Rokok dan NAPZA'."
        },
        pembelajaranAlternatif: "Simulasi bermain peran (role-play) cara tegas menolak ajakan merokok atau mencoba zat berbahaya.",
        kktp: "Mampu menghitung denyut nadi secara benar dan menjelaskan minimal 4 dampak buruk rokok/NAPZA serta cara menghindarinya.",
        kataKunci: ["Daya Tahan Jantung-Paru", "Denyut Nadi", "Bahaya Merokok", "Bahaya NAPZA"]
      }
    ]
  },
  VI: {
    grade: "VI",
    kelasLabel: "Kelas VI SD/MI",
    fase: "Fase C",
    bookTitle: "Buku Panduan Guru Pendidikan Jasmani, Olahraga, dan Kesehatan untuk SD/MI Kelas VI",
    authors: "Muhajir & Tri Hadi Karyono",
    publisher: "Pusat Perbukuan, BSKAP Kemendikbudristek (SIBI)",
    isbn: "978-602-244-882-2",
    editionYear: "Cetakan Kurikulum Merdeka (SIBI)",
    sibiCatalogUrl: "https://buku.kemdikbud.go.id/katalog?search=Pendidikan+Jasmani+Kelas+VI",
    elemenRingkasan:
      "Fase C Kelas VI menekankan penerapan strategi dan modifikasi gerak dalam Permainan Invasi, Net, Lapangan, Bela Diri Pencak Silat, Atletik, Rangkaian Senam Lantai, Gerak Berirama & Renang Penyelamatan, serta Pengukuran Kebugaran Jasmani (TKJI) dan Pertolongan Pertama Cedera Olahraga (P3K/RICE).",
    units: [
      {
        unitNumber: 1,
        title: "Unit 1: Aktivitas Modifikasi Pola Gerak Dasar dalam Permainan Invasi (Bola Basket & Sepak Bola)",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik memprediksi dan menguji efektivitas penerapan strategi gerak dalam berbagai situasi permainan invasi.",
        tujuanPembelajaran: [
          "Mempraktikkan kombinasi menggiring (dribbling), mengoper (chest/bounce/overhead pass), dan menembak (shooting/lay-up dasar) dalam permainan bola basket modifikasi.",
          "Menerapkan strategi menyerang dan bertahan sederhana secara sportif dalam permainan sepak bola dan bola basket mini."
        ],
        pokokMateri: [
          "Kombinasi dribbling, passing, dan shooting bola basket mini",
          "Taktik kerja sama penyerangan dan pertahanan dalam permainan invasi"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Latihan kombinasi dribble maju-mundur, operan dada (chest pass), dan tembakan ke ring/sasaran.",
          aktivitas2: "Latihan situasi 3 lawan 2 (menyerang unggul jumlah pemain) untuk melatih pengambilan keputusan mengoper atau menembak.",
          aktivitas3Permainan: "Turnamen Mini Bola Basket / Sepak Bola Modifikasi 5 lawan 5 dengan perangkat wasit dan pencatat skor dari siswa."
        },
        pembelajaranAlternatif: "Menggunakan lapangan multifungsi dengan target papan pantul atau keranjang modifikasi.",
        kktp: "Efektivitas kombinasi gerak manipulatif dan penerapan kerja sama tim serta kepemimpinan.",
        kataKunci: ["Bola Basket Mini", "Dribbling", "Shooting", "Strategi Permainan Invasi"]
      },
      {
        unitNumber: 2,
        title: "Unit 2: Aktivitas Modifikasi Pola Gerak Dasar dalam Permainan Net (Bola Voli & Bulu Tangkis)",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu mempraktikkan variasi dan kombinasi keterampilan gerak serta strategi penempatan bola dalam permainan net.",
        tujuanPembelajaran: [
          "Mempraktikkan kombinasi servis bawah/atas, passing bawah, passing atas, dan smes ringan dalam permainan bola voli mini.",
          "Mempraktikkan kombinasi pukulan servis, lob, dropshot, dan gerak langkah kaki dalam permainan bulu tangkis."
        ],
        pokokMateri: [
          "Rangkaian servis, passing bawah, dan passing atas bola voli",
          "Kombinasi footwork dan pukulan bulu tangkis ke area kosong lawan"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Latihan berantai: Servis bawah -> diterima dengan Passing Bawah -> diumpan dengan Passing Atas.",
          aktivitas2: "Latihan mengarahkan bola/kok ke target sasaran (sudut depan dan belakang lapangan lawan).",
          aktivitas3Permainan: "Pertandingan Bola Voli Mini / Bulu Tangkis Ganda dengan sistem poin reli."
        },
        pembelajaranAlternatif: "Bermain bulu tangkis di aula atau halaman terlindung angin menggunakan kok plastik yang lebih stabil.",
        kktp: "Kemampuan mempertahankan reli minimal 3-5 pukulan melewati net.",
        kataKunci: ["Reli Bola Voli", "Bulu Tangkis", "Penempatan Bola", "Footwork"]
      },
      {
        unitNumber: 3,
        title: "Unit 3: Aktivitas Modifikasi Pola Gerak Dasar dalam Permainan Lapangan (Kasti / Rounders)",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu menerapkan keterampilan gerak dan taktik regu pemukul serta regu penjaga dalam permainan lapangan.",
        tujuanPembelajaran: [
          "Mempraktikkan kombinasi melempar, menangkap, dan menjaga base/tiang hinggap secara taktis.",
          "Mempraktikkan variasi pukulan terarah dan lari strategi mencetak nilai pulang (home run) dalam permainan kasti/rounders."
        ],
        pokokMateri: [
          "Strategi pertahanan regu penjaga (lempar-tangkap cepat & bakar ruang)",
          "Strategi penyerangan regu pemukul (pukulan terarah & lari tiang hinggap)"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Simulasi taktik regu penjaga mengoper bola berantai ke ruang bakar/base.",
          aktivitas2: "Latihan memukul bola rendah menyusur tanah agar sulit ditangkap lawan lalu berlari cepat.",
          aktivitas3Permainan: "Pertandingan Kasti / Rounders Penuh dengan penerapan aturan resmi yang disederhanakan."
        },
        pembelajaranAlternatif: "Dapat dimodifikasi menjadi permainan 'Kickball' (bola ditendang bukan dipukul) jika halaman sekolah sempit.",
        kktp: "Penguasaan teknik lempar-tangkap-pukul dan komunikasi taktis antar anggota regu.",
        kataKunci: ["Rounders", "Kasti", "Strategi Regu Penjaga", "Regu Pemukul"]
      },
      {
        unitNumber: 4,
        title: "Unit 4: Aktivitas Bela Diri Pencak Silat (Rangkaian Serangan dan Pertahanan)",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu merangkaikan variasi dan kombinasi gerak dasar serangan (pukulan, tendangan) dan pertahanan (tangkisan, elakan, hindaran) dalam pencak silat.",
        tujuanPembelajaran: [
          "Mempraktikkan rangkaian gerak langkah, tangkisan, elakan, dan serangan balasan (pukulan/tendangan) secara terkoordinasi.",
          "Menampilkan rangkaian jurus pencak silat berpasangan/berkelompok dengan menjunjung tinggi nilai budi pekerti luhur."
        ],
        pokokMateri: [
          "Rangkaian gerak belaan (tangkisan & elakan) dilanjutkan serangan pukulan/tendangan",
          "Peragaan jurus pencak silat berkelompok"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Latihan rangkaian 4 jurus: Kuda-kuda -> Tangkisan Dalam -> Pukulan Lurus -> Tendangan Depan -> Sikap Pasang.",
          aktivitas2: "Latihan koreografi serang-bela berpasangan dengan jarak aman (kontrol penuh).",
          aktivitas3Permainan: "Gelar Karya Seni Bela Diri Pencak Silat Kelas VI."
        },
        pembelajaranAlternatif: "Fokus pada seni gerak jurus tunggal baku dengan iringan ketukan kendang/hitungan.",
        kktp: "Ketegasan sikap kuda-kuda, kelancaran rangkai jurus, dan pengendalian emosi.",
        kataKunci: ["Jurus Pencak Silat", "Serang-Bela", "Elakan", "Sportivitas"]
      },
      {
        unitNumber: 5,
        title: "Unit 5: Aktivitas Atletik (Kombinasi Jalan, Lari, Lompat, dan Lempar)",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu mempraktikkan kombinasi gerak jalan, lari cepat, lompat jauh, dan tolak peluru/lempar roket.",
        tujuanPembelajaran: [
          "Mempraktikkan kombinasi lari cepat, melewati rintangan, dan lompat jauh gaya menggantung.",
          "Mempraktikkan kombinasi awalan menyamping dan menolak bola berat/peluru karet (tolak peluru anak)."
        ],
        pokokMateri: [
          "Lompat jauh gaya menggantung (hang style)",
          "Dasar tolak peluru anak / lempar roket dengan awalan"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Latihan koordinasi 4 tahap lompat jauh: Awalan cepat -> Tolakan kuat -> Sikap menggantung di udara -> Mendarat mengeper.",
          aktivitas2: "Latihan menolak bola modifikasi (bola karet berisi pasir/bola tenis) dari samping leher dengan sudut tolakan 45 derajat.",
          aktivitas3Permainan: "Kompetisi Panca Lomba Atletik Anak (Sprint 40m, Lari Gawang, Lompat Jauh, Lempar Turbo, Estafet)."
        },
        pembelajaranAlternatif: "Menggunakan bola kasti/bola plastik berisi pasir sebagai peluru modifikasi yang aman.",
        kktp: "Teknik menolak (bukan melempar) pada tolak peluru anak dan koordinasi lompat jauh.",
        kataKunci: ["Lompat Jauh Gaya Menggantung", "Tolak Peluru Anak", "Panca Lomba Atletik"]
      },
      {
        unitNumber: 6,
        title: "Unit 6: Aktivitas Senam Lantai (Rangkaian Guling Depan, Guling Belakang, & Meroda)",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu mempraktikkan rangkaian tiga pola gerak dominan senam lantai secara berkesinambungan.",
        tujuanPembelajaran: [
          "Mempraktikkan rangkaian gerak keseimbangan, guling depan, dan guling belakang di atas matras.",
          "Mempraktikkan gerak bertumpu tangan menyamping (meroda/cartwheel dasar) atau lompat harimau rendah secara aman."
        ],
        pokokMateri: [
          "Rangkaian senam lantai (keseimbangan, guling depan, guling belakang)",
          "Pengenalan gerak meroda (cartwheel) dengan bantuan"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Latihan kelenturan punggung, bahu, dan pergelangan tangan dilanjutkan drill guling depan-belakang.",
          aktivitas2: "Latihan bertumpu dua tangan menyamping melewati garis matras (persiapan meroda) dengan bantuan teman/guru.",
          aktivitas3Permainan: "Ujian Praktik Rangkaian Senam Lantai 3 Gerakan Pilihan."
        },
        pembelajaranAlternatif: "Siswa dapat memilih kombinasi gerakan sesuai tingkat kemampuan motoriknya (diferensiasi proses).",
        kktp: "Kesinambungan antar gerakan senam, kerapian postur, dan keselamatan pendaratan.",
        kataKunci: ["Rangkaian Senam Lantai", "Meroda", "Guling Belakang", "Keseimbangan"]
      },
      {
        unitNumber: 7,
        title: "Unit 7: Aktivitas Gerak Berirama & Aktivitas Air (Renang & Penyelamatan)",
        elemen: "Keterampilan & Pengetahuan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu merangkaikan variasi dan kombinasi gerak berirama kreatif serta keterampilan renang dan dasar penyelamatan di air.",
        tujuanPembelajaran: [
          "Merancang dan menampilkan rangkaian senam irama/SKJ secara berkelompok dengan transisi formasi yang rapi.",
          "Mempraktikkan koordinasi renang gaya dada/gaya punggung dasar serta prosedur pertolongan keselamatan di air."
        ],
        pokokMateri: [
          "Kreasi rangkaian senam irama dan Senam Kesegaran Jasmani (SKJ)",
          "Keterampilan renang dan dasar penyelamatan di air (Water Safety)"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Latihan kreasi formasi barisan (sejajar, huruf V, lingkaran) dalam rangkaian senam irama 8x8 hitungan.",
          aktivitas2: "Simulasi pertolongan korban di air dari darat menggunakan galah, handuk, atau pelampung tanpa ikut terjun ke air berbahaya.",
          aktivitas3Permainan: "Festival Senam Kreasi Pelajar Pancasila Kelas VI."
        },
        pembelajaranAlternatif: "Praktik simulasi pertolongan pertama keram otot dan keselamatan air di aula sekolah.",
        kktp: "Kreativitas rangkaian gerak, ketepatan irama, dan penguasaan prosedur penyelamatan air.",
        kataKunci: ["Senam Kreasi", "SKJ", "Penyelamatan di Air", "Water Safety"]
      },
      {
        unitNumber: 8,
        title: "Unit 8: Pengukuran Kebugaran Jasmani (TKJI) & Pertolongan Pertama Cedera (P3K / RICE)",
        elemen: "Pemanfaatan Gerak",
        alokasiWaktu: "3 Pertemuan (9 JP)",
        capaianPembelajaran:
          "Peserta didik mampu mempraktikkan latihan dan pengukuran kebugaran jasmani terkait keterampilan (kecepatan, kelincahan, keseimbangan, koordinasi) serta memahami penanganan cedera ringan (P3K) dan perubahan fisik masa pubertas.",
        tujuanPembelajaran: [
          "Mempraktikkan latihan dan tes pengukuran kebugaran jasmani anak (Sprint 40m, Baring Duduk 30 detik, Loncat Tegak, Lari 600m).",
          "Menjelaskan dan mempraktikkan prinsip pertolongan pertama pada cedera olahraga (metode RICE: Rest, Ice, Compression, Elevation) serta cara menyikapi masa pubertas secara sehat."
        ],
        pokokMateri: [
          "Latihan dan Pengukuran Tes Kebugaran Jasmani Indonesia (TKJI) usia 10-12 tahun",
          "Pertolongan Pertama pada Kecelakaan/Cedera (P3K - Prinsip RICE) & Kesehatan Masa Pubertas"
        ],
        aktivitasPembelajaran: {
          aktivitas1: "Pelaksanaan pos pengukuran TKJI secara berpasangan (mencatat hasil lari cepat, sit-up, vertical jump, dan lari 600m).",
          aktivitas2: "Simulasi praktik penanganan cedera terkilir/memar menggunakan es batu dan perban elastis (metode RICE) serta pembalutan luka lecet.",
          aktivitas3Permainan: "Simulasi Tim Medis Olahraga Cilik & Evaluasi Kartu Kebugaran Mandiri."
        },
        pembelajaranAlternatif: "Menggunakan kain segitiga (mitela) atau syal pramuka untuk latihan pembalutan P3K.",
        kktp: "Mampu melakukan pengukuran TKJI dengan jujur dan mempraktikkan tahapan penanganan cedera RICE.",
        kataKunci: ["TKJI", "Kebugaran Keterampilan", "P3K", "Metode RICE", "Pubertas"]
      }
    ]
  }
};

export function getSibiBookByGrade(gradeInput: string): SibiBookGrade {
  const normalized = String(gradeInput || "IV")
    .toUpperCase()
    .replace(/[^IVX1-6]/g, "");
  if (normalized.includes("VI") || normalized.includes("6")) return SIBI_PJOK_BOOKS["VI"];
  if (normalized.includes("V") || normalized.includes("5")) return SIBI_PJOK_BOOKS["V"];
  if (normalized.includes("IV") || normalized.includes("4")) return SIBI_PJOK_BOOKS["IV"];
  if (normalized.includes("III") || normalized.includes("3")) return SIBI_PJOK_BOOKS["III"];
  if (normalized.includes("II") || normalized.includes("2")) return SIBI_PJOK_BOOKS["II"];
  if (normalized.includes("I") || normalized.includes("1")) return SIBI_PJOK_BOOKS["I"];
  return SIBI_PJOK_BOOKS["IV"];
}
