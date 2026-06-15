import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';

// 1. Mengambil profil user itu sendiri
export const getUserProfile = async (id_user: number) => {
  const user = await prisma.user.findUnique({
    where: { id_user },
    select: {
      id_user: true,
      nama: true,
      email: true,
      role: true,
      kontak: true,
      createdAt: true
    }
  });

  if (!user) throw new Error('User tidak ditemukan');
  return user;
};

// 2. User memperbarui profilnya sendiri (Nama & Kontak)
export const updateProfile = async (id_user: number, data: { nama?: string; kontak?: string; password?: string }) => {
  const updateData: any = {};
  
  if (data.nama) updateData.nama = data.nama;
  if (data.kontak) updateData.kontak = data.kontak;
  
  // Jika user ingin ganti password, lakukan hashing ulang
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id_user },
    data: updateData,
    select: {
      id_user: true,
      nama: true,
      email: true,
      role: true,
      kontak: true
    }
  });

  return updatedUser;
};

// 3. [KHUSUS ADMIN]: Melihat semua daftar user di kampus
export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id_user: true,
      nama: true,
      email: true,
      role: true,
      kontak: true,
      createdAt: true
    },
    orderBy: { id_user: 'desc' }
  });
};

// 4. [KHUSUS ADMIN]: Mengubah Role User (Role Management)
export const updateUserRole = async (id_user: number, newRole: 'PUBLIC' | 'ADMIN') => {
  const userExists = await prisma.user.findUnique({ where: { id_user } });
  if (!userExists) throw new Error('User yang akan diubah tidak ditemukan');

  return await prisma.user.update({
    where: { id_user },
    data: { role: newRole },
    select: {
      id_user: true,
      nama: true,
      email: true,
      role: true
    }
  });
};

// 5. [KHUSUS ADMIN]: Menghapus akun user jika melanggar aturan
export const deleteUserByAdmin = async (id_user: number) => {
  const userExists = await prisma.user.findUnique({ where: { id_user } });
  if (!userExists) throw new Error('User tidak ditemukan');

  await prisma.user.delete({ where: { id_user } });
  return { message: 'Akun user berhasil dihapus dari sistem' };
};