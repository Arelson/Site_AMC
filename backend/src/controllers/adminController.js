import crypto from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '../database/prisma.js';
import path from 'path';
import { fileURLToPath } from "url";
import { logAction } from '../utils/logger.js';
import fs from "fs";
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    await logAction(
      req.userId,
      'CREATE',
      'InviteCode',
      newInvite.id,
      {title: 'Novo convite criado'}
    )


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

    await logAction(
      req.userId,
      'DELETE',
      'InviteCode',
      null,
      {title: 'Convite deletado'}
    )

    return res.status(200).json({ message: 'Código excluído com sucesso!' })
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao excluir o código' });    
  }
}

export const updateUser = async (req, res) => {
  try {
    const userId = req.userId; // Vem do token JWT
    const { name, email, password } = req.body; // Texto

    // 1. Busca os dados atuais
    const userAtual = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userAtual) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const dataToUpdate = {};

    // 2. Textos (Nome, Email, Senha) - Mesma lógica de antes
    if (name && name.trim() !== "") dataToUpdate.name = name.trim();

    if (email && email.trim() !== "" && email !== userAtual.email) {
      const emailEmUso = await prisma.user.findUnique({
        where: { email: email.trim() },
      });
      if (emailEmUso)
        return res
          .status(400)
          .json({ error: "Este e-mail já está sendo usado." });
      dataToUpdate.email = email.trim();
    }

    if (password && password.trim() !== "") {
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ error: "Senha muito fraca." });
      }
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    // 3. FOTO DE PERFIL (Se o usuário anexou um arquivo novo)
    let deletarFotoVelha = false;

    if (req.file) {
      // Pega o caminho do Multer
      dataToUpdate.avatarUrl = `/uploads/images/avatars/${req.file.filename}`;
      deletarFotoVelha = true;
    }

    // Se não mandou nada, retorna erro
    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ error: "Nenhum dado novo foi enviado." });
    }

    // 4. ATUALIZA O BANCO
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
    });

    // 5. FAXINA FÍSICA: Se anexou foto nova, deleta a antiga
    if (deletarFotoVelha && userAtual.avatarUrl) {
      const urlLimpa = userAtual.avatarUrl.replace(/^\//, "");
      const pathAntigo = path.resolve(__dirname, "..", "..", "..", urlLimpa);

      if (fs.existsSync(pathAntigo)) {
        fs.unlinkSync(pathAntigo);
        console.log("🗑️ Avatar antigo deletado!");
      }
    }

    // Bônus cascata para a tabela Membro (Nome/Email)
    if (dataToUpdate.name || dataToUpdate.email) {
      const membro = await prisma.member.findUnique({
        where: { userId: userId },
      });
      if (membro) {
        await prisma.member.update({
          where: { userId: userId },
          data: {
            name: dataToUpdate.name || membro.name,
            email: dataToUpdate.email || membro.email,
          },
        });
      }
    }

    return res.status(200).json({
      message: "Conta atualizada com sucesso!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erro ao atualizar a conta:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao atualizar os dados." });
  }
}

// 1. Lista todos os posts de todos os usuários
export const getAllPostsAdmin = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        // Traz o nome e email do autor para o admin saber de quem é o post
        author: { 
          select: { id: true, name: true, email: true } 
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

    await logAction(
      req.userId,
      'UPDATE',
      'Post',
      postAtualizado.id,
      {title: `Estatus atualizado para: ${status}`}
    )

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

    await logAction(
      req.userId,
      'DELETE',
      'Post',
      null,
      {title: 'Post deletado'}
    )
    
    return res.status(200).json({ message: 'Publicação excluída com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir post:', error);
    return res.status(500).json({ error: 'Erro ao excluir a publicação.' });
  }
};

export const criarMembroAdmin = async (req, res) => {
  try {
    const { name, cargo, cadeiraOcupacao, linkLattes, bio } = req.body;

    if (!name) {
      return res.status(400).json({ error: "O nome do membro é obrigatório." });
    }

    // Se o Admin enviou uma foto, nós guardamos o caminho. Se não, fica null.
    let avatarUrlDb = null;
    if (req.file) {
      avatarUrlDb = `/uploads/images/avatars/${req.file.filename}`;
    }

    const novoMembro = await prisma.member.create({
      data: {
        name,
        cargo: cargo || null,
        cadeiraOcupacao: cadeiraOcupacao || null,
        linkLattes: linkLattes || null,
        bio: bio || null,
        avatarUrl: avatarUrlDb, // 👈 Salva na tabela Member
      },
    });

    await logAction(
      req.userId,
      'CREATE',
      'Member',
      novoMembro.id,
      {title: 'Membro criado'}
    )

    return res.status(201).json(novoMembro);
  } catch (error) {
    console.error("Erro ao criar membro pelo admin:", error);
    return res.status(500).json({ error: "Erro interno ao cadastrar membro." });
  }
};

export const atualizarMembroAdmin = async (req, res) => {
  try {
    const { id } = req.params; // ID do membro (na url: /api/members/:id)
    const { name, cargo, cadeiraOcupacao, linkLattes, bio } = req.body;

    const membroAntigo = await prisma.member.findUnique({
      where: { id: Number(id) }
    });

    if (!membroAntigo) {
      return res.status(404).json({ error: "Membro não encontrado." });
    }

    let avatarUrlFinal = membroAntigo.avatarUrl;
    let deletarFotoVelha = false;

    // Se o Admin mandou uma foto NOVA para substituir
    if (req.file) {
      avatarUrlFinal = `/uploads/images/avatars/${req.file.filename}`;
      deletarFotoVelha = true;
    }

    // Atualiza os dados no banco
    const membroAtualizado = await prisma.member.update({
      where: { id: Number(id) },
      data: {
        name: name || membroAntigo.name,
        cargo: cargo || null,
        cadeiraOcupacao: cadeiraOcupacao || null,
        linkLattes: linkLattes || null,
        bio: bio || null,
        avatarUrl: avatarUrlFinal
      }
    });

    // FAXINA FÍSICA: Se substituiu a foto, deleta a antiga
    if (deletarFotoVelha && membroAntigo.avatarUrl) {
      const urlLimpa = membroAntigo.avatarUrl.replace(/^\//, ''); 
      // Ajuste os ".." conforme a profundidade da sua pasta controller
      const pathAntigo = path.resolve(__dirname, '..', '..', '..', urlLimpa);
      
      if (fs.existsSync(pathAntigo)) {
        fs.unlinkSync(pathAntigo);
        console.log('🗑️ Avatar antigo do membro deletado!');
      }
    }

    await logAction(
      req.userId,
      'UPDATE',
      'Member',
      membroAtualizado.id,
      {title: 'Membro atualizado'}
    )

    return res.status(200).json({
      message: 'Membro atualizado com sucesso!',
      membro: membroAtualizado
    });

  } catch (error) {
    console.error("Erro ao atualizar membro pelo admin:", error);
    return res.status(500).json({ error: "Erro interno ao atualizar membro." });
  }
};

export const deleteMember = async (req, res) => {
  const { id } = req.params;
  console.log(req.body)
  try {
    const member = await prisma.member.delete({
      where: {id:Number(id)},
    })

    await logAction(
      req.userId,
      'DELETE',
      'Member',
      null,
      {title: 'Membro deletado'}
    )

    return res.status(200).json({mensagem: "Membro deletado com sucesso!"})
  } catch (error) {
    console.error("Erro ao deletar membro", error);
    return res.status(500).json({error:"Erro no servidor"})
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};
