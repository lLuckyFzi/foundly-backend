import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.util.js';
import { RegisterDTO, LoginDTO } from '../constants/auth.dto.js'; // Kita buat DTO (Data Transfer Object) setelah ini

export const register = async (data: RegisterDTO) => {
  // 1. Cek apakah email sudah terdaftar
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error('Email sudah digunakan oleh pengguna lain');
  }

  // 2. Hash password menggunakan salt round 10 (Standar Industri)
  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  const sanitizedPhoneNumber = data.kontak.toString()

  // 3. Simpan ke MySQL via Prisma
  const newUser = await prisma.user.create({
    data: {
      nama: data.nama,
      email: data.email,
      password: hashedPassword,
      kontak: sanitizedPhoneNumber,
      role: data.role || "PUBLIC" // Default role sesuai rancangan jika tidak diisi
    }
  });

  // 4. Return data user tanpa menyertakan password demi keamanan
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const login = async (data: LoginDTO) => {
  // 1. Cari user berdasarkan email
  const user = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (!user) {
    throw new Error('Kredensial login salah (Email tidak ditemukan)');
  }

  // 2. Bandingkan password inputan dengan hash di database
  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) {
    throw new Error('Kredensial login salah (Password salah)');
  }

  // 3. Generate JWT Token jika valid
  const token = generateToken({ id_user: user.id_user, role: user.role });

  return {
    user: {
      id_user: user.id_user,
      nama: user.nama,
      email: user.email,
      role: user.role,
      kontak: user.kontak
    },
    token
  };
};