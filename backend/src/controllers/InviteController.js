import prisma from "../database/prisma.js"; 

export const createInvite = async (req, res) => {
  try {
    const codigoAleatorio = Math.random().toString(36).substring(2, 10).toUpperCase();

    const novoCodigo = await prisma.codigoConvite.create({
      data: { code: codigoAleatorio}
    });

    res.status(201).json(novoCodigo);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar o código' })
  }
};

export const getInvites = async (req, res) => {
  try {
    const invites = await prisma.codigoConvite.findMany({
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
    await prisma.codigoConvite.delete({
      where: { id: req.params.id }
    });
    res.status(200).json({ message: 'Código excluído com sucesso!' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir o código' });    
  }
} 


