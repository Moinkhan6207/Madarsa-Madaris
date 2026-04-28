import multer from 'multer';
import { AppError } from '../errors/AppError';

// Configure memory storage because we will process files before saving
const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = [
    'image/png', 
    'image/jpg', 
    'image/jpeg', 
    'image/webp',
    'image/svg+xml',
    'image/gif'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only PNG, JPG, JPEG, WEBP, SVG and GIF are allowed.', 400, 'INVALID_FILE_TYPE'), false);
  }
};


export const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter
});
