import prisma from '../config/database.js';
import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000/api/v1/predict';
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';
const WEBHOOK_URL = `${APP_BASE_URL}/api/v1/matching/webhook`;

export const triggerMatchingForLostItem = async (id_barang_hilang: number) => {
  try {
    const lostItem = await prisma.barangHilang.findUnique({ where: { id_barang_hilang } });
    if (!lostItem) return;

    const availableFoundItems = await prisma.barangTemuan.findMany({
      where: {
        status: { in: ['DISIMPAN', 'MENUNGGU'] },
        kategori: lostItem.kategori
      }
    });

    if (availableFoundItems.length === 0) {
      console.log(`[ML Trigger] Tidak ada kandidat kategori ${lostItem.kategori} untuk Target ID ${id_barang_hilang}`);
      return;
    }

    const candidates = availableFoundItems.map(item => ({
      id_barang: item.id_temuan,
      nama_barang: item.nama_barang,
      kategori: item.kategori,
      deskripsi: item.deskripsi,
      lokasi: item.lokasi_temuan,
      foto_barang: `${APP_BASE_URL}${item.foto_barang}`
    }));

    const payload = {
      id_target: lostItem.id_barang_hilang,
      nama_barang: lostItem.nama_barang,
      kategori: lostItem.kategori,
      deskripsi: lostItem.deskripsi,
      lokasi: lostItem.lokasi_hilang,
      foto_barang: `${APP_BASE_URL}${lostItem.foto_barang}`,
      candidates: candidates,
      webhook_url: WEBHOOK_URL
    };

    console.log(`[ML Trigger] Mengirim Target ID ${payload.id_target} vs ${candidates.length} Kandidat ke Python...`);
    await axios.post(ML_SERVICE_URL, payload);
  } catch (error) {
    console.error('[Matching Service Error]: Gagal trigger ML', error);
  }
};

export const saveMatchResult = async (id_target: number, id_kandidat: number, score: number, status_kecocokan: boolean) => {
  await prisma.pencocokan.create({
    data: {
      id_barang_hilang: id_target,
      id_temuan: id_kandidat,
      tingkat_kemiripan: score,
      status: status_kecocokan
    }
  });
};

export const getMatchResultsForLostItem = async (id_barang_hilang: number) => {
  return await prisma.pencocokan.findMany({
    where: { id_barang_hilang },
    include: {
      barang_temuan: true 
    },
    orderBy: { tingkat_kemiripan: 'desc' }
  });
};