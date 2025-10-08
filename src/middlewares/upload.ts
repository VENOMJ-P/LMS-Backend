import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { BadRequestError } from '../utils/Error';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lms_feedback',
    allowedFormats: ['jpg', 'png', 'jpeg']
  } as any
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export const uploadImage = upload.single('image');

export const uploadCsv = upload.single('csvFile');

// Middleware to handle upload errors
export const handleUploadError = (err: any, _req: Request, _res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    next(new BadRequestError('File upload error: ' + err.message));
  } else if (err) {
    next(new BadRequestError('Unknown upload error'));
  }
  next();
};
