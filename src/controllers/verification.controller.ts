import { Request, Response } from 'express';
import * as verificationService from '../services/verification.service.js';

export const getPendingVerificationsController = async (req: Request, res: Response) => {
  try {
    const data = await verificationService.getPendingVerifications();
    return res.status(200).json({ status: true, data });
  } catch (error: any) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getVerificationDetailController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const data = await verificationService.getVerificationDetail(id);
    return res.status(200).json({ status: true, data });
  } catch (error: any) {
    return res.status(404).json({ status: false, message: error.message });
  }
};

export const processVerificationController = async (req: Request, res: Response) => {
  try {
    const { id_pencocokan, status_verifikasi, catatan } = req.body;
    
    const id_admin = req.user!.id_user; 

    if (!id_pencocokan || typeof status_verifikasi !== 'boolean') {
      return res.status(400).json({ status: false, message: "Data payload tidak lengkap atau tidak valid" });
    }

    const result = await verificationService.processVerification(
      id_pencocokan,
      id_admin,
      status_verifikasi,
      catatan || "-"
    );

    return res.status(200).json({
      status: true,
      message: status_verifikasi ? "Verifikasi disetujui, notifikasi WhatsApp berhasil di-trigger" : "Verifikasi ditolak",
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getVerificationHistoryController = async (req: Request, res: Response) => {
  try {
    const data = await verificationService.getVerificationHistory();
    return res.status(200).json({ status: true, data });
  } catch (error: any) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const rollbackVerificationController = async (req: Request, res: Response) => {
  try {
    const id_verifikasi = parseInt(req.params.id as string);
    const { alasan_batal } = req.body;
    
    const id_admin = req.user!.id_user; 

    if (!alasan_batal) {
      return res.status(400).json({ status: false, message: "Alasan pembatalan wajib diisi untuk keperluan log audit." });
    }

    const result = await verificationService.rollbackVerification(id_verifikasi, id_admin, alasan_batal);

    return res.status(200).json({
      status: true,
      message: "Verifikasi berhasil dibatalkan. Status barang telah dikembalikan seperti semula.",
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({ status: false, message: error.message });
  }
};