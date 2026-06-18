import prisma from '../config/database.js';

export const createClaimTicket = async (id_barang_hilang: number, filename: string) => {
  const matchingData = await prisma.pencocokan.findFirst({
    where: {
      id_barang_hilang: id_barang_hilang,
      status: true
    },
    include: {
      barang_hilang: true,
      barang_temuan: true
    }
  });

  if (!matchingData) {
    throw new Error('Gagal memproses klaim: Laporan kehilangan ini belum memiliki verifikasi kecocokan yang sah.');
  }

  const id_temuan = matchingData.id_temuan;
  const id_user_pelapor = matchingData.barang_hilang.id_user;

  if (matchingData.barang_temuan.status !== 'MENUNGGU') {
    throw new Error('Barang fisik belum siap diserahkan atau sudah diklaim.');
  }

  return await prisma.$transaction(async (tx) => {
    const claim = await tx.klaimBarang.create({
      data: {
        id_temuan: id_temuan,
        id_user: id_user_pelapor,
        bukti_klaim: `/uploads/${filename}`,
        status: 'DI_AMBIL',
        waktu_pengambilan: new Date()
      }
    });

    await tx.barangTemuan.update({
      where: { id_temuan },
      data: { status: 'DIAMBIL' }
    });

    await tx.barangHilang.update({
      where: { id_barang_hilang: matchingData.id_barang_hilang },
      data: { status: 'SELESAI' }
    });

    return claim;
  });
};

export const getAllClaimHistory = async () => {
  return await prisma.klaimBarang.findMany({
    include: {
      user: { select: { nama: true, email: true, kontak: true } },
      barang_temuan: true
    },
    orderBy: { waktu_pengambilan: 'desc' }
  });
};