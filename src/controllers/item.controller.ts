import { Request, Response } from 'express';
import * as itemService from '../services/item.service.js';

export const createLostReportController = async (req: Request, res: Response) => {
  try {
    // Pastikan ada file foto yang diupload
    if (!req.file) {
      return res.status(400).json({ status: false, message: 'Foto barang hilang wajib diunggah' });
    }

    const id_user = req.user!.id_user; // Diekstrak dengan aman dari token JWT
    const result = await itemService.createLostReport(id_user, req.body, req.file.filename);

    return res.status(201).json({
      status: true,
      message: 'Laporan barang hilang berhasil dibuat',
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getAllLostReportsController = async (req: Request, res: Response) => {
  try {
    const data = await itemService.getAllLostReports();
    return res.status(200).json({ status: true, data });
  } catch (error: any) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getMyLostReportsController = async (req: Request, res: Response) => {
  try {
    const id_user = req.user!.id_user;
    const data = await itemService.getLostReportsByUserId(id_user);
    
    return res.status(200).json({ status: true, data });
  } catch (error: any) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getLostReportByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const data = await itemService.getLostReportById(id);
    return res.status(200).json({ status: true, data });
  } catch (error: any) {
    return res.status(404).json({ status: false, message: error.message });
  }
};

export const deleteLostReportController = async (req: Request, res: Response) => {
  try {
    const id_barang_hilang = parseInt(req.params.id as string);
    const id_user = req.user!.id_user;
    const role = req.user!.role;

    const result = await itemService.deleteLostReport(id_barang_hilang, id_user, role);
    return res.status(200).json({ status: true, message: result.message });
  } catch (error: any) {
    return res.status(403).json({ status: false, message: error.message });
  }
};