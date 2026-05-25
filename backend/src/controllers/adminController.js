import prisma from '../database/prisma.js';
import crypto from 'crypto';

export const generateInviteCode = async (req, res) => {
  try {
    const randomCode = crypto.randomBytes(4).toString('hex').toUpperCase();

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