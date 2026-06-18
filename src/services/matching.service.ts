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
      trigger_type: 'LOST',
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

export const triggerMatchingForFoundItem = async (id_temuan: number) => {
  try {
    const foundItem = await prisma.barangTemuan.findUnique({ where: { id_temuan } });
    if (!foundItem) return;

    const unresolvedLostItems = await prisma.barangHilang.findMany({
      where: {
        status: 'PROSES',
        kategori: foundItem.kategori
      }
    });

    if (unresolvedLostItems.length === 0) return;

    const candidates = unresolvedLostItems.map(item => ({
      id_barang: item.id_barang_hilang,
      nama_barang: item.nama_barang,
      kategori: item.kategori,
      deskripsi: item.deskripsi,
      lokasi: item.lokasi_hilang,
      foto_barang: `${APP_BASE_URL}${item.foto_barang}`
    }));

    const payload = {
      id_target: foundItem.id_temuan,
      trigger_type: 'FOUND',
      nama_barang: foundItem.nama_barang,
      kategori: foundItem.kategori,
      deskripsi: foundItem.deskripsi,
      lokasi: foundItem.lokasi_temuan,
      foto_barang: `${APP_BASE_URL}${foundItem.foto_barang}`,
      candidates: candidates,
      webhook_url: WEBHOOK_URL
    };

    await axios.post(ML_SERVICE_URL, payload);
  } catch (error) {
    console.error('[Matching Service Error]: Gagal trigger ML (Found)', error);
  }
};

export const saveMatchResult = async (payload: any) => {
  const { id_target, id_kandidat_terbaik, tingkat_kemiripan, status_kecocokan, trigger_type } = payload

  if (!id_kandidat_terbaik) return;

  let id_barang_hilang: number;
  let id_temuan: number;

  if (trigger_type === 'LOST') {
    id_barang_hilang = id_target;
    id_temuan = id_kandidat_terbaik;
  } else {
    id_temuan = id_target;
    id_barang_hilang = id_kandidat_terbaik;
  }

  await prisma.pencocokan.create({
    data: {
      id_barang_hilang: id_barang_hilang,
      id_temuan: id_temuan,
      tingkat_kemiripan: tingkat_kemiripan,
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