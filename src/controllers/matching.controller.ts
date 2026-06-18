import { Request, Response } from 'express';
import * as matchingService from '../services/matching.service.js';

export const getMatchResultsController = async (req: Request, res: Response) => {
  try {
    const id_barang_hilang = parseInt(req.params.id_barang_hilangn as string);
    const data = await matchingService.getMatchResultsForLostItem(id_barang_hilang);

    return res.status(200).json({
      status: true,
      message: 'Berhasil memuat rekomendasi barang temuan yang mirip berbasis AI',
      data
    });
  } catch (error: any) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const receiveWebhookController = async (req: Request, res: Response) => {
  try {
    const { id_target, id_kandidat_terbaik, tingkat_kemiripan, status_kecocokan, trigger_type } = req.body;

    const payload_ml = { 
      id_target: id_target, 
      id_kandidat_terbaik: id_kandidat_terbaik, 
      tingkat_kemiripan: tingkat_kemiripan, 
      status_kecocokan: status_kecocokan, 
      trigger_type: trigger_type 
    }

    console.log(`[WEBHOOK] Hasil ML diterima untuk Laporan ID: ${id_target}`);
    console.log(`[WEBHOOK] Status: ${status_kecocokan} | Skor: ${tingkat_kemiripan}%`);

    if (status_kecocokan && id_kandidat_terbaik) {
      await matchingService.saveMatchResult(payload_ml);
    }

    return res.status(200).json({ message: "Webhook diterima dengan baik oleh Node.js" });
  } catch (error: any) {
    console.error('[WEBHOOK ERROR]:', error.message);
    return res.status(500).json({ status: false, message: error.message });
  }
};