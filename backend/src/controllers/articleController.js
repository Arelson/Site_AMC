import prisma from "../database/prisma.js";
import { fromPath } from "pdf2pic";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const criarArtigo = async (req, res) => {
  try {
    const { title, abstract, keywords, status } = req.body;
    const authorId = req.userId;
    const pdfFile = req.file;

    if (!pdfFile) {
      return res.status(400).json({
        error: "O arquivo pdf é obrigatorio",
      });
    }

    const pdfUrlDb = `/uploads/articles/${pdfFile.filename}`;
    const caminhoFisicoPdf = pdfFile.path;

    const nomeBase = path.parse(pdfFile.filename).name;
    // Caminho Físico absoluto (onde o Node vai SALVAR o arquivo de verdade)
    const pastaDestinoImagens = path.resolve(
      __dirname,
      "..",
      "uploads",
      "imagens",
    );

    if (!fs.existsSync(pastaDestinoImagens)) {
      fs.mkdirSync(pastaDestinoImagens, { recursive: true });
    }

    const opcoesConversao = {
      density: 150,
      saveFilename: nomeBase,
      savePath: pastaDestinoImagens,
      format: "jpg",
      width: 800,
      height: 1131,
    };

    const conversor = fromPath(caminhoFisicoPdf, opcoesConversao);
    const paginaParaExtrair = 1;

    let coverUrlDb = null;

    try {
      console.log("Extraindo a capa do pdf");
      const resultado = await conversor(paginaParaExtrair);

      // CORREÇÃO 1: Caminho URL limpo para o React conseguir ler!
      coverUrlDb = `/uploads/imagens/${resultado.name}`;
      console.log("Capa extraida:", coverUrlDb);
    } catch (e) {
      console.error("erro ao extrair a imagem", e);
      coverUrlDb = null;
    }

    const novoArtigo = await prisma.article.create({
      data: {
        title,
        abstract,
        keywords,
        status: "PUBLICADO",
        pdfUrl: pdfUrlDb,
        coverImage: coverUrlDb,
        authorId: authorId,
      },
    });

    return res.status(201).json({
      mensagem: "Artigo publicado",
      artigo: novoArtigo,
    });
  } catch (error) {
    console.error("Erro ao criar artigo:", error);
    return res.status(500).json({
      error: "Erro interno ao processar o artigo.",
    });
  }
};

export const listarArtigos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || "";
    const limit = 9;
    const skip = (page - 1) * limit;

    const filtrosWhere = { status: "PUBLICADO" };

    if (search.trim()) {
      const termoFormatado = search.trim().split(/\s+/).join(" | ");

      filtrosWhere.OR = [
        { title: { search: termoFormatado } },
        { abstract: { search: termoFormatado } },
        { keywords: { search: termoFormatado } },
      ];
    }

    const [artigos, totalArtigos] = await Promise.all([
      prisma.article.findMany({
        where: filtrosWhere,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { name: true },
          },
        },
      }),
      prisma.article.count({ where: filtrosWhere }),
    ]);

    return res.status(200).json({
      artigos, // Devolve a lista de artigos que o Feed do Frontend está esperando!
      totalPaginas: Math.ceil(totalArtigos / limit),
      paginaAtual: page,
    });
  } catch (e) {
    console.error("Erro na busca de artigos:", e);
    return res
      .status(500)
      .json({ error: "Error ao carregar o portal de artigos" });
  }
};

export const getArtigoById = async (req, res) => {
  try {
    const { id } = req.params;

    const artigo = await prisma.article.findUnique({
      where: { id: Number(id) },
      include: {
        author: { select: { name: true } },
      },
    });

    if (!artigo || artigo.status !== "PUBLICADO") {
      return res.status(404).json({ error: "Artigo não encontrado" });
    }

    return res.status(200).json(artigo);
  } catch (err) {
    console.error("Erro ao buscar o artigo", err); // Erro de digitação "erro" corrigido aqui
    return res.status(500).json({ error: "Erro interno no sevidor" });
  }
};

export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, abstract, keywords } = req.body;

    // 1. Busca os dados antigos do banco antes de sobrescrever
    const artigoAntigo = await prisma.article.findUnique({
      where: { id: Number(id) },
    });

    if (!artigoAntigo) {
      return res.status(404).json({ error: "Artigo não encontrado." });
    }

    // Variáveis que vão para o banco (por padrão, mantêm as antigas)
    let pdfUrlFinal = artigoAntigo.pdfUrl;
    let coverUrlFinal = artigoAntigo.coverImage;
    let gerouNovoArquivo = false;

    // 2. SE O USUÁRIO MANDOU UM NOVO PDF, GERA TUDO NOVO
    if (req.file) {
      gerouNovoArquivo = true;
      pdfUrlFinal = `/uploads/articles/${req.file.filename}`;
      const caminhoFisicoPdf = req.file.path; // Onde o multer salvou o novo PDF

      const nomeBase = path.parse(req.file.filename).name;
      const pastaDestinoImagens = path.resolve(__dirname, "..", "..", '..', "uploads", "imagens");

      // Se a pasta de imagens não existir, cria na hora
      if (!fs.existsSync(pastaDestinoImagens)) {
        fs.mkdirSync(pastaDestinoImagens, { recursive: true });
      }

      const opcoesConversao = {
        density: 150,
        saveFilename: nomeBase,
        savePath: pastaDestinoImagens,
        format: "jpg",
        width: 800,
        height: 1131
      };

      const conversor = fromPath(caminhoFisicoPdf, opcoesConversao);

      try {
        console.log('Extraindo a nova capa do PDF...');
        const resultado = await conversor(1);
        coverUrlFinal = `/uploads/imagens/${resultado.name}`;
        console.log('Nova capa gerada:', coverUrlFinal);
      } catch (e) {
        console.error("Erro ao extrair a nova imagem de capa", e);
      }
    }

    if (!title || !pdfUrlFinal || !keywords) {
      return res.status(400).json({ error: "São obrigatórios título, palavras-chave e o documento" });
    }

    // 3. ATUALIZA O BANCO DE DADOS
    const updatedArticle = await prisma.article.update({
      where: { id: Number(id) },
      data: {
        title: title,
        abstract: abstract,
        pdfUrl: pdfUrlFinal,
        coverImage: coverUrlFinal, // Salva a capa nova!
        keywords: keywords,
      },
    });

    if (gerouNovoArquivo) {
      
      // 4.1 Deletar PDF Antigo
      if (artigoAntigo.pdfUrl) {
        const urlLimpaPdf = artigoAntigo.pdfUrl.replace(/^\//, "");
        const pathAntigoPdf = path.resolve(__dirname, "..", "..", '..', urlLimpaPdf);
        
        if (fs.existsSync(pathAntigoPdf)) {
          fs.unlinkSync(pathAntigoPdf);
          console.log("🗑️ PDF antigo deletado do servidor.");
        }
      }

      if (artigoAntigo.coverImage) {
        const urlLimpaImg = artigoAntigo.coverImage.replace(/^\//, "");
        const pathAntigoImg = path.resolve(__dirname, "..", "..", '..', urlLimpaImg);
        
        if (fs.existsSync(pathAntigoImg)) {
          fs.unlinkSync(pathAntigoImg);
          console.log("🗑️ Imagem de capa antiga deletada do servidor.");
        }
      }
    }

    return res.status(200).json({
      message: "Artigo atualizado com sucesso",
      artigo: updatedArticle,
    });

  } catch (error) {
    console.error("Erro ao atualizar o artigo:", error);
    return res.status(500).json({ error: "Erro interno ao atualizar o artigo." });
  }
};

export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const artigoUrl = await prisma.article.findUnique({
      where: { id: Number(id) },
    });

    if (artigoUrl.pdfUrl) {
      const urlLimpa = artigoUrl.pdfUrl.replace(/^\//, "");
      // CORREÇÃO 3 (Mesmo ajuste do path):
      const pathF = path.resolve(__dirname, "..", "..", '..', urlLimpa);
      console.log(pathF);

      if (fs.existsSync(pathF)) {
        fs.unlinkSync(pathF);
        console.log("🗑️ PDF antigo deletado do servidor.");
      }
    }

    if (artigoUrl.coverImage) {
      const urlLimpaImg = artigoUrl.coverImage.replace(/^\//, "");
      const pathAntigoImg = path.resolve(__dirname, "..", "..", '..', urlLimpaImg);

      if (fs.existsSync(pathAntigoImg)) {
        fs.unlinkSync(pathAntigoImg);
        console.log("🗑️ Imagem de capa antiga deletada do servidor.");
      }
    }

    const artigo = await prisma.article.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: "Artigo deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar o artigo", error);
    return res.status(500).json({ error: "Error interno ao deletar o artigo" });
  }
};
