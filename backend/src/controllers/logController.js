import prisma from "../database/prisma.js";


export const getActionsLog = async (req, res) => {
    try{
        const logs = await prisma.actionLog.findMany({
            orderBy: {createdAt: 'desc'},
            take: 80,
            include:{
                user:{
                    select: {name: true, email: true}
                }
            }
        })

        return res.status(200).json(logs);
    } catch (error){
        return res.status(500).json({error: 'Erro na busga dos logs'});
    }
}
