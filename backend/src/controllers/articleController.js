import prisma from '../database/prisma.js';
import { fromPath } from 'pdf2pic';
import path, { format } from 'path';
import fs from 'fs';

export const criarArtigo = async (req, res) => {
    try {
        const { title, abstract, keywords, status } = req.body;
        const authorId = req.userId;
        const pdfFile = req.file;

        if (!pdfFile) {
            return res.status(400).json({
                error: 'O arquivo pdf é obrigatorio'
            })
        }

        const pdfUrlDb = `/uploads/articles/${pdfFile.filename}`;
        const caminhoFisicoPdf = pdfFile.path;

        const nomeBase = path.parse(pdfFile.filename).name;
        const pastaDestinoImagens = path.resolve("../uploads/imagens/");

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
        const paginaParaExtrair = 1;

        let coverUrlDb = null;

        try {
            console.log('Extraindo a capa do pdf');
            const resultado = await conversor(paginaParaExtrair);

            coverUrlDb = `../../../uploads/images/${resultado.name}`;
            console.log('Cpa extraida:', coverUrlDb);
        } catch (e) {
            console.error("erro ao extrair a imagem", e);
            coverUrlDb = null;
        }

        const novoArtigo = await prisma.article.create({
            data: {
                title,
                abstract,
                keywords,
                status: 'PUBLICADO',
                pdfUrl: pdfUrlDb,
                coverImage: coverUrlDb,
                authorId: authorId
            }
        });

        return res.status(201).json({
            mensagem: "Artigo publicado",
            artigo: novoArtigo
        });

        
    } catch (error) {
        console.error("Erro ao criar artigo:", error);
        return res.status(500).json({
            error: "Erro interno ao processar o artigo."
        })
    }
};

export const listarArtigos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const search = req.query.search || '';
        const limit = 9;
        const skip = (page - 1) * limit;

        const filtrosWhere = { status: 'PUBLICADO' };

        if (search.trim()) {
            const termoFormatado = search.trim().split(/\s+/).join(' | ');

            filtrosWhere.OR = [
                { title: { search: termoFormatado } },
                { abstract: { search: termoFormatado } },
                { keywords: { search: termoFormatado } }
            ];
        }

        const [artigos, totalArtigos] = await Promise.all([
            prisma.article.findMany({
                where: filtrosWhere,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: {
                        select: {  name: true  }
                    }
                }
            }), prisma.article.count({ where: filtrosWhere })
        ]);

        return res.status(200).json({
            artigos,
            totalPaginas: Math.ceil(totalArtigos / limit),
            paginaAtual: page
        });
    } catch (e) {
        console.error('Erro na busca de artigos:', e);
        return res.status(500).json({ error: "Error ao carregar o portal de artigod" });
    }
}

export const getArtigoById = async (req, res) => {
    try {
        const { id } = req.params;

        const artigo = await prisma.article.findUnique({
            where: { id: Number(id) },
            include: {
                author: { select: { name: true } }
            }
        });

        if (!artigo || artigo.status !== 'PUBLICADO') {
            return res.status(404).json({error: 'Artigo não encontrado'})
        }

        return res.status(200).json(artigo);
    } catch (err) {
        console.error('Erro ao buscar o artigo', erro);
        return res.status(500).json({ error: 'Erro interno no sevidor' });
    }
}
