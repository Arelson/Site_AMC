import prisma from "../database/prisma.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logAction } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apagarArquivoFisico = (caminhoRelativo) => {

  if (!caminhoRelativo || !caminhoRelativo.startsWith("/uploads")) return;
  
  if (!caminhoRelativo) return;
  try {
    // Remove a barra inicial se existir (Ex: "/uploads/news/arquivo.jpg" vira "uploads/news/arquivo.jpg")
    const urlLimpa = caminhoRelativo.replace(/^\//, "");
    const caminhoAbsoluto = path.resolve(__dirname, "..", '..', '..', urlLimpa);

    if (fs.existsSync(caminhoAbsoluto)) {
      fs.unlinkSync(caminhoAbsoluto);
      console.log(`🗑️ Arquivo apagado do servidor: ${caminhoAbsoluto}`);
    }
  } catch (error) {
    console.error(`Erro ao tentar apagar o arquivo ${caminhoRelativo}:`, error);
  }
};

export const createPost = async (req, res) => {
  try {
    const { titulo, corpo, banner, palavrasChave, bannerUrl } = req.body;
    const userId = req.userId;

    if (!titulo || !corpo || corpo === "<p></p>") {
      return res
        .status(400)
        .json({ error: "O título e o conteúdo são obrigatórios." });
    }

    let bannerPath = bannerUrl ? bannerUrl.trim() : null;
    let pdfPath = null;

    if (req.files) {
      if (req.files.banner && req.files.banner.length > 0) {
        bannerPath = `/uploads/posts/${userId}/${req.files.banner[0].filename}`;
      }
      if (req.files.pdf && req.files.pdf.length > 0) {
        pdfPath = `/uploads/posts/${userId}/${req.files.pdf[0].filename}`;
      }
    }

    const newPost = await prisma.post.create({
      data: {
        title: titulo,
        content: corpo,
        banner: bannerPath,
        pdfUrl: pdfPath,
        keywords: palavrasChave || null,
        status: "PUBLICADO",
        authorId: userId,
      },
    });

    await logAction(
      req.userId,
      'CREATE',
      'Post',
      newPost.id,
      {title: 'Post criado'}
    )

    return res
      .status(201)
      .json({ message: "Postagem criada com sucesso!", post: newPost });
  } catch (error) {
    console.error("Erro ao criar postagem:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao salvar a postagem." });
  }
};

export const readPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId: req.userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log("Postagens encontradas:", posts);
    return res.status(200).json(posts);
  } catch (error) {
    console.error("Erro ao buscar as postagens:", error);
    return res.status(500).json({ error: "Erro ao buscar as postagens." });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      include: {
        author: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Postagem não encontrada" });
    }

    return res.status(200).json(post);
  } catch (error) {
    console.error("Erro ao buscar postagem:", error);
    return res.status(500).json({ error: "Erro ao buscar a postagem." });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    // IMPORTANTE: Adicionei o bannerUrl aqui para capturar o link que vem do FormData
    const { titulo, corpo, palavrasChave, bannerUrl } = req.body;

    if (!titulo || !corpo) {
      return res
        .status(400)
        .json({ error: "O título e o conteúdo são obrigatórios." });
    }

    const postAtual = await prisma.post.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!postAtual) {
      return res.status(404).json({ error: "Postagem não encontrada." });
    }

    // 1. Inicia os caminhos com o que já existe no banco
    let bannerPath = postAtual.banner;
    let pdfPath = postAtual.pdfUrl;

    // 2. Se um NOVO ARQUIVO FÍSICO de banner for enviado
    if (req.files && req.files.banner && req.files.banner.length > 0) {
      // Apaga o antigo apenas se era um arquivo do servidor (evita tentar apagar links externos)
      if (postAtual.banner && postAtual.banner.startsWith("/uploads/")) {
        apagarArquivoFisico(postAtual.banner);
      }
      bannerPath = `/uploads/post/${userId}/${req.files.banner[0].filename}`;
    }
    // 3. Se não veio arquivo, MAS veio uma URL nova da web
    else if (bannerUrl !== undefined && bannerUrl !== postAtual.banner) {
      // Se a imagem antiga era um arquivo físico, precisamos apagá-la para liberar espaço no VPS
      if (postAtual.banner && postAtual.banner.startsWith("/uploads/")) {
        apagarArquivoFisico(postAtual.banner);
      }
      // O novo caminho passa a ser o link da web
      bannerPath = bannerUrl;
    }

    // 4. Se um NOVO PDF for enviado, apaga o velho e substitui pelo novo
    if (req.files && req.files.pdf && req.files.pdf.length > 0) {
      if (postAtual.pdfUrl) {
        // Corrigido de noticiaAntiga para postAtual
        apagarArquivoFisico(postAtual.pdfUrl);
      }
      pdfPath = `/uploads/posts/${userId}/${req.files.pdf[0].filename}`;
    }

    // 5. Atualiza no banco de dados
    const updatedPost = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        title: titulo,
        content: corpo,
        banner: bannerPath,
        pdfUrl: pdfPath,
        keywords: palavrasChave || null,
      },
    });

    // 6. Regista no Histórico de Ações do Administrador
    await logAction(req.userId, "UPDATE", "Post", updatedPost.id, {
      title: updatedPost.title,
    });

    return res
      .status(200)
      .json({ message: "Postagem atualizada!", post: updatedPost });
  } catch (error) {
    console.error("Erro ao atualizar postagem:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao atualizar a postagem." });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const postAtual = await prisma.post.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!postAtual) {
      return res.status(404).json({ error: "Postagem não encontrada." });
    }

    apagarArquivoFisico(postAtual.banner)
    apagarArquivoFisico(postAtual.pdfUrl)

    await prisma.post.delete({
      where: { id: Number(id) },
    });

    await logAction(
      req.userId,
      'DELETE',
      'Post',
      null,
      {title: 'Post deletado'}
    )

    return res.status(200).json({ message: "Postagem deletada com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar postagem:", error);
    return res.status(500).json({ error: "Erro ao deletar a postagem." });
  }
};

export const getPublicFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || ""; // Captura o que o usuário digitou na barra de busca

    const limit = 9; // Número de postagens por página
    const skip = (page - 1) * limit;

    // Filtro de Segurança Base: NUNCA mostrar rascunhos no feed público
    const filtrosWhere = {
      status: "PUBLICADO",
    };

    // Aplica a busca avançada do PostgreSQL (Full-Text Search)
    if (search.trim()) {
      // Transforma "redes neurais" em "redes | neurais" para o motor entender
      const termoFormatado = search.trim().split(/\s+/).join(" | ");

      // Pesquisa no Título OU no Conteúdo OU nas Palavras-chave simultaneamente
      filtrosWhere.OR = [
        { title: { search: termoFormatado } },
        { content: { search: termoFormatado } },
        { keywords: { search: termoFormatado } },
      ];
    }

    // Busca os posts aplicando os filtros e a paginação
    const posts = await prisma.post.findMany({
      where: filtrosWhere, // Aplica as regras de busca e status aqui
      skip: skip,
      take: limit,
      include: {
        author: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Ordena do mais recente para o mais antigo
      },
    });

    // Contagem total respeitando a busca (vital para a paginação não bugar quando pesquisar)
    const totalPosts = await prisma.post.count({ where: filtrosWhere });
    const totalPages = Math.ceil(totalPosts / limit);

    return res.status(200).json({
      posts,
      totalPaginas: totalPages,
      paginaAtual: page,
    });
  } catch (error) {
    console.error("Erro ao buscar o feed público:", error);
    return res.status(500).json({ error: "Erro ao carregar o feed do blog." });
  }
};


