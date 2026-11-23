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

// 1. Cria a pasta para salvar as imagens/anexos das notícias
const pathNews = path.resolve(__dirname, '..', '..', '..', 'uploads', 'news');
if (!fs.existsSync(pathNews)) fs.mkdirSync(pathNews, { recursive: true });

// 2. Regras de armazenamento
const storageNews = multer.diskStorage({
  destination: (req, file, cb) => cb(null, pathNews),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Usa um prefixo 'news-' para facilitar a identificação física do arquivo
    cb(null, 'news-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 3. Filtro de segurança para as notícias
const filterNews = (req, file, cb) => {
  // Aceita Imagens (jpg, png, webp) para o banner E PDF para anexos/documentos da notícia
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Formato inválido. Envie imagens ou arquivos PDF.'), false);
  }
};

// 4. Exporta o middleware para usar no routes.js
export const uploadNews = multer({
  storage: storageNews,
  fileFilter: filterNews,
  limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10MB (para comportar PDFs maiores se necessário)
});



// 2. Regras de armazenamento
const storagePost = multer.diskStorage({
  destination: (req, file, cb) => {
    
    const userId = req.userId;

    if (!userId) {
      return cb(new Error("Usuário não autenticado"));
    }

    const pathPost = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "uploads",
      "posts",
      String(userId)
    );
    if (!fs.existsSync(pathPost)) fs.mkdirSync(pathPost, { recursive: true });
    
    cb(null, pathPost)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Usa um prefixo 'news-' para facilitar a identificação física do arquivo
    cb(null, "post-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// 3. Filtro de segurança para as notícias
const filterPost = (req, file, cb) => {
  // Aceita Imagens (jpg, png, webp) para o banner E PDF para anexos/documentos da notícia
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Formato inválido. Envie imagens ou arquivos PDF."), false);
  }
};

// 4. Exporta o middleware para usar no routes.js
export const uploadPost = multer({
  storage: storagePost,
  fileFilter: filterPost,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB (para comportar PDFs maiores se necessário)
});
