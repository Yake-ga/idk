CREATE DATABASE IF NOT EXISTS classhub_db;
USE classhub_db;

DROP TABLE IF EXISTS tb_log_aktivitas;
DROP TABLE IF EXISTS tb_notifikasi;
DROP TABLE IF EXISTS tb_pengajuan_hapus;
DROP TABLE IF EXISTS tb_log_hapus;
DROP TABLE IF EXISTS tb_pengajuan_peran;
DROP TABLE IF EXISTS tb_reaksi_komentar;
DROP TABLE IF EXISTS tb_reaksi_kas;
DROP TABLE IF EXISTS tb_komentar_kas;
DROP TABLE IF EXISTS tb_piket;
DROP TABLE IF EXISTS tb_kas;
DROP TABLE IF EXISTS tb_siswa;

CREATE TABLE tb_siswa (
    nis VARCHAR(20) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NULL,
    password VARCHAR(255) DEFAULT '123456',
    jenis_kelamin ENUM('L', 'P') NOT NULL,
    role ENUM('visitor', 'siswa', 'bendahara', 'sekretaris', 'ketua', 'guru', 'admin') DEFAULT 'siswa',
    status ENUM('pending', 'aktif') DEFAULT 'aktif',
    foto_profil VARCHAR(255) NULL,
    bio TEXT DEFAULT 'Siswa XI RPL SMKN 1 Jakarta',
    poin INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tb_pengajuan_peran (
    id INT AUTO_INCREMENT PRIMARY KEY,
    siswa_nis VARCHAR(20) NOT NULL,
    peran_diajukan ENUM('bendahara', 'sekretaris', 'ketua') NOT NULL,
    alasan TEXT NOT NULL,
    status ENUM('pending', 'disetujui', 'ditolak') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (siswa_nis) REFERENCES tb_siswa(nis) ON DELETE CASCADE
);

CREATE TABLE tb_pengajuan_hapus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    siswa_nis VARCHAR(20) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    alasan TEXT NOT NULL,
    status ENUM('pending', 'disetujui', 'ditolak') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (siswa_nis) REFERENCES tb_siswa(nis) ON DELETE CASCADE
);

CREATE TABLE tb_log_hapus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nis VARCHAR(20) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    alasan TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tb_notifikasi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    siswa_nis VARCHAR(20) NOT NULL,
    pengirim_nis VARCHAR(20) NULL,
    pengirim_nama VARCHAR(100) NULL,
    judul VARCHAR(150) NOT NULL,
    pesan TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (siswa_nis) REFERENCES tb_siswa(nis) ON DELETE CASCADE
);

CREATE TABLE tb_log_aktivitas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    siswa_nis VARCHAR(20) NOT NULL,
    aktivitas VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (siswa_nis) REFERENCES tb_siswa(nis) ON DELETE CASCADE
);

CREATE TABLE tb_kas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jenis ENUM('masuk', 'keluar') NOT NULL,
    nominal DECIMAL(12, 2) NOT NULL,
    keterangan TEXT NOT NULL,
    foto_nota VARCHAR(255) NULL,
    tanggal DATE NOT NULL,
    pembuat_nis VARCHAR(20) NULL,
    pembuat_nama VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tb_komentar_kas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kas_id INT NOT NULL,
    siswa_nis VARCHAR(20) NOT NULL,
    siswa_nama VARCHAR(100) NOT NULL,
    komentar TEXT NOT NULL,
    parent_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kas_id) REFERENCES tb_kas(id) ON DELETE CASCADE
);

CREATE TABLE tb_reaksi_komentar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    komentar_id INT NOT NULL,
    siswa_nis VARCHAR(20) NOT NULL,
    tipe ENUM('suka', 'dislike') NOT NULL,
    UNIQUE KEY reaksi_komentar_unik (komentar_id, siswa_nis),
    FOREIGN KEY (komentar_id) REFERENCES tb_komentar_kas(id) ON DELETE CASCADE
);

CREATE TABLE tb_reaksi_kas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kas_id INT NOT NULL,
    siswa_nis VARCHAR(20) NOT NULL,
    tipe_reaksi VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY reaksi_unik (kas_id, siswa_nis),
    FOREIGN KEY (kas_id) REFERENCES tb_siswa(nis) ON DELETE CASCADE
);

INSERT INTO tb_siswa (nis, nama, email, password, jenis_kelamin, role, status, bio, poin) VALUES
('202523180', 'Adelia Khairunissa Tofari', 'adelia@smkn1jakarta.sch.id', '123456', 'P', 'bendahara', 'aktif', 'Bendahara Kas XI RPL', 15),
('202523181', 'Adilah Hammam Akram', 'adilah@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523182', 'Adinda Afifah Putri', 'adinda@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523183', 'Adzan Ahlil Fiqri', 'adzan@smkn1jakarta.sch.id', '123456', 'L', 'admin', 'aktif', 'Admin System & Developer ClassHub', 50),
('202523184', 'Aira Saskia Sahwa', 'aira@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523185', 'Almira Rakhadhiya Aryacitadi', 'almira@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523186', 'Annisa Maharani', 'annisa@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523187', 'Annisah Agustin', 'annisah@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523188', 'Arif Raffy Fadlurahman', 'arif@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523189', 'Aryo Aji Sadewo', 'aryo@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523190', 'Cahaya', 'cahaya@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523191', 'Callyla Sakhi Faiha', 'callyla@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523192', 'Dedy Anang Setiawan', 'dedy@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523193', 'Deje Enne Dani Rosaline', 'deje@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523194', 'Dewa Nyoman Zed Zamuel Zouseuf', 'dewa@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523195', 'Fersya Wulanda', 'fersya@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523196', 'Ihsan Hafidz Assidiq', 'ihsan@smkn1jakarta.sch.id', '123456', 'L', 'ketua', 'aktif', 'Ketua Kelas XI RPL', 25),
('202523197', 'Intan Nurhikmah', 'intan@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523198', 'Ksatria Ali', 'ksatria@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523199', 'Marcellino', 'marcellino@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523200', 'Muhammad Fauzan Kamal Putra', 'fauzan@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523201', 'Muhammad Rafa Fadilah', 'rafa@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523202', 'Najwa Fajrina Ayatul Husna', 'najwa@smkn1jakarta.sch.id', '123456', 'P', 'bendahara', 'aktif', 'Bendahara Kas XI RPL', 15),
('202523203', 'Nauval Arief Hibatulloh', 'nauval@smkn1jakarta.sch.id', '123456', 'L', 'admin', 'aktif', 'Admin ClassHub XI RPL', 45),
('202523204', 'Naysheilla Bilqis Heryanto', 'naysheilla@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523205', 'Nazmu Toriq', 'nazmu@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523206', 'Qisya Awfiyah Ramadhani', 'qisya@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523207', 'Rambuana Ahmad Adnan', 'rambu@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523208', 'Rayhan Saputra', 'rayhan@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523209', 'Rayyan Irfansyah', 'rayyan@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523210', 'Rivael Lionel Messi Boryan', 'rivael@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523211', 'Saddam Qadafi Nurama', 'saddam@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523212', 'Safa Oktafianti', 'safa@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Ketua Kelas XI RPL', 5),
('202523213', 'Salsa Nabila', 'salsa@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523214', 'Siti Syeera Azzahrah', 'syeera@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5),
('202523215', 'Syadira Putri Aulia', 'syadira@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5);

INSERT INTO tb_kas (jenis, nominal, keterangan, tanggal, pembuat_nis, pembuat_nama) VALUES
('masuk', 150000.00, 'Iuran Kas Mingguan XI RPL Pertemuan 1', '2026-08-20', '202523180', 'Adelia Khairunissa Tofari'),
('keluar', 45000.00, 'Beli Spidol & Penghapus Papan Tulis Baru', '2026-08-22', '202523202', 'Najwa Fajrina Ayatul Husna');