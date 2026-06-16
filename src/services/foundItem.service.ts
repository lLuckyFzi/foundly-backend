import prisma from '../config/database.js';

// 1. Membuat laporan barang temuan baru
export const createFoundReport = async (id_user: number, data: any, filename: string) => {
  return await prisma.barangTemuan.create({
    data: {
      id_user: id_user,
      nama_barang: data.nama_barang,
      kategori: data.kategori,
      deskripsi: data.deskripsi,
      lokasi_temuan: data.lokasi_temuan,
      waktu_temuan: new Date(data.waktu_temuan), // Konversi string ISO date ke DateTime MySQL
      tgl_temuan: new Date(data.tgl_temuan),
      foto_barang: `/uploads/${filename}`,
      status: 'DISIMPAN' // Status default awal barang diidentifikasi aman oleh sistem
    }
  });
};

// 2. Mengambil semua daftar barang temuan (Public/Dashboard view)
export const getAllFoundReports = async () => {
  return await prisma.barangTemuan.findMany({
    include: {
      user: {
        select: {
          nama: true,
          kontak: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

// 3. Mengambil detail barang temuan berdasarkan ID
export const getFoundReportById = async (id_temuan: number) => {
  const report = await prisma.barangTemuan.findUnique({
    where: { id_temuan },
    include: {
      user: {
        select: { nama: true, kontak: true, email: true }
      }
    }
  });

  if (!report) throw new Error('Laporan barang temuan tidak ditemukan');
  return report;
};

export const getFoundReportsByUserId = async (id_user: number) => {
  return await prisma.barangTemuan.findMany({
    where: { 
      id_user: id_user
    },
    include: {
      user: {
        select: {
          nama: true,
          kontak: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

// 4. Menghapus laporan barang temuan (Hanya bisa dilakukan oleh Penemu asli atau Admin)
export const deleteFoundReport = async (id_temuan: number, id_user: number, role: string) => {
  const report = await prisma.barangTemuan.findUnique({ where: { id_temuan } });

  if (!report) throw new Error('Laporan tidak ditemukan');

  // Proteksi Hak Akses
  if (report.id_user !== id_user && role !== 'ADMIN') {
    throw new Error('Anda tidak memiliki otoritas untuk menghapus laporan ini');
  }

  await prisma.barangTemuan.delete({ where: { id_temuan } });
  return { message: 'Laporan barang temuan berhasil dihapus dari sistem' };
};