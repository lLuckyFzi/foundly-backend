import { Request, Response } from 'express';
import * as claimService from '../services/claim.service.js';

export const createClaimController = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: false, message: 'Bukti klaim fisik (Foto serah terima/KTM) wajib diunggah' });
    }

    const { id_barang_hilang } = req.body;

    if (!id_barang_hilang) {
      return res.status(400).json({ status: false, message: 'ID Laporan Kehilangan wajib disertakan' });
    }

    const result = await claimService.createClaimTicket(
      parseInt(id_barang_hilang),
      req.file.filename
    );

    return res.status(201).json({
      status: true,
      message: 'Transaksi klaim berhasil! Barang telah sukses diserahterimakan',
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getClaimHistoryController = async (req: Request, res: Response) => {
  try {
    const data = await claimService.getAllClaimHistory();
    return res.status(200).json({ status: true, data });
  } catch (error: any) {
    return res.status(500).json({ status: false, message: error.message });
  }
};