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
      const pathAntigo = path.resolve(__dirname, '..', '..', urlLimpa);
      
      if (fs.existsSync(pathAntigo)) {
        fs.unlinkSync(pathAntigo);
        console.log('🗑️ Avatar antigo do membro deletado!');
      }
    }

    return res.status(200).json({
      message: 'Membro atualizado com sucesso!',
      membro: membroAtualizado
    });

  } catch (error) {
    console.error("Erro ao atualizar membro pelo admin:", error);
    return res.status(500).json({ error: "Erro interno ao atualizar membro." });
  }
};
