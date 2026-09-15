import prisma from '../database/prisma.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    return res.status(200).json(users); 
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar a lista de usuários' });
  }
}


