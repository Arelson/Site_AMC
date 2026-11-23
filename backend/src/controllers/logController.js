import prisma from "../database/prisma.js";


export const getActionsLog = async (req, res) => {
    try{
        const user = await prisma.user.findUnique({
            where:{id: Number(req.userId)}
        })

        if(!user){
            return res.status(404).json({error: "Usuario não encontrado"})
        }

        const filtro = user.role === 'ADMIN' ? {} : {userId: req.userId}

        const logs = await prisma.actionLog.findMany({
            where: filtro,
            orderBy: {createdAt: 'desc'},
            take: 80,
            include:{
                user:{
                    select: { name: true, email: true, avatarUrl: true }
                }
            }
        })

        return res.status(200).json(logs);
    } catch (error){
        return res.status(500).json({error: 'Erro na busga dos logs'});
    }
}
