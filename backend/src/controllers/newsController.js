import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../database/prisma.js";
import { logAction } from "../utils/logger.js";

// Configuração para encontrar a pasta raiz do backend e apagar arquivos físicos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função auxiliar para deletar arquivos físicos e economizar espaço no VPS
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

export const createNews = async (req, res) => {
  try {
    // 1. Recebe também o bannerUrl (caso o admin tenha colado um link)
    const { titulo, corpo, palavrasChave, bannerUrl } = req.body;
    const userId = req.userId;

    if (!titulo || !corpo || corpo === "<p></p>") {
      return res
        .status(400)
        .json({ error: "O título e o conteúdo da notícia são obrigatórios." });
    }

    // 2. Começa assumindo a URL digitada (se houver) ou null (se for apenas texto do Tiptap)
    let bannerPath = bannerUrl ? bannerUrl.trim() : null;
    let pdfPath = null;

    // 3. Se o admin subiu um arquivo físico, o arquivo tem prioridade e sobrescreve
    if (req.files) {
      if (req.files.banner && req.files.banner.length > 0) {
        bannerPath = `/uploads/news/${req.files.banner[0].filename}`;
      }
      if (req.files.pdf && req.files.pdf.length > 0) {
        pdfPath = `/uploads/news/${req.files.pdf[0].filename}`;
      }
    }

    const novaNoticia = await prisma.news.create({
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
      'News',
      novaNoticia.id,
      {title: 'Noticia criada'}
    )

    return res.status(201).json({
      message: "Notícia criada com sucesso!",
      news: novaNoticia,
    });
  } catch (error) {
    console.error("Erro ao criar notícia no banco:", error);
    return res.status(500).json({ error: "Erro interno ao salvar a notícia." });
  }
};

export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const newsId = Number(id);

    if (isNaN(newsId)) {
      return res.status(400).json({ error: "ID de notícia inválido." });
    }

    // 1. Busca a notícia antes para pegar os caminhos dos arquivos
    const noticia = await prisma.news.findUnique({ where: { id: newsId } });

    if (!noticia) {
      return res
        .status(404)
        .json({ error: "Notícia não encontrada ou já excluída." });
    }

    // 2. Faxina física: apaga a foto e o PDF do HD do servidor
    apagarArquivoFisico(noticia.banner);
    apagarArquivoFisico(noticia.pdfUrl);

    // 3. Exclui o registro do banco de dados
    await prisma.news.delete({
      where: { id: newsId },
    });

    await logAction(
      req.userId,
      'DELETE',
      'News',
      null,
      {title: 'Noticia deletada'}
    )

    return res.status(200).json({
      message: "Notícia excluída permanentemente do portal da AMC.",
    });
  } catch (error) {
    console.error("Erro ao deletar notícia:", error);
    return res
      .status(500)
      .json({ error: "Falha interna ao tentar deletar o registro." });
  }
};

export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, corpo, palavrasChave, bannerUrl } = req.body;
    const newsId = Number(id);

    if (isNaN(newsId)) return res.status(400).json({ error: "ID inválido." });
    if (!titulo || !corpo || corpo === "<p></p>") {
      return res
        .status(400)
        .json({ error: "O título e o conteúdo não podem ficar vazios." });
    }

    // 1. Busca a notícia antiga para resgatar os arquivos atuais
    const noticiaAntiga = await prisma.news.findUnique({
      where: { id: newsId },
    });
    if (!noticiaAntiga) {
      return res.status(404).json({ error: "Notícia não encontrada." });
    }

    // Inicia os caminhos com o que já existe no banco
    let bannerPath = noticiaAntiga.banner;
    let pdfPath = noticiaAntiga.pdfUrl;

    // 2. Se um NOVO banner for enviado, apaga o velho e substitui pelo novo
    if (req.files && req.files.banner && req.files.banner.length > 0) {
      if (noticiaAntiga.banner) apagarArquivoFisico(noticiaAntiga.banner);
      bannerPath = `/uploads/news/${req.files.banner[0].filename}`;
    } else if (bannerUrl !== undefined && bannerUrl !== noticiaAntiga.banner) {
      // Se a imagem antiga era um arquivo físico, precisamos apagá-la para liberar espaço no VPS
      if (noticiaAntiga.banner && noticiaAntiga.banner.startsWith("/uploads/")) {
        apagarArquivoFisico(noticiaAntiga.banner);
      }
      // O novo caminho passa a ser o link da web
      bannerPath = bannerUrl;
    }

    // 3. Se um NOVO PDF for enviado, apaga o velho e substitui pelo novo
    if (req.files && req.files.pdf && req.files.pdf.length > 0) {
      if (noticiaAntiga.pdfUrl) apagarArquivoFisico(noticiaAntiga.pdfUrl);
      pdfPath = `/uploads/news/${req.files.pdf[0].filename}`;
    }

    // 4. Atualiza no Prisma
    const noticiaAtualizada = await prisma.news.update({
      where: { id: newsId },
      data: {
        title: titulo,
        content: corpo,
        banner: bannerPath,
        pdfUrl: pdfPath,
        keywords: palavrasChave || null,
      },
    });

    await logAction(req.userId, "UPDATE", "News", noticiaAtualizada.id, {
      title: "Noticia atualizada",
    });

    return res.status(200).json({
      message: "Notícia atualizada com sucesso!",
      news: noticiaAtualizada,
    });
  } catch (error) {
    console.error("Erro ao atualizar notícia:", error);
    return res
      .status(500)
      .json({ error: "Erro interno do servidor ao processar a atualização." });
  }
};

export const getPublicPortalNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || "";
    const category = req.query.category || "TODAS";

    const limit = 9;
    const skip = (page - 1) * limit;

    const dataLimite = new Date();
    dataLimite.setFullYear(dataLimite.getFullYear() - 2);

    const filtrosWhere = {
      createdAt: { gte: dataLimite },
      status: "PUBLICADO",
    };

    if (search.trim()) {
      const termoFormatado = search.trim().split(/\s+/).join(" | ");
      filtrosWhere.OR = [
        { title: { search: termoFormatado } },
        { content: { search: termoFormatado } },
        { keywords: { search: termoFormatado } },
      ];
    }

    if (category !== "TODAS") {
      filtrosWhere.keywords = {
        contains: category,
        mode: "insensitive",
      };
    }

    const noticias = await prisma.news.findMany({
      where: filtrosWhere,
      skip: skip,
      take: limit,
      include: {
        author: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalNoticias = await prisma.news.count({ where: filtrosWhere });
    const totalPaginas = Math.ceil(totalNoticias / limit);

    return res.status(200).json({
      posts: noticias,
      totalPaginas,
      paginaAtual: page,
    });
  } catch (error) {
    console.error("Erro ao carregar feed público de notícias:", error);
    return res
      .status(500)
      .json({ error: "Erro ao carregar o portal de notícias." });
  }
};

export const getAdminNews = async (req, res) => {
  try {
    const dataLimite = new Date();
    dataLimite.setFullYear(dataLimite.getFullYear() - 2);

    const noticiasAdmin = await prisma.news.findMany({
      where: { createdAt: { gte: dataLimite } },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(noticiasAdmin);
  } catch (error) {
    console.error("Erro na listagem da gestão de notícias:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao processar a lista de gestão." });
  }
};

export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const noticia = await prisma.news.findUnique({
      where: { id: Number(id) },
      include: { author: { select: { name: true } } },
    });

    if (!noticia) {
      return res
        .status(404)
        .json({ error: "A notícia solicitada não foi encontrada." });
    }

    return res.status(200).json(noticia);
  } catch (error) {
    console.error("Erro ao buscar notícia por ID:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao processar a requisição." });
  }
};

export const updateStatusNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusValidos = ["PUBLICADO", "RASCUNHO", "OCULTO"];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ error: "Status inválido para notícia." });
    }

    const noticiaExiste = await prisma.news.findUnique({
      where: { id: Number(id) },
    });

    if (!noticiaExiste) {
      return res
        .status(404)
        .json({ error: "Notícia não encontrada no banco de dados." });
    }

    const noticiaAtualizada = await prisma.news.update({
      where: { id: Number(id) },
      data: { status },
    });

    await logAction(
      req.userId,
      'UPDATE',
      'News',
      noticiaAtualizada.id,
      { title: `Estatus atualizado: ${noticiaAtualizada.status}` }
    );

    return res.status(200).json({
      message: "Status atualizado com sucesso!",
      noticia: noticiaAtualizada,
    });
  } catch (error) {
    console.error("Erro ao atualizar status da notícia:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
};
