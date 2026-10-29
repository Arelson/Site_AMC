import bcrypt from 'bcrypt';
import prisma from '../database/prisma.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const register = async (req, res) => {
  try {
    const { name, email, password, inviteCode } = req.body;

    //Validações iniciais
    if (!inviteCode) {
      return res.status(400).json({ error: 'Código de convite é obrigatório'})
    }
    //Usaremos Regex (Expressões regulares)
    //(?=.*[a-zA-Z]) - Deve conter pelo menos uma letra maiúscula ou minúscula
    //(?=.*/d) - Deve conter pelo menos um número
    //(?=.*[\W_]) - Deve conter pelo menos um caractere especial(simbolo)
    //.{8,} - Deve conter no mínimo 8 caracteres
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)){
      return res.status(400).json({
        error: 'A senha deve ter no mínimo 8 caracteres, incluindo letras, numeros e simbolos.'
      })
    }

    //Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    if (existingUser) {
      return res.status(400).json({ error: 'Este email já está em uso' })
    }

    //Validar o código de convite no Banco de Dados
    const validCode = await prisma.inviteCode.findUnique({
      where: { code: inviteCode }
    })
    if (!validCode || validCode.isUsed) {
      return res.status(400).json({error: 'Código de convite inválido ou já utilizado'})
    }

    //Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    //Salvar o usuário e atualizar o código
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "MEMBER",
          member: {
            create: {
              name: name,
              email: email
            },
          },
        },
      });

      await tx.inviteCode.update({
        where: { id: validCode.id },
        data: { isUsed: true }
      })

      return user;
    })

    return res.status(201).json({ 
      name: newUser.name,
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Busca o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email }
    })
    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }

    //Comparar a senha enviada com a senha criptografada no banco
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.'});
    }

    //Gerar token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor.' })
  }
}
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select:{
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });    
  }
}

export const updateProfile = async (req, res) => {
  try {
    // req.userId vem do seu middleware de JWT
    const { name, cargo, cadeiraOcupacao, linkLattes, bio } = req.body;

    // Usamos upsert: Atualiza se existir, Cria se der algum erro no passado e não existir
    const updatedMember = await prisma.member.upsert({
      where: { userId: req.userId },
      update: {
        name,
        cargo,
        cadeiraOcupacao,
        linkLattes,
        bio,
      },
      create: {
        userId: req.userId,
        name: name || "Membro",
        cargo,
        cadeiraOcupacao,
        linkLattes,
        bio,
      },
    });

    return res.status(200).json({
      message: "Perfil atualizado com sucesso!",
      member: updatedMember,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Erro interno ao atualizar o perfil." });
  }
};

export const getProfile = async (req, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { userId: req.userId },
    });

    if (!member) {
      return res
        .status(404)
        .json({ error: "Perfil de membro não encontrado." });
    }

    return res.status(200).json(member);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno ao buscar o perfil." });
  }
};

export const getAllMembers = async (req, res) => {
  try {
    const membros = await prisma.member.findMany({
      orderBy: {
        name: "asc", // Traz os membros em ordem alfabética
      },
    });
    return res.status(200).json(membros);
  } catch (error) {
    console.error("Erro ao buscar equipe:", error);
    return res.status(500).json({ error: "Erro interno ao buscar membros." });
  }
};

// Busca UM membro específico pelo ID
export const getMemberById = async (req, res) => {
  try {
    const { id } = req.params; // Pega o ID que vem na URL

    const membro = await prisma.member.findUnique({
      where: { 
        id: Number(id)// Certifique-se de converter para número, caso seu ID seja Int
      },
      include: {
        user: {
          include: {
            posts: {
              orderBy:{createdAt: 'desc'}
            }
          }
        }
      }
    });

    if (!membro) {
      return res.status(404).json({ error: "Membro não encontrado." });
    }

    return res.status(200).json(membro);
  } catch (error) {
    console.error("Erro ao buscar perfil do membro:", error);
    return res.status(500).json({ error: "Erro interno ao buscar perfil." });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const userId = req.userId; // Vem do token JWT
    const { name, email, password } = req.body; // Texto

    // 1. Busca os dados atuais
    const userAtual = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userAtual) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const dataToUpdate = {};

    // 2. Textos (Nome, Email, Senha) - Mesma lógica de antes
    if (name && name.trim() !== '') dataToUpdate.name = name.trim();

    if (email && email.trim() !== '' && email !== userAtual.email) {
      const emailEmUso = await prisma.user.findUnique({ where: { email: email.trim() } });
      if (emailEmUso) return res.status(400).json({ error: 'Este e-mail já está sendo usado.' });
      dataToUpdate.email = email.trim();
    }

    if (password && password.trim() !== '') {
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ error: 'Senha muito fraca.' });
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
      return res.status(400).json({ error: 'Nenhum dado novo foi enviado.' });
    }

    // 4. ATUALIZA O BANCO
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, role: true, avatarUrl: true }
    });

    // 5. FAXINA FÍSICA: Se anexou foto nova, deleta a antiga
    if (deletarFotoVelha && userAtual.avatarUrl) {
      const urlLimpa = userAtual.avatarUrl.replace(/^\//, ''); 
      const pathAntigo = path.resolve(__dirname, '..', '..', '..', urlLimpa);
      
      if (fs.existsSync(pathAntigo)) {
        fs.unlinkSync(pathAntigo);
        console.log('🗑️ Avatar antigo deletado!');
      }
    }

    // Bônus cascata para a tabela Membro (Nome/Email)
    if (dataToUpdate.name || dataToUpdate.email) {
      const membro = await prisma.member.findUnique({ where: { userId: userId } });
      if (membro) {
        await prisma.member.update({
          where: { userId: userId },
          data: {
            name: dataToUpdate.name || membro.name,
            email: dataToUpdate.email || membro.email
          }
        });
      }
    }

    return res.status(200).json({
      message: 'Conta atualizada com sucesso!',
      user: updatedUser
    });

  } catch (error) {
    console.error("Erro ao atualizar a conta:", error);
    return res.status(500).json({ error: 'Erro interno ao atualizar os dados.' });
  }
};
