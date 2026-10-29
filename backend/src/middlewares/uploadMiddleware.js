import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {fileURLToPath} from 'url'


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirPdfs = path.resolve(__dirname, '..', '..', '..', 'uploads', 'articles');

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

const pathAvatars = path.resolve(__dirname, '..', '..', '..', 'uploads', 'images', 'avatars');
if (!fs.existsSync(pathAvatars)) fs.mkdirSync(pathAvatars, { recursive: true });

const storageAvatar = multer.diskStorage({
  destination: (req, file, cb) => cb(null, pathAvatars),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de segurança: Só aceita imagens (jpeg, png, webp, etc)
const filterAvatar = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas para a foto de perfil!'), false);
  }
};

export const uploadAvatar = multer({ 
  storage: storageAvatar, 
  fileFilter: filterAvatar,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB para fotos para não pesar o site
});
