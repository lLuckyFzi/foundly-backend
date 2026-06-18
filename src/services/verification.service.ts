import prisma from '../config/database.js';
import { sendWhatsAppMessage } from '../utils/whatsapp.util.js';

export const getPendingVerifications = async () => {
    console.log("🕵️ [DEBUG] Mencari data pencocokan yang belum diverifikasi...");

    const pendingData = await prisma.pencocokan.findMany({
        where: {
            verifikasi: null
        },
        include: {
            barang_hilang: {
                include: {
                    user: true
                }
            },
            barang_temuan: {
                include: {
                    user: true
                }
            }
        },
        orderBy: { tingkat_kemiripan: 'desc' }
    });

    console.log("📊 [DEBUG] Hasil dari Database:", JSON.stringify(pendingData, null, 2));

    return pendingData;
};

export const getVerificationDetail = async (id_pencocokan: number) => {
    const detail = await prisma.pencocokan.findUnique({
        where: { id_pencocokan },
        include: {
            barang_hilang: {
                include: { user: { select: { nama: true, kontak: true } } }
            },
            barang_temuan: true
        }
    });

    if (!detail) throw new Error("Data pencocokan tidak ditemukan");
    return detail;
};

export const processVerification = async (
    id_pencocokan: number,
    id_admin: number,
    status_verifikasi: boolean,
    catatan: string
) => {
    const pencocokan = await getVerificationDetail(id_pencocokan);

    const result = await prisma.$transaction(async (tx) => {
        const newVerifikasi = await tx.verifikasi.create({
            data: {
                id_pencocokan,
                id_admin,
                status_verifikasi,
                catatan,
                tgl_verfikasi: new Date(),
                waktu_verifikasi: new Date()
            }
        });

        await tx.pencocokan.update({
            where: { id_pencocokan },
            data: { status: status_verifikasi }
        });

        if (status_verifikasi === true) {
            await tx.barangHilang.update({
                where: { id_barang_hilang: pencocokan.id_barang_hilang },
                data: { status: 'DITEMUKAN' }
            });

            await tx.barangTemuan.update({
                where: { id_temuan: pencocokan.id_temuan },
                data: { status: 'MENUNGGU' }
            });

            await tx.notifikasi.create({
                data: {
                    id_user: pencocokan.barang_hilang.id_user,
                    pesan: `Laporan Anda untuk barang "${pencocokan.barang_hilang.nama_barang}" kemungkinan besar telah ditemukan di pos kampus. Silakan cek detailnya dan segera lakukan klaim pengambilan.`
                }
            });
        }

        return newVerifikasi;
    });

    if (status_verifikasi === true && pencocokan.barang_hilang.user?.kontak) {
        const nomorHp = pencocokan.barang_hilang.user.kontak;
        const namaUser = pencocokan.barang_hilang.user.nama;
        const namaBarang = pencocokan.barang_hilang.nama_barang;

        const pesanWa = `Halo *${namaUser}*,\n\nKabar baik dari sistem *Foundly UNIBI*! 🎉\nBarang Anda yang hilang yaitu *${namaBarang}* kemungkinan besar telah kami amankan di pos / ruang sarpras kampus berdasarkan hasil verifikasi petugas kami.\n\nCatatan Petugas: _${catatan}_\n\nSilakan segera datang ke pos dengan membawa bukti identitas (KTM) untuk melakukan proses klaim serah terima barang.\n\nTerima kasih,\nAdmin Foundly UNIBI`;

        sendWhatsAppMessage(nomorHp, pesanWa).catch(err => console.error("WA Error:", err));
    }

    return result;
};

export const getVerificationHistory = async () => {
  return await prisma.verifikasi.findMany({
    include: {
      pencocokan: {
        include: {
          barang_hilang: true,
          barang_temuan: true
        }
      },
      admin: {
        select: { nama: true }
      }
    },
    orderBy: { waktu_verifikasi: 'desc' }
  });
};

export const rollbackVerification = async (id_verifikasi: number, id_admin: number, alasan_batal: string) => {
  const verifikasi = await prisma.verifikasi.findUnique({
    where: { id_verifikasi },
    include: { pencocokan: true }
  });

  if (!verifikasi) throw new Error("Data riwayat verifikasi tidak ditemukan");

  if (verifikasi.status_verifikasi === false) {
    throw new Error("Verifikasi ini sudah berstatus 'Tidak Cocok' dari awal, tidak perlu dibatalkan.");
  }

  const result = await prisma.$transaction(async (tx) => {
    
    const updatedVerifikasi = await tx.verifikasi.update({
      where: { id_verifikasi },
      data: {
        status_verifikasi: false,
        catatan: `[DIBATALKAN OLEH SISTEM]\nAlasan: ${alasan_batal}\n\n(Catatan Lama: ${verifikasi.catatan})`
      }
    });

    await tx.pencocokan.update({
      where: { id_pencocokan: verifikasi.id_pencocokan },
      data: { status: false }
    });

    await tx.barangHilang.update({
      where: { id_barang_hilang: verifikasi.pencocokan.id_barang_hilang },
      data: { status: 'PROSES' }
    });

    await tx.barangTemuan.update({
      where: { id_temuan: verifikasi.pencocokan.id_temuan },
      data: { status: 'DISIMPAN' }
    });

    return updatedVerifikasi;
  });

  return result;
};