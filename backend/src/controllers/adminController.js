import crypto from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '../database/prisma.js';
import jwt from 'jsonwebtoken';

export const generateInviteCode = async (req, res) => {
  try {
    const randomCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    console.log('randomCode', randomCode);

    const newInvite = await prisma.inviteCode.create({
      data: {
        code: randomCode,
        isUsed: false
      }
    })
    return res.status(201).json(newInvite);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao gerar código de convite.'});
  }
}

export const getInvites = async (req, res) => {
  try {
    const invites = await prisma.inviteCode.findMany({
      orderBy: { createdAt: 'desc' } 
    });

    res.json(invites);
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao buscar os códigos de convite'
    });
  }
}

export const deleteInvite = async (req, res) => {
  try {
    await prisma.inviteCode.delete({
      where: { id: Number(req.params.id) }
    });
    return res.status(200).json({ message: 'Código excluído com sucesso!' })
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao excluir o código' });    
  }
}

export const updateUser = async (req, res) => {
  const { email, password } = req.body;
  const userId = req.userId;

  try {
    const dataForSave = {};
    if (email) dataForSave.email = email;
    if (password) {
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!passwordRegex.test(password)){
        return res.status(400).json({
          message: 'A senha deve ter no mínimo 8 caracteres, incluindo letras, numeros e simbolos.'
        })
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      dataForSave.password = hashedPassword;
    }
    if (Object.keys(dataForSave).length === 0) {
      return res.status(400).json({ error: 'Nenhuma informação para atualizar' });
    }

    const userUpdated = await prisma.user.update({
      where: { id: userId },
      data: dataForSave
    });

    return res.status(200).json({
      message: 'Dados atualizados com sucesso!',
    })
  } catch (error) {
    console.error('Erro ao atualizar credenciais com Prisma:', error);

    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'E-mail ja cadastrado' });
    }
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

// 1. Lista todos os posts de todos os usuários
export const getAllPostsAdmin = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        // Traz o nome e email do autor para o admin saber de quem é o post
        author: { 
          select: { id: true, nome: true, email: true } 
        } 
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.status(200).json(posts);
  } catch (error) {
    console.error('Erro ao buscar todos os posts:', error);
    return res.status(500).json({ error: 'Erro ao buscar as publicações.' });
  }
};

// 2. Altera o status do post (ex: para BLOQUEADO ou REVISAO)
export const updatePostStatusAdmin = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // O frontend vai enviar qual o novo status

  // Validação simples de segurança
  const statusPermitidos = ['PUBLICADO', 'RASCUNHO', 'REVISAO', 'BLOQUEADO'];
  if (!statusPermitidos.includes(status)) {
    return res.status(400).json({ error: 'Status inválido fornecido.' });
  }

  try {
    const postAtualizado = await prisma.post.update({
      where: { id: Number(id) },
      data: { status }
    });

    return res.status(200).json({ 
      message: `Status atualizado para ${status} com sucesso!`, 
      post: postAtualizado 
    });
  } catch (error) {
    console.error('Erro ao atualizar status do post:', error);
    return res.status(500).json({ error: 'Erro ao atualizar a publicação.' });
  }
};

// 3. Exclui um post indevido definitivamente (se necessário)
export const deletePostAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.post.delete({
      where: { id: Number(id) }
    });
    
    return res.status(200).json({ message: 'Publicação excluída com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir post:', error);
    return res.status(500).json({ error: 'Erro ao excluir a publicação.' });
  }
};
