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

    const pdfUrlA = await prisma.article.findUnique({
      where: { id: Number(id) },
    });

    let pdfUrlF = pdfUrlA.pdfUrl;
    let articleD = false;

    if (req.file) {
      pdfUrlF = `/uploads/articles/${req.file.filename}`;
      articleD = true;
    }

    if (!title || !pdfUrlF || !keywords) {
      return res
        .status(400)
        .json({
          error: "São obrigatorios titulo, palavras chave e o documento",
        });
    }

    const updatedArticle = await prisma.article.update({
      where: { id: Number(id) },
      data: {
        title: title,
        abstract: abstract,
        pdfUrl: pdfUrlF,
        keywords: keywords,
      },
    });

    if (articleD && pdfUrlA.pdfUrl) {
      const urlLimpa = pdfUrlA.pdfUrl.replace(/^\//, ""); // vira "uploads/articles/xxx.pdf"

      // CORREÇÃO 3: Caminho exato. Se este arquivo está em /backend/controllers/, usa apenas DOIS '..'
      // Backend/controllers/ -> volta pra Backend/ -> volta pra raiz do projeto -> entra em uploads
      const pathFA = path.resolve(__dirname, "..", "..", urlLimpa);

      if (fs.existsSync(pathFA)) {
        fs.unlinkSync(pathFA);
        console.log("Pdf deletado");
      }
    }

    return res.status(200).json({
      message: "Artigo atualizado",
      artigo: updatedArticle, // CORREÇÃO 2: Variável certa retornada!
    });
  } catch (error) {
    console.error("Erro ao atualizar o artigo:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao atualizar a artigo." });
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
      const pathF = path.resolve(__dirname, "..", "..", urlLimpa);
      console.log(pathF);

      if (fs.existsSync(pathF)) {
        fs.unlinkSync(pathF);
        console.log("Fui deletado");
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
