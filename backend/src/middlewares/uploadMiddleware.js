import multer from 'multer';
import path from 'path';
import fs from 'fs';

const dirPdfs = path.resolve(process.cwd(), '../../uploads/articles/');

if (!fs.existsSync(dirPdfs)) {
    fs.mkdirSync(dirPdfs, { recursive: true });
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dirPdfs);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extensao = path.extname(file.originalname);
        cb(null, `artigo-${uniqueSuffix}${extensao}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Apenas arquivos .pdf são permitidos'))
    }
}

export const uploadPdf = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});
