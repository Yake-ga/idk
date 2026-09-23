require('dotenv').config()

const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const bcrypt = require('bcryptjs')
const helmet = require('helmet')
const db = require('./database/db')

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet({
    contentSecurityPolicy: false
}))

const wadahFoto = path.join(__dirname, 'uploads')
if (!fs.existsSync(wadahFoto)) {
    fs.mkdirSync(wadahFoto, { recursive: true })
}

app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

app.use(express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

async function hashPassword(password) {
    return bcrypt.hash(password, 10)
}

async function verifyPassword(candidatePassword, storedPassword) {
    if (!candidatePassword || !storedPassword) return false
    if (storedPassword.startsWith('$2')) {
        return bcrypt.compare(candidatePassword, storedPassword)
    }
    return candidatePassword === storedPassword
}

const simpanFoto = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const namaUnik = Date.now() + '-' + file.originalname
        cb(null, namaUnik)
    }
})

const uploadFile = multer({ storage: simpanFoto })

async function inisialisasiTabel() {
    try {
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS tb_siswa (
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
                )
            `)
        } catch (e) {}

        try { await db.query("ALTER TABLE tb_siswa MODIFY COLUMN role ENUM('visitor', 'siswa', 'bendahara', 'sekretaris', 'ketua', 'guru', 'admin') DEFAULT 'siswa'") } catch (e) {}
        try { await db.query('ALTER TABLE tb_siswa ADD COLUMN foto_profil VARCHAR(255) NULL') } catch (e) {}
        try { await db.query("ALTER TABLE tb_siswa ADD COLUMN bio TEXT DEFAULT 'Siswa XI RPL SMKN 1 Jakarta'") } catch (e) {}
        try { await db.query('ALTER TABLE tb_siswa ADD COLUMN poin INT DEFAULT 0') } catch (e) {}
        try { await db.query('ALTER TABLE tb_siswa ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP') } catch (e) {}

        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS tb_pengajuan_peran (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    siswa_nis VARCHAR(20) NOT NULL,
                    peran_diajukan ENUM('bendahara', 'sekretaris', 'ketua') NOT NULL,
                    alasan TEXT NOT NULL,
                    status ENUM('pending', 'disetujui', 'ditolak') DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (siswa_nis) REFERENCES tb_siswa(nis) ON DELETE CASCADE
                )
            `)
        } catch (e) {}

        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS tb_pengajuan_hapus (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    siswa_nis VARCHAR(20) NOT NULL,
                    nama VARCHAR(100) NOT NULL,
                    alasan TEXT NOT NULL,
                    status ENUM('pending', 'disetujui', 'ditolak') DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (siswa_nis) REFERENCES tb_siswa(nis) ON DELETE CASCADE
                )
            `)
        } catch (e) {}

        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS tb_pengajuan_reset_password (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    siswa_nis VARCHAR(20) NOT NULL,
                    nama VARCHAR(100) NOT NULL,
                    status ENUM('pending', 'selesai') DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (siswa_nis) REFERENCES tb_siswa(nis) ON DELETE CASCADE
                )
            `)
        } catch (e) {}

        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS tb_log_hapus (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nis VARCHAR(20) NOT NULL,
                    nama VARCHAR(100) NOT NULL,
                    alasan TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `)
        } catch (e) {}

        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS tb_notifikasi (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    siswa_nis VARCHAR(20) NOT NULL,
                    pengirim_nis VARCHAR(20) NULL,
                    pengirim_nama VARCHAR(100) NULL,
                    judul VARCHAR(150) NOT NULL,
                    pesan TEXT NOT NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (siswa_nis) REFERENCES tb_siswa(nis) ON DELETE CASCADE
                )
            `)
        } catch (e) {}

        try { await db.query('ALTER TABLE tb_notifikasi ADD COLUMN pengirim_nis VARCHAR(20) NULL') } catch (e) {}
        try { await db.query('ALTER TABLE tb_notifikasi ADD COLUMN pengirim_nama VARCHAR(100) NULL') } catch (e) {}

        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS tb_log_aktivitas (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    siswa_nis VARCHAR(20) NOT NULL,
                    aktivitas VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (siswa_nis) REFERENCES tb_siswa(nis) ON DELETE CASCADE
                )
            `)
        } catch (e) {}

        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS tb_kas (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    jenis ENUM('masuk', 'keluar') NOT NULL,
                    nominal DECIMAL(12, 2) NOT NULL,
                    keterangan TEXT NOT NULL,
                    foto_nota VARCHAR(255) NULL,
                    tanggal DATE NOT NULL,
                    pembuat_nis VARCHAR(20) NULL,
                    pembuat_nama VARCHAR(100) NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `)
        } catch (e) {}

        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS tb_komentar_kas (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    kas_id INT NOT NULL,
                    siswa_nis VARCHAR(20) NOT NULL,
                    siswa_nama VARCHAR(100) NOT NULL,
                    komentar TEXT NOT NULL,
                    parent_id INT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (kas_id) REFERENCES tb_kas(id) ON DELETE CASCADE
                )
            `)
        } catch (e) {}

        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS tb_reaksi_komentar (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    komentar_id INT NOT NULL,
                    siswa_nis VARCHAR(20) NOT NULL,
                    tipe ENUM('suka', 'dislike') NOT NULL,
                    UNIQUE KEY reaksi_komentar_unik (komentar_id, siswa_nis),
                    FOREIGN KEY (komentar_id) REFERENCES tb_komentar_kas(id) ON DELETE CASCADE
                )
            `)
        } catch (e) {}

        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS tb_reaksi_kas (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    kas_id INT NOT NULL,
                    siswa_nis VARCHAR(20) NOT NULL,
                    tipe_reaksi VARCHAR(20) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY reaksi_unik (kas_id, siswa_nis),
                    FOREIGN KEY (kas_id) REFERENCES tb_kas(id) ON DELETE CASCADE
                )
            `)
        } catch (e) {}

        try {
            const [columnsPiket] = await db.query('SHOW COLUMNS FROM tb_piket')
            const punyaKolomLama = columnsPiket.some(col => col.Field === 'nama' || col.Field === 'tugas')
            const punyaTanggal = columnsPiket.some(col => col.Field === 'tanggal')

            if (!columnsPiket.length || punyaKolomLama || !punyaTanggal) {
                await db.query('DROP TABLE IF EXISTS tb_piket_petugas')
                await db.query('DROP TABLE IF EXISTS tb_piket')
            }

            await db.query(`
                CREATE TABLE IF NOT EXISTS tb_piket (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    tanggal DATE NOT NULL UNIQUE,
                    hari VARCHAR(20) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `)
            await db.query(`
                CREATE TABLE IF NOT EXISTS tb_piket_petugas (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    piket_id INT NOT NULL,
                    siswa_nis VARCHAR(20) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY piket_petugas_unik (piket_id, siswa_nis),
                    FOREIGN KEY (piket_id) REFERENCES tb_piket(id) ON DELETE CASCADE
                )
            `)
        } catch (e) {}

        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS tb_inventaris (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nama_barang VARCHAR(150) NOT NULL,
                    kondisi VARCHAR(50) NOT NULL DEFAULT 'Tersedia',
                    jumlah INT NOT NULL DEFAULT 1,
                    keterangan TEXT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `)
        } catch (e) {}

        try {
            const [deskripsi] = await db.query('SHOW CREATE TABLE tb_reaksi_kas')
            const createSql = deskripsi[0]['Create Table'] || ''
            if (createSql.includes('REFERENCES `tb_siswa`') || createSql.includes('REFERENCES tb_siswa')) {
                const [fkRows] = await db.query("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tb_reaksi_kas' AND REFERENCED_TABLE_NAME IS NOT NULL")
                for (const fk of fkRows) {
                    await db.query(`ALTER TABLE tb_reaksi_kas DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``)
                }
                try { await db.query('ALTER TABLE tb_reaksi_kas DROP INDEX reaksi_unik') } catch (e) {}
                await db.query('ALTER TABLE tb_reaksi_kas ADD CONSTRAINT fk_reaksi_kas_kas FOREIGN KEY (kas_id) REFERENCES tb_kas(id) ON DELETE CASCADE')
                await db.query('ALTER TABLE tb_reaksi_kas ADD UNIQUE KEY reaksi_unik (kas_id, siswa_nis)')
            }
        } catch (e) {}

        const daftarSiswa = [
            ['202523180', 'Adelia Khairunissa Tofari', 'adelia@smkn1jakarta.sch.id', '123456', 'P', 'bendahara', 'aktif', 'Bendahara Kas XI RPL', 15],
            ['202523181', 'Adilah Hammam Akram', 'adilah@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523182', 'Adinda Afifah Putri', 'adinda@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523183', 'Adzan Ahlil Fiqri', 'adzan@smkn1jakarta.sch.id', '123456', 'L', 'admin', 'aktif', 'Admin System & Developer ClassHub', 50],
            ['202523184', 'Aira Saskia Sahwa', 'aira@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523185', 'Almira Rakhadhiya Aryacitadi', 'almira@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523186', 'Annisa Maharani', 'annisa@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523187', 'Annisah Agustin', 'annisah@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523188', 'Arif Raffy Fadlurahman', 'arif@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523189', 'Aryo Aji Sadewo', 'aryo@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523190', 'Cahaya', 'cahaya@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523191', 'Callyla Sakhi Faiha', 'callyla@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523192', 'Dedy Anang Setiawan', 'dedy@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523193', 'Deje Enne Dani Rosaline', 'deje@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523194', 'Dewa Nyoman Zed Zamuel Zouseuf', 'dewa@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523195', 'Fersya Wulanda', 'fersya@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523196', 'Ihsan Hafidz Assidiq', 'ihsan@smkn1jakarta.sch.id', '123456', 'L', 'ketua', 'aktif', 'Ketua Kelas XI RPL', 25],
            ['202523197', 'Intan Nurhikmah', 'intan@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523198', 'Ksatria Ali', 'ksatria@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523199', 'Marcellino', 'marcellino@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523200', 'Muhammad Fauzan Kamal Putra', 'fauzan@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523201', 'Muhammad Rafa Fadilah', 'rafa@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523202', 'Najwa Fajrina Ayatul Husna', 'najwa@smkn1jakarta.sch.id', '123456', 'P', 'bendahara', 'aktif', 'Bendahara Kas XI RPL', 15],
            ['202523203', 'Nauval Arief Hibatulloh', 'nauval@smkn1jakarta.sch.id', '123456', 'L', 'admin', 'aktif', 'Admin ClassHub XI RPL', 45],
            ['202523204', 'Naysheilla Bilqis Heryanto', 'naysheilla@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523205', 'Nazmu Toriq', 'nazmu@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523206', 'Qisya Awfiyah Ramadhani', 'qisya@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523207', 'Rambuana Ahmad Adnan', 'rambu@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523208', 'Rayhan Saputra', 'rayhan@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523209', 'Rayyan Irfansyah', 'rayyan@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523210', 'Rivael Lionel Messi Boryan', 'rivael@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523211', 'Saddam Qadafi Nurama', 'saddam@smkn1jakarta.sch.id', '123456', 'L', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523212', 'Safa Oktafianti', 'safa@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Ketua Kelas XI RPL', 5],
            ['202523213', 'Salsa Nabila', 'salsa@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523214', 'Siti Syeera Azzahrah', 'syeera@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5],
            ['202523215', 'Syadira Putri Aulia', 'syadira@smkn1jakarta.sch.id', '123456', 'P', 'siswa', 'aktif', 'Siswa XI RPL SMKN 1 Jakarta', 5]
        ]

        for (const data of daftarSiswa) {
            try {
                const [nis, nama, email, passwordDefault, jenisKelamin, role, status, bio, poin] = data
                const passwordHash = await hashPassword(passwordDefault)
                await db.query('INSERT INTO tb_siswa (nis, nama, email, password, jenis_kelamin, role, status, bio, poin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE nama=VALUES(nama), password=VALUES(password)', [nis, nama, email, passwordHash, jenisKelamin, role, status, bio, poin])
            } catch (e) {}
        }

        console.log('Database ClassHub XI RPL berhasil disinkronkan')
    } catch (err) {
        console.error('Gagal sinkronisasi tabel:', err.message)
    }
}

async function buatNotifikasiInternal(nis, judul, pesan, pengirimNis = null, pengirimNama = 'Sistem') {
    try {
        await db.query('INSERT INTO tb_notifikasi (siswa_nis, judul, pesan, pengirim_nis, pengirim_nama) VALUES (?, ?, ?, ?, ?)', [nis, judul, pesan, pengirimNis, pengirimNama])
    } catch (e) {
        console.error('Gagal buatNotifikasiInternal:', e.message)
    }
}

async function catatAktivitas(nis, aktivitas) {
    try {
        await db.query('INSERT INTO tb_log_aktivitas (siswa_nis, aktivitas) VALUES (?, ?)', [nis, aktivitas])
    } catch (e) {}
}

async function notifikasiKastaAtas(judul, pesan) {
    try {
        const [adminList] = await db.query("SELECT nis FROM tb_siswa WHERE role IN ('admin', 'ketua')")
        for (const adm of adminList) {
            await buatNotifikasiInternal(adm.nis, judul, pesan)
        }
    } catch (e) {}
}

app.get('/api/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'Server ClassHub SMKN 1 Jakarta berhasil berjalan',
        waktu: new Date()
    })
})

app.post('/api/login', async (req, res) => {
    try {
        const { idAkun, kataSandi } = req.body

        if (!idAkun || !kataSandi) {
            return res.status(400).json({
                status: 'error',
                message: 'NIS / Email dan Kata Sandi wajib diisi'
            })
        }

        const [hasilCari] = await db.query('SELECT nis, nama, email, jenis_kelamin, role, status, foto_profil, bio, poin, created_at, password FROM tb_siswa WHERE nis = ? OR email = ?', [idAkun, idAkun])

        const dataPengguna = await (async () => {
            for (const siswa of hasilCari) {
                const cocok = await verifyPassword(kataSandi, siswa.password)
                if (cocok) {
                    if (!siswa.password || !siswa.password.startsWith('$2')) {
                        await db.query('UPDATE tb_siswa SET password = ? WHERE nis = ?', [await hashPassword(kataSandi), siswa.nis])
                    }
                    return siswa
                }
            }
            return null
        })()

        if (!dataPengguna) {
            return res.status(401).json({
                status: 'error',
                message: 'NIS / Email atau Kata Sandi salah'
            })
        }

        if (dataPengguna.status === 'pending') {
            return res.status(403).json({
                status: 'error',
                message: 'Akun Anda sedang menunggu verifikasi dari Admin / Ketua Kelas'
            })
        }

        await catatAktivitas(dataPengguna.nis, 'Berhasil login ke aplikasi')

        res.json({
            status: 'success',
            message: 'Berhasil masuk ke ClassHub',
            data: dataPengguna
        })
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal melakukan login: ' + err.message
        })
    }
})

app.post('/api/permintaan-reset-password', async (req, res) => {
    try {
        const idAkun = String(req.body.idAkun || '').trim()
        if (!idAkun) {
            return res.status(400).json({ status: 'error', message: 'NIS atau email wajib diisi' })
        }

        const [siswaRows] = await db.query('SELECT nis, nama FROM tb_siswa WHERE nis = ? OR email = ?', [idAkun, idAkun])
        if (siswaRows.length > 0) {
            const siswa = siswaRows[0]
            const [permintaanAktif] = await db.query("SELECT id FROM tb_pengajuan_reset_password WHERE siswa_nis = ? AND status = 'pending' LIMIT 1", [siswa.nis])
            if (permintaanAktif.length === 0) {
                await db.query('INSERT INTO tb_pengajuan_reset_password (siswa_nis, nama) VALUES (?, ?)', [siswa.nis, siswa.nama])
                await notifikasiKastaAtas('Permintaan Reset Password', `Siswa ${siswa.nama} (${siswa.nis}) meminta reset password. Silakan buka panel anggota untuk membuat password sementara.`)
            }
        }

        res.json({ status: 'success', message: 'Permintaan reset sudah dicatat. Silakan hubungi Admin kelas untuk mendapatkan password sementara.' })
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Gagal mengirim permintaan reset: ' + err.message })
    }
})

app.post('/api/register', async (req, res) => {
    try {
        const { nis, nama, email, password, jenis_kelamin } = req.body

        if (!nis || !nama || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'NIS, Nama, dan Password wajib diisi'
            })
        }

        const roleDipakai = 'siswa'
        const statusDefault = 'pending'
        const passwordHash = await hashPassword(password)
        const queryDaftar = 'INSERT INTO tb_siswa (nis, nama, email, password, jenis_kelamin, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
        await db.query(queryDaftar, [nis, nama, email || null, passwordHash, jenis_kelamin || 'L', roleDipakai, statusDefault])

        await notifikasiKastaAtas('Pendaftaran Akun Baru', `Siswa ${nama} (${nis}) mendaftar dan menunggu verifikasi.`)
        await catatAktivitas(nis, 'Mendaftar akun baru')

        res.json({
            status: 'success',
            message: 'Pendaftaran berhasil. Akun Anda menunggu verifikasi Admin.',
            data: { nis, nama, email, role: roleDipakai, status: statusDefault }
        })
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal mendaftar akun: ' + err.message
        })
    }
})

app.get('/api/siswa/me/:nis', async (req, res) => {
    try {
        const { nis } = req.params
        if (!nis || nis === 'VISITOR') {
            return res.json({
                status: 'success',
                data: { nis: 'VISITOR', nama: 'Tamu / Visitor', role: 'visitor', poin: 0, status: 'aktif' }
            })
        }

        const [hasil] = await db.query('SELECT nis, nama, email, jenis_kelamin, role, status, foto_profil, bio, poin, created_at FROM tb_siswa WHERE nis = ?', [nis])
        if (hasil.length === 0) return res.status(404).json({ status: 'error', message: 'User tidak ditemukan' })

        const [pendingPeran] = await db.query("SELECT * FROM tb_pengajuan_peran WHERE siswa_nis = ? AND status = 'pending'", [nis])

        res.json({
            status: 'success',
            data: hasil[0],
            pengajuan_pending: pendingPeran.length > 0 ? pendingPeran[0] : null
        })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
})

app.get('/api/notifikasi/:nis', async (req, res) => {
    try {
        const { nis } = req.params
        if (!nis || nis === 'VISITOR') return res.json({ status: 'success', unread: 0, data: [] })

        const [listNotif] = await db.query('SELECT * FROM tb_notifikasi WHERE siswa_nis = ? ORDER BY created_at DESC LIMIT 25', [nis])
        const [unreadRes] = await db.query('SELECT COUNT(*) AS total FROM tb_notifikasi WHERE siswa_nis = ? AND is_read = FALSE', [nis])

        res.json({
            status: 'success',
            unread: unreadRes[0].total || 0,
            data: listNotif
        })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
})

app.post('/api/notifikasi/baca', async (req, res) => {
    try {
        const { nis } = req.body
        if (nis && nis !== 'VISITOR') {
            await db.query('UPDATE tb_notifikasi SET is_read = TRUE WHERE siswa_nis = ?', [nis])
        }
        res.json({ status: 'success' })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
})

app.post('/api/notifikasi/broadcast', async (req, res) => {
    try {
        const { pengirim_nis, pengirim_nama, target_nis, judul, pesan } = req.body
        if (!judul || !pesan) {
            return res.status(400).json({ status: 'error', message: 'Judul dan Isi Pesan Notifikasi wajib diisi' })
        }

        if (target_nis && target_nis !== 'SEMUA') {
            await buatNotifikasiInternal(target_nis, judul, pesan, pengirim_nis, pengirim_nama)
        } else {
            const [semuaSiswa] = await db.query('SELECT nis FROM tb_siswa')
            for (const s of semuaSiswa) {
                await buatNotifikasiInternal(s.nis, judul, pesan, pengirim_nis, pengirim_nama)
            }
        }

        if (pengirim_nis) await catatAktivitas(pengirim_nis, `Mengirim broadcast notifikasi: "${judul}"`)

        res.json({ status: 'success', message: 'Notifikasi broadcast berhasil dikirimkan ke seluruh member!' })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
})

app.get('/api/log-aktivitas/:nis', async (req, res) => {
    try {
        const { nis } = req.params
        let queryLog = 'SELECT a.*, s.nama FROM tb_log_aktivitas a JOIN tb_siswa s ON a.siswa_nis = s.nis '
        let params = []

        if (nis && nis !== 'ADMIN_ALL' && nis !== 'VISITOR') {
            queryLog += 'WHERE a.siswa_nis = ? '
            params.push(nis)
        }

        queryLog += 'ORDER BY a.created_at DESC LIMIT 30'

        const [listAktivitas] = await db.query(queryLog, params)
        res.json({ status: 'success', data: listAktivitas })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
})

app.get('/api/piket', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, DATE_FORMAT(tanggal, '%Y-%m-%d') AS tanggal, hari, created_at FROM tb_piket ORDER BY tanggal ASC, created_at ASC")
        const data = []

        for (const item of rows) {
            const [petugasRows] = await db.query(
                `SELECT pp.siswa_nis, s.nama
                 FROM tb_piket_petugas pp
                 LEFT JOIN tb_siswa s ON s.nis = pp.siswa_nis
                 WHERE pp.piket_id = ?
                 ORDER BY s.nama ASC`,
                [item.id]
            )

            data.push({
                ...item,
                petugas: petugasRows.map(row => row.nama || row.siswa_nis),
                petugasNis: petugasRows.map(row => row.siswa_nis)
            })
        }

        res.json({ status: 'success', data })
    } catch (err) {
        res.status(503).json({ status: 'error', message: err.code === 'ECONNREFUSED' ? 'Database MySQL belum aktif' : err.message })
    }
})

app.post('/api/piket', async (req, res) => {
    try {
        const { tanggal, hari, petugas } = req.body
        const daftarPetugas = Array.isArray(petugas) ? petugas : (petugas ? String(petugas).split(',') : [])
        const petugasBersih = daftarPetugas.map(item => String(item).trim()).filter(Boolean)

        if (!tanggal || !hari || petugasBersih.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Tanggal, hari pelaksanaan, dan minimal satu petugas piket wajib diisi' })
        }

        let [piketRow] = await db.query('SELECT id FROM tb_piket WHERE tanggal = ?', [tanggal])

        let piketId
        if (piketRow.length > 0) {
            piketId = piketRow[0].id
            await db.query('UPDATE tb_piket SET hari = ? WHERE id = ?', [hari, piketId])
        } else {
            const hasilInsert = await db.query('INSERT INTO tb_piket (tanggal, hari) VALUES (?, ?)', [tanggal, hari])
            piketId = hasilInsert[0].insertId
        }

        await db.query('DELETE FROM tb_piket_petugas WHERE piket_id = ?', [piketId])

        for (const nisPetugas of petugasBersih) {
            const [cekSiswa] = await db.query('SELECT nis FROM tb_siswa WHERE nis = ?', [nisPetugas])
            if (cekSiswa.length > 0) {
                await db.query('INSERT INTO tb_piket_petugas (piket_id, siswa_nis) VALUES (?, ?)', [piketId, nisPetugas])
            }
        }

        res.json({ status: 'success', message: 'Jadwal piket berhasil disimpan' })
    } catch (err) {
        res.status(503).json({ status: 'error', message: err.code === 'ECONNREFUSED' ? 'Database MySQL belum aktif' : err.message })
    }
})

app.put('/api/piket/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { tanggal, hari, petugas } = req.body
        const daftarPetugas = Array.isArray(petugas) ? petugas : (petugas ? String(petugas).split(',') : [])
        const petugasBersih = daftarPetugas.map(item => String(item).trim()).filter(Boolean)

        if (!id || !tanggal || !hari || petugasBersih.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Tanggal, hari pelaksanaan, dan minimal satu petugas piket wajib diisi' })
        }

        const [cekPiket] = await db.query('SELECT id FROM tb_piket WHERE id = ?', [id])
        if (cekPiket.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Jadwal piket tidak ditemukan' })
        }

        await db.query('UPDATE tb_piket SET tanggal = ?, hari = ? WHERE id = ?', [tanggal, hari, id])
        await db.query('DELETE FROM tb_piket_petugas WHERE piket_id = ?', [id])

        for (const nisPetugas of petugasBersih) {
            const [cekSiswa] = await db.query('SELECT nis FROM tb_siswa WHERE nis = ?', [nisPetugas])
            if (cekSiswa.length > 0) {
                await db.query('INSERT INTO tb_piket_petugas (piket_id, siswa_nis) VALUES (?, ?)', [id, nisPetugas])
            }
        }

        res.json({ status: 'success', message: 'Jadwal piket berhasil diperbarui' })
    } catch (err) {
        res.status(503).json({ status: 'error', message: err.code === 'ECONNREFUSED' ? 'Database MySQL belum aktif' : err.message })
    }
})

app.delete('/api/piket/:id', async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(400).json({ status: 'error', message: 'ID jadwal piket wajib ada' })
        }

        const [cekPiket] = await db.query('SELECT id FROM tb_piket WHERE id = ?', [id])
        if (cekPiket.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Jadwal piket tidak ditemukan' })
        }

        await db.query('DELETE FROM tb_piket_petugas WHERE piket_id = ?', [id])
        await db.query('DELETE FROM tb_piket WHERE id = ?', [id])

        res.json({ status: 'success', message: 'Jadwal piket berhasil dihapus' })
    } catch (err) {
        res.status(503).json({ status: 'error', message: err.code === 'ECONNREFUSED' ? 'Database MySQL belum aktif' : err.message })
    }
})

app.get('/api/inventaris', async (req, res) => {
    try {
        const [data] = await db.query('SELECT * FROM tb_inventaris ORDER BY nama_barang ASC')
        res.json({ status: 'success', data })
    } catch (err) {
        res.status(503).json({ status: 'error', message: err.code === 'ECONNREFUSED' ? 'Database MySQL belum aktif' : err.message })
    }
})

app.post('/api/inventaris', async (req, res) => {
    try {
        const { nama_barang, kondisi, jumlah, keterangan } = req.body
        if (!nama_barang || !kondisi) {
            return res.status(400).json({ status: 'error', message: 'Nama barang dan kondisi wajib diisi' })
        }

        await db.query('INSERT INTO tb_inventaris (nama_barang, kondisi, jumlah, keterangan) VALUES (?, ?, ?, ?)', [nama_barang, kondisi, Number(jumlah) || 1, keterangan || null])
        res.json({ status: 'success', message: 'Inventaris berhasil disimpan' })
    } catch (err) {
        res.status(503).json({ status: 'error', message: err.code === 'ECONNREFUSED' ? 'Database MySQL belum aktif' : err.message })
    }
})

app.post('/api/siswa/poin', async (req, res) => {
    try {
        const { nis, jumlah } = req.body
        if (!nis) return res.status(400).json({ status: 'error', message: 'NIS wajib diisi' })
        const poinBonus = Number(jumlah) || 1
        await db.query('UPDATE tb_siswa SET poin = poin + ? WHERE nis = ?', [poinBonus, nis])
        await catatAktivitas(nis, `Mendapatkan +${poinBonus} poin keaktifan website`)
        res.json({ status: 'success', message: 'Poin berhasil ditambahkan' })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
})

app.get('/api/siswa/publik/:nis', async (req, res) => {
    try {
        const { nis } = req.params
        const [hasil] = await db.query('SELECT nama, role, foto_profil, bio, poin, created_at FROM tb_siswa WHERE nis = ?', [nis])

        if (hasil.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Siswa tidak ditemukan' })
        }

        res.json({
            status: 'success',
            data: hasil[0]
        })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
})

app.put('/api/siswa/profil/:nis', uploadFile.single('foto_profil'), async (req, res) => {
    try {
        const { nis } = req.params
        const { nama, email, bio, password } = req.body
        const fotoProfil = req.file ? req.file.filename : null

        const [cekSiswa] = await db.query('SELECT * FROM tb_siswa WHERE nis = ?', [nis])
        if (cekSiswa.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Akun siswa tidak ditemukan' })
        }

        let queryEdit = 'UPDATE tb_siswa SET nama = ?, email = ?, bio = ?'
        let parameterEdit = [nama, email || null, bio || 'Siswa XI RPL SMKN 1 Jakarta']

        if (fotoProfil) {
            queryEdit += ', foto_profil = ?'
            parameterEdit.push(fotoProfil)
        }

        if (password && password.trim().length > 0) {
            queryEdit += ', password = ?'
            parameterEdit.push(await hashPassword(password.trim()))
        }

        queryEdit += ' WHERE nis = ?'
        parameterEdit.push(nis)

        await db.query(queryEdit, parameterEdit)
        await catatAktivitas(nis, 'Memperbarui identitas profil')

        const [dataBaru] = await db.query('SELECT nis, nama, email, jenis_kelamin, role, status, foto_profil, bio, poin, created_at FROM tb_siswa WHERE nis = ?', [nis])

        res.json({
            status: 'success',
            message: 'Profil berhasil diperbarui',
            data: dataBaru[0]
        })
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Gagal update profil: ' + err.message })
    }
})

app.post('/api/siswa/hapus-foto/:nis', async (req, res) => {
    try {
        const { nis } = req.params
        await db.query('UPDATE tb_siswa SET foto_profil = NULL WHERE nis = ?', [nis])
        await catatAktivitas(nis, 'Menghapus foto profil')

        const [dataBaru] = await db.query('SELECT nis, nama, email, jenis_kelamin, role, status, foto_profil, bio, poin, created_at FROM tb_siswa WHERE nis = ?', [nis])
        res.json({ status: 'success', message: 'Foto profil berhasil dihapus', data: dataBaru[0] })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
})

app.post('/api/siswa/hapus-ekstra', async (req, res) => {
    try {
        const { nis, password, alasan } = req.body
        if (!nis || !password || !alasan) {
            return res.status(400).json({ status: 'error', message: 'NIS, Password, dan Alasan wajib diisi' })
        }

        const [cekAcc] = await db.query('SELECT nama, password FROM tb_siswa WHERE nis = ?', [nis])
        if (cekAcc.length === 0 || !(await verifyPassword(password, cekAcc[0].password))) {
            return res.status(401).json({ status: 'error', message: 'Verifikasi Gagal: NIS atau Password salah!' })
        }

        const namaSiswa = cekAcc[0].nama
        await db.query('INSERT INTO tb_pengajuan_hapus (siswa_nis, nama, alasan) VALUES (?, ?, ?)', [nis, namaSiswa, alasan])

        await buatNotifikasiInternal(nis, 'Pengajuan Hapus Akun', 'Permintaan hapus akun kamu sedang diverifikasi oleh Admin/Ketua.')
        await notifikasiKastaAtas('Permintaan Hapus Akun', `Siswa ${namaSiswa} (${nis}) mengajukan hapus akun. Alasan: ${alasan}`)
        await catatAktivitas(nis, 'Mengajukan penghapusan akun permanen')

        res.json({ status: 'success', message: 'Pengajuan hapus akun dikirim dan menunggu persetujuan Admin/Pengurus' })
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Gagal pengajuan hapus akun: ' + err.message })
    }
})

app.post('/api/siswa/pengajuan-peran', async (req, res) => {
    try {
        const { nis, peran_diajukan, alasan } = req.body
        if (!nis || !peran_diajukan || !alasan) {
            return res.status(400).json({ status: 'error', message: 'NIS, Peran yang diajukan, dan Alasan wajib diisi' })
        }

        const [cekCegah] = await db.query("SELECT * FROM tb_pengajuan_peran WHERE siswa_nis = ? AND status = 'pending'", [nis])
        if (cekCegah.length > 0) {
            return res.status(400).json({ status: 'error', message: 'Kamu sudah memiliki pengajuan peran yang sedang pending!' })
        }

        const [cekNis] = await db.query('SELECT nama FROM tb_siswa WHERE nis = ?', [nis])
        const namaSiswa = cekNis.length > 0 ? cekNis[0].nama : 'Siswa'

        await db.query('INSERT INTO tb_pengajuan_peran (siswa_nis, peran_diajukan, alasan) VALUES (?, ?, ?)', [nis, peran_diajukan, alasan])

        await buatNotifikasiInternal(nis, 'Pengajuan Peran Dikirim', `Pengajuan peran ${peran_diajukan} kamu berhasil dikirim (Status: Pending).`)
        await notifikasiKastaAtas('Pengajuan Peran Baru', `Siswa ${namaSiswa} (${nis}) mengajukan peran ${peran_diajukan}. Alasan: ${alasan}`)
        await catatAktivitas(nis, `Mengajukan peran baru (${peran_diajukan})`)

        res.json({ status: 'success', message: 'Pengajuan peran berhasil dikirim ke Admin & Pengurus Kelas' })
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Gagal mengajukan peran: ' + err.message })
    }
})

app.get('/api/admin/pengajuan-peran', async (req, res) => {
    try {
        const [daftarPengajuan] = await db.query(`
            SELECT p.*, s.nama AS siswa_nama 
            FROM tb_pengajuan_peran p 
            JOIN tb_siswa s ON p.siswa_nis = s.nis 
            WHERE p.status = 'pending' 
            ORDER BY p.created_at DESC
        `)
        res.json({ status: 'success', data: daftarPengajuan })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
})

app.post('/api/admin/setujui-peran', async (req, res) => {
    try {
        const { id, status, nis, peran_diajukan } = req.body
        await db.query('UPDATE tb_pengajuan_peran SET status = ? WHERE id = ?', [status, id])
        if (status === 'disetujui') {
            await db.query('UPDATE tb_siswa SET role = ? WHERE nis = ?', [peran_diajukan, nis])
            await buatNotifikasiInternal(nis, 'Pengajuan Peran DISETUJUI! 🎉', `Selamat! Pengajuan peran kamu sebagai ${peran_diajukan} telah DISETUJUI Admin.`)
            await catatAktivitas(nis, `Role diubah menjadi ${peran_diajukan} (Disetujui Admin)`)
        } else {
            await buatNotifikasiInternal(nis, 'Pengajuan Peran Ditolak', `Mohon maaf, pengajuan peran kamu sebagai ${peran_diajukan} ditolak.`)
        }
        res.json({ status: 'success', message: 'Pengajuan peran telah diproses' })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
})

app.get('/api/admin/pengajuan-hapus', async (req, res) => {
    try {
        const [listHapus] = await db.query("SELECT * FROM tb_pengajuan_hapus WHERE status = 'pending' ORDER BY created_at DESC")
        res.json({ status: 'success', data: listHapus })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
})

app.post('/api/admin/setujui-hapus', async (req, res) => {
    try {
        const { id, status, nis, nama, alasan } = req.body
        await db.query('UPDATE tb_pengajuan_hapus SET status = ? WHERE id = ?', [status, id])
        if (status === 'disetujui') {
            try { await db.query('INSERT INTO tb_log_hapus (nis, nama, alasan) VALUES (?, ?, ?)', [nis, nama, alasan]) } catch (e) {}
            await buatNotifikasiInternal(nis, 'Akun Anda Telah Dihapus', 'Peringatan: Akun Anda telah disetujui untuk dihapus permanen.')
            await db.query('DELETE FROM tb_siswa WHERE nis = ?', [nis])
        } else {
            await buatNotifikasiInternal(nis, 'Permintaan Hapus Ditolak', 'Permintaan hapus akun Anda telah ditolak oleh Admin.')
        }
        res.json({ status: 'success', message: 'Pengajuan hapus akun diproses' })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
})

app.get('/api/admin/log-hapus', async (req, res) => {
    try {
        const [logHapus] = await db.query('SELECT * FROM tb_log_hapus ORDER BY created_at DESC')
        res.json({ status: 'success', data: logHapus })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
})

app.get('/api/leaderboard', async (req, res) => {
    try {
        const [daftarLeaderboard] = await db.query(`
            SELECT nis, nama, role, status, foto_profil, bio, poin, created_at,
            (poin + CASE 
                WHEN role = 'admin' THEN 30
                WHEN role = 'guru' THEN 25
                WHEN role = 'ketua' THEN 10
                WHEN role IN ('bendahara', 'sekretaris') THEN 5
                ELSE 0 
            END) AS total_skor
            FROM tb_siswa 
            WHERE status = 'aktif' 
            ORDER BY total_skor DESC, created_at ASC
        `)

        res.json({
            status: 'success',
            data: daftarLeaderboard
        })
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message })
    }
})

app.get('/api/kas', async (req, res) => {
    try {
        const [transaksi] = await db.query(`
            SELECT k.*, s.foto_profil AS pembuat_foto,
            (SELECT COUNT(*) FROM tb_komentar_kas WHERE kas_id = k.id) AS jumlah_komentar,
            (SELECT COUNT(*) FROM tb_reaksi_kas WHERE kas_id = k.id AND tipe_reaksi = 'suka') AS reaksi_suka,
            (SELECT COUNT(*) FROM tb_reaksi_kas WHERE kas_id = k.id AND tipe_reaksi = 'love') AS reaksi_love,
            (SELECT COUNT(*) FROM tb_reaksi_kas WHERE kas_id = k.id AND tipe_reaksi = 'kaget') AS reaksi_kaget
            FROM tb_kas k
            LEFT JOIN tb_siswa s ON k.pembuat_nis = s.nis
            ORDER BY k.created_at DESC
        `)

        const [totalMasuk] = await db.query("SELECT SUM(nominal) AS total FROM tb_kas WHERE jenis = 'masuk' ")
        const [totalKeluar] = await db.query("SELECT SUM(nominal) AS total FROM tb_kas WHERE jenis = 'keluar' ")

        const masuk = Number(totalMasuk[0].total) || 0
        const keluar = Number(totalKeluar[0].total) || 0
        const saldo = masuk - keluar

        res.json({
            status: 'success',
            data: {
                saldo: saldo,
                total_masuk: masuk,
                total_keluar: keluar,
                riwayat: transaksi
            }
        })
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil data kas: ' + err.message
        })
    }
})

app.post('/api/kas', uploadFile.single('nota'), async (req, res) => {
    try {
        const { jenis, nominal, keterangan, pembuat_nis, pembuat_nama } = req.body
        const fotoNota = req.file ? req.file.filename : null
        const tanggalInput = new Date().toISOString().split('T')[0]

        if (!jenis || !nominal || !keterangan) {
            return res.status(400).json({
                status: 'error',
                message: 'Data jenis, nominal, dan keterangan wajib diisi'
            })
        }

        const querySimpan = 'INSERT INTO tb_kas (jenis, nominal, keterangan, foto_nota, tanggal, pembuat_nis, pembuat_nama) VALUES (?, ?, ?, ?, ?, ?, ?)'
        await db.query(querySimpan, [jenis, nominal, keterangan, fotoNota, tanggalInput, pembuat_nis || null, pembuat_nama || null])

        if (pembuat_nis) await catatAktivitas(pembuat_nis, `Menginput transaksi kas (${jenis}: Rp ${nominal})`)

        res.json({
            status: 'success',
            message: 'Transaksi kas berhasil disimpan ke database'
        })
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal menyimpan transaksi kas: ' + err.message
        })
    }
})

app.delete('/api/kas/:id', async (req, res) => {
    try {
        const { id } = req.params
        await db.query('DELETE FROM tb_kas WHERE id = ?', [id])
        res.json({
            status: 'success',
            message: 'Transaksi kas berhasil dihapus'
        })
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal menghapus transaksi kas: ' + err.message
        })
    }
})

app.get('/api/kas/:id/komentar', async (req, res) => {
    try {
        const { id } = req.params
        const [komentarList] = await db.query(`
            SELECT c.*, s.foto_profil AS siswa_foto,
            (SELECT COUNT(*) FROM tb_reaksi_komentar WHERE komentar_id = c.id AND tipe = 'suka') AS suka_count,
            (SELECT COUNT(*) FROM tb_reaksi_komentar WHERE komentar_id = c.id AND tipe = 'dislike') AS dislike_count
            FROM tb_komentar_kas c 
            LEFT JOIN tb_siswa s ON c.siswa_nis = s.nis
            WHERE c.kas_id = ? 
            ORDER BY c.created_at ASC
        `, [id])

        res.json({
            status: 'success',
            data: komentarList
        })
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil komentar: ' + err.message
        })
    }
})

app.post('/api/kas/:id/komentar', async (req, res) => {
    try {
        const { id } = req.params
        const { siswa_nis, siswa_nama, komentar, parent_id } = req.body

        if (!siswa_nis || !komentar) {
            return res.status(400).json({
                status: 'error',
                message: 'NIS dan isi komentar wajib diisi'
            })
        }

        const [cekVisitor] = await db.query('SELECT role FROM tb_siswa WHERE nis = ?', [siswa_nis])
        if (cekVisitor.length > 0 && cekVisitor[0].role === 'visitor') {
            return res.status(403).json({ status: 'error', message: 'Akses Ditolak: Visitor hanya bisa membaca (Readonly)' })
        }

        await db.query('INSERT INTO tb_komentar_kas (kas_id, siswa_nis, siswa_nama, komentar, parent_id) VALUES (?, ?, ?, ?, ?)', [id, siswa_nis, siswa_nama || 'Siswa', komentar, parent_id || null])
        await db.query('UPDATE tb_siswa SET poin = poin + 1 WHERE nis = ?', [siswa_nis])
        await catatAktivitas(siswa_nis, 'Mengirim komentar di feed kas')

        res.json({
            status: 'success',
            message: 'Komentar berhasil dikirim'
        })
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengirim komentar: ' + err.message
        })
    }
})

app.delete('/api/komentar/:id', async (req, res) => {
    try {
        const { id } = req.params
        await db.query('DELETE FROM tb_komentar_kas WHERE id = ?', [id])
        res.json({
            status: 'success',
            message: 'Komentar berhasil dihapus'
        })
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal menghapus komentar: ' + err.message
        })
    }
})

app.post('/api/komentar/:id/reaksi', async (req, res) => {
    try {
        const { id } = req.params
        const { siswa_nis, tipe } = req.body

        if (!siswa_nis || !tipe) {
            return res.status(400).json({
                status: 'error',
                message: 'NIS dan tipe reaksi wajib diisi'
            })
        }

        const [cekVisitor] = await db.query('SELECT role FROM tb_siswa WHERE nis = ?', [siswa_nis])
        if (cekVisitor.length > 0 && cekVisitor[0].role === 'visitor') {
            return res.status(403).json({ status: 'error', message: 'Akses Ditolak: Visitor tidak bisa memberi reaksi' })
        }

        await db.query('INSERT INTO tb_reaksi_komentar (komentar_id, siswa_nis, tipe) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE tipe=VALUES(tipe)', [id, siswa_nis, tipe])
        await db.query('UPDATE tb_siswa SET poin = poin + 1 WHERE nis = ?', [siswa_nis])

        res.json({
            status: 'success',
            message: 'Reaksi komentar disimpan'
        })
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal memberi reaksi komentar: ' + err.message
        })
    }
})

app.post('/api/kas/:id/reaksi', async (req, res) => {
    try {
        const { id } = req.params
        const { siswa_nis, tipe_reaksi } = req.body

        if (!siswa_nis || !tipe_reaksi) {
            return res.status(400).json({
                status: 'error',
                message: 'NIS dan tipe reaksi wajib diisi'
            })
        }

        const [cekVisitor] = await db.query('SELECT role FROM tb_siswa WHERE nis = ?', [siswa_nis])
        if (cekVisitor.length > 0 && cekVisitor[0].role === 'visitor') {
            return res.status(403).json({ status: 'error', message: 'Akses Ditolak: Visitor tidak bisa memberi reaksi' })
        }

        await db.query('INSERT INTO tb_reaksi_kas (kas_id, siswa_nis, tipe_reaksi) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE tipe_reaksi=VALUES(tipe_reaksi)', [id, siswa_nis, tipe_reaksi])
        await db.query('UPDATE tb_siswa SET poin = poin + 1 WHERE nis = ?', [siswa_nis])

        res.json({
            status: 'success',
            message: 'Reaksi berhasil diberikan'
        })
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal memberikan reaksi: ' + err.message
        })
    }
})

app.get('/api/anggota', async (req, res) => {
    try {
        const [daftarAnggota] = await db.query('SELECT nis, nama, email, jenis_kelamin, role, status FROM tb_siswa ORDER BY status DESC, nama ASC')
        res.json({
            status: 'success',
            data: daftarAnggota
        })
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal mengambil data anggota: ' + err.message
        })
    }
})

app.post('/api/anggota/reset-password', async (req, res) => {
    try {
        const { admin_nis, target_nis, password_baru } = req.body
        if (!admin_nis || !target_nis || !password_baru || String(password_baru).trim().length < 6) {
            return res.status(400).json({ status: 'error', message: 'Admin, NIS akun, dan password baru minimal 6 karakter wajib diisi' })
        }

        const [adminRows] = await db.query('SELECT role FROM tb_siswa WHERE nis = ?', [admin_nis])
        if (adminRows.length === 0 || adminRows[0].role !== 'admin') {
            return res.status(403).json({ status: 'error', message: 'Hanya Admin yang dapat mereset password akun' })
        }

        const [targetRows] = await db.query('SELECT nis, nama FROM tb_siswa WHERE nis = ?', [target_nis])
        if (targetRows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Akun yang akan direset tidak ditemukan' })
        }

        const passwordHash = await hashPassword(String(password_baru).trim())
        await db.query('UPDATE tb_siswa SET password = ? WHERE nis = ?', [passwordHash, target_nis])
        await catatAktivitas(target_nis, 'Password direset oleh Admin')
        await buatNotifikasiInternal(target_nis, 'Password Direset', 'Password akun kamu telah direset oleh Admin. Silakan login menggunakan password baru.')

        res.json({ status: 'success', message: `Password akun ${targetRows[0].nama} berhasil direset` })
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Gagal mereset password: ' + err.message })
    }
})

app.post('/api/anggota/setujui', async (req, res) => {
    try {
        const { nis, statusBaru } = req.body
        if (!nis || !statusBaru) {
            return res.status(400).json({
                status: 'error',
                message: 'NIS dan status baru wajib diisi'
            })
        }

        await db.query('UPDATE tb_siswa SET status = ? WHERE nis = ?', [statusBaru, nis])
        await buatNotifikasiInternal(nis, 'Akun Diverifikasi! 🎉', 'Akun kamu telah disetujui Admin. Selamat beraktivitas di ClassHub!')
        await catatAktivitas(nis, 'Status akun disetujui menjadi aktif')

        res.json({
            status: 'success',
            message: 'Status akun berhasil diperbarui menjadi ' + statusBaru
        })
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal memperbarui status: ' + err.message
        })
    }
})

app.post('/api/anggota/peran', async (req, res) => {
    try {
        const { nis, peranBaru } = req.body
        if (!nis || !peranBaru) {
            return res.status(400).json({
                status: 'error',
                message: 'NIS dan peran baru wajib diisi'
            })
        }

        await db.query('UPDATE tb_siswa SET role = ? WHERE nis = ?', [peranBaru, nis])
        await buatNotifikasiInternal(nis, 'Peran Akun Diubah 👑', `Role kamu di ClassHub telah diubah menjadi ${peranBaru} oleh Admin.`)
        await catatAktivitas(nis, `Role diubah menjadi ${peranBaru} oleh Admin`)

        res.json({
            status: 'success',
            message: 'Peran akun berhasil diubah menjadi ' + peranBaru
        })
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Gagal memperbarui peran: ' + err.message
        })
    }
})

async function testDatabaseConnection() {
    try {
        await db.query('SELECT 1')
        await inisialisasiTabel()
        console.log('Berhasil terhubung ke database MySQL (classhub_db)')
    } catch (err) {
        console.error('Gagal terhubung ke database MySQL:', err.code || err.message)
    }
}

testDatabaseConnection()

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server ClassHub aktif di http://0.0.0.0:${PORT}`)
})