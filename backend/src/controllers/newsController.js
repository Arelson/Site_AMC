import prisma from "../database/prisma.js";

export const createNews = async (req, res) => {
  try {
    const { titulo, corpo, banner, palavrasChave } = req.body;
    const userId = req.userId; 

    // Validação básica obrigatória
    if (!titulo || !corpo) {
      return res.status(400).json({ error: 'O título e o conteúdo da notícia são obrigatórios.' });
    }

    // Salvando exclusivamente na tabela News
    const novaNoticia = await prisma.news.create({
      data: {
        title: titulo,
        content: corpo,
        banner: banner || null,
        keywords: palavrasChave || null,
        status: 'PUBLICADO', // Já entra ativa no portal
        authorId: userId
      }
    });

    return res.status(201).json({
      message: 'Notícia criada com sucesso!',
      news: novaNoticia
    });

  } catch (error) {
    console.error('Erro ao criar notícia no banco:', error);
    return res.status(500).json({ error: 'Erro interno ao salvar a notícia.' });
  }
};

export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const newsId = Number(id);

    if (isNaN(newsId)) {
      return res.status(400).json({ error: 'ID de notícia inválido.' });
    }
    await prisma.news.delete({
      where: { id: newsId }
    });

    return res.status(200).json({ 
      message: 'Notícia excluída permanentemente do portal da AMC.' 
    });

  } catch (error) {
    console.error('Erro ao deletar notícia:', error);
    
    // Tratamento caso o registro já não exista no banco
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Notícia não encontrada ou já excluída.' });
    }

    return res.status(500).json({ error: 'Falha interna ao tentar deletar o registro.' });
  }
};

export const getPublicPortalNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || '';
    const category = req.query.category || 'TODAS';
    
    const limit = 9; // Grid estruturado 3x3 para o frontend
    const skip = (page - 1) * limit;

    // APLICANDO A REGRA DOS 2 ANOS:
    const dataLimite = new Date();
    dataLimite.setFullYear(dataLimite.getFullYear() - 2);

    // Constrói o objeto de critérios/filtros dinâmicos do Prisma
    const filtrosWhere = {
      createdAt: { gte: dataLimite }, // Apenas registros cujo createdAt seja maior ou igual à data limite
      status: 'PUBLICADO',           // Apenas notícias que não estão em rascunho
    };

    // Aplica a busca por termo no título, caso tenha sido digitada
    if (search.trim()) {
      filtrosWhere.title = {
        contains: search,
        mode: 'insensitive' // Ignora maiúsculas/minúsculas (case-insensitive)
      };
    }

    // Aplica o filtro de categorias da AMC salvos na string keywords
    if (category !== 'TODAS') {
      filtrosWhere.keywords = {
        contains: category,
        mode: 'insensitive'
      };
    }

    // Executa a busca paginada no banco
    const noticias = await prisma.news.findMany({
      where: filtrosWhere,
      skip: skip,
      take: limit,
      include: {
        author: {
          select: { name: true } // Traz o nome do autor associado
        }
      },
      orderBy: {
        createdAt: 'desc' // Notícias fresquinhas primeiro
      }
    });

    // Conta o total de posts válidos (dentro dos filtros) para controlar a paginação no front
    const totalNoticias = await prisma.news.count({ where: filtrosWhere });
    const totalPaginas = Math.ceil(totalNoticias / limit);

    return res.status(200).json({
      posts: noticias,
      totalPaginas,
      paginaAtual: page
    });

  } catch (error) {
    console.error('Erro ao carregar feed público de notícias:', error);
    return res.status(500).json({ error: 'Erro ao carregar o portal de notícias.' });
  }
};

export const getAdminNews = async (req, res) => {
  try {
    const userId = req.userId;

    const dataLimite = new Date();
    dataLimite.setFullYear(dataLimite.getFullYear() - 2);

    const noticiasAdmin = await prisma.news.findMany({
      where: {
        authorId: userId,
        createdAt: { gte: dataLimite }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json(noticiasAdmin);

  } catch (error) {
    console.error('Erro na listagem da gestão de notícias:', error);
    return res.status(500).json({ error: 'Erro interno ao processar a lista de gestão.' });
  }
};

export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, corpo, banner, palavrasChave } = req.body;
    const newsId = Number(id);

    // 1. Validação de segurança do ID passado na URL
    if (isNaN(newsId)) {
      return res.status(400).json({ error: 'ID de notícia inválido para atualização.' });
    }

    // 2. Validação de campos obrigatórios
    if (!titulo || !corpo || corpo === '<p></p>') {
      return res.status(400).json({ error: 'O título e o conteúdo da notícia não podem ficar vazios.' });
    }

    // 3. Atualização exclusiva na tabela News
    const noticiaAtualizada = await prisma.news.update({
      where: { 
        id: newsId 
      },
      data: {
        title: titulo,
        content: corpo,
        banner: banner || null,
        keywords: palavrasChave || null
        // Opcional: status: status || 'PUBLICADO' (se quiser permitir alterar para rascunho)
      }
    });

    return res.status(200).json({ 
      message: 'Notícia atualizada com sucesso!', 
      news: noticiaAtualizada 
    });

  } catch (error) {
    console.error('Erro ao atualizar notícia:', error);

    // Tratamento de erro caso a notícia tenha sido excluída por outro admin simultaneamente
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Erro ao atualizar: Registro de notícia não encontrado.' });
    }

    return res.status(500).json({ error: 'Erro interno do servidor ao processar a atualização.' });
  }
};

export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const noticia = await prisma.news.findUnique({
      where: { id: Number(id) },
      include: {
        author: { select: { name: true } }
      }
    });

    if (!noticia) {
      return res.status(404).json({ error: 'A notícia solicitada não foi encontrada.' });
    }

    return res.status(200).json(noticia);
  } catch (error) {
    console.error('Erro ao buscar notícia por ID:', error);
    return res.status(500).json({ error: 'Erro interno ao processar a requisição.' });
  }
};