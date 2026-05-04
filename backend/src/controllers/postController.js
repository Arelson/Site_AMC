import prisma from "../database/prisma.js";

export const createPost = async (req, res) => {
  try {
    const { titulo, corpo, banner, palavrasChave } = req.body;
    const userId = req.userId;

    if (!titulo || !corpo) {
      return res.status(400).json({ error: 'O título e o conteúdo são obrigatórios.' });
    }

    const newPost = await prisma.post.create({
      data: {
        title: titulo,
        content: corpo,
        banner: banner || null,
        keywords: palavrasChave || null,
        status: 'PUBLICADO',
        authorId: userId
      }
    });

    return res.status(201).json({message: 'Postagem criada com sucesso!', post: newPost});
  } catch (error) {
    console.error('Erro ao criar postagem:', error);
    return res.status(500).json({ error: 'Erro interno ao salvar a postagem.'})
  }
}

export const readPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId: req.userId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.log('Postagens encontradas:', posts);
    return res.status(200).json(posts);
  } catch (error) {
    console.error('Erro ao buscar as postagens:', error);
    return res.status(500).json({ error: 'Erro ao buscar as postagens.'});
  }
}

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id: Number(id)},
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Postagem não encontrada' });
    }

    return res.status(200).json(post);
  } catch (error) {
    console.error('Erro ao buscar postagem:', error);
    return res.status(500).json({ error: 'Erro ao buscar a postagem.'});
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, corpo, banner, palavrasChave } = req.body;

    if (!titulo || !corpo) {
      return res.status(400).json({ error: 'O título e o conteúdo são obrigatórios.' });
    }

    const updatedPost = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        title: titulo,
        content: corpo,
        banner: banner || null,
        keywords: palavrasChave || null
      }
    });

    return res.status(200).json({ message: 'Postagem atualizada!', post: updatePost });
  } catch (error) {
      console.error('Erro ao atualizar postagem:', error);
      return res.status(500).json({ error: 'Erro interno ao atualizar a postagem.' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.post.delete({
      where: { id: Number(id) }
    });

    return res.status(200).json({ message: 'Postagem deletada com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar postagem:', error);
    return res.status(500).json({ error: 'Erro ao deletar a postagem.' });
  }
}
