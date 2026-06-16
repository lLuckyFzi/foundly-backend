import { Request, Response } from 'express';
import * as foundItemService from '../services/foundItem.service.js';

export const createFoundReportController = async (req: Request, res: Response) => {
  try {
    // Validasi file foto
    if (!req.file) {
      return res.status(400).json({ status: false, message: 'Foto barang temuan wajib diunggah' });
    }

    // Validasi data teks dasar
    const { nama_barang, kategori, deskripsi, lokasi_temuan, waktu_temuan } = req.body;
    if (!nama_barang || !kategori || !deskripsi || !lokasi_temuan || !waktu_temuan) {
      return res.status(400).json({ status: false, message: 'Semua field laporan wajib diisi' });
    }

    const id_user = req.user!.id_user; // Diambil dari JWT Token verifikasi
    const result = await foundItemService.createFoundReport(id_user, req.body, req.file.filename);

    return res.status(201).json({
      status: true,
      message: 'Laporan barang temuan berhasil dicatat',
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getAllFoundReportsController = async (req: Request, res: Response) => {
  try {
    const data = await foundItemService.getAllFoundReports();
    return res.status(200).json({ status: true, data });
  } catch (error: any) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getMyFoundReportsController = async (req: Request, res: Response) => {
  try {
    const id_user = req.user!.id_user; 
    const data = await foundItemService.getFoundReportsByUserId(id_user);
    
    return res.status(200).json({ status: true, data });
  } catch (error: any) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getFoundReportByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const data = await foundItemService.getFoundReportById(id);
    return res.status(200).json({ status: true, data });
  } catch (error: any) {
    return res.status(404).json({ status: false, message: error.message });
  }
};

export const deleteFoundReportController = async (req: Request, res: Response) => {
  try {
    const id_temuan = parseInt(req.params.id as string);
    const id_user = req.user!.id_user;
    const role = req.user!.role;

    const result = await foundItemService.deleteFoundReport(id_temuan, id_user, role);
    return res.status(200).json({ status: true, message: result.message });
  } catch (error: any) {
    return res.status(403).json({ status: false, message: error.message });
  }
};