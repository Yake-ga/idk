const tombolNav = document.querySelectorAll('.tombol-nav')
const daftarHalaman = document.querySelectorAll('.halaman')
const judulHalaman = document.getElementById('judul-halaman')
const sapaanPengguna = document.getElementById('sapaan-pengguna')
const navigasiUtama = document.getElementById('navigasi-utama')
const badgeRole = document.getElementById('badge-role')

const berandaSaldo = document.getElementById('beranda-saldo')
const berandaMasuk = document.getElementById('beranda-masuk')
const berandaKeluar = document.getElementById('beranda-keluar')
const kasMasukDetail = document.getElementById('kas-masuk-detail')
const kasKeluarDetail = document.getElementById('kas-keluar-detail')
const kasSaldo = document.getElementById('kas-saldo')
const daftarKas = document.getElementById('daftar-transaksi-kas')
const tabelKasWadah = document.getElementById('tabel-kas-wadah')

const formMasuk = document.getElementById('form-masuk')
const formDaftar = document.getElementById('form-daftar')
const formKas = document.getElementById('form-input-kas')
const peringatanSiswa = document.getElementById('peringatan-role-siswa')
const btnSubmitKas = document.getElementById('btn-submit-kas')

const profilNama = document.getElementById('profil-nama')
const profilNis = document.getElementById('profil-nis')
const profilEmail = document.getElementById('profil-email')
const profilBio = document.getElementById('profil-bio')
const profilPoin = document.getElementById('profil-poin')
const profilDibuat = document.getElementById('profil-dibuat')
const profilDurasiOnline = document.getElementById('profil-durasi-online')
const profilRoleBadge = document.getElementById('profil-role-badge')
const profilAvatarWadah = document.getElementById('profil-avatar-wadah')
const headerAvatarContainer = document.getElementById('header-avatar-container')
const panelAdmin = document.getElementById('panel-admin')
const daftarAdmin = document.getElementById('daftar-anggota-admin')
const daftarPengajuanAdmin = document.getElementById('daftar-pengajuan-admin')
const daftarPengajuanHapusAdmin = document.getElementById('daftar-pengajuan-hapus-admin')
const daftarLogHapusAdmin = document.getElementById('daftar-log-hapus-admin')
const daftarLeaderboard = document.getElementById('daftar-leaderboard')
const daftarLogAktivitas = document.getElementById('daftar-log-aktivitas')

const formBroadcastNotif = document.getElementById('form-broadcast-notif')
const broadcastTarget = document.getElementById('broadcast-target')

const wadahTombolProfil = document.getElementById('wadah-tombol-profil')
const btnBukaEdit = document.getElementById('btn-buka-edit-profil')
const btnTutupEdit = document.getElementById('btn-tutup-edit-profil')
const btnHapusFotoProfil = document.getElementById('btn-hapus-foto-profil')
const modalEdit = document.getElementById('modal-edit-profil')
const formEditProfil = document.getElementById('form-edit-profil')

const btnBukaPengajuan = document.getElementById('btn-buka-pengajuan-peran')
const btnTutupPengajuan = document.getElementById('btn-tutup-pengajuan-peran')
const modalPengajuan = document.getElementById('modal-pengajuan-peran')
const formPengajuanPeran = document.getElementById('form-pengajuan-peran')

const btnBukaNotif = document.getElementById('btn-buka-notif')
const btnTutupNotif = document.getElementById('btn-tutup-notif')
const modalNotif = document.getElementById('modal-notifikasi')
const notifBadge = document.getElementById('notif-badge')
const listNotifEl = document.getElementById('daftar-notifikasi-list')

const btnBukaHapusEkstra = document.getElementById('btn-buka-hapus-ekstra')
const modalHapusEkstra = document.getElementById('modal-hapus-ekstra')
const btnTutupModalHapus = document.getElementById('btn-tutup-modal-hapus')
const formHapusEkstra = document.getElementById('form-hapus-ekstra')

const modalPreview = document.getElementById('modal-preview-foto')
const gambarModal = document.getElementById('gambar-modal-nota')
const btnTutupModal = document.getElementById('btn-tutup-modal')

const modalPublik = document.getElementById('modal-profil-publik')
const modalPublikAvatar = document.getElementById('modal-publik-avatar')
const modalPublikNama = document.getElementById('modal-publik-nama')
const modalPublikRole = document.getElementById('modal-publik-role')
const modalPublikBio = document.getElementById('modal-publik-bio')
const modalPublikPoin = document.getElementById('modal-publik-poin')
const modalPublikDibuat = document.getElementById('modal-publik-dibuat')
const btnTutupPublik = document.getElementById('btn-tutup-modal-publik')

const linkKeDaftar = document.getElementById('link-ke-daftar')
const linkKeMasuk = document.getElementById('link-ke-masuk')
const linkLupaSandi = document.getElementById('link-lupa-sandi')
const linkBatalLupa = document.getElementById('link-batal-lupa')
const btnKeluar = document.getElementById('btn-keluar')
const btnDemoList = document.querySelectorAll('.btn-demo')
const btnTindakanList = document.querySelectorAll('.btn-tindakan')

let penggunaAktif = JSON.parse(localStorage.getItem('classhub_user')) || null
let timerEksplorasi = null
let timerDurasiSesi = null
let timerPollingNotif = null
let detikSesi = 0

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(angka)
}

function formatWaktuPresisi(waktuString) {
    if (!waktuString) return '-'
    const d = new Date(waktuString)
    const tgl = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    const jam = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    return `${tgl}, ${jam} WIB`
}

function formatDurasiTeks(totalDetik) {
    const min = Math.floor(totalDetik / 60)
    const sec = totalDetik % 60
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function gantiHalaman(targetId) {
    daftarHalaman.forEach(h => h.classList.remove('aktif'))
    tombolNav.forEach(t => t.classList.remove('aktif'))

    const halamanAktif = document.getElementById(targetId)
    if (halamanAktif) halamanAktif.classList.add('aktif')

    const tombolAktif = document.querySelector(`[data-target="${targetId}"]`)
    if (tombolAktif) {
        tombolAktif.classList.add('aktif')
        judulHalaman.textContent = tombolAktif.textContent
    }

    if (targetId === 'halaman-rekapan-kas') muatRekapanKas()
    if (targetId === 'halaman-profil') {
        sinkronisasiProfilSaya()
        muatLeaderboard()
        muatLogAktivitas()
    }
}

function renderAvatarHtml(urlFoto, ukuran = 34) {
    if (urlFoto) {
        return `<img src="/uploads/${urlFoto}" alt="Avatar" style="width:${ukuran}px; height:${ukuran}px; border-radius:50%; object-fit:cover;">`
    }
    return `<svg viewBox="0 0 24 24" style="width:${ukuran * 0.6}px; height:${ukuran * 0.6}px; stroke:var(--clr-text-muted); fill:none; stroke-width:1.5;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
}

async function sinkronisasiProfilSaya() {
    if (!penggunaAktif || penggunaAktif.role === 'visitor') return
    try {
        const respon = await fetch('/api/siswa/me/' + penggunaAktif.nis)
        const hasil = await respon.json()
        if (hasil.status === 'success') {
            penggunaAktif = hasil.data
            localStorage.setItem('classhub_user', JSON.stringify(penggunaAktif))
            
            if (hasil.pengajuan_pending) {
                if (btnBukaPengajuan) {
                    btnBukaPengajuan.disabled = true
                    btnBukaPengajuan.textContent = '[Pengajuan Peran Pending]'
                    btnBukaPengajuan.style.opacity = '0.6'
                    btnBukaPengajuan.style.cursor = 'not-allowed'
                }
            } else if (penggunaAktif.role === 'siswa') {
                if (btnBukaPengajuan) {
                    btnBukaPengajuan.disabled = false
                    btnBukaPengajuan.textContent = 'Ajukan Peran Pengurus'
                    btnBukaPengajuan.style.opacity = '1'
                    btnBukaPengajuan.style.cursor = 'pointer'
                    btnBukaPengajuan.style.display = 'inline-block'
                }
            } else {
                if (btnBukaPengajuan) btnBukaPengajuan.style.display = 'none'
            }

            perbaruiAksesVisual()
        }
    } catch (e) {}
}

function perbaruiAksesVisual() {
    if (!penggunaAktif) return

    badgeRole.textContent = penggunaAktif.role
    sapaanPengguna.textContent = 'Halo, ' + penggunaAktif.nama

    profilNama.textContent = penggunaAktif.nama
    profilNis.textContent = penggunaAktif.role === 'visitor' ? 'Akun Visitor' : 'NIS: ' + penggunaAktif.nis
    profilEmail.textContent = 'Email: ' + (penggunaAktif.email || '-')
    profilBio.textContent = penggunaAktif.bio || 'Siswa XI RPL SMKN 1 Jakarta'
    profilPoin.textContent = 'Poin Keaktifan: ' + (penggunaAktif.poin || 0) + ' Pts'
    profilDibuat.textContent = 'Akun dibuat: ' + formatWaktuPresisi(penggunaAktif.created_at)
    profilRoleBadge.textContent = penggunaAktif.role

    if (profilAvatarWadah) profilAvatarWadah.innerHTML = renderAvatarHtml(penggunaAktif.foto_profil, 56)
    if (headerAvatarContainer) headerAvatarContainer.innerHTML = renderAvatarHtml(penggunaAktif.foto_profil, 34)

    if (penggunaAktif.role === 'siswa' || penggunaAktif.role === 'visitor') {
        peringatanSiswa.style.display = 'block'
        peringatanSiswa.textContent = penggunaAktif.role === 'visitor' ? 'Mode Visitor (Readonly): Tidak bisa posting, komentar, atau vote.' : 'Mode Siswa: Hanya Pengurus dan Admin yang punya akses input kas.'
        btnSubmitKas.disabled = true
        btnSubmitKas.style.opacity = '0.5'
        btnSubmitKas.style.cursor = 'not-allowed'
    } else {
        peringatanSiswa.style.display = 'none'
        btnSubmitKas.disabled = false
        btnSubmitKas.style.opacity = '1'
        btnSubmitKas.style.cursor = 'pointer'
    }

    if (penggunaAktif.role === 'admin') {
        if (panelAdmin) panelAdmin.style.display = 'block'
        ambilAnggota()
        ambilPengajuanPeran()
        ambilPengajuanHapus()
        ambilLogHapus()
    } else {
        if (panelAdmin) panelAdmin.style.display = 'none'
    }
}

function perbaruiAkses() {
    if (!penggunaAktif) {
        navigasiUtama.style.display = 'none'
        badgeRole.style.display = 'none'
        if (btnBukaNotif) btnBukaNotif.style.display = 'none'
        sapaanPengguna.textContent = 'Selamat Datang'
        gantiHalaman('halaman-masuk')
        if (timerEksplorasi) clearInterval(timerEksplorasi)
        if (timerDurasiSesi) clearInterval(timerDurasiSesi)
        if (timerPollingNotif) clearInterval(timerPollingNotif)
        return
    }

    navigasiUtama.style.display = 'flex'
    badgeRole.style.display = 'block'
    if (btnBukaNotif) btnBukaNotif.style.display = 'flex'

    if (penggunaAktif.role === 'visitor') {
        if (wadahTombolProfil) wadahTombolProfil.style.display = 'none'
        if (btnBukaHapusEkstra) btnBukaHapusEkstra.style.display = 'none'
    } else {
        if (wadahTombolProfil) wadahTombolProfil.style.display = 'flex'
        if (btnBukaHapusEkstra) btnBukaHapusEkstra.style.display = 'block'
    }

    perbaruiAksesVisual()
    sinkronisasiProfilSaya()
    muatNotifikasi()
    mulaiTimerEksplorasi()
    mulaiTimerDurasiSesi()
    mulaiPollingNotif()
}

function mulaiPollingNotif() {
    if (timerPollingNotif) clearInterval(timerPollingNotif)
    timerPollingNotif = setInterval(() => {
        muatNotifikasi()
    }, 3000)
}

function mulaiTimerDurasiSesi() {
    if (timerDurasiSesi) clearInterval(timerDurasiSesi)
    detikSesi = 0
    timerDurasiSesi = setInterval(() => {
        detikSesi++
        if (profilDurasiOnline) profilDurasiOnline.textContent = 'Durasi Sesi: ' + formatDurasiTeks(detikSesi)
    }, 1000)
}

async function muatNotifikasi() {
    if (!penggunaAktif || penggunaAktif.role === 'visitor' || !notifBadge) return
    try {
        const respon = await fetch('/api/notifikasi/' + penggunaAktif.nis)
        const hasil = await respon.json()
        if (hasil.status === 'success') {
            const count = hasil.unread || 0
            if (count > 0) {
                notifBadge.style.display = 'block'
                notifBadge.textContent = count
            } else {
                notifBadge.style.display = 'none'
            }

            if (listNotifEl) {
                const dataNotif = hasil.data
                if (dataNotif.length === 0) {
                    listNotifEl.innerHTML = '<li style="font-size:0.8rem; color:var(--clr-text-muted); text-align:center;">Tidak ada pemberitahuan</li>'
                } else {
                    listNotifEl.innerHTML = dataNotif.map(n => `
                        <li style="padding:8px 10px; border:1px solid var(--clr-border-light); border-radius:var(--radius-sm); background-color:${n.is_read ? 'var(--clr-card)' : 'var(--clr-accent-bg)'};">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <strong style="font-size:0.8rem; color:var(--clr-primary);">${n.judul}</strong>
                                <small style="font-size:0.65rem; color:var(--clr-text-muted);">${formatWaktuPresisi(n.created_at)}</small>
                            </div>
                            <p style="font-size:0.75rem; color:var(--clr-text-secondary); margin-top:4px; white-space:pre-wrap;">${n.pesan}</p>
                            ${n.pengirim_nama ? `<small style="font-size:0.65rem; color:var(--clr-primary); font-weight:700; display:block; margin-top:2px;">Pengirim: ${n.pengirim_nama}</small>` : ''}
                        </li>
                    `).join('')
                }
            }
        }
    } catch (e) {}
}

if (btnBukaNotif) {
    btnBukaNotif.addEventListener('click', async () => {
        if (!penggunaAktif) return
        modalNotif.classList.add('aktif')
        try {
            await fetch('/api/notifikasi/baca', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nis: penggunaAktif.nis })
            })
            notifBadge.style.display = 'none'
        } catch (e) {}
    })
}

if (btnTutupNotif) {
    btnTutupNotif.addEventListener('click', () => modalNotif.classList.remove('aktif'))
}

modalNotif.addEventListener('click', (e) => {
    if (e.target === modalNotif) modalNotif.classList.remove('aktif')
})

if (formBroadcastNotif) {
    formBroadcastNotif.addEventListener('submit', async (e) => {
        e.preventDefault()
        if (!penggunaAktif) return
        const target_nis = broadcastTarget.value
        const judul = document.getElementById('broadcast-judul').value
        const pesan = document.getElementById('broadcast-pesan').value

        try {
            const respon = await fetch('/api/notifikasi/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pengirim_nis: penggunaAktif.nis,
                    pengirim_nama: penggunaAktif.nama,
                    target_nis,
                    judul,
                    pesan
                })
            })
            const hasil = await respon.json()
            if (hasil.status === 'success') {
                alert('Pesan notifikasi broadcast berhasil terkirim ke seluruh member!')
                formBroadcastNotif.reset()
                muatNotifikasi()
            } else {
                alert('Gagal: ' + hasil.message)
            }
        } catch (err) {
            alert('Kesalahan koneksi ke server')
        }
    })
}

async function muatLogAktivitas() {
    if (!daftarLogAktivitas || !penggunaAktif) return
    try {
        const queryNis = penggunaAktif.role === 'admin' ? 'ADMIN_ALL' : penggunaAktif.nis
        const respon = await fetch('/api/log-aktivitas/' + queryNis)
        const hasil = await respon.json()
        if (hasil.status === 'success') {
            const list = hasil.data
            if (list.length === 0) {
                daftarLogAktivitas.innerHTML = '<li style="font-size:0.75rem; color:var(--clr-text-muted);">Belum ada riwayat aktivitas</li>'
                return
            }
            daftarLogAktivitas.innerHTML = list.map(item => `
                <li style="font-size:0.75rem; color:var(--clr-text-secondary); display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid var(--clr-border-light);">
                    <span>${penggunaAktif.role === 'admin' ? `<strong>${item.nama}:</strong> ` : ''}${item.aktivitas}</span>
                    <small style="color:var(--clr-text-muted); font-size:0.65rem;">${formatWaktuPresisi(item.created_at)}</small>
                </li>
            `).join('')
        }
    } catch (err) {}
}

function mulaiTimerEksplorasi() {
    if (timerEksplorasi) clearInterval(timerEksplorasi)
    let detik = 0
    timerEksplorasi = setInterval(async () => {
        detik++
        if (detik >= 180) {
            detik = 0
            if (penggunaAktif && penggunaAktif.nis !== 'VISITOR') {
                try {
                    await fetch('/api/siswa/poin', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nis: penggunaAktif.nis, jumlah: 5 })
                    })
                    penggunaAktif.poin = (penggunaAktif.poin || 0) + 5
                    localStorage.setItem('classhub_user', JSON.stringify(penggunaAktif))
                    profilPoin.textContent = 'Poin Keaktifan: ' + penggunaAktif.poin + ' Pts'
                    alert('Selamat! Kamu dapat +5 Poin keaktifan karena menjelajahi website selama 3 menit!')
                    muatLeaderboard()
                } catch (e) {}
            }
        }
    }, 1000)
}

window.bukaProfilPublik = async function(nis) {
    if (!nis || nis === 'VISITOR') return
    try {
        const respon = await fetch('/api/siswa/publik/' + nis)
        const hasil = await respon.json()
        if (hasil.status === 'success') {
            const d = hasil.data
            modalPublikAvatar.innerHTML = renderAvatarHtml(d.foto_profil, 64)
            modalPublikNama.textContent = d.nama
            modalPublikRole.textContent = d.role
            modalPublikBio.textContent = d.bio || 'Siswa XI RPL SMKN 1 Jakarta'
            modalPublikPoin.textContent = 'Poin Keaktifan: ' + (d.poin || 0) + ' Pts'
            modalPublikDibuat.textContent = 'Bergabung sejak: ' + formatWaktuPresisi(d.created_at)
            modalPublik.classList.add('aktif')
        }
    } catch (err) {
        console.error('Gagal memuat profil publik:', err)
    }
}

window.bukaProfilPublikSaya = function() {
    if (penggunaAktif && penggunaAktif.nis !== 'VISITOR') bukaProfilPublik(penggunaAktif.nis)
}

if (btnTutupPublik) {
    btnTutupPublik.addEventListener('click', () => modalPublik.classList.remove('aktif'))
}

modalPublik.addEventListener('click', (e) => {
    if (e.target === modalPublik) modalPublik.classList.remove('aktif')
})

async function muatLeaderboard() {
    if (!daftarLeaderboard) return
    try {
        const respon = await fetch('/api/leaderboard')
        const hasil = await respon.json()
        if (hasil.status === 'success') {
            const dataSiswa = hasil.data
            if (dataSiswa.length === 0) {
                daftarLeaderboard.innerHTML = '<li>Belum ada anggota tergabung</li>'
                return
            }
            daftarLeaderboard.innerHTML = dataSiswa.map((s, idx) => `
                <li style="display:flex; align-items:center; gap:10px; padding:6px 8px; border:1px solid var(--clr-border-light); border-radius:var(--radius-sm); background-color:var(--clr-card);">
                    <span style="font-weight:800; font-size:0.8rem; color:var(--clr-primary); width:20px;">#${idx + 1}</span>
                    <div style="cursor:pointer;" onclick="bukaProfilPublik('${s.nis}')">
                        ${renderAvatarHtml(s.foto_profil, 30)}
                    </div>
                    <div style="flex:1; cursor:pointer;" onclick="bukaProfilPublik('${s.nis}')">
                        <strong style="font-size:0.8rem; display:block;">${s.nama}</strong>
                        <small style="font-size:0.65rem; color:var(--clr-text-muted);">${s.total_skor || 0} Pts (Poin: ${s.poin || 0})</small>
                    </div>
                    <span class="lencana-peran" style="font-size:0.6rem;">${s.role}</span>
                </li>
            `).join('')
        }
    } catch (err) {
        daftarLeaderboard.innerHTML = '<li>Gagal memuat leaderboard</li>'
    }
}

if (btnBukaEdit) {
    btnBukaEdit.addEventListener('click', () => {
        if (!penggunaAktif) return
        document.getElementById('edit-nama').value = penggunaAktif.nama
        document.getElementById('edit-email').value = penggunaAktif.email || ''
        document.getElementById('edit-bio').value = penggunaAktif.bio || ''
        if (penggunaAktif.foto_profil) {
            btnHapusFotoProfil.style.display = 'block'
        } else {
            btnHapusFotoProfil.style.display = 'none'
        }
        modalEdit.classList.add('aktif')
    })
}

if (btnHapusFotoProfil) {
    btnHapusFotoProfil.addEventListener('click', async () => {
        if (!penggunaAktif || !confirm('Yakin ingin menghapus foto profil?')) return
        try {
            const respon = await fetch('/api/siswa/hapus-foto/' + penggunaAktif.nis, { method: 'POST' })
            const hasil = await respon.json()
            if (hasil.status === 'success') {
                alert('Foto profil berhasil dihapus!')
                penggunaAktif = hasil.data
                localStorage.setItem('classhub_user', JSON.stringify(penggunaAktif))
                btnHapusFotoProfil.style.display = 'none'
                perbaruiAksesVisual()
                modalEdit.classList.remove('aktif')
            }
        } catch (e) {}
    })
}

if (btnTutupEdit) {
    btnTutupEdit.addEventListener('click', () => modalEdit.classList.remove('aktif'))
}

modalEdit.addEventListener('click', (e) => {
    if (e.target === modalEdit) modalEdit.classList.remove('aktif')
})

if (btnBukaPengajuan) {
    btnBukaPengajuan.addEventListener('click', () => {
        if (!penggunaAktif || penggunaAktif.role !== 'siswa' || btnBukaPengajuan.disabled) return
        modalPengajuan.classList.add('aktif')
    })
}

if (btnTutupPengajuan) {
    btnTutupPengajuan.addEventListener('click', () => modalPengajuan.classList.remove('aktif'))
}

modalPengajuan.addEventListener('click', (e) => {
    if (e.target === modalPengajuan) modalPengajuan.classList.remove('aktif')
})

if (btnBukaHapusEkstra) {
    btnBukaHapusEkstra.addEventListener('click', () => {
        if (!penggunaAktif || penggunaAktif.role === 'visitor') return
        document.getElementById('hapus-nis').value = penggunaAktif.nis
        modalHapusEkstra.classList.add('aktif')
    })
}

if (btnTutupModalHapus) {
    btnTutupModalHapus.addEventListener('click', () => modalHapusEkstra.classList.remove('aktif'))
}

modalHapusEkstra.addEventListener('click', (e) => {
    if (e.target === modalHapusEkstra) modalHapusEkstra.classList.remove('aktif')
})

if (formHapusEkstra) {
    formHapusEkstra.addEventListener('submit', async (e) => {
        e.preventDefault()
        const nis = document.getElementById('hapus-nis').value
        const password = document.getElementById('hapus-password').value
        const alasan = document.getElementById('hapus-alasan').value

        try {
            const respon = await fetch('/api/siswa/hapus-ekstra', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nis, password, alasan })
            })
            const hasil = await respon.json()
            if (hasil.status === 'success') {
                alert('Pengajuan hapus akun kamu berhasil dikirim ke Admin/Pengurus! Cek notifikasi secara berkala.')
                modalHapusEkstra.classList.remove('aktif')
                muatNotifikasi()
            } else {
                alert('Gagal: ' + hasil.message)
            }
        } catch (err) {
            alert('Kesalahan koneksi ke server')
        }
    })
}

if (formPengajuanPeran) {
    formPengajuanPeran.addEventListener('submit', async (e) => {
        e.preventDefault()
        if (!penggunaAktif) return
        const peran_diajukan = document.getElementById('pengajuan-peran').value
        const alasan = document.getElementById('pengajuan-alasan').value

        try {
            const respon = await fetch('/api/siswa/pengajuan-peran', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nis: penggunaAktif.nis, peran_diajukan, alasan })
            })
            const hasil = await respon.json()
            if (hasil.status === 'success') {
                alert('Pengajuan peran berhasil dikirim! Status bisa kamu pantau di ikon lonceng notifikasi header.')
                modalPengajuan.classList.remove('aktif')
                formPengajuanPeran.reset()
                sinkronisasiProfilSaya()
                muatNotifikasi()
            } else {
                alert('Gagal: ' + hasil.message)
            }
        } catch (err) {
            alert('Kesalahan koneksi ke server')
        }
    })
}

if (formEditProfil) {
    formEditProfil.addEventListener('submit', async (e) => {
        e.preventDefault()
        if (!penggunaAktif) return
        const dataForm = new FormData(formEditProfil)
        try {
            const respon = await fetch('/api/siswa/profil/' + penggunaAktif.nis, {
                method: 'PUT',
                body: dataForm
            })
            const hasil = await respon.json()
            if (hasil.status === 'success') {
                alert('Profil berhasil diperbarui!')
                penggunaAktif = hasil.data
                localStorage.setItem('classhub_user', JSON.stringify(penggunaAktif))
                modalEdit.classList.remove('aktif')
                perbaruiAksesVisual()
                muatLeaderboard()
                muatLogAktivitas()
            } else {
                alert('Gagal update: ' + hasil.message)
            }
        } catch (err) {
            alert('Kesalahan koneksi ke server')
        }
    })
}

async function ambilAnggota() {
    if (!daftarAdmin) return
    try {
        const respon = await fetch('/api/anggota')
        const hasil = await respon.json()
        if (hasil.status === 'success') tampilAnggota(hasil.data)
    } catch (err) {
        console.error('Gagal mengambil daftar anggota:', err)
    }
}

function tampilAnggota(daftar) {
    if (!daftar || daftar.length === 0) {
        daftarAdmin.innerHTML = '<li>Belum ada anggota terdaftar</li>'
        return
    }

    if (broadcastTarget) {
        broadcastTarget.innerHTML = '<option value="SEMUA">Semua Member (Broadcast)</option>' + daftar.map(s => `<option value="${s.nis}">${s.nama} (${s.nis})</option>`).join('')
    }

    const isGodModeAdmin = penggunaAktif && penggunaAktif.role === 'admin'

    daftarAdmin.innerHTML = daftar.map(item => `
        <li class="item-anggota-admin" style="display:flex; flex-direction:column; gap:4px;">
            <div class="baris-info-anggota">
                <strong style="cursor:pointer;" onclick="bukaProfilPublik('${item.nis}')">${item.nama} (${item.nis})</strong>
                <span class="lencana-status ${item.status}">${item.status.toUpperCase()}</span>
            </div>
            <div class="baris-info-anggota">
                <small>${item.email || 'Tanpa Email'}</small>
                ${isGodModeAdmin ? `
                    <div style="display:flex; align-items:center; gap:4px;">
                        <span style="font-size:0.7rem; font-weight:700;">Role:</span>
                        <select onchange="ubahRoleSiswaDirect('${item.nis}', this.value)" style="font-size:0.7rem; padding:2px 4px;">
                            <option value="siswa" ${item.role === 'siswa' ? 'selected' : ''}>Siswa</option>
                            <option value="bendahara" ${item.role === 'bendahara' ? 'selected' : ''}>Bendahara</option>
                            <option value="sekretaris" ${item.role === 'sekretaris' ? 'selected' : ''}>Sekretaris</option>
                            <option value="ketua" ${item.role === 'ketua' ? 'selected' : ''}>Ketua</option>
                            <option value="guru" ${item.role === 'guru' ? 'selected' : ''}>Guru</option>
                            <option value="admin" ${item.role === 'admin' ? 'selected' : ''}>Admin</option>
                            <option value="visitor" ${item.role === 'visitor' ? 'selected' : ''}>Visitor</option>
                        </select>
                    </div>
                ` : `<span class="lencana-peran">${item.role}</span>`}
                ${item.status === 'pending' ? `<button type="button" class="btn-aksi-admin" onclick="setujuiAkun('${item.nis}')">Setujui</button>` : ''}
            </div>
        </li>
    `).join('')
}

window.ubahRoleSiswaDirect = async function(nis, peranBaru) {
    if (!confirm(`Ubah role NIS ${nis} menjadi ${peranBaru}?`)) return
    try {
        const respon = await fetch('/api/anggota/peran', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nis, peranBaru })
        })
        const hasil = await respon.json()
        if (hasil.status === 'success') {
            alert(`Role siswa ${nis} sukses diubah jadi ${peranBaru}!`)
            if (penggunaAktif && penggunaAktif.nis === nis) {
                penggunaAktif.role = peranBaru
                localStorage.setItem('classhub_user', JSON.stringify(penggunaAktif))
                perbaruiAkses()
            }
            ambilAnggota()
            muatLeaderboard()
            muatNotifikasi()
        }
    } catch (e) {}
}

async function ambilPengajuanPeran() {
    if (!daftarPengajuanAdmin) return
    try {
        const respon = await fetch('/api/admin/pengajuan-peran')
        const hasil = await respon.json()
        if (hasil.status === 'success') {
            const list = hasil.data
            if (list.length === 0) {
                daftarPengajuanAdmin.innerHTML = '<li class="item-anggota-admin">Belum ada pengajuan peran baru</li>'
                return
            }
            daftarPengajuanAdmin.innerHTML = list.map(item => `
                <li class="item-anggota-admin" style="display:flex; flex-direction:column; gap:4px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="cursor:pointer;" onclick="bukaProfilPublik('${item.siswa_nis}')">${item.siswa_nama} (${item.siswa_nis})</strong>
                        <span class="lencana-peran">${item.peran_diajukan}</span>
                    </div>
                    <p style="font-size:0.75rem; color:var(--clr-text-secondary); margin:2px 0;">Alasan: ${item.alasan}</p>
                    <div style="display:flex; gap:6px; margin-top:4px;">
                        <button type="button" class="btn-aksi-admin" onclick="prosesPengajuanPeran(${item.id}, 'disetujui', '${item.siswa_nis}', '${item.peran_diajukan}')">Setujui</button>
                        <button type="button" class="btn-hapus-inline" onclick="prosesPengajuanPeran(${item.id}, 'ditolak', '${item.siswa_nis}', '${item.peran_diajukan}')">Tolak</button>
                    </div>
                </li>
            `).join('')
        }
    } catch (err) {}
}

window.prosesPengajuanPeran = async function(id, status, nis, peran_diajukan) {
    try {
        const respon = await fetch('/api/admin/setujui-peran', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status, nis, peran_diajukan })
        })
        const hasil = await respon.json()
        if (hasil.status === 'success') {
            alert('Pengajuan berhasil di' + status)
            if (penggunaAktif && penggunaAktif.nis === nis && status === 'disetujui') {
                penggunaAktif.role = peran_diajukan
                localStorage.setItem('classhub_user', JSON.stringify(penggunaAktif))
                perbaruiAkses()
            }
            ambilPengajuanPeran()
            ambilAnggota()
            muatLeaderboard()
            muatNotifikasi()
        }
    } catch (err) {}
}

async function ambilPengajuanHapus() {
    if (!daftarPengajuanHapusAdmin) return
    try {
        const respon = await fetch('/api/admin/pengajuan-hapus')
        const hasil = await respon.json()
        if (hasil.status === 'success') {
            const list = hasil.data
            if (list.length === 0) {
                daftarPengajuanHapusAdmin.innerHTML = '<li class="item-anggota-admin">Belum ada permintaan hapus akun</li>'
                return
            }
            daftarPengajuanHapusAdmin.innerHTML = list.map(item => `
                <li class="item-anggota-admin" style="display:flex; flex-direction:column; gap:4px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="color:var(--clr-danger);">${item.nama} (${item.siswa_nis})</strong>
                        <small style="font-size:0.65rem; color:var(--clr-text-muted);">${formatWaktuPresisi(item.created_at)}</small>
                    </div>
                    <p style="font-size:0.75rem; color:var(--clr-text-secondary);">Alasan Hapus: ${item.alasan}</p>
                    <div style="display:flex; gap:6px; margin-top:4px;">
                        <button type="button" class="btn-bahaya" style="padding:4px 8px; font-size:0.7rem;" onclick="prosesPengajuanHapus(${item.id}, 'disetujui', '${item.siswa_nis}', '${item.nama}', '${item.alasan.replace(/'/g, "\\'")}')">Setujui Hapus</button>
                        <button type="button" class="btn-tindakan" style="padding:4px 8px; font-size:0.7rem;" onclick="prosesPengajuanHapus(${item.id}, 'ditolak', '${item.siswa_nis}', '${item.nama}', '${item.alasan.replace(/'/g, "\\'")}')">Tolak</button>
                    </div>
                </li>
            `).join('')
        }
    } catch (err) {}
}

window.prosesPengajuanHapus = async function(id, status, nis, nama, alasan) {
    if (status === 'disetujui' && !confirm(`Yakin ingin menyetujui penghapusan permanen akun ${nama} (${nis})?`)) return
    try {
        const respon = await fetch('/api/admin/setujui-hapus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status, nis, nama, alasan })
        })
        const hasil = await respon.json()
        if (hasil.status === 'success') {
            alert('Pengajuan hapus akun berhasil di' + status)
            ambilPengajuanHapus()
            ambilLogHapus()
            ambilAnggota()
            muatLeaderboard()
            muatNotifikasi()
        }
    } catch (err) {}
}

async function ambilLogHapus() {
    if (!daftarLogHapusAdmin) return
    try {
        const respon = await fetch('/api/admin/log-hapus')
        const hasil = await respon.json()
        if (hasil.status === 'success') {
            const list = hasil.data
            if (list.length === 0) {
                daftarLogHapusAdmin.innerHTML = '<li class="item-anggota-admin">Belum ada catatan penghapusan akun</li>'
                return
            }
            daftarLogHapusAdmin.innerHTML = list.map(item => `
                <li class="item-anggota-admin" style="display:flex; flex-direction:column; gap:2px;">
                    <div style="display:flex; justify-content:space-between;">
                        <strong style="color:var(--clr-danger);">${item.nama} (${item.nis})</strong>
                        <small style="font-size:0.65rem; color:var(--clr-text-muted);">${formatWaktuPresisi(item.created_at)}</small>
                    </div>
                    <p style="font-size:0.75rem; color:var(--clr-text-secondary);">Alasan Hapus: ${item.alasan}</p>
                </li>
            `).join('')
        }
    } catch (err) {}
}

window.setujuiAkun = async function(nis) {
    try {
        const respon = await fetch('/api/anggota/setujui', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nis, statusBaru: 'aktif' })
        })
        const hasil = await respon.json()
        if (hasil.status === 'success') {
            alert('Akun NIS ' + nis + ' berhasil diverifikasi!')
            ambilAnggota()
            muatLeaderboard()
        } else {
            alert('Gagal memverifikasi: ' + hasil.message)
        }
    } catch (err) {
        alert('Kesalahan koneksi server')
    }
}

window.bukaModalFoto = function(urlFoto) {
    gambarModal.src = '/uploads/' + urlFoto
    modalPreview.classList.add('aktif')
}

if (btnTutupModal) {
    btnTutupModal.addEventListener('click', () => modalPreview.classList.remove('aktif'))
}

modalPreview.addEventListener('click', (e) => {
    if (e.target === modalPreview) modalPreview.classList.remove('aktif')
})

tombolNav.forEach(tombol => {
    tombol.addEventListener('click', () => {
        const targetId = tombol.getAttribute('data-target')
        gantiHalaman(targetId)
        if (targetId === 'halaman-beranda' || targetId === 'halaman-uang-kas') ambilKas()
    })
})

btnTindakanList.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-halaman')
        gantiHalaman(targetId)
        if (targetId === 'halaman-beranda' || targetId === 'halaman-uang-kas') ambilKas()
    })
})

async function ambilKas() {
    try {
        const respon = await fetch('/api/kas')
        const hasil = await respon.json()
        if (hasil.status === 'success') {
            const dataKas = hasil.data
            berandaSaldo.textContent = formatRupiah(dataKas.saldo)
            berandaMasuk.textContent = formatRupiah(dataKas.total_masuk)
            berandaKeluar.textContent = formatRupiah(dataKas.total_keluar)
            if (kasMasukDetail) kasMasukDetail.textContent = formatRupiah(dataKas.total_masuk)
            if (kasKeluarDetail) kasKeluarDetail.textContent = formatRupiah(dataKas.total_keluar)
            kasSaldo.textContent = formatRupiah(dataKas.saldo)
            tampilKas(dataKas.riwayat)
        }
    } catch (err) {
        console.error('Gagal mengambil data kas:', err)
    }
}

function tampilKas(riwayat) {
    if (!riwayat || riwayat.length === 0) {
        daftarKas.innerHTML = '<li>Belum ada transaksi kas</li>'
        return
    }

    const bisaHapus = penggunaAktif && (penggunaAktif.role === 'admin' || penggunaAktif.role === 'bendahara' || penggunaAktif.role === 'ketua')

    daftarKas.innerHTML = riwayat.map(item => `
        <li class="kartu-kas-feed">
            <div class="header-kas-item">
                <div style="display:flex; gap:8px; align-items:flex-start;">
                    <div style="cursor:pointer; margin-top:2px;" onclick="bukaProfilPublik('${item.pembuat_nis}')">
                        ${renderAvatarHtml(item.pembuat_foto, 32)}
                    </div>
                    <div>
                        <strong>${item.keterangan}</strong>
                        <div class="info-penginput">
                            <span>${formatWaktuPresisi(item.created_at)}</span> &bull;
                            <span style="cursor:pointer; text-decoration:underline;" onclick="bukaProfilPublik('${item.pembuat_nis}')">${item.pembuat_nama ? item.pembuat_nama : 'Pengurus Kelas'}</span>
                        </div>
                    </div>
                </div>
                <div style="text-align:right;">
                    <span style="color: ${item.jenis === 'masuk' ? 'var(--clr-success)' : 'var(--clr-danger)'}; font-weight:700; font-size:0.95rem;">
                        ${item.jenis === 'masuk' ? '+' : '-'} ${formatRupiah(item.nominal)}
                    </span>
                    ${bisaHapus ? `<br><button type="button" class="btn-hapus-inline" onclick="hapusKas(${item.id})">Apus!!</button>` : ''}
                </div>
            </div>

            ${item.foto_nota ? `<div><button type="button" class="btn-link-inline" onclick="bukaModalFoto('${item.foto_nota}')">Liat foto/bukti</button></div>` : ''}

            <div class="baris-reaksi">
                <button type="button" class="btn-reaksi" onclick="kirimReaksi(${item.id}, 'suka')">Suka ${item.reaksi_suka || 0}</button>
                <button type="button" class="btn-reaksi" onclick="kirimReaksi(${item.id}, 'love')">Love ${item.reaksi_love || 0}</button>
                <button type="button" class="btn-reaksi" onclick="kirimReaksi(${item.id}, 'kaget')">Wow ${item.reaksi_kaget || 0}</button>
                <button type="button" class="btn-buka-komentar" onclick="toggleKomentar(${item.id})">Komentar (${item.jumlah_komentar || 0})</button>
            </div>

            <div id="kotak-komentar-${item.id}" class="kotak-komentar" style="display:none;">
                <ul id="list-komentar-${item.id}" class="daftar-komentar-list"><li>Memuat komentar...</li></ul>
                <div class="form-tambah-komentar">
                    <textarea id="input-komentar-${item.id}" placeholder="Tulis komentar (Shift+Enter untuk baris baru)..." rows="1" onkeydown="handleKomentarKey(event, ${item.id})" ${!penggunaAktif || penggunaAktif.role === 'visitor' ? 'disabled' : ''}></textarea>
                    <button type="button" onclick="kirimKomentar(${item.id})" ${!penggunaAktif || penggunaAktif.role === 'visitor' ? 'disabled' : ''}>Kirim</button>
                </div>
            </div>
        </li>
    `).join('')
}

window.handleKomentarKey = function(e, kasId) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        kirimKomentar(kasId)
    }
}

window.toggleKomentar = async function(kasId) {
    const wadah = document.getElementById('kotak-komentar-' + kasId)
    if (!wadah) return
    if (wadah.style.display === 'none') {
        wadah.style.display = 'flex'
        ambilKomentar(kasId)
    } else {
        wadah.style.display = 'none'
    }
}

async function ambilKomentar(kasId) {
    const listEl = document.getElementById('list-komentar-' + kasId)
    if (!listEl) return
    try {
        const respon = await fetch('/api/kas/' + kasId + '/komentar')
        const hasil = await respon.json()
        if (hasil.status === 'success') {
            if (hasil.data.length === 0) {
                listEl.innerHTML = '<li class="item-komentar">Belum ada komentar</li>'
                return
            }
            const isAdmin = penggunaAktif && (penggunaAktif.role === 'admin' || penggunaAktif.role === 'ketua')
            listEl.innerHTML = hasil.data.map(k => {
                const isMilikSendiri = penggunaAktif && penggunaAktif.nis === k.siswa_nis
                const bisaHapusKomen = isMilikSendiri || isAdmin
                return `
                    <li class="item-komentar">
                        <div style="display:flex; gap:6px; align-items:flex-start;">
                            <div style="cursor:pointer;" onclick="bukaProfilPublik('${k.siswa_nis}')">
                                ${renderAvatarHtml(k.siswa_foto, 24)}
                            </div>
                            <div style="flex:1;">
                                <strong style="cursor:pointer;" onclick="bukaProfilPublik('${k.siswa_nis}')">${k.siswa_nama}</strong>
                                <span style="font-size:0.65rem; color:var(--clr-text-muted); margin-left:6px;">${formatWaktuPresisi(k.created_at)}</span>
                                <p style="margin-top:2px; white-space:pre-wrap;">${k.komentar}</p>
                            </div>
                            <div style="display:flex; gap:4px; align-items:center;">
                                <button type="button" class="btn-reaksi" onclick="reaksiKomentar(${k.id}, '${kasId}', 'suka')">Suka ${k.suka_count || 0}</button>
                                <button type="button" class="btn-reaksi" onclick="reaksiKomentar(${k.id}, '${kasId}', 'dislike')">Dislike ${k.dislike_count || 0}</button>
                                <button type="button" class="btn-link-inline" style="font-size:0.7rem;" onclick="balasKomentar(${kasId}, '${k.siswa_nama}')">Balas</button>
                                ${bisaHapusKomen ? `<button type="button" class="btn-hapus-inline" onclick="hapusKomentar(${k.id}, ${kasId})">Hapus</button>` : ''}
                            </div>
                        </div>
                    </li>
                `
            }).join('')
        }
    } catch (err) {
        listEl.innerHTML = '<li class="item-komentar">Gagal memuat komentar</li>'
    }
}

window.balasKomentar = function(kasId, namaSiswa) {
    if (penggunaAktif && penggunaAktif.role === 'visitor') { alert('Visitor gabisa bales komentar'); return }
    const inputEl = document.getElementById('input-komentar-' + kasId)
    if (inputEl) {
        inputEl.value = `@${namaSiswa} ` + inputEl.value
        inputEl.focus()
    }
}

window.reaksiKomentar = async function(komentarId, kasId, tipe) {
    if (!penggunaAktif) { alert('Silakan login terlebih dahulu!'); return }
    if (penggunaAktif.role === 'visitor') { alert('Visitor gak bisa ngasih reaksi komentar!'); return }
    try {
        const respon = await fetch('/api/komentar/' + komentarId + '/reaksi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siswa_nis: penggunaAktif.nis, tipe })
        })
        const hasil = await respon.json()
        if (hasil.status === 'success') {
            ambilKomentar(kasId)
            muatLeaderboard()
            muatLogAktivitas()
        } else { alert(hasil.message) }
    } catch (err) { console.error('Gagal memberi reaksi komentar:', err) }
}

window.hapusKomentar = async function(komentarId, kasId) {
    if (!confirm('Hapus komentar ini?')) return
    try {
        const respon = await fetch('/api/komentar/' + komentarId, { method: 'DELETE' })
        const hasil = await respon.json()
        if (hasil.status === 'success') {
            ambilKomentar(kasId)
            ambilKas()
        } else {
            alert('Gagal: ' + hasil.message)
        }
    } catch (err) { alert('Kesalahan koneksi ke server') }
}

window.kirimKomentar = async function(kasId) {
    if (!penggunaAktif) { alert('Silakan login terlebih dahulu!'); return }
    if (penggunaAktif.role === 'visitor') { alert('Visitor gabisa ngirim komentar!'); return }
    const inputEl = document.getElementById('input-komentar-' + kasId)
    const isi = inputEl.value.trim()
    if (!isi) return
    try {
        const respon = await fetch('/api/kas/' + kasId + '/komentar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siswa_nis: penggunaAktif.nis, siswa_nama: penggunaAktif.nama, komentar: isi })
        })
        const hasil = await respon.json()
        if (hasil.status === 'success') {
            inputEl.value = ''
            ambilKomentar(kasId)
            ambilKas()
            muatLeaderboard()
            muatLogAktivitas()
        } else {
            alert('Gagal: ' + hasil.message)
        }
    } catch (err) { alert('Kesalahan koneksi server') }
}

window.kirimReaksi = async function(kasId, tipe) {
    if (!penggunaAktif) { alert('Silakan login terlebih dahulu!'); return }
    if (penggunaAktif.role === 'visitor') { alert('Visitor ga bisa bereaksi!'); return }
    try {
        const respon = await fetch('/api/kas/' + kasId + '/reaksi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siswa_nis: penggunaAktif.nis, tipe_reaksi: tipe })
        })
        const hasil = await respon.json()
        if (hasil.status === 'success') {
            ambilKas()
            muatLeaderboard()
            muatLogAktivitas()
        } else { alert(hasil.message) }
    } catch (err) { console.error('Gagal memberi reaksi:', err) }
}

window.hapusKas = async function(idKas) {
    if (!confirm('Yakin ingin menghapus riwayat kas ini?')) return
    try {
        const respon = await fetch('/api/kas/' + idKas, { method: 'DELETE' })
        const hasil = await respon.json()
        if (hasil.status === 'success') { alert('Transaksi kas sukses diapus!!'); ambilKas() }
        else alert('Gagal ngapus :( : ' + hasil.message)
    } catch (err) { alert('Kesalahan koneksi ke server') }
}

async function muatRekapanKas() {
    if (!tabelKasWadah) return
    try {
        const respon = await fetch('/api/kas')
        const hasil = await respon.json()
        if (hasil.status === 'success') {
            const riwayat = hasil.data.riwayat
            if (!riwayat || riwayat.length === 0) {
                tabelKasWadah.innerHTML = '<p>Belum ada rekapan transaksi kas</p>'
                return
            }
            tabelKasWadah.innerHTML = `
                <table class="tabel-laporan-kas">
                    <thead><tr><th>Tgl & Waktu</th><th>Keterangan</th><th>Penginput</th><th>Nominal</th></tr></thead>
                    <tbody>${riwayat.map(item => `
                        <tr>
                            <td>${formatWaktuPresisi(item.created_at)}</td>
                            <td>${item.keterangan}</td>
                            <td><span style="cursor:pointer; text-decoration:underline;" onclick="bukaProfilPublik('${item.pembuat_nis}')">${item.pembuat_nama || 'Pengurus'}</span></td>
                            <td style="color:${item.jenis === 'masuk' ? 'var(--clr-success)' : 'var(--clr-danger)'}; font-weight:700;">
                                ${item.jenis === 'masuk' ? '+' : '-'} ${formatRupiah(item.nominal)}
                            </td>
                        </tr>
                    `).join('')}</tbody>
                </table>`
        }
    } catch (err) { tabelKasWadah.innerHTML = '<p>Gagal memuat rekapan</p>' }
}

if (formMasuk) {
    formMasuk.addEventListener('submit', async (e) => {
        e.preventDefault()
        const idAkun = document.getElementById('masuk-id').value
        const kataSandi = document.getElementById('masuk-sandi').value
        try {
            const respon = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idAkun, kataSandi })
            })
            const hasil = await respon.json()
            if (hasil.status === 'success') {
                penggunaAktif = hasil.data
                localStorage.setItem('classhub_user', JSON.stringify(penggunaAktif))
                perbaruiAkses()
                gantiHalaman('halaman-beranda')
                ambilKas()
            } else { alert('Login Gagal: ' + hasil.message) }
        } catch (err) { alert('Kesalahan koneksi ke server') }
    })
}

if (formDaftar) {
    formDaftar.addEventListener('submit', async (e) => {
        e.preventDefault()
        const nis = document.getElementById('daftar-nis').value
        const nama = document.getElementById('daftar-nama').value
        const email = document.getElementById('daftar-email').value
        const password = document.getElementById('daftar-sandi').value
        const jenis_kelamin = document.getElementById('daftar-kelamin').value
        try {
            const respon = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nis, nama, email, password, jenis_kelamin })
            })
            const hasil = await respon.json()
            if (hasil.status === 'success') {
                alert('Yeyy kamu berhasil daftar! Akun kamu saat ini berstatus PENDING dan lagi nunggu verifikasi Admin.')
                formDaftar.reset()
                gantiHalaman('halaman-masuk')
            } else { alert('Gagal daftar: ' + hasil.message) }
        } catch (err) { alert('Terjadi kesalahan koneksi server: ' + err.message) }
    })
}

if (formKas) {
    formKas.addEventListener('submit', async (e) => {
        e.preventDefault()
        if (penggunaAktif && (penggunaAktif.role === 'siswa' || penggunaAktif.role === 'visitor')) {
            alert('Akses Ditolak: Role kamu tidak bisa nginput kas!')
            return
        }
        const dataForm = new FormData(formKas)
        if (penggunaAktif) {
            dataForm.append('pembuat_nis', penggunaAktif.nis)
            dataForm.append('pembuat_nama', penggunaAktif.nama)
        }
        try {
            const respon = await fetch('/api/kas', { method: 'POST', body: dataForm })
            const hasil = await respon.json()
            if (hasil.status === 'success') {
                alert('Transaksi kas berhasil disimpan!')
                formKas.reset()
                gantiHalaman('halaman-uang-kas')
                ambilKas()
                muatLogAktivitas()
            } else { alert('Gagal: ' + hasil.message) }
        } catch (err) { alert('Terjadi kesalahan koneksi ke server') }
    })
}

linkKeDaftar.addEventListener('click', (e) => { e.preventDefault(); gantiHalaman('halaman-daftar') })
linkKeMasuk.addEventListener('click', (e) => { e.preventDefault(); gantiHalaman('halaman-masuk') })
linkLupaSandi.addEventListener('click', (e) => { e.preventDefault(); gantiHalaman('halaman-lupa-sandi') })
if (linkBatalLupa) linkBatalLupa.addEventListener('click', (e) => { e.preventDefault(); gantiHalaman('halaman-masuk') })

btnKeluar.addEventListener('click', () => {
    penggunaAktif = null
    localStorage.removeItem('classhub_user')
    perbaruiAkses()
})

btnDemoList.forEach(btn => {
    btn.addEventListener('click', () => {
        const nis = btn.getAttribute('data-nis')
        if (nis === '202523183') {
            penggunaAktif = { nis: '202523183', nama: 'Adzan Ahlil Fiqri', email: 'adzan@smkn1jakarta.sch.id', role: 'admin', bio: 'Admin System & Developer ClassHub', poin: 50, created_at: '2026-08-27T10:00:00.000Z' }
        } else if (nis === '202523180') {
            penggunaAktif = { nis: '202523180', nama: 'Adelia Khairunissa Tofari', email: 'adelia@smkn1jakarta.sch.id', role: 'bendahara', bio: 'Bendahara Kas XI RPL', poin: 15, created_at: '2026-08-27T10:00:00.000Z' }
        } else if (nis === 'VISITOR') {
            penggunaAktif = { nis: 'VISITOR', nama: 'Tamu / Visitor', email: 'visitor@smkn1jakarta.sch.id', role: 'visitor', bio: 'Akun Tamu Readonly', poin: 0, created_at: '2026-08-27T10:00:00.000Z' }
        } else {
            penggunaAktif = { nis: '202523200', nama: 'Muhammad Fauzan Kamal Putra', email: 'fauzan@smkn1jakarta.sch.id', role: 'siswa', bio: 'Siswa XI RPL SMKN 1 Jakarta', poin: 5, created_at: '2026-08-27T10:00:00.000Z' }
        }
        localStorage.setItem('classhub_user', JSON.stringify(penggunaAktif))
        perbaruiAkses()
        gantiHalaman('halaman-beranda')
        ambilKas()
    })
})

if (penggunaAktif) { perbaruiAkses(); gantiHalaman('halaman-beranda'); ambilKas() }
else { perbaruiAkses() }
